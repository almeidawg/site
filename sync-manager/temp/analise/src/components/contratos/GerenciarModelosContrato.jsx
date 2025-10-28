import React, { useState } from 'react';
    import { useLocalStorage } from '@/hooks/useLocalStorage';
    import { Button } from '@/components/ui/button';
    import { Textarea } from '@/components/ui/textarea';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Plus, Trash, Edit, Save, FileSignature, Upload } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';

    const GerenciarModelosContrato = () => {
        const [modelos, setModelos] = useLocalStorage('crm_contratos_modelos', []);
        const [isCreating, setIsCreating] = useState(false);
        const [editingId, setEditingId] = useState(null);
        const [currentModel, setCurrentModel] = useState({ title: '', content: '', imageUrl: '' });
        const { toast } = useToast();
        const fileInputRef = React.useRef(null);

        const handleSave = () => {
            if (!currentModel.title || !currentModel.content) {
                toast({ title: 'Campos obrigatórios', description: 'Título e conteúdo são necessários.', variant: 'destructive' });
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
            setCurrentModel({ title: modelo.title, content: modelo.content, imageUrl: modelo.imageUrl || '' });
        };

        const handleDelete = (id) => {
            setModelos(modelos.filter(m => m.id !== id));
            toast({ title: 'Modelo excluído!', variant: 'destructive' });
        };

        const handleImageUpload = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setCurrentModel(prev => ({ ...prev, imageUrl: reader.result }));
                    toast({ title: "Imagem carregada!", description: "A imagem será salva junto com o modelo." });
                };
                reader.readAsDataURL(file);
            }
        };
        
        const handleUploadButtonClick = () => {
            fileInputRef.current?.click();
        };

        const resetForm = () => {
            setIsCreating(false);
            setEditingId(null);
            setCurrentModel({ title: '', content: '', imageUrl: '' });
        };

        const isEditingOrCreating = isCreating || editingId !== null;

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-end">
                    {!isEditingOrCreating && (
                        <Button onClick={() => setIsCreating(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Novo Modelo
                        </Button>
                    )}
                </div>

                {isEditingOrCreating && (
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-effect rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-semibold">{editingId ? 'Editando Modelo' : 'Novo Modelo de Contrato'}</h3>
                        <div>
                            <Label htmlFor="model-title">Título do Modelo</Label>
                            <Input
                                id="model-title"
                                placeholder="Ex: Contrato de Marcenaria Padrão"
                                value={currentModel.title}
                                onChange={(e) => setCurrentModel({ ...currentModel, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="model-content">Conteúdo do Modelo</Label>
                            <Textarea
                                id="model-content"
                                placeholder="Insira o texto do contrato aqui. Use variáveis como {{pessoa.nome}}."
                                value={currentModel.content}
                                onChange={(e) => setCurrentModel({ ...currentModel, content: e.target.value })}
                                className="h-64 font-mono"
                            />
                        </div>
                        <div>
                            <Label>Imagem de Papel Timbrado</Label>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" onClick={handleUploadButtonClick}>
                                    <Upload className="h-4 w-4 mr-2" /> Subir Imagem de Template
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            {currentModel.imageUrl && (
                                <div className="mt-4">
                                    <Label>Pré-visualização</Label>
                                    <img src={currentModel.imageUrl} alt="Preview do papel timbrado" className="max-h-48 mt-2 border rounded-md" />
                                </div>
                            )}
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
                                className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-purple-100"
                            >
                                <p className="font-medium">{modelo.title}</p>
                                <div className="flex gap-2">
                                    {modelo.imageUrl && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Upload className="h-3 w-3" /> Imagem
                                        </span>
                                    )}
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