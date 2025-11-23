
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/hooks/useCart';
import CrmLayout from '@/components/layout/CrmLayout';
import StoreLayout from '@/pages/StoreLayout';
import ProductDetailPage from '@/pages/ProductDetailPage';
import SuccessPage from '@/pages/SuccessPage';
import Login from '@/pages/Login';
import LandingPage from '@/pages/LandingPage';
import Register from '@/pages/Register';
import PublicCadastroPage from '@/pages/PublicCadastroPage';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Navigate } from 'react-router-dom';

const LoadingScreen = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-wg-gray-light">
      <div className='text-center'>
          <img
            src="https://horizons-cdn.hostinger.com/480e77e6-d3aa-4ba8-aa6c-70d9820f550f/grupowgalmeida_png-mXTto.png"
            alt="Logo"
            className="h-28 mx-auto mb-4"
          />
      </div>
  </div>
);

const App = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title>CRM Grupo WG Almeida - Gestão Completa</title>
        <meta name="description" content="Sistema CRM completo para gestão de obras, marcenaria e loja online do Grupo WG Almeida" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Bahnschrift:wght@300;400&display=swap" rel="stylesheet" />
      </Helmet>
      
      <CartProvider>
        <Routes>
          <Route path="/store" element={<StoreLayout />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/success" element={<SuccessPage />} />

          {!session ? (
            <>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cadastro/:type/novo" element={<PublicCadastroPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <Route path="/*" element={<CrmLayout />} />
          )}
        </Routes>
      </CartProvider>
      
      <Toaster />
    </>
  );
}

export default App;
