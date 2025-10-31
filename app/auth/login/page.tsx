"use client";

import { useEffect, useRef, useState } from "react";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const router = useRouter();
  const submitLock = useRef(false);
  const toastLock = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // 🔔 Toast (без дублирования)
  const toast = (msg: string, type: "info" | "success" | "error" = "info") => {
    if (toastLock.current) return;
    toastLock.current = true;
    (window as any)?.toast?.(msg, type);
    setTimeout(() => (toastLock.current = false), 1200);
  };

  // 🧭 Проверяем авторизацию
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) router.replace("/dashboard");
    });
    return () => unsub();
  }, [router]);

  // 🧠 Автозаполнение и автофокус
  useEffect(() => {
    const savedEmail = localStorage.getItem("wayxEmail");
    if (savedEmail) setForm((f) => ({ ...f, email: savedEmail, remember: true }));
    emailRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 🔐 Авторизация
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLock.current) return;
    submitLock.current = true;
    setLoading(true);
    setUnverified(false);

    try {
      const cred = await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
      const user = cred.user;
      await user.reload();

      if (!user.emailVerified) {
        setUnverified(true);
        toast("📩 Подтвердите e-mail перед входом", "info");
        return;
      }

      (window as any)?.sessionStorage?.setItem(
        "wayx-user",
        JSON.stringify({ uid: user.uid, email: user.email, displayName: user.displayName })
      );
      if (form.remember) localStorage.setItem("wayxEmail", form.email);
      else localStorage.removeItem("wayxEmail");

      toast("✅ Добро пожаловать в WayX!", "success");
      router.push("/dashboard");
    } catch (error: any) {
      const code = error?.code || "";
      const friendly =
        code === "auth/invalid-credential" || code === "auth/wrong-password"
          ? "Неверный e-mail или пароль"
          : code === "auth/user-not-found"
          ? "Пользователь не найден"
          : code === "auth/too-many-requests"
          ? "Слишком много попыток. Попробуйте позже."
          : "Не удалось войти. Проверьте данные и попробуйте ещё раз.";
      toast("❌ " + friendly, "error");
    } finally {
      setLoading(false);
      submitLock.current = false;
    }
  };

  // 📤 Повторная отправка подтверждения
  const resendVerification = async () => {
    try {
      setResending(true);
      const { currentUser } = auth;
      if (!currentUser) return toast("Сначала выполните вход.", "info");

      const origin = window.location.origin || "https://wayx.kz";
      await sendEmailVerification(currentUser, {
        url: `${origin}/auth/verified`,
        handleCodeInApp: false,
      });

      toast("✉️ Письмо подтверждения отправлено повторно.", "success");
    } catch {
      toast("⚠ Не удалось отправить письмо, попробуйте позже.", "error");
    } finally {
      setResending(false);
    }
  };

  // 🔁 Проверка подтверждения email
  const checkVerifiedNow = async () => {
    setChecking(true);
    try {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        toast("✅ E-mail подтверждён. Входим…", "success");
        router.replace("/dashboard");
      } else toast("E-mail ещё не подтверждён. Проверьте почту.", "info");
    } catch {
      toast("Не удалось проверить статус. Попробуйте позже.", "error");
    } finally {
      setChecking(false);
    }
  };

  // 🧭 Интерфейс
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen 
      bg-gradient-to-br from-sky-50 via-white to-blue-50 
      dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 
      transition-all duration-700"
    >
      {/* 🔹 Логотип + заголовок */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10"
      >
        {/* Светлая тема */}
        <img
          src="/logo-wayx.png"
          alt="WayX"
          className="block dark:hidden w-20 h-20 mx-auto mb-3 
            drop-shadow-[0_0_20px_rgba(37,99,235,0.25)] 
            transition-transform duration-500 hover:scale-105"
        />
        {/* Тёмная тема */}
        <img
          src="/logo-wayx-white.png"
          alt="WayX"
          className="hidden dark:block w-20 h-20 mx-auto mb-3 
            drop-shadow-[0_0_25px_rgba(56,189,248,0.35)] 
            transition-transform duration-500 hover:scale-105"
        />

        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text 
          bg-gradient-to-r from-blue-600 to-sky-400 
          dark:from-sky-300 dark:to-cyan-400 tracking-tight">
          WayX Logistics Platform
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Умная система мультимодальной логистики
        </p>
      </motion.div>

      {/* 🔸 Форма входа */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md bg-white/90 dark:bg-slate-900/80 
          backdrop-blur-xl rounded-3xl 
          shadow-[0_12px_40px_rgba(0,102,255,0.08)] 
          p-10 space-y-6 border border-blue-100/30 dark:border-slate-800/50"
      >
        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            ref={emailRef}
            name="email"
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-3 border border-gray-200 dark:border-slate-700 
              rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 
              bg-white/60 dark:bg-slate-900/60 text-gray-900 dark:text-gray-100 transition"
          />
        </div>

        {/* Пароль */}
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Пароль"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-10 border border-gray-200 dark:border-slate-700 
              rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 
              bg-white/60 dark:bg-slate-900/60 text-gray-900 dark:text-gray-100 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 
              dark:hover:text-gray-300 transition"
            aria-label="Показать пароль"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Запомнить меня */}
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
            className="accent-blue-600 w-4 h-4"
          />
          Запомнить меня
        </label>

        {/* Уведомление о неподтверждённой почте */}
        {unverified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm bg-amber-50 dark:bg-amber-900/20 
              border border-amber-300 dark:border-amber-800 
              rounded-lg px-4 py-2 text-amber-700 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Ваш e-mail не подтверждён. Проверьте почту.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resendVerification}
                disabled={resending}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 
                  dark:text-blue-400 text-xs font-medium"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                {resending ? "Отправляем…" : "Отправить письмо повторно"}
              </button>
              <button
                type="button"
                onClick={checkVerifiedNow}
                disabled={checking}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 
                  dark:text-emerald-400 text-xs font-medium"
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${checking ? "animate-pulse" : ""}`} />
                {checking ? "Проверяем…" : "Я подтвердил e-mail"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Кнопка входа */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 
            text-white py-3 rounded-xl font-semibold hover:opacity-90 
            transition disabled:opacity-70 flex justify-center items-center 
            shadow-[0_6px_20px_rgba(37,99,235,0.3)]"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" /> Входим…
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5 mr-2" /> Войти
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          🔒 Вы входите в защищённую систему WayX
        </p>

        {/* Ссылки */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>
            Нет аккаунта?{" "}
            <a href="/auth/register" className="text-blue-600 hover:underline dark:text-blue-400">
              Зарегистрироваться
            </a>
          </p>
          <p>
            <a
              href="/auth/forgot"
              className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-medium"
            >
              Забыли пароль?
            </a>
          </p>
        </div>
      </motion.form>
    </div>
  );
}
