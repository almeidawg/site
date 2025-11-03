import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ActionIcons from '@/components/shared/ActionIcons';

const PropostasTable = ({ propostas, onEdit, onGerarContrato, onGeneratePdf, onShareWhats, isGeneratingPdf, onDelete }) => {
  
  const getStatusVariant = (status) => {
    switch (status) {
      case 'aprovada':
      case 'contrato_gerado':
        return 'success';
      case 'rejeitada':
        return 'destructive';
      case 'aprovacao_pendente':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
        'enviada': 'Enviada',
        'rascunho': 'Rascunho',
        'em_negociacao': 'Em Negociação',
        'aprovacao_pendente': 'Aprovação Pendente',
        'aprovada': 'Aprovada',
        'contrato_gerado': 'Contrato Gerado',
        'rejeitada': 'Rejeitada',
    };
    return labels[status] || status;
  }

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {propostas.map((proposta) => (
            <TableRow key={proposta.id}>
              <TableCell className="font-medium">{proposta.numero}</TableCell>
              <TableCell>{proposta.cliente_nome || 'N/A'}</TableCell>
              <TableCell>{formatCurrency(proposta.valor_total)}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(proposta.status)}>
                  {getStatusLabel(proposta.status)}
                </Badge>
              </TableCell>
              <TableCell>{new Date(proposta.data_criacao).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                {isGeneratingPdf === proposta.id ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <ActionIcons
                    onEdit={['rascunho', 'aprovacao_pendente'].includes(proposta.status) ? () => onEdit(proposta) : null}
                    onDelete={() => onDelete(proposta)}
                    onPdf={() => onGeneratePdf(proposta)}
                    onWhats={() => onShareWhats(proposta)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PropostasTable;