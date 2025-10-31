"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2, FileText, Coins, Truck, Users, Bell } from "lucide-react";
import DashboardActions from "@/components/DashboardActions";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>("client");
  const [requests, setRequests] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔐 Авторизация и загрузка профиля
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (userAuth) => {
      if (!userAuth) {
        router.replace("/auth/login");
        return;
      }

      try {
        const userRef = doc(db, "users", userAuth.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          setUser({ uid: userAuth.uid, ...data });
          setRole(data.role || "client");
        } else {
          setUser({
            uid: userAuth.uid,
            name: userAuth.displayName || "Пользователь",
            email: userAuth.email,
          });
          setRole("client");
        }

        await Promise.all([
          loadRequests(userAuth.uid),
          loadBids(userAuth.uid),
          loadAuctions(),
          subscribeToNotifications(userAuth.uid),
        ]);
      } catch (err) {
        console.error("Ошибка:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  // 📦 Заявки клиента
  const loadRequests = async (uid: string) => {
    const q = query(
      collection(db, "requests"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setRequests(items);
    setStats((prev: any) => ({ ...prev, requests: items.length }));
  };

  // 💰 Ставки поставщика
  const loadBids = async (uid: string) => {
    const q = query(
      collection(db, "bids"),
      where("supplierId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setBids(items);
    setStats((prev: any) => ({ ...prev, bids: items.length }));
  };

  // 🔥 Аукционы
  const loadAuctions = async () => {
    const q = query(collection(db, "auctions"), orderBy("createdAt", "desc"), limit(3));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setAuctions(items);
    setStats((prev: any) => ({ ...prev, auctions: items.length }));
  };

  // 🔔 Подписка на уведомления в реальном времени
  const subscribeToNotifications = (uid: string) => {
    const q = query(
      collection(db, "notifications"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(items);
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-500">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 px-6 py-12">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* 👋 Приветствие */}
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
          Привет, {user?.name?.split(" ")[0] || "гость"} 👋
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          Роль: {" "}
          <span className="text-blue-400 font-semibold">
            {role === "client"
              ? "Заказчик"
              : role === "supplier"
              ? "Поставщик"
              : "Администратор"}
          </span>
        </p>

        {/* 📊 Статистика */}
        <StatsPanel stats={stats} role={role} />

        {/* 🔔 Уведомления */}
        <NotificationsPanel notifications={notifications} />

        {/* ⚙️ Действия */}
        <DashboardActions />

        {/* 🔸 Контент по ролям */}
        {role === "client" && (
          <>
            <Section
              title="Мои последние заявки"
              data={requests}
              link="/my-requests"
              empty="У вас пока нет заявок."
              color="blue"
            />
            <Section
              title="Актуальные аукционы"
              data={auctions}
              link="/auctions"
              empty="Нет активных аукционов."
              color="cyan"
            />
          </>
        )}

        {role === "supplier" && (
          <>
            <Section
              title="Мои последние ставки"
              data={bids}
              link="/my-bids"
              empty="Вы ещё не участвовали в торгах."
              color="emerald"
            />
            <Section
              title="Активные аукционы"
              data={auctions}
              link="/auctions"
              empty="Пока нет активных аукционов."
              color="cyan"
            />
          </>
        )}

        {role === "admin" && (
          <>
            <Section
              title="Управление системой"
              data={[
                { id: "1", name: "Пользователи", link: "/admin/users" },
                { id: "2", name: "Ставки и аукционы", link: "/admin/bids" },
              ]}
              link="/admin"
              empty="Нет данных для отображения."
              color="purple"
            />
          </>
        )}
      </motion.div>
    </main>
  );
}

// 📊 Панель статистики
function StatsPanel({ stats, role }: { stats: any; role: string }) {
  const items =
    role === "client"
      ? [
          { icon: <FileText />, label: "Мои заявки", value: stats.requests || 0, color: "blue" },
          { icon: <Truck />, label: "Аукционы", value: stats.auctions || 0, color: "cyan" },
        ]
      : role === "supplier"
      ? [
          { icon: <Coins />, label: "Мои ставки", value: stats.bids || 0, color: "emerald" },
          { icon: <Truck />, label: "Аукционы", value: stats.auctions || 0, color: "cyan" },
        ]
      : [
          { icon: <Users />, label: "Пользователи", value: 0, color: "purple" },
          { icon: <Coins />, label: "Ставки", value: stats.bids || 0, color: "yellow" },
          { icon: <Truck />, label: "Аукционы", value: stats.auctions || 0, color: "cyan" },
        ];

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
      {items.map((item, i) => (
        <motion.div
          key={i}
          className={`flex items-center justify-between p-5 bg-gray-800/80 border border-gray-700 rounded-xl shadow-md hover:border-${item.color}-400 transition`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex items-center gap-3">
            <div className={`text-${item.color}-400`}>{item.icon}</div>
            <span className="text-gray-300 font-medium">{item.label}</span>
          </div>
          <span className="text-2xl font-bold text-white">{item.value}</span>
        </motion.div>
      ))}
    </div>
  );
}

// 🔔 Панель уведомлений
function NotificationsPanel({ notifications }: { notifications: any[] }) {
  if (!notifications?.length) return null;
  return (
    <motion.div
      className="mb-10 bg-gray-800/60 rounded-xl border border-gray-700 p-5 shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Bell className="text-yellow-400" />
        <h3 className="font-semibold text-lg text-white">Уведомления</h3>
      </div>
      <ul className="space-y-2 text-sm text-gray-300">
        {notifications.map((n) => (
          <li
            key={n.id}
            className="border-b border-gray-700/50 pb-2 last:border-0"
          >
            <span className="text-yellow-300 font-medium">⚡ {n.title}</span>
            <p className="text-gray-400 text-xs">{n.message}</p>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// 📦 Секции
function Section({
  title,
  data,
  empty,
  link,
  color,
}: {
  title: string;
  data: any[];
  empty: string;
  link: string;
  color: string;
}) {
  return (
    <motion.div
      className="mt-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <Link href={link} className={`text-${color}-400 hover:underline text-sm`}>
          Смотреть все →
        </Link>
      </div>

      {data.length === 0 ? (
        <p className="text-gray-500">{empty}</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {data.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-gray-800/70 rounded-xl border border-gray-700 hover:border-blue-500 transition-all shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-2 text-white truncate">
                {item.name || `${item.origin || ""} → ${item.destination || ""}`}
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                {item.transport
                  ? `Тип: ${item.transport} | Вес: ${item.weightTons || 0} т`
                  : "—"}
              </p>
              <Link
                href={item.link || `/${link}/${item.id}`}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Подробнее →
              </Link>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
