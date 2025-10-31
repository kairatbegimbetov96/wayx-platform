// ✅ WayX Dynamic Robots Generator — v1.0
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://wayx.kz";

  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: [
        "/auth/",
        "/api/",
        "/dashboard/",
        "/_next/",
        "/server/",
        "/static/"
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
