"use client";

import { useState } from "react";
import {
  TrainFront,
  MapPin,
  Search,
  ChevronDown,
  XCircle,
  Factory,
  FileText,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import stations from "@/data/rail_stations.json"; // структура: [{code, name, region, road, department}]

interface Station {
  code: string;
  name: string;
  region?: string;
  road?: string;
  department?: string;
}

export default function RailSearch({ onSearch }: { onSearch?: (data: any) => void }) {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Station[]>([]);

  const [form, setForm] = useState({
    fromStation: "",
    toStation: "",
    weight: "",
    wagonType: "",
    gng: "",
    etcng: "",
    road: "",
    department: "",
    owner: "",
    senderCode: "",
    insured: false,
  });

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 1) {
      const f = stations
        .filter(
          (s) =>
            s.name.toLowerCase().includes(val.toLowerCase()) ||
            s.code.includes(val)
        )
        .slice(0, 15);
      setResults(f);
    } else setResults([]);
  };

  const selectStation = (station: Station, type: "from" | "to") => {
    if (type === "from") {
      setForm((f) => ({
        ...f,
        fromStation: `${station.name} (${station.code})`,
        road: station.road || "",
        department: station.department || "",
      }));
    } else {
      setForm((f) => ({
        ...f,
        toStation: `${station.name} (${station.code})`,
      }));
    }
    setQuery("");
    setResults([]);
  };

  const clearForm = () => {
    setForm({
      fromStation: "",
      toStation: "",
      weight: "",
      wagonType: "",
      gng: "",
      etcng: "",
      road: "",
      department: "",
      owner: "",
      senderCode: "",
      insured: false,
    });
    setQuery("");
    setResults([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <TrainFront className="w-5 h-5" /> Железнодорожные перевозки
        </h2>
        <button
          onClick={clearForm}
          className="text-gray-400 hover:text-red-500 transition"
          title="Очистить"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Переключатель */}
      <div className="flex justify-center gap-3 text-sm">
        <button
          onClick={() => setMode("simple")}
          className={`px-3 py-1 rounded-lg ${
            mode === "simple"
              ? "bg-blue-600 text-white"
              : "text-gray-600 dark:text-gray-300"
          }`}
        >
          Упрощённый
        </button>
        <button
          onClick={() => setMode("advanced")}
          className={`px-3 py-1 rounded-lg ${
            mode === "advanced"
              ? "bg-blue-600 text-white"
              : "text-gray-600 dark:text-gray-300"
          }`}
        >
          Расширенный
        </button>
      </div>

      {/* Упрощённый */}
      {mode === "simple" && (
        <motion.div
          key="simple"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <SearchStationInput
              placeholder="Станция отправления"
              value={form.fromStation || query}
              onChange={handleQueryChange}
              onSelect={(s) => selectStation(s, "from")}
              results={results}
            />
            <SearchStationInput
              placeholder="Станция назначения"
              value={form.toStation}
              onChange={(val) => setForm({ ...form, toStation: val })}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <input
              type="number"
              placeholder="Вес, т"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <select
              value={form.wagonType}
              onChange={(e) => setForm({ ...form, wagonType: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Тип вагона</option>
              <option>Полувагон</option>
              <option>Крытый</option>
              <option>Платформа</option>
              <option>Цистерна</option>
              <option>Хоппер</option>
            </select>
            <input
              placeholder="Груз (ЕТСНГ)"
              value={form.etcng}
              onChange={(e) => setForm({ ...form, etcng: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
          </div>
        </motion.div>
      )}

      {/* Расширенный */}
      <AnimatePresence>
        {mode === "advanced" && (
          <motion.div
            key="advanced"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid md:grid-cols-2 gap-3">
              <input
                placeholder="Код станции отправления"
                value={form.fromStation}
                onChange={(e) => setForm({ ...form, fromStation: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                placeholder="Код станции назначения"
                value={form.toStation}
                onChange={(e) => setForm({ ...form, toStation: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                placeholder="Код ЕТСНГ"
                value={form.etcng}
                onChange={(e) => setForm({ ...form, etcng: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                placeholder="Код ГНГ"
                value={form.gng}
                onChange={(e) => setForm({ ...form, gng: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <input
                placeholder="Дорога (например: Алматинская)"
                value={form.road}
                onChange={(e) => setForm({ ...form, road: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                placeholder="Отделение дороги"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                placeholder="Собственник вагона"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                placeholder="Код грузоотправителя (ОКПО / ЕДРПОУ)"
                value={form.senderCode}
                onChange={(e) => setForm({ ...form, senderCode: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <select
                value={form.wagonType}
                onChange={(e) => setForm({ ...form, wagonType: e.target.value })}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Тип вагона</option>
                <option>Полувагон</option>
                <option>Крытый</option>
                <option>Платформа</option>
                <option>Цистерна</option>
                <option>Хоппер</option>
                <option>Изотерм</option>
                <option>Минераловоз</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Кнопка */}
      <div className="text-center pt-4">
        <button
          onClick={() => onSearch?.(form)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition"
        >
          <Search size={18} /> Найти перевозку
        </button>
      </div>
    </div>
  );
}

/* 🔍 Компоненты */
function SearchStationInput({
  placeholder,
  value,
  onChange,
  onSelect,
  results,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSelect?: (s: any) => void;
  results?: Station[];
}) {
  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-3 text-blue-500" />
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border rounded-lg"
      />
      {results && results.length > 0 && (
        <ul className="absolute w-full bg-white dark:bg-gray-700 border rounded-lg mt-1 z-30 max-h-56 overflow-y-auto shadow">
          {results.map((r, i) => (
            <li
              key={i}
              onClick={() => onSelect?.(r)}
              className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer"
            >
              {r.name} ({r.code}) — {r.road}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
