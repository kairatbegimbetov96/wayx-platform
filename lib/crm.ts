
// lib/crm.ts — Firestore хелперы CRM/Биржи
'use client';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, serverTimestamp, updateDoc, doc,
  getDoc, getDocs, query, where, orderBy, onSnapshot
} from 'firebase/firestore';
import type { RequestBase, Bid, Deal } from './types';

export async function createRequest(input: RequestBase) {
  const ref = await addDoc(collection(db, 'requests'), {
    ...input,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return ref.id;
}

export async function updateRequest(id: string, patch: Partial<RequestBase>) {
  await updateDoc(doc(db, 'requests', id), { ...patch, updatedAt: Date.now() });
}

export async function getRequest(id: string): Promise<RequestBase | null> {
  const snap = await getDoc(doc(db, 'requests', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as any) : null;
}

export async function listRequests(status?: string) {
  const q = status
    ? query(collection(db, 'requests'), where('status','==', status), orderBy('createdAt','desc') as any)
    : query(collection(db, 'requests'), orderBy('createdAt','desc') as any);
  const s = await getDocs(q);
  return s.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function placeBid(input: Bid) {
  const ref = await addDoc(collection(db, 'bids'), {
    ...input,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function listBids(requestId: string) {
  const q = query(collection(db, 'bids'), where('requestId','==', requestId), orderBy('createdAt','desc') as any);
  const s = await getDocs(q);
  return s.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function createDeal(input: Deal) {
  const ref = await addDoc(collection(db, 'deals'), {
    ...input,
    createdAt: Date.now(),
  });
  return ref.id;
}
