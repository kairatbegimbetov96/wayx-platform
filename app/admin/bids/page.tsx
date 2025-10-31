'use client';

import { useEffect, useState } from 'react';
import RoleGate from "@/components/RoleGate";
import AdminTable from "@/components/AdminTable";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"; // ✅ добавлены недостающие импорты

type Row = {
  id: string;
  orderId: string;
  supplierId: string;
  bidAmount: number;
  status?: string;
  createdAt?: number;
};

export default function AdminBids() {
  return (
    <RoleGate allow={['admin']}>
      <BidsInner />
    </RoleGate>
  );
}

function BidsInner() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const base = collection(db, 'bids');
    const q = query(base, orderBy('createdAt', 'desc'), limit(300));
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Row[]);
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Ставки</h1>
      <AdminTable headers={['ID', 'Заказ', 'Поставщик', 'Сумма', 'Статус']}>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <td className="px-3 py-2">{r.id}</td>
            <td className="px-3 py-2">{r.orderId}</td>
            <td className="px-3 py-2">{r.supplierId}</td>
            <td className="px-3 py-2">
              {typeof r.bidAmount === 'number' ? r.bidAmount.toLocaleString() + ' ₸' : '-'}
            </td>
            <td className="px-3 py-2">{r.status || '-'}</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
