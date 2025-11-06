import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const PublicCadastroPage = () => {
    const { type } = useParams();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { toast } = useToast();

    const getStorageKey = () => {
        switch (type) {
            case 'cliente': return 'crm_leads';
            case 'colaborador': return 'crm_colaboradores';
            case 'fornecedor': return 'crm_fornecedores';
            default: return null;
        }
    };

    const storageKey = getStorageKey();
    const [items, setItems] = useLocalStorage(storageKey, []);
    
    const [formData, setFormData] = useState({ nome: '', email: '', telefone: '' });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    if (!storageKey || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <XCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h1 className="mt-4 text-2xl font-bold text-gray-900">Link Inválido</h1>
                    <p className="mt-2 text-gray-600">O link de cadastro que você tentou acessar é inválido ou expirou.</p>
                </div>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('loading');

        setTimeout(() => {
            const newItem = {
                id: `${type}-${Date.now()}`,
                ...formData,
                status: 'pendente_validacao',
                data_criacao: new Date().toISOString(),
            };
            setItems(prev => [newItem, ...prev]);
            setStatus('success');
            toast({
                title: 'Cadastro enviado com sucesso!',
                description: 'Seus dados foram enviados e aguardam validação pela nossa equipe.',
            });
        }, 1500);
    };

    const pageTitle = `Cadastro de ${type.charAt(0).toUpperCase() + type.slice(1)}`;

    if (status === 'success') {
        return (
             <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <h1 className="mt-4 text-2xl font-bold text-gray-900">Obrigado!</h1>
                    <p className="mt-2 text-gray-600">Seu cadastro foi recebido e em breve será validado por nossa equipe.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
                    <p className="text-muted-foreground mt-2">Preencha os campos abaixo para completar seu cadastro.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input id="nome" value={formData.nome} onChange={handleInputChange} required />
                    </div>
                     <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                     <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input id="telefone" value={formData.telefone} onChange={handleInputChange} required />
                    </div>
                    <Button type="submit" className="w-full gradient-primary text-white" disabled={status === 'loading'}>
                        {status === 'loading' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            'Enviar Cadastro'
                        )}
                    </Button>
                </form>
            </div>
             <footer className="mt-8 text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Moma. Potencializado por Hostinger Horizons.
            </footer>
        </div>
    );
};

export default PublicCadastroPage;