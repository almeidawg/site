import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import generatePdf from '@/lib/pdfGenerator';
import 'jspdf-autotable';

const PdfExport = ({ project, scheduleSelector }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [format, setFormat] = useState('a4');
    const [orientation, setOrientation] = useState('landscape');
    const { toast } = useToast();

    const getClientInfo = () => {
        if (!project || !project.name) return 'Informações do Projeto';
        let info = `Projeto: ${project.name}\n`;
        if (project.client_name) {
            info += `Cliente: ${project.client_name}\n`;
        }
        info += `Endereço: ${project.address || 'Não informado'}\n`;
        info += `Data de Início: ${new Date(project.start_date + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`;
        return info;
    };

    const exportSchedule = async () => {
        setIsGenerating(true);
        toast({ title: 'Gerando PDF do Cronograma...' });
        await generatePdf('Cronograma do Projeto', getClientInfo(), scheduleSelector, { format, orientation });
        setIsGenerating(false);
        toast({ title: 'PDF do Cronograma Gerado!' });
    };

    const exportTeam = async () => {
        setIsGenerating(true);
        toast({ title: 'Gerando PDF da Equipe...' });

        const head = [['Nome', 'Função', 'CPF', 'RG', 'Telefone']];
        const body = project.team.map(pt => pt.member).filter(Boolean).map(m => [
            m.name,
            m.function,
            m.cpf || '',
            m.rg || '',
            m.phone || ''
        ]);

        await generatePdf('Equipe do Projeto', getClientInfo(), { head, body }, { format, orientation });
        setIsGenerating(false);
        toast({ title: 'PDF da Equipe Gerado!' });
    };

    const exportItems = async () => {
        setIsGenerating(true);
        toast({ title: 'Gerando PDF de Itens do Projeto...' });

        const head = [['Item', 'Categoria', 'Quantidade', 'Unidade']];
        const body = project.items.map(item => {
            // Defensive check for catalog_item
            if (!item.catalog_item) return null;
            return [
                item.catalog_item.name,
                item.catalog_item.category,
                item.quantity,
                item.catalog_item.unit
            ];
        }).filter(Boolean); // remove null entries

        await generatePdf('Itens do Projeto', getClientInfo(), { head, body }, { format, orientation });
        setIsGenerating(false);
        toast({ title: 'PDF de Itens Gerado!' });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                    Gerar PDF
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Opções de Exportação</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={exportSchedule} disabled={!project?.tasks?.length || isGenerating}>Cronograma</DropdownMenuItem>
                <DropdownMenuItem onSelect={exportTeam} disabled={!project?.team?.length || isGenerating}>Equipe do Projeto</DropdownMenuItem>
                <DropdownMenuItem onSelect={exportItems} disabled={!project?.items?.length || isGenerating}>Itens do Projeto</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Formato</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={format} onValueChange={setFormat}>
                    <DropdownMenuRadioItem value="a4">A4</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="a3">A3</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Orientação</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={orientation} onValueChange={setOrientation}>
                    <DropdownMenuRadioItem value="landscape">Paisagem</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="portrait">Retrato</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default PdfExport;