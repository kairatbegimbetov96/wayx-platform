"use client";

import { motion } from "framer-motion";
import { Globe2, Network, TrendingUp } from "lucide-react";

const container = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const list = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative overflow-hidden py-24
                 bg-gradient-to-b from-white via-sky-50/45 to-white
                 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900
                 transition-colors duration-700"
    >
      {/* 💫 Мягкий фон */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 right-[28%] w-[380px] h-[380px] bg-sky-300/18 dark:bg-blue-700/18 blur-[140px] rounded-full" />
        <div className="absolute -bottom-10 left-[22%] w-[460px] h-[460px] bg-sky-200/12 dark:bg-blue-800/16 blur-[170px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* 🌍 Заголовок */}
        <motion.h2
          id="about-title"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6
                     bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent"
        >
          Цифровая логистика нового поколения
        </motion.h2>

        {/* 💬 Подзаголовок */}
        <motion.p
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-14
                     text-slate-700 dark:text-slate-300"
        >
          <strong>WayX</strong> — универсальная платформа для управления всеми
          видами перевозок: автомобильными, железнодорожными, авиационными и
          морскими. Мы объединяем участников рынка в единую цифровую среду для
          оперативных, прозрачных и надёжных логистических решений.
        </motion.p>

        {/* ⚙️ Ключевые направления */}
        <motion.div
          variants={list}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            {
              Icon: Globe2,
              title: "Международная интеграция",
              desc: "WayX формирует инфраструктуру для работы по всему миру — от локальных маршрутов до трансграничных цепочек поставок.",
            },
            {
              Icon: Network,
              title: "Интеллектуальная инфраструктура",
              desc: "Система на основе данных анализирует маршруты, спрос и ставки, помогая бизнесу экономить ресурсы и повышать эффективность.",
            },
            {
              Icon: TrendingUp,
              title: "Рост и устойчивое развитие",
              desc: "WayX создаёт экосистему, в которой цифровая логистика становится инструментом роста компаний и международного сотрудничества.",
            },
          ].map(({ Icon, title, desc }) => (
            <motion.article
              key={title}
              variants={item}
              className="p-8 rounded-3xl bg-white/90 dark:bg-slate-800/70
                         shadow-md border border-sky-100/80 dark:border-slate-700
                         hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex justify-center mb-5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-50 dark:from-slate-700 dark:to-slate-800 shadow-inner">
                  <Icon className="w-10 h-10 text-sky-500" aria-hidden />
                </div>
              </div>
              <h3 className="font-semibold text-xl mb-2 text-slate-900 dark:text-slate-100">
                {title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {desc}
              </p>
            </motion.article>
          ))}
        </motion.div>

        {/* 🚀 Завершающий блок */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold mb-3 text-blue-700 dark:text-sky-400">
            WayX — стандарт цифровой логистики
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
            Мы развиваем технологическую платформу, объединяющую бизнес,
            транспорт и клиентов. WayX делает рынок перевозок прозрачным,
            эффективным и доступным для всех участников.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
