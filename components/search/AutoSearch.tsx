"use client";

import { useState } from "react";
import {
  MapPin,
  Search,
  Truck,
  Settings,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import cities from "@/data/cities.json";

interface City {
  name: string;
  country?: string;
  region?: string;
}

export default function AutoSearch({ onSearch }: { onSearch?: (data: any) => void }) {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);

  const [form, setForm] = useState({
    origin: "",
    destination: "",
    weight: "",
    volume: "",
    bodyType: "",
    loadType: "",
    cargoType: "",
    paymentType: "",
    temperature: "",
    length: "",
    width: "",
    height: "",
    equipment: [] as string[],
    documents: [] as string[],
    insured: false,
    fromDate: "",
    toDate: "",
  });

  // 🔍 Поиск по городам
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 1) {
      const found = cities
        .filter((c) => c.name.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 10);
      setResults(found);
    } else setResults([]);
  };

  // 📦 Выбор города
  const selectCity = (name: string) => {
    if (!form.origin) setForm((f) => ({ ...f, origin: name }));
    else setForm((f) => ({ ...f, destination: name }));
    setQuery("");
    setResults([]);
  };

  // ♻️ Очистка формы
  const clearForm = () => {
    setForm({
      origin: "",
      destination: "",
      weight: "",
      volume: "",
      bodyType: "",
      loadType: "",
      cargoType: "",
      paymentType: "",
      temperature: "",
      length: "",
      width: "",
      height: "",
      equipment: [],
      documents: [],
      insured: false,
      fromDate: "",
      toDate: "",
    });
    setQuery("");
    setResults([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <Truck className="w-5 h-5" /> Автоперевозки
        </h2>
        <button
          onClick={clearForm}
          className="text-gray-400 hover:text-red-500 transition"
          title="Очистить"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Переключатель режимов */}
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

      {/* Упрощённый поиск */}
      {mode === "simple" && (
        <motion.div
          key="simple"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <SearchInput
              placeholder="Откуда (город)"
              value={form.origin || query}
              onChange={(val) => handleQueryChange(val)}
              onSelect={selectCity}
              results={results}
            />
            <SearchInput
              placeholder="Куда (город)"
              value={form.destination}
              onChange={(val) => setForm({ ...form, destination: val })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Вес, т"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <select
              value={form.bodyType}
              onChange={(e) => setForm({ ...form, bodyType: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Тип кузова</option>
              <option>Тент</option>
              <option>Рефрижератор</option>
              <option>Контейнер</option>
              <option>Бортовой</option>
              <option>Самосвал</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <select
              value={form.loadType}
              onChange={(e) => setForm({ ...form, loadType: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Тип загрузки</option>
              <option>Боковая</option>
              <option>Задняя</option>
              <option>Верхняя</option>
            </select>
            <input
              type="date"
              value={form.fromDate}
              onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
          </div>
        </motion.div>
      )}

      {/* Расширенный поиск */}
      <AnimatePresence>
        {mode === "advanced" && (
          <motion.div
            key="advanced"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid md:grid-cols-3 gap-3">
              <input
                type="number"
                placeholder="Вес (т)"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="number"
                placeholder="Объём (м³)"
                value={form.volume}
                onChange={(e) => setForm({ ...form, volume: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <select
                value={form.cargoType}
                onChange={(e) => setForm({ ...form, cargoType: e.target.value })}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Тип груза</option>
                <option>Обычный</option>
                <option>Опасный (ADR)</option>
                <option>Негабарит</option>
                <option>Сборный</option>
              </select>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <input
                type="number"
                placeholder="Длина кузова (м)"
                value={form.length}
                onChange={(e) => setForm({ ...form, length: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="number"
                placeholder="Ширина кузова (м)"
                value={form.width}
                onChange={(e) => setForm({ ...form, width: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
              <input
                type="number"
                placeholder="Высота кузова (м)"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <select
                value={form.paymentType}
                onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Способ оплаты</option>
                <option>Наличный</option>
                <option>Безналичный</option>
                <option>По договору</option>
              </select>
              <input
                type="text"
                placeholder="Температура (°C)"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <MultiSelect
                label="Оборудование"
                options={["Гидроборт", "GPS", "Кран", "Термоконтроль"]}
                selected={form.equipment}
                onChange={(v) => setForm({ ...form, equipment: v })}
              />
              <MultiSelect
                label="Документы"
                options={["CMR", "TIR", "ADR", "Страховка"]}
                selected={form.documents}
                onChange={(v) => setForm({ ...form, documents: v })}
              />
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

function SearchInput({
  placeholder,
  value,
  onChange,
  onSelect,
  results,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSelect?: (v: string) => void;
  results?: City[];
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
              onClick={() => onSelect?.(r.name)}
              className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer"
            >
              {r.name}
              {r.country && `, ${r.country}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter((x) => x !== opt));
    else onChange([...selected, opt]);
  };
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1 text-sm rounded-full border transition ${
              selected.includes(opt)
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-blue-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
