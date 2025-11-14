import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await signUp(formData.email, formData.password, formData.name);

        if (!error) {
            setSubmitted(true);
            toast({
                title: 'Verificação Necessária',
                description: 'Confirme seu e-mail para continuar. Um administrador aprovará seu acesso em breve.',
            });
        } else {
             toast({
                title: 'Erro no Cadastro',
                description: error.message,
                variant: 'destructive',
            });
        }
        
        setLoading(false);
    };

    if (submitted) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
                    <Mail className="mx-auto h-12 w-12 text-purple-600" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">Verifique seu E-mail!</h2>
                    <p className="mt-2 text-gray-600">
                        Enviamos um link de confirmação para o seu e-mail.
                    </p>
                    <div className="mt-6 bg-amber-100/60 border border-amber-200 text-amber-800 text-sm p-4 rounded-lg flex items-start gap-3">
                         <ShieldCheck className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>Após a confirmação, um administrador irá revisar e aprovar seu cadastro para liberar o acesso.</span>
                    </div>
                    <Button onClick={() => navigate('/login')} className="mt-6 w-full gradient-primary text-white">
                        Voltar para o Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md mx-auto overflow-hidden bg-white rounded-2xl shadow-xl">
                <div className="p-8">
                     <div className="flex justify-center mb-6">
                        <img src="https://horizons-cdn.hostinger.com/480e77e6-d3aa-4ba8-aa6c-70d9820f550f/grupowgalmeida_png-mXTto.png" alt="Logo" className="h-16" />
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-800">Criar nova conta</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                            Faça login
                        </Link>
                    </p>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4 rounded-md">
                            <div>
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input id="name" type="text" required onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Seu nome completo"/>
                            </div>
                            <div>
                                <Label htmlFor="email-address">Email</Label>
                                <Input id="email-address" type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="seu@email.com"/>
                            </div>
                            <div>
                                <Label htmlFor="password">Senha</Label>
                                <Input id="password" type="password" required minLength="8" onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Crie uma senha forte"/>
                                <p className="text-xs text-muted-foreground mt-1.5">Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.</p>
                            </div>
                        </div>

                        <div>
                            <Button type="submit" className="w-full gradient-primary text-white" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Cadastrar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;