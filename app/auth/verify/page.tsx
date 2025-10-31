// ✅ WayX Email Verification Page v5 — Smart, Elegant, Production-Ready
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  MailCheck,
  Loader2,
  RefreshCw,
  CheckCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const [user, setUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [autoTimer, setAutoTimer] = useState(20);
  const [autoProgress, setAutoProgress] = useState(100);

  const router = useRouter();
  const toastLock = useRef(false);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const toast = (msg: string, type: "info" | "success" | "error" = "info") => {
    if (toastLock.current) return;
    toastLock.current = true;
    (window as any)?.toast?.(msg, type);
    setTimeout(() => (toastLock.current = false), 1200);
  };

  // 🔐 Авторизация
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) {
        toast("⚠️ Войдите в систему для проверки почты", "info");
        router.replace("/auth/login");
      } else {
        setUser(u);
      }
    });
    return () => unsub();
  }, [router]);

  // ⏱️ Авто-проверка каждые 20 сек
  useEffect(() => {
    if (!user || verified) return;
    startAutoCheck();
    return () => stopAutoCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, verified]);

  const startAutoCheck = () => {
    stopAutoCheck();
    pollInterval.current = setInterval(() => handleCheck(false), 20000);
    countdownInterval.current = setInterval(() => {
      setAutoTimer((t) => (t > 1 ? t - 1 : 20));
      setAutoProgress((p) => (p > 5 ? p - 5 : 100));
    }, 1000);
  };

  const stopAutoCheck = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    pollInterval.current = null;
    countdownInterval.current = null;
    setAutoProgress(100);
  };

  // 📤 Повторная отправка
  const handleResend = async () => {
    if (!user) return toast("Сессия истекла. Войдите заново.", "info");
    setSending(true);
    try {
      let domain = "https://wayx.kz";
      if (typeof window !== "undefined") {
        const host = window.location.host;
        if (host.includes("vercel.app")) domain = "https://wayx-kz.vercel.app";
        else if (host.includes("cloudflare")) domain = "https://wayx.pages.dev";
        else if (host.includes("localhost")) domain = "http://localhost:3000";
      }

      await sendEmailVerification(user, {
        url: `${domain}/auth/verified`,
        handleCodeInApp: false,
      });

      toast(`📩 Письмо отправлено повторно на ${user.email}`, "success");
      setAutoTimer(20);
      setAutoProgress(100);
    } catch (e: any) {
      console.error("Ошибка отправки письма:", e);
      toast("❌ Не удалось отправить письмо. Попробуйте позже.", "error");
    } finally {
      setSending(false);
    }
  };

  // 🔍 Проверка вручную
  const handleCheck = async (showToast = true) => {
    if (!user) return;
    setChecking(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        setVerified(true);
        stopAutoCheck();
        toast("✅ Email подтверждён! Добро пожаловать в WayX!", "success");
        setTimeout(() => router.replace("/dashboard"), 1500);
      } else if (showToast) {
        toast("📬 E-mail ещё не подтверждён. Проверьте почту.", "info");
      }
    } catch (err: any) {
      console.error("Ошибка проверки:", err);
      toast("⚠ Ошибка проверки. Попробуйте позже.", "error");
    } finally {
      setChecking(false);
      setAutoTimer(20);
      setAutoProgress(100);
    }
  };

  // 🌀 Загрузка
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 dark:text-blue-400">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  // ✅ Почта подтверждена
  if (verified || user.emailVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black text-center p-6"
      >
        <div className="bg-white/80 dark:bg-gray-800/70 p-8 rounded-2xl shadow-2xl max-w-md w-full backdrop-blur-xl">
          <ShieldCheck className="w-14 h-14 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Email подтверждён 🎉
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-5">
            Добро пожаловать в WayX! Ваш аккаунт активен.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Перейти в панель
          </a>
        </div>
      </motion.div>
    );
  }

  // 💡 Основной UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-all duration-500">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 dark:bg-gray-800/70 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center backdrop-blur-xl"
      >
        <MailCheck className="h-14 w-14 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Подтвердите e-mail
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Мы отправили письмо с подтверждением на{" "}
          <strong>{user.email}</strong>. Перейдите по ссылке, чтобы активировать ваш аккаунт.
        </p>

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={() => handleCheck(true)}
            disabled={checking}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 flex justify-center items-center transition disabled:opacity-70"
          >
            {checking ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" /> Проверяем...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" /> Я подтвердил почту
              </>
            )}
          </button>

          <button
            onClick={handleResend}
            disabled={sending}
            className="w-full border border-blue-500 text-blue-600 dark:text-blue-400 py-3 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition disabled:opacity-70 flex justify-center items-center"
          >
            {sending ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" /> Отправляем...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2" /> Отправить письмо снова
              </>
            )}
          </button>

          <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-4 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-1000 ease-linear"
              style={{ width: `${autoProgress}%` }}
            />
          </div>

          <div className="flex justify-center items-center text-xs text-gray-400 dark:text-gray-500 mt-1">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Автоматическая проверка через {autoTimer} сек.
          </div>

          <a
            href="/auth/login"
            className="text-sm text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 mt-3"
          >
            Вернуться ко входу
          </a>
        </div>

        <div className="text-xs text-gray-400 dark:text-gray-500 mt-5 flex items-center justify-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5" /> WayX: защита и надёжность данных.
        </div>
      </motion.div>
    </div>
  );
}
