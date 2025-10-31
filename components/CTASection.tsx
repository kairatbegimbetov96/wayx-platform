"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden py-28 text-center text-white"
    >
      {/* 🌈 Фирменный градиент WayX */}
      <div
        className="absolute inset-0 bg-gradient-to-r
                   from-blue-700 via-sky-500 to-cyan-400
                   dark:from-blue-900 dark:via-blue-800 dark:to-sky-700
                   transition-all duration-700"
      />

      {/* 💫 Световое сияние */}
      <div
        className="absolute -bottom-40 left-1/2 -translate-x-1/2
                   w-[950px] h-[950px] bg-white/25 blur-[180px] opacity-40
                   pointer-events-none"
      />

      <div className="relative max-w-4xl mx-auto px-6 z-10">
        {/* 🧭 Заголовок */}
        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight tracking-tight
                     drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Управляй{" "}
          <span className="text-yellow-300">перевозками</span> с WayX — легко и надёжно
        </motion.h2>

        {/* 💬 Подзаголовок */}
        <motion.p
          className="text-lg md:text-xl text-blue-100/90 mb-12
                     max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <strong>WayX</strong> — цифровая логистическая экосистема, объединяющая
          клиентов и перевозчиков без посредников.  
          Прозрачность, скорость и контроль — в одном окне.
        </motion.p>

        {/* 🚀 Кнопка действия (без "бесплатно") */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-semibold
                       text-blue-700 bg-white hover:bg-blue-50
                       hover:scale-[1.05] transition-all duration-300
                       shadow-[0_10px_30px_rgba(255,255,255,0.25)]
                       focus:outline-none focus:ring-4 focus:ring-yellow-300/50"
          >
            Начать работу <ArrowRight size={20} />
          </Link>
        </motion.div>

        {/* ✨ Нижняя подпись */}
        <motion.div
          className="mt-16 flex flex-col items-center gap-3 text-sm text-blue-100/80"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2">
            <Sparkles
              size={16}
              className="text-yellow-300 animate-pulse"
              aria-hidden="true"
            />
            <span>
              Платформа развивается поэтапно •{" "}
              <strong>этап внедрения: IV квартал 2025</strong>
            </span>
          </div>
          <p className="text-blue-100/70">
            © 2025 <span className="font-semibold">WayX</span> • Разработка{" "}
            <span className="font-semibold">TОО MINSULU GROUP</span>
          </p>
        </motion.div>
      </div>

      {/* 🌐 Верхняя декоративная волна */}
      <svg
        className="absolute top-0 left-0 w-full text-white/15"
        viewBox="0 0 1440 320"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0,224L30,229.3C60,235,120,245,180,245.3C240,245,300,235,360,208C420,181,480,139,540,138.7C600,139,660,181,720,192C780,203,840,181,900,160C960,139,1020,117,1080,133.3C1140,149,1200,203,1260,218.7C1320,235,1380,213,1410,202.7L1440,192L1440,0L0,0Z" />
      </svg>
    </section>
  );
}
