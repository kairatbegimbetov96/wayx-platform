"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ListOrdered, FilePlus2, MessageSquareMore, BookUser } from "lucide-react";

const actions = [
  { href: "/auctions", title: "Мои заявки", desc: "Просмотр и управление", icon: ListOrdered },
  { href: "/auction/create", title: "Создать заявку", desc: "Запустить новый запрос", icon: FilePlus2 },
  { href: "/support", title: "Поддержка", desc: "Связаться с нами", icon: MessageSquareMore },
  { href: "/profile", title: "Профиль", desc: "Данные и документы", icon: BookUser },
] as const;

export default function ActionGrid() {
  return (
    <motion.section initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map(({ href, title, desc, icon: Icon }) => (
        <Link key={href} href={href} className="rounded-2xl border p-4 bg-white/70 dark:bg-black/40 hover:bg-white dark:hover:bg-black transition">
          <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 mt-0.5" style={{ color: "#2E6EFF" }} />
            <div>
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
        </Link>
      ))}
    </motion.section>
  );
}
