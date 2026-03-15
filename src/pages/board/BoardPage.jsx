import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import useBoardStore from '../../store/boardStore';
import useAuthStore from '../../store/authStore';
import Column from '../../components/Column';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Loader, X } from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';
import useNotificationStore from '../../store/notificationStore';

export default function BoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBoard, tasks, fetchBoard, fetchTasks, createTask, updateTask, deleteTask, isLoading } = useBoardStore();
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const [showModal, setShowModal] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchBoard(id);
    fetchTasks(id);
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const ws = new WebSocket('ws://localhost:5000');
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'JOIN_BOARD', boardId: id, token }));
    };
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'TASK_CREATED') {
        useBoardStore.getState().addTaskRealtime(msg.task);
        addNotification({ type: 'TASK_CREATED', taskTitle: msg.task.title });
      }
      if (msg.type === 'TASK_UPDATED') {
        useBoardStore.getState().updateTaskRealtime(msg.task);
        addNotification({ type: 'TASK_UPDATED', taskTitle: msg.task.title });
      }
      if (msg.type === 'TASK_DELETED') {
        useBoardStore.getState().deleteTaskRealtime(msg.taskId);
        addNotification({ type: 'TASK_DELETED', taskTitle: 'A task' });
      }
    };
    return () => ws.close();
  }, [id]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    await updateTask(id, draggableId, { status: destination.droppableId });
    toast.success('Task moved!');
  };

  const handleAddTask = (status) => {
    setDefaultStatus(status);
    setShowModal(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreating(true);
    const task = await createTask(id, {
      title: taskTitle,
      description: taskDesc,
      priority: taskPriority,
      status: defaultStatus,
      dueDate: taskDueDate || null,
    });
    setCreating(false);
    if (task) {
      toast.success('Task created!');
      setShowModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('medium');
      setTaskDueDate('');
    } else {
      toast.error('Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    const success = await deleteTask(id, taskId);
    if (success) toast.success('Task deleted');
    else toast.error('Failed to delete task');
  };

  // Progress calculations
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  if (isLoading && !currentBoard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col">

      {/* Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex-shrink-0">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-white/50 hover:text-indigo-400 transition text-sm px-3 py-1.5 rounded-xl hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Boards</span>
            </button>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg shadow-lg"
                style={{
                  backgroundColor: currentBoard?.color || '#4F46E5',
                  boxShadow: `0 4px 12px ${currentBoard?.color || '#4F46E5'}50`
                }}
              />
              <h1 className="font-bold text-white">{currentBoard?.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={() => handleAddTask('todo')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 transform"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="px-6 py-3 border-b border-white/5 bg-slate-900/40 flex-shrink-0">
          <div className="flex items-center gap-6">
            {/* Stats */}
            <div className="flex items-center gap-4 text-xs flex-shrink-0">
              <span className="flex items-center gap-1.5 text-white/40">
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                {todoTasks} to do
              </span>
              <span className="flex items-center gap-1.5 text-white/40">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                {inProgressTasks} in progress
              </span>
              <span className="flex items-center gap-1.5 text-white/40">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                {doneTasks} done
              </span>
            </div>
            {/* Bar */}
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPct}%`,
                    background: progressPct === 100
                      ? 'linear-gradient(to right, #22c55e, #10b981)'
                      : 'linear-gradient(to right, #6366f1, #a855f7)',
                  }}
                />
              </div>
              <span className={`text-xs font-bold flex-shrink-0 ${
                progressPct === 100 ? 'text-green-400' : 'text-white/40'
              }`}>
                {progressPct === 100 ? '🎉 100%' : `${progressPct}%`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6 relative">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full min-w-max">
            {['todo', 'in-progress', 'done'].map((status) => (
              <Column
                key={status}
                status={status}
                tasks={tasks}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onTaskClick={setSelectedTask}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Task</h2>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Design landing page"
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Description</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Optional details..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="low" className="bg-slate-800">Low</option>
                    <option value="medium" className="bg-slate-800">Medium</option>
                    <option value="high" className="bg-slate-800">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-white/10 text-white/60 rounded-xl font-semibold hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  {creating ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                selectedTask.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                selectedTask.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {selectedTask.priority} priority
              </span>
              <button onClick={() => setSelectedTask(null)} className="text-white/40 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{selectedTask.title}</h2>
            {selectedTask.description && (
              <p className="text-white/40 text-sm mb-4">{selectedTask.description}</p>
            )}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-white/40">Status</span>
                <span className="font-medium text-white capitalize">{selectedTask.status.replace('-', ' ')}</span>
              </div>
              {selectedTask.dueDate && (
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40">Due Date</span>
                  <span className={`font-medium ${
                    new Date(selectedTask.dueDate) < new Date() && selectedTask.status !== 'done'
                      ? 'text-red-400' : 'text-white'
                  }`}>
                    {new Date(selectedTask.dueDate).toLocaleDateString()}
                    {new Date(selectedTask.dueDate) < new Date() && selectedTask.status !== 'done' && ' ⚠️ Overdue'}
                  </span>
                </div>
              )}
              {selectedTask.assignee && (
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40">Assignee</span>
                  <span className="font-medium text-white">{selectedTask.assignee.name}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedTask(null)}
              className="w-full mt-6 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}