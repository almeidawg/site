
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';

const PipelineChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPipelineData = async () => {
      setLoading(true);
      const { data: chartData, error } = await supabase
        .from('vw_pipeline_oportunidades')
        .select('*');

      if (error) {
        console.error('Error fetching pipeline data:', error);
        setData([]);
      } else {
        const formattedData = chartData.map(item => ({
          name: item.etapa,
          total: Number(item.valor_total) || 0,
          count: item.qtde,
        }));
        setData(formattedData);
      }
      setLoading(false);
    };

    fetchPipelineData();
  }, []);

  const formatCurrency = (value) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
    return `R$ ${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-gray-800">{`${label}`}</p>
          <p className="text-sm text-indigo-600">{`Valor: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-sm text-gray-600">{`Oportunidades: ${payload[0].payload.count}`}</p>
        </div>
      );
    }
    return null;
  };

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Pipeline de Vendas (Oportunidades)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} />
                <Bar dataKey="total" name="Valor" unit=" R$">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PipelineChart;
