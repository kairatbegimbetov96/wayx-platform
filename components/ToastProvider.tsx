"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  X,
  Bell,
} from "lucide-react";
import DealModal from "@/components/DealModal";

type ToastType = "success" | "info" | "warning" | "error";

type ToastInput = {
  title?: string;
  description?: string;
  type?: ToastType;
  link?: string; // переход по клику или идентификатор сделки
  supplierEmail?: string; // почта участника сделки
  auctionId?: string; // ID аукциона
  amount?: number; // сумма сделки
  durationMs?: number; // время жизни (по умолчанию 4s)
};

type Toast = ToastInput & { id: string; createdAt: number };

const ToastContext = createContext<{
  toast: (t: ToastInput) => void;
  remove: (id: string) => void;
} | null>(null);

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [batch, setBatch] = useState<Toast[]>([]);

  // 🔹 Удаление уведомления
  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 🔹 Создание уведомления
  const toast = useCallback(
    (t: ToastInput) => {
      const id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
      const now = Date.now();
      const newToast: Toast = { id, createdAt: now, ...t };
      const duration = t.durationMs ?? 4000;

      setToasts((prev) => [...prev, newToast]);
      const timer = setTimeout(() => remove(id), duration);
      return () => clearTimeout(timer);
    },
    [remove]
  );

  // 🔹 Группировка уведомлений (batch)
  useEffect(() => {
    if (toasts.length < 3) return;
    const recent = toasts.filter((t) => Date.now() - t.createdAt < 3000);
    if (recent.length >= 3) {
      setBatch(recent);
      setToasts((prev) => prev.filter((t) => !recent.includes(t)));
    }
  }, [toasts]);

  // 🔹 Доступ из консоли
  useEffect(() => {
    (window as any).toast = toast;
  }, [toast]);

  const value = useMemo(() => ({ toast, remove }), [toast, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* 🔔 Отдельные уведомления */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onClose={() => remove(t.id)} />
        ))}

        {/* 🔹 Групповое уведомление */}
        {batch.length > 0 && (
          <div className="w-[340px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-slide-up">
            <Bell className="w-5 h-5 text-blue-500 mt-1" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {batch.length} новых уведомлений
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Откройте панель уведомлений, чтобы просмотреть
              </p>
            </div>
            <button
              onClick={() => setBatch([])}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        )}
      </div>

      {/* 🔹 Анимация */}
      <style jsx global>{`
        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

// ✅ Хук вызова уведомлений
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider />");
  return ctx;
}

// 🔹 Один тост с открытием DealModal
function ToastItem({
  title,
  description,
  type = "info",
  link,
  supplierEmail,
  auctionId,
  amount,
  onClose,
}: Toast & { onClose: () => void }) {
  const [openModal, setOpenModal] = useState(false);

  const palette: Record<
    ToastType,
    { ring: string; bg: string; text: string; Icon: React.ElementType }
  > = {
    success: {
      ring: "ring-green-300 dark:ring-green-700/70",
      bg: "bg-white dark:bg-slate-800",
      text: "text-green-700 dark:text-green-300",
      Icon: CheckCircle2,
    },
    info: {
      ring: "ring-blue-300 dark:ring-blue-700/70",
      bg: "bg-white dark:bg-slate-800",
      text: "text-blue-700 dark:text-blue-300",
      Icon: Info,
    },
    warning: {
      ring: "ring-yellow-300 dark:ring-yellow-700/70",
      bg: "bg-white dark:bg-slate-800",
      text: "text-yellow-700 dark:text-yellow-300",
      Icon: AlertTriangle,
    },
    error: {
      ring: "ring-red-300 dark:ring-red-700/70",
      bg: "bg-white dark:bg-slate-800",
      text: "text-red-700 dark:text-red-300",
      Icon: XCircle,
    },
  };

  const { ring, bg, text, Icon } = palette[type];

  return (
    <>
      {/* 🔸 Тост карточка */}
      <div
        onClick={() => setOpenModal(true)}
        className={`cursor-pointer w-[340px] ${bg} border border-slate-200 dark:border-slate-700 
                    rounded-2xl shadow-2xl ring-1 ${ring} hover:scale-[1.02] 
                    transition-transform animate-slide-up`}
      >
        <div className="p-4 flex gap-3 items-start">
          <Icon className={`w-5 h-5 mt-1 ${text}`} />
          <div className="flex-1">
            {title && (
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </p>
            )}
            {description && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* 🔹 DealModal — детальная информация о ставке */}
      <DealModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        supplierEmail={supplierEmail}
        auctionId={auctionId}
        amount={amount}
      />
    </>
  );
}

