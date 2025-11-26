import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LifeBuoy, Plus, Wrench, Loader2, Send, Edit, Trash2, Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/customSupabaseClient';
import { cn } from '@/lib/utils';
import { Can } from '@/contexts/SupabaseAuthContext';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ActionButtons from '@/components/shared/ActionButtons';
import { Checkbox } from '@/components/ui/checkbox';

const statusMap = {
  aberta: { label: 'Aberta', className: 'bg-gray-400 text-white' },
  agendado: { label: 'Agendado', className: 'bg-yellow-500 text-white' },
  em_atendimento: { label: 'Em Atendimento', className: 'bg-orange-500 text-white' },
  atendido: { label: 'Atendido', className: 'bg-green-500 text-white' },
  em_atraso: { label: 'Em Atraso', className: 'bg-red-600 text-white' },
};

const NovaOSDialog = ({ open, onOpenChange, onOSCreated, osToEdit, setOrdensServico, empresaId, userId }) => {
  const [entities, setEntities] = useState([]);
  const [prestadores, setPrestadores] = useState([]);
  const [cachedEntities] = useLocalStorage('crm_entities', []);
  const [clienteId, setClienteId] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('aberta');
  const [categoria, setCategoria] = useState('');
  const [dataAgendamento, setDataAgendamento] = useState('');
  const [horaAgendamento, setHoraAgendamento] = useState('');
  const [responsavelId, setResponsavelId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const { toast } = useToast();
  const isEditing = !!osToEdit;

  useEffect(() => {
    if (!open) return;

    const fetchClientes = async () => {
      try {
        let query = supabase
          .from('entities')
          .select('id, nome')
          .eq('tipo', 'cliente')
          .order('nome');

        if (empresaId) {
          query = query.eq('empresa_id', empresaId);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
          setEntities(data);
          return;
        }
      } catch (error) {
        console.error('Erro ao buscar clientes', error);
        toast({ title: 'Erro ao buscar clientes', variant: 'destructive' });
      }

      setEntities(cachedEntities.filter((e) => e.tipo === 'cliente'));
    };

    const fetchPrestadores = async () => {
      try {
        const { data, error } = await supabase
          .from('entities')
          .select('id, nome, tipo')
          .in('tipo', ['colaborador', 'fornecedor'])
          .order('nome');
        if (error) throw error;
        setPrestadores(data || []);
      } catch (err) {
        console.error('Erro ao buscar prestadores', err);
      }
    };

    fetchClientes();
    fetchPrestadores();
  }, [open, empresaId, cachedEntities, toast]);

  useEffect(() => {
    if (osToEdit) {
      setClienteId(osToEdit.cliente_id);
      setDescricao(osToEdit.descricao);
      setStatus(osToEdit.status);
      setCategoria(osToEdit.categoria || '');
      setResponsavelId(osToEdit.responsavel_id || '');
      if (osToEdit.data_agendamento) {
        const dt = new Date(osToEdit.data_agendamento);
        setDataAgendamento(dt.toISOString().split('T')[0]);
        setHoraAgendamento(dt.toISOString().split('T')[1]?.slice(0,5) || '');
      } else {
        setDataAgendamento('');
        setHoraAgendamento('');
      }
      const cliente = [...entities, ...cachedEntities].find((e) => e.id === osToEdit.cliente_id);
      if (cliente) setSelectedCliente(cliente);
    } else {
      setClienteId('');
      setSelectedCliente(null);
      setDescricao('');
      setStatus('aberta');
      setCategoria('');
      setResponsavelId('');
      setDataAgendamento('');
      setHoraAgendamento('');
    }
  }, [osToEdit, open, entities, cachedEntities]);

  const handleSubmit = async () => {
    if (!clienteId || !descricao) {
      toast({ title: 'Campos obrigatórios', description: 'Selecione um cliente e preencha a descrição.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);

    const cliente = entities.find((c) => c.id === clienteId) || cachedEntities.find((c) => c.id === clienteId);
    const dataAgendada = dataAgendamento
      ? new Date(`${dataAgendamento}T${horaAgendamento || '00:00'}:00`).toISOString()
      : null;

    if (isEditing) {
      let query = supabase
        .from('assistencias')
        .update({
          cliente_id: clienteId,
          cliente_nome: cliente?.nome || cliente?.nome_razao_social,
          descricao,
          status,
          categoria,
          data_agendamento: dataAgendada,
          responsavel_id: responsavelId || null,
        })
        .eq('id', osToEdit.id);

      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data: updatedOS, error } = await query.select().maybeSingle();

      if (error) {
        toast({ title: 'Erro ao atualizar O.S.', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Ordem de Serviço atualizada!' });
        setOrdensServico((prev) => prev.map((os) => (os.id === updatedOS.id ? updatedOS : os)));
        onOpenChange(false);
      }
    } else {
      const today = new Date();
      const osCode = `AST-${today.getFullYear()}-${String(Date.now()).slice(-6)}`;

      let insert = supabase.from('assistencias').insert({
        codigo: osCode,
        cliente_id: clienteId,
        cliente_nome: cliente?.nome || cliente?.nome_razao_social,
        descricao,
        status: 'aberta',
        categoria,
        data_solicitacao: new Date().toISOString(),
        data_agendamento: dataAgendada,
        responsavel_id: responsavelId || null,
        empresa_id: empresaId || null,
        created_by: userId || null,
      });

      const { data: novaOS, error } = await insert.select().maybeSingle();

      if (error) {
        toast({ title: 'Erro ao criar O.S.', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Ordem de Serviço criada!', description: `A O.S. ${osCode} foi aberta.` });
        onOSCreated(novaOS);
        onOpenChange(false);
      }
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Atualize os detalhes do chamado.' : 'Abra um novo chamado de assistência técnica.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente</Label>
            <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={isComboboxOpen} className="w-full justify-between" disabled={isEditing}>
                  {selectedCliente ? (selectedCliente.nome || selectedCliente.nome_razao_social) : 'Selecione o cliente'}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Buscar cliente..." />
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandGroup>
                    {entities.map((c) => (
                      <CommandItem
                        key={c.id}
                        value={c.nome || c.nome_razao_social}
                        onSelect={() => {
                          setClienteId(c.id);
                          setSelectedCliente(c);
                          setIsComboboxOpen(false);
                        }}
                      >
                        {c.nome || c.nome_razao_social}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select onValueChange={setCategoria} value={categoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hidraulica">Hidráulica</SelectItem>
                <SelectItem value="eletrica">Elétrica</SelectItem>
                <SelectItem value="marcenaria">Marcenaria</SelectItem>
                <SelectItem value="pintura">Pintura</SelectItem>
                <SelectItem value="alvenaria">Alvenaria</SelectItem>
                <SelectItem value="gesso">Gesso/Drywall</SelectItem>
                <SelectItem value="vidracaria">Vidraçaria</SelectItem>
                <SelectItem value="serralheria">Serralheria</SelectItem>
                <SelectItem value="jardinagem">Jardinagem</SelectItem>
                <SelectItem value="limpeza">Limpeza</SelectItem>
                <SelectItem value="geral">Geral</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição da Solicitação</Label>
            <Textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhe o problema ou a necessidade do cliente..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Data do agendamento</Label>
              <Input type="date" value={dataAgendamento} onChange={(e) => setDataAgendamento(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Hora do agendamento</Label>
              <Input type="time" value={horaAgendamento} onChange={(e) => setHoraAgendamento(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Responsável / Prestador</Label>
            <Select onValueChange={setResponsavelId} value={responsavelId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione colaborador ou fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {prestadores.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome} ({p.tipo})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={setStatus} value={status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusMap).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isEditing ? 'Salvar Alterações' : 'Abrir Chamado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Assistencia = () => {
  const [ordensServico, setOrdensServico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [osToEdit, setOsToEdit] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [compras] = useLocalStorage('crm_compras', []);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [osImportTarget, setOsImportTarget] = useState(null);
  const [availableCompras, setAvailableCompras] = useState([]);
  const [selectedCompraIds, setSelectedCompraIds] = useState([]);
  const [isImportingCompras, setIsImportingCompras] = useState(false);
  const { toast } = useToast();

  const fetchAuth = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      setUserId(user?.id || null);

      if (user?.id) {
        const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).maybeSingle();
        setEmpresaId(profile?.empresa_id || null);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil', error);
    } finally {
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    fetchAuth();
  }, []);

  const fetchOS = async () => {
    if (!authChecked) return;
    setLoading(true);
    try {
      let query = supabase.from('assistencias').select('*').order('created_at', { ascending: false });
      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrdensServico(data || []);
    } catch (error) {
      toast({ title: 'Erro ao buscar chamados', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOS();
  }, [empresaId, authChecked]);

  useEffect(() => {
    if (!isImportDialogOpen) {
      setOsImportTarget(null);
      setAvailableCompras([]);
      setSelectedCompraIds([]);
    }
  }, [isImportDialogOpen]);

  const handleNotImplemented = (action) => {
    toast({
      title: '🚧 Em breve!',
      description: `A funcionalidade de ${action} será implementada em breve.`,
    });
  };

  const handleOSCreated = (novaOS) => {
    setOrdensServico((prev) => [novaOS, ...prev]);
  };

  const handleOpenDialog = (os = null) => {
    setOsToEdit(os);
    setIsDialogOpen(true);
  };

  const handleOpenImportDialog = (os) => {
    const relacionadas = compras.filter(
      (compra) => compra.cliente_id === os.cliente_id || compra.cliente_nome === os.cliente_nome
    );

    if (!relacionadas.length) {
      toast({
        title: 'Nenhuma lista de compras encontrada',
        description: 'Crie pedidos de compra para este cliente no módulo de Compras.',
        variant: 'destructive',
      });
      return;
    }

    setOsImportTarget(os);
    setAvailableCompras(relacionadas);
    const preSelecionadas = Array.isArray(os.pecas_lista) ? os.pecas_lista.map((item) => item.id) : [];
    setSelectedCompraIds(preSelecionadas);
    setIsImportDialogOpen(true);
  };

  const toggleCompraSelection = (compraId) => {
    setSelectedCompraIds((prev) =>
      prev.includes(compraId) ? prev.filter((id) => id !== compraId) : [...prev, compraId]
    );
  };

  const handleConfirmImport = async () => {
    if (!osImportTarget) return;
    setIsImportingCompras(true);
    try {
      const selecionadas = availableCompras.filter((compra) => selectedCompraIds.includes(compra.id));
      const payload = selecionadas.map((compra) => ({
        id: compra.id,
        numero: compra.numero,
        fornecedor: compra.fornecedor,
        itens: compra.itens,
        valor_total: compra.valor_total,
        link: compra.link,
        status: compra.status,
        data_entrega: compra.data_entrega,
      }));

      const { error } = await supabase
        .from('assistencias')
        .update({ pecas_lista: payload })
        .eq('id', osImportTarget.id);

      if (error) {
        throw error;
      }

      setOrdensServico((prev) =>
        prev.map((os) => (os.id === osImportTarget.id ? { ...os, pecas_lista: payload } : os))
      );
      toast({ title: 'Lista de compras vinculada à O.S.' });
      setIsImportDialogOpen(false);
      setOsImportTarget(null);
    } catch (error) {
      toast({
        title: 'Erro ao importar lista',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsImportingCompras(false);
    }
  };

  const handleDelete = async (osId) => {
    if (!confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      return;
    }

    let query = supabase.from('assistencias').delete().eq('id', osId);
    if (empresaId) {
      query = query.eq('empresa_id', empresaId);
    }

    const { error } = await query;
    if (error) {
      toast({ title: 'Erro ao excluir O.S.', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Chamado excluído!' });
      // Atualiza a lista local imediatamente
      setOrdensServico(prev => prev.filter(os => os.id !== osId));
      // Refetch do banco após pequeno delay para garantir sincronização
      setTimeout(() => fetchOS(), 100);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-wg-orange-base" />
      </div>
    );
  }

  return (
    <>
      <NovaOSDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onOSCreated={handleOSCreated}
        osToEdit={osToEdit}
        setOrdensServico={setOrdensServico}
        empresaId={empresaId}
        userId={userId}
      />
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar lista de compras</DialogTitle>
            <DialogDescription>
              Vincule pedidos de compra existentes para reutilizar as peças desta ordem de serviço.
            </DialogDescription>
          </DialogHeader>
          {osImportTarget && (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {availableCompras.map((compra) => {
                const checked = selectedCompraIds.includes(compra.id);
                const valor =
                  typeof compra.valor_total === 'number'
                    ? compra.valor_total
                    : parseFloat(compra.valor_total) || 0;
                return (
                  <label
                    key={compra.id}
                    className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer ${
                      checked ? 'border-wg-orange-base bg-orange-50/40' : 'hover:border-gray-300'
                    }`}
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggleCompraSelection(compra.id)} />
                    <div className="flex-1 text-sm space-y-1">
                      <p className="font-semibold">
                        PC #{compra.numero} • {compra.fornecedor || 'Fornecedor não informado'}
                      </p>
                      <p className="text-muted-foreground text-xs">{compra.itens}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Status: {compra.status || 'pendente'}</span>
                        <span className="font-semibold text-gray-800">
                          {valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={isImportingCompras || selectedCompraIds.length === 0}
            >
              {isImportingCompras ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="mr-2 h-4 w-4" />
              )}
              Importar selecionados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>
              <Wrench className="inline-block mr-2" /> Assistência Técnica
            </h1>
            <p className="text-muted-foreground mt-1">Gestão de chamados de assistência e pós-obra.</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus size={20} className="mr-2" />
            Solicitar Assistência
          </Button>
        </div>

        {ordensServico.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-[60vh] text-center glass-effect rounded-2xl"
          >
            <LifeBuoy className="w-24 h-24 text-wg-orange-base/30 mb-6" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold mb-2">Nenhum chamado aberto</h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Clique em "Solicitar Assistência" para criar uma nova Ordem de Serviço.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {ordensServico.map((os, index) => {
              const hasComprasDisponiveis = compras.some(
                (compra) => compra.cliente_id === os.cliente_id || compra.cliente_nome === os.cliente_nome
              );
              return (
                <motion.div
                  key={os.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-white/50 rounded-lg border flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div className="flex-grow">
                    <div className="flex items-center gap-3">
                      <span className={cn('px-3 py-1 text-xs font-semibold rounded-full', statusMap[os.status]?.className || 'bg-gray-400 text-white')}>
                        {statusMap[os.status]?.label || os.status}
                      </span>
                      <p className="font-bold text-lg">
                        {os.codigo} - {os.cliente_nome}
                      </p>
                      {os.categoria && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md capitalize">
                          {os.categoria}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{os.descricao}</p>
                    {(os.data_agendamento || os.responsavel_id) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {os.data_agendamento ? `Agendado: ${new Date(os.data_agendamento).toLocaleString('pt-BR')}` : ''}
                        {os.responsavel_id ? ` · Responsável: ${os.responsavel_id.slice(0, 8)}...` : ''}
                      </p>
                    )}
                    {Array.isArray(os.pecas_lista) && os.pecas_lista.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-xs font-semibold flex items-center gap-2 text-gray-700">
                          <ShoppingCart size={14} /> Peças importadas
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-gray-600">
                          {os.pecas_lista.map((item) => {
                            const valor =
                              typeof item.valor_total === 'number'
                                ? item.valor_total
                                : parseFloat(item.valor_total) || 0;
                            return (
                              <li key={item.id || `${item.itens}-${item.numero}`} className="flex justify-between gap-2">
                                <span className="truncate">{item.itens}</span>
                                {valor > 0 && (
                                  <span className="font-semibold">
                                    {valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex flex-row sm:flex-col items-end justify-between sm:justify-start w-full sm:w-auto">
                    <p className="text-xs text-muted-foreground mb-2 sm:text-right">
                      Criado em: {os.created_at ? new Date(os.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                    <div className="flex gap-1">
                      {hasComprasDisponiveis && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenImportDialog(os)}
                          title="Importar lista de compras"
                        >
                          <ShoppingCart className="h-4 w-4 text-wg-orange-base" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(os)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <ActionButtons data={os} type="assistencia" />
                      <Can I="delete" a="assistencia">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(os.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Can>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Assistencia;
