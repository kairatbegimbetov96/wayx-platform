import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// === Тип уведомления ===
export interface Notification {
  id?: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  link?: string;
  read?: boolean;
  createdAt?: any;
}

// === 🔔 Создать уведомление пользователю ===
export async function createNotification(userId: string, data: Notification) {
  if (!userId) return console.warn("⚠️ createNotification: userId не указан");

  try {
    const ref = collection(db, "notifications", userId, "items");
    await addDoc(ref, {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    });
    console.log(`✅ Уведомление создано для ${userId}`);
  } catch (err) {
    console.error("❌ Ошибка при создании уведомления:", err);
  }
}

// === 👂 Подписка на уведомления (real-time) ===
export function listenToNotifications(
  userId: string,
  callback: (items: Notification[]) => void
) {
  if (!userId) return () => {};

  const ref = collection(db, "notifications", userId, "items");
  const q = query(ref, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
      callback(data);
    },
    (err) => {
      console.error("❌ Ошибка слушателя уведомлений:", err);
    }
  );
}

// === ✅ Пометить одно уведомление как прочитанное ===
export async function markNotificationRead(userId: string, notifId: string) {
  if (!userId || !notifId) return;
  try {
    const ref = doc(db, "notifications", userId, "items", notifId);
    await updateDoc(ref, { read: true });
    console.log(`📩 Уведомление ${notifId} помечено как прочитанное`);
  } catch (err) {
    console.error("❌ Ошибка при обновлении уведомления:", err);
  }
}

// === ✅ Пометить все уведомления как прочитанные ===
export async function markAllNotificationsRead(userId: string) {
  if (!userId) return;
  try {
    const ref = collection(db, "notifications", userId, "items");
    const q = query(ref, where("read", "==", false));
    const snap = await getDocs(q);

    const updates = snap.docs.map(async (d) => {
      const docRef = doc(db, "notifications", userId, "items", d.id);
      await updateDoc(docRef, { read: true });
    });

    await Promise.all(updates);
    console.log(`📨 Все уведомления ${userId} помечены как прочитанные`);
  } catch (err) {
    console.error("❌ Ошибка при пометке всех уведомлений:", err);
  }
}
