"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import type { CalendarEvent } from "./LiteCalendar";

export default function EventForm({
  defaultDate,
  onCancel,
  onSubmit,
}: {
  defaultDate: Date;
  onCancel: () => void;
  onSubmit: (payload: Omit<CalendarEvent, "id">) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    type: "auction" as CalendarEvent["type"],
    startAt: toLocalInput(defaultDate),
    endAt: "",
    note: "",
    color: "#2563eb",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Omit<CalendarEvent, "id"> = {
      title: form.title.trim() || "Событие",
      type: form.type as CalendarEvent["type"],
      startAt: new Date(form.startAt),
      endAt: form.endAt ? new Date(form.endAt) : null,
      note: form.note,
      color: form.color,
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl p-6 relative"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3 right-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-semibold mb-4">Новое событие</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Название</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Напр.: Подача авто / Окончание аукциона"
              className="mt-1 w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Тип события</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="auction">Аукцион</option>
                <option value="shipment">Перевозка</option>
                <option value="payment">Платёж</option>
                <option value="reminder">Напоминание</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Цвет</label>
              <input
                type="color"
                name="color"
                value={form.color}
                onChange={handleChange}
                className="mt-1 h-[42px] w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Начало</label>
              <input
                type="datetime-local"
                name="startAt"
                value={form.startAt}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Окончание (необязательно)</label>
              <input
                type="datetime-local"
                name="endAt"
                value={form.endAt}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Заметка</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Условия погрузки, контакты смены, тайм-слоты терминала и т.п."
              className="mt-1 w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 h-24 bg-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Сохранить
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  );
}

function toLocalInput(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}