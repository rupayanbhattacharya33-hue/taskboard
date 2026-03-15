import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const columnConfig = {
  'todo': {
    label: 'To Do',
    color: 'text-slate-400',
    dot: 'bg-slate-400',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/20',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'text-blue-400',
    dot: 'bg-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  'done': {
    label: 'Done',
    color: 'text-green-400',
    dot: 'bg-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
  },
};

export default function Column({ status, tasks, onAddTask, onDeleteTask, onTaskClick }) {
  const config = columnConfig[status];
  const columnTasks = tasks.filter((t) => t.status === status);

  return (
    <div className={`flex flex-col bg-white/3 backdrop-blur-sm rounded-2xl border ${config.border} w-80 flex-shrink-0`}
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
            {config.label}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
            {columnTasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="p-1 text-white/20 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-3 p-3 min-h-[200px] flex-1 rounded-b-2xl transition-colors duration-200 ${
              snapshot.isDraggingOver ? 'bg-indigo-500/5' : ''
            }`}
          >
            {columnTasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onDelete={onDeleteTask}
                onClick={onTaskClick}
              />
            ))}
            {provided.placeholder}

            {columnTasks.length === 0 && !snapshot.isDraggingOver && (
              <div
                onClick={() => onAddTask(status)}
                className="flex-1 flex flex-col items-center justify-center py-10 cursor-pointer group rounded-xl border border-dashed border-white/5 hover:border-indigo-500/30 transition"
              >
                <Plus className="w-5 h-5 text-white/10 group-hover:text-indigo-400 transition mb-1" />
                <p className="text-white/10 group-hover:text-indigo-400 text-xs transition">Add task</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}