
'use client';
import { useEffect, useState } from 'react';
import { listRequests } from '@/lib/crm';
import Link from 'next/link';

export default function MarketPage(){
  const [items, setItems] = useState<any[]>([]);
  const [mode, setMode] = useState<string>('all');
  const [qFrom, setQFrom] = useState('');
  const [qTo, setQTo] = useState('');
  const [min, setMin] = useState<number|''>('');
  const [max, setMax] = useState<number|''>('');

  useEffect(()=>{ listRequests('published').then(setItems); },[]);

  const filt = items.filter(it => {
    if (mode!=='all' && it.mode !== mode) return false;
    if (qFrom && !(it.route?.fromCity||'').toLowerCase().includes(qFrom.toLowerCase())) return false;
    if (qTo && !(it.route?.toCity||'').toLowerCase().includes(qTo.toLowerCase())) return false;
    const v = it.budgetMin || 0;
    if (min!=='' && v < +min) return false;
    if (max!=='' && v > +max) return false;
    return true;
  });

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Биржа заявок</h1>
        <Link href="/requests/new" className="px-4 py-2 rounded-xl bg-sky-600 text-white">Создать заявку</Link>
      </div>

      <div className="rounded-2xl border p-4 mb-6 grid md:grid-cols-6 gap-3">
        <select className="input" value={mode} onChange={e=>setMode(e.target.value)}>
          <option value="all">Все</option>
          <option value="auto">Авто</option>
          <option value="rail">Ж/Д</option>
          <option value="air">Авиа</option>
          <option value="sea">Море</option>
        </select>
        <input placeholder="Откуда (город)" className="input" value={qFrom} onChange={e=>setQFrom(e.target.value)} />
        <input placeholder="Куда (город)" className="input" value={qTo} onChange={e=>setQTo(e.target.value)} />
        <input placeholder="Мин бюджет" className="input" type="number" value={min} onChange={e=>setMin(e.target.value===''?'':+e.target.value)} />
        <input placeholder="Макс бюджет" className="input" type="number" value={max} onChange={e=>setMax(e.target.value===''?'':+e.target.value)} />
        <button className="btn" onClick={()=>{ /* local filter only */ }}>Фильтр</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filt.map(it => (
          <Link key={it.id} href={`/crm/requests/${it.id}`} className="rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/60 hover:shadow">
            <div className="flex justify-between">
              <div>
                <div className="text-lg font-semibold">{it.title}</div>
                <div className="text-sm opacity-70">{it.mode?.toUpperCase()} • {it.route?.fromCity} → {it.route?.toCity}</div>
              </div>
              <div className="text-right text-sm">
                {it.budgetMin ? `${it.budgetMin}${it.budgetMax?`–${it.budgetMax}`:''} ${it.currency}` : 'по договоренности'}
              </div>
            </div>
          </Link>
        ))}
        {filt.length===0 && <div className="opacity-60">Ничего не найдено.</div>}
      </div>

      <style jsx>{`
        .input{@apply px-3 py-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 outline-none;}
        .btn{@apply px-3 py-2 rounded-xl bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900;}
      `}</style>
    </div>
  );
}
