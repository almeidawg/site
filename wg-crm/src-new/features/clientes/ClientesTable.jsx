import React from 'react';
import { motion } from 'framer-motion';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ClientesTable = ({ clientes, oportunidades, onEditCliente }) => {

  const getStatusEtiqueta = (clienteId) => {
    const oportunidade = oportunidades.find(op => op.cliente_id === clienteId);
    if (!oportunidade) return <span className="bg-gray-200 text-gray-700 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">Sem Oportunidade</span>;

    const statusMap = {
      qualificacao: { label: 'Qualificação', color: 'bg-blue-100 text-blue-800' },
      visita_tecnica: { label: 'Visita', color: 'bg-purple-100 text-purple-800' },
      orcamento: { label: 'Orçamento', color: 'bg-yellow-100 text-yellow-800' },
      negociacao: { label: 'Negociação', color: 'bg-orange-100 text-orange-800' },
      ganha: { label: 'Ganha', color: 'bg-green-100 text-green-800' },
      perdida: { label: 'Perdida', color: 'bg-red-100 text-red-800' },
    };
    
    const statusInfo = statusMap[oportunidade.fase] || { label: 'Indefinido', color: 'bg-gray-200 text-gray-700' };

    return <span className={`${statusInfo.color} text-xs font-medium me-2 px-2.5 py-0.5 rounded-full`}>{statusInfo.label}</span>;
  };

  if (clientes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-effect rounded-2xl p-12 text-center"
      >
        <p className="text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
      </motion.div>
    );
  }

  return (
    <div className="overflow-x-auto glass-effect rounded-xl">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
          <tr>
            <th scope="col" className="px-6 py-3">Código</th>
            <th scope="col" className="px-6 py-3">Nome / Razão Social</th>
            <th scope="col" className="px-6 py-3">Telefone</th>
            <th scope="col" className="px-6 py-3">Email</th>
            <th scope="col" className="px-6 py-3">Cidade/UF</th>
            <th scope="col" className="px-6 py-3">Status Pipeline</th>
            <th scope="col" className="px-6 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente, index) => (
            <motion.tr 
              key={cliente.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white/30 border-b hover:bg-gray-50/50"
            >
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{cliente.codigo_cliente}</td>
              <td className="px-6 py-4">{cliente.nome || cliente.razao_social}</td>
              <td className="px-6 py-4">{cliente.telefone1}</td>
              <td className="px-6 py-4">{cliente.email}</td>
              <td className="px-6 py-4">{cliente.cidade}/{cliente.estado}</td>
              <td className="px-6 py-4">{getStatusEtiqueta(cliente.id)}</td>
              <td className="px-6 py-4">
                <Button variant="ghost" size="icon" onClick={() => onEditCliente(cliente)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientesTable;