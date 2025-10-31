"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  ExternalLink,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  listenToNotifications,
  markNotificationRead,
  type Notification,
} from "@/lib/notifications";

type Props = {
  userId: string;
  className?: string;
  maxItems?: number;
};

const typeIcon: Record<Notification["type"], JSX.Element> = {
  success: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  info: <Info className="w-4 h-4 text-blue-600" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-600" />,
  error: <XCircle className="w-4 h-4 text-red-600" />,
};

export default function NotificationsBell({
  userId,
  className = "",
  maxItems = 6,
}: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const bellRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // 🔄 Реактивная подписка
  useEffect(() => {
    if (!userId) return;
    const unsub = listenToNotifications(userId, (list) => {
      setItems(list.slice(0, maxItems));
    });
    return () => unsub();
  }, [userId, maxItems]);

  // 🔐 Закрытие панели при клике вне
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (!open) return;
      if (panelRef.current?.contains(t) || bellRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // 🔢 Подсчёт непрочитанных
  const unread = useMemo(() => items.filter((i) => !i.read).length, [items]);

  // ✅ Пометить уведомление как прочитанное
  const handleMarkRead = async (notif: Notification) => {
    if (!notif.id || notif.read) return;
    await markNotificationRead(userId, notif.id);
    setItems((prev) =>
      prev.map((n) =>
        n.id === notif.id ? { ...n, read: true } : n
      )
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* 🔔 Кнопка колокольчика */}
      <button
        ref={bellRef}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition"
        aria-label="Открыть уведомления"
      >
        <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* 🪄 Панель уведомлений */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-50 mt-2 w-[340px] max-w-[90vw] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
          >
            {/* Заголовок */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Уведомления
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {unread > 0 ? `${unread} новых` : "нет новых"}
              </div>
            </div>

            {/* Список уведомлений */}
            <div className="max-h-[380px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Пока пусто. Здесь появятся новые события.
                </div>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((n) => (
                    <li
                      key={n.id}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                      onClick={() => handleMarkRead(n)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{typeIcon[n.type]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-1">
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="text-[10px] font-semibold text-white bg-blue-600 px-1.5 py-0.5 rounded">
                                новое
                              </span>
                            )}
                          </div>
                          {n.message && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                          )}
                          {n.link && (
                            <Link
                              href={n.link}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1 hover:underline"
                              onClick={() => {
                                handleMarkRead(n);
                                setOpen(false);
                              }}
                            >
                              Открыть <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
