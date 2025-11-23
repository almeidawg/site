import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Loader2, Trash2, Folder, FolderPlus, ArrowLeft, Eye, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

const BUCKET_NAME = 'pdf';
const ROOT_PATH = 'onboarding_docs/';

const Onboarding = () => {
    const { toast } = useToast();
    const { refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [items, setItems] = useState({ folders: [], files: [] });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [currentPath, setCurrentPath] = useState(ROOT_PATH);
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [empresaId, setEmpresaId] = useState('');
    const [isConfiguring, setIsConfiguring] = useState(false);

    const fetchItems = useCallback(async (path) => {
        setLoading(true);
        const { data, error } = await supabase.storage.from(BUCKET_NAME).list(path, {
            limit: 100,
            sortBy: { column: 'name', order: 'asc' },
        });

        if (error) {
            toast({
                title: 'Erro ao buscar arquivos',
                description: error.message,
                variant: 'destructive',
            });
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

    const onDrop = useCallback(async (acceptedFiles) => {
        const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
        if (pdfFiles.length === 0) {
            toast({ title: "Apenas arquivos PDF são permitidos.", variant: "destructive" });
            return;
        }

        setUploading(true);
        const uploadPromises = pdfFiles.map(file => {
            const filePath = `${currentPath}${file.name}`;
            return supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });
        });

        const results = await Promise.all(uploadPromises);

        results.forEach((result, index) => {
             if (result.error) {
                toast({ title: `Erro ao enviar ${pdfFiles[index].name}`, description: result.error.message, variant: 'destructive' });
            } else {
                toast({ title: `${pdfFiles[index].name} enviado com sucesso!` });
            }
        });

        setUploading(false);
        fetchItems(currentPath);
    }, [toast, fetchItems, currentPath]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] }
    });
    
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
        if (currentPath === ROOT_PATH) return;
        const pathParts = currentPath.split('/').filter(p => p);
        pathParts.pop();
        setCurrentPath(pathParts.length > 0 ? pathParts.join('/') + '/' : ROOT_PATH);
    };

    const handleConfigSubmit = async () => {
        if (!empresaId.trim()) {
            toast({ title: 'ID da Empresa é obrigatório.', variant: 'destructive' });
            return;
        }
        setIsConfiguring(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toast({ title: 'Usuário não encontrado.', variant: 'destructive' });
            setIsConfiguring(false);
            return;
        }
        
        // First check if a profile already exists.
        const { data: existingProfile, error: fetchError } = await supabase
            .from('usuarios_perfis')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

        let result;
        if(existingProfile) {
            // Update existing profile
             result = await supabase
                .from('usuarios_perfis')
                .update({ empresa_id: empresaId.trim() })
                .eq('user_id', user.id);
        } else {
            // Create new profile - should ideally not happen if user is from auth table
            result = await supabase
                .from('usuarios_perfis')
                .insert({ user_id: user.id, empresa_id: empresaId.trim(), nome: user.email });
        }

        const { error } = result;

        if (error) {
            toast({ title: 'Erro ao salvar configuração', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Configuração salva!', description: 'Seu perfil foi atualizado. Redirecionando...' });
            await refreshProfile();
            navigate('/dashboard');
        }
        setIsConfiguring(false);
    };

    const { isFirstLogin, loading: authLoading } = useAuth();
    
    if (authLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;
    }

    return (
        <>
            <Dialog open={isFolderModalOpen} onOpenChange={setIsFolderModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Criar Nova Pasta</DialogTitle>
                        <DialogDescription>Digite o nome para a nova pasta de documentos.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="folder-name">Nome da Pasta</Label>
                        <Input id="folder-name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFolderModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateFolder}>Criar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="space-y-6 p-4 md:p-8">
                {isFirstLogin && (
                     <motion.div 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-6"
                    >
                        <h2 className="font-bold text-lg">Configuração Inicial Necessária</h2>
                        <p className="mt-1">
                            Parece que é seu primeiro acesso ou seu perfil está incompleto. Por favor, insira o ID da sua empresa para continuar.
                        </p>
                         <div className="mt-4 flex flex-col sm:flex-row gap-2">
                             <Input 
                                placeholder="Insira o ID da Empresa" 
                                value={empresaId}
                                onChange={(e) => setEmpresaId(e.target.value)}
                                className="max-w-xs"
                             />
                             <Button onClick={handleConfigSubmit} disabled={isConfiguring}>
                                 {isConfiguring && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                 Salvar e Continuar
                             </Button>
                         </div>
                    </motion.div>
                )}

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                            Onboarding & Documentos
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Central de documentos importantes para consulta da equipe.
                        </p>
                    </div>
                    <Button onClick={() => setIsFolderModalOpen(true)}>
                        <FolderPlus className="mr-2 h-4 w-4"/> Nova Pasta
                    </Button>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-2xl p-6">
                    <div className="flex items-center mb-4">
                        {currentPath !== ROOT_PATH && (
                             <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        )}
                        <p className="text-sm text-muted-foreground font-mono">
                            {currentPath.replace(ROOT_PATH, 'Início / ')}
                        </p>
                    </div>
                    
                    <div {...getRootProps()} className={`flex flex-col items-center justify-center p-10 mb-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="h-10 w-10 text-gray-400" />
                        {isDragActive ? <p className="mt-3 font-semibold text-primary">Solte os arquivos aqui...</p> : <p className="mt-3 font-semibold">Arraste e solte ou clique para enviar arquivos PDF</p>}
                        {uploading && <div className="mt-3 flex items-center text-primary"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Enviando...</div>}
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
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <a href={file.publicURL} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /></a>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => deleteItem('file', file.name)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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

export default Onboarding;