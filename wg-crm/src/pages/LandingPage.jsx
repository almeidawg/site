import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Building2, HardHat, Hammer, Zap, Eye, EyeOff, Loader2 } from 'lucide-react';

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


  return (
    <div className="min-h-screen bg-white">
      {/* Header Minimalista */}
      <header className="fixed top-0 left-0 right-0 z-10 px-8 py-6 bg-white/80 backdrop-blur-sm">
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
      <div className="flex min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Side - Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-12">
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="text-gray-900">Arquitetura.</span>
                <span className="block mt-2 text-gray-900">Engenharia.</span>
                <span className="block mt-2 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                  Marcenaria.
                </span>
              </h1>

              <div className="space-y-4">
                <p className="text-2xl text-gray-600 font-light">
                  Uma plataforma integrada.
                </p>
                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                  Do orçamento à entrega, controle total do seu negócio.
                </p>
              </div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-16 pt-8 border-t border-gray-200"
            >
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-1">R$ 2.8M+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Oportunidades ativas</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-1">R$ 193K</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Projetos em andamento</div>
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
              <div className="bg-white rounded-xl border border-gray-200 p-10 space-y-6">
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-bold text-gray-900">Entrar</h3>
                  <p className="text-gray-400 text-sm">Acesse sua conta</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Senha</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold text-base shadow-lg shadow-orange-500/30"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>

                <div className="text-center space-y-4">
                  <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                    Esqueceu sua senha?
                  </button>

                  <div className="pt-4 border-t border-gray-100">
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
