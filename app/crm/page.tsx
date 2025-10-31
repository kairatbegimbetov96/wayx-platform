
'use client';
import Link from 'next/link';

export default function CRMIndex(){
  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-2xl font-bold mb-6">CRM</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/market" className="card">Биржа</Link>
        <Link href="/crm/requests" className="card">Мои заявки</Link>
        <Link href="/crm/deals" className="card">Сделки</Link>
        <Link href="/crm/bids" className="card">Ставки</Link>
      </div>
      <style jsx>{`.card{@apply rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 hover:shadow}`}</style>
    </div>
  );
}
