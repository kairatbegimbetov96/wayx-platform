// ✅ src/types/user.ts — v7: улучшенная версия с типобезопасностью и расширенной структурой
import type { Timestamp, FieldValue } from "firebase/firestore";

/* -----------------------------------------------------------
 🔹 Универсальные базовые типы
----------------------------------------------------------- */
export type FireDate = Date | Timestamp | FieldValue | number | null;
export type UID = string;
export type Email = string;
export type Nullable<T> = T | null;

/* -----------------------------------------------------------
 🔹 Классификации пользователей
----------------------------------------------------------- */
export type UserRole = "client" | "supplier" | "admin";
export type LegalType = "individual" | "company";
export type SupplierType = "logistics" | "expeditor" | "driver" | "logist";

/* -----------------------------------------------------------
 🔹 Основная структура профиля пользователя (WayX)
   - Совместима с Firestore и backend API
   - Безопасна для serverTimestamp() и merge-операций
----------------------------------------------------------- */
export interface WayxUserProfile {
  /** UID из Firebase Auth */
  uid: UID;

  /** Основной email (для входа и связи) */
  email: Email;

  /** Имя или название компании */
  displayName?: string;
  name?: string; // алиас для старых компонентов (dashboard, UserBadge)

  /** Роль пользователя */
  role: UserRole;

  /** Юридический тип (физ./юр. лицо) */
  legalType: LegalType;

  /** Подтип поставщика (null для клиентов) */
  supplierType: Nullable<SupplierType>;

  /** Компания / организация */
  company: Nullable<string>;

  /** БИН / ИИН */
  bin: Nullable<string>;

  /** Контактное лицо / директор */
  directorName?: string;

  /** Должность */
  position?: string;

  /** Контактные данные */
  phone?: string;
  address?: string;
  website?: string;

  /** Настройки профиля */
  preferredLanguage?: "ru" | "en" | "kz";
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };

  /** Состояния верификации */
  verified: boolean;
  approvedByAdmin: boolean;

  /** Метаинформация */
  avatarUrl?: string;
  about?: string;
  rating?: number;
  balance?: number;

  /** Даты */
  createdAt: FireDate;
  updatedAt: FireDate;
  lastLoginAt?: FireDate;

  /** Геолокация */
  location?: { lat: number; lng: number };

  /** Теги для поиска */
  tags?: string[];
}

/* -----------------------------------------------------------
 🔹 Логистика и аукционы
----------------------------------------------------------- */
export type TransportMode =
  | "Авто"
  | "ЖД"
  | "Авиа"
  | "Море"
  | "Мультимодальная";

export type AuctionStatus = "open" | "closed" | "pending";

/* -----------------------------------------------------------
 🔹 Заявка на перевозку
----------------------------------------------------------- */
export interface RequestDoc {
  id?: string;
  ownerUid: UID;
  origin: string;
  destination: string;
  transport: TransportMode;
  weightTons: number;
  description?: string;
  desiredPrice?: number; // ставка клиента (как в inDriver)
  deadlineAt?: FireDate; // дедлайн приёма ставок
  createdAt: FireDate;
  auctionId?: string; // связанный аукцион
  status: "draft" | "published" | "awarded" | "cancelled";
}

/* -----------------------------------------------------------
 🔹 Аукцион
----------------------------------------------------------- */
export interface AuctionDoc {
  id?: string;
  requestId: string;
  customerUid: UID;
  status: AuctionStatus;
  minStep?: number | null;
  sealed?: boolean; // “скрытые” ставки до завершения
  deadlineAt?: FireDate;
  createdAt: FireDate;
  awardedBidId?: string | null;
  awardedSupplierUid?: string | null;
}

/* -----------------------------------------------------------
 🔹 Ставка поставщика
----------------------------------------------------------- */
export interface BidDoc {
  id?: string;
  auctionId: string;
  supplierUid: UID;
  amount: number; // цена поставщика (₸)
  message?: string; // комментарий
  createdAt: FireDate;
}

/* -----------------------------------------------------------
 🔹 Маппинг статусов для UI
----------------------------------------------------------- */
export const AUCTION_STATUS_LABEL: Record<AuctionStatus, string> = {
  open: "Открыт",
  closed: "Закрыт",
  pending: "В ожидании",
};
