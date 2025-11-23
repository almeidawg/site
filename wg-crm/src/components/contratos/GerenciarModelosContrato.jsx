
import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash, Edit, Save, FileSignature, Info, Building, HardHat, Construction } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';

const placeholders = [
  '{{pessoa.nome}}', '{{pessoa.cpf_cnpj}}', '{{pessoa.email}}', '{{pessoa.telefone}}',
  '{{pessoa.logradouro}}', '{{pessoa.numero}}', '{{pessoa.complemento}}', '{{pessoa.bairro}}',
  '{{pessoa.cidade}}', '{{pessoa.estado}}', '{{pessoa.cep}}'
];

const tipoServicoStyles = {
    arquitetura: 'bg-wg-arquitetura/20 text-wg-arquitetura',
    engenharia: 'bg-wg-engenharia/20 text-wg-engenharia',
    marcenaria: 'bg-wg-marcenaria/20 text-wg-marcenaria',
};

const GerenciarModelosContrato = () => {
    const [modelos, setModelos] = useLocalStorage('crm_contratos_modelos', []);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [currentModel, setCurrentModel] = useState({ title: '', content: '', tipo: '' });
    const { toast } = useToast();

    const handleSave = () => {
        if (!currentModel.title || !currentModel.content || !currentModel.tipo) {
            toast({ title: 'Campos obrigatórios', description: 'Título, tipo e conteúdo são necessários.', variant: 'destructive' });
            return;
        }

        if (editingId) {
            setModelos(modelos.map(m => m.id === editingId ? { ...m, ...currentModel } : m));
            toast({ title: 'Modelo atualizado!' });
            setEditingId(null);
        } else {
            const newModel = { id: `modelo-${Date.now()}`, ...currentModel };
            setModelos([...modelos, newModel]);
            toast({ title: 'Novo modelo salvo!' });
        }
        resetForm();
    };

    const handleEdit = (modelo) => {
        setIsCreating(false);
        setEditingId(modelo.id);
        setCurrentModel({ title: modelo.title, content: modelo.content, tipo: modelo.tipo });
    };

    const handleDelete = (id) => {
        setModelos(modelos.filter(m => m.id !== id));
        toast({ title: 'Modelo excluído!', variant: 'destructive' });
    };

    const resetForm = () => {
        setIsCreating(false);
        setEditingId(null);
        setCurrentModel({ title: '', content: '', tipo: '' });
    };

    const isEditingOrCreating = isCreating || editingId !== null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Gerenciar Modelos de Contrato</h3>
                {!isEditingOrCreating && (
                    <Button onClick={() => setIsCreating(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Novo Modelo
                    </Button>
                )}
            </div>

            {isEditingOrCreating && (
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-effect rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-center">{editingId ? 'Editando Modelo' : 'Novo Modelo de Contrato'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="model-title">Título do Modelo</Label>
                            <Input
                                id="model-title"
                                placeholder="Ex: Contrato de Marcenaria Padrão"
                                value={currentModel.title}
                                onChange={(e) => setCurrentModel({ ...currentModel, title: e.target.value })}
                                className="text-center"
                            />
                        </div>
                        <div>
                            <Label htmlFor="model-type">Tipo de Serviço</Label>
                             <Select onValueChange={(value) => setCurrentModel({ ...currentModel, tipo: value })} value={currentModel.tipo}>
                                <SelectTrigger id="model-type">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="arquitetura"><div className="flex items-center gap-2"><Building size={16} className="text-wg-arquitetura"/> Arquitetura</div></SelectItem>
                                    <SelectItem value="engenharia"><div className="flex items-center gap-2"><HardHat size={16} className="text-wg-engenharia"/> Engenharia</div></SelectItem>
                                    <SelectItem value="marcenaria"><div className="flex items-center gap-2"><Construction size={16} className="text-wg-marcenaria"/> Marcenaria</div></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="model-content">Conteúdo do Modelo</Label>
                        <Textarea
                            id="model-content"
                            placeholder="Insira o texto do contrato aqui. Use as variáveis dinâmicas abaixo."
                            value={currentModel.content}
                            onChange={(e) => setCurrentModel({ ...currentModel, content: e.target.value })}
                            className="h-64 font-mono text-justify"
                        />
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold text-blue-800">Variáveis Dinâmicas Disponíveis</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {placeholders.map(p => (
                                <code key={p} className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded">{p}</code>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                        <Button onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" /> Salvar
                        </Button>
                    </div>
                </motion.div>
            )}

            <div className="space-y-4">
                {modelos.length === 0 && !isEditingOrCreating ? (
                    <div className="text-center py-12 glass-effect rounded-xl">
                        <FileSignature className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-4 text-muted-foreground">Nenhum modelo de contrato cadastrado.</p>
                        <p className="text-sm text-gray-500">Clique em "Novo Modelo" para começar.</p>
                    </div>
                ) : (
                    modelos.map((modelo, index) => (
                        <motion.div
                            key={modelo.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-200"
                        >
                            <p className="font-medium">{modelo.title}</p>
                            <div className="flex gap-2 items-center">
                               <span className={cn('text-xs font-semibold uppercase px-2 py-1 rounded-md', tipoServicoStyles[modelo.tipo] || 'bg-gray-200')}>
                                {modelo.tipo}
                               </span>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(modelo)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(modelo.id)}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

export default GerenciarModelosContrato;
