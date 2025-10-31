// ✅ WayX — Profile Page (v6, Production-Optimized)
// Путь: app/profile/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { auth, db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  updatePassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
} from "firebase/auth";
import {
  Loader2,
  Save,
  LogOut,
  MailWarning,
  MailCheck,
  Building2,
  User,
  MapPin,
  Phone,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

interface ProfileData {
  name: string;
  email: string;
  type: "individual" | "company";
  company?: string;
  companyBin?: string;
  director?: string;
  position?: string;
  phone?: string;
  address?: string;
  role: "client" | "supplier" | "admin";
  createdAt?: any;
  updatedAt?: any;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [completion, setCompletion] = useState(0);
  const router = useRouter();

  // 🔁 Загрузка пользователя и кэширование профиля
  useEffect(() => {
    const cached = sessionStorage.getItem("wayx-profile");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUserData(parsed);
        calculateCompletion(parsed);
      } catch {
        sessionStorage.removeItem("wayx-profile");
      }
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      setAuthUser(user);
      setEmailVerified(user.emailVerified);

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as ProfileData;
        setUserData(data);
        calculateCompletion(data);
        sessionStorage.setItem("wayx-profile", JSON.stringify(data));
      } else {
        const baseProfile: ProfileData = {
          name: user.displayName || "Новый пользователь",
          email: user.email || "",
          type: "individual",
          company: "",
          position: "",
          phone: "",
          address: "",
          role: "client",
          createdAt: serverTimestamp(),
        };
        await setDoc(ref, baseProfile);
        setUserData(baseProfile);
        calculateCompletion(baseProfile);
        sessionStorage.setItem("wayx-profile", JSON.stringify(baseProfile));
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  // 📊 Расчёт заполненности профиля
  const calculateCompletion = (data: ProfileData) => {
    const fields = [
      data.name,
      data.position,
      data.phone,
      data.address,
      data.type === "company" ? data.company : true,
      data.type === "company" ? data.companyBin : true,
      data.type === "company" ? data.director : true,
    ];
    const filled = fields.filter(Boolean).length;
    setCompletion(Math.round((filled / fields.length) * 100));
  };

  // 💾 Сохранение профиля
  const handleSave = async () => {
    if (!userData || !authUser) return;
    setSaving(true);

    try {
      const ref = doc(db, "users", authUser.uid);
      await updateDoc(ref, { ...userData, updatedAt: serverTimestamp() });
      calculateCompletion(userData);
      sessionStorage.setItem("wayx-profile", JSON.stringify(userData));

      // 🔐 Смена пароля (с подтверждением)
      if (password.trim().length >= 6) {
        const currentPassword = prompt("Введите текущий пароль для подтверждения:");
        if (!currentPassword) {
          (window as any).toast?.("⚠️ Введите текущий пароль", "error");
          setSaving(false);
          return;
        }

        const credential = EmailAuthProvider.credential(
          authUser.email!,
          currentPassword
        );
        await reauthenticateWithCredential(authUser, credential);
        await updatePassword(authUser, password);

        (window as any).toast?.("✅ Пароль успешно обновлён!", "success");
        setPassword("");
      }

      (window as any).toast?.("✅ Профиль сохранён!", "success");
    } catch (error: any) {
      console.error("Ошибка сохранения:", error);
      (window as any).toast?.("❌ " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ✉️ Повторная отправка письма подтверждения
  const resendVerification = async () => {
    if (!authUser) return;
    setSending(true);
    try {
      const domain =
        window.location.hostname.includes("vercel.app") ||
        window.location.hostname.includes("localhost")
          ? "https://wayx-kz.vercel.app"
          : "https://wayx.kz";

      await sendEmailVerification(authUser, {
        url: `${domain}/auth/verified`,
        handleCodeInApp: false,
      });

      (window as any).toast?.("📨 Письмо подтверждения отправлено!", "info");
    } catch (error: any) {
      (window as any).toast?.("❌ " + error.message, "error");
    } finally {
      setSending(false);
    }
  };

  // 🚪 Выход
  const handleLogout = async () => {
    await signOut(auth);
    (window as any).toast?.("👋 Вы вышли из аккаунта", "info");
    router.push("/auth/login");
  };

  // ⏳ Загрузка
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-600 dark:text-blue-400">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );

  if (!userData)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-gray-400">
        <p>Ошибка загрузки профиля.</p>
      </div>
    );

  const isCompany = userData.type === "company";

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-10">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {isCompany ? "Профиль компании" : "Профиль пользователя"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Управляйте данными, повышайте рейтинг и доверие партнёров.
          </p>
        </motion.div>

        {/* Прогресс */}
        <ProgressBar completion={completion} />

        {/* Тип профиля */}
        <div className="flex justify-center gap-4">
          {(["individual", "company"] as const).map((type) => (
            <button
              key={type}
              onClick={() =>
                setUserData({ ...userData, type: type as "individual" | "company" })
              }
              className={`px-5 py-2 rounded-xl border transition ${
                userData.type === type
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {type === "individual" ? "Физ. лицо" : "Компания"}
            </button>
          ))}
        </div>

        {/* Форма */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow space-y-5 border border-gray-200 dark:border-gray-700">
          <ProfileField
            label={isCompany ? "Наименование компании" : "ФИО"}
            value={userData.name}
            onChange={(v) => setUserData({ ...userData, name: v })}
            icon={isCompany ? <Building2 size={18} /> : <User size={18} />}
          />

          <ProfileField
            label={isCompany ? "Должность" : "Род занятий"}
            value={userData.position || ""}
            onChange={(v) => setUserData({ ...userData, position: v })}
            icon={<Briefcase size={18} />}
          />

          {isCompany && (
            <>
              <ProfileField
                label="БИН компании"
                value={userData.companyBin || ""}
                onChange={(v) => setUserData({ ...userData, companyBin: v })}
              />
              <ProfileField
                label="Директор"
                value={userData.director || ""}
                onChange={(v) => setUserData({ ...userData, director: v })}
              />
            </>
          )}

          <ProfileField
            label="Телефон"
            value={userData.phone || ""}
            onChange={(v) => setUserData({ ...userData, phone: v })}
            icon={<Phone size={18} />}
          />

          <ProfileField
            label="Адрес"
            value={userData.address || ""}
            onChange={(v) => setUserData({ ...userData, address: v })}
            icon={<MapPin size={18} />}
          />

          <EmailField
            email={userData.email}
            verified={emailVerified}
            onResend={resendVerification}
            sending={sending}
          />

          <ProfileField
            label="Новый пароль (необязательно)"
            value={password}
            onChange={setPassword}
            type="password"
          />

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <ActionButton
              onClick={handleSave}
              loading={saving}
              text="Сохранить изменения"
              icon={<Save className="w-5 h-5 mr-2" />}
            />
            <ActionButton
              onClick={handleLogout}
              text="Выйти"
              icon={<LogOut className="w-5 h-5 mr-2" />}
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

/* 🔹 Компоненты UI */
function ProfileField({
  label,
  value,
  onChange,
  icon,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: JSX.Element;
  type?: string;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-600 dark:text-gray-300 font-medium mb-1">
        {label}
      </label>
      <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg px-3 bg-transparent focus-within:ring-2 focus-within:ring-blue-500 transition">
        {icon && <div className="text-gray-500 mr-2">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full py-2 bg-transparent outline-none text-gray-900 dark:text-gray-100"
        />
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  text,
  icon,
  loading,
  variant = "primary",
}: {
  onClick: () => void;
  text: string;
  icon: JSX.Element;
  loading?: boolean;
  variant?: "primary" | "secondary";
}) {
  const base =
    variant === "primary"
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600";
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex-1 py-3 rounded-lg font-semibold flex justify-center items-center transition ${base} disabled:opacity-70`}
    >
      {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : icon}
      {text}
    </button>
  );
}

function EmailField({
  email,
  verified,
  onResend,
  sending,
}: {
  email: string;
  verified: boolean;
  onResend: () => void;
  sending: boolean;
}) {
  return (
    <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 mt-4">
      <div>
        <p className="text-sm text-gray-500">E-mail</p>
        <p className="text-gray-800 dark:text-gray-200 font-medium">{email}</p>
      </div>
      {verified ? (
        <div className="flex items-center gap-2 text-green-500">
          <MailCheck className="w-5 h-5" />
          Подтверждён
        </div>
      ) : (
        <button
          onClick={onResend}
          disabled={sending}
          className="text-yellow-600 dark:text-yellow-400 text-sm hover:underline flex items-center gap-1"
        >
          <MailWarning className="w-4 h-4" />
          {sending ? "Отправка..." : "Подтвердить"}
        </button>
      )}
    </div>
  );
}

function ProgressBar({ completion }: { completion: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between mb-2">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Заполненность профиля
        </span>
        <span
          className={`font-semibold ${
            completion < 60
              ? "text-yellow-500"
              : completion < 90
              ? "text-blue-500"
              : "text-green-500"
          }`}
        >
          {completion}%
        </span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-3 ${
            completion < 60
              ? "bg-yellow-500"
              : completion < 90
              ? "bg-blue-500"
              : "bg-green-500"
          }`}
          animate={{ width: `${completion}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </div>
  );
}
