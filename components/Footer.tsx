"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Copyright } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative mt-24 border-t border-slate-200/50 dark:border-slate-800/50 
      bg-gradient-to-b from-sky-50/60 via-white/90 to-sky-100/50 
      dark:from-slate-900/80 dark:via-slate-950/90 dark:to-slate-950/95 
      text-slate-700 dark:text-slate-300 backdrop-blur-md"
    >
      {/* ===== Верхняя зона ===== */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* 🌐 WayX Бренд */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2 group">
            <img
              src="/logo-wayx.svg"
              alt="WayX"
              className="h-9 w-auto transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
            />
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent group-hover:opacity-90">
              WayX
            </span>
          </Link>

          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-xs">
            Инновационная логистическая экосистема нового поколения.  
            <br className="hidden sm:block" />
            Все виды перевозок — авто, ЖД, авиа и море — в одном цифровом окне.
          </p>
        </div>

        {/* 🧭 Навигация */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
            Навигация
          </h3>
          <ul className="space-y-2 text-sm">
            {[
              { href: "/", label: "Главная" },
              { href: "/auctions", label: "Аукционы" },
              { href: "/dashboard", label: "Панель управления" },
              { href: "/support", label: "Поддержка" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors duration-200"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 🏢 О WayX */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
            О компании
          </h3>
          <ul className="space-y-2 text-sm">
            {[
              { href: "/about", label: "О нас" },
              { href: "/investors", label: "Инвесторам" },
              { href: "/partners", label: "Партнёрам" },
              { href: "/careers", label: "Карьера" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors duration-200"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 📞 Контакты */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
            Контакты
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-blue-500" />
              <a
                href="mailto:info@wayx.kz"
                className="hover:text-blue-600 dark:hover:text-sky-400"
              >
                info@wayx.kz
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-blue-500" />
              <a
                href="tel:+77001234567"
                className="hover:text-blue-600 dark:hover:text-sky-400"
              >
                +7 (700) 123-45-67
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-500" />
              <span>г. Алматы, Казахстан</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ===== Нижняя панель ===== */}
      <div className="border-t border-slate-200/60 dark:border-slate-800/60 py-6 px-6 text-center text-sm text-slate-600 dark:text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-1 text-center sm:text-left">
            <Copyright size={14} />
            <span>
              {currentYear}{" "}
              <strong className="text-blue-600 dark:text-sky-400">
                WayX Logistics
              </strong>
              . Все права защищены.
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              { href: "/privacy", label: "Конфиденциальность" },
              { href: "/terms", label: "Условия" },
              { href: "/support", label: "Поддержка" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
          Сделано с ❤️ в Казахстане. WayX — умная логистика без границ.
        </p>
      </div>

      {/* 🌈 Градиентное свечение снизу */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 via-sky-400 to-transparent opacity-80 animate-pulse" />
    </motion.footer>
  );
}