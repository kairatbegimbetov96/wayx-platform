"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export type CalendarEvent = {
  id: string;
  title: string;
  type: "auction" | "shipment" | "payment" | "reminder";
  startAt: Date;
  endAt?: Date | null;
  note?: string;
  color?: string;
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addDays(d: Date, days: number) {
  const dd = new Date(d);
  dd.setDate(dd.getDate() + days);
  return dd;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function LiteCalendar({
  events,
  onDayClick,
  onDelete,
}: {
  events: CalendarEvent[];
  onDayClick?: (date: Date) => void;
  onDelete?: (id: string) => void;
}) {
  const [cursor, setCursor] = useState<Date>(startOfMonth(new Date()));
  const monthStart = useMemo(() => startOfMonth(cursor), [cursor]);
  const monthEnd = useMemo(() => endOfMonth(cursor), [cursor]);

  // сетка: от понедельника
  const firstWeekDay = (monthStart.getDay() + 6) % 7; // 0..6 (пн..вс)
  const daysInMonth = monthEnd.getDate();
  const totalCells = Math.ceil((firstWeekDay + daysInMonth) / 7) * 7;

  const cells: Date[] = useMemo(() => {
    const arr: Date[] = [];
    const gridStart = addDays(monthStart, -firstWeekDay);
    for (let i = 0; i < totalCells; i++) {
      arr.push(addDays(gridStart, i));
    }
    return arr;
  }, [firstWeekDay, monthStart, totalCells]);

  const dayEvents = (d: Date) =>
    events.filter((e) => isSameDay(e.startAt, d)).slice(0, 3); // показываем 3

  const monthName = cursor.toLocaleString("ru-RU", { month: "long", year: "numeric" });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
      {/* шапка */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="prev"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-lg font-semibold capitalize">{monthName}</div>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* дни недели */}
      <div className="grid grid-cols-7 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 px-3 py-2">
        {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map((d) => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>

      {/* сетка */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        {cells.map((d, idx) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const today = isSameDay(d, new Date());
          const ev = dayEvents(d);
          return (
            <div
              key={idx}
              onClick={() => onDayClick?.(d)}
              className={`min-h-[110px] bg-white dark:bg-gray-800 p-2 cursor-pointer hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition
                ${inMonth ? "" : "opacity-50"}
                ${today ? "ring-2 ring-blue-500" : ""}
              `}
            >
              <div className="text-xs text-right text-gray-500 dark:text-gray-400">{d.getDate()}</div>
              <div className="mt-1 flex flex-col gap-1">
                {ev.map((e) => (
                  <div key={e.id} className="text-[11px] rounded px-2 py-1 flex items-center justify-between"
                       style={{ background: `${e.color}1A`, color: e.color }}>
                    <span className="truncate">{badgeFromType(e.type)} {e.title}</span>
                    {onDelete && (
                      <button
                        onClick={(st) => { st.stopPropagation(); onDelete(e.id); }}
                        className="ml-2 text-red-500 hover:text-red-600"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function badgeFromType(t: CalendarEvent["type"]) {
  switch (t) {
    case "auction": return "🏷️";
    case "shipment": return "🚚";
    case "payment": return "💳";
    default: return "🔔";
  }
}