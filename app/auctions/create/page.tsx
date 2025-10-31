"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAuction } from "@/lib/auctions";
import { auth } from "@/lib/firebase";
import { useToast } from "@/components/ToastProvider";
import { Loader2, PlusCircle, ArrowLeft, Truck, Train, Plane, Ship, Route } from "lucide-react";
import Link from "next/link";

export default function CreateAuctionPage() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"auto" | "rail" | "air" | "sea" | "multimodal">("auto");

  const [form, setForm] = useState({
    title: "",
    description: "",
    origin: "",
    destination: "",
    price: "",
    currency: "KZT",
  });

  const router = useRouter();
  const { toast } = useToast();

  // 🧠 Обработка изменений формы
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  // 🚀 Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      toast({
        type: "warning",
        title: "Требуется вход",
        description: "Авторизуйтесь, чтобы создать заявку",
      });
      router.push("/auth/login");
      return;
    }

    if (!form.title || !form.origin || !form.destination || !form.price) {
      toast({
        type: "error",
        title: "Проверьте поля",
        description: "Заполните все обязательные поля",
      });
      return;
    }

    setLoading(true);
    try {
      await createAuction({
        title: form.title.trim(),
        description: buildDescription(mode, form),
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        price: Number(form.price),
        currency: form.currency,
        createdBy: user.email || "unknown@wayx.kz",
        status: "open",
        transport: mode,
      });

      toast({
        type: "success",
        title: "Заявка опубликована",
        description: "Аукцион успешно создан и виден поставщикам 🚚",
      });

      router.push("/auctions");
    } catch (err: any) {
      console.error("Ошибка создания аукциона:", err);
      toast({
        type: "error",
        title: "Ошибка при создании",
        description: "Не удалось создать заявку. Попробуйте позже.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto py-16 px-6">
      {/* 🔙 Назад */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/auctions"
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-sky-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </Link>
      </div>

      {/* Заголовок */}
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-blue-600 dark:text-sky-400">
        <PlusCircle className="w-6 h-6" /> Новая заявка
      </h1>

      {/* 🚛 Выбор транспорта */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
        {[
          { id: "auto", label: "Авто", icon: <Truck className="w-4 h-4" /> },
          { id: "rail", label: "ЖД", icon: <Train className="w-4 h-4" /> },
          { id: "air", label: "Авиа", icon: <Plane className="w-4 h-4" /> },
          { id: "sea", label: "Море", icon: <Ship className="w-4 h-4" /> },
          { id: "multimodal", label: "Мультимодал", icon: <Route className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setMode(t.id as any)}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition ${
              mode === t.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-300"
            }`}
          >
            {t.icon}
            <span className="text-sm font-medium">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Форма */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white/80 dark:bg-slate-900/70 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow backdrop-blur"
      >
        <div className="space-y-4">
          <input
            name="title"
            placeholder="Название груза (например: Перевозка мебели)"
            required
            className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Описание груза, вес, особенности..."
            rows={4}
            required
            className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={handleChange}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="origin"
              placeholder="Откуда (город, адрес)"
              required
              className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={handleChange}
            />
            <input
              name="destination"
              placeholder="Куда (город, адрес)"
              required
              className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              name="price"
              type="number"
              placeholder="Начальная цена (₸)"
              required
              className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={handleChange}
            />
            <select
              name="currency"
              value={form.currency}
              className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={handleChange}
            >
              <option value="KZT">KZT (₸)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all shadow ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600"
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto w-5 h-5" />
          ) : (
            "Создать заявку"
          )}
        </button>
      </form>
    </section>
  );
}

// 🧩 Универсальное описание груза
function buildDescription(
  mode: "auto" | "rail" | "air" | "sea" | "multimodal",
  f: { description: string }
) {
  return `Тип транспорта: ${mode.toUpperCase()}\nОписание: ${f.description.trim()}`;
}
