import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const SuccessPage = () => {
  return (
    <>
      <Helmet>
        <title>Compra Realizada com Sucesso!</title>
        <meta name="description" content="Página de confirmação de compra." />
      </Helmet>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-full max-w-md text-center glass-card-dark p-8 rounded-2xl shadow-2xl"
        >
          <CheckCircle className="mx-auto h-20 w-20 text-green-400 mb-6" />
          <h1 className="text-3xl font-bold mb-3">Pagamento Aprovado!</h1>
          <p className="text-gray-300 mb-8">
            Obrigado pela sua compra! Seu pedido foi recebido e está sendo processado. Você receberá um e-mail de confirmação em breve.
          </p>
          <Link
            to="/store"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg transition-all"
          >
            <ArrowLeft size={18} />
            Voltar para a Loja
          </Link>
        </motion.div>
      </div>
    </>
  );
};

export default SuccessPage;