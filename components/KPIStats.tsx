"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export default function KPIStats(){
  const [open, setOpen] = useState(0);
  const [bidsToday, setBidsToday] = useState(0);
  const [reqCount, setReqCount] = useState(0);

  useEffect(()=> {
    const u = (new Date()); u.setHours(0,0,0,0);
    const unsubA = onSnapshot(collection(db,"auctions"), (snap)=>{
      let o = 0;
      snap.forEach(d=>{ if((d.data() as any).status==="Открыт") o++; });
      setOpen(o);
    });
    const unsubB = onSnapshot(collection(db,"bids"), (snap)=>{
      let c=0;
      snap.forEach(d=>{
        const created = (d.data() as any).createdAt?.toDate?.();
        if (created && created >= u) c++;
      });
      setBidsToday(c);
    });
    const unsubR = onSnapshot(collection(db,"requests"), (snap)=> setReqCount(snap.size));
    return ()=>{unsubA();unsubB();unsubR();}
  }, []);

  const Item = ({label, value}:{label:string; value:any}) => (
    <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Item label="Открытых аукционов" value={open}/>
      <Item label="Ставок за сегодня" value={bidsToday}/>
      <Item label="Всего заявок" value={reqCount}/>
    </div>
  );
}