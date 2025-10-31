"use client";

import { motion } from "framer-motion";
import {
  Car,
  Plane,
  Ship,
  TrainFront,
  Route,
  ChevronDown,
  CalendarDays,
  Weight,
  Coins,
} from "lucide-react";
import { useState } from "react";
import CityAutocomplete from "@/components/CityAutocomplete";
import RailStationAutocomplete from "@/components/RailStationAutocomplete";

export default function SearchSection() {
  const [mode, setMode] = useState("auto");
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({
    from: "",
    to: "",
    cargo: "",
    weight: "",
    date: "",
    priceMin: "",
    priceMax: "",
  });

  const transportModes = [
    { id: "auto", label: "Авто", icon: Car },
    { id: "rail", label: "ЖД", icon: TrainFront },
    { id: "sea", label: "Море", icon: Ship },
    { id: "air", label: "Авиа", icon: Plane },
    { id: "multi", label: "Мультимодальная", icon: Route },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `🔍 Поиск: ${form.from} → ${form.to} (${form.cargo || "—"}) [${mode}]`
    );
  };

  return (
    <section className="relative z-10 py-20 px-4 sm:px-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto text-center">
        {/* 🌍 Заголовок */}
        <motion.h2
          className="text-3xl sm:text-4xl font-bold mb-10 text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Поиск грузоперевозки
        </motion.h2>

        {/* 🚛 Переключатели транспорта */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {transportModes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                mode === id
                  ? "bg-blue-600 text-white shadow-md scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border hover:shadow"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </motion.div>

        {/* 🔍 Форма поиска */}
        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 p-5 rounded-2xl max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/70 backdrop-blur-md shadow-xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {/* Поля направления */}
          {mode === "rail" ? (
            <>
              <RailStationAutocomplete
                label=""
                placeholder="Станция отправления"
                value={form.from}
                onChange={(v) => setForm({ ...form, from: v })}
              />
              <RailStationAutocomplete
                label=""
                placeholder="Станция прибытия"
                value={form.to}
                onChange={(v) => setForm({ ...form, to: v })}
              />
            </>
          ) : (
            <>
              <CityAutocomplete
                label=""
                placeholder="Откуда"
                value={form.from}
                onChange={(v) => setForm({ ...form, from: v })}
              />
              <CityAutocomplete
                label=""
                placeholder="Куда"
                value={form.to}
                onChange={(v) => setForm({ ...form, to: v })}
              />
            </>
          )}

          <input
            type="text"
            name="cargo"
            placeholder="Тип груза"
            value={form.cargo}
            onChange={handleChange}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition"
          >
            Найти
          </button>
        </motion.form>

        {/* 🔽 Кнопка “Расширенный поиск” */}
        <div className="mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1 mx-auto text-sm font-medium"
          >
            Расширенный поиск
            <ChevronDown
              className={`w-4 h-4 transition ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* ⚙️ Расширенные поля */}
        {expanded && (
          <motion.div
            className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 border p-3 rounded-xl bg-white dark:bg-gray-800">
              <Weight className="w-4 h-4 text-gray-500" />
              <input
                type="number"
                name="weight"
                placeholder="Вес, т"
                value={form.weight}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2 border p-3 rounded-xl bg-white dark:bg-gray-800">
              <CalendarDays className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2 border p-3 rounded-xl bg-white dark:bg-gray-800">
              <Coins className="w-4 h-4 text-gray-500" />
              <input
                type="number"
                name="priceMin"
                placeholder="Цена от"
                value={form.priceMin}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2 border p-3 rounded-xl bg-white dark:bg-gray-800">
              <Coins className="w-4 h-4 text-gray-500" />
              <input
                type="number"
                name="priceMax"
                placeholder="Цена до"
                value={form.priceMax}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
          </motion.div>
        )}

        {/* ℹ️ Подсказка */}
        <p className="text-sm text-gray-500 mt-6">
          Выберите тип перевозки и заполните поля для быстрого или расширенного
          поиска предложений.
        </p>
      </div>
    </section>
  );
}
