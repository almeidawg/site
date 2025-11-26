
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useSupabaseFunction } from '@/hooks/useSupabaseFunction';
import { USER_MODULES, createModuleState } from '@/lib/userModules';

const CriarUsuarioSenha = ({ open, onOpenChange, onUserCreated }) => {
  const { toast } = useToast();
  const { invoke: createUser, loading } = useSupabaseFunction('users-create');
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    role: 'operacional',
    modules: createModuleState(),
  });
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    if (!open) {
      setFormData({
        nome: '',
        cpf: '',
        telefone: '',
        role: 'operacional',
        modules: createModuleState(),
      });
      setGeneratedPassword('');
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const toggleModule = (key) => {
    setFormData((prev) => ({
      ...prev,
      modules: { ...prev.modules, [key]: !prev.modules[key] },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nome: formData.nome.trim(),
      cpf: formData.cpf.trim(),
      telefone: formData.telefone.trim() || null,
      role: formData.role,
      modules: formData.modules,
    };

    if (!payload.nome || !payload.cpf) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e CPF são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createUser({
        body: payload,
        onSuccess: (data) => {
          const password = data?.password || 'senha gerada';
          setGeneratedPassword(password);
          toast({
            title: 'Sucesso!',
            description: `Usuário criado. Senha automática: ${password}`,
          });
          onUserCreated();
          onOpenChange(false);
        },
        onError: (errorMessage) => {
          toast({
            title: 'Erro ao criar usuário',
            description: errorMessage,
            variant: 'destructive',
          });
        },
      });
    } catch (err) {
      console.error('Submit failed:', err.message);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Criar Novo Usuário com CPF</DialogTitle>
        <DialogDescription>
          Preencha os dados e selecione os módulos que o usuário poderá acessar. A senha será
          gerada automaticamente.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input id="nome" value={formData.nome} onChange={handleInputChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="00000000000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={formData.telefone} onChange={handleInputChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Perfil de Acesso</Label>
              <Select onValueChange={handleSelectChange} value={formData.role}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Acessos por módulo</Label>
              <div className="grid grid-cols-2 gap-2">
                {USER_MODULES.map((option) => (
                  <label
                    key={option.key}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
                  >
                    <Checkbox
                      checked={formData.modules[option.key]}
                      onCheckedChange={() => toggleModule(option.key)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          {generatedPassword && (
            <div className="space-y-2">
              <Label>Senha automática</Label>
              <Input readOnly value={generatedPassword} />
              <p className="text-xs text-muted-foreground">
                Compartilhe essa senha única e oriente o usuário a alterá-la no primeiro login.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Usuário
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default CriarUsuarioSenha;
