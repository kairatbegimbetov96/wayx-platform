"use client";

import { motion } from "framer-motion";
import { Users, Globe2, TrendingUp, Building2, Rocket } from "lucide-react";
import Link from "next/link";

export default function InvestorSection() {
  return (
    <section
      id="investors"
      className="relative overflow-hidden py-24
                 bg-gradient-to-b from-white via-sky-50/45 to-white
                 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900
                 transition-colors duration-700"
    >
      {/* 💫 Фоновое свечение */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-[30%] w-[520px] h-[520px]
                        bg-sky-300/18 dark:bg-blue-700/18 blur-[160px] rounded-full" />
        <div className="absolute -bottom-24 right-[25%] w-[600px] h-[600px]
                        bg-sky-200/12 dark:bg-blue-800/18 blur-[200px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* 🌍 Заголовок */}
        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6
                     bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Партнёрам и инвесторам WayX
        </motion.h2>

        {/* 💬 Подзаголовок */}
        <motion.p
          className="text-lg md:text-xl leading-relaxed text-slate-700 dark:text-slate-300 max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <strong>WayX</strong> — это технологическая платформа, меняющая рынок
          перевозок. Мы объединяем транспорт, финтех и аналитику в единую
          экосистему, делая логистику предсказуемой, масштабируемой и
          прибыльной.
        </motion.p>

        {/* 📊 Цифры и достижения */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            {
              icon: <Users className="w-8 h-8 text-sky-500" />,
              value: "1 200+",
              label: "Компаний и перевозчиков",
            },
            {
              icon: <Globe2 className="w-8 h-8 text-sky-500" />,
              value: "5 направлений",
              label: "Авто · ЖД · Море · Авиа · Мультимодал",
            },
            {
              icon: <TrendingUp className="w-8 h-8 text-sky-500" />,
              value: "30 %",
              label: "Средняя экономия клиентов",
            },
            {
              icon: <Building2 className="w-8 h-8 text-sky-500" />,
              value: "2025",
              label: "Выход на рынок СНГ и Европы",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="p-8 rounded-3xl bg-white/90 dark:bg-slate-800/70 backdrop-blur-md
                         border border-sky-100/80 dark:border-slate-700
                         shadow-md hover:shadow-xl hover:-translate-y-1
                         transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-4">{s.icon}</div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {s.value}
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 💼 Инвестор-блок / ценностное предложение */}
        <motion.div
          className="max-w-3xl mx-auto mb-16 bg-white/80 dark:bg-slate-800/60 border border-sky-100/70 dark:border-slate-700 p-10 rounded-3xl shadow-md backdrop-blur-md"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Rocket className="w-10 h-10 mx-auto mb-4 text-sky-500" />
          <h3 className="text-2xl font-bold mb-3 text-blue-700 dark:text-sky-400">
            Возможность инвестировать в логистику будущего
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
            WayX создаёт инфраструктуру для рынка стоимостью более{" "}
            <strong>$300 млрд</strong>. Наша цель — стать цифровым ядром
            логистики Евразии. Присоединяйтесь к нам на раннем этапе и разделите
            рост вместе с нами.
          </p>
        </motion.div>

        {/* 🤝 CTA-кнопки */}
        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Link
            href="/support"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500
                       text-white font-semibold shadow-lg hover:opacity-90 hover:scale-[1.04]
                       transition-all duration-300"
          >
            Связаться с WayX
          </Link>

          <Link
            href="/auth/register"
            className="px-8 py-4 rounded-xl border border-blue-400 text-blue-700 dark:text-sky-300
                       dark:border-blue-700 font-semibold hover:bg-blue-600 hover:text-white
                       hover:scale-[1.04] transition-all duration-300"
          >
            Стать партнёром
          </Link>
        </motion.div>

        {/* 🧠 Завершающий текст */}
        <motion.p
          className="mt-16 text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          viewport={{ once: true }}
        >
          Инновации WayX направлены на эффективность, экологичность и устойчивый
          рост. Вместе мы создаём № 1 цифровую платформу для логистики в Евразии.
        </motion.p>
      </div>
    </section>
  );
}