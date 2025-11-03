import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function AvatarUploader() {
    const { user, profile, fetchProfile } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        if (profile?.avatar_path) {
            const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_path);
            setAvatarUrl(data.publicUrl);
        }
    }, [profile]);

    const handleUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!/^image\/(png|jpg|jpeg|webp)$/.test(file.type)) {
            toast({ title: 'Formato inválido', description: 'Use PNG, JPG ou WEBP.', variant: 'destructive' });
            return;
        }
        if (file.size > 1.5 * 1024 * 1024) {
            toast({ title: 'Arquivo muito grande', description: 'O tamanho máximo é 1.5 MB.', variant: 'destructive' });
            return;
        }

        setUploading(true);
        const path = `${user.id}/avatar.png`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: file.type,
                });

            if (uploadError) throw uploadError;

            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({ avatar_path: path })
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            // Refresh profile and get new URL
            await fetchProfile(user);
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
            setAvatarUrl(`${urlData.publicUrl}?t=${new Date().getTime()}`); // bust cache

            toast({ title: 'Avatar atualizado com sucesso!' });

        } catch (error) {
            toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt="Avatar" />
                <AvatarFallback className="gradient-primary text-white font-semibold text-2xl">
                    {profile?.nome?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
            </Avatar>
            <Button asChild variant="outline">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    {uploading ? 'Enviando...' : 'Trocar Avatar'}
                    <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
            </Button>
        </div>
    );
}