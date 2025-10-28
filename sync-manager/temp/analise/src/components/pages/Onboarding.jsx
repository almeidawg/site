import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Loader2, Trash2, Folder, FolderPlus, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BUCKET_NAME = 'pdf';

const Onboarding = () => {
    const { toast } = useToast();
    const [items, setItems] = useState({ folders: [], files: [] });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [currentPath, setCurrentPath] = useState('onboarding_docs/');
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

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
            const folders = [];
            const files = [];
            
            for (const item of data) {
                // Supabase Storage list() returns folders as items with no metadata.
                // A common way to differentiate is by checking if it's a placeholder or by its name if no metadata exists.
                // Here we assume items without a specific file extension and not being our placeholder are folders.
                const isFolder = !item.id && item.name !== '.placeholder';

                if (isFolder) {
                    folders.push(item.name);
                } else if (item.name !== '.placeholder') {
                    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`${path}${item.name}`);
                    files.push({ ...item, publicURL: urlData.publicUrl });
                }
            }
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
        for (const file of pdfFiles) {
            const filePath = `${currentPath}${file.name}`;
            const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

            if (error) {
                toast({ title: `Erro ao enviar ${file.name}`, description: error.message, variant: 'destructive' });
            } else {
                toast({ title: `${file.name} enviado com sucesso!` });
            }
        }
        setUploading(false);
        fetchItems(currentPath);
    }, [toast, fetchItems, currentPath]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] }
    });
    
    const deleteItem = async (type, name) => {
        let pathToDelete = [`${currentPath}${name}`];
        if (type === 'folder') {
            // To delete a "folder", we delete its placeholder file.
            pathToDelete = [`${currentPath}${name}/.placeholder`];
        }

        const { error } = await supabase.storage.from(BUCKET_NAME).remove(pathToDelete);
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
        if (currentPath === 'onboarding_docs/') return;
        const pathParts = currentPath.split('/').filter(p => p);
        pathParts.pop();
        setCurrentPath(pathParts.join('/') + '/');
    };
    
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
                        {currentPath !== 'onboarding_docs/' && (
                             <Button variant="ghost" size="icon" onClick={handleGoBack} className="mr-2">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        )}
                        <p className="text-sm text-muted-foreground font-mono">
                            {currentPath.replace('onboarding_docs/', 'Início / ')}
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
                                        {items.folders.map(folderName => (
                                            <div key={folderName} className="group relative flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border hover:bg-muted/70 transition-colors cursor-pointer" onClick={() => handleNavigate(folderName)}>
                                                <Folder className="h-12 w-12 text-amber-500 mb-2" />
                                                <span className="text-sm font-medium text-center truncate w-full">{folderName}</span>
                                                <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); deleteItem('folder', folderName); }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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