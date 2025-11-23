
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, LayoutGrid, List, Trash2 } from 'lucide-react';
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

const Propostas = () => {
  const [propostas, setPropostas] = useLocalStorage('crm_propostas', []);
  const [contratos, setContratos] = useLocalStorage('crm_contratos', []);
  const [novaPropostaDialogOpen, setNovaPropostaDialogOpen] = useState(false);
  const [novoContratoDialogOpen, setNovoContratoDialogOpen] = useState(false);
  const [propostaParaContrato, setPropostaParaContrato] = useState(null);
  const [propostaToEdit, setPropostaToEdit] = useState(null);
  const [propostaToDelete, setPropostaToDelete] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [propostaParaPdf, setPropostaParaPdf] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const pdfRef = useRef();
  const { toast } = useToast();

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
      
      {propostaParaPdf && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <PropostaPDF ref={pdfRef} proposta={propostaParaPdf} />
        </div>
      )}
    </>
  );
};

export default Propostas;
