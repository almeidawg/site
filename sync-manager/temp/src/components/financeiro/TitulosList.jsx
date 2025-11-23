import React from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const TitulosList = () => {
    const { titulos } = useFinancial();

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    const formatDate = (date) => new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Pago': return 'success';
            case 'Aprovado': return 'default';
            case 'Previsto': return 'secondary';
            case 'Vencido': return 'destructive';
            case 'Cancelado': return 'outline';
            default: return 'secondary';
        }
    };

    if (titulos.length === 0) {
        return <p className="text-muted-foreground text-center py-8">Nenhum título encontrado para a seleção atual.</p>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Favorecido</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {titulos.map((titulo) => (
                    <TableRow key={titulo.id}>
                        <TableCell>{formatDate(titulo.vencimento)}</TableCell>
                        <TableCell className="font-medium">{titulo.favorecido_texto || 'N/A'}</TableCell>
                        <TableCell>
                            <Badge variant={titulo.tipo === 'Receber' ? 'outline-success' : 'outline-destructive'}>
                                {titulo.tipo}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(titulo.valor)}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(titulo.status)}>{titulo.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{titulo.empresas?.razao_social || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Abrir menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                    <DropdownMenuItem>Editar</DropdownMenuItem>
                                    <DropdownMenuItem>Pagar/Receber</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default TitulosList;