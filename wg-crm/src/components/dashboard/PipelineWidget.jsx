import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PipelineWidget = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPipelineData = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('vw_pipeline_oportunidades').select('*');
            if (!error && data) {
                setRows(data);
            } else {
                console.error("Error fetching vw_pipeline_oportunidades:", error);
            }
            setLoading(false);
        };
        fetchPipelineData();
    }, []);

    const total = rows.reduce((s, r) => s + Number(r.valor_total || 0), 0);

    if (loading) {
        return (
            <div className="rounded-2xl border p-4 h-48 flex items-center justify-center">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-4 bg-wg-gray-light"
        >
            <div className="text-sm font-semibold mb-3">Pipeline de Vendas</div>
            <div className="space-y-2">
                {rows.map((r, index) => (
                    <motion.div
                        key={r.etapa}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between text-sm"
                    >
                        <span>{r.etapa} ({r.qtde})</span>
                        <span>{Number(r.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </motion.div>
                ))}
                <div className="border-t pt-2 flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default PipelineWidget;
