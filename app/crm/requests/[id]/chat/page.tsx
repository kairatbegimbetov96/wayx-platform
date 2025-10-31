
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { ensureThread, listenMessages, sendMessage } from '@/lib/chat';

export default function DealChat(){
  const { id } = useParams(); // requestId
  const [uid, setUid] = useState('');
  const [threadId, setThreadId] = useState<string>('');
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState('');

  // Для простоты: supplierUid берём из localStorage (его можно установить в UI ставок при клике "чат")
  const [supplierUid, setSupplierUid] = useState('');

  useEffect(()=> auth.onAuthStateChanged(u => setUid(u?.uid || '')),[]);
  useEffect(()=> setSupplierUid(localStorage.getItem('chatSupplierUid') || ''),[]);

  useEffect(()=>{
    if(typeof id!=='string' || !uid || !supplierUid) return;
    (async()=>{
      const tid = await ensureThread(id, uid, supplierUid);
      setThreadId(tid);
      const unsub = listenMessages(tid, setMsgs);
      return ()=>unsub();
    })();
  },[id, uid, supplierUid]);

  const onSend = async ()=>{
    if(!text.trim()) return;
    await sendMessage(threadId, uid, text.trim());
    setText('');
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-bold mb-4">Чат по заявке #{id}</h1>
      <div className="rounded-2xl border p-4 h-[60vh] overflow-y-auto space-y-2 bg-white/50 dark:bg-slate-900/50">
        {msgs.map(m => (
          <div key={m.id} className={`max-w-[70%] px-3 py-2 rounded-xl ${m.authorUid===uid?'bg-sky-600 text-white ml-auto':'bg-slate-200 dark:bg-slate-800'}`}>
            {m.text}
            <div className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
          </div>
        ))}
        {msgs.length===0 && <div className="opacity-60">Сообщений пока нет.</div>}
      </div>
      <div className="flex gap-2 mt-3">
        <input className="input flex-1" placeholder="Написать сообщение..." value={text} onChange={e=>setText(e.target.value)} />
        <button className="btn" onClick={onSend}>Отправить</button>
      </div>
      <style jsx>{`
        .input{@apply px-3 py-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 outline-none;}
        .btn{@apply px-3 py-2 rounded-xl bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900;}
      `}</style>
    </div>
  );
}
