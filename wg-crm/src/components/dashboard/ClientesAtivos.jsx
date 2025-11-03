import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';
import { Loader2, UserCheck, Search, Mail, Phone, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';

const ClientesAtivos = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchClientes = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('v_clientes_ativos_contratos')
                .select('*')
                .limit(8);

            if (error) {
                console.error("Erro ao buscar clientes com contrato:", error);
            } else {
                setClientes(data);
            }
            setLoading(false);
        };
        fetchClientes();
    }, []);

    const filteredClientes = useMemo(() => {
        if (!searchTerm) return clientes;
        return clientes.filter(c =>
            c.nome_razao_social.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clientes, searchTerm]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-1 lg:col-span-3 glass-effect rounded-2xl p-6"
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <UserCheck className="text-emerald-500" size={24} />
                    Clientes Ativos (com Contrato)
                </h2>
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar cliente..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="max-h-80 overflow-y-auto pr-2">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredClientes.length === 0 ? (
                     <div className="text-center text-muted-foreground py-10">
                        <p>Nenhum cliente encontrado.</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {filteredClientes.map((cliente, index) => (
                            <motion.li
                                key={cliente.cliente_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 rounded-lg border border-gray-200/50 bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-base">{cliente.nome_razao_social}</p>
                                        <p className="text-sm text-muted-foreground">{cliente.contratos} contrato(s) ativo(s)</p>
                                    </div>
                                    <div className="text-sm text-green-600 font-semibold">
                                       {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cliente.valor_total)}
                                    </div>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                )}
            </div>
        </motion.div>
    );
};

export default ClientesAtivos;
