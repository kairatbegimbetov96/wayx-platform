
'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function MyBids(){
  const [uid, setUid] = useState('');
  const [items, setItems] = useState<any[]>([]);
  useEffect(()=> auth.onAuthStateChanged(u => setUid(u?.uid || '')),[]);
  useEffect(()=>{
    if(!uid) return;
    (async()=>{
      const db = getFirestore();
      const q = query(collection(db,'bids'), where('supplierUid','==',uid), orderBy('createdAt','desc') as any);
      const s = await getDocs(q);
      setItems(s.docs.map(d=>({id:d.id,...(d.data() as any)})));
    })();
  },[uid]);

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-2xl font-bold mb-4">Мои ставки</h1>
      <div className="grid gap-3">
        {items.map(it => <div key={it.id} className="rounded-2xl p-4 border">#{it.requestId} — {it.amount} {it.currency}</div>)}
        {items.length===0 && <div className="opacity-60">Вы ещё не делали ставок.</div>}
      </div>
    </div>
  );
}
