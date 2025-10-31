// ✅ WayX Registration Page v7.5 — enterprise-grade (production-safe)
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  doc,
  getFirestore,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import app from "@/lib/firebase";
import type { WayxUserProfile, SupplierType, LegalType } from "@/types/user";
import { Loader2, MailCheck, Mail, Building2, AlertTriangle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RegisterPage() {
  const auth = useMemo(() => getAuth(app), []);
  const db = useMemo(() => getFirestore(app), []);

  // 🔹 Основные состояния
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "supplier">("client");
  const [legalType, setLegalType] = useState<LegalType>("individual");
  const [supplierType, setSupplierType] = useState<SupplierType>("driver");
  const [company, setCompany] = useState("");
  const [bin, setBin] = useState("");

  // 🔹 Служебные флаги
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const pollStart = useRef<number | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
    return () => {
      stopPolling();
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const toast = (msg: string, type: "info" | "success" | "error" = "info") => {
    (window as any)?.toast?.(msg, type) ?? console.log(`[${type.toUpperCase()}] ${msg}`);
  };

  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://wayx.kz";

  // 🔹 Валидации
  const isEmailValid = (v: string) => /\S+@\S+\.\S+/.test(v);
  const isPasswordValid = (v: string) => v.length >= 6;
  const isBinValid = (v: string) => v.length === 12 || v.length === 0;

  // 🧾 Регистрация
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorText(null);

    if (!isEmailValid(email)) return setErrorText("Введите корректный e-mail.");
    if (!isPasswordValid(password))
      return setErrorText("Пароль должен быть не менее 6 символов.");
    if (legalType === "company" && !isBinValid(bin))
      return setErrorText("БИН должен содержать 12 цифр.");

    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods?.length) {
        setErrorText("Этот e-mail уже зарегистрирован. Попробуйте войти.");
        return;
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 💾 Создаём профиль
      const profile: WayxUserProfile = {
        uid: cred.user.uid,
        email,
        role,
        legalType,
        supplierType: role === "supplier" ? supplierType : null,
        company: legalType === "company" ? company : null,
        bin: legalType === "company" ? bin : null,
        verified: false,
        approvedByAdmin: false,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };

      await setDoc(doc(db, "users", cred.user.uid), profile, { merge: true });

      localStorage.setItem("wayxUser", JSON.stringify({ email, password }));

      await sendEmailVerification(cred.user, {
        url: `${origin}/auth/verified`,
        handleCodeInApp: false,
      });

      toast("📩 Письмо для подтверждения отправлено!", "success");
      setDone(true);
      startPolling();
    } catch (err: any) {
      console.error("Ошибка регистрации:", err);
      switch (err.code) {
        case "auth/email-already-in-use":
          setErrorText("Этот e-mail уже зарегистрирован.");
          break;
        case "auth/too-many-requests":
          setErrorText("Слишком много попыток. Повторите через 30–60 минут.");
          break;
        case "auth/network-request-failed":
          setErrorText("Ошибка сети. Проверьте интернет-соединение.");
          break;
        case "auth/internal-error":
          setErrorText("Внутренняя ошибка Firebase. Попробуйте позже.");
          break;
        default:
          setErrorText(err.message || "Не удалось зарегистрировать. Попробуйте снова.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Повторная отправка
  const resend = async () => {
    if (!auth.currentUser) return;
    if (resendCooldown > 0) return;

    setResendLoading(true);
    try {
      await sendEmailVerification(auth.currentUser, {
        url: `${origin}/auth/verified`,
        handleCodeInApp: false,
      });
      toast("✉️ Письмо отправлено повторно.", "info");
      startResendCooldown(60);
      startPolling(true);
    } catch (e: any) {
      console.error("Ошибка повторной отправки:", e);
      if (e.code === "auth/too-many-requests") {
        setErrorText("Слишком много запросов. Подождите 30–60 минут.");
      } else if (e.code === "auth/network-request-failed") {
        setErrorText("Ошибка сети. Проверьте подключение к интернету.");
      } else {
        setErrorText(e.message || "Не удалось отправить письмо повторно.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  // ⏱ Защита от спама resend
  const startResendCooldown = (seconds: number) => {
    setResendCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((t) => {
        if (t <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // 🔍 Проверка вручную
  const manualCheck = async () => {
    setChecking(true);
    try {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        stopPolling();
        toast("✅ E-mail подтверждён!", "success");
        window.location.href = "/dashboard";
      } else {
        setErrorText("E-mail ещё не подтверждён. Проверьте почту.");
      }
    } finally {
      setChecking(false);
    }
  };

  // ⏱ Автопроверка статуса
  const startPolling = (reset = false) => {
    if (reset) stopPolling();
    if (pollRef.current) return;
    pollStart.current = Date.now();
    pollRef.current = setInterval(async () => {
      try {
        await auth.currentUser?.reload();
        if (auth.currentUser?.emailVerified) {
          stopPolling();
          toast("✅ E-mail подтверждён!", "success");
          window.location.href = "/dashboard";
        }
        if (pollStart.current && Date.now() - pollStart.current > 120000)
          stopPolling();
      } catch {}
    }, 3000);
  };

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    pollStart.current = null;
  };

  // ✅ Экран после отправки
  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center px-4"
      >
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
          <MailCheck className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold mb-2">Проверьте почту</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Мы отправили письмо на <strong>{email}</strong>.<br />
            Перейдите по ссылке, чтобы активировать аккаунт.
          </p>

          {errorText && (
            <div className="bg-red-50 text-red-600 border border-red-300 rounded-lg p-3 mb-3 text-sm flex items-center gap-2 justify-center">
              <AlertTriangle className="w-4 h-4" /> {errorText}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={manualCheck}
              disabled={checking}
              className="bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-70"
            >
              {checking ? "Проверяем..." : "Я подтвердил e-mail"}
            </button>

            <button
              onClick={resend}
              disabled={resendLoading || resendCooldown > 0}
              className="border border-gray-300 dark:border-gray-600 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm flex items-center justify-center gap-2"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" /> Отправляем...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock className="w-4 h-4" /> Повторно через {resendCooldown} с
                </>
              ) : (
                "Отправить снова"
              )}
            </button>

            <button
              onClick={() => window.open("https://mail.google.com", "_blank")}
              className="text-blue-600 hover:underline text-sm mt-1"
            >
              Открыть почту
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // 🧩 Основная форма
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto p-6"
    >
      <h1 className="text-2xl font-bold mb-4">Регистрация в WayX</h1>

      {errorText && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg p-3 mb-4 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {errorText}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            ref={emailRef}
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded-xl p-3 pl-10 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <input
          type="password"
          placeholder="Пароль (мин. 6 символов)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <div className="grid sm:grid-cols-2 gap-3">
          <Select label="Роль" value={role} onChange={setRole} options={{
            client: "Клиент",
            supplier: "Поставщик",
          }} />
          <Select label="Тип лица" value={legalType} onChange={setLegalType} options={{
            individual: "Физ. лицо",
            company: "Юр. лицо",
          }} />
        </div>

        {role === "supplier" && (
          <Select
            label="Тип поставщика"
            value={supplierType}
            onChange={setSupplierType}
            options={{
              driver: "Водитель",
              logistics: "Логистическая компания",
              expeditor: "Экспедитор",
              logist: "Логист",
            }}
          />
        )}

        {legalType === "company" && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                placeholder="БИН (12 цифр)"
                value={bin}
                maxLength={12}
                onChange={(e) => setBin(e.target.value.replace(/\D/g, ""))}
                className={`w-full border rounded-xl p-3 pl-10 ${
                  bin && !isBinValid(bin) ? "border-red-400" : ""
                }`}
              />
            </div>
            <input
              placeholder="Наименование компании"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="border rounded-xl p-3"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl text-white py-3 transition font-semibold ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? <Loader2 className="animate-spin inline-block w-5 h-5" /> : "Создать аккаунт"}
        </button>

        <p className="text-sm text-gray-500 text-center mt-3">
          Уже есть аккаунт?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Войти
          </Link>
        </p>
      </form>
    </motion.div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: any) => void;
  options: Record<string, string>;
}) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <select
        className="border rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-500 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {Object.entries(options).map(([val, text]) => (
          <option key={val} value={val}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}
