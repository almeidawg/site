import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Folder, File, Plus, Upload, ArrowLeft, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const BUCKET_NAME = 'client_files';

const Arquivos = () => {
    const [files, setFiles] = useState([]);
    const [currentPath, setCurrentPath] = useState('');
    const [loading, setLoading] = useState(false);
    const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { toast } = useToast();

    const listFiles = async (path) => {
        setLoading(true);
        const { data, error } = await supabase.storage.from(BUCKET_NAME).list(path, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
        });

        if (error) {
            toast({ title: 'Erro ao listar arquivos', description: error.message, variant: 'destructive' });
            setFiles([]);
        } else {
            const folders = data.filter(item => !item.id).map(item => ({ ...item, type: 'folder' }));
            const fileItems = data.filter(item => item.id).map(item => ({ ...item, type: 'file' }));
            setFiles([...folders, ...fileItems]);
        }
        setLoading(false);
    };

    useEffect(() => {
        listFiles(currentPath);
    }, [currentPath]);

    const handleCreateFolder = async () => {
        if (!newFolderName) return;
        const path = `${currentPath ? currentPath + '/' : ''}${newFolderName}/.placeholder`;
        
        const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, new Blob(['']), {
            cacheControl: '3600',
            upsert: false,
        });

        if (error) {
            toast({ title: 'Erro ao criar pasta', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Pasta criada com sucesso!' });
            setNewFolderName('');
            setCreateFolderOpen(false);
            listFiles(currentPath);
        }
    };

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        const path = `${currentPath ? currentPath + '/' : ''}${file.name}`;
        const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, file);

        setUploading(false);
        if (error) {
            toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Upload concluído!' });
            listFiles(currentPath);
        }
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = async (item) => {
        const path = `${currentPath ? currentPath + '/' : ''}${item.name}`;
        if (item.type === 'folder') {
            toast({ title: 'Ainda não é possível deletar pastas.', description: 'Esta funcionalidade será implementada em breve.', variant: 'destructive' });
            return;
        }
        
        const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);
        if (error) {
            toast({ title: 'Erro ao deletar', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Arquivo deletado!' });
            listFiles(currentPath);
        }
    };

    const handleNavigate = (folderName) => {
        setCurrentPath(prev => `${prev ? prev + '/' : ''}${folderName}`);
    };

    const handleGoBack = () => {
        const parts = currentPath.split('/');
        parts.pop();
        setCurrentPath(parts.join('/'));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                        <Folder /> Sistema de Arquivos
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie seus arquivos e pastas na nuvem.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCreateFolderOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Criar Pasta
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Fazer Upload
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {currentPath && <ArrowLeft className="h-5 w-5 cursor-pointer hover:text-primary" onClick={handleGoBack} />}
                <span>/</span>
                {currentPath.split('/').map((part, i) => (
                    <React.Fragment key={i}>
                        <span>{part}</span>
                        {i < currentPath.split('/').length - 1 && <span>/</span>}
                    </React.Fragment>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {files.map((item, index) => (
                        <motion.div
                            key={item.name + index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative"
                        >
                            <div
                                onDoubleClick={item.type === 'folder' ? () => handleNavigate(item.name) : undefined}
                                className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:shadow-md hover:border-primary transition-all aspect-square"
                            >
                                {item.type === 'folder' ? (
                                    <Folder className="h-16 w-16 text-yellow-500" />
                                ) : (
                                    <File className="h-16 w-16 text-blue-500" />
                                )}
                                <p className="text-sm font-medium text-center truncate w-full mt-2">{item.name}</p>
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical size={16} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem disabled>
                                            <Edit className="mr-2 h-4 w-4" /> Renomear
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(item)} className="text-red-500">
                                            <Trash2 className="mr-2 h-4 w-4" /> Deletar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
            
            {files.length === 0 && !loading && (
                <div className="text-center py-16 glass-effect rounded-2xl">
                    <p className="text-muted-foreground">Esta pasta está vazia.</p>
                </div>
            )}

            <Dialog open={isCreateFolderOpen} onOpenChange={setCreateFolderOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Criar Nova Pasta</DialogTitle>
                        <DialogDescription>Digite o nome da nova pasta.</DialogDescription>
                    </DialogHeader>
                    <Input
                        placeholder="Nome da pasta"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateFolder}>Criar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Arquivos;