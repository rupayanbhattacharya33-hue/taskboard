import { useState } from 'react';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import useNotificationStore from '../store/notificationStore';

const eventLabels = {
  TASK_CREATED: { label: 'Task created', color: 'bg-green-100 text-green-600' },
  TASK_UPDATED: { label: 'Task updated', color: 'bg-blue-100 text-blue-600' },
  TASK_DELETED: { label: 'Task deleted', color: 'bg-red-100 text-red-600' },
};

export default function NotificationBell() {
  const { notifications, markAllRead, clearAll } = useNotificationStore();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllRead}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  title="Mark all read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={clearAll}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Bell className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const config = eventLabels[n.type] || { label: n.type, color: 'bg-slate-100 text-slate-600' };
                  return (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition ${!n.read ? 'bg-indigo-50/40' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0 ${config.color}`}>
                          {config.label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 font-medium truncate">
                            {n.taskTitle || 'A task was changed'}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(n.id).toLocaleTimeString()}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}