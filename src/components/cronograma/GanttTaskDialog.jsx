import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, Calendar } from 'lucide-react';

/**
 * Dialog para criar/editar tarefas do Gantt
 */
export const GanttTaskDialog = ({ open, onOpenChange, task, projectId, categories, onSave }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    status: 'pendente',
    categoria: 'Geral',
    progresso_percentual: 0,
    estimativa_horas: '',
    ordem_exibicao: 0
  });

  useEffect(() => {
    if (task) {
      setFormData({
        titulo: task.titulo || '',
        descricao: task.descricao || '',
        data_inicio: task.data_inicio || '',
        data_fim: task.data_fim || '',
        status: task.status || 'pendente',
        categoria: task.categoria || 'Geral',
        progresso_percentual: task.progresso_percentual || 0,
        estimativa_horas: task.estimativa_horas || '',
        ordem_exibicao: task.ordem_exibicao || 0
      });
    } else {
      // Reset para nova tarefa
      setFormData({
        titulo: '',
        descricao: '',
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: '',
        status: 'pendente',
        categoria: 'Geral',
        progresso_percentual: 0,
        estimativa_horas: '',
        ordem_exibicao: 0
      });
    }
  }, [task, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.titulo.trim()) {
      alert('Título é obrigatório');
      return;
    }

    if (!formData.data_inicio) {
      alert('Data de início é obrigatória');
      return;
    }

    if (!formData.data_fim) {
      alert('Data de término é obrigatória');
      return;
    }

    // Buscar cor da categoria
    const categoria = categories.find(c => c.nome === formData.categoria);
    const taskData = {
      ...formData,
      cor_categoria: categoria?.cor || '#6B7280',
      project_id: projectId
    };

    onSave(taskData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare size={20} />
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Título */}
          <div className="col-span-2">
            <Label htmlFor="titulo">Título da Tarefa *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              placeholder="Ex: Fundação do prédio"
            />
          </div>

          {/* Descrição */}
          <div className="col-span-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Detalhes da tarefa..."
              rows={3}
            />
          </div>

          {/* Data Início */}
          <div>
            <Label htmlFor="data_inicio">Data de Início *</Label>
            <Input
              id="data_inicio"
              type="date"
              value={formData.data_inicio}
              onChange={(e) => handleChange('data_inicio', e.target.value)}
            />
          </div>

          {/* Data Fim */}
          <div>
            <Label htmlFor="data_fim">Data de Término *</Label>
            <Input
              id="data_fim"
              type="date"
              value={formData.data_fim}
              onChange={(e) => handleChange('data_fim', e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="bloqueada">Bloqueada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={formData.categoria} onValueChange={(value) => handleChange('categoria', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.nome}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.cor }}
                      />
                      {cat.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Progresso */}
          <div>
            <Label htmlFor="progresso">Progresso (%)</Label>
            <Input
              id="progresso"
              type="number"
              min="0"
              max="100"
              value={formData.progresso_percentual}
              onChange={(e) => handleChange('progresso_percentual', parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Estimativa Horas */}
          <div>
            <Label htmlFor="estimativa">Estimativa (horas)</Label>
            <Input
              id="estimativa"
              type="number"
              min="0"
              step="0.5"
              value={formData.estimativa_horas}
              onChange={(e) => handleChange('estimativa_horas', parseFloat(e.target.value) || 0)}
              placeholder="Ex: 40"
            />
          </div>

          {/* Ordem de Exibição */}
          <div className="col-span-2">
            <Label htmlFor="ordem">Ordem de Exibição</Label>
            <Input
              id="ordem"
              type="number"
              value={formData.ordem_exibicao}
              onChange={(e) => handleChange('ordem_exibicao', parseInt(e.target.value) || 0)}
              placeholder="0 = primeiro, 1 = segundo, etc."
            />
            <p className="text-xs text-gray-500 mt-1">
              Determina a ordem das tarefas no Gantt (menor número aparece primeiro)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {task ? 'Salvar Alterações' : 'Criar Tarefa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
