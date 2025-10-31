import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// 🔹 Интерфейс профиля пользователя
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  rating?: number;
  avatarUrl?: string;
  role?: UserRole; // 👈 добавлено поле роли
  createdAt?: number;
}

// 🔹 Возможные роли
export type UserRole = "admin" | "client" | "supplier";

// ✅ Получение пользователя по email
export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  if (!email) return null;
  const ref = doc(db, "users", email);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
}

// ✅ Получение пользователя по UID (из Auth)
export async function getUserById(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
}

// ✅ Проверка роли
export function isAdmin(role?: UserRole) {
  return role === "admin";
}

export function isClient(role?: UserRole) {
  return role === "client";
}

export function isSupplier(role?: UserRole) {
  return role === "supplier";
}

// ✅ Получение роли из Firestore
export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as Partial<UserProfile>;
      return (data.role as UserRole) || null;
    }
    return null;
  } catch (e) {
    console.error("Ошибка getUserRole:", e);
    return null;
  }
}

// ✅ Обновление роли пользователя (только для админов)
export async function setUserRole(uid: string, role: UserRole) {
  try {
    const ref = doc(db, "users", uid);
    await updateDoc(ref, { role });
  } catch (e) {
    console.error("Ошибка setUserRole:", e);
  }
}

// ✅ Создание профиля (при регистрации)
export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
  try {
    const ref = doc(db, "users", uid);
    await setDoc(ref, {
      ...data,
      createdAt: Date.now(),
      role: data.role || "client",
    });
  } catch (e) {
    console.error("Ошибка createUserProfile:", e);
  }
}
