// lib/authUtils.ts
"use client";

import { useRouter } from "next/navigation";

/** Показывает toast-уведомление, если глобальный провайдер подключён */
export function notify(message: string, type: "success" | "error" | "info" = "info") {
  if (typeof window !== "undefined" && (window as any).toast) {
    (window as any).toast(message, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

/** Универсальный редирект с задержкой */
export function delayedRedirect(router: ReturnType<typeof useRouter>, to: string, delay = 1500) {
  setTimeout(() => router.push(to), delay);
}

/** Простая обработка ошибок Firebase */
export function getAuthErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "Этот e-mail уже зарегистрирован.";
    case "auth/invalid-email":
      return "Некорректный адрес e-mail.";
    case "auth/wrong-password":
      return "Неверный пароль.";
    case "auth/user-not-found":
      return "Пользователь не найден.";
    default:
      return "Ошибка авторизации. Попробуйте ещё раз.";
  }
}
