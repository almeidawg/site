
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2, Folder, FolderPlus, ArrowLeft, Eye, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BUCKET_NAME = 'client_files';

const Documentos = () => {
    const { toast } = useToast();
    const { orgId } = useAuth();

    const [items, setItems] = useState({ folders: [], files: [] });
    const [loading, setLoading] = useState(true);
    const [currentPath, setCurrentPath] = useState('');
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const fetchItems = useCallback(async (path) => {
        setLoading(true);
        const { data, error } = await supabase.storage.from(BUCKET_NAME).list(path, {
            limit: 100,
            sortBy: { column: 'name', order: 'asc' },
        });

        if (error) {
            toast({ title: 'Erro ao buscar arquivos', description: error.message, variant: 'destructive' });
            setItems({ folders: [], files: [] });
        } else {
            const folders = data.filter(item => !item.id && item.name !== '.placeholder');
            const files = await Promise.all(
                data
                .filter(item => item.id && item.name !== '.placeholder')
                .map(async (file) => {
                    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`${path}${file.name}`);
                    return { ...file, publicURL: urlData.publicUrl };
                })
            );
            setItems({ folders, files });
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchItems(currentPath);
    }, [currentPath, fetchItems]);

    const deleteItem = async (type, name) => {
        let pathToDelete = `${currentPath}${name}`;
        
        if (type === 'folder') {
            toast({ title: 'A exclusão de pastas ainda não é suportada.', variant: 'destructive' });
            return;
        }

        const { error } = await supabase.storage.from(BUCKET_NAME).remove([pathToDelete]);
        if (error) {
            toast({ title: `Erro ao deletar ${name}`, description: error.message, variant: 'destructive'});
        } else {
            toast({ title: `${name} deletado com sucesso!` });
            fetchItems(currentPath);
        }
    };
    
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        
        const folderPath = `${currentPath}${newFolderName.trim()}/.placeholder`;
        const { error } = await supabase.storage.from(BUCKET_NAME).upload(folderPath, new Blob(['']), {
            cacheControl: '3600',
            upsert: false,
        });

        if (error) {
            toast({ title: 'Erro ao criar pasta', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Pasta criada com sucesso!' });
            fetchItems(currentPath);
        }
        setNewFolderName('');
        setIsFolderModalOpen(false);
    }
    
    const handleNavigate = (folderName) => {
        setCurrentPath(`${currentPath}${folderName}/`);
    };

    const handleGoBack = () => {
        if (currentPath === '') return;
        const pathParts = currentPath.split('/').filter(p => p);
        pathParts.pop();
        setCurrentPath(pathParts.length > 0 ? pathParts.join('/') + '/' : '');
    };

    return (
        <>
            <Dialog open={isFolderModalOpen} onOpenChange={setIsFolderModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Criar Nova Pasta</DialogTitle><DialogDescription>Digite o nome para a nova pasta de documentos.</DialogDescription></DialogHeader>
                    <div className="py-4"><Label htmlFor="folder-name">Nome da Pasta</Label><Input id="folder-name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} /></div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsFolderModalOpen(false)}>Cancelar</Button><Button onClick={handleCreateFolder}>Criar</Button></DialogFooter>
                </DialogContent>
            </Dialog>
            
            <DocumentGeneratorDialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen} orgId={orgId} onGenerated={() => fetchItems(currentPath)} />

            <div className="space-y-6 p-4 md:p-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Documentos & Exigências</h1>
                        <p className="text-muted-foreground mt-1">Gere e armazene documentos importantes.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsFolderModalOpen(true)}><FolderPlus className="mr-2 h-4 w-4"/> Nova Pasta</Button>
                        <Button onClick={() => setIsGeneratorOpen(true)}><FileText className="mr-2 h-4 w-4"/> Gerar Documento</Button>
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-2xl p-6">
                    <div className="flex items-center mb-4">
                        {currentPath !== '' && (
                             <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2"><ArrowLeft className="h-5 w-5" /></Button>
                        )}
                        <p className="text-sm text-muted-foreground font-mono">Início / {currentPath}</p>
                    </div>
                    
                    {loading ? (
                         <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
                    ) : (
                        <div className="space-y-6">
                            {items.folders.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold mb-3">Pastas</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {items.folders.map(folder => (
                                            <div key={folder.name} className="group relative flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border hover:bg-muted/70 transition-colors cursor-pointer" onClick={() => handleNavigate(folder.name)}>
                                                <Folder className="h-12 w-12 text-amber-500 mb-2" />
                                                <span className="text-sm font-medium text-center truncate w-full">{folder.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {items.files.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold mb-3">Arquivos</h2>
                                    <div className="space-y-2">
                                        {items.files.map(file => (
                                            <div key={file.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg border">
                                                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                                                <span className="flex-1 truncate text-sm font-medium">{file.name}</span>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" asChild><a href={file.publicURL} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /></a></Button>
                                                    <Button variant="ghost" size="icon" asChild><a href={file.publicURL} download><Download className="h-4 w-4" /></a></Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => deleteItem('file', file.name)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!loading && items.folders.length === 0 && items.files.length === 0 && (
                                <p className="text-center text-muted-foreground py-10">Esta pasta está vazia.</p>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );
};

const DocumentGeneratorDialog = ({ open, onOpenChange, orgId, onGenerated }) => {
    const [templates, setTemplates] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!open || !orgId) return;
        const fetchInitialData = async () => {
            const { data: templatesData } = await supabase.from('document_templates').select('*').eq('org_id', orgId);
            setTemplates(templatesData || []);
            const { data: clientsData } = await supabase.from('entities').select('id, nome_razao_social').eq('tipo', 'cliente');
            setClients(clientsData || []);
        };
        fetchInitialData();
    }, [open, orgId]);

    const handleGenerate = async () => {
        if (!selectedTemplate || !selectedClient) {
            toast({ title: 'Campos obrigatórios', description: 'Selecione um modelo e um cliente.', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('generate-doc-from-template', {
                body: {
                    template_id: selectedTemplate,
                    client_id: selectedClient,
                }
            });
            if (error) throw error;
            toast({ title: 'Documento Gerado!', description: `O arquivo ${data.fileName} foi salvo na pasta do cliente.` });
            onGenerated();
            onOpenChange(false);
        } catch (error) {
            toast({ title: 'Erro ao gerar documento', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>Gerar Documento</DialogTitle><DialogDescription>Selecione um modelo e um cliente para gerar um novo documento.</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Modelo de Documento</Label>
                        <Select onValueChange={setSelectedTemplate}><SelectTrigger><SelectValue placeholder="Selecione um modelo..." /></SelectTrigger>
                            <SelectContent>{templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Cliente</Label>
                        <Select onValueChange={setSelectedClient}><SelectTrigger><SelectValue placeholder="Selecione um cliente..." /></SelectTrigger>
                            <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.nome_razao_social}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleGenerate} disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Gerar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default Documentos;
