// ✅ lib/firebase.ts — v9 (fix client env + singleton)
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// ───────────────────────────────────────────────────────────
// ВАЖНО: Не использовать динамический доступ process.env[key].
// NEXT_PUBLIC_* должны быть выписаны явно (иначе в браузере будут undefined).
// ───────────────────────────────────────────────────────────

const envClient = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  // Для firebaseConfig нужен именно bucket-идентификатор вида "<project-id>.appspot.com"
  // (это НОРМАЛЬНО; домен *.firebasestorage.app используется для загрузок)
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
};

// Небольшая диагностика: в dev предупреждаем, в prod — только лог обрезанного ключа
function assertEnv(name: keyof typeof envClient) {
  const v = envClient[name];
  if (!v) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`⚠️ Missing env: ${name}`);
    } else {
      console.error(`❌ Missing client env: ${name}`);
    }
  }
  return v;
}

const firebaseConfig = {
  apiKey: assertEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: assertEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: assertEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: assertEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: assertEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: assertEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: assertEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"),
};

// В проде можно один раз показать, что попало на клиент (без утечки полного ключа)
if (typeof window !== "undefined") {
  const masked = (s: string) => (s ? s.slice(0, 6) + "…" : "");
  console.log("🌍 Firebase env check (client):", {
    apiKey: masked(envClient.NEXT_PUBLIC_FIREBASE_API_KEY),
    projectId: envClient.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    authDomain: envClient.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    storageBucket: envClient.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
} else {
  console.log("🖥️ Firebase env check (server):", {
    apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "").slice(0, 6) + "…",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

// ───────────────────────────────────────────────────────────
// Одиночная инициализация (SSR + SPA), без дублей
// ───────────────────────────────────────────────────────────
let app: FirebaseApp;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized successfully");
} catch (err) {
  console.error("🔥 Firebase init error:", err);
  // Фоллбек, чтобы не падать
  // @ts-expect-error
  app = getApps().length ? getApp() : {};
}

// Сервисы
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;
