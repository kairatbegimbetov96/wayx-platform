"use client";

import { useEffect, useRef, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Mail, Loader2, ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import Link from "next/link";

/**
 * ✅ WayX — Forgot Password Page (v4, production-ready)
 * - Отправляет письмо для сброса пароля с корректным редиректом.
 * - Поддерживает Vercel, Cloudflare и продакшн-домены.
 * - Уровень UX — как Kaspi / Indriver / Amazon.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toastLock = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // 🔔 Toast helper
  const toast = (msg: string, type: "info" | "success" | "error" = "info") => {
    if (toastLock.current) return;
    toastLock.current = true;
    (window as any)?.toast?.(msg, type);
    setTimeout(() => (toastLock.current = false), 1000);
  };

  // 🎯 Автофокус на поле e-mail
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // 📤 Отправка письма для сброса пароля
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast("Введите e-mail", "info");

    setLoading(true);
    setSent(false);

    try {
      let domain = "https://wayx.kz";
      if (typeof window !== "undefined") {
        const host = window.location.host;
        if (host.includes("vercel.app")) domain = "https://wayx-kz.vercel.app";
        if (host.includes("cloudflare")) domain = "https://wayx.pages.dev";
        if (host.includes("localhost")) domain = "http://localhost:3000";
      }

      const actionCodeSettings = {
        url: `${domain}/auth/action?mode=resetPassword`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
      toast("📩 Письмо для сброса пароля отправлено!", "success");
      setSent(true);
      setEmail("");
    } catch (error: any) {
      console.error("Ошибка сброса пароля:", error);
      const message =
        error.code === "auth/user-not-found"
          ? "Пользователь с таким e-mail не найден."
          : "Не удалось отправить письмо. Попробуйте позже.";
      toast("❌ " + message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 💡 UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-500">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 dark:bg-gray-800/70 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 backdrop-blur-xl"
      >
        {/* Заголовок */}
        <div className="text-center space-y-3">
          <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto" />
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
            Восстановление пароля
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Введите e-mail, указанный при регистрации, и мы отправим ссылку для сброса пароля.
          </p>
        </div>

        {/* Поле ввода */}
        <div className="relative">
          <input
            ref={emailRef}
            type="email"
            placeholder="Введите ваш e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 pl-3 focus:ring-2 focus:ring-blue-500 bg-transparent text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Кнопка отправки */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-70 flex justify-center items-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" /> Отправляем...
            </>
          ) : (
            "Отправить ссылку"
          )}
        </button>

        {/* Подтверждение отправки */}
        {sent && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 text-sm mt-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Проверьте почту — письмо уже у вас!</span>
          </motion.div>
        )}

        {/* Ссылки и футер */}
        <div className="flex flex-col items-center gap-2 mt-6">
          <Link
            href="/auth/login"
            className="flex items-center justify-center text-blue-600 hover:underline dark:text-blue-400 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Вернуться ко входу
          </Link>

          <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>WayX защищает ваши данные</span>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
