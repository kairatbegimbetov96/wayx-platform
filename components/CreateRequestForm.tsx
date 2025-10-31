"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { createRequest, createAuction } from "@/lib/firestore"; 
import { TransportMode } from "@/types/user"; 
import { auth, db } from "@/lib/firebase";
import {
  Send,
  Loader2,
  Calendar as Cal,
  Truck,
  Plane,
  Ship,
  TrainFront,
  Network,
} from "lucide-react";

interface FormData {
  origin: string;
  destination: string;
  transport: TransportMode;
  weightTons: string;
  description: string;
  desiredPrice: string;
  deadlineAt: string;
}

export default function CreateRequestForm() {
  const [form, setForm] = useState<FormData>({
    origin: "",
    destination: "",
    transport: "Авто",
    weightTons: "",
    description: "",
    desiredPrice: "",
    deadlineAt: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      (window as any).toast?.("⚠️ Войдите, чтобы создать заявку", "error");
      return;
    }

    if (!form.origin || !form.destination) {
      (window as any).toast?.("❗ Укажите города отправления и назначения", "error");
      return;
    }

    if (!form.weightTons || Number(form.weightTons) <= 0) {
      (window as any).toast?.("⚖️ Укажите корректный вес", "info");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const reqId = await createRequest(user.uid, {
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        transport: form.transport,
        weightTons: Number(form.weightTons),
        description: form.description.trim() || undefined,
        desiredPrice: form.desiredPrice ? Number(form.desiredPrice) : undefined,
        deadlineAt: form.deadlineAt ? new Date(form.deadlineAt) : undefined,
      });

      await createAuction(user.uid, reqId, {
        minStep: 5000,
        sealed: false,
        deadlineAt: form.deadlineAt ? new Date(form.deadlineAt) : undefined,
      });

      (window as any).toast?.("✅ Заявка и аукцион успешно созданы!", "success");
      setSuccess(true);

      setForm({
        origin: "",
        destination: "",
        transport: "Авто",
        weightTons: "",
        description: "",
        desiredPrice: "",
        deadlineAt: "",
      });
    } catch (e: any) {
      console.error("Ошибка:", e);
      (window as any).toast?.(e.message || "Ошибка при создании заявки", "error");
    } finally {
      setLoading(false);
    }
  };

  const transportOptions = [
    { id: "Авто", label: "Авто", icon: <Truck className="w-4 h-4" /> },
    { id: "ЖД", label: "ЖД", icon: <TrainFront className="w-4 h-4" /> },
    { id: "Авиа", label: "Авиа", icon: <Plane className="w-4 h-4" /> },
    { id: "Море", label: "Море", icon: <Ship className="w-4 h-4" /> },
    { id: "Мультимодальная", label: "Мультимодальная", icon: <Network className="w-4 h-4" /> },
  ];

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-5 border border-gray-200 dark:border-gray-700"
    >
      {/* 🔹 Заголовок */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
          Новая заявка
        </h2>
        {success && (
          <span className="text-green-500 text-sm font-medium">
            ✔️ Успешно создано
          </span>
        )}
      </div>

      {/* 🏙️ Города */}
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Откуда"
          value={form.origin}
          placeholder="Например: Алматы"
          onChange={(e) => setForm({ ...form, origin: e.target.value })}
        />
        <Input
          label="Куда"
          value={form.destination}
          placeholder="Например: Астана"
          onChange={(e) => setForm({ ...form, destination: e.target.value })}
        />
      </div>

      {/* 🚛 Транспорт */}
      <div>
        <label className="block text-sm font-medium mb-1">Тип транспорта</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {transportOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setForm({ ...form, transport: opt.id as TransportMode })}
              className={`flex items-center justify-center gap-1 border rounded-lg py-2 px-3 transition ${
                form.transport === opt.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "border-gray-300 dark:border-gray-700 hover:border-blue-400"
              }`}
            >
              {opt.icon}
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ⚖️ Вес, ставка, дедлайн */}
      <div className="grid md:grid-cols-3 gap-4">
        <Input
          label="Вес, т"
          type="number"
          value={form.weightTons}
          placeholder="Например: 10"
          onChange={(e) => setForm({ ...form, weightTons: e.target.value })}
        />
        <Input
          label="Ставка клиента, ₸ (опц.)"
          type="number"
          value={form.desiredPrice}
          placeholder="Минимальная ставка"
          onChange={(e) => setForm({ ...form, desiredPrice: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium mb-1">
            Дедлайн ставок (опц.)
          </label>
          <div className="flex items-center gap-2">
            <Cal className="w-4 h-4 text-gray-400" />
            <input
              type="datetime-local"
              value={form.deadlineAt}
              onChange={(e) => setForm({ ...form, deadlineAt: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 📝 Описание */}
      <div>
        <label className="block text-sm font-medium mb-1">Описание (опц.)</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Например: 2 контейнера стройматериалов, требуется доставка до склада..."
          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-500 h-20 resize-none text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* 🚀 Кнопка */}
      <button
        disabled={loading}
        className="w-full md:w-auto inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium shadow transition disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Публикация...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Опубликовать заявку и открыть аукцион
          </>
        )}
      </button>
    </motion.form>
  );
}

/* 🔹 Общий Input-компонент */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function Input({ label, ...rest }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        {...rest}
        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-gray-100"
      />
    </div>
  );
}
