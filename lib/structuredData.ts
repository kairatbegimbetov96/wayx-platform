// ✅ WayX Structured Data & Breadcrumbs Generator — v1.0
// Позволяет Google / Яндекс отображать навигационные хлебные крошки,
// логотип, бренд и рейтинг WayX в выдаче.

export function generateBreadcrumbs(path: string) {
  const baseUrl = "https://wayx.kz";

  const segments = path
    .split("/")
    .filter(Boolean)
    .map((segment, index, arr) => {
      const url = `${baseUrl}/${arr.slice(0, index + 1).join("/")}`;
      const name =
        segment
          .replace("-", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()) || "Главная";
      return { "@type": "ListItem", position: index + 1, name, item: url };
    });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: baseUrl },
      ...segments,
    ],
  };
}

export function generateOrganizationData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "WayX Logistics",
    url: "https://wayx.kz",
    logo: "https://wayx.kz/icon512.png",
    sameAs: [
      "https://t.me/wayxkz",
      "https://www.instagram.com/wayx.kz",
      "https://www.linkedin.com/company/wayx"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+7-700-123-4567",
      contactType: "customer support",
      areaServed: "KZ",
      availableLanguage: ["Russian", "Kazakh", "English"]
    }
  };
}

export function generateRatingData() {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: {
      "@type": "Product",
      name: "WayX Logistics Platform",
      image: "https://wayx.kz/og-image.png",
      brand: {
        "@type": "Brand",
        name: "WayX"
      }
    },
    ratingValue: "4.9",
    reviewCount: "1280",
    bestRating: "5",
    worstRating: "1"
  };
}
