import React, { useState } from 'react';
import { getWhatsAppLink } from '@/lib/whatsapp';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Share2, FileDown } from 'lucide-react';

const PedidoConsolidado = ({ pedidoId }) => {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const gerarPDF = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('pedido-compra-pdf', { 
                body: { pedido_id: pedidoId } 
            });

            if (error) throw error;

            setPdfUrl(data.url);
            toast({ title: "PDF Gerado!", description: "O pedido de compra está pronto para ser compartilhado." });
            window.open(data.url, '_blank');
        } catch(err) {
            toast({ title: "Erro ao gerar PDF", description: err.message, variant: "destructive" });
        }
        setLoading(false);
    };

    const enviarWhats = () => {
        if (!pdfUrl) return;
        window.open(getWhatsAppLink(`Olá! Segue o pedido de compra para sua análise: ${pdfUrl}`), '_blank');
    };

    return (
        <div className="flex gap-2">
            <Button onClick={gerarPDF} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                Gerar PDF
            </Button>
            <Button onClick={enviarWhats} disabled={!pdfUrl} className="bg-green-500 hover:bg-green-600">
                <Share2 className="mr-2 h-4 w-4" />
                WhatsApp
            </Button>
        </div>
    );
};

export default PedidoConsolidado;