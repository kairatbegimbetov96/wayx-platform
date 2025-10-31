"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, CircleAlert, PlusCircle, CreditCard, User2 } from "lucide-react";

export default function DashboardHero({ name, subtitle, verified, onSignOut }: { name: string; subtitle: string; verified: boolean; onSignOut: () => void }) {
  return (
    <motion.section initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }} className="rounded-3xl border p-6 bg-gradient-to-br from-white to-gray-50 dark:from-[#0A0A0A] dark:to-[#111]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Здравствуйте, {name}!</h1>
          <div className="mt-2 inline-flex items-center gap-2 text-sm">
            {verified ? (<><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span className="text-emerald-700 dark:text-emerald-500">{subtitle}</span></>) : (<><CircleAlert className="h-4 w-4 text-amber-600" /><span className="text-amber-700 dark:text-amber-500">{subtitle}</span></>)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/auction/create" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border hover:bg-gray-50 dark:hover:bg-gray-900">
            <PlusCircle className="h-4 w-4" /> Новая заявка
          </Link>
          <Link href="/billing" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border hover:bg-gray-50 dark:hover:bg-gray-900">
            <CreditCard className="h-4 w-4" /> Пополнить баланс
          </Link>
          <Link href="/profile" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border hover:bg-gray-50 dark:hover:bg-gray-900">
            <User2 className="h-4 w-4" /> Профиль
          </Link>
          <button onClick={onSignOut} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border hover:bg-gray-50 dark:hover:bg-gray-900">
            Выйти
          </button>
        </div>
      </div>
    </motion.section>
  );
}
