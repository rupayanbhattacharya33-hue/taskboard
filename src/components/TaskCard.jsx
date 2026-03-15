import { Draggable } from '@hello-pangea/dnd';
import { Trash2, Calendar, Flag, AlertTriangle } from 'lucide-react';

const priorityConfig = {
  high: { color: 'bg-red-500/20 text-red-400 border border-red-500/20', label: 'High' },
  medium: { color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20', label: 'Medium' },
  low: { color: 'bg-green-500/20 text-green-400 border border-green-500/20', label: 'Low' },
};

const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false;
  return new Date(dueDate) < new Date();
};

const isDueSoon = (dueDate, status) => {
  if (!dueDate || status === 'done') return false;
  const diff = new Date(dueDate) - new Date();
  return diff > 0 && diff < 1000 * 60 * 60 * 24 * 2; // within 2 days
};

export default function TaskCard({ task, index, onDelete, onClick }) {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const overdue = isOverdue(task.dueDate, task.status);
  const dueSoon = isDueSoon(task.dueDate, task.status);

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`relative rounded-xl border p-4 cursor-pointer transition-all duration-200 group
            ${snapshot.isDragging
              ? 'shadow-2xl shadow-indigo-500/30 rotate-1 scale-105 bg-slate-800 border-indigo-500/50'
              : overdue
              ? 'bg-red-500/5 border-red-500/30 hover:border-red-400/50 hover:bg-red-500/10'
              : 'bg-white/5 border-white/10 hover:border-indigo-500/40 hover:bg-white/10'
            }`}
        >
          {/* Overdue banner */}
          {overdue && (
            <div className="flex items-center gap-1.5 mb-2 text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Overdue</span>
            </div>
          )}

          {/* Due soon banner */}
          {dueSoon && !overdue && (
            <div className="flex items-center gap-1.5 mb-2 text-yellow-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Due soon</span>
            </div>
          )}

          {/* Priority + delete */}
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${priority.color}`}>
              <Flag className="w-3 h-3" />
              {priority.label}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
              className="p-1 text-white/20 hover:text-red-400 rounded transition opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Title */}
          <h4 className="text-white font-medium text-sm leading-snug">{task.title}</h4>

          {/* Description */}
          {task.description && (
            <p className="text-white/30 text-xs mt-1 line-clamp-2">{task.description}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            {task.dueDate ? (
              <span className={`flex items-center gap-1 text-xs font-medium ${
                overdue ? 'text-red-400' : dueSoon ? 'text-yellow-400' : 'text-white/30'
              }`}>
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            ) : <span />}
            {task.assignee && (
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {task.assignee.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Overdue left border accent */}
          {overdue && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl" />
          )}
          {dueSoon && !overdue && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-l-xl" />
          )}
        </div>
      )}
    </Draggable>
  );
}