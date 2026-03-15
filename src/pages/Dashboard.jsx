import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBoardStore from '../store/boardStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Plus, Layout, Trash2, Loader, LogOut, ChevronRight, Sparkles, BarChart2 } from 'lucide-react';

export default function Dashboard() {
  const { boards, fetchBoards, createBoard, deleteBoard, isLoading } = useBoardStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchBoards(); }, []);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    setCreating(true);
    const board = await createBoard({ title, description, color });
    setCreating(false);
    if (board) {
      toast.success('Board created! 🎉');
      setShowModal(false);
      setTitle(''); setDescription(''); setColor('#4F46E5');
    } else toast.error('Failed to create board');
  };

  const handleDeleteBoard = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this board?')) return;
    const success = await deleteBoard(id);
    if (success) toast.success('Board deleted');
    else toast.error('Failed to delete board');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const colors = ['#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#D97706', '#059669', '#0891B2'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">TaskBoard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5 border border-white/10">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-xs">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-white/80 text-sm font-medium hidden sm:block">{user?.name}</span>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-1.5 text-white/50 hover:text-indigo-400 transition text-sm px-3 py-1.5 rounded-xl hover:bg-white/5 border border-white/10"
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:block">Analytics</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-white/50 hover:text-red-400 transition text-sm px-3 py-1.5 rounded-xl hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Hero Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="text-indigo-400 text-sm font-medium">Your workspace</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">My Boards</h1>
            <p className="text-white/40 text-sm">{boards.length} board{boards.length !== 1 ? 's' : ''} · Stay organized, ship faster</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transform"
          >
            <Plus className="w-4 h-4" />
            New Board
          </button>
        </div>

        {/* Boards Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Layout className="w-9 h-9 text-indigo-400" />
            </div>
            <h3 className="text-white font-semibold text-xl mb-2">No boards yet</h3>
            <p className="text-white/40 text-sm mb-6">Create your first board and start organizing</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition hover:-translate-y-0.5 transform shadow-lg shadow-indigo-500/30"
            >
              Create your first board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {boards.map((board) => (
              <div
                key={board._id}
                onClick={() => navigate(`/board/${board._id}`)}
                className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                {/* Gradient accent top bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-80"
                  style={{ background: `linear-gradient(to right, ${board.color || '#4F46E5'}, ${board.color || '#4F46E5'}99)` }}
                />
                <div
                  className="w-11 h-11 rounded-xl mb-5 shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: board.color || '#4F46E5', boxShadow: `0 8px 20px ${board.color || '#4F46E5'}40` }}
                >
                  <Layout className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg mb-1 group-hover:text-indigo-300 transition">
                  {board.title}
                </h3>
                {board.description && (
                  <p className="text-white/40 text-sm line-clamp-2 mb-4">{board.description}</p>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <span className="text-xs text-white/30">{new Date(board.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteBoard(e, board._id)}
                      className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-indigo-400 transition" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-6">Create New Board</h2>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Board Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Marketing Campaign"
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this board for?"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Color</label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
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
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-purple-700"
                >
                  {creating ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}