import React, { useState } from 'react';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Link, useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Loader2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    const Login = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);
        const { signIn, loading: authLoading } = useAuth();
        const { toast } = useToast();
        const navigate = useNavigate();

        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsSubmitting(true);

            const { error } = await signIn(email, password);

            if (error) {
                toast({
                    title: 'Falha no login',
                    description: error.message === 'Invalid login credentials' ? 'E-mail ou senha inválidos.' : error.message,
                    variant: 'destructive',
                });
            } else {
                toast({ title: 'Login bem-sucedido!', description: 'Bem-vindo de volta! Redirecionando...' });
                navigate('/');
            }
            
            setIsSubmitting(false);
        };

        const isLoading = isSubmitting || authLoading;

        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-md mx-auto overflow-hidden bg-white rounded-2xl shadow-xl">
                    <div className="p-8">
                         <div className="flex justify-center mb-6">
                            <img src="https://horizons-cdn.hostinger.com/480e77e6-d3aa-4ba8-aa6c-70d9820f550f/grupowgalmeida_png-mXTto.png" alt="Logo" className="h-16" />
                        </div>
                        <h2 className="text-2xl font-bold text-center text-gray-800">Acesse sua conta</h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Ainda não tem uma conta?{' '}
                            <Link to="/register" className="font-medium text-purple-600 hover:text-purple-500">
                                Cadastre-se
                            </Link>
                        </p>
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4 rounded-md shadow-sm">
                                <div>
                                    <Label htmlFor="email-address">Email</Label>
                                    <Input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="password">Senha</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Sua senha"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div>
                                <Button type="submit" className="w-full gradient-primary text-white" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Entrar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    export default Login;