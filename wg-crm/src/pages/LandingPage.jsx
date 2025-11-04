import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Building2, HardHat, Hammer, Zap, Eye, EyeOff, Loader2 } from 'lucide-react';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login realizado!",
        description: "Bem-vindo ao WG CRM",
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error) {
      toast({
        title: "Erro no login com Google",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen bg-white">
      {/* Header Minimalista */}
      <header className="fixed top-0 left-0 right-0 z-10 px-4 sm:px-8 py-4 sm:py-6 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WG</span>
            </div>
            <span className="text-sm font-medium text-gray-900">Grupo WG Almeida</span>
          </motion.div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500"
          >
            easy wg
          </motion.span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-screen pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left Side - Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-6 sm:space-y-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="text-gray-900">Arquitetura.</span>
                <span className="block mt-1 sm:mt-2 text-gray-900">Engenharia.</span>
                <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                  Marcenaria.
                </span>
              </h1>

              <div className="space-y-3 sm:space-y-4">
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light">
                  Uma plataforma integrada.
                </p>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
                  Do orçamento à entrega, controle total do seu negócio.
                </p>
              </div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-6 sm:gap-12 md:gap-16 pt-6 sm:pt-8 border-t border-gray-200"
            >
              <div>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-1">R$ 2.8M+</div>
                <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Oportunidades ativas</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">R$ 193K</div>
                <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">Projetos em andamento</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 md:p-10 space-y-5 sm:space-y-6">
                <div className="text-center space-y-2 sm:space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Entrar</h3>
                  <p className="text-gray-400 text-sm">Acesse sua conta</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 sm:h-12"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-sm font-medium text-gray-700">Senha</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 sm:h-12 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 sm:h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-orange-500/30"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full h-11 sm:h-12 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-semibold text-sm sm:text-base"
                >
                  <GoogleIcon />
                  <span className="ml-2">Continuar com Google</span>
                </Button>

                <div className="text-center space-y-3 sm:space-y-4">
                  <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                    Esqueceu sua senha?
                  </button>

                  <div className="pt-3 sm:pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Teste: <span className="font-mono text-orange-600">admin@wg.com</span> / <span className="font-mono text-orange-600">senha123</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-center"
              >
                <p className="text-xs text-gray-300">Conexão segura</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
