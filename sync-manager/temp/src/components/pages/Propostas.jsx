import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { PlusCircle, Search, FileText, Share2, Trash2, Edit } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import NovaPropostaDialog from '@/components/propostas/NovaPropostaDialog';
    import { shareOnWhatsApp } from '@/lib/whatsapp';
    import { resolvePropostaId } from '@/lib/resolvers';

    const PropostaCard = ({ proposta, onEdit, onDelete, onShare, onDownload }) => {
      const valorTotal = proposta.valor_total || 0;
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="p-5">
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <p className="text-sm font-semibold text-indigo-600">#{proposta.numero || proposta.codigo}</p>
                <h3 className="text-lg font-bold text-gray-900 mt-1 truncate">{proposta.descricao || 'Proposta sem descrição'}</h3>
                <p className="text-sm text-gray-500 mt-1">{proposta.cliente_nome || 'Cliente não definido'}</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  proposta.status === 'aprovada' ? 'bg-green-100 text-green-800' :
                  proposta.status === 'rascunho' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>{proposta.status}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-500">Valor Total</p>
                <p className="text-xl font-bold text-gray-800">{valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
              <div className="flex items-center space-x-1">
                 <Button variant="ghost" size="icon" onClick={() => onEdit(proposta)}><Edit className="h-4 w-4" /></Button>
                 <Button variant="ghost" size="icon" onClick={() => onDownload(proposta.id)}><FileText className="h-4 w-4" /></Button>
                 <Button variant="ghost" size="icon" onClick={() => onShare(proposta)}><Share2 className="h-4 w-4" /></Button>
                 <Button variant="ghost" size="icon" onClick={() => onDelete(proposta.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    };

    const Propostas = () => {
      const [propostas, setPropostas] = useState([]);
      const [loading, setLoading] = useState(true);
      const [searchTerm, setSearchTerm] = useState('');
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [propostaToEdit, setPropostaToEdit] = useState(null);
      const { toast } = useToast();
      const { session } = useAuth();

      useEffect(() => {
        fetchPropostas();
      }, []);

      const fetchPropostas = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('propostas')
            .select(`
                *,
                cliente:entities!propostas_cliente_id_fkey (id, nome_razao_social)
            `)
            .order('created_at', { ascending: false });


        if (error) {
            console.error("Erro ao buscar propostas:", error);
            toast({ title: "Erro ao buscar propostas", description: error.message, variant: "destructive" });
            setPropostas([]);
        } else {
            const formattedData = data.map(p => ({
                ...p,
                cliente_nome: p.cliente?.nome_razao_social || 'Cliente não vinculado'
            }));
            setPropostas(formattedData);
        }
        setLoading(false);
      };
      
      const handleEdit = (proposta) => {
        setPropostaToEdit(proposta);
        setIsDialogOpen(true);
      };

      const handleOpenNewDialog = () => {
        setPropostaToEdit(null);
        setIsDialogOpen(true);
      };

      const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta proposta?')) return;
        
        // Primeiro, exclua os itens da proposta
        const { error: itemsError } = await supabase.from('propostas_itens').delete().eq('proposta_id', id);
        if (itemsError) {
          toast({ title: 'Erro ao excluir itens da proposta', description: itemsError.message, variant: 'destructive' });
          return;
        }

        // Depois, exclua a proposta
        const { error } = await supabase.from('propostas').delete().eq('id', id);
        if (error) {
             toast({ title: 'Erro ao excluir proposta', description: error.message, variant: 'destructive' });
        } else {
            fetchPropostas(); // Recarrega a lista
            toast({ title: 'Proposta excluída com sucesso!', variant: 'destructive' });
        }
      };
      
      const handleGeneratePdf = async (propostaIdOrCodigo, action = 'download') => {
          if (!session) {
              toast({ title: "Não autenticado", description: "Você precisa estar logado.", variant: "destructive" });
              return null;
          }
      
          toast({ title: "Gerando PDF...", description: "Aguarde um momento." });
          try {
              const propostaUuid = await resolvePropostaId(propostaIdOrCodigo);

              const { data, error } = await supabase.functions.invoke('proposta-pdf', {
                  body: { proposta_id: propostaUuid },
                  headers: { Authorization: `Bearer ${session.access_token}` },
              });
      
              if (error) throw error;
      
              if (data instanceof Blob) {
                  const blobUrl = URL.createObjectURL(data);
                  if (action === 'download') {
                      window.open(blobUrl, '_blank');
                  }
                  return blobUrl;
              } else if (typeof data === 'object' && data.url) { // Fallback for URL response
                 if (action === 'download') {
                      window.open(data.url, '_blank');
                  }
                  return data.url;
              }
              else {
                  throw new Error("Resposta inesperada da função de PDF.");
              }
          } catch (error) {
              console.error("Erro ao gerar PDF da proposta:", error);
              const errorMessage = error.message || 'Erro desconhecido ao gerar PDF.';
              toast({ title: "Falha ao gerar PDF", description: errorMessage, variant: "destructive" });
              return null;
          }
      };

      const handleShare = async (proposta) => {
        const pdfUrl = await handleGeneratePdf(proposta.id, 'share');
        if(pdfUrl) {
          const message = `Olá! Segue a proposta comercial #${proposta.numero || proposta.codigo} para sua análise: ${pdfUrl}`;
          // Assumindo que a tabela de propostas tem o telefone do cliente
          const { data: cliente } = await supabase.from('entities').select('telefone').eq('id', proposta.cliente_id).single();
          shareOnWhatsApp(message, cliente?.telefone);
        }
      };

      const filteredPropostas = propostas.filter(p =>
        (p.descricao && p.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.cliente_nome && p.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.numero && p.numero.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      return (
        <div className="p-4 md:p-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Propostas Comerciais</h1>
              <p className="text-gray-500 mt-1">Gerencie, crie e envie suas propostas.</p>
            </div>
            <Button onClick={handleOpenNewDialog} className="mt-4 md:mt-0 gradient-primary text-white">
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Proposta
            </Button>
          </header>

          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar por cliente, número ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              <p>Carregando propostas...</p>
            ) : (
              filteredPropostas.map(proposta => (
                <PropostaCard
                  key={proposta.id}
                  proposta={proposta}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onShare={handleShare}
                  onDownload={handleGeneratePdf}
                />
              ))
            )}
          </motion.div>
          
          <NovaPropostaDialog 
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSuccess={fetchPropostas}
            propostaToEdit={propostaToEdit}
            setPropostaToEdit={setPropostaToEdit}
          />
        </div>
      );
    };

    export default Propostas;