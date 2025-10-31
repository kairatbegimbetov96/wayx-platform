// ✅ WayX — confirmed production-ready build config
const nextConfig = {
  reactStrictMode: true,

  // 🔹 Для корректной работы иконок (Lucide)
  transpilePackages: ["lucide-react"],

  // 🔹 Для Vercel / Cloudflare Pages
  output: "standalone",

  // 🔹 Оптимизация изображений
  images: {
    domains: [
      "localhost",
      "wayx.kz",
      "wayx-kz.vercel.app",
      "res.cloudinary.com",
    ],
  },

  // 🔹 Переменные окружения (из .env или с дефолтами)
  env: {
    NEXT_PUBLIC_APP_NAME:
      process.env.NEXT_PUBLIC_APP_NAME || "WayX Logistics Platform",
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "https://api.wayx.kz",
  },

  // 🔹 Кеширование статики и медиафайлов
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source:
          "/:all*(png|jpg|jpeg|gif|svg|webp|ico|avif|mp4|webm|css|js|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  // 🔹 Отключаем X-Powered-By и включаем сжатие
  poweredByHeader: false,
  compress: true,
  swcMinify: true,

  // ✅ Исправление ошибки ESLint плагина на Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
