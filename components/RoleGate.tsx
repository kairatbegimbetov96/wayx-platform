// ✅ WayX RoleGate — улучшенная версия (UX, кэш, безопасность)
"use client";

import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";

export default function RoleGate({
  allow,
  children,
}: {
  allow: string[];
  children: ReactNode;
}) {
  const [status, setStatus] = useState<"loading" | "denied" | "ok">("loading");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const cachedRole = sessionStorage.getItem("wayx-role");
    if (cachedRole && allow.includes(cachedRole)) {
      setRole(cachedRole);
      setStatus("ok");
      return;
    }

    const unsub = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) {
        setStatus("denied");
        return;
      }
      try {
        const snap = await getDoc(doc(getFirestore(), "users", user.uid));
        const data = snap.data() as any;
        const userRole = data?.role ?? "client";
        setRole(userRole);
        sessionStorage.setItem("wayx-role", userRole);
        if (allow.includes(userRole)) {
          setStatus("ok");
        } else {
          setStatus("denied");
        }
      } catch (err) {
        console.error("Ошибка получения роли:", err);
        (window as any).toast?.("Ошибка проверки прав доступа", "error");
        setStatus("denied");
      }
    });
    return () => unsub();
  }, [allow]);

  // 🔵 Этап загрузки — плавная анимация
  if (status === "loading")
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen text-blue-600 dark:text-blue-400"
      >
        <div className="animate-pulse text-lg font-medium">
          Проверяем права доступа…
        </div>
      </motion.div>
    );

  // 🚫 Нет доступа
  if (status === "denied")
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-screen text-gray-700 dark:text-gray-200 text-center px-6"
      >
        <p className="text-3xl mb-4">🚫</p>
        <p className="text-xl font-semibold mb-2">Доступ ограничен</p>
        <p className="text-sm opacity-80 mb-6">
          Эта страница доступна только для ролей:{" "}
          <strong>{allow.join(", ")}</strong>
          <br />
          Текущая роль: {role ?? "не авторизован"}
        </p>

        {!role ? (
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition"
          >
            Войти в систему
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 hover:bg-gray-200 rounded-xl transition"
          >
            Вернуться на главную
          </Link>
        )}
      </motion.div>
    );

  // ✅ Доступ разрешён
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
