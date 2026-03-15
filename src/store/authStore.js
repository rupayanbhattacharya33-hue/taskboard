import { create } from 'zustand';
import api from '../api/axios';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const retryRequest = async (fn, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      return result;
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(delay);
    }
  }
};

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await retryRequest(() =>
        api.post('/auth/register', { name, email, password })
      );
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      set({ user: res.data.user, token: res.data.token, isLoading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', isLoading: false });
      return false;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await retryRequest(() =>
        api.post('/auth/login', { email, password })
      );
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      set({ user: res.data.user, token: res.data.token, isLoading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;