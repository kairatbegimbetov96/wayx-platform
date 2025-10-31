
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { listRequests } from '@/lib/crm';

export default function MyRequests(){
  const [uid, setUid] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);

  useEffect(()=>{
    const unsub = auth.onAuthStateChanged(u => setUid(u?.uid || ''));
    return () => unsub();
  },[]);

  useEffect(()=>{
    if(!uid) return;
    (async()=>{
      const all = await listRequests();
      setItems(all.filter((x:any)=>x.authorUid===uid));
    })();
  },[uid]);

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Мои заявки</h1>
        <Link href="/requests/new" className="px-4 py-2 rounded-xl bg-sky-600 text-white">Новая</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(it => (
          <Link key={it.id} href={`/crm/requests/${it.id}`} className="rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/60 hover:shadow">
            <div className="text-lg font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.mode.toUpperCase()} • {it.route?.fromCity} → {it.route?.toCity}</div>
          </Link>
        ))}
        {items.length===0 && <div className="opacity-60">У вас пока нет заявок.</div>}
      </div>
    </div>
  );
}
