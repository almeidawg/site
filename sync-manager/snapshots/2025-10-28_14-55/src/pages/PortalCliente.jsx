import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { File, Folder, HardDrive, ShieldAlert } from 'lucide-react';

const PortalCliente = () => {
    const { id } = useParams();

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                    Portal do Cliente
                </h1>
                <p className="text-muted-foreground mt-1">
                    Acompanhe seus projetos, documentos e faturas. (ID do Cliente: {id})
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-effect rounded-2xl p-12 text-center"
            >
                <ShieldAlert className="mx-auto h-16 w-16 text-amber-500" />
                <h2 className="mt-6 text-xl font-semibold">Acesso Exclusivo em Construção</h2>
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                    Esta será a área exclusiva para seus clientes. Para garantir a segurança e a privacidade de cada um, o acesso a este portal só será possível após a configuração de um sistema de autenticação.
                </p>
                <p className="text-sm text-gray-500 mt-4">
                    Com a integração do Supabase, seus clientes poderão fazer login aqui para visualizar o andamento de projetos, acessar documentos compartilhados e muito mais.
                </p>
            </motion.div>
        </div>
    );
};

export default PortalCliente;