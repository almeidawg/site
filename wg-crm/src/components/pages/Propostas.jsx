
import React, { useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, LayoutGrid, List, Trash2, Users, ImagePlus, ArrowUpFromLine, FileSignature, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import PropostaCard from '@/components/propostas/PropostaCard';
import NovaPropostaDialog from '@/components/propostas/NovaPropostaDialog';
import NovoContratoDialog from '@/components/contratos/NovoContratoDialog';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PropostaPDF from '@/components/propostas/PropostaPDF';
import PropostasTable from '@/components/propostas/PropostasTable';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const Propostas = () => {
  const [propostas, setPropostas] = useLocalStorage('crm_propostas', []);
  const [contratos, setContratos] = useLocalStorage('crm_contratos', []);
  const [clientAvatars, setClientAvatars] = useLocalStorage('crm_client_avatars', {});
  const [novaPropostaDialogOpen, setNovaPropostaDialogOpen] = useState(false);
  const [novoContratoDialogOpen, setNovoContratoDialogOpen] = useState(false);
  const [propostaParaContrato, setPropostaParaContrato] = useState(null);
  const [propostaToEdit, setPropostaToEdit] = useState(null);
  const [propostaToDelete, setPropostaToDelete] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [propostaParaPdf, setPropostaParaPdf] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [clienteDialogOpen, setClienteDialogOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clientePropostasAprovadas, setClientePropostasAprovadas] = useState([]);
  const pdfRef = useRef();
  const { toast } = useToast();

  const clientesAgrupados = useMemo(() => {
    const map = new Map();
    propostas.forEach((p) => {
      if (!p.cliente_id) return;
      const entry = map.get(p.cliente_id) || {
        clienteId: p.cliente_id,
        clienteNome: p.cliente_nome || 'Cliente',
        propostas: [],
        aprovadas: [],
        valorAprovadas: 0,
        avatarUrl: clientAvatars[p.cliente_id] || null,
      };

      entry.propostas.push(p);
      if (p.status === 'aprovada' || p.status === 'contrato_gerado') {
        entry.aprovadas.push(p);
        entry.valorAprovadas += parseFloat(p.valor_total) || 0;
      }
      map.set(p.cliente_id, entry);
    });

    return Array.from(map.values()).sort((a, b) => a.clienteNome.localeCompare(b.clienteNome));
  }, [propostas, clientAvatars]);

  const getInitials = (nome = '') => {
    const parts = nome.split(' ').filter(Boolean);
    if (parts.length === 0) return 'CL';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleAvatarUpload = (clienteId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setClientAvatars((prev) => ({ ...prev, [clienteId]: reader.result }));
      toast({ title: 'Avatar atualizado!', description: 'A imagem do cliente foi personalizada.' });
    };
    reader.readAsDataURL(file);
  };

  const handleUseSuggestedAvatar = (clienteId, clienteNome) => {
    const suggestedUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(clienteNome || clienteId)}`;
    setClientAvatars((prev) => ({ ...prev, [clienteId]: suggestedUrl }));
    toast({ title: 'Avatar sugerido aplicado', description: 'Você pode trocar a qualquer momento.' });
  };

  const abrirDialogCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setClientePropostasAprovadas(cliente.aprovadas);
    setClienteDialogOpen(true);
  };

  const handleUpdateStatus = (id, newStatus, toastTitle, toastDescription) => {
    setPropostas(prevPropostas => 
      prevPropostas.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      )
    );
    toast({
      title: toastTitle,
      description: toastDescription,
    });
  };

  const handleApprove = (id) => {
    handleUpdateStatus(id, 'aprovada', 'Proposta Aprovada! ✔️', 'A proposta foi aprovada pela diretoria e está pronta para gerar o contrato.');
  };
  
  const handleReject = (id) => {
    handleUpdateStatus(id, 'rejeitada', 'Proposta Rejeitada ❌', 'A proposta foi rejeitada pela diretoria.');
  };

  const confirmDelete = (proposta) => {
    setPropostaToDelete(proposta);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    setPropostas(prev => prev.filter(p => p.id !== propostaToDelete.id));
    toast({ title: 'Proposta Excluída!', variant: 'destructive' });
    setIsAlertOpen(false);
    setPropostaToDelete(null);
  };
  
  const handleGerarContrato = (proposta) => {
    setPropostaParaContrato(proposta);
    setNovoContratoDialogOpen(true);
  };
  
  const handleEditProposta = (proposta) => {
    setPropostaToEdit(proposta);
    setNovaPropostaDialogOpen(true);
  };
  
  const handleOpenNewProposta = () => {
    setPropostaToEdit(null);
    setNovaPropostaDialogOpen(true);
  };

  const onContratoGerado = (contrato) => {
    if (propostaParaContrato) {
      handleUpdateStatus(propostaParaContrato.id, 'contrato_gerado', 'Contrato Gerado!', `O contrato para a proposta #${propostaParaContrato.numero} foi criado.`);
    }
    setPropostaParaContrato(null);
  };

  const handleGeneratePdf = async (proposta) => {
    setPropostaParaPdf(proposta);
    setIsGeneratingPdf(true);
    
    setTimeout(async () => {
      if (pdfRef.current) {
        try {
          const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`proposta-${proposta.numero}.pdf`);
          
          toast({ title: "PDF Gerado!", description: "O download da sua proposta começará em breve." });

        } catch (error) {
          console.error("Error generating PDF:", error);
          toast({ title: "Erro ao gerar PDF", description: "Houve um problema ao criar o documento.", variant: "destructive" });
        }
      }
      setIsGeneratingPdf(false);
      setPropostaParaPdf(null);
    }, 500);
  };

  const commonProps = {
    onApprove: handleApprove,
    onReject: handleReject,
    onGerarContrato: handleGerarContrato,
    onEdit: handleEditProposta,
    onGeneratePdf: handleGeneratePdf,
    onDelete: confirmDelete,
  };

  return (
    <>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá excluir permanentemente a proposta
              <span className="font-bold"> #{propostaToDelete?.numero}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Propostas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie orçamentos, aprovações e propostas comerciais
            </p>
          </div>
          <div className="flex items-center gap-2">
             <ToggleGroup
              type="single"
              defaultValue="grid"
              variant="outline"
              onValueChange={(value) => value && setViewMode(value)}
            >
              <ToggleGroupItem value="grid" aria-label="Ver em grade">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="Ver em lista">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="clientes" aria-label="Ver por cliente">
                <Users className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button
              onClick={handleOpenNewProposta}
              className="gradient-primary text-white shadow-lg shadow-orange-500/30"
            >
              <Plus size={20} className="mr-2" />
              Nova Proposta
            </Button>
          </div>
        </div>

        {propostas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-effect rounded-2xl p-12 text-center"
          >
            <p className="text-muted-foreground">Nenhuma proposta criada ainda</p>
          </motion.div>
        ) : viewMode === 'clientes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clientesAgrupados.map((cliente) => (
              <motion.div
                key={cliente.clienteId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border p-5 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  {cliente.avatarUrl ? (
                    <img
                      src={cliente.avatarUrl}
                      alt={cliente.clienteNome}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 text-white flex items-center justify-center font-semibold">
                      {getInitials(cliente.clienteNome)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">{cliente.clienteNome}</p>
                    <p className="text-sm text-muted-foreground">
                      {cliente.propostas.length} proposta(s) · {cliente.aprovadas.length} aprovada(s)
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => abrirDialogCliente(cliente)}
                    disabled={cliente.aprovadas.length === 0}
                  >
                    <FileSignature className="h-4 w-4 mr-2" />
                    Ver aprovadas
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUseSuggestedAvatar(cliente.clienteId, cliente.clienteNome)}
                    title="Aplicar avatar sugerido"
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                  <input
                    id={`avatar-${cliente.clienteId}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAvatarUpload(cliente.clienteId, e.target.files?.[0])}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => document.getElementById(`avatar-${cliente.clienteId}`)?.click()}
                    title="Enviar avatar do cliente"
                  >
                    <ArrowUpFromLine className="h-4 w-4" />
                  </Button>
                </div>

                <div className="rounded-xl bg-gray-50 border p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valor aprovado</span>
                    <span className="font-semibold">
                      {cliente.valorAprovadas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {cliente.aprovadas.slice(0, 3).map((p) => (
                      <span key={p.id} className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                        #{p.numero}
                      </span>
                    ))}
                    {cliente.aprovadas.length > 3 && (
                      <span className="text-muted-foreground">+{cliente.aprovadas.length - 3} outras</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          viewMode === 'grid' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propostas.map((proposta, index) => (
                <PropostaCard 
                  key={proposta.id} 
                  proposta={proposta} 
                  index={index} 
                  isGeneratingPdf={isGeneratingPdf && propostaParaPdf?.id === proposta.id}
                  {...commonProps}
                />
              ))}
            </div>
          ) : (
            <PropostasTable 
              propostas={propostas}
              isGeneratingPdf={isGeneratingPdf}
              propostaParaPdf={propostaParaPdf}
              {...commonProps}
            />
          )
        )}

        <NovaPropostaDialog
          open={novaPropostaDialogOpen}
          onOpenChange={setNovaPropostaDialogOpen}
          propostas={propostas}
          setPropostas={setPropostas}
          propostaToEdit={propostaToEdit}
          setPropostaToEdit={setPropostaToEdit}
        />
        
        <NovoContratoDialog
          open={novoContratoDialogOpen}
          onOpenChange={setNovoContratoDialogOpen}
          setContratos={setContratos}
          propostaBase={propostaParaContrato}
          onContratoGerado={onContratoGerado}
        />
      </div>

      <Dialog open={clienteDialogOpen} onOpenChange={setClienteDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Propostas aprovadas - {clienteSelecionado?.clienteNome}</DialogTitle>
            <DialogDescription>
              O mesmo cliente pode ter várias propostas aprovadas. Escolha qual seguir para contrato ou PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {clientePropostasAprovadas.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma proposta aprovada para este cliente.</p>
            ) : (
              clientePropostasAprovadas.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-semibold">Proposta #{p.numero}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · {new Date(p.data_criacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleGeneratePdf(p)}>
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button size="sm" className="gradient-primary text-white" onClick={() => handleGerarContrato(p)}>
                      <FileSignature className="h-4 w-4 mr-2" />
                      Gerar contrato
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {propostaParaPdf && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <PropostaPDF ref={pdfRef} proposta={propostaParaPdf} />
        </div>
      )}
    </>
  );
};

export default Propostas;
