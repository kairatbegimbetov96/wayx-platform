// app/orders/new/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, ArrowLeft, Loader2, ChevronDown, Train, Plane, Ship, Truck } from "lucide-react";
import { createAuction } from "@/lib/auctions";
import { auth } from "@/lib/firebase";
import { useToast } from "@/components/ToastProvider";
import CityAutocomplete from "@/components/CityAutocomplete";
import RailStationAutocomplete from "@/components/RailStationAutocomplete";

type Transport = "auto" | "rail" | "air" | "sea" | "multimodal";

export default function NewOrderPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<Transport>("auto");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    currency: "KZT",

    // простые поля (по умолчанию города)
    originCity: "",
    destinationCity: "",

    // rail-станции
    originStation: "",
    destinationStation: "",

    // расширенные
    weightKg: "",
    volumeM3: "",
    lengthM: "",
    widthM: "",
    heightM: "",
    pickupDate: "",
    bodyType: "",      // тип кузова/контейнера
    notes: "",         // доп. пожелания
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      toast({ type: "warning", title: "Требуется вход", description: "Авторизуйтесь, чтобы создать заявку." });
      router.push("/auth/login");
      return;
    }

    if (!form.title || !form.price) {
      toast({ type: "error", title: "Проверьте поля", description: "Название и цена обязательны." });
      return;
    }

    // базовая валидация направлений
    if (mode === "rail") {
      if (!form.originStation || !form.destinationStation) {
        toast({ type: "error", title: "Нужно указать станции", description: "Для ЖД выберите станции отправления и прибытия." });
        return;
      }
    } else {
      if (!form.originCity || !form.destinationCity) {
        toast({ type: "error", title: "Нужно указать города", description: "Выберите город отправления и город назначения." });
        return;
      }
    }

    setLoading(true);
    try {
      // Сведём в единый payload для createAuction (наша общая модель auctions)
      const origin = mode === "rail" ? form.originStation : form.originCity;
      const destination = mode === "rail" ? form.destinationStation : form.destinationCity;

     await createAuction({
  title: form.title.trim(),
  description: buildDescription(mode, form),
  origin,
  destination,
  price: Number(form.price),
  currency: form.currency,
  createdBy: user.email || "unknown@wayx.kz",
  status: "open",
  transport: mode, // 🔹 Добавлено!
});


      toast({ type: "success", title: "Заявка создана", description: "Опубликована на бирже WayX." });
      router.push("/market"); // или /auctions, если у тебя так
    } catch (err: any) {
      console.error(err);
      toast({ type: "error", title: "Ошибка", description: "Не удалось создать заявку." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto py-16 px-6">
      {/* Назад */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/market" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-sky-400 transition">
          <ArrowLeft className="w-4 h-4" /> Назад
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-blue-600 dark:text-sky-400">
        <PlusCircle className="w-6 h-6" /> Новая заявка
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/70 dark:bg-slate-900/70 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow backdrop-blur">
        {/* Вид транспорта */}
        <TransportSelector value={mode} onChange={setMode} />

        {/* Блок направления */}
        {mode === "rail" ? (
          <div className="grid md:grid-cols-2 gap-4">
            <RailStationAutocomplete
              label="Станция отправления"
              placeholder="Например: Алматы-1"
              value={form.originStation}
              onChange={(v) => set("originStation", v)}
            />
            <RailStationAutocomplete
              label="Станция прибытия"
              placeholder="Например: Нур-Султан-1"
              value={form.destinationStation}
              onChange={(v) => set("destinationStation", v)}
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <CityAutocomplete
              label="Откуда (город)"
              placeholder="Алматы"
              value={form.originCity}
              onChange={(v) => set("originCity", v)}
            />
            <CityAutocomplete
              label="Куда (город)"
              placeholder="Астана"
              value={form.destinationCity}
              onChange={(v) => set("destinationCity", v)}
            />
          </div>
        )}

        {/* Название + описание */}
        <div className="space-y-4">
          <input
            name="title"
            placeholder="Название груза (например: Перевозка мебели)"
            required
            className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => set("title", e.target.value)}
          />
          <textarea
            name="description"
            placeholder="Краткое описание (характер груза, особенности)"
            rows={3}
            className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        {/* Цена/валюта */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="price"
            type="number"
            min="0"
            placeholder="Бюджет / начальная цена"
            required
            className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => set("price", e.target.value)}
          />
          <select
            name="currency"
            value={form.currency}
            className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => set("currency", e.target.value)}
          >
            <option value="KZT">KZT (₸)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        {/* Расширенные поля */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-sky-400 hover:underline"
          >
            Дополнительные параметры
            <ChevronDown className={`w-4 h-4 transition ${expanded ? "rotate-180" : ""}`} />
          </button>

          {expanded && (
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <input
                placeholder="Вес, кг"
                inputMode="numeric"
                className="p-3 border rounded-xl bg-white dark:bg-slate-800"
                onChange={(e) => set("weightKg", e.target.value)}
              />
              <input
                placeholder="Объём, м³"
                inputMode="numeric"
                className="p-3 border rounded-xl bg-white dark:bg-slate-800"
                onChange={(e) => set("volumeM3", e.target.value)}
              />
              <input
                placeholder="Дата отгрузки"
                type="date"
                className="p-3 border rounded-xl bg-white dark:bg-slate-800"
                onChange={(e) => set("pickupDate", e.target.value)}
              />

              <input
                placeholder="Длина, м"
                inputMode="numeric"
                className="p-3 border rounded-xl bg-white dark:bg-slate-800"
                onChange={(e) => set("lengthM", e.target.value)}
              />
              <input
                placeholder="Ширина, м"
                inputMode="numeric"
                className="p-3 border rounded-xl bg-white dark:bg-slate-800"
                onChange={(e) => set("widthM", e.target.value)}
              />
              <input
                placeholder="Высота, м"
                inputMode="numeric"
                className="p-3 border rounded-xl bg-white dark:bg-slate-800"
                onChange={(e) => set("heightM", e.target.value)}
              />

              <input
                placeholder={mode === "sea" ? "Тип контейнера (20DV/40HC…)" : mode === "auto" ? "Тип кузова (тент/реф/изотерм…)" : "Тип оборудования"}
                className="p-3 border rounded-xl bg-white dark:bg-slate-800 md:col-span-2"
                onChange={(e) => set("bodyType", e.target.value)}
              />
              <input
                placeholder="Пожелания (загрузка бок/верх, температ., ADR и пр.)"
                className="p-3 border rounded-xl bg-white dark:bg-slate-800 md:col-span-3"
                onChange={(e) => set("notes", e.target.value)}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all shadow ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600"
          }`}
        >
          {loading ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : "Опубликовать заявку"}
        </button>
      </form>
    </section>
  );
}

function TransportSelector({
  value,
  onChange,
}: {
  value: "auto" | "rail" | "air" | "sea" | "multimodal";
  onChange: (v: Transport) => void;
}) {
  const opts: { key: Transport; label: string; icon: JSX.Element }[] = [
    { key: "auto", label: "Авто", icon: <Truck className="w-4 h-4" /> },
    { key: "rail", label: "Ж/Д", icon: <Train className="w-4 h-4" /> },
    { key: "air", label: "Авиа", icon: <Plane className="w-4 h-4" /> },
    { key: "sea", label: "Море", icon: <Ship className="w-4 h-4" /> },
    { key: "multimodal", label: "Мультимодал", icon: <LayersIcon /> },
  ];

  return (
    <div>
      <p className="text-sm font-semibold mb-2">Вид транспорта</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {opts.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition ${
              value === o.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-300"
            }`}
          >
            {o.icon}
            <span className="text-sm font-medium">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3 9 4.5L12 12 3 7.5 12 3Z" />
      <path d="M3 12l9 4.5L21 12" />
      <path d="M3 16.5 12 21l9-4.5" />
    </svg>
  );
}

function buildDescription(
  mode: Transport,
  f: {
    description: string;
    weightKg: string;
    volumeM3: string;
    lengthM: string;
    widthM: string;
    heightM: string;
    pickupDate: string;
    bodyType: string;
    notes: string;
  }
) {
  const lines: string[] = [];
  if (f.description) lines.push(f.description.trim());
  lines.push(`Транспорт: ${mode}`);
  const dims = [f.lengthM, f.widthM, f.heightM].filter(Boolean).join("×");
  if (f.weightKg) lines.push(`Вес: ${f.weightKg} кг`);
  if (f.volumeM3) lines.push(`Объём: ${f.volumeM3} м³`);
  if (dims) lines.push(`Габариты (Д×Ш×В): ${dims} м`);
  if (f.bodyType) lines.push(`Тип кузова/контейнера: ${f.bodyType}`);
  if (f.pickupDate) lines.push(`Дата отгрузки: ${f.pickupDate}`);
  if (f.notes) lines.push(`Пожелания: ${f.notes}`);
  return lines.join("\n");
}
