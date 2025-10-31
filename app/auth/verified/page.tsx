// ✅ WayX — Verified Page (v7 PRO, production-stable)
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getAuth,
  onAuthStateChanged,
  applyActionCode,
  signInWithEmailAndPassword,
} from "firebase/auth";
import app from "@/lib/firebase";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Timer,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogIn,
} from "lucide-react";

export default function VerifiedPage() {
  const router = useRouter();
  const params = useSearchParams();
  const auth = useMemo(() => getAuth(app), []);

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [autoLogin, setAutoLogin] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [counter, setCounter] = useState(5);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const oobCode = params.get("oobCode");

  // 🔔 Уведомления (глобальный toast)
  const toast = (msg: string, type: "success" | "info" | "error" = "info") => {
    (window as any)?.toast?.(msg, type) ??
      console.log(`[${type.toUpperCase()}] ${msg}`);
  };

  // 🌐 Проверка и подтверждение e-mail
  useEffect(() => {
    async function verifyEmail() {
      try {
        if (!oobCode) {
          // 🧩 Нет кода — просто проверяем текущего пользователя
          const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
              await user.reload();
              if (user.emailVerified) {
                setVerified(true);
                startRedirect(true);
              } else {
                setVerified(false);
              }
            } else {
              setVerified(false);
            }
            unsub();
          });
          return;
        }

        // ✅ Применяем код подтверждения
        await applyActionCode(auth, oobCode);
        toast("✅ E-mail подтверждён!", "success");
        setVerified(true);

        // 🔐 Автоматический вход (если сохранены данные)
        const saved = localStorage.getItem("wayxUser");
        if (saved) {
          try {
            const creds = JSON.parse(saved);
            if (creds.email && creds.password) {
              setAutoLogin(true);
              await signInWithEmailAndPassword(auth, creds.email, creds.password);
              toast("🔐 Автоматический вход выполнен", "success");
              startRedirect(true);
              return;
            }
          } catch (e) {
            console.warn("Auto-login failed:", e);
            toast("⚠️ Автовход не выполнен. Войдите вручную.", "error");
          }
        }

        // ➡️ Без автологина — просто редирект
        startRedirect(false);
      } catch (err: any) {
        console.error("Verification error:", err);
        let message = "Не удалось подтвердить e-mail.";

        // 🎯 Расширенная обработка Firebase ошибок
        switch (err.code) {
          case "auth/invalid-action-code":
            message = "Ссылка недействительна или устарела.";
            break;
          case "auth/expired-action-code":
            message = "Срок действия ссылки истёк.";
            break;
          case "auth/too-many-requests":
            message =
              "Слишком много попыток подтверждения. Попробуйте через 30–60 минут.";
            break;
          case "auth/network-request-failed":
            message = "Ошибка сети. Проверьте подключение к интернету.";
            break;
        }

        setErrorText(message);
        setVerified(false);
      } finally {
        setLoading(false);
      }
    }

    verifyEmail();
    return () => clearAllTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⏳ Очистка таймеров
  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // 🚀 Автопереход (в зависимости от статуса)
  const startRedirect = (goDashboard: boolean) => {
    clearAllTimers();
    setCounter(5);

    intervalRef.current = setInterval(() => {
      setCounter((c) => (c > 1 ? c - 1 : 0));
    }, 1000);

    timerRef.current = setTimeout(() => {
      localStorage.removeItem("wayxUser");
      router.replace(goDashboard ? "/dashboard" : "/auth/login");
    }, 5000);
  };

  // 🌀 Состояние загрузки
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 dark:text-blue-400">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );

  // ⚠️ Ошибка
  if (verified === false || errorText) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black"
      >
        <div className="bg-white/80 dark:bg-gray-800/70 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full backdrop-blur-xl">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
            Ошибка подтверждения
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-5">
            {errorText || "Код подтверждения недействителен или устарел."}
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Перейти ко входу
          </Link>
        </div>
      </motion.div>
    );
  }

  // ✅ Успешное подтверждение
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="p-8 bg-white/80 dark:bg-gray-800/70 rounded-2xl shadow-2xl text-center backdrop-blur-xl max-w-md w-full"
      >
        <div className="flex justify-center mb-4">
          <ShieldCheck className="w-14 h-14 text-green-500 drop-shadow-md" />
        </div>

        <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
          E-mail успешно подтверждён!
        </h1>

        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          Ваш аккаунт активирован и готов к использованию.
          {autoLogin
            ? " Мы выполнили автоматический вход."
            : " Теперь вы можете войти в систему."}
        </p>

        <div className="mt-6">
          <Link
            href={autoLogin ? "/dashboard" : "/auth/login"}
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-transform hover:scale-[1.02]"
          >
            {autoLogin ? (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Перейти в дашборд
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Перейти ко входу
              </>
            )}
          </Link>
        </div>

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            <p>
              Автопереход через {counter} сек.{" "}
              {autoLogin ? "(в дашборд)" : "(на вход)"}
            </p>
          </div>
          {counter <= 2 && (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin mt-1" />
          )}
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-5">
          🔒 WayX — инновации, доверие и надёжность в каждой доставке.
        </p>
      </motion.div>
    </div>
  );
}
