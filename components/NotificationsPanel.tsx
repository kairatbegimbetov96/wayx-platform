"use client";

import { useEffect, useState } from "react";
import { listenToNotifications, Notification } from "@/lib/notifications";
import { auth } from "@/lib/firebase";
import { Bell, CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";

export default function NotificationsPanel() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsub = listenToNotifications(user.email!, (data) => setItems(data));
    return () => unsub();
  }, []);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >
        <Bell className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        {items.some((n) => !n.read) && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-slate-200 dark:border-slate-700 z-50">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-200">
            Уведомления
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <div className="p-6 text-center text-slate-500">
                Нет уведомлений
              </div>
            )}
            {items.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {icons[n.type]}
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {n.title}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {n.message}
                  </p>
                  {n.link && (
                    <a
                      href={n.link}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Открыть
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
