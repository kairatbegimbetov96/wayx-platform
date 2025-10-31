// ✅ WayX — Dashboard v7.6 (Vercel-safe, NotificationsBell integrated)
"use client";

import { useEffect, useState, useMemo } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore, onSnapshot, serverTimestamp } from "firebase/firestore";
import app from "@/lib/firebase";
import type { WayxUserProfile } from "@/types/user";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ClipboardList,
  User,
  Truck,
  Briefcase,
  LayoutDashboard,
  Settings,
  LineChart,
  MailWarning,
  Sparkles,
  Star,
  Wallet,
  Shield,
} from "lucide-react";
import UserBadge from "@/components/UserBadge";
import NotificationsBell from "@/components/NotificationsBell"; // 🔔 NEW

export default function Dashboard() {
  const auth = useMemo(() => getAuth(app), []);
  const db = useMemo(() => getFirestore(app), []);

  const [profile, setProfile] = useState<WayxUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [completion, setCompletion] = useState(0);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [rating, setRating] = useState<number>(5);

  // 🔁 Реактивная загрузка данных пользователя
  useEffect(() => {
    const cached = sessionStorage.getItem("wayx-profile");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProfile(parsed);
        setLoading(false);
      } catch {
        sessionStorage.removeItem("wayx-profile");
      }
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? (snap.data() as Partial<WayxUserProfile>) : {};

      const safeData: WayxUserProfile = {
        uid: u.uid,
        email: u.email ?? "",
        name: data.name ?? u.displayName ?? "",
        displayName: data.displayName ?? "",
        company: data.company ?? "",
        role: data.role ?? "client",
        legalType: data.legalType ?? "individual",
        supplierType: data.supplierType ?? null,
        position: data.position ?? "",
        rating: data.rating ?? 0,
        balance: data.balance ?? 0,
        bin: data.bin ?? null,
        approvedByAdmin: data.approvedByAdmin ?? false,
        verified: data.verified ?? false,
        address: data.address ?? "",
        createdAt: data.createdAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      setProfile(safeData);
      setEmailNotVerified(!u.emailVerified);
      sessionStorage.setItem("wayx-profile", JSON.stringify(safeData));

      // ✅ вычисляем заполненность профиля
      const fields = [
        safeData.name,
        safeData.email,
        safeData.company,
        safeData.role,
        safeData.position,
        safeData.address,
      ];
      const filled = fields.filter((f) => f && f.trim() !== "").length;
      setCompletion(Math.round((filled / fields.length) * 100));

      // 🔄 Live updates Firestore
      const liveUnsub = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          const updated = snap.data() as Partial<WayxUserProfile>;
          setBalance(updated.balance ?? 0);
          setRating(updated.rating ?? 5);
        }
      });

      setLoading(false);
      return () => liveUnsub();
    });

    return () => unsub();
  }, [auth, db]);

  // 💠 Прелоадер
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-600 dark:text-blue-400">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <Sparkles className="animate-spin h-5 w-5" /> Загружаем WayX Dashboard...
        </motion.div>
      </div>
    );

  // 🚪 Без авторизации
  if (!profile)
    return (
      <div className="p-6 text-center">
        <p className="font-medium mb-3">Войдите в аккаунт, чтобы продолжить.</p>
        <Link
          href="/auth/login"
          className="inline-block text-blue-600 dark:text-blue-400 hover:underline"
        >
          Перейти к входу
        </Link>
      </div>
    );

  // 🎨 Настройка темы и цветов
  const roleIcons = {
    client: <Briefcase className="h-8 w-8 text-blue-600" />,
    supplier: <Truck className="h-8 w-8 text-green-600" />,
    admin: <LayoutDashboard className="h-8 w-8 text-purple-600" />,
  };

  const gradient =
    profile.role === "supplier"
      ? "from-green-500 to-emerald-400"
      : profile.role === "admin"
      ? "from-purple-500 to-pink-400"
      : "from-blue-500 to-cyan-400";

  const completionColor =
    completion < 60
      ? "text-yellow-500"
      : completion < 90
      ? "text-blue-500"
      : "text-green-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-6xl mx-auto"
    >
      {/* 🧭 Заголовок */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        {/* Левая часть — приветствие и описание */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`p-2 rounded-xl bg-gradient-to-r ${gradient} text-white`}
            >
              {roleIcons[profile.role as keyof typeof roleIcons]}
            </motion.div>
            <span>
              Добро пожаловать,&nbsp;
              <span className="text-blue-600 dark:text-blue-400">
                {profile.name || profile.email?.split("@")[0]}
              </span>
              👋
            </span>
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {profile.role === "client" &&
              "Управляйте своими заказами и аукционами на платформе WayX."}
            {profile.role === "supplier" &&
              "Следите за заявками, делайте ставки и выигрывайте заказы."}
            {profile.role === "admin" &&
              "Контролируйте пользователей, заказы и аналитику системы."}
          </p>

          {/* ✏️ Кнопка редактирования профиля */}
          <div className="mt-4">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
              Редактировать профиль
            </Link>
          </div>
        </div>

        {/* Правая часть — колокольчик и бейдж */}
        <div className="flex items-center gap-3">
          <NotificationsBell userId={profile.uid} /> {/* 🔔 */}
          <UserBadge profile={profile} />
        </div>
      </div>

      {/* ⚠️ E-mail не подтверждён */}
      {emailNotVerified && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-yellow-100 border border-yellow-400 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300"
        >
          <MailWarning className="w-5 h-5" />
          Почта не подтверждена. Проверьте письмо от WayX для активации аккаунта.
        </motion.div>
      )}

      {/* 💰 Баланс и рейтинг */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid sm:grid-cols-2 gap-4 mb-8"
      >
        <StatCard
          title="Баланс аккаунта"
          value={`${balance.toLocaleString()} ₸`}
          icon={<Wallet className="w-8 h-8 text-blue-500" />}
          gradient="from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700"
        />
        <StatCard
          title="Рейтинг надёжности"
          value={rating.toFixed(1)}
          icon={<Shield className="w-8 h-8 text-yellow-500" />}
          gradient="from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-700"
        />
      </motion.div>

      {/* 📊 Прогресс профиля */}
      <ProfileProgress completion={completion} completionColor={completionColor} />

      {/* 🌐 Карточки действий */}
      <ActionGrid profile={profile} />

      {/* 🌟 Мотиватор */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        <div className="flex justify-center mb-2">
          <Star className="text-yellow-400" />
        </div>
        <p>
          WayX — мультимодальная платформа логистики нового поколения. <br />
          Вместе мы станем №1 🌍
        </p>
      </motion.div>
    </motion.div>
  );
}

// 📊 Прогресс профиля
function ProfileProgress({
  completion,
  completionColor,
}: {
  completion: number;
  completionColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25 }}
      className="mb-8 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          Заполненность профиля
        </span>
        <span className={`font-semibold ${completionColor}`}>{completion}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${completion}%` }}
          transition={{ duration: 0.8 }}
          className={`h-3 rounded-full bg-gradient-to-r ${
            completion < 60
              ? "from-yellow-500 to-orange-400"
              : completion < 90
              ? "from-blue-500 to-cyan-400"
              : "from-green-500 to-emerald-400"
          }`}
        />
      </div>
      {completion < 100 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Заполните недостающие данные в{" "}
          <Link
            href="/profile"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            профиле
          </Link>
          , чтобы повысить доверие и рейтинг компании.
        </p>
      )}
    </motion.div>
  );
}

// 💰 Статистика (Баланс / Рейтинг)
function StatCard({
  title,
  value,
  icon,
  gradient,
}: {
  title: string;
  value: string;
  icon: JSX.Element;
  gradient: string;
}) {
  return (
    <div
      className={`p-5 rounded-2xl bg-gradient-to-br ${gradient} shadow border border-gray-200 dark:border-gray-700 flex justify-between items-center`}
    >
      <div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </h3>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {value}
        </p>
      </div>
      {icon}
    </div>
  );
}

// 📦 Сетка действий
function ActionGrid({ profile }: { profile: WayxUserProfile }) {
  const cards = {
    client: [
      {
        href: "/orders/new",
        title: "Создать заказ",
        desc: "Укажите маршрут, дату и бюджет",
        icon: <ClipboardList className="text-blue-500" />,
        color: "from-blue-500 to-cyan-400",
      },
      {
        href: "/orders",
        title: "Мои заказы",
        desc: "Статусы, ставки и исполнители",
        icon: <Truck className="text-green-500" />,
        color: "from-green-500 to-emerald-400",
      },
      {
        href: "/profile",
        title: "Профиль",
        desc: "Контакты и реквизиты",
        icon: <User className="text-gray-600" />,
        color: "from-slate-500 to-gray-400",
      },
    ],
    supplier: [
      {
        href: "/market",
        title: "Лента заказов",
        desc: "Просматривайте актуальные заявки",
        icon: <ClipboardList className="text-amber-500" />,
        color: "from-amber-500 to-orange-400",
      },
      {
        href: "/bids",
        title: "Мои ставки",
        desc: "История, активные и завершённые",
        icon: <Truck className="text-blue-500" />,
        color: "from-blue-500 to-cyan-400",
      },
      {
        href: "/profile",
        title: "Профиль",
        desc: "Документы, реквизиты, рейтинг",
        icon: <User className="text-gray-600" />,
        color: "from-slate-500 to-gray-400",
      },
    ],
    admin: [
      {
        href: "/admin",
        title: "Панель администратора",
        desc: "Пользователи и сделки",
        icon: <LayoutDashboard className="text-purple-500" />,
        color: "from-purple-500 to-pink-400",
      },
      {
        href: "/admin/orders",
        title: "Модерация заказов",
        desc: "Проверка и отчёты",
        icon: <Settings className="text-red-500" />,
        color: "from-red-500 to-orange-400",
      },
      {
        href: "/admin/reports",
        title: "Аналитика и KPI",
        desc: "Активность и выручка",
        icon: <LineChart className="text-blue-500" />,
        color: "from-blue-500 to-indigo-400",
      },
    ],
  };

  return (
    <motion.div
      className="grid sm:grid-cols-2 md:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      {cards[profile.role as keyof typeof cards].map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className={`group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-2 hover:shadow-xl transition-transform hover:-translate-y-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
          />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
              {card.icon}
            </div>
            <h3 className="font-semibold text-lg">{card.title}</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{card.desc}</p>
        </Link>
      ))}
    </motion.div>
  );
}
