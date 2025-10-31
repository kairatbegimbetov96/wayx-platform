'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import RoleGate from '@/components/RoleGate';
import AdminTable from '@/components/AdminTable';

type Row = {
  id: string;
  clientId: string;
  origin: string;
  destination: string;
  priceOffer?: number;
  date?: string;
  status?: string;
  createdAt?: number;
};

export default function AdminOrders() {
  return (
    <RoleGate allow={['admin']}>
      <OrdersInner />
    </RoleGate>
  );
}

function OrdersInner() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const base = collection(db, 'orders');
    const q = query(base, orderBy('createdAt', 'desc'), limit(300));

    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Row[]);
    });

    return () => unsub();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Заказы</h1>

      <AdminTable headers={['ID', 'Клиент', 'Откуда', 'Куда', 'Бюджет', 'Дата', 'Статус']}>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50">
            <td className="px-3 py-2">{r.id}</td>
            <td className="px-3 py-2">{r.clientId}</td>
            <td className="px-3 py-2">{r.origin || '-'}</td>
            <td className="px-3 py-2">{r.destination || '-'}</td>
            <td className="px-3 py-2">
              {typeof r.priceOffer === 'number' ? r.priceOffer : '-'}
            </td>
            <td className="px-3 py-2">{r.date || '-'}</td>
            <td className="px-3 py-2">{r.status || '-'}</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
