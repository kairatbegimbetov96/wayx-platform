
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getRequest, listBids, placeBid, createDeal } from '@/lib/crm';
import { auth } from '@/lib/firebase';

export default function RequestDetails(){
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [myAmount, setMyAmount] = useState<number>(0);
  const [uid, setUid] = useState<string>('');

  useEffect(()=>{
    const unsub = auth.onAuthStateChanged(u => setUid(u?.uid || ''));
    return () => unsub();
  },[]);

  useEffect(()=>{
    if(typeof id!=='string') return;
    getRequest(id).then(setItem);
    listBids(id).then(setBids);
  },[id]);

  const submitBid = async () => {
    if(!uid) return window.toast?.('Войдите, чтобы ставить', 'error');
    if(!item) return;
    await placeBid({ requestId: item.id, supplierUid: uid, amount: myAmount, currency: item.currency, status: 'pending' });
    window.toast?.('Ставка отправлена', 'success');
    listBids(item.id).then(setBids);
  };

  const acceptBid = async (bid:any) => {
    if(!uid || uid!==item.authorUid) return window.toast?.('Только автор заявки может принимать', 'error');
    await createDeal({ requestId: item.id, clientUid: uid, supplierUid: bid.supplierUid, agreedAmount: bid.amount, currency: bid.currency, status: 'new' });
    window.toast?.('Сделка создана', 'success');
  };

  if(!item) return <div className="container py-8">Загрузка...</div>;

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
      <div className="opacity-70 mb-3">{item.mode?.toUpperCase()} • {item.route?.fromCity} → {item.route?.toCity}</div>
      <div className="rounded-2xl border p-4 mb-6">{item.description || 'Без описания'}</div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border p-4">
          <h3 className="font-semibold mb-2">Сделать ставку</h3>
          <div className="flex gap-2">
            <input type="number" className="input flex-1" placeholder="Сумма" onChange={e=>setMyAmount(+e.target.value)} />
            <button onClick={submitBid} className="btn-primary">Отправить</button>
          </div>
        </div>
        <div className="rounded-2xl border p-4">
          <h3 className="font-semibold mb-2">Ставки</h3>
          <div className="space-y-2">
            {bids.map(b => (
              <div key={b.id} className="rounded-xl p-3 border">
                <div className="flex justify-between">
                  <div>{b.amount} {b.currency}</div>
                  {uid===item.authorUid && <button onClick={()=>acceptBid(b)} className="px-3 py-1 rounded-lg bg-emerald-600 text-white">Принять</button>}
                </div>
                <div className="text-xs opacity-60">{new Date(b.createdAt).toLocaleString()}</div>
              </div>
            ))}
            {bids.length===0 && <div className="opacity-60">Пока нет ставок</div>}
          
        </div>
        <div className="rounded-2xl border p-4">
          <h3 className="font-semibold mb-2">Контакты / Чат</h3>
          <div className="space-y-2 text-sm opacity-80">
            <p>Вы можете открыть чат с выбранным поставщиком (после ставки).</p>
            {bids.map(b => (
              <button key={'chat-'+b.id}
                onClick={()=>{ localStorage.setItem('chatSupplierUid', b.supplierUid); location.assign(`/crm/requests/${item.id}/chat`); }}
                className="px-3 py-2 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800">
                Открыть чат с поставщиком (ставка {b.amount} {b.currency})
              </button>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .input { @apply px-3 py-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 outline-none; }
        .btn-primary { @apply px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow; }
      `}</style>
    </div>
  );
}
