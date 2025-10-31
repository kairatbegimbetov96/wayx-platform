
'use client';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import RequestForm from '@/components/RequestForm';
import { createRequest } from '@/lib/crm';
import type { RequestBase } from '@/lib/types';

export default function NewRequestPage(){
  const [uid, setUid] = useState<string>('');
  useEffect(()=>{
    const unsub = auth.onAuthStateChanged(u => setUid(u?.uid || ''));
    return () => unsub();
  },[]);

  const handleSubmit = async (data: RequestBase) => {
    if(!uid){ return window.toast?.('Требуется вход', 'error'); }
    const id = await createRequest({ ...data, authorUid: uid });
    window.toast?.('Заявка создана', 'success');
    location.assign(`/crm/requests/${id}`);
  };

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-2xl font-bold mb-4">Новая заявка</h1>
      <RequestForm onSubmit={handleSubmit} />
    </div>
  );
}
