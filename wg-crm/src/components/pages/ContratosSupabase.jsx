import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Plus,
  Eye,
  Download,
  HardHat,
  Building,
  UserCheck,
  Loader2,
  Construction,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import NovoContratoDialog from '@/components/contratos/NovoContratoDialog';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ContratoPDF from '@/components/contratos/ContratoPDF';
import { cn } from '@/lib/utils';
import { useContratos } from '@/hooks/useContratos';
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';

const ContratosSupabase = () => {
  const {
    contratos,
    loading,
    aprovarContrato,
    rejeitarContrato,
    deleteContrato
  } = useContratos();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [contratoParaPdf, setContratoParaPdf] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [contratoToDelete, setContratoToDelete] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [contratoParaVisualizar, setContratoParaVisualizar] = useState(null);
  const [visualizarDialogOpen, setVisualizarDialogOpen] = useState(false);

  // Estados para aprovação/rejeição
  const [aprovarDialogOpen, setAprovarDialogOpen] = useState(false);
  const [rejeitarDialogOpen, setRejeitarDialogOpen] = useState(false);
  const [contratoSelecionado, setContratoSelecionado] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  const pdfRef = useRef();
  const { toast } = useToast();

  const handleVisualizarContrato = (contrato) => {
    setContratoParaVisualizar(contrato);
    setVisualizarDialogOpen(true);
  };

  const confirmDelete = (contrato) => {
    setContratoToDelete(contrato);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteContrato(contratoToDelete.id);
      setIsAlertOpen(false);
      setContratoToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  /**
   * Aprovar contrato
   */
  const handleAprovar = (contrato) => {
    setContratoSelecionado(contrato);
    setAprovarDialogOpen(true);
  };

  const confirmarAprovacao = async () => {
    try {
      setLoadingAction(true);
      await aprovarContrato(contratoSelecionado.id, true); // true = gerar projeto e financeiro
      setAprovarDialogOpen(false);
      setContratoSelecionado(null);
    } catch (error) {
      console.error('Erro ao aprovar:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  /**
   * Rejeitar contrato
   */
  const handleRejeitar = (contrato) => {
    setContratoSelecionado(contrato);
    setMotivoRejeicao('');
    setRejeitarDialogOpen(true);
  };

  const confirmarRejeicao = async () => {
    if (!motivoRejeicao.trim()) {
      toast({
        title: 'Motivo obrigatório',
        description: 'Informe o motivo da rejeição.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoadingAction(true);
      await rejeitarContrato(contratoSelecionado.id, motivoRejeicao);
      setRejeitarDialogOpen(false);
      setContratoSelecionado(null);
      setMotivoRejeicao('');
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
    } finally {
      setLoadingAction(false);
    }
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
          const nomeArquivo = contrato.cliente?.nome
            ? `contrato-${contrato.cliente.nome.replace(/\s/g, '_')}.pdf`
            : `contrato-${contrato.numero_contrato || contrato.id}.pdf`;
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

  const getStatusIcon = (contrato) => {
    if (contrato.aprovado) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (contrato.status === 'cancelado') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <Clock className="h-5 w-5 text-orange-500" />;
  };

  const getStatusLabel = (contrato) => {
    if (contrato.aprovado) return 'Aprovado';
    if (contrato.status === 'cancelado') return 'Rejeitado';
    if (contrato.status === 'assinado') return 'Assinado';
    if (contrato.status === 'em_andamento') return 'Em Andamento';
    return 'Pendente';
  };

  const getStatusClass = (contrato) => {
    if (contrato.aprovado) return 'bg-green-100 text-green-700 border-green-300';
    if (contrato.status === 'cancelado') return 'bg-red-100 text-red-700 border-red-300';
    if (contrato.status === 'assinado') return 'bg-blue-100 text-blue-700 border-blue-300';
    return 'bg-orange-100 text-orange-700 border-orange-300';
  };

  return (
    <>
      {/* Dialog de Aprovação */}
      <Dialog open={aprovarDialogOpen} onOpenChange={setAprovarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Contrato</DialogTitle>
            <DialogDescription>
              Ao aprovar este contrato, serão gerados automaticamente:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Projeto no módulo de Cronograma</li>
                <li>Cobranças no módulo Financeiro (baseado nas condições de pagamento)</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAprovarDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmarAprovacao}
              disabled={loadingAction}
              className="bg-green-600 hover:bg-green-700"
            >
              {loadingAction ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Aprovar Contrato
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Rejeição */}
      <Dialog open={rejeitarDialogOpen} onOpenChange={setRejeitarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Contrato</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição deste contrato.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Motivo da rejeição..."
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejeitarDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmarRejeicao}
              disabled={loadingAction}
              variant="destructive"
            >
              {loadingAction ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exclusão */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá excluir permanentemente o contrato
              {contratoToDelete?.numero_contrato && <span className="font-bold"> #{contratoToDelete.numero_contrato}</span>}.
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

      {/* Página Principal */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Contratos</h1>
            <p className="text-wg-gray-medium mt-1">
              Gestão de contratos com fluxo de aprovação e integração automática.
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
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
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 text-orange-500 animate-spin" />
              <p className="mt-4 text-wg-gray-medium">Carregando contratos...</p>
            </div>
          ) : contratos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-wg-gray-medium">Nenhum contrato cadastrado ainda.</p>
              <p className="text-sm text-gray-500">Clique em "Novo Contrato" para começar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contratos.map((contrato, index) => {
                const dataCriacao = contrato.created_at
                  ? new Date(contrato.created_at).toLocaleDateString('pt-BR')
                  : '';
                const dataAprovacao = contrato.aprovado_em
                  ? new Date(contrato.aprovado_em).toLocaleDateString('pt-BR')
                  : null;

                return (
                  <motion.div
                    key={contrato.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(contrato)}
                      <div>
                        <p className="font-semibold">
                          {contrato.cliente?.nome || 'Cliente não informado'} - Contrato #{contrato.numero_contrato || contrato.id.substring(0, 8)}
                        </p>
                        <p className="text-sm text-wg-gray-medium">
                          Valor: R$ {(contrato.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Criado em: {dataCriacao}
                        </p>
                        {dataAprovacao && (
                          <p className="text-xs text-green-600">
                            Aprovado em {dataAprovacao}
                          </p>
                        )}
                        {contrato.motivo_rejeicao && (
                          <p className="text-xs text-red-600">
                            Motivo: {contrato.motivo_rejeicao}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('inline-block px-3 py-1 text-xs font-medium rounded-full border', getStatusClass(contrato))}>
                        {getStatusLabel(contrato)}
                      </span>

                      {/* Botões de ação */}
                      {!contrato.aprovado && contrato.status !== 'cancelado' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAprovar(contrato)}
                            title="Aprovar contrato"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRejeitar(contrato)}
                            title="Rejeitar contrato"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      <Button variant="ghost" size="icon" onClick={() => handleVisualizarContrato(contrato)} title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGeneratePdf(contrato)}
                        disabled={isGeneratingPdf && contratoParaPdf?.id === contrato.id}
                        title="Baixar PDF"
                      >
                        {isGeneratingPdf && contratoParaPdf?.id === contrato.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => confirmDelete(contrato)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        <NovoContratoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />

        <Dialog open={visualizarDialogOpen} onOpenChange={setVisualizarDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Visualizar Contrato - {contratoParaVisualizar?.cliente?.nome || 'N/A'}
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

      {/* PDF oculto para geração */}
      {contratoParaPdf && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <ContratoPDF ref={pdfRef} contrato={contratoParaPdf} />
        </div>
      )}
    </>
  );
};

export default ContratosSupabase;
