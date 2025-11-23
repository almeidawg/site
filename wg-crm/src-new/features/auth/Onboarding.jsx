
import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, HardDrive, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const Onboarding = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [integrations, setIntegrations] = useLocalStorage(`crm_integrations_${user?.id}`, {
      googleDriveConnected: false,
    });

    const handleConnectGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                scopes: 'https://www.googleapis.com/auth/drive.file',
                redirectTo: window.location.origin + '/dashboard' // ou outra página
            },
        });

        if (error) {
            toast({
                title: 'Erro ao conectar com o Google',
                description: error.message,
                variant: 'destructive'
            });
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                        Onboarding & Documentos
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Conecte seu Google Drive para gerenciar pastas e documentos.
                    </p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-2xl p-12 text-center"
            >
                <HardDrive className="mx-auto h-16 w-16 text-gray-400" />
                <h2 className="mt-6 text-xl font-semibold">Sistema de Arquivos em Nuvem</h2>
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                    Conecte sua conta do Google para permitir que o sistema crie e gerencie pastas de projetos no seu Google Drive, centralizando todos os documentos importantes.
                </p>

                {integrations.googleDriveConnected ? (
                     <div className="mt-6 inline-flex items-center gap-2 text-green-600 font-semibold bg-green-100 px-4 py-2 rounded-lg">
                        <CheckCircle size={20} />
                        <span>Google Drive Conectado!</span>
                    </div>
                ) : (
                    <Button onClick={handleConnectGoogle} className="mt-6">
                        <ExternalLink className="mr-2 h-4 w-4" /> Conectar com Google Drive
                    </Button>
                )}

                 <p className="text-xs text-gray-400 mt-4">Essa ação irá solicitar permissão para acessar seu Google Drive.</p>
            </motion.div>
        </div>
    );
};

export default Onboarding;
