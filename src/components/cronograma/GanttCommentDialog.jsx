import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, AlertTriangle, Edit2, Milestone } from 'lucide-react';
import { useGantt } from '@/hooks/useGantt';
import { useToast } from '@/components/ui/use-toast';

/**
 * Dialog para adicionar comentários em tarefas (Timeline do Gantt)
 */
export const GanttCommentDialog = ({ open, onOpenChange, taskId, projectId, selectedDate }) => {
  const [conteudo, setConteudo] = useState('');
  const [tipo, setTipo] = useState('comentario');
  const [data, setData] = useState(selectedDate || new Date().toISOString().split('T')[0]);

  const { addComment } = useGantt(projectId);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedDate) {
      setData(selectedDate);
    }
  }, [selectedDate]);

  const handleSave = async () => {
    if (!conteudo.trim()) {
      toast({
        title: 'Conteúdo obrigatório',
        description: 'Digite um comentário.',
        variant: 'destructive'
      });
      return;
    }

    if (!taskId) {
      toast({
        title: 'Tarefa não selecionada',
        description: 'Selecione uma tarefa primeiro.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await addComment({
        task_id: taskId,
        data_comentario: data,
        conteudo,
        tipo
      });

      toast({
        title: 'Comentário adicionado! ✅',
        description: `${getTipoLabel(tipo)} salvo com sucesso.`
      });

      setConteudo('');
      setTipo('comentario');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao salvar comentário',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getTipoIcon = (tipoValue) => {
    switch (tipoValue) {
      case 'alerta':
        return <AlertTriangle size={16} className="text-orange-500" />;
      case 'alteracao':
        return <Edit2 size={16} className="text-blue-500" />;
      case 'marco':
        return <Milestone size={16} className="text-purple-500" />;
      default:
        return <MessageSquare size={16} className="text-gray-500" />;
    }
  };

  const getTipoLabel = (tipoValue) => {
    switch (tipoValue) {
      case 'alerta':
        return 'Alerta';
      case 'alteracao':
        return 'Alteração';
      case 'marco':
        return 'Marco';
      default:
        return 'Comentário';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTipoIcon(tipo)}
            Adicionar Comentário na Timeline
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="data">Data do Comentário</Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              O comentário aparecerá neste dia na timeline
            </p>
          </div>

          <div>
            <Label htmlFor="tipo">Tipo de Comentário</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comentario">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} />
                    Comentário Normal
                  </div>
                </SelectItem>
                <SelectItem value="alteracao">
                  <div className="flex items-center gap-2">
                    <Edit2 size={14} />
                    Alteração
                  </div>
                </SelectItem>
                <SelectItem value="alerta">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} />
                    Alerta
                  </div>
                </SelectItem>
                <SelectItem value="marco">
                  <div className="flex items-center gap-2">
                    <Milestone size={14} />
                    Marco (Milestone)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="conteudo">Comentário</Label>
            <Textarea
              id="conteudo"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Digite seu comentário..."
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Comentário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
