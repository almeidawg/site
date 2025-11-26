import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { cn } from '@/lib/utils';

/**
 * Componente de Upload de Avatar
 *
 * @param {Object} props
 * @param {string} props.currentAvatarUrl - URL atual do avatar
 * @param {Function} props.onAvatarChange - Callback chamado quando avatar é alterado (recebe nova URL)
 * @param {string} props.entityId - ID da entidade (para nome do arquivo)
 * @param {string} props.bucket - Bucket do Supabase Storage (padrão: 'avatars')
 * @param {string} props.size - Tamanho do avatar: 'sm', 'md', 'lg', 'xl' (padrão: 'md')
 * @param {boolean} props.disabled - Desabilitar upload
 */
const AvatarUpload = ({
  currentAvatarUrl,
  onAvatarChange,
  entityId,
  bucket = 'avatars',
  size = 'md',
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // Tamanhos do avatar
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  // Iniciais para fallback
  const getInitials = () => {
    if (entityId) {
      return entityId.substring(0, 2).toUpperCase();
    }
    return '?';
  };

  /**
   * Upload de imagem para Supabase Storage
   */
  const handleFileUpload = async (event) => {
    try {
      setUploading(true);

      const file = event.target.files?.[0];
      if (!file) return;

      // Validações
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O tamanho máximo permitido é 2MB.',
          variant: 'destructive'
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Formato inválido',
          description: 'Apenas imagens JPG, PNG ou WEBP são permitidas.',
          variant: 'destructive'
        });
        return;
      }

      // Gerar nome único do arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${entityId}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Fazer upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Sobrescrever se já existir
        });

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Atualizar preview
      setPreviewUrl(publicUrl);

      // Chamar callback
      if (onAvatarChange) {
        onAvatarChange(publicUrl, 'upload');
      }

      toast({
        title: 'Avatar atualizado!',
        description: 'Sua foto foi enviada com sucesso.',
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível fazer upload da imagem.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Remover avatar
   */
  const handleRemoveAvatar = async () => {
    try {
      setPreviewUrl(null);

      if (onAvatarChange) {
        onAvatarChange(null, null);
      }

      toast({
        title: 'Avatar removido',
        description: 'A foto foi removida com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o avatar.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Container do Avatar */}
      <div className={cn(
        'relative rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg',
        sizeClasses[size]
      )}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              setPreviewUrl(null);
            }}
          />
        ) : (
          <span className={cn(
            'text-2xl',
            size === 'xl' && 'text-4xl',
            size === 'lg' && 'text-3xl',
            size === 'sm' && 'text-base'
          )}>
            {getInitials()}
          </span>
        )}

        {/* Overlay ao passar o mouse */}
        {!disabled && (
          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="text-white" size={size === 'xl' ? 32 : size === 'lg' ? 28 : 24} />
          </div>
        )}

        {/* Spinner de loading */}
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <Loader2 className="text-white animate-spin" size={24} />
          </div>
        )}
      </div>

      {/* Input de arquivo (oculto) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        onChange={handleFileUpload}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Botões de ação */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {uploading ? 'Enviando...' : 'Carregar Foto'}
        </Button>

        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={disabled || uploading}
            className="text-red-500 hover:text-red-600"
          >
            <X className="h-4 w-4 mr-2" />
            Remover
          </Button>
        )}
      </div>

      {/* Instruções */}
      <p className="text-xs text-muted-foreground text-center max-w-[200px]">
        JPG, PNG ou WEBP (máx. 2MB)
      </p>
    </div>
  );
};

export default AvatarUpload;
