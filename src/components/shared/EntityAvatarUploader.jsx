/**
 * EntityAvatarUploader
 *
 * Componente para upload e gerenciamento de avatars de entities (clientes, fornecedores, colaboradores)
 *
 * Features:
 * - Upload de imagem (PNG, JPG, JPEG, WEBP)
 * - Validação de tipo e tamanho (max 2MB)
 * - Preview em tempo real
 * - Remoção de avatar
 * - Integração com Supabase Storage (bucket: avatars-entities)
 * - Feedback visual com toast
 *
 * Uso:
 * <EntityAvatarUploader
 *   entityId={formData.id}
 *   entityName={formData.nome_razao_social}
 *   currentAvatarUrl={formData.avatar_url}
 *   onUploadSuccess={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
 * />
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, X, ImageOff } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function EntityAvatarUploader({
    entityId,
    entityName = '',
    currentAvatarUrl,
    onUploadSuccess,
    className = '',
    size = 'default' // 'sm' | 'default' | 'lg'
}) {
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
    const [removing, setRemoving] = useState(false);
    const { toast } = useToast();

    // Atualizar URL quando prop mudar
    useEffect(() => {
        setAvatarUrl(currentAvatarUrl);
    }, [currentAvatarUrl]);

    // Configurações de tamanho
    const sizes = {
        sm: { avatar: 'h-12 w-12', text: 'text-base', buttonSize: 'sm' },
        default: { avatar: 'h-20 w-20', text: 'text-2xl', buttonSize: 'default' },
        lg: { avatar: 'h-32 w-32', text: 'text-4xl', buttonSize: 'lg' }
    };
    const sizeConfig = sizes[size] || sizes.default;

    /**
     * Validar arquivo antes de upload
     */
    const validateFile = (file) => {
        const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (!validTypes.includes(file.type)) {
            toast({
                title: 'Formato inválido',
                description: 'Use apenas PNG, JPG, JPEG ou WEBP.',
                variant: 'destructive'
            });
            return false;
        }

        if (file.size > maxSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            toast({
                title: 'Arquivo muito grande',
                description: `O arquivo tem ${sizeMB}MB. O tamanho máximo é 2MB.`,
                variant: 'destructive'
            });
            return false;
        }

        return true;
    };

    /**
     * Handler de upload
     */
    const handleUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validação
        if (!validateFile(file)) {
            event.target.value = ''; // Reset input
            return;
        }

        if (!entityId) {
            toast({
                title: 'Erro',
                description: 'ID da entidade não fornecido. Salve o cadastro primeiro.',
                variant: 'destructive'
            });
            event.target.value = '';
            return;
        }

        setUploading(true);

        try {
            // Gerar nome único do arquivo
            const fileExt = file.name.split('.').pop();
            const fileName = `avatar_${Date.now()}.${fileExt}`;
            const filePath = `${entityId}/${fileName}`;

            console.log('[EntityAvatarUploader] Iniciando upload:', { fileName, filePath, size: file.size });

            // Upload para Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars-entities')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false, // Não sobrescrever, criar novo arquivo
                    contentType: file.type,
                });

            if (uploadError) {
                console.error('[EntityAvatarUploader] Erro no upload:', uploadError);
                throw uploadError;
            }

            console.log('[EntityAvatarUploader] Upload bem-sucedido');

            // Obter URL pública
            const { data: urlData } = supabase.storage
                .from('avatars-entities')
                .getPublicUrl(filePath);

            if (!urlData || !urlData.publicUrl) {
                throw new Error('Não foi possível obter URL pública do arquivo');
            }

            const publicUrl = urlData.publicUrl;
            console.log('[EntityAvatarUploader] URL pública gerada:', publicUrl);

            // Atualizar entity no banco
            const { error: updateError } = await supabase
                .from('entities')
                .update({ avatar_url: publicUrl })
                .eq('id', entityId);

            if (updateError) {
                console.error('[EntityAvatarUploader] Erro ao atualizar entity:', updateError);
                // Tentar deletar arquivo do storage (rollback)
                await supabase.storage.from('avatars-entities').remove([filePath]);
                throw updateError;
            }

            console.log('[EntityAvatarUploader] Entity atualizada no banco');

            // Atualizar estado local
            setAvatarUrl(publicUrl);

            // Callback para componente pai
            if (onUploadSuccess) {
                onUploadSuccess(publicUrl);
            }

            toast({
                title: 'Avatar atualizado!',
                description: 'A foto foi salva com sucesso.'
            });

        } catch (error) {
            console.error('[EntityAvatarUploader] Erro geral:', error);
            toast({
                title: 'Erro no upload',
                description: error.message || 'Não foi possível fazer o upload. Tente novamente.',
                variant: 'destructive'
            });
        } finally {
            setUploading(false);
            event.target.value = ''; // Reset input
        }
    };

    /**
     * Handler de remoção
     */
    const handleRemoveAvatar = async () => {
        if (!avatarUrl || !entityId) return;

        setRemoving(true);

        try {
            console.log('[EntityAvatarUploader] Removendo avatar:', avatarUrl);

            // Atualizar entity (remover URL do banco)
            const { error: updateError } = await supabase
                .from('entities')
                .update({ avatar_url: null })
                .eq('id', entityId);

            if (updateError) {
                console.error('[EntityAvatarUploader] Erro ao remover avatar do banco:', updateError);
                throw updateError;
            }

            console.log('[EntityAvatarUploader] Avatar removido do banco');

            // Tentar deletar arquivo do storage (opcional, não bloqueante)
            // O trigger no banco já deve fazer isso, mas fazemos por garantia
            try {
                const filePath = avatarUrl.split('avatars-entities/')[1];
                if (filePath) {
                    await supabase.storage.from('avatars-entities').remove([filePath]);
                    console.log('[EntityAvatarUploader] Arquivo deletado do storage');
                }
            } catch (storageError) {
                console.warn('[EntityAvatarUploader] Não foi possível deletar arquivo do storage:', storageError);
                // Não propaga erro, pois o importante é ter removido do banco
            }

            // Atualizar estado local
            setAvatarUrl(null);

            // Callback para componente pai
            if (onUploadSuccess) {
                onUploadSuccess(null);
            }

            toast({
                title: 'Avatar removido',
                description: 'A foto foi excluída.'
            });

        } catch (error) {
            console.error('[EntityAvatarUploader] Erro ao remover avatar:', error);
            toast({
                title: 'Erro ao remover avatar',
                description: error.message || 'Não foi possível remover. Tente novamente.',
                variant: 'destructive'
            });
        } finally {
            setRemoving(false);
        }
    };

    // Obter iniciais para fallback
    const getInitials = () => {
        if (entityName) {
            const words = entityName.trim().split(' ');
            if (words.length >= 2) {
                return (words[0][0] + words[1][0]).toUpperCase();
            }
            return entityName.substring(0, 2).toUpperCase();
        }
        return 'E';
    };

    return (
        <div className={cn('flex items-center gap-4', className)}>
            {/* Avatar Preview */}
            <div className="relative">
                <Avatar className={cn(sizeConfig.avatar, 'border-2 border-gray-200 shadow-sm')}>
                    <AvatarImage
                        src={avatarUrl}
                        alt={entityName || 'Avatar da entidade'}
                    />
                    <AvatarFallback
                        className={cn(
                            'bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold',
                            sizeConfig.text
                        )}
                    >
                        {getInitials()}
                    </AvatarFallback>
                </Avatar>

                {/* Loading overlay */}
                {(uploading || removing) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                )}
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col gap-2">
                {/* Botão Upload */}
                <Button
                    asChild
                    variant="outline"
                    size={sizeConfig.buttonSize}
                    disabled={uploading || removing}
                >
                    <label
                        htmlFor={`avatar-upload-${entityId}`}
                        className="cursor-pointer"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="mr-2 h-4 w-4" />
                                {avatarUrl ? 'Trocar Foto' : 'Adicionar Foto'}
                            </>
                        )}
                        <input
                            type="file"
                            id={`avatar-upload-${entityId}`}
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={uploading || removing}
                        />
                    </label>
                </Button>

                {/* Botão Remover (só aparece se tem avatar) */}
                {avatarUrl && (
                    <Button
                        variant="ghost"
                        size={sizeConfig.buttonSize}
                        onClick={handleRemoveAvatar}
                        disabled={uploading || removing}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        {removing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Removendo...
                            </>
                        ) : (
                            <>
                                <X className="mr-2 h-4 w-4" />
                                Remover Foto
                            </>
                        )}
                    </Button>
                )}

                {/* Hint de tamanho */}
                <p className="text-xs text-muted-foreground">
                    PNG, JPG ou WEBP • Máx. 2MB
                </p>
            </div>
        </div>
    );
}
