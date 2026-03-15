import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const columnConfig = {
  'todo': {
    label: 'To Do',
    color: 'bg-slate-100 text-slate-600',
    dot: 'bg-slate-400',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-600',
    dot: 'bg-blue-500',
  },
  'done': {
    label: 'Done',
    color: 'bg-green-100 text-green-600',
    dot: 'bg-green-500',
  },
};

export default function Column({ status, tasks, onAddTask, onDeleteTask, onTaskClick }) {
  const config = columnConfig[status];
  const columnTasks = tasks.filter((t) => t.status === status);

  return (
    <div className="flex flex-col bg-slate-50 rounded-2xl border border-slate-200 w-80 flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
            {config.label}
          </span>
          <span className="text-xs text-slate-400 font-medium">{columnTasks.length}</span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
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
            className={`flex flex-col gap-3 p-3 min-h-[200px] flex-1 rounded-b-2xl transition-colors ${
              snapshot.isDraggingOver ? 'bg-indigo-50' : ''
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
              <div className="flex-1 flex items-center justify-center py-8">
                <p className="text-slate-300 text-xs text-center">Drop tasks here</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}