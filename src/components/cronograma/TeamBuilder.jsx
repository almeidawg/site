import React, { useState, useEffect } from 'react';
import { Plus, X, Search, Users, Briefcase, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

/**
 * TeamBuilder - Componente de 2 colunas para montagem de equipe
 * Permite selecionar colaboradores e fornecedores para um projeto
 */
export const TeamBuilder = ({ projectId, onTeamSaved, existingTeamId = null }) => {
  const [entities, setEntities] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntities();
    if (existingTeamId) {
      fetchExistingTeam();
    }
  }, [existingTeamId]);

  const fetchEntities = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('entities')
        .select('id, nome_razao_social, avatar_url, tipo, nucleo')
        .in('tipo', ['colaborador', 'fornecedor'])
        .eq('ativo', true)
        .order('nome_razao_social', { ascending: true });

      if (error) throw error;

      setEntities(data || []);
    } catch (error) {
      console.error('Erro ao buscar entities:', error);
      toast({
        title: 'Erro ao carregar colaboradores',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          papel,
          entities:user_id (
            id,
            nome_razao_social,
            avatar_url,
            tipo,
            nucleo
          )
        `)
        .eq('team_id', existingTeamId);

      if (error) throw error;

      const teamMembers = data
        .filter(m => m.entities)
        .map(m => ({
          ...m.entities,
          papel: m.papel
        }));

      setSelected(teamMembers);
    } catch (error) {
      console.error('Erro ao buscar equipe existente:', error);
    }
  };

  const addToTeam = (entity) => {
    if (selected.find(e => e.id === entity.id)) {
      toast({
        title: 'Colaborador já está na equipe',
        variant: 'default'
      });
      return;
    }

    setSelected([...selected, { ...entity, papel: entity.tipo }]);
  };

  const removeFromTeam = (entityId) => {
    setSelected(selected.filter(e => e.id !== entityId));
  };

  const updatePapel = (entityId, papel) => {
    setSelected(
      selected.map(e =>
        e.id === entityId ? { ...e, papel } : e
      )
    );
  };

  const saveTeam = async () => {
    if (selected.length === 0) {
      toast({
        title: 'Selecione pelo menos um membro',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);

      let teamId = existingTeamId;

      // Se não existe equipe, criar nova
      if (!teamId) {
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .insert({
            nome: `Equipe - Projeto ${projectId}`,
            empresa_id: (await supabase.auth.getUser()).data.user.user_metadata.empresa_id,
            descricao: `Equipe criada para o projeto ${projectId}`
          })
          .select()
          .single();

        if (teamError) throw teamError;

        teamId = teamData.id;
      } else {
        // Limpar membros existentes
        await supabase
          .from('team_members')
          .delete()
          .eq('team_id', teamId);
      }

      // Inserir membros
      const membersToInsert = selected.map(member => ({
        team_id: teamId,
        user_id: member.id,
        papel: member.papel || member.tipo
      }));

      const { error: membersError } = await supabase
        .from('team_members')
        .insert(membersToInsert);

      if (membersError) throw membersError;

      toast({
        title: 'Equipe salva com sucesso! ✅',
        description: `${selected.length} membro(s) adicionado(s).`
      });

      if (onTeamSaved) {
        onTeamSaved({ id: teamId, members: selected });
      }
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      toast({
        title: 'Erro ao salvar equipe',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredEntities = entities.filter(e =>
    e.nome_razao_social.toLowerCase().includes(search.toLowerCase()) &&
    !selected.find(s => s.id === e.id)
  );

  const getTipoIcon = (tipo) => {
    return tipo === 'colaborador' ? <Users size={14} /> : <Briefcase size={14} />;
  };

  const getTipoBadgeColor = (tipo) => {
    return tipo === 'colaborador' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[700px]">
      {/* Coluna Esquerda - Disponíveis */}
      <div className="border rounded-lg flex flex-col bg-white shadow-sm">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <Users size={20} className="text-gray-600" />
            Colaboradores e Fornecedores
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {filteredEntities.length} disponíve{filteredEntities.length !== 1 ? 'is' : 'l'}
          </p>
        </div>

        {/* Lista de Disponíveis */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredEntities.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Users size={48} className="mx-auto mb-2 text-gray-300" />
              <p>Nenhum colaborador encontrado</p>
            </div>
          ) : (
            filteredEntities.map(entity => (
              <div
                key={entity.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entity.avatar_url} alt={entity.nome_razao_social} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {entity.nome_razao_social.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{entity.nome_razao_social}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTipoBadgeColor(entity.tipo)}`}>
                        {getTipoIcon(entity.tipo)}
                        <span className="ml-1">{entity.tipo}</span>
                      </span>
                      {entity.nucleo && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          {entity.nucleo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => addToTeam(entity)}
                  className="ml-2 h-8 w-8 p-0"
                >
                  <Plus size={16} />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Coluna Direita - Selecionados */}
      <div className="border rounded-lg flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
            <Check size={20} className="text-green-600" />
            Equipe Selecionada
          </h3>
          <p className="text-sm text-gray-600">
            {selected.length} membro{selected.length !== 1 ? 's' : ''} selecionado{selected.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Lista de Selecionados */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {selected.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <Users size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhum membro selecionado</p>
              <p className="text-sm mt-2">
                Clique no botão <Plus size={14} className="inline" /> para adicionar membros
              </p>
            </div>
          ) : (
            selected.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 shadow-sm"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar_url} alt={member.nome_razao_social} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700">
                        {member.nome_razao_social.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{member.nome_razao_social}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTipoBadgeColor(member.tipo)}`}>
                        {getTipoIcon(member.tipo)}
                        <span className="ml-1">{member.papel || member.tipo}</span>
                      </span>
                      {member.nucleo && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          {member.nucleo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeFromTeam(member.id)}
                  className="ml-2 h-8 w-8 p-0"
                >
                  <X size={16} />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white">
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            onClick={saveTeam}
            disabled={selected.length === 0 || saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Check size={16} className="mr-2" />
                Salvar Equipe ({selected.length})
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
