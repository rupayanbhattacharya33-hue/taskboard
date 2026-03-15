import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (notification) => {
    set((state) => ({
      notifications: [
        { ...notification, id: Date.now(), read: false },
        ...state.notifications,
      ].slice(0, 20), // keep max 20
    }));
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  clearAll: () => set({ notifications: [] }),
}));

export default useNotificationStore;