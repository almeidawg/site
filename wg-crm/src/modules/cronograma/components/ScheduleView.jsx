import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useProjects } from '@/modules/cronograma/hooks/useProjects'; // Re-added for comments

const categoryColors = {
    "Arquitetura": "bg-red-200", "Documentação": "bg-slate-200", "Staff": "bg-gray-200", 
    "Pré Obra e Remoções": "bg-stone-200", "Demolições": "bg-orange-200", "Infra Ar": "bg-sky-200", 
    "Elétrica": "bg-yellow-200", "Automação": "bg-purple-200", "Hidrossanitária": "bg-blue-200", 
    "Gás": "bg-lime-200", "Gesso": "bg-indigo-200", "Paredes": "bg-cyan-200", "Pisos": "bg-amber-200", 
    "Pintura": "bg-violet-200", "Içamento": "bg-fuchsia-200", "Finalização": "bg-teal-200",
    "Produção": "bg-rose-200", "Limpeza Pós Obra": "bg-emerald-200", "Vidraçaria": "bg-cyan-100", "Marmoraria": "bg-neutral-300",
    "default": "bg-slate-100"
};

const getDaysDiff = (date1, date2) => {
    if (!date1 || !date2) return 0;
    return Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
}

const addWorkDays = (date, days) => {
    let result = new Date(date.getTime());
    let daysAdded = 0;
    
    // If the start date is a weekend, move to the next Monday.
    if (result.getUTCDay() === 6) { // Saturday
        result.setUTCDate(result.getUTCDate() + 2);
    } else if (result.getUTCDay() === 0) { // Sunday
        result.setUTCDate(result.getUTCDate() + 1);
    }

    if (days <= 0) return result;

    while (daysAdded < days) {
        result.setUTCDate(result.getUTCDate() + 1);
        if (result.getUTCDay() !== 0 && result.getUTCDay() !== 6) {
            daysAdded++;
        }
    }
    return result;
};


const CommentDialog = ({ task, date, open, onOpenChange }) => {
    const { addTaskComment } = useProjects(); // This needs the hook
    const [comment, setComment] = useState('');
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!comment.trim()) return;
        // This function is not in the rebuilt useProjects hook, so it will fail.
        // For now, let's toast a message.
        toast({ title: '🚧 Funcionalidade em desenvolvimento', description: 'Adicionar comentários será implementado em breve.'});
        onOpenChange(false);
    };
    
    const dailyComments = task.comments?.filter(c => c.comment_date && new Date(c.comment_date + 'T00:00:00Z').toDateString() === date.toDateString()) || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>Comentários de {date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} - {task.name}</DialogTitle></DialogHeader>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                    {dailyComments.length > 0 ? dailyComments.map(c => (
                        <div key={c.id} className="text-sm bg-slate-50 p-2 rounded-md">
                            <p>{c.comment}</p>
                            <p className="text-xs text-slate-500">{new Date(c.created_at).toLocaleString('pt-BR')}</p>
                        </div>
                    )) : <p className="text-sm text-slate-500">Nenhum comentário para este dia.</p>}
                </div>
                <div className="space-y-2 pt-4">
                    <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Adicionar um novo comentário..." />
                    <Button onClick={handleSubmit} className="w-full">Salvar Comentário</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ScheduleView = ({ project, isPrintMode = false }) => {
  const [commentDialog, setCommentDialog] = useState({ open: false, task: null, date: null });
  
  const sortedTasks = useMemo(() => {
    console.log("Recalculating sorted tasks for project:", project);
    if (!project?.tasks || project.tasks.length === 0) return [];
    
    const tasksWithCategory = project.tasks.map(task => {
        const projectItem = project.items?.find(item => item.id === task.project_item_id);
        const category = projectItem?.catalog_item?.category || 'default';
        return { ...task, category };
    }).filter(task => task.start_date && task.end_date); // Filter out tasks without dates

    return tasksWithCategory.sort((a,b) => new Date(a.start_date) - new Date(b.start_date));
  }, [project]);

  const { ganttStartDate, maxEndDate, timelineDays } = useMemo(() => {
    console.log("Recalculating timeline dates. Sorted tasks count:", sortedTasks.length);
    if (sortedTasks.length === 0) return { ganttStartDate: null, maxEndDate: null, timelineDays: [] };
    
    const firstDate = new Date(sortedTasks[0].start_date + 'T00:00:00Z');
    let lastDate = new Date(sortedTasks[0].end_date + 'T00:00:00Z');
    
    sortedTasks.forEach(task => {
        const endDate = new Date(task.end_date + 'T00:00:00Z');
        if (endDate > lastDate) lastDate = endDate;
    });

    if (!isFinite(firstDate) || !isFinite(lastDate) || firstDate > lastDate) {
        console.error("Invalid dates for timeline calculation.");
        return { ganttStartDate: null, maxEndDate: null, timelineDays: [] };
    }
    
    const days = [];
    const extendedLastDate = new Date(lastDate.getTime());
    extendedLastDate.setUTCDate(extendedLastDate.getUTCDate() + 1); // Add a day for padding

    for (let d = new Date(firstDate); d <= extendedLastDate; d.setUTCDate(d.getUTCDate() + 1)) {
        days.push(new Date(d));
    }
    console.log(`Timeline calculated from ${firstDate.toISOString()} to ${extendedLastDate.toISOString()}, total days: ${days.length}`);
    return { ganttStartDate: firstDate, maxEndDate: lastDate, timelineDays: days };
  }, [sortedTasks]);

  if (sortedTasks.length === 0) {
    return <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center"><Calendar className="h-16 w-16 mx-auto text-slate-300 mb-4" /><h3 className="text-xl font-semibold mb-2">Nenhum cronograma gerado</h3><p className="text-slate-600">Adicione itens e clique em "Gerar Cronograma" para começar.</p></div>;
  }
  
  const projectDuration = (ganttStartDate && maxEndDate) ? getDaysDiff(ganttStartDate, maxEndDate) + 1 : 0;

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border"><div className="flex items-center justify-between"><div><p className="text-slate-600 text-sm font-medium">Total de Tarefas</p><p className="text-3xl font-bold mt-2">{sortedTasks.length}</p></div><Calendar className="h-8 w-8 text-blue-500" /></div></div>
        <div className="bg-white rounded-xl p-6 shadow-lg border"><div className="flex items-center justify-between"><div><p className="text-slate-600 text-sm font-medium">Duração do Projeto</p><p className="text-3xl font-bold mt-2">{projectDuration} dias</p></div><CheckCircle2 className="h-8 w-8 text-emerald-500" /></div></div>
        <div className="bg-white rounded-xl p-6 shadow-lg border"><div className="flex items-center justify-between"><div><p className="text-slate-600 text-sm font-medium">Tarefas Críticas</p><p className="text-3xl font-bold mt-2">{sortedTasks.filter(t => t.is_critical).length}</p></div><AlertCircle className="h-8 w-8 text-amber-500" /></div></div>
      </div>

      <div className="overflow-x-auto relative bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="grid" style={{ gridTemplateColumns: `minmax(200px, 2fr) minmax(90px, 1fr) minmax(90px, 1fr) repeat(${timelineDays.length}, minmax(40px, 1fr))` }}>
          {/* Header */}
          <div className="sticky left-0 bg-white z-10 font-semibold text-sm text-slate-600 border-b border-r border-slate-200 flex items-center px-2 py-2">Tarefa</div>
          <div className="font-semibold text-sm text-slate-600 border-b border-slate-200 flex items-center justify-center px-2">Início</div>
          <div className="font-semibold text-sm text-slate-600 border-b border-slate-200 flex items-center justify-center px-2">Fim</div>
          {timelineDays.map(day => (<div key={day.toISOString()} className={`text-center text-xs font-medium border-b border-l border-slate-200 py-2 ${[0, 6].includes(day.getUTCDay()) ? 'bg-slate-50' : ''}`}><div>{day.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).slice(0,3)}</div><div>{day.getUTCDate()}</div></div>))}
          
          {/* Rows */}
          {sortedTasks.map((task, index) => {
            const taskStartDate = new Date(task.start_date + 'T00:00:00Z');
            const taskEndDate = new Date(task.end_date + 'T00:00:00Z');

            if (!ganttStartDate) return null; // Safety check

            const startOffset = getDaysDiff(ganttStartDate, taskStartDate);
            const durationDays = getDaysDiff(taskStartDate, taskEndDate) + 1;
            
            const startColumn = startOffset + 4; // 1 (task) + 1 (start) + 1 (end) + 1 (zero-based index)
            const barColor = task.is_critical ? 'from-amber-400 to-orange-500' : 'from-blue-400 to-indigo-500';
            const rowColor = categoryColors[task.category] || categoryColors['default'];

            return (
              <React.Fragment key={task.id}>
                <div style={{ gridRow: index + 2, gridColumn: 1 }} className={`sticky left-0 ${rowColor} z-10 text-sm font-medium text-slate-800 truncate border-r border-b border-slate-200 flex items-center px-2`}>{task.name}</div>
                <div style={{ gridRow: index + 2, gridColumn: 2 }} className={`flex items-center justify-center text-sm ${rowColor} border-b border-slate-200`}>
                  <span>{taskStartDate.toLocaleDateString('pt-BR', {timeZone:'UTC'})}</span>
                </div>
                <div style={{ gridRow: index + 2, gridColumn: 3 }} className={`flex items-center justify-center text-sm ${rowColor} border-b border-slate-200`}>
                  <span>{taskEndDate.toLocaleDateString('pt-BR', {timeZone:'UTC'})}</span>
                </div>

                {/* Background cells for the timeline */}
                {timelineDays.map((day, dayIndex) => (
                  <div key={day.toISOString()} style={{ gridRow: index + 2, gridColumn: dayIndex + 4 }} className={`${rowColor} border-b border-l border-slate-200 ${[0, 6].includes(day.getUTCDay()) ? 'bg-slate-100' : ''}`} />
                ))}

                {/* Gantt Bar */}
                {durationDays > 0 && startOffset >= 0 &&
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`h-3/5 my-auto bg-gradient-to-r ${barColor} rounded-md flex items-center justify-end pr-2`} style={{ gridRow: index + 2, gridColumn: `${startColumn} / span ${durationDays}` }} title={`${task.name} - ${durationDays} dias`}>
                     {/* Placeholder for comments icon */}
                  </motion.div>
                }
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
