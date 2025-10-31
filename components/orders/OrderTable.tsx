"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Order = { id: string; title: string; status?: "planned" | "in_transit" | "delivered"; eta?: string; progress?: number; };

export default function OrderTable() {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(25));
      const unsub = onSnapshot(q, (snap) => {
        const data: Order[] = [];
        snap.forEach((d) => data.push({ id: d.id, ...(d.data() as any) }));
        setRows(data);
        setLoading(false);
      }, () => setLoading(false));
      return () => unsub();
    } catch {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="animate-pulse h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />;
  if (!rows.length) return <p className="text-sm text-muted-foreground">Пока нет активных перевозок.</p>;

  return (
    <div className="rounded-2xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th className="text-left p-3">Перевозка</th>
            <th className="text-left p-3">Статус</th>
            <th className="text-left p-3">Готовность</th>
            <th className="text-left p-3">ETA</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="p-3">{o.title ?? "Без названия"}</td>
              <td className="p-3">{o.status ?? "planned"}</td>
              <td className="p-3 w-56">
                <div className="h-2 rounded bg-gray-100 dark:bg-gray-800">
                  <div className="h-2 rounded" style={{ backgroundColor: "#2E6EFF", width: `${Math.min(Math.max(o.progress ?? 0, 0), 100)}%` }} />
                </div>
              </td>
              <td className="p-3">{o.eta ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
