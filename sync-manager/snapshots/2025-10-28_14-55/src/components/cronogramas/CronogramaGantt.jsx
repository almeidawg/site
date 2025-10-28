import React, { useMemo } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

const CronogramaGantt = ({ tarefas, onChangeTask }) => {
  const tasks = useMemo(() =>
    tarefas.map(t => ({
      id: t.id,
      name: t.titulo,
      start: new Date(t.inicio),
      end: new Date(t.fim),
      progress: t.progresso,
      type: 'task',
      dependencies: t.dependencia ? [t.dependencia] : [],
      styles: {
        progressColor: '#f59e0b',
        progressSelectedColor: 'white',
        backgroundColor: '#3b82f6',
        backgroundSelectedColor: '#2563eb',
      },
    })), [tarefas]);

  const handleProgressChange = async (task) => {
    await onChangeTask(task);
  };

  const handleDateChange = async (task) => {
    await onChangeTask(task);
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      {tasks.length > 0 ? (
        <Gantt
          tasks={tasks}
          viewMode={ViewMode.Day}
          onDateChange={handleDateChange}
          onProgressChange={handleProgressChange}
          onDoubleClick={(task) => console.log("On Double Click: " + task.name)}
          listCellWidth="155px"
          ganttHeight={400}
          columnWidth={65}
        />
      ) : (
        <p>Não há tarefas para exibir neste cronograma.</p>
      )}
    </div>
  );
};

export default CronogramaGantt;