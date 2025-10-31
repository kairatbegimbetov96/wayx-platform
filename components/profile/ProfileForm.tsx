"use client";
import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

type Form = { displayName: string; company?: string; phone?: string; city?: string; };

export default function ProfileForm() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState<Form>({ displayName: "" });
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    setForm({
      displayName: (profile as any)?.displayName || "",
      company: (profile as any)?.company || "",
      phone: (profile as any)?.phone || "",
      city: (profile as any)?.city || "",
    });
  }, [profile?.displayName, (profile as any)?.company, (profile as any)?.phone, (profile as any)?.city]);

  const save = useDebouncedCallback(async (patch: Partial<Form>) => {
    if (!user) return;
    setSaving("saving");
    try {
      await setDoc(doc(db, "users", user.uid), patch, { merge: true });
      setSaving("saved");
      setTimeout(() => setSaving("idle"), 1100);
    } catch {
      setSaving("error");
    }
  }, 700);

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    save({ [key]: value } as Partial<Form>);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Имя" value={form.displayName} onChange={(v) => update("displayName", v)} placeholder="Например, Айдар" />
        <Input label="Компания" value={form.company ?? ""} onChange={(v) => update("company", v)} placeholder="ООО Пример" />
        <Input label="Телефон" value={form.phone ?? ""} onChange={(v) => update("phone", v)} placeholder="+7 7xx xxx-xx-xx" />
        <Input label="Город" value={form.city ?? ""} onChange={(v) => update("city", v)} placeholder="Алматы" />
      </div>
      <div className="text-xs flex items-center gap-2 h-6">
        {saving === "saving" && <><Loader2 className="animate-spin h-4 w-4" /><span>Сохраняем…</span></>}
        {saving === "saved" && <><CheckCircle2 className="text-emerald-600 h-4 w-4" /><span className="text-emerald-700 dark:text-emerald-500">Профиль сохранён</span></>}
        {saving === "error" && <><AlertCircle className="text-rose-600 h-4 w-4" /><span className="text-rose-600">Ошибка сохранения</span></>}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; }) {
  return (
    <label className="text-sm grid gap-1">
      <span className="text-muted-foreground">{label}</span>
      <input
        className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 bg-white/80 dark:bg-black/40"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
