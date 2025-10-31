// ✅ WayX Dynamic Sitemap Generator — v1.0
import { MetadataRoute } from "next";

// 🌍 Базовый URL
const baseUrl = "https://wayx.kz";

// 📦 Генератор sitemap.xml
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "about",
    "auctions",
    "auction/create",
    "support",
    "investors",
    "partners",
    "privacy",
    "terms"
  ];

  const now = new Date().toISOString();

  return pages.map((path) => ({
    url: `${baseUrl}/${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1.0 : 0.8,
  }));
}
