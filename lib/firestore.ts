import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { AuctionDoc, BidDoc, RequestDoc } from "@/types/user";

// 🔄 Конвертация
export const toTimestamp = (d?: Date | null) =>
  d instanceof Date ? Timestamp.fromDate(d) : null;

export const fromTimestamp = (t: unknown): Date | undefined =>
  t && typeof t === "object" && "toDate" in (t as any)
    ? (t as Timestamp).toDate()
    : undefined;

// 📦 Requests
export async function createRequest(
  uid: string,
  data: Omit<RequestDoc, "id" | "ownerUid" | "createdAt" | "status">
) {
  try {
    const ref = await addDoc(collection(db, "requests"), {
      ownerUid: uid,
      ...data,
      createdAt: serverTimestamp(),
      status: "published",
    });
    return ref.id;
  } catch (e) {
    console.error("Ошибка createRequest:", e);
    throw e;
  }
}

export async function getMyRequests(uid: string): Promise<RequestDoc[]> {
  const q = query(
    collection(db, "requests"),
    where("ownerUid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RequestDoc));
}

export async function updateRequest(id: string, data: Partial<RequestDoc>) {
  await updateDoc(doc(db, "requests", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRequest(id: string) {
  await deleteDoc(doc(db, "requests", id));
}

// ⚙️ Auctions
export async function createAuction(
  customerUid: string,
  requestId: string,
  opts: Partial<AuctionDoc>
) {
  const ref = await addDoc(collection(db, "auctions"), {
    requestId,
    customerUid,
    status: "open",
    minStep: opts.minStep ?? null,
    sealed: opts.sealed ?? false,
    deadlineAt:
  opts.deadlineAt instanceof Date
    ? Timestamp.fromDate(opts.deadlineAt)
    : typeof opts.deadlineAt === "number"
    ? Timestamp.fromDate(new Date(opts.deadlineAt))
    : null,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "requests", requestId), { auctionId: ref.id });
  return ref.id;
}

export async function getAuction(auctionId: string) {
  const d = await getDoc(doc(db, "auctions", auctionId));
  if (!d.exists()) return null;
  const data = d.data() as AuctionDoc;
  return { id: d.id, ...data };
}

export async function updateAuction(id: string, data: Partial<AuctionDoc>) {
  await updateDoc(doc(db, "auctions", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAuction(id: string) {
  await deleteDoc(doc(db, "auctions", id));
}

// 💸 Bids
export async function placeBid(
  auctionId: string,
  supplierUid: string,
  amount: number,
  message?: string
) {
  const ref = await addDoc(collection(db, "bids"), {
    auctionId,
    supplierUid,
    amount,
    message: message ?? "",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function listenBids(auctionId: string, cb: (bids: BidDoc[]) => void) {
  const q = query(
    collection(db, "bids"),
    where("auctionId", "==", auctionId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as BidDoc));
    cb(list);
  });
}
