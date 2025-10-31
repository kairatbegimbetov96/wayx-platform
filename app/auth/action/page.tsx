// ✅ WayX AuthActionHandler — улучшенная версия финального шага аутентификации
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { motion } from "framer-motion";
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

function AuthActionHandler() {
  const params = useSearchParams();
  const router = useRouter();
  const mode = params.get("mode"); // verifyEmail | resetPassword
  const oobCode = params.get("oobCode");
  const [status, setStatus] = useState<
    "loading" | "reset" | "success" | "error"
  >("loading");
  const [errorText, setErrorText] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔍 Проверка действия Firebase (verifyEmail | resetPassword)
  useEffect(() => {
    const handleAction = async () => {
      try {
        if (!mode || !oobCode) throw new Error("Неверная или устаревшая ссылка.");

        if (mode === "verifyEmail") {
          await applyActionCode(auth, oobCode);
          window.toast?.("✅ Email подтверждён!", "success");
          setStatus("success");
          setTimeout(() => router.replace("/auth/verified"), 1800);
          return;
        }

        if (mode === "resetPassword") {
          await verifyPasswordResetCode(auth, oobCode);
          setStatus("reset");
          return;
        }

        throw new Error("Неизвестное действие.");
      } catch (e: any) {
        console.error("Ошибка Firebase:", e);
        setErrorText(e.message || "Ошибка обработки ссылки.");
        setStatus("error");
      }
    };

    handleAction();
  }, [mode, oobCode, router]);

  // 🔐 Сброс пароля
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return window.toast?.("❌ Код отсутствует", "error");
    if (password.trim().length < 6)
      return window.toast?.("⚠️ Минимум 6 символов в пароле", "error");

    setSaving(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      window.toast?.("✅ Пароль успешно изменён!", "success");
      setTimeout(() => router.replace("/auth/login"), 1500);
    } catch (e: any) {
      console.error(e);
      window.toast?.("❌ " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // 🌀 Загрузка
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  // ✅ Email подтверждён
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8 bg-white/80 dark:bg-gray-800/70 rounded-2xl shadow-2xl text-center backdrop-blur-xl max-w-md w-full"
        >
          <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
            E-mail подтверждён!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ваш аккаунт активирован. Переход на страницу входа...
          </p>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            WayX защищает ваши данные 🔒
          </div>
        </motion.div>
      </div>
    );
  }

  // ❌ Ошибка ссылки
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8 bg-white/80 dark:bg-gray-800/70 rounded-2xl shadow-2xl text-center backdrop-blur-xl max-w-md w-full"
        >
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Ошибка ссылки
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{errorText}</p>
          <a
            href="/auth/login"
            className="inline-block mt-5 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Вернуться ко входу
          </a>
        </motion.div>
      </div>
    );
  }

  // 🔑 Сброс пароля
  if (status === "reset") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black transition">
        <motion.form
          onSubmit={handlePasswordReset}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glassmorphism bg-white/80 dark:bg-gray-800/70 p-8 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-xl"
        >
          <div className="flex justify-center mb-4">
            <Lock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>

          <h1 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-6">
            Введите новый пароль
          </h1>

          <div className="relative mb-4">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-transparent text-gray-900 dark:text-gray-100"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              aria-label="Показать или скрыть пароль"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-70 flex justify-center items-center"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Сохраняем...
              </>
            ) : (
              "Сохранить новый пароль"
            )}
          </button>

          <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 mt-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            <a href="/auth/login" className="hover:text-blue-600 dark:hover:text-blue-400">
              Вернуться ко входу
            </a>
          </div>
        </motion.form>
      </div>
    );
  }

  return null;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-blue-600">
          Загрузка...
        </div>
      }
    >
      <AuthActionHandler />
    </Suspense>
  );
}
