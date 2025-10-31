export {};

declare global {
  // Глобальная функция для уведомлений
  function toast(text: string, type?: "info" | "success" | "error"): void;
}
