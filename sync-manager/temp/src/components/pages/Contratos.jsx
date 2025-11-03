import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Loader2, HardHat, Building, UserCheck, Construction, Trash2 } from 'lucide-react';
import NovoContratoDialog from '@/components/contratos/NovoContratoDialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { getWhatsAppLink } from '@/lib/whatsapp';
import ActionIcons from '@/components/shared/ActionIcons';
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

const Contratos = () => {
  const [contratos, setContratos] = useLocalStorage('crm_contratos', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(null); // Store ID of contract being generated
  const [contratoToDelete, setContratoToDelete] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();

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

  const generatePdf = async (contrato, openInNewTab = true) => {
    setIsGeneratingPdf(contrato.id);
    try {
        const { data, error } = await supabase.functions.invoke('contrato-pdf', {
            body: { contratoData: contrato }
        });
        if (error) throw error;
        if (openInNewTab) {
            window.open(data.url, '_blank');
            toast({ title: "PDF Gerado!", description: "O download do seu contrato começará em breve." });
        }
        return data.url;
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ title: "Erro ao gerar PDF", description: "Houve um problema ao criar o documento.", variant: "destructive" });
        return null;
    } finally {
        setIsGeneratingPdf(null);
    }
  };

  const handleShareWhats = async (contrato) => {
    const url = await generatePdf(contrato, false);
    if (!url) {
        toast({ title: "Gere o PDF primeiro", description: "Não foi possível obter o link do PDF para compartilhar.", variant: "destructive" });
        return;
    }
    window.open(getWhatsAppLink(`Olá! Segue o contrato para sua análise: ${url}`), '_blank');
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

      <div className="space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contratos</h1>
            <p className="text-muted-foreground mt-1">
              Gestão de contratos, modelos e assinaturas eletrônicas.
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
          {contratos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-muted-foreground">Nenhum contrato gerado ainda.</p>
              <p className="text-sm text-gray-500">Clique em "Novo Contrato" para começar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contratos.map((contrato, index) => {
                const { icon, tagClass } = getContratoStyle(contrato.tipoContrato);
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
                        <p className="font-semibold">{getTipoContratoLabel(contrato.tipoContrato)} - {contrato.targetName}</p>
                        <p className="text-sm text-muted-foreground">
                          Gerado em: {new Date(contrato.dataCriacao).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('inline-block px-3 py-1 text-xs font-medium rounded-full', tagClass)}>
                        {getTipoContratoLabel(contrato.tipoContrato)}
                      </span>
                      {isGeneratingPdf === contrato.id ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <ActionIcons
                          onPdf={() => generatePdf(contrato)}
                          onWhats={() => handleShareWhats(contrato)}
                          onDelete={() => confirmDelete(contrato)}
                        />
                      )}
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
      </div>
    </>
  );
};

export default Contratos;