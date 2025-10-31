"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function ProfileCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-2xl border p-4 bg-white/70 dark:bg-black/40">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </motion.section>
  );
}
