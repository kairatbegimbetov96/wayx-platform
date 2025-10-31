'use client';
import { ReactNode } from 'react';

export default function AdminTable({ headers, children }:{headers:string[]; children:ReactNode}){
  return (
    <div className="overflow-auto rounded-2xl border">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>{headers.map((h,i)=>(<th key={i} className="px-3 py-2 font-medium">{h}</th>))}</tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}
