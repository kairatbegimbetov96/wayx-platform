"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import Link from "next/link";

type Auction = { id: string; title: string; mode?: "auto" | "rail" | "air" | "sea"; status?: "open" | "closed" | "in_progress"; createdAt?: any; };

export default function AuctionList() {
  const [items, setItems] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const q = query(collection(db, "auctions"), orderBy("createdAt", "desc"), limit(25));
      const unsub = onSnapshot(q, (snap) => {
        const rows: Auction[] = [];
        snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
        setItems(rows);
        setLoading(false);
      }, () => setLoading(false));
      return () => unsub();
    } catch {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="animate-pulse h-32 rounded-2xl bg-gray-200 dark:bg-gray-800" />;

  if (!items.length) {
    return (
      <div className="rounded-2xl border p-4 bg-white/70 dark:bg-black/40">
        <h3 className="font-medium">Заявок пока нет</h3>
        <p className="text-sm text-muted-foreground mt-1">Создайте первую заявку, чтобы получить предложения.</p>
        <Link href="/auction/create" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border mt-3" style={{ color: "#2E6EFF" }}>Создать заявку</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((a, i) => (
        <motion.div key={a.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.02 }} className="rounded-2xl border p-4 bg-white/70 dark:bg-black/40">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{a.title ?? "Без названия"}</h4>
            <span className="text-xs rounded-full border px-2 py-0.5">{a.status ?? "open"}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Тип: {a.mode ?? "—"}</p>
          <Link href={`/auctions/${a.id}`} className="text-sm underline mt-2 inline-block">Открыть</Link>
        </motion.div>
      ))}
    </div>
  );
}
