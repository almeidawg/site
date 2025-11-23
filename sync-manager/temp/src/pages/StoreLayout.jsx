import React from 'react';
import Header from '@/components/layout/Header';
import ProductsList from '@/components/ProductsList';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const StoreLayout = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleEditStore = () => {
    toast({
      title: 'Edite sua loja!',
      description: 'Vá para a gaveta "Loja Online" para adicionar e editar produtos, pagamentos e métodos de envio.',
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header user={user} isStore={true} />
      <main className="p-6 lg:p-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8"
        >
          <div>
            <Link to="/dashboard" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-2">
              <ChevronLeft size={18} />
              Voltar ao CRM
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Nossa Loja
            </h1>
            <p className="mt-2 text-lg text-gray-400">
              Descubra nossos produtos exclusivos de marcenaria e design.
            </p>
          </div>
          <Button
            onClick={handleEditStore}
            className="mt-4 md:mt-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg"
          >
            Editar Loja
          </Button>
        </motion.div>
        
        <ProductsList />
      </main>
    </div>
  );
};

// A dummy button component to avoid errors if the real one isn't available
const Button = ({ children, ...props }) => <button {...props}>{children}</button>;

export default StoreLayout;