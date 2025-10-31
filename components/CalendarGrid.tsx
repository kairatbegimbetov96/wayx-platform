"use client";
import { useMemo } from "react";

interface CalEvent { id:string; title:string; date:Date; href:string; }

export default function CalendarGrid({events}:{events:CalEvent[]}){
  const byDate = useMemo(()=>{
    const map: Record<string, CalEvent[]> = {};
    events.forEach(e=>{
      const key = e.date.toISOString().slice(0,10);
      map[key] = map[key] || []; map[key].push(e);
    });
    return map;
  }, [events]);

  const days = [...Array(30)].map((_,i)=> {
    const d = new Date(); d.setDate(d.getDate()+i);
    return d;
  });

  return (
    <div className="grid md:grid-cols-7 gap-3">
      {days.map(d=>{
        const k = d.toISOString().slice(0,10);
        return (
          <div key={k} className="border rounded-xl p-3 bg-white dark:bg-gray-800 min-h-[120px]">
            <div className="text-xs text-gray-500">{d.toLocaleDateString()}</div>
            <div className="mt-2 space-y-2">
              {(byDate[k]||[]).map(ev=>(
                <a key={ev.id} href={ev.href}
                  className="block text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">
                  {ev.title}
                </a>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  );
}