import { create } from 'zustand';
import api from '../api/axios';

const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoard: null,
  tasks: [],
  isLoading: false,
  error: null,

  // ── Get all boards ────────────────────────────────────────
  fetchBoards: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/boards');
      set({ boards: res.data.boards, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message, isLoading: false });
    }
  },

  // ── Get single board ──────────────────────────────────────
  fetchBoard: async (id) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/boards/${id}`);
      set({ currentBoard: res.data.board, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message, isLoading: false });
    }
  },

  // ── Create board ──────────────────────────────────────────
  createBoard: async (data) => {
    try {
      const res = await api.post('/boards', data);
      set((state) => ({ boards: [res.data.board, ...state.boards] }));
      return res.data.board;
    } catch (err) {
      set({ error: err.response?.data?.message });
      return null;
    }
  },

  // ── Delete board ──────────────────────────────────────────
  deleteBoard: async (id) => {
    try {
      await api.delete(`/boards/${id}`);
      set((state) => ({ boards: state.boards.filter((b) => b._id !== id) }));
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message });
      return false;
    }
  },

  // ── Get tasks for a board ─────────────────────────────────
  fetchTasks: async (boardId) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/boards/${boardId}/tasks`);
      set({ tasks: res.data.tasks, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message, isLoading: false });
    }
  },

  // ── Create task ───────────────────────────────────────────
  createTask: async (boardId, data) => {
    try {
      const res = await api.post(`/boards/${boardId}/tasks`, data);
      set((state) => ({ tasks: [...state.tasks, res.data.task] }));
      return res.data.task;
    } catch (err) {
      set({ error: err.response?.data?.message });
      return null;
    }
  },

  // ── Update task ───────────────────────────────────────────
  updateTask: async (boardId, taskId, data) => {
    try {
      const res = await api.put(`/boards/${boardId}/tasks/${taskId}`, data);
      set((state) => ({
        tasks: state.tasks.map((t) => t._id === taskId ? res.data.task : t),
      }));
      return res.data.task;
    } catch (err) {
      set({ error: err.response?.data?.message });
      return null;
    }
  },

  // ── Delete task ───────────────────────────────────────────
  deleteTask: async (boardId, taskId) => {
    try {
      await api.delete(`/boards/${boardId}/tasks/${taskId}`);
      set((state) => ({ tasks: state.tasks.filter((t) => t._id !== taskId) }));
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message });
      return false;
    }
  },

  // ── Real-time update from WebSocket ───────────────────────
 addTaskRealtime: (task) => {
  set((state) => ({
    tasks: state.tasks.find(t => t._id === task._id)
      ? state.tasks
      : [...state.tasks, task]
  }));
},
  updateTaskRealtime: (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => t._id === task._id ? task : t),
    }));
  },
  deleteTaskRealtime: (taskId) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t._id !== taskId) }));
  },
}));

export default useBoardStore;