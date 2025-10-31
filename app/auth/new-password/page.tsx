"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import {
  Loader2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

/**
 * ✅ WayX — New Password Page (v4)
 * - Ввод нового пароля после сброса.
 * - UX и визуальный стиль уровня Kaspi / Indriver / Amazon.
 * - Автопереход на /auth/login после успешного изменения.
 */
function NewPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const oobCode = params.get("oobCode");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [counter, setCounter] = useState(4);
  const toastLock = useRef(false);

  const toast = (msg: string, type: "info" | "success" | "error" = "info") => {
    if (toastLock.current) return;
    toastLock.current = true;
    (window as any)?.toast?.(msg, type);
    setTimeout(() => (toastLock.current = false), 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) {
      toast("❌ Неверная ссылка восстановления", "error");
      return;
    }
    if (password.length < 6) {
      toast("Пароль должен быть не менее 6 символов", "info");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast("✅ Пароль успешно изменён!", "success");
      setDone(true);
      const timer = setInterval(() => setCounter((c) => (c > 0 ? c - 1 : 0)), 1000);
      setTimeout(() => {
        clearInterval(timer);
        router.push("/auth/login");
      }, 4000);
    } catch (err: any) {
      console.error("Ошибка при сбросе пароля:", err);
      toast("Ошибка: " + (err.message || "Не удалось сбросить пароль"), "error");
    } finally {
      setLoading(false);
    }
  };

  // 💡 Подсказка силы пароля
  const getStrength = () => {
    if (!password) return "";
    if (password.length < 6) return "Слишком короткий";
    if (/^[a-zA-Z]+$/.test(password)) return "Добавьте цифры или символы";
    if (/^[a-zA-Z0-9]+$/.test(password)) return "Хорошо, добавьте спецсимволы";
    return "Надёжный пароль ✅";
  };

  // 💎 UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-500">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 dark:bg-gray-800/70 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 backdrop-blur-xl"
      >
        <div className="flex justify-center mb-2">
          <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>

        <h1 className="text-2xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
          Новый пароль
        </h1>

        {!done ? (
          <>
            <div className="relative">
              <input
                type={visible ? "text" : "password"}
                placeholder="Введите новый пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 bg-transparent text-gray-900 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {password && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                {getStrength()}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" /> Сохраняем...
                </>
              ) : (
                "Сохранить пароль"
              )}
            </button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-3">
              <ShieldCheck className="w-12 h-12 text-green-500 drop-shadow-md" />
            </div>
            <p className="text-green-600 dark:text-green-400 font-semibold text-lg">
              Пароль изменён!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Перенаправляем на вход через {counter} сек.
            </p>
            <div className="flex justify-center mt-3">
              <CheckCircle2 className="w-6 h-6 text-green-400 animate-bounce" />
            </div>
          </motion.div>
        )}
      </motion.form>
    </div>
  );
}

// ✅ Оборачивание в Suspense для совместимости с useSearchParams
export default function NewPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen text-blue-600">
          <Loader2 className="animate-spin w-6 h-6 mr-2" />
          Загрузка страницы...
        </div>
      }
    >
      <NewPasswordContent />
    </Suspense>
  );
}
