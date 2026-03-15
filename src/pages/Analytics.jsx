import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBoardStore from '../store/boardStore';
import useAuthStore from '../store/authStore';
import { ArrowLeft, BarChart2, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const { boards, tasks, fetchBoards, fetchTasks } = useBoardStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      await fetchBoards();
      setLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      if (boards.length === 0) return;
      const taskArrays = await Promise.all(
        boards.map(async (board) => {
          await fetchTasks(board._id);
          return useBoardStore.getState().tasks;
        })
      );
      const unique = Array.from(
        new Map(taskArrays.flat().map(t => [t._id, t])).values()
      );
      setAllTasks(unique);
    };
    loadTasks();
  }, [boards]);

  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = allTasks.filter(t => t.status === 'todo').length;
  const overdueTasks = allTasks.filter(t =>
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  ).length;
  const highPriority = allTasks.filter(t => t.priority === 'high').length;
  const mediumPriority = allTasks.filter(t => t.priority === 'medium').length;
  const lowPriority = allTasks.filter(t => t.priority === 'low').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const StatCard = ({ icon: Icon, label, value, color, sub }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-white/40 text-sm">{label}</div>
      {sub && <div className="text-white/20 text-xs mt-1">{sub}</div>}
    </div>
  );

  const BarChart = ({ data, max }) => (
    <div className="flex items-end gap-3 h-32">
      {data.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-2 flex-1">
          <span className="text-white/40 text-xs font-medium">{item.value}</span>
          <div className="w-full rounded-t-lg transition-all duration-700 relative overflow-hidden"
            style={{ height: `${max > 0 ? (item.value / max) * 80 : 0}px`, minHeight: '4px', background: item.color }}
          >
            <div className="absolute inset-0 bg-white/10" />
          </div>
          <span className="text-white/40 text-xs">{item.label}</span>
        </div>
      ))}
    </div>
  );

  const DonutSegment = ({ percentage, color, offset }) => {
    const r = 40;
    const circ = 2 * Math.PI * r;
    const dash = (percentage / 100) * circ;
    return (
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.7s ease' }}
      />
    );
  };

  const priorityTotal = highPriority + mediumPriority + lowPriority || 1;
  const highPct = Math.round((highPriority / priorityTotal) * 100);
  const medPct = Math.round((mediumPriority / priorityTotal) * 100);
  const lowPct = Math.round((lowPriority / priorityTotal) * 100);

  const circ = 2 * Math.PI * 40;
  const highDash = (highPct / 100) * circ;
  const medDash = (medPct / 100) * circ;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              <h1 className="font-bold text-white">Analytics</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5 border border-white/10">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-xs">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-white/60 text-sm">{user?.name}</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-1">Your Workspace Stats</h2>
          <p className="text-white/40 text-sm">{boards.length} boards · {totalTasks} total tasks</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={CheckCircle} label="Completed" value={doneTasks} color="bg-green-500/20" sub={`${completionRate}% completion rate`} />
              <StatCard icon={Clock} label="In Progress" value={inProgressTasks} color="bg-blue-500/20" sub="Active tasks" />
              <StatCard icon={TrendingUp} label="To Do" value={todoTasks} color="bg-indigo-500/20" sub="Pending tasks" />
              <StatCard icon={AlertTriangle} label="Overdue" value={overdueTasks} color="bg-red-500/20" sub="Need attention" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Completion Rate Ring */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
                <h3 className="text-white font-semibold mb-4 self-start">Completion Rate</h3>
                <div className="relative">
                  <svg viewBox="0 0 100 100" className="w-36 h-36 -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="url(#grad)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(completionRate / 100) * 2 * Math.PI * 40} ${2 * Math.PI * 40}`}
                      style={{ transition: 'stroke-dasharray 0.7s ease' }}
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{completionRate}%</span>
                    <span className="text-white/30 text-xs">done</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-4 text-xs text-white/40">
                  <span>{doneTasks} done</span>
                  <span>·</span>
                  <span>{totalTasks - doneTasks} remaining</span>
                </div>
              </div>

              {/* Status Bar Chart */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-6">Tasks by Status</h3>
                <BarChart
                  max={Math.max(todoTasks, inProgressTasks, doneTasks, 1)}
                  data={[
                    { label: 'To Do', value: todoTasks, color: 'linear-gradient(to top, #64748b, #94a3b8)' },
                    { label: 'In Progress', value: inProgressTasks, color: 'linear-gradient(to top, #3b82f6, #60a5fa)' },
                    { label: 'Done', value: doneTasks, color: 'linear-gradient(to top, #22c55e, #4ade80)' },
                  ]}
                />
              </div>

              {/* Priority Breakdown */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Priority Breakdown</h3>
                <div className="space-y-4 mt-6">
                  {[
                    { label: 'High', value: highPriority, pct: highPct, color: 'bg-red-500', textColor: 'text-red-400' },
                    { label: 'Medium', value: mediumPriority, pct: medPct, color: 'bg-yellow-500', textColor: 'text-yellow-400' },
                    { label: 'Low', value: lowPriority, pct: lowPct, color: 'bg-green-500', textColor: 'text-green-400' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className={item.textColor}>{item.label}</span>
                        <span className="text-white/40">{item.value} tasks · {item.pct}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-700`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Boards Overview */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Boards Overview</h3>
              {boards.length === 0 ? (
                <p className="text-white/30 text-sm">No boards yet</p>
              ) : (
                <div className="space-y-3">
                  {boards.map((board) => (
                    <div
                      key={board._id}
                      onClick={() => navigate(`/board/${board._id}`)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: board.color || '#4F46E5' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium text-sm group-hover:text-indigo-300 transition truncate">{board.title}</span>
                          <span className="text-white/30 text-xs flex-shrink-0 ml-2">{board._taskCount || 0} tasks</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: '0%',
                              background: `linear-gradient(to right, ${board.color || '#6366f1'}, #a855f7)`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}