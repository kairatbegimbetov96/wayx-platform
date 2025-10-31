// components/CityAutocomplete.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
};

type City = { name: string; country?: string; region?: string };

export default function CityAutocomplete({ label, placeholder, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value);
  const [data, setData] = useState<City[]>([]);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/data/cities.json")
      .then((r) => r.json())
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch(() => setData([]));
  }, []);

  useEffect(() => setQ(value), [value]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const list = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return data.slice(0, 10);
    return data.filter((c) => c.name.toLowerCase().includes(qq)).slice(0, 10);
  }, [q, data]);

  return (
    <div className="relative" ref={wrapRef}>
      {label && <p className="text-sm font-semibold mb-1">{label}</p>}
      <input
        value={q}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
      />
      {open && list.length > 0 && (
        <ul className="absolute z-50 mt-2 w-full max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
          {list.map((c, i) => (
            <li
              key={i}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800"
              onClick={() => {
                onChange(c.name);
                setQ(c.name);
                setOpen(false);
              }}
            >
              {c.name} {c.region ? `• ${c.region}` : ""} {c.country ? `(${c.country})` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
