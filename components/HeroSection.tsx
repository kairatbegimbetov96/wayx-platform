"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-center min-h-[90vh] px-6 overflow-hidden"
      aria-label="Главный экран WayX — цифровая логистика нового поколения"
    >
      {/* 🌈 Фон */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-all duration-700" />

      {/* 💠 Световой круг */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-blue-500/15 dark:bg-blue-700/15 rounded-full blur-[180px] animate-pulse" />

      {/* 🔹 Логотип */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <img
          src="/logo.svg"
          alt="WayX логотип"
          className="w-12 h-12 drop-shadow-lg hover:scale-105 transition-transform"
        />
        <span className="text-5xl font-extrabold bg-gradient-to-r from-blue-700 to-sky-400 bg-clip-text text-transparent tracking-tight">
          WayX
        </span>
      </motion.div>

      {/* 🧭 Заголовок */}
      <motion.h1
        className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight max-w-5xl text-slate-900 dark:text-white"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1 }}
      >
        Логистика{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500">
          без границ
        </span>
      </motion.h1>

      {/* 💬 Подзаголовок */}
      <motion.p
        className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.9 }}
      >
        WayX объединяет перевозчиков, клиентов и компании в единую цифровую
        экосистему — просто, быстро и надёжно.  
        <br className="hidden sm:block" /> Платформа, где каждая доставка
        прозрачна и выгодна.
      </motion.p>

      {/* 🚀 Кнопки */}
      <motion.div
        className="flex flex-wrap justify-center gap-4 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.9 }}
      >
        <Link
          href="/auth/register"
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/25 bg-gradient-to-r from-blue-700 to-sky-500 hover:opacity-90 hover:scale-[1.04] transition-transform"
        >
          Начать бесплатно
          <ArrowRight size={18} />
        </Link>
        <Link
          href="/about"
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold border border-blue-400 text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition-all hover:scale-[1.04]"
        >
          Подробнее
        </Link>
      </motion.div>

      {/* ✨ Преимущества */}
      <motion.div
        className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto text-slate-700 dark:text-slate-300"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
      >
        {[
          {
            title: "До 30 % экономии",
            desc: "За счёт честных ставок и прозрачных аукционов",
          },
          {
            title: "Полный контроль",
            desc: "От заявки до доставки в реальном времени",
          },
          {
            title: "Всё в одном окне",
            desc: "Авто, ЖД, авиа и море — единая экосистема",
          },
        ].map(({ title, desc }) => (
          <div
            key={title}
            className="card py-6 px-4 bg-white/70 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:-translate-y-1 transition-all"
          >
            <h3 className="text-lg font-bold text-blue-700 dark:text-sky-400 mb-2">
              {title}
            </h3>
            <p className="text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </motion.div>

      {/* 🌟 Призыв / запуск */}
      <motion.div
        className="mt-16 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 1 }}
      >
        <div className="flex items-center gap-2 text-blue-600 dark:text-sky-400 font-semibold">
          <Sparkles size={18} />
          <span>Официальный запуск WayX — 1 ноября 🚀</span>
        </div>
        <Link
          href="#features"
          className="flex items-center gap-1 text-blue-700 dark:text-sky-400 mt-3 font-semibold hover:opacity-80 transition-all"
        >
          Смотреть преимущества
          <ChevronDown size={18} className="animate-bounce" />
        </Link>
      </motion.div>

      {/* 🕊️ Подпись */}
      <motion.p
        className="mt-14 text-sm text-slate-500 dark:text-slate-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
      >
        © 2025 WayX — проект <span className="font-semibold">TOO MINSULU GROUP</span>.  
        Мы создаём цифровую логистику будущего.
      </motion.p>
    </section>
  );
}