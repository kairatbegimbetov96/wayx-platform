import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// === Типы данных ===
export interface Auction {
  id?: string;
  title: string;
  description: string;
  origin: string;
  destination: string;
  price: number;
  currency: string;
  createdBy: string;
  status: string; // "open" | "closed" | "in-progress"
  transport: "auto" | "rail" | "air" | "sea" | "multimodal";
  createdAt?: any;
}

export interface Bid {
  id?: string;
  user: string;
  amount: number;
  createdAt?: any;
  status?: "pending" | "accepted" | "rejected";
}

// === Создать новую заявку (аукцион) ===
export async function createAuction(auction: Omit<Auction, "id">) {
  try {
    const ref = await addDoc(collection(db, "auctions"), {
      ...auction,
      status: auction.status || "open",
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.error("❌ Ошибка при создании аукциона:", err);
    throw err;
  }
}

// === Получить все аукционы ===
export async function getAllAuctions(): Promise<Auction[]> {
  const q = query(collection(db, "auctions"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Auction));
}

// === Получить аукцион по ID ===
export async function getAuctionById(id: string): Promise<Auction | null> {
  const ref = doc(db, "auctions", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Auction;
}

// === Обновить данные аукциона ===
export async function updateAuction(id: string, data: Partial<Auction>) {
  try {
    await updateDoc(doc(db, "auctions", id), data);
  } catch (err) {
    console.error("❌ Ошибка при обновлении аукциона:", err);
  }
}

// === Добавить ставку ===
export async function addBid(auctionId: string, bid: Bid) {
  try {
    const bidsRef = collection(db, "auctions", auctionId, "bids");
    await addDoc(bidsRef, { ...bid, createdAt: serverTimestamp() });
  } catch (err) {
    console.error("❌ Ошибка при добавлении ставки:", err);
  }
}

// === Live-подписка на ставки ===
export function listenToBids(
  auctionId: string,
  callback: (bids: Bid[]) => void
) {
  const bidsRef = collection(db, "auctions", auctionId, "bids");
  const q = query(bidsRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Bid));
    callback(data);
  });
}

// === Обновить статус конкретной ставки ===
export async function updateBidStatus(
  auctionId: string,
  bidId: string,
  status: "pending" | "accepted" | "rejected"
) {
  try {
    const bidRef = doc(db, "auctions", auctionId, "bids", bidId);
    await updateDoc(bidRef, { status });
  } catch (err) {
    console.error("❌ Ошибка при обновлении статуса ставки:", err);
  }
}

// === ✅ Принять одну ставку (ручной выбор клиента) ===
export async function acceptBid(auctionId: string, acceptedBidId: string) {
  try {
    const bidRef = doc(db, "auctions", auctionId, "bids", acceptedBidId);
    await updateDoc(bidRef, { status: "accepted" });
    console.log("✅ Ставка помечена как принята");

    // 🔹 обновляем статус аукциона на "in-progress"
    await updateDoc(doc(db, "auctions", auctionId), { status: "in-progress" });
  } catch (err) {
    console.error("❌ Ошибка при принятии ставки:", err);
  }
}

// === ❌ Отклонить все остальные ставки (при закрытии аукциона) ===
export async function rejectOtherBids(auctionId: string) {
  try {
    const bidsRef = collection(db, "auctions", auctionId, "bids");
    const q = query(
      bidsRef,
      where("status", "in", ["pending", "accepted"])
    );
    const snap = await getDocs(q);

    const updates = snap.docs.map(async (d) => {
      const ref = doc(db, "auctions", auctionId, "bids", d.id);
      const status = d.data().status === "accepted" ? "accepted" : "rejected";
      await updateDoc(ref, { status });
    });

    await Promise.all(updates);
    console.log("⚙️ Остальные ставки отклонены (кроме принятой)");
  } catch (err) {
    console.error("❌ Ошибка при отклонении ставок:", err);
  }
}

// === 🚪 Завершить аукцион ===
export async function closeAuction(auctionId: string) {
  try {
    const ref = doc(db, "auctions", auctionId);
    await updateDoc(ref, { status: "closed" });
    console.log("✅ Аукцион завершён вручную");
  } catch (err) {
    console.error("❌ Ошибка при завершении аукциона:", err);
  }
}
