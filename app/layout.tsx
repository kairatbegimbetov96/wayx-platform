// ✅ WayX Root Layout — v10.5 Final (Next.js 14+ Stable)
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/ToastProvider";

// 🧩 Оптимизированный шрифт Inter с кириллицей и fallback
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
  fallback: ["system-ui", "Roboto", "Arial", "sans-serif"],
});

// ✅ Новый экспорт viewport
export const viewport: Viewport = {
  themeColor: "#005CFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

// 🌍 SEO, Open Graph и PWA метаданные
export const metadata: Metadata = {
  title: "WayX — Логистика нового поколения",
  description:
    "WayX — цифровая экосистема для мультимодальных перевозок, аукционов и оптимизации логистики. Всё в одном окне.",
  keywords: [
    "WayX",
    "логистика",
    "грузоперевозки",
    "аукцион перевозок",
    "транспортная платформа",
    "мультимодальные перевозки",
    "интеллектуальная логистика",
    "WayX.kz",
    "WayX platform",
  ],
  metadataBase: new URL("https://wayx.kz"),
  icons: {
    icon: "/favicon.ico",
    apple: "/icon192.png",
    shortcut: "/icon192.png",
    other: [{ rel: "manifest", url: "/manifest.json" }],
  },
  openGraph: {
    title: "WayX — Логистическая платформа будущего",
    description:
      "Интеллектуальная система управления перевозками, маршрутизацией и цифровыми аукционами. WayX объединяет бизнес, водителей и клиентов.",
    url: "https://wayx.kz",
    siteName: "WayX",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WayX Platform Preview",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WayX — Логистика нового поколения",
    description:
      "Инновационная платформа для мультимодальных перевозок, аукционов и цифрового взаимодействия.",
    images: ["/og-image.png"],
    creator: "@WayX",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "WayX",
    statusBarStyle: "default",
  },
};

// ⚙️ Корневой Layout приложения
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* ⚡ Performance & Preload */}
        <link rel="preload" as="image" href="/logo-wayx.png" />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/icon192.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* 🧠 Prefetch DNS */}
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>

      <body
        className={`${inter.variable} font-sans min-h-screen flex flex-col 
          bg-gradient-to-b from-white via-sky-50/30 to-white 
          dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 
          text-gray-900 dark:text-gray-100 transition-colors duration-500 antialiased`}
      >
        {/* 🔝 Навигация */}
        <Navbar />

        {/* 🔔 Глобальные уведомления и контент */}
        <ToastProvider>
          <main
            className="flex-grow pt-20 px-4 md:px-8 lg:px-12 
                       animate-fade-in scroll-smooth selection:bg-blue-600/20 
                       selection:text-blue-900 dark:selection:bg-sky-400/30"
          >
            {children}
          </main>
        </ToastProvider>

        {/* ⬇️ Подвал */}
        <Footer />

        {/* 🧾 Progressive enhancement */}
        <noscript>
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Для корректной работы WayX включите JavaScript в настройках
            браузера.
          </div>
        </noscript>
      </body>
    </html>
  );
}
