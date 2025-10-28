import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer, Legend } from 'recharts';

const FinanceCharts = () => {
  const [fluxo, setFluxo] = useState([]);
  const [cats, setCats] = useState([]);
  const [top, setTop] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [fluxoRes, catsRes, topRes] = await Promise.all([
        supabase.from('v_fluxo_caixa').select('*'),
        supabase.from('v_despesas_mes_categoria').select('*'),
        supabase.from('v_top10_clientes_receita').select('*'),
      ]);

      if (fluxoRes.data) setFluxo(fluxoRes.data);
      if (catsRes.data) setCats(catsRes.data);
      if (topRes.data) setTop(topRes.data.map(t => ({...t, cliente: t.nome_razao_social})));
    };

    fetchData();
  }, []);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="glass-effect rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">Fluxo de Caixa (Próx. 30 dias)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={fluxo}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
            <XAxis dataKey="data" tickFormatter={(d) => new Date(d).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})} stroke="rgba(0, 0, 0, 0.7)" />
            <YAxis tickFormatter={formatCurrency} stroke="rgba(0, 0, 0, 0.7)" />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              labelFormatter={(d) => new Date(d).toLocaleDateString('pt-BR')}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#000' }}
            />
            <Legend />
            <Line type="monotone" dataKey="receber" stroke="#34d399" name="A Receber" strokeWidth={2} />
            <Line type="monotone" dataKey="pagar" stroke="#f87171" name="A Pagar" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-effect rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">Despesas do Mês por Categoria</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={cats} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
             <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
            <XAxis type="number" tickFormatter={formatCurrency} stroke="rgba(0, 0, 0, 0.7)" />
            <YAxis type="category" dataKey="categoria" width={100} stroke="rgba(0, 0, 0, 0.7)" />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#000' }}
            />
            <Bar dataKey="total" fill="#818cf8" name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-effect rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4">Top 10 Clientes (Receita)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={top} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
            <XAxis type="number" tickFormatter={formatCurrency} stroke="rgba(0, 0, 0, 0.7)" />
            <YAxis type="category" dataKey="cliente" width={100} stroke="rgba(0, 0, 0, 0.7)" />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#000' }}
            />
            <Bar dataKey="receita" fill="#34d399" name="Receita" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinanceCharts;