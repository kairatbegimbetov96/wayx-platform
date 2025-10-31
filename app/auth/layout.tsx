// ✅ app/auth/layout.tsx — стабильная версия с PWA, SEO и брендингом WayX
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Head from "next/head";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 🔹 Мета-данные и PWA */}
      <Head>
        <title>WayX — Авторизация</title>
        <meta
          name="description"
          content="WayX — мультимодальная логистическая платформа для клиентов и поставщиков. Войдите или создайте аккаунт."
        />
        <meta name="theme-color" content="#2563eb" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon192.png" />
        <meta property="og:site_name" content="WayX.kz" />
        <meta property="og:title" content="WayX Logistics Platform" />
        <meta
          property="og:description"
          content="Инновационная система мультимодальной логистики — WayX.kz"
        />
        <meta property="og:image" content="/icon512.png" />
      </Head>

      {/* 🔹 Основной блок страницы */}
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-500">
        {/* Фоновая анимация */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.2),transparent_70%),radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.2),transparent_70%)]"
        />

        {/* Центральный блок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center justify-center px-6 py-10 w-full max-w-3xl"
        >
          {/* Логотип и заголовок */}
          <div className="flex flex-col items-center mb-6 select-none">
            <Image
              src="/logo.svg"
              alt="WayX"
              width={70}
              height={70}
              priority
              className="drop-shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            />
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent tracking-tight text-center"
            >
              WayX Logistics Platform
            </motion.h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
              Умная система мультимодальной логистики
            </p>
          </div>

          {/* Контент авторизационных страниц */}
          <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/70 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-8">
            {children}
          </div>

          {/* Футер */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-6 text-center">
            © {new Date().getFullYear()} WayX.kz — Все права защищены
          </p>
        </motion.div>
      </div>
    </>
  );
}
