"use client";
import { motion } from "framer-motion";
import { ComponentType } from "react";

export default function StatCard({ title, value, icon: Icon, tone }: { title: string; value: string; icon?: ComponentType<any>; tone?: "positive" | "warn" | "neutral" }) {
  const ring = tone === "positive" ? "ring-emerald-100 dark:ring-emerald-900/40" : tone === "warn" ? "ring-amber-100 dark:ring-amber-900/40" : "ring-gray-100 dark:ring-gray-800";
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={`rounded-2xl border p-4 bg-white/70 dark:bg-black/40 ring-1 ${ring}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        {Icon ? <Icon className="h-4 w-4" /> : null}
      </div>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </motion.div>
  );
}
