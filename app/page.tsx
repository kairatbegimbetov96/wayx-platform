"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useSpring } from "framer-motion";

import FeaturesSection from "@/components/FeaturesSection";
import AboutSection from "@/components/AboutSection";
import InvestorSection from "@/components/InvestorSection";
import CTASection from "@/components/CTASection";

export default function HomePage() {
  // 🌓 Инициализация темы
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark =
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  // 📊 Прогресс-бар прокрутки
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001,
  });

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.8, ease: "easeOut" },
    viewport: { once: true, amount: 0.25 },
  });

  return (
    <main
      className="relative min-h-screen overflow-x-hidden transition-colors duration-700
                 bg-gradient-to-b from-white via-sky-50 to-sky-100
                 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950"
    >
      {/* ♿ Skip link */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                   focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-md"
      >
        Перейти к содержимому
      </a>

      {/* 📈 Прогресс-бар прокрутки */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-400 z-50 origin-left"
        style={{ scaleX }}
        aria-hidden="true"
      />

      {/* ===================== */}
      {/* 🌍 HERO / Главный экран */}
      {/* ===================== */}
      <section
        aria-label="WayX — логистика нового поколения"
        className="relative flex flex-col items-center justify-center text-center py-28 px-6"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200/40 to-transparent dark:from-blue-900/30 pointer-events-none" />

        <motion.h1
          className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          Логистика{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-400">
            нового поколения
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          WayX объединяет перевозчиков, клиентов и логистические компании
          в единую цифровую экосистему — быстро, удобно и прозрачно.
        </motion.p>

        <motion.div
          className="flex gap-4 flex-wrap justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
        >
          <Link
            href="/auth/register"
            className="px-8 py-3 rounded-xl font-semibold shadow-lg bg-gradient-to-r from-blue-600 to-sky-400 text-white hover:opacity-90 hover:scale-[1.03] transition-all"
          >
            Начать работу
          </Link>
          <Link
            href="/about"
            className="px-8 py-3 rounded-xl font-semibold border border-blue-300 text-blue-700 dark:text-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"
          >
            Узнать подробнее
          </Link>
        </motion.div>

        {/* 📱 Превью интерфейса */}
        <motion.div
          className="mt-16 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.9 }}
        >
          <Image
            src="/preview-app.png"
            alt="Интерфейс платформы WayX"
            width={1600}
            height={900}
            priority
            className="w-full h-auto rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 hover:shadow-blue-200/40 dark:hover:shadow-blue-900/40 transition-all duration-500"
          />
        </motion.div>

        {/* 📊 Факты / преимущества */}
        <motion.div
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-300"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <div className="text-center">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">1–2 мин</div>
            <div>создание заявки</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">24/7</div>
            <div>аукционы и ставки</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">KZ · CIS · EU</div>
            <div>маршруты и перевозчики</div>
          </div>
        </motion.div>
      </section>

      <span id="content" className="sr-only" />

      {/* 🧭 О компании */}
      <motion.section {...fadeUp(0.1)} aria-label="О компании WayX">
        <AboutSection />
      </motion.section>

      {/* 💼 Инвесторы и партнёры */}
      <motion.section {...fadeUp(0.15)} aria-label="Инвесторы и партнёры">
        <InvestorSection />
      </motion.section>

      {/* ⚙️ Возможности */}
      <motion.section {...fadeUp(0.2)} aria-label="Функции платформы">
        <FeaturesSection />
      </motion.section>

      {/* 🚀 Призыв к действию */}
      <motion.section {...fadeUp(0.25)} aria-label="Присоединиться к WayX">
        <CTASection />
      </motion.section>

      {/* фоновая заливка */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-full h-[260px] bg-gradient-to-t from-sky-300/30 to-transparent dark:from-blue-900/40 pointer-events-none"
      />
    </main>
  );
}
