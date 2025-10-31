"use client";

import { useEffect, useState } from "react";
import { getAllAuctions, Auction } from "@/lib/auctions";
import {
  Loader2,
  MapPin,
  ArrowRight,
  Coins,
  Lock,
  Truck,
  TrainFront,
  Ship,
  Plane,
  Route,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const data = await getAllAuctions();
        setAuctions(data);
      } catch (err) {
        console.error("Ошибка при загрузке аукционов:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );

  const transportIcons: Record<string, JSX.Element> = {
    auto: <Truck className="w-4 h-4 text-blue-500" />,
    rail: <TrainFront className="w-4 h-4 text-yellow-600" />,
    air: <Plane className="w-4 h-4 text-sky-500" />,
    sea: <Ship className="w-4 h-4 text-indigo-500" />,
    multimodal: <Route className="w-4 h-4 text-green-500" />,
  };

  const transportNames: Record<string, string> = {
    auto: "Авто",
    rail: "Ж/Д",
    air: "Авиа",
    sea: "Море",
    multimodal: "Мультимодал",
  };

  return (
    <section className="max-w-6xl mx-auto py-16 px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-sky-400">
          Активные заявки
        </h1>
        <Link
          href="/orders/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow transition"
        >
          + Новая заявка
        </Link>
      </div>

      {auctions.length === 0 ? (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-slate-600 dark:text-slate-300 text-center mt-24 text-lg"
        >
          Пока нет активных заявок.
          <br />
          <span className="text-slate-500 text-sm">
            Создайте первую заявку и начните работу с перевозчиками.
          </span>
        </motion.p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-6 rounded-2xl border shadow-sm hover:shadow-lg transition-all
                          ${
                            a.status === "closed"
                              ? "bg-gray-50 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 opacity-80"
                              : "bg-white/90 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700"
                          }`}
            >
              {/* 🔹 Название и транспорт */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-blue-600 dark:text-sky-400 leading-snug">
                  {a.title}
                </h3>
                {a.transport && (
                  <div
                    className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400"
                    title={transportNames[a.transport]}
                  >
                    {transportIcons[a.transport]}
                    {transportNames[a.transport]}
                  </div>
                )}
              </div>

              {/* 🔹 Описание */}
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">
                {a.description}
              </p>

              {/* 🔹 Маршрут */}
              <div className="flex items-center gap-2 text-sm mb-3 text-slate-500">
                <MapPin className="w-4 h-4" />
                <span>
                  {a.origin} → {a.destination}
                </span>
              </div>

              {/* 🔹 Цена и статус */}
              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center gap-2 font-medium text-green-600 dark:text-green-400">
                  <Coins className="w-4 h-4" />
                  {a.price.toLocaleString()} {a.currency}
                </div>

                {a.status === "closed" ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                    <Lock className="w-3 h-3" /> Закрыт
                  </span>
                ) : (
                  <span className="text-xs text-blue-600 font-medium">Открыт</span>
                )}
              </div>

              {/* 🔹 Дата создания */}
              {a.createdAt && (
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {new Date(a.createdAt.seconds * 1000).toLocaleDateString("ru-RU")}
                </div>
              )}

              {/* 🔹 Кнопка перехода */}
              <div className="mt-5 flex justify-end">
                <Link
                  href={`/auctions/${a.id}`}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:hover:text-sky-400 font-medium text-sm transition"
                >
                  Подробнее <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
