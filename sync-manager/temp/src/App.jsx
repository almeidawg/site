import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/hooks/useCart';
import CrmLayout from '@/components/layout/CrmLayout';
import StoreLayout from '@/pages/StoreLayout';
import ProductDetailPage from '@/pages/ProductDetailPage';
import SuccessPage from '@/pages/SuccessPage';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import PublicCadastroPage from '@/pages/PublicCadastroPage';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Onboarding from '@/components/pages/Onboarding';

const LoadingScreen = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className='text-center'>
          <img 
            src="https://horizons-cdn.hostinger.com/480e77e6-d3aa-4ba8-aa6c-70d9820f550f/grupowgalmeida_png-mXTto.png" 
            alt="Logo" 
            className="h-28 mx-auto mb-4"
          />
      </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { session, loading, profile } = useAuth();
  const location = useLocation();
  const isFirstLogin = !profile?.nome || !profile?.empresa_id;

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (session && isFirstLogin && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

const App = () => {
  const { session, loading, profile } = useAuth();
  const isFirstLogin = profile && (!profile.nome || !profile.empresa_id);

  if (loading && !session) {
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
          <Route path="/login" element={session ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={session ? <Navigate to="/" /> : <Register />} />
          <Route path="/cadastro/:type/novo" element={<PublicCadastroPage />} />
          
          <Route 
            path="/onboarding"
            element={ session && isFirstLogin ? <Onboarding /> : <Navigate to="/" /> }
          />
          
          <Route path="/*" element={<PrivateRoute><CrmLayout /></PrivateRoute>} />
          
          {/* Rotas legadas da loja, podem ser removidas ou integradas ao CrmLayout se necessário */}
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </CartProvider>
      
      <Toaster />
    </>
  );
}

export default App;