// ✅ WayX Metadata Generator — v1.0
import type { Metadata } from "next";

interface PageMeta {
  title: string;
  description: string;
  image?: string;
  keywords?: string[];
  priority?: number;
}

const baseUrl = "https://wayx.kz";
const defaultImage = "/og-image.png";

const pages: Record<string, PageMeta> = {
  "": {
    title: "WayX — Логистика нового поколения",
    description:
      "WayX — цифровая экосистема для мультимодальных перевозок, аукционов и оптимизации логистики. Всё в одном окне.",
  },
  about: {
    title: "О WayX — Инновационная логистическая экосистема",
    description:
      "Узнай, как WayX объединяет транспортные компании, клиентов и технологии для создания цифровой логистики будущего.",
  },
  investors: {
    title: "Инвесторам — WayX Logistics Platform",
    description:
      "Инвестиционные возможности WayX: участие в росте цифровой платформы для логистики и перевозок.",
  },
  support: {
    title: "Поддержка WayX — помощь клиентам и партнёрам",
    description:
      "Нужна помощь? Свяжись с нашей службой поддержки WayX. Мы на связи 24/7.",
  },
  "auction/create": {
    title: "Создать заявку — WayX",
    description:
      "Создай заявку на перевозку за минуту. Прозрачные аукционы, честные ставки, мгновенные расчёты.",
  },
  auctions: {
    title: "Аукционы перевозок — WayX",
    description:
      "Смотри активные аукционы и выбирай лучшие предложения от перевозчиков по всей Евразии.",
  },
  partners: {
    title: "Партнёрам — WayX",
    description:
      "Стань партнёром WayX и получай новые заказы, клиентов и цифровые инструменты для логистики.",
  },
  privacy: {
    title: "Политика конфиденциальности — WayX",
    description:
      "Мы уважаем твою приватность. Узнай, как WayX обрабатывает и защищает данные пользователей.",
  },
  terms: {
    title: "Пользовательское соглашение — WayX",
    description:
      "Условия использования платформы WayX и правила предоставления логистических услуг.",
  },
};

// 🌐 Генератор SEO-метаданных
export function generatePageMetadata(
  path: string
): Metadata {
  const page = pages[path] || pages[""];
  const url = `${baseUrl}/${path}`;
  const image = page.image || defaultImage;

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: "WayX",
      images: [{ url: image, width: 1200, height: 630, alt: page.title }],
      locale: "ru_RU",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [image],
      creator: "@WayX",
    },
    alternates: {
      canonical: url,
    },
    keywords: page.keywords,
  };
}
