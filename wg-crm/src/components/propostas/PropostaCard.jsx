
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, DollarSign, CheckCircle, XCircle, ShieldQuestion, FileSignature, Edit, Download, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const PropostaCard = ({ proposta, index, onApprove, onReject, onGerarContrato, onEdit, onGeneratePdf, isGeneratingPdf, onDelete }) => {
  const { profile } = useAuth();
  const canApprove = profile?.perfil === 'diretor' || profile?.perfil === 'master';

  const statusConfig = {
    rascunho: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
    enviada: { label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
    em_negociacao: { label: 'Em Negociação', color: 'bg-amber-100 text-amber-700' },
    aprovada: { label: 'Aprovada', color: 'bg-emerald-100 text-emerald-700' },
    rejeitada: { label: 'Rejeitada', color: 'bg-red-100 text-red-700' },
    aprovacao_pendente: { label: 'Aprovação Pendente', color: 'bg-yellow-100 text-yellow-700' },
    contrato_gerado: { label: 'Contrato Gerado', color: 'bg-purple-100 text-purple-700' },
  };

  const status = statusConfig[proposta.status] || statusConfig.rascunho;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="glass-effect rounded-xl p-6 border border-purple-200/50 hover:shadow-md transition-all flex flex-col"
    >
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold">Proposta #{proposta.numero}</h3>
              <p className="text-sm text-muted-foreground">{proposta.cliente_nome}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <DollarSign size={14} />
              Valor Total
            </span>
            <span className="font-bold">
              {proposta.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
            </span>
          </div>

          {proposta.requer_aprovacao && proposta.status !== 'aprovada' && (
            <div className={`flex items-center gap-2 text-sm ${proposta.status === 'aprovacao_pendente' ? 'text-amber-600' : 'text-muted-foreground'}`}>
              <ShieldQuestion size={14} />
              <span>Desconto especial aplicado</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <Calendar size={14} />
            <span>v{proposta.versao} - {new Date(proposta.data_criacao).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t flex gap-2 justify-end">
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => onDelete(proposta)}>
          <Trash2 size={16} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onGeneratePdf(proposta)} disabled={isGeneratingPdf}>
          {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download size={16} />}
        </Button>
        {onEdit && ['rascunho', 'aprovacao_pendente'].includes(proposta.status) && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(proposta)}>
                <Edit size={16} />
            </Button>
        )}

        {(['rascunho', 'enviada', 'em_negociacao', 'aprovacao_pendente'].includes(proposta.status)) && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-700"
              onClick={() => onReject(proposta.id)}
              title="Rejeitar"
            >
              <XCircle size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-emerald-600 hover:text-emerald-700"
              onClick={() => onApprove(proposta.id)}
              title="Aprovar"
            >
              <CheckCircle size={16} />
            </Button>
          </>
        )}
      </div>

      {['aprovada', 'contrato_gerado'].includes(proposta.status) && (
        <div className="mt-4 pt-4 border-t">
          <Button className="w-full gradient-success text-white" onClick={() => onGerarContrato(proposta)}>
            <FileSignature size={16} className="mr-2" />
            {proposta.status === 'contrato_gerado' ? 'Contrato Gerado (reabrir)' : 'Gerar Contrato'}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default PropostaCard;
