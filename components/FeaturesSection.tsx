"use client";

import { motion } from "framer-motion";
import {
  Truck,
  Gauge,
  ShieldCheck,
  Coins,
  Globe2,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: <Truck className="w-10 h-10 text-blue-600 dark:text-sky-400" />,
    title: "Мультимодальные перевозки",
    desc: "Автомобильные, железнодорожные, авиа и морские направления объединены в одной системе. Полный контроль маршрутов из единого кабинета.",
  },
  {
    icon: <Gauge className="w-10 h-10 text-blue-600 dark:text-sky-400" />,
    title: "Быстрая подача заявок",
    desc: "Создание заявки занимает менее минуты. Клиент сам выбирает исполнителя из предложенных ставок, как на аукционе.",
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-blue-600 dark:text-sky-400" />,
    title: "Контроль и прозрачность",
    desc: "Проверенные перевозчики, рейтинги, история и открытая информация о ставках. Все решения принимает клиент.",
  },
  {
    icon: <Coins className="w-10 h-10 text-blue-600 dark:text-sky-400" />,
    title: "Оптимизация затрат",
    desc: "Аукционная модель помогает формировать честные предложения и снижать логистические расходы до 30%.",
  },
  {
    icon: <Globe2 className="w-10 h-10 text-blue-600 dark:text-sky-400" />,
    title: "Международные маршруты",
    desc: "Платформа поддерживает мультивалютные расчёты и адаптацию под требования регионов KZ · CIS · EU.",
  },
  {
    icon: <Layers className="w-10 h-10 text-blue-600 dark:text-sky-400" />,
    title: "Интеграции и API",
    desc: "WayX подключается к CRM, ERP и системам трекинга, обеспечивая автоматизацию процессов и аналитику логистических цепочек.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative py-24 overflow-hidden
                 bg-gradient-to-b from-white via-sky-50/50 to-white
                 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900
                 transition-colors duration-700"
      aria-label="Ключевые возможности платформы WayX"
    >
      {/* 💫 Фон */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-160px] left-[40%] w-[540px] h-[540px]
                        bg-sky-400/25 dark:bg-blue-600/25 blur-[170px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        {/* 🧭 Заголовок */}
        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold mb-6
                     bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Возможности WayX
        </motion.h2>

        {/* 💬 Подзаголовок */}
        <motion.p
          className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-16 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
        >
          WayX — это комплексное решение для управления логистикой и
          аукционами. Клиент получает полный контроль над выбором перевозчиков
          и ходом сделок.
        </motion.p>

        {/* ⚙️ Карточки */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="group p-8 rounded-3xl
                         bg-white/90 dark:bg-slate-800/70 backdrop-blur-md
                         border border-sky-100/80 dark:border-slate-700
                         shadow-md hover:shadow-xl hover:-translate-y-1
                         transition-all duration-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl
                                bg-gradient-to-br from-blue-100 to-sky-50
                                dark:from-slate-700 dark:to-slate-800
                                shadow-inner group-hover:scale-105 transition-transform duration-300">
                  {f.icon}
                </div>
              </div>

              <h3 className="font-semibold text-xl mb-3 text-slate-900 dark:text-slate-100">
                {f.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {f.desc}
              </p>

              <div className="mt-6 w-12 h-[3px] mx-auto rounded-full
                              bg-gradient-to-r from-blue-500 to-sky-400
                              opacity-0 group-hover:opacity-100
                              transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* 🌈 Нижний градиент */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-full h-[200px]
                   bg-gradient-to-t from-sky-200/30 to-transparent
                   dark:from-blue-900/25"
      />
    </section>
  );
}
