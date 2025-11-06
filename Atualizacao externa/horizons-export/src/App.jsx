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
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className='text-center flex flex-col items-center gap-4'>
          <img 
            src="https://horizons-cdn.hostinger.com/480e77e6-d3aa-4ba8-aa6c-70d9820f550f/grupowgalmeida_png-mXTto.png" 
            alt="Logo Grupo WG Almeida" 
            className="h-24 mx-auto"
          />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando sistema...</p>
      </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { session, loading, isFirstLogin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (isFirstLogin && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If user is logged in, has a complete profile, but tries to access onboarding, redirect them to dashboard.
  if (!isFirstLogin && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const { session, loading } = useAuth();

  return (
    <>
      <Helmet>
        <title>CRM Grupo WG Almeida - Gestão Completa</title>
        <meta name="description" content="Sistema CRM completo para gestão de obras, marcenaria e loja online do Grupo WG Almeida" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>
      
      <CartProvider>
        <Routes>
          <Route path="/login" element={session ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={session ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/cadastro/:type/novo" element={<PublicCadastroPage />} />
          
          <Route 
            path="/*" 
            element={
              <PrivateRoute>
                <CrmLayout />
              </PrivateRoute>
            } 
          />
        </Routes>
      </CartProvider>
      
      <Toaster />
    </>
  );
}

export default App;