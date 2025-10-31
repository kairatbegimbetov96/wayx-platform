"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col items-center gap-3">
        <Image src="/logo-wayx.svg" alt="WayX" width={144} height={40} priority />
        <motion.div className="h-1 w-40 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <motion.div className="h-1 w-1/3 rounded-full" style={{ backgroundColor: "#2E6EFF" }} animate={{ x: ["0%", "200%"] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} />
        </motion.div>
        <p className="text-sm text-muted-foreground">Загрузка платформы…</p>
      </motion.div>
    </div>
  );
}
