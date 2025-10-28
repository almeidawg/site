
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, Building, CreditCard, Ship, UserCheck, 
    ChevronRight, Info, Construction, FileSignature, 
    Star, Users, Shield, TrendingUp, BookOpen, Banknote, List, Building2,
    Loader2, Search, Save, Upload, Plus, Trash, Package, Edit
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import GerenciarModelosContrato from '@/components/contratos/GerenciarModelosContrato';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const PlaceholderContent = ({ title, icon: Icon }) => {
    const { toast } = useToast();
    const handleNotImplemented = () => {
        toast({
            title: '🚧 Em Construção!',
            description: 'Esta área de configuração está sendo preparada e será liberada em breve.',
        });
    };

    return (
        <div className="text-center p-8 bg-white/50 rounded-2xl shadow-inner min-h-[400px] flex flex-col justify-center items-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                <Icon className="text-wg-gray-medium" size={40} />
            </div>
            <h3 className="text-xl font-bold mt-4 text-gray-800">
                Gerenciar {title}
            </h3>
            <p className="text-wg-gray-medium mt-2 max-w-md mx-auto">
                Selecione um item no menu à esquerda para começar a configurar os parâmetros de <span className="font-semibold text-primary">{title}</span> está em desenvolvimento.
            </p>
            <div className="mt-6">
                <Button
                    onClick={handleNotImplemented}
                    className="bg-primary text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-primary/90 transition-all"
                >
                    Aguarde Novidades
                </Button>
            </div>
        </div>
    );
};

const SimpleListManager = ({ title, table, placeholder, column = 'nome' }) => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await supabase.from(table).select(`id, ${column}`);
        if(error) {
            toast({ title: `Erro ao buscar ${title}`, variant: 'destructive'});
        } else {
            setItems(data);
        }
        setLoading(false);
    }
    useEffect(() => { fetchItems() }, []);


    const handleAddItem = async () => {
        if (!newItem.trim()) return;
        const { data, error } = await supabase.from(table).insert({ [column]: newItem.trim() }).select().single();
        if(error) {
            toast({ title: `Erro ao adicionar item`, variant: 'destructive'});
        } else {
            setItems(prev => [...prev, data]);
            setNewItem('');
            toast({ title: `"${newItem}" adicionado!` });
        }
    };

    const handleDeleteItem = async (id) => {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if(error) {
            toast({ title: 'Erro ao remover item', variant: 'destructive' });
        } else {
            setItems(prev => prev.filter(item => item.id !== id));
            toast({ title: 'Item removido!', variant: 'destructive' });
        }
    };

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Gerenciar {title}</h3>
            <div className="flex gap-2 mb-4">
                <Input
                    placeholder={placeholder}
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                />
                <Button onClick={handleAddItem}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-2">
                {loading && <Loader2 className="animate-spin" />}
                {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-white/80 rounded-lg">
                        <span>{item[column]}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                            <Trash className="h-4 w-4 text-red-500"/>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};


const PricelistManager = () => {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [produtoToEdit, setProdutoToEdit] = useState(null);
    const [formData, setFormData] = useState({ nome: '', descricao: '', unidade: '', valor_unitario: '', categoria: '', imagem_url: '', markup_percent: 0 });
    const { toast } = useToast();

    const fetchProdutos = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('produtos_servicos').select('*').order('created_at', { ascending: false });
        if (error) {
            toast({ title: "Erro ao buscar produtos", description: error.message, variant: 'destructive' });
        } else {
            setProdutos(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProdutos();
    }, []);

    useEffect(() => {
        if (produtoToEdit) {
            setFormData({
                nome: produtoToEdit.nome || '',
                descricao: produtoToEdit.descricao || '',
                unidade: produtoToEdit.unidade || '',
                valor_unitario: produtoToEdit.valor_unitario || '',
                categoria: produtoToEdit.categoria || '',
                imagem_url: produtoToEdit.imagem_url || '',
                markup_percent: produtoToEdit.markup_percent || 0,
            });
            setIsFormOpen(true);
        } else {
            setFormData({ nome: '', descricao: '', unidade: '', valor_unitario: '', categoria: '', imagem_url: '', markup_percent: 0 });
        }
    }, [produtoToEdit]);
    
    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.nome || !formData.valor_unitario) {
            toast({ title: 'Campos obrigatórios', description: 'Nome e Valor Unitário são necessários.', variant: 'destructive' });
            return;
        }

        const upsertData = { ...formData, valor_unitario: parseFloat(formData.valor_unitario), markup_percent: parseFloat(formData.markup_percent || 0) };
        if (produtoToEdit) {
            upsertData.id = produtoToEdit.id;
        } else {
            delete upsertData.id;
        }

        const { data, error } = await supabase.from('produtos_servicos').upsert(upsertData).select().single();

        if (error) {
            toast({ title: "Erro ao salvar", description: error.message, variant: 'destructive' });
        } else {
            toast({ title: produtoToEdit ? "Produto atualizado!" : "Produto criado!" });
            setIsFormOpen(false);
            setProdutoToEdit(null);
            fetchProdutos(); // Refresca a lista
        }
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('produtos_servicos').delete().eq('id', id);
        if (error) {
            toast({ title: "Erro ao excluir", description: error.message, variant: 'destructive' });
        } else {
            toast({ title: "Produto excluído!", variant: 'destructive' });
            fetchProdutos();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Gerenciar Produtos e Serviços (Pricelist)</h3>
                <Button onClick={() => { setProdutoToEdit(null); setIsFormOpen(!isFormOpen); }}>
                    <Plus className="mr-2 h-4 w-4" /> {isFormOpen ? 'Fechar' : 'Novo Item'}
                </Button>
            </div>
            
            <AnimatePresence>
            {isFormOpen && (
                <motion.form 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleSave} 
                    className="p-4 border rounded-lg bg-white/70 mb-6 space-y-4"
                >
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do Produto/Serviço</Label>
                            <Input id="nome" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required/>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="categoria">Categoria</Label>
                            <Input id="categoria" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} placeholder="Ex: Serviços Preliminares"/>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea id="descricao" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="imagem_url">URL da Imagem</Label>
                        <Input id="imagem_url" name="imagem_url" value={formData.imagem_url} onChange={e => setFormData({...formData, imagem_url: e.target.value})} placeholder="https://..."/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="unidade">Unidade</Label>
                            <Input id="unidade" value={formData.unidade} onChange={e => setFormData({...formData, unidade: e.target.value})} placeholder="un, m², vb"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="valor">Valor Custo (R$)</Label>
                            <Input id="valor" type="number" step="0.01" value={formData.valor_unitario} onChange={e => setFormData({...formData, valor_unitario: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="markup">Markup (%)</Label>
                            <Input id="markup" type="number" step="0.01" value={formData.markup_percent} onChange={e => setFormData({...formData, markup_percent: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setProdutoToEdit(null); }}>Cancelar</Button>
                        <Button type="submit"><Save className="mr-2 h-4 w-4"/> Salvar</Button>
                    </div>
                </motion.form>
            )}
            </AnimatePresence>
            
            <div className="space-y-2">
                {loading ? <Loader2 className="animate-spin" /> : produtos.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-white/80 rounded-lg">
                        <div className="flex items-center gap-4">
                            {p.imagem_url && <img src={p.imagem_url} alt={p.nome} className="w-16 h-16 object-cover rounded-md" />}
                            <div>
                                <p className="font-semibold">{p.nome} <span className="text-xs text-muted-foreground font-normal">({p.unidade})</span></p>
                                <p className="text-sm">Custo: {parseFloat(p.valor_unitario).toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</p>
                                <p className="text-sm font-bold text-primary">Venda: {parseFloat(p.valor_venda).toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="ghost" size="icon" onClick={() => setProdutoToEdit(p)}><Edit className="h-4 w-4" /></Button>
                             <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash className="h-4 w-4 text-red-500" /></Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BancosManager = () => {
    const { toast } = useToast();
    const handleNotImplemented = () => {
        toast({
            title: '🚧 Em Construção!',
            description: 'Esta área de configuração está sendo preparada e será liberada em breve.',
        });
    };
    return (
         <div className="text-center p-8 bg-white/50 rounded-2xl shadow-inner min-h-[400px] flex flex-col justify-center items-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                <CreditCard className="text-wg-gray-medium" size={40} />
            </div>
            <h3 className="text-xl font-bold mt-4 text-gray-800">
                Gerenciar Contas e Bancos
            </h3>
            <p className="text-wg-gray-medium mt-2 max-w-md mx-auto">
                Cadastre aqui as contas bancárias da sua empresa. Elas serão usadas como "Conta de Saída" nos lançamentos financeiros.
            </p>
            <div className="mt-6">
                <Button
                    onClick={handleNotImplemented}
                    className="bg-primary text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-primary/90 transition-all"
                >
                    Aguarde Novidades
                </Button>
            </div>
        </div>
    );
}

const InformacoesEmpresa = () => {
    const [empresas, setEmpresas] = useLocalStorage('crm_empresas_cadastradas', []);
    const [cnpj, setCnpj] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleBuscaCnpj = async () => {
        const sanitizedCnpj = cnpj.replace(/\D/g, '');
        if (sanitizedCnpj.length !== 14) {
            toast({ title: "CNPJ inválido", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${sanitizedCnpj}`);
            if (!response.ok) throw new Error('Empresa não encontrada ou CNPJ inválido.');
            const data = await response.json();
            
            const novaEmpresa = {
                id: `emp_${Date.now()}`,
                cnpj: data.cnpj,
                razao_social: data.razao_social,
                nome_fantasia: data.nome_fantasia,
                data_inicio_atividade: data.data_inicio_atividade,
                logradouro: data.logradouro,
                numero: data.numero,
                complemento: data.complemento,
                bairro: data.bairro,
                cep: data.cep,
                municipio: data.municipio,
                uf: data.uf,
            };

            setEmpresas(prev => [...prev.filter(e => e.cnpj !== novaEmpresa.cnpj), novaEmpresa]);
            toast({ title: "Empresa adicionada!" });
            setCnpj('');

        } catch (error) {
            toast({ title: "Erro ao buscar CNPJ", description: error.message, variant: "destructive" });
        }
        setLoading(false);
    };

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Gerenciar Informações da Empresa</h3>
            <p className="text-wg-gray-medium mb-6">Adicione as empresas do seu grupo para usar como 'Contratada' nos documentos.</p>
            
            <div className="flex gap-2 mb-8">
                <Input 
                    placeholder="Digite o CNPJ e clique em buscar"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                />
                <Button onClick={handleBuscaCnpj} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <Search />}
                </Button>
            </div>

            <div className="space-y-4">
                <h4 className="font-semibold">Empresas Cadastradas</h4>
                {empresas.length > 0 ? (
                    empresas.map(empresa => (
                        <div key={empresa.id} className="p-4 border rounded-lg bg-white/70">
                            <p className="font-bold">{empresa.razao_social}</p>
                            <p className="text-sm text-wg-gray-medium">{empresa.cnpj}</p>
                            <p className="text-sm">{empresa.logradouro}, {empresa.numero} - {empresa.bairro}, {empresa.municipio} - {empresa.uf}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-center text-wg-gray-medium py-4">Nenhuma empresa cadastrada.</p>
                )}
            </div>
        </div>
    )
}

const Configuracoes = () => {
    const [activeMenu, setActiveMenu] = useState('comercial');
    const [activeSubMenu, setActiveSubMenu] = useState('Produtos e Serviços');

    const menuItems = {
        gerais: {
            label: 'Gerais',
            icon: Info,
            submenus: {
                'Informações da Empresa': { icon: Building2, component: <InformacoesEmpresa /> },
                'Criação e Alteração de Contratos': { icon: FileSignature, component: <GerenciarModelosContrato /> },
            }
        },
        comercial: {
            label: 'Comercial',
            icon: Briefcase,
            submenus: {
                'Produtos e Serviços': { icon: Package, component: <PricelistManager /> },
                'Procedência de Clientes': { icon: Star, component: <SimpleListManager title="Procedência de Clientes" table="procedencia_clientes" placeholder="Ex: Indicação Arquiteto"/> },
                'Equipes': { icon: Users, component: <SimpleListManager title="Equipes de Venda" table="equipes_venda" placeholder="Ex: Equipe Alpha"/> },
                'Motivos de Perdas': { icon: TrendingUp, component: <PlaceholderContent title="Motivos de Perdas" icon={TrendingUp} /> },
            }
        },
        usuarios: {
            label: 'Usuários e Acessos',
            icon: UserCheck,
            submenus: {
                'Cargos e Permissões': { icon: Shield, component: <PlaceholderContent title="Cargos e Permissões" icon={Shield} /> },
                'Comissões': { icon: Banknote, component: <PlaceholderContent title="Comissões" icon={Banknote} /> },
            }
        },
        financeiro: {
            label: 'Financeiro',
            icon: Banknote,
            submenus: {
                'Contas e Bancos': { icon: CreditCard, component: <BancosManager /> },
                'Plano de Contas': { icon: BookOpen, component: <PlaceholderContent title="Plano de Contas" icon={BookOpen} /> },
                'Categorias': { icon: List, component: <SimpleListManager title="Categorias Financeiras" table="categorias_fin" placeholder="Ex: Material de Obra" /> },
            }
        },
        logistica: {
            label: 'Logística',
            icon: Ship,
            submenus: {
                'Transportadoras': { icon: Ship, component: <PlaceholderContent title="Transportadoras" icon={Ship} /> },
            }
        },
    };

    const renderContent = () => {
        return menuItems[activeMenu]?.submenus[activeSubMenu]?.component || <div />;
    };

    return (
        <div className="min-h-[calc(100vh-8rem)]">
            <div className="mb-6">
                 <h1>Configurações do Sistema</h1>
                 <p className="text-wg-gray-medium mt-1">Parametrize e ajuste o CRM para as necessidades da sua empresa.</p>
            </div>
           
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-gray-200/80">
                    <h2 className="text-lg font-semibold p-2 mb-2">Módulos</h2>
                    <ul>
                        {Object.entries(menuItems).map(([key, item]) => (
                            <li key={key}>
                                <button 
                                    onClick={() => { setActiveMenu(key); setActiveSubMenu(Object.keys(item.submenus)[0]); }}
                                    className={`w-full text-left flex items-center justify-between p-3 rounded-lg transition-all ${activeMenu === key ? 'bg-gray-200/70 text-primary font-bold' : 'hover:bg-gray-200/50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} />
                                        <span>{item.label}</span>
                                    </div>
                                    <ChevronRight size={16} className={`transition-transform ${activeMenu === key ? 'rotate-90' : ''}`} />
                                </button>
                                <AnimatePresence>
                                {activeMenu === key && (
                                    <motion.ul
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="ml-6 mt-1 border-l-2 border-gray-200"
                                    >
                                        {Object.keys(item.submenus).map(submenuKey => (
                                            <li key={submenuKey}>
                                                <button 
                                                    onClick={() => setActiveSubMenu(submenuKey)}
                                                    className={`w-full text-left px-4 py-2 text-sm rounded-r-lg ${activeSubMenu === submenuKey ? 'text-primary font-semibold' : 'text-gray-600 hover:text-primary'}`}
                                                >
                                                    {submenuKey}
                                                </button>
                                            </li>
                                        ))}
                                    </motion.ul>
                                )}
                                </AnimatePresence>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="md:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSubMenu}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-gray-200/80"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Configuracoes;
