"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Mail, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Введите корректный адрес электронной почты.");
      return;
    }

    setLoading(true);
    try {
      // 🔹 Определяем домен, чтобы письмо всегда вело на правильный адрес
      const currentHost =
        typeof window !== "undefined" ? window.location.host : "wayx.kz";
      const domain =
        currentHost.includes("vercel.app") || currentHost.includes("localhost")
          ? "https://wayx-kz.vercel.app"
          : "https://wayx.kz";

      // 🔹 Отправляем письмо с действующей ссылкой
      await sendPasswordResetEmail(auth, email, {
        url: `${domain}/auth/action`,
        handleCodeInApp: true,
      });

      setSent(true);
    } catch (error: any) {
      console.error("Ошибка восстановления:", error);
      switch (error.code) {
        case "auth/user-not-found":
          alert("❌ Пользователь с таким e-mail не найден.");
          break;
        case "auth/invalid-email":
          alert("⚠️ Некорректный адрес электронной почты.");
          break;
        case "auth/network-request-failed":
          alert("🌐 Ошибка сети. Проверьте интернет-соединение.");
          break;
        default:
          alert("❌ Ошибка: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-500">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glassmorphism bg-white/80 dark:bg-gray-800/70 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 backdrop-blur-xl"
      >
        <div className="flex justify-center mb-3">
          <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        </div>

        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
          Восстановление пароля
        </h1>

        {!sent ? (
          <>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              Укажите e-mail, который вы использовали при регистрации.  
              Мы отправим ссылку для сброса пароля.
            </p>

            <input
              type="email"
              placeholder="Введите ваш e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-transparent text-gray-900 dark:text-gray-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Отправка...
                </>
              ) : (
                "Отправить письмо"
              )}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Вспомнили пароль?{" "}
              <a href="/auth/login" className="text-blue-600 hover:underline">
                Войти
              </a>
            </p>
          </>
        ) : (
          <p className="text-center text-green-600 dark:text-green-400 font-semibold">
            📩 Письмо для восстановления отправлено!  
            Проверьте почту и перейдите по ссылке из письма.
          </p>
        )}
      </motion.form>
    </div>
  );
}