import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const IntegrationCard = ({ icon, title, description, connected, onConnect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-effect rounded-2xl p-6 flex flex-col items-start"
    >
      <div className="flex-shrink-0 mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6 flex-grow">{description}</p>
      {connected ? (
        <div className="flex items-center gap-2 text-green-600 font-semibold w-full justify-center">
          <CheckCircle size={20} />
          <span>Conectado</span>
        </div>
      ) : (
        <Button onClick={onConnect} className="w-full gradient-primary text-white">
          Conectar
        </Button>
      )}
    </motion.div>
  );
};

const GoogleWorkspaceIcon = () => (
    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-100">
        <img alt="Google Drive Logo" className="h-8 w-8" src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png" />
    </div>
);

const IntegrationsPage = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useLocalStorage('crm_integrations', {
      googleDriveConnected: false,
  });

  const handleConnectGoogle = () => {
    toast({
      title: 'Conectando com Google Drive...',
      description: "Você será redirecionado para autorizar o acesso.",
    });
    
    // Simulação de uma conexão
    setTimeout(() => {
        setIntegrations(prev => ({...prev, googleDriveConnected: true}));
        toast({
            title: 'Google Drive Conectado! 🚀',
            description: "Agora você pode gerenciar seus arquivos.",
            className: "bg-green-500 text-white"
        });
    }, 2000);
  };

  return (
    <>
      <Helmet>
        <title>Integrações - CRM Moma</title>
        <meta name="description" content="Conecte suas ferramentas e automatize seus fluxos de trabalho." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent gradient-primary">
          Integrações
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Potencialize seu CRM conectando suas ferramentas favoritas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <IntegrationCard
            icon={<GoogleWorkspaceIcon />}
            title="Google Drive"
            description="Sincronize arquivos de propostas, contratos e documentos de obra diretamente com as pastas dos seus clientes no Google Drive."
            connected={integrations.googleDriveConnected}
            onConnect={handleConnectGoogle}
          />
        </div>
      </motion.div>
    </>
  );
};

export default IntegrationsPage;