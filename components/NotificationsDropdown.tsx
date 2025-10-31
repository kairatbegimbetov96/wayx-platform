"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Bell, Check } from "lucide-react";

type Notice = {
  id: string;
  title: string;
  message?: string;
  link?: string;
  read?: boolean;
  createdAt?: any;
};

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notice[]>([]);
  const [unread, setUnread] = useState(0);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // live-подписка
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;

    const q = query(
      collection(db, "notifications"),
      where("uid", "==", u.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Notice[];
      setItems(list);
      setUnread(list.filter((n) => !n.read).length);
    });
    return () => unsub();
  }, []);

  // клик вне — закрыть
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(t) &&
        btnRef.current &&
        !btnRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const markOne = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
  };

  const markAll = async () => {
    // оптимистично пометим локально
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    // и по-очереди отправим апдейты
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id);
    await Promise.all(unreadIds.map((id) => updateDoc(doc(db, "notifications", id), { read: true })));
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((s) => !s)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Открыть уведомления"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-[360px] max-w-[90vw] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl overflow-hidden z-50"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="font-semibold">Уведомления</div>
            {items.length > 0 && (
              <button
                onClick={markAll}
                className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Check className="w-3.5 h-3.5" />
                Отметить всё
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-gray-500">
              Уведомлений пока нет.
            </div>
          ) : (
            <ul className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((n) => (
                <li key={n.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className={`font-medium ${!n.read ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-300"}`}>
                        {n.title}
                      </div>
                      {n.message && (
                        <div className="text-sm text-gray-500 mt-0.5">{n.message}</div>
                      )}
                      {n.link && (
                        <Link
                          href={n.link}
                          className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-1 inline-block"
                          onClick={() => setOpen(false)}
                        >
                          Открыть →
                        </Link>
                      )}
                    </div>

                    {!n.read && (
                      <button
                        onClick={() => markOne(n.id)}
                        className="text-xs px-2 py-1 rounded border border-green-600 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Отметить прочитанным"
                      >
                        <Check className="w-3.5 h-3.5 inline" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 text-right">
            <Link
              href="/notifications"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              onClick={() => setOpen(false)}
            >
              Все уведомления →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
