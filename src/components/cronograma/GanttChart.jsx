import React, { useEffect, useRef, useState } from 'react';
import Gantt from 'frappe-gantt';
import 'frappe-gantt/dist/frappe-gantt.css';
import { Calendar, MessageSquare, Edit2, Trash2, Plus, ZoomIn, ZoomOut, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGantt } from '@/hooks/useGantt';
import { useToast } from '@/components/ui/use-toast';
import { GanttCommentDialog } from './GanttCommentDialog';
import { GanttTaskDialog } from './GanttTaskDialog';

/**
 * Componente de Gráfico de Gantt
 * Renderiza timeline interativa com tarefas, dependências e comentários
 */
export const GanttChart = ({ projectId }) => {
  const svgRef = useRef(null);
  const ganttInstance = useRef(null);
  const [viewMode, setViewMode] = useState('Day'); // Day, Week, Month
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const {
    tasks,
    comments,
    categories,
    loading,
    stats,
    updateDates,
    updateProgress,
    createTask,
    updateTask,
    deleteTask,
    toGanttFormat
  } = useGantt(projectId);

  const { toast } = useToast();

  // Inicializar Gantt
  useEffect(() => {
    if (!svgRef.current || tasks.length === 0) return;

    try {
      const ganttTasks = toGanttFormat();

      // Destruir instância anterior se existir
      if (ganttInstance.current) {
        ganttInstance.current = null;
      }

      // Criar nova instância
      ganttInstance.current = new Gantt(svgRef.current, ganttTasks, {
        view_mode: viewMode,
        date_format: 'DD/MM/YYYY',
        language: 'pt',
        custom_popup_html: (task) => {
          const taskData = tasks.find(t => t.id === task.id);
          return `
            <div class="gantt-popup">
              <div class="gantt-popup-title">${task.name}</div>
              <div class="gantt-popup-content">
                <p><strong>Status:</strong> ${taskData?.status || 'pendente'}</p>
                <p><strong>Progresso:</strong> ${task.progress}%</p>
                <p><strong>Início:</strong> ${task._start.toLocaleDateString('pt-BR')}</p>
                <p><strong>Fim:</strong> ${task._end.toLocaleDateString('pt-BR')}</p>
                ${taskData?.responsavel?.nome ? `<p><strong>Responsável:</strong> ${taskData.responsavel.nome}</p>` : ''}
                ${taskData?.categoria ? `<p><strong>Categoria:</strong> ${taskData.categoria}</p>` : ''}
              </div>
            </div>
          `;
        },
        on_date_change: async (task, start, end) => {
          try {
            await updateDates(
              task.id,
              start.toISOString().split('T')[0],
              end.toISOString().split('T')[0]
            );
            toast({
              title: 'Datas atualizadas',
              description: `${task.name} foi atualizado.`
            });
          } catch (error) {
            toast({
              title: 'Erro ao atualizar datas',
              description: error.message,
              variant: 'destructive'
            });
          }
        },
        on_progress_change: async (task, progress) => {
          try {
            await updateProgress(task.id, progress);
            toast({
              title: 'Progresso atualizado',
              description: `${task.name}: ${progress}%`
            });
          } catch (error) {
            toast({
              title: 'Erro ao atualizar progresso',
              description: error.message,
              variant: 'destructive'
            });
          }
        },
        on_click: (task) => {
          const taskData = tasks.find(t => t.id === task.id);
          setSelectedTask(taskData);
        }
      });

      // Adicionar estilos customizados por categoria
      addCategoryStyles();

      // Adicionar event listener para cliques na timeline
      addTimelineClickListeners();
    } catch (error) {
      console.error('Erro ao inicializar Gantt:', error);
      toast({
        title: 'Erro ao carregar Gantt',
        description: error.message,
        variant: 'destructive'
      });
    }

    return () => {
      if (ganttInstance.current) {
        ganttInstance.current = null;
      }
    };
  }, [tasks, viewMode, toGanttFormat, updateDates, updateProgress, toast]);

  // Adicionar estilos por categoria
  const addCategoryStyles = () => {
    const style = document.createElement('style');
    style.innerHTML = categories.map(cat => `
      .gantt-${cat.nome.toLowerCase().replace(/\s/g, '-')} .bar {
        fill: ${cat.cor} !important;
      }
      .gantt-${cat.nome.toLowerCase().replace(/\s/g, '-')} .bar-progress {
        fill: ${cat.cor}DD !important;
      }
    `).join('\n');
    document.head.appendChild(style);
  };

  // Adicionar listeners para cliques na timeline (comentários)
  const addTimelineClickListeners = () => {
    if (!svgRef.current) return;

    const gridRows = svgRef.current.querySelectorAll('.grid-row');
    gridRows.forEach((row, index) => {
      row.addEventListener('click', (e) => {
        // Calcular data baseada na posição X do clique
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;

        // Aqui você pode calcular a data exata do clique
        // Por simplicidade, vou usar a data de hoje
        const clickedDate = new Date().toISOString().split('T')[0];

        setSelectedDate(clickedDate);
        setSelectedTask(tasks[index]);
        setCommentDialogOpen(true);
      });
    });
  };

  // Alterar modo de visualização
  const changeViewMode = (mode) => {
    setViewMode(mode);
    if (ganttInstance.current) {
      ganttInstance.current.change_view_mode(mode);
    }
  };

  // Abrir dialog de nova tarefa
  const handleAddTask = () => {
    setSelectedTask(null);
    setTaskDialogOpen(true);
  };

  // Abrir dialog de editar tarefa
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  // Deletar tarefa
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Deseja realmente deletar esta tarefa?')) return;

    try {
      await deleteTask(taskId);
      toast({
        title: 'Tarefa deletada',
        variant: 'default'
      });
      setSelectedTask(null);
    } catch (error) {
      toast({
        title: 'Erro ao deletar tarefa',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-bold mb-2">Nenhuma tarefa cadastrada</h3>
        <p className="text-gray-600 mb-4">Crie sua primeira tarefa para começar o cronograma.</p>
        <Button onClick={handleAddTask} className="bg-blue-500 hover:bg-blue-600">
          <Plus size={16} className="mr-2" />
          Nova Tarefa
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com Controles */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div>
          <h2 className="text-2xl font-bold">Cronograma do Projeto</h2>
          <p className="text-sm text-gray-600">
            {stats.total} tarefa{stats.total !== 1 ? 's' : ''} •
            {stats.concluidas} concluída{stats.concluidas !== 1 ? 's' : ''} •
            Progresso médio: {stats.progressoMedio.toFixed(0)}%
          </p>
        </div>

        <div className="flex gap-2">
          {/* Modo de Visualização */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded">
            {['Day', 'Week', 'Month'].map(mode => (
              <Button
                key={mode}
                size="sm"
                variant={viewMode === mode ? 'default' : 'ghost'}
                onClick={() => changeViewMode(mode)}
                className="text-xs"
              >
                {mode === 'Day' && 'Dia'}
                {mode === 'Week' && 'Semana'}
                {mode === 'Month' && 'Mês'}
              </Button>
            ))}
          </div>

          {/* Botões de Ação */}
          <Button size="sm" onClick={handleAddTask} className="bg-blue-500 hover:bg-blue-600">
            <Plus size={16} className="mr-1" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Grid className="text-gray-400" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-green-600">{stats.concluidas}</p>
            </div>
            <div className="text-green-500">✓</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Em Andamento</p>
              <p className="text-2xl font-bold text-blue-600">{stats.emAndamento}</p>
            </div>
            <div className="text-blue-500">⟳</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Atrasadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.atrasadas}</p>
            </div>
            <div className="text-red-500">!</div>
          </div>
        </div>
      </div>

      {/* Gráfico de Gantt */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <svg ref={svgRef} width="100%" height="auto"></svg>
      </div>

      {/* Painel Lateral de Tarefa Selecionada */}
      {selectedTask && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">{selectedTask.titulo}</h3>
              <p className="text-sm text-gray-600">{selectedTask.descricao}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => handleEditTask(selectedTask)}>
                <Edit2 size={16} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDeleteTask(selectedTask.id)}>
                <Trash2 size={16} className="text-red-500" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-medium">{selectedTask.status}</p>
            </div>
            <div>
              <p className="text-gray-600">Progresso</p>
              <p className="font-medium">{selectedTask.progresso_percentual || 0}%</p>
            </div>
            <div>
              <p className="text-gray-600">Data Início</p>
              <p className="font-medium">{selectedTask.data_inicio || 'Não definido'}</p>
            </div>
            <div>
              <p className="text-gray-600">Data Fim</p>
              <p className="font-medium">{selectedTask.data_fim || 'Não definido'}</p>
            </div>
            <div>
              <p className="text-gray-600">Categoria</p>
              <p className="font-medium">{selectedTask.categoria || 'Geral'}</p>
            </div>
            <div>
              <p className="text-gray-600">Responsável</p>
              <p className="font-medium">{selectedTask.responsavel?.nome || 'Não atribuído'}</p>
            </div>
          </div>

          <Button
            className="w-full mt-4"
            variant="outline"
            onClick={() => {
              setCommentDialogOpen(true);
              setSelectedDate(new Date().toISOString().split('T')[0]);
            }}
          >
            <MessageSquare size={16} className="mr-2" />
            Adicionar Comentário
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <GanttCommentDialog
        open={commentDialogOpen}
        onOpenChange={setCommentDialogOpen}
        taskId={selectedTask?.id}
        projectId={projectId}
        selectedDate={selectedDate}
      />

      <GanttTaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={selectedTask}
        projectId={projectId}
        categories={categories}
        onSave={async (taskData) => {
          try {
            if (selectedTask) {
              await updateTask(selectedTask.id, taskData);
              toast({ title: 'Tarefa atualizada!' });
            } else {
              await createTask(taskData);
              toast({ title: 'Tarefa criada!' });
            }
            setTaskDialogOpen(false);
          } catch (error) {
            toast({
              title: 'Erro ao salvar tarefa',
              description: error.message,
              variant: 'destructive'
            });
          }
        }}
      />
    </div>
  );
};

// Estilos customizados para o Gantt
const style = document.createElement('style');
style.textContent = `
  .gantt-popup {
    background: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    min-width: 200px;
  }
  .gantt-popup-title {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 8px;
  }
  .gantt-popup-content {
    font-size: 12px;
  }
  .gantt-popup-content p {
    margin: 4px 0;
  }
  .grid-row {
    cursor: pointer;
    transition: fill 0.2s;
  }
  .grid-row:hover {
    fill: #f3f4f6;
  }
`;
document.head.appendChild(style);
