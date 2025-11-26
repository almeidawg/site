
import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Eye, Download, HardHat, Building, UserCheck, Loader2, Construction, Trash2 } from 'lucide-react';
import NovoContratoDialog from '@/components/contratos/NovoContratoDialog';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ContratoPDF from '@/components/contratos/ContratoPDF';
import { cn } from '@/lib/utils';
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
} from "@/components/ui/dialog";

const Contratos = () => {
  const [contratos, setContratos] = useLocalStorage('crm_contratos', []);
  const [propostas] = useLocalStorage('crm_propostas', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contratoParaPdf, setContratoParaPdf] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [contratoToDelete, setContratoToDelete] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [contratoParaVisualizar, setContratoParaVisualizar] = useState(null);
  const [visualizarDialogOpen, setVisualizarDialogOpen] = useState(false);
  const pdfRef = useRef();
  const { toast } = useToast();

  const propostasAprovadas = useMemo(
    () => propostas.filter((p) => ['aprovada', 'contrato_gerado'].includes(p.status)),
    [propostas]
  );

  const handleVisualizarContrato = (contrato) => {
    setContratoParaVisualizar(contrato);
    setVisualizarDialogOpen(true);
  };

  const handleOpenDialog = () => {
    if (propostasAprovadas.length === 0) {
      toast({
        title: 'Nenhuma proposta aprovada',
        description: 'Aprove uma proposta antes de gerar o contrato.',
        variant: 'destructive',
      });
      return;
    }
    setDialogOpen(true);
  };

  const confirmDelete = (contrato) => {
    setContratoToDelete(contrato);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    setContratos(prev => prev.filter(c => c.id !== contratoToDelete.id));
    toast({ title: 'Contrato Excluído!', variant: 'destructive' });
    setIsAlertOpen(false);
    setContratoToDelete(null);
  };

  const handleGeneratePdf = async (contrato) => {
    setContratoParaPdf(contrato);
    setIsGeneratingPdf(true);
    
    setTimeout(async () => {
      if (pdfRef.current) {
        try {
          const canvas = await html2canvas(pdfRef.current, {
            scale: 2,
            useCORS: true,
          });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const ratio = canvasWidth / canvasHeight;
          const height = pdfWidth / ratio;

          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height > pdfHeight ? pdfHeight : height);
          const nomeArquivo = contrato.targetName
            ? `contrato-${contrato.targetName.replace(/\s/g, '_')}.pdf`
            : 'contrato.pdf';
          pdf.save(nomeArquivo);
          
          toast({
            title: "PDF Gerado!",
            description: "O download do seu contrato começará em breve.",
          });

        } catch (error) {
          console.error("Error generating PDF:", error);
          toast({
            title: "Erro ao gerar PDF",
            description: "Houve um problema ao criar o documento. Tente novamente.",
            variant: "destructive",
          });
        }
      }
      setIsGeneratingPdf(false);
      setContratoParaPdf(null);
    }, 500);
  };
  
  const getContratoStyle = (tipo) => {
    switch (tipo) {
      case 'arquitetura':
        return { icon: <Building className="text-wg-arquitetura" />, tagClass: 'bg-wg-arquitetura/20 text-wg-arquitetura' };
      case 'engenharia':
        return { icon: <HardHat className="text-wg-engenharia" />, tagClass: 'bg-wg-engenharia/20 text-wg-engenharia' };
      case 'marcenaria':
        return { icon: <Construction className="text-wg-marcenaria" />, tagClass: 'bg-wg-marcenaria/20 text-wg-marcenaria' };
      case 'prestacao_servicos':
        return { icon: <UserCheck className="text-sky-600" />, tagClass: 'bg-sky-100 text-sky-700' };
      default:
        return { icon: <FileText className="text-gray-500" />, tagClass: 'bg-gray-100 text-gray-700' };
    }
  }

  const getTipoContratoLabel = (tipo) => {
    const labels = {
      arquitetura: 'Projeto Arquitetônico',
      engenharia: 'Engenharia',
      marcenaria: 'Marcenaria',
      prestacao_servicos: 'Prestação de Serviços',
    };
    return labels[tipo] || 'Não especificado';
  }


  return (
    <>
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá excluir permanentemente o contrato para
              <span className="font-bold"> {contratoToDelete?.targetName}</span>.
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
            <h1>Contratos</h1>
            <p className="text-wg-gray-medium mt-1">
              Gestão de contratos, modelos e assinaturas eletrônicas.
            </p>
          </div>
          <Button
            onClick={handleOpenDialog}
            className="gradient-primary text-white shadow-lg shadow-orange-500/30"
          >
            <Plus size={20} className="mr-2" />
            Novo Contrato
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          {contratos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-wg-gray-medium">Nenhum contrato gerado ainda.</p>
              <p className="text-sm text-gray-500">Clique em "Novo Contrato" para começar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contratos.map((contrato, index) => {
                const { icon, tagClass } = getContratoStyle(contrato.tipoContrato);
                const dataCriacao = contrato.dataCriacao
                  ? new Date(contrato.dataCriacao).toLocaleDateString()
                  : '';
                const dataPrevisao =
                  contrato.dataInicioPrevista && contrato.dataTerminoPrevista
                    ? `${new Date(contrato.dataInicioPrevista).toLocaleDateString()} - ${new Date(
                        contrato.dataTerminoPrevista
                      ).toLocaleDateString()}`
                    : null;
                return (
                  <motion.div
                    key={contrato.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      {icon}
                      <div>
                        <p className="font-semibold">
                          {getTipoContratoLabel(contrato.tipoContrato)} - {contrato.targetName || 'Cliente'}
                        </p>
                        <p className="text-sm text-wg-gray-medium">
                          Proposta: {contrato.propostaNumero ? `#${contrato.propostaNumero}` : 'N/A'} | Gerado em: {dataCriacao || 'N/A'}
                        </p>
                        {dataPrevisao && (
                          <p className="text-xs text-muted-foreground">
                            Prazo previsto: {dataPrevisao} ({contrato.diasUteis} dia(s) útil/eis)
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('inline-block px-3 py-1 text-xs font-medium rounded-full', tagClass)}>
                        {getTipoContratoLabel(contrato.tipoContrato)}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => handleVisualizarContrato(contrato)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleGeneratePdf(contrato)} disabled={isGeneratingPdf && contratoParaPdf?.id === contrato.id}>
                        {isGeneratingPdf && contratoParaPdf?.id === contrato.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      </Button>
                       <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => confirmDelete(contrato)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        <NovoContratoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          setContratos={setContratos}
        />

        <Dialog open={visualizarDialogOpen} onOpenChange={setVisualizarDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Visualizar Contrato - {contratoParaVisualizar?.targetName}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {contratoParaVisualizar && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="transform scale-90 origin-top">
                    <ContratoPDF contrato={contratoParaVisualizar} />
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {contratoParaPdf && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <ContratoPDF ref={pdfRef} contrato={contratoParaPdf} />
        </div>
      )}
    </>
  );
};

export default Contratos;
