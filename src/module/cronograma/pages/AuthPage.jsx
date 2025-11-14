
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const AuthPage = () => {
    const { signIn, signUp } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { error } = isLoginView ? await signIn({ email, password }) : await signUp({ email, password });
            if (error) {
                throw error;
            }
            toast({
                title: isLoginView ? 'Login bem-sucedido!' : 'Cadastro realizado!',
                description: isLoginView ? 'Bem-vindo de volta!' : 'Confirme seu e-mail para continuar.',
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Falha na autenticação",
                description: error.message || "Verifique suas credenciais e tente novamente.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Acesso - WGEasy Cronograma</title>
            </Helmet>
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 border">
                    <div className="text-center">
                        <img src="/logo_grupo_wg_almeida.png" alt="Grupo WG Almeida" className="h-20 object-contain mx-auto mb-4" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {isLoginView ? 'Bem-vindo!' : 'Crie sua Conta'}
                        </h1>
                        <p className="text-slate-600 mt-2">
                            {isLoginView ? 'Acesse para gerenciar seus projetos.' : 'Preencha para começar a usar.'}
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
                        </div>
                        <div>
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-500/30" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoginView ? 'Entrar' : 'Cadastrar'}
                        </Button>
                    </form>
                    <p className="text-center text-sm text-slate-600">
                        {isLoginView ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                        <Button variant="link" onClick={() => setIsLoginView(!isLoginView)} className="font-semibold text-blue-600">
                            {isLoginView ? 'Cadastre-se' : 'Faça login'}
                        </Button>
                    </p>
                </div>
            </div>
        </>
    );
};

export default AuthPage;
