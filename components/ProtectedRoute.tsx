// ✅ WayX ProtectedRoute — улучшенная и безопасная версия (final)
// Путь: components/ProtectedRoute.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

/**
 * ProtectedRoute — защищает страницы от неавторизованных пользователей.
 * ▸ Если пользователь не вошёл — перенаправляет на /auth/login.
 * ▸ Если e-mail не подтверждён — мягко проверяет user.reload() и ведёт на /auth/verify.
 * ▸ Использует sessionStorage для быстрого UX при последующих переходах.
 * ▸ Предотвращает двойные редиректы/тосты (debounce).
 */
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // refs для защиты от «дребезга»
  const redirectedRef = useRef(false);
  const toastedRef = useRef(false);
  const unmountedRef = useRef(false);

  // безопасный toast
  const toast = (msg: string, type: "info" | "success" | "error" = "info") => {
    if (toastedRef.current) return;
    toastedRef.current = true;
    (window as any)?.toast?.(msg, type);
    // сброс через небольшой интервал, чтобы не спамить
    setTimeout(() => {
      toastedRef.current = false;
    }, 1200);
  };

  // Попытаться сделать мягкий редирект один раз
  const safeReplace = (href: string) => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    router.replace(href);
  };

  useEffect(() => {
    unmountedRef.current = false;

    // 1) Быстрый старт из кэша (UX)
    const cached = sessionStorage.getItem("wayx-user");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Не считаем это полноценным User, но для UX — отрисуем быстро
        setUser(parsed as any);
        setLoading(false);
      } catch {
        sessionStorage.removeItem("wayx-user");
      }
    }

    // 2) Актуальное состояние Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Если компонент уже размонтирован — ничего не делаем
      if (unmountedRef.current) return;

      try {
        if (!currentUser) {
          // Нет пользователя
          sessionStorage.removeItem("wayx-user");
          setUser(null);
          setLoading(false);
          toast("⚠️ Войдите в систему, чтобы получить доступ", "info");
          safeReplace("/auth/login");
          return;
        }

        // Пробуем «освежить» объект пользователя (важно после подтверждения e-mail)
        try {
          await currentUser.reload();
        } catch {
          // игнор — иногда reload кидает на мобильных сетях
        }

        if (!currentUser.emailVerified) {
          setUser(null);
          setLoading(false);
          toast("📩 Подтвердите e-mail, чтобы продолжить", "info");
          safeReplace("/auth/verify");
          return;
        }

        // ОК — пользователь авторизован и подтверждён
        const { uid, email, displayName } = currentUser;
        const light = { uid, email, displayName };
        sessionStorage.setItem("wayx-user", JSON.stringify(light));
        setUser(currentUser);
        setLoading(false);
      } catch {
        // Любая ошибка — ведём на вход (fail-safe)
        sessionStorage.removeItem("wayx-user");
        setUser(null);
        setLoading(false);
        safeReplace("/auth/login");
      }
    });

    return () => {
      unmountedRef.current = true;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🌀 Загрузка/проверка доступа
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen text-blue-600 dark:text-blue-400"
      >
        <Loader2 className="animate-spin w-10 h-10 mb-2" />
        <p className="text-sm font-medium">Проверка доступа…</p>
      </motion.div>
    );
  }

  // 🚷 Нет пользователя (редирект уже запущен)
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen text-gray-600 dark:text-gray-300"
      >
        <ShieldAlert className="w-12 h-12 text-amber-500 mb-3" />
        <p className="text-lg font-medium mb-2">Доступ ограничен</p>
        <p className="text-sm opacity-80">Переадресация на страницу входа…</p>
      </motion.div>
    );
  }

  // ✅ Доступ разрешён
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full"
    >
      <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 px-4 pt-2">
        <ShieldCheck className="w-4 h-4 text-blue-500" />
        <span>
          Защищённый раздел WayX — вошёл как <strong>{(user as any).email}</strong>
        </span>
      </div>
      {children}
    </motion.div>
  );
}
