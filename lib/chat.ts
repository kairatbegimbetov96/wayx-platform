
'use client';
import { db } from '@/lib/firebase';
import { addDoc, collection, getDocs, query, where, orderBy, serverTimestamp, onSnapshot } from 'firebase/firestore';

export async function ensureThread(requestId: string, clientUid: string, supplierUid: string){
  const q = query(collection(db,'threads'),
    where('requestId','==',requestId),
    where('supplierUid','==',supplierUid));
  const snap = await getDocs(q);
  if (snap.size > 0) return snap.docs[0].id;
  const ref = await addDoc(collection(db,'threads'), {
    requestId, clientUid, supplierUid,
    participants: [clientUid, supplierUid],
    createdAt: Date.now(),
  });
  return ref.id;
}

export function listenMessages(threadId: string, cb: (msgs:any[])=>void){
  const q = query(collection(db,'messages'), where('threadId','==',threadId), orderBy('createdAt','asc') as any);
  return onSnapshot(q, (s)=>{
    cb(s.docs.map(d=>({id:d.id,...(d.data() as any)})));
  });
}

export async function sendMessage(threadId: string, authorUid: string, text: string){
  await addDoc(collection(db,'messages'), {
    threadId, authorUid, text, createdAt: Date.now()
  });
}
