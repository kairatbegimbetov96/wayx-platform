// components/RoutePreview.tsx
"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Truck,
  Plane,
  Ship,
  TrainFront,
  Navigation2,
  Globe,
  Clock,
  Cloud,
  Zap,
  Recycle,
  Route,
  Layers,
} from "lucide-react";
import { useMemo } from "react";

interface Props {
  origin: string;
  destination: string;
  transport: string; // "Авто" | "ЖД" | "Авиа" | "Море" | "Мультимодальная"
}

/**
 * WayX RoutePreview — визуализация маршрута для всех видов транспорта.
 * Без внешних API, безопасно для Vercel. Поддерживает мультимодальные схемы.
 */
export default function RoutePreview({ origin, destination, transport }: Props) {
  // Иконка в зависимости от транспорта
  const transportIcons: Record<string, JSX.Element> = {
    Авто: <Truck className="text-blue-600 dark:text-blue-400 w-6 h-6" />,
    Авиа: <Plane className="text-blue-600 dark:text-blue-400 w-6 h-6" />,
    Море: <Ship className="text-blue-600 dark:text-blue-400 w-6 h-6" />,
    ЖД: <TrainFront className="text-blue-600 dark:text-blue-400 w-6 h-6" />,
    Мультимодальная: <Layers className="text-blue-600 dark:text-blue-400 w-6 h-6" />,
  };
  const travelIcon =
    transportIcons[transport] || (
      <Route className="text-blue-600 dark:text-blue-400 w-6 h-6" />
    );

  // Псевдо-метрики (визуальные, без API)
  const distance = useMemo(() => {
    if (!origin || !destination) return 0;
    const seed = (origin + destination + transport).length;
    const base = 150 + (seed * 97) % 2800; // 150..~2950
    switch (transport) {
      case "Авиа":
        return Math.round(base * 4);
      case "Море":
        return Math.round(base * 5);
      case "ЖД":
        return Math.round(base * 2);
      case "Мультимодальная":
        return Math.round(base * 3);
      default: // Авто
        return Math.round(base);
    }
  }, [origin, destination, transport]);

  const duration = useMemo(() => {
    switch (transport) {
      case "Авиа":
        return "1–2 дня";
      case "Море":
        return "10–15 дней";
      case "ЖД":
        return "5–7 дней";
      case "Мультимодальная":
        return "7–12 дней";
      default:
        return "3–5 дней";
    }
  }, [transport]);

  const weather = ["☀️", "⛅", "🌧️", "❄️"][distance % 4];
  const load = distance > 2500 ? "Высокая" : distance > 1200 ? "Средняя" : "Низкая";
  const eco =
    transport === "Авиа" ? "⚠️" : transport === "Море" ? "♻️" : "✅";

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700 rounded-2xl shadow-xl p-8 overflow-hidden backdrop-blur">
      {/* Заголовок */}
      <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-6 text-center flex items-center justify-center gap-2">
        <Navigation2 className="w-5 h-5 text-blue-500" />
        Визуализация маршрута
      </h3>

      {/* Линия маршрута */}
      <div className="relative flex justify-between items-center h-32 sm:h-36 mx-4 sm:mx-6">
        {/* Отправление */}
        <div className="flex flex-col items-center space-y-2 w-28 text-center">
          <MapPin className="text-green-600 w-5 h-5" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate w-full">
            {origin || "Город A"}
          </span>
        </div>

        {/* Центральная анимированная линия */}
        <div className="relative flex-1 h-1.5 bg-gradient-to-r from-blue-200 to-cyan-300 dark:from-gray-700 dark:to-blue-800 rounded-full overflow-hidden mx-2">
          <motion.div
            className="absolute left-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute top-[-14px]"
            initial={{ x: 0 }}
            animate={{ x: "100%" }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            {travelIcon}
          </motion.div>
        </div>

        {/* Назначение */}
        <div className="flex flex-col items-center space-y-2 w-28 text-center">
          <MapPin className="text-red-600 w-5 h-5" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate w-full">
            {destination || "Город B"}
          </span>
        </div>
      </div>

      {/* Метрики */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <Metric icon={<Globe className="w-4 h-4 text-blue-500" />} title="Расстояние" value={`${distance} км`} />
        <Metric icon={<Clock className="w-4 h-4 text-blue-500" />} title="Срок" value={duration} />
        <Metric icon={<Truck className="w-4 h-4 text-blue-500" />} title="Транспорт" value={transport || "—"} />
        <Metric icon={<Cloud className="w-4 h-4 text-blue-500" />} title="Погода" value={weather} />
        <Metric icon={<Zap className="w-4 h-4 text-blue-500" />} title="Загруженность" value={load} />
      </div>

      {/* Доп. показатели */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Recycle className="w-4 h-4 text-green-500" />
          <span>Эко-оценка: {eco}</span>
        </div>
        <div className="flex items-center gap-1">
          <Route className="w-4 h-4 text-cyan-500" />
          <span>Маршрут рассчитан автоматически</span>
        </div>
      </div>

      {/* Подпись */}
      <p className="mt-6 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
        Маршрут отображается для наглядности. Показатели ориентировочные.
      </p>

      {/* Декоративный эффект */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-300/10 to-cyan-300/10 blur-3xl pointer-events-none" />
    </div>
  );
}

function Metric({ icon, title, value }: { icon: JSX.Element; title: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {icon}
      <span>{title}</span>
      <strong className="text-gray-900 dark:text-gray-100">{value}</strong>
    </div>
  );
}
