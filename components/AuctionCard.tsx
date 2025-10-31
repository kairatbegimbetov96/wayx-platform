"use client";
import Link from "next/link";

export default function AuctionCard({a}:{a:any}){
  return (
    <div className="p-5 rounded-xl border bg-white dark:bg-gray-800 hover:shadow">
      <div className="flex justify-between">
        <div className="font-semibold">Аукцион #{a.id.slice(-6)}</div>
        <div className={`text-xs px-2 py-1 rounded ${a.status==="Открыт"?"bg-green-100 text-green-700":"bg-gray-200 text-gray-700"}`}>
          {a.status}
        </div>
      </div>
      <div className="mt-1 text-sm text-gray-500">
        Заявка: {a.request?.origin} → {a.request?.destination} · {a.request?.transport}
      </div>
      <Link href={`/auctions/${a.id}`} className="inline-block mt-3 text-blue-600 hover:underline">Открыть</Link>
    </div>
  );
}