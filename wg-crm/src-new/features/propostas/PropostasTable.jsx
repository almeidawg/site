
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const PropostasTable = ({ propostas, onEdit, onGerarContrato, onGeneratePdf, isGeneratingPdf, propostaParaPdf, onDelete }) => {
  
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(proposta)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onGeneratePdf(proposta)} disabled={isGeneratingPdf && propostaParaPdf?.id === proposta.id}>
                        {isGeneratingPdf && propostaParaPdf?.id === proposta.id ? 'Gerando...' : 'Baixar PDF'}
                    </DropdownMenuItem>
                    {proposta.status === 'aprovada' && (
                        <DropdownMenuItem onClick={() => onGerarContrato(proposta)}>
                            Gerar Contrato
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => onDelete(proposta)}>
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PropostasTable;
