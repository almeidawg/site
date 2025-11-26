import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const Relatorios = () => {
    const { toast } = useToast();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: transacoes, error: transacoesError } = await supabase.from('transacoes').select('valor, tipo, data_ocorrencia, categorias_custo(nome)');
            const { data: obras, error: obrasError } = await supabase.from('obras').select('nome, orcamento, status, transacoes(valor)');

            if (transacoesError || obrasError) throw transacoesError || obrasError;

            const custosPorCategoria = transacoes.filter(t => t.tipo === 'saida' && t.categorias_custo).reduce((acc, item) => {
                const catNome = item.categorias_custo.nome;
                if (!acc[catNome]) acc[catNome] = 0;
                acc[catNome] += item.valor;
                return acc;
            }, {});

            const orcadoRealizado = obras.map(obra => {
                const realizado = obra.transacoes.reduce((acc, t) => acc + t.valor, 0);
                return { name: obra.nome, Orçado: obra.orcamento, Realizado: realizado };
            });

            setReportData({
                custosCategoria: Object.entries(custosPorCategoria).map(([name, value]) => ({ name, value })),
                orcadoRealizado,
            });

        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao gerar relatórios', description: error.message });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchData(); }, [fetchData]);
    
    if (loading || !reportData) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]"></div></div>;
    }

    const COLORS = ['#F25C26', '#2B4580', '#5E9B94', '#8B5E3C', '#94A3B8'];

    return (
        <>
            <Helmet><title>Relatórios - WG Almeida</title></Helmet>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
                    <p className="text-gray-600 mt-1">Insights sobre a performance financeira</p>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="wg-card p-6">
                    <h2 className="text-xl font-bold mb-4">Orçado vs. Realizado por Obra</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={reportData.orcadoRealizado} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                            <Legend />
                            <Bar dataKey="Orçado" fill="#2B4580" />
                            <Bar dataKey="Realizado" fill="#F25C26" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="wg-card p-6">
                    <h2 className="text-xl font-bold mb-4">Distribuição de Custos por Categoria</h2>
                    <ResponsiveContainer width="100%" height={400}>
                         <PieChart>
                            <Pie data={reportData.custosCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} fill="#8884d8" label>
                                {reportData.custosCategoria.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </>
    );
};

export default Relatorios;