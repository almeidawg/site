import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const FinancialContext = createContext();

export const useFinancial = () => useContext(FinancialContext);

export const FinancialProvider = ({ children }) => {
    const [titulos, setTitulos] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [selectedEmpresa, setSelectedEmpresa] = useState('all');
    const [stats, setStats] = useState({ totalReceitas: 0, totalDespesas: 0, saldo: 0, lucratividade: 0 });
    const [loading, setLoading] = useState(true);
    const [isNovoTituloOpen, setNovoTituloOpen] = useState(false);
    const { toast } = useToast();

    const fetchFinancialData = async () => {
        setLoading(true);
        try {
            let query = supabase.from('titulos_financeiros').select(`
                *,
                empresas (razao_social),
                plano_contas (grupo, conta),
                centros_custo (nome)
            `);

            if (selectedEmpresa !== 'all') {
                query = query.eq('empresa_id', selectedEmpresa);
            }

            const { data, error } = await query.in('status', ['Pago', 'Aprovado', 'Previsto', 'Vencido']);

            if (error) throw error;

            setTitulos(data);
            calculateStats(data);

        } catch (error) {
            toast({ title: 'Erro ao buscar dados financeiros', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const fetchEmpresas = async () => {
        const { data, error } = await supabase.from('empresas').select('id, razao_social');
        if (error) {
            toast({ title: 'Erro ao buscar empresas', description: error.message, variant: 'destructive' });
        } else {
            setEmpresas(data);
        }
    };

    useEffect(() => {
        fetchEmpresas();
    }, []);

    useEffect(() => {
        fetchFinancialData();
    }, [selectedEmpresa]);

    const calculateStats = (data) => {
        const pagos = data.filter(t => t.status === 'Pago');
        const totalReceitas = pagos.filter(l => l.tipo === 'Receber').reduce((acc, l) => acc + parseFloat(l.valor), 0);
        const totalDespesas = pagos.filter(l => l.tipo === 'Pagar').reduce((acc, l) => acc + parseFloat(l.valor), 0);
        const saldo = totalReceitas - totalDespesas;
        const lucratividade = totalReceitas > 0 ? (saldo / totalReceitas) * 100 : 0;
        setStats({ totalReceitas, totalDespesas, saldo, lucratividade });
    };

    const value = {
        titulos,
        stats,
        loading,
        isNovoTituloOpen,
        setNovoTituloOpen,
        fetchFinancialData,
        empresas,
        selectedEmpresa,
        setSelectedEmpresa
    };

    return (
        <FinancialContext.Provider value={value}>
            {children}
        </FinancialContext.Provider>
    );
};