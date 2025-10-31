"use client";

import { useEffect, useState } from "react";
import RoleGate from "@/components/RoleGate";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Loader2, Truck, Plane, Ship, TrainFront, Route, Clock } from "lucide-react";

type Order = {
  id: string;
  title: string;
  transport: string;
  from: string;
  to: string;
  status: "pending" | "in_progress" | "done";
  createdAt?: any;
};

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q =
          filter === "all"
            ? query(collection(db, "orders"), where("createdBy", "==", user.email))
            : query(
                collection(db, "orders"),
                where("createdBy", "==", user.email),
                where("transport", "==", filter)
              );

        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];
        setOrders(data);
      } catch (err) {
        console.error("Ошибка при загрузке заказов:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filter]);

  const transportIcons: Record<string, JSX.Element> = {
    auto: <Truck className="w-4 h-4" />,
    air: <Plane className="w-4 h-4" />,
    sea: <Ship className="w-4 h-4" />,
    rail: <TrainFront className="w-4 h-4" />,
    multi: <Route className="w-4 h-4" />,
  };

  return (
    <RoleGate allow={["client", "admin"]}>
      <section className="max-w-6xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-600 dark:text-sky-400">
          Мои заказы
        </h1>

        {/* 🔹 Фильтр по типу транспорта */}
        <div className="flex flex-wrap gap-3 mb-8">
          {["all", "auto", "rail", "sea", "air", "multi"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                filter === t
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
              }`}
            >
              {t === "all" ? "Все" : transportIcons[t]}{" "}
              {t === "all"
                ? ""
                : t === "auto"
                ? "Авто"
                : t === "rail"
                ? "ЖД"
                : t === "sea"
                ? "Море"
                : t === "air"
                ? "Авиа"
                : "Мультимодал"}
            </button>
          ))}
        </div>

        {/* 🌀 Загрузка */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        {/* 📋 Список заказов */}
        {!loading && orders.length === 0 && (
          <p className="text-center text-slate-500 dark:text-slate-400 mt-20">
            У вас пока нет заказов.
          </p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((o) => (
            <div
              key={o.id}
              className="p-5 rounded-2xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg text-blue-600 dark:text-sky-400">
                  {o.title}
                </h3>
                {transportIcons[o.transport]}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {o.from} → {o.to}
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                {o.createdAt?.toDate
                  ? new Date(o.createdAt.toDate()).toLocaleDateString()
                  : "—"}
              </div>
              <div
                className={`mt-4 inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  o.status === "done"
                    ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                    : o.status === "in_progress"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {o.status === "done"
                  ? "Завершён"
                  : o.status === "in_progress"
                  ? "В процессе"
                  : "Ожидает"}
              </div>
            </div>
          ))}
        </div>
      </section>
    </RoleGate>
  );
}
