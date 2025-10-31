"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  getAuctionById,
  addBid,
  listenToBids,
  acceptBid,
  rejectOtherBids,
  closeAuction,
  Auction,
  Bid,
} from "@/lib/auctions";
import { createNotification } from "@/lib/notifications";
import { useToast } from "@/components/ToastProvider";
import {
  Loader2,
  Coins,
  MapPin,
  CheckCircle2,
  ThumbsUp,
  XCircle,
  Clock,
  Lock,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";

export default function AuctionDetailsPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [bid, setBid] = useState<number | "">("");
  const [bids, setBids] = useState<Bid[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 🔹 Загрузка аукциона
  useEffect(() => {
    const fetchAuction = async () => {
      if (typeof id !== "string") return;
      try {
        const data = await getAuctionById(id);
        setAuction(data);
      } catch (err) {
        console.error("Ошибка загрузки аукциона:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  // 🔹 Живые ставки
  useEffect(() => {
    if (typeof id !== "string") return;
    const unsub = listenToBids(id, (liveBids) => {
      const sorted = [...liveBids].sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
      );
      setBids(sorted);
    });
    return () => unsub();
  }, [id]);

  // 🔹 Сделать ставку
  const handleBid = async () => {
    if (!bid || bid <= 0) {
      toast({
        type: "error",
        title: "Некорректная ставка",
        description: "Введите сумму больше нуля",
      });
      return;
    }
    if (!auction || auction.status === "closed" || isSubmitting) return;

    const userEmail = auth.currentUser?.email;
    if (!userEmail) {
      toast({
        type: "warning",
        title: "Требуется вход",
        description: "Авторизуйтесь, чтобы сделать ставку",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addBid(id as string, {
        user: userEmail,
        amount: Number(bid),
        status: "pending",
      } as any);

      await createNotification(userEmail, {
        title: "💸 Ставка отправлена",
        message: `Ваша ставка ${Number(bid).toLocaleString()} ₸ отправлена.`,
        type: "info",
        link: `/auctions/${id}`,
      });

      setBid("");
      toast({
        type: "success",
        title: "Ставка добавлена",
        description: "Мы уведомим вас о результате",
      });
    } catch (err) {
      console.error("Ошибка при ставке:", err);
      toast({
        type: "error",
        title: "Ошибка",
        description: "Не удалось добавить ставку",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔹 Клиент вручную выбирает поставщика
  const handleAccept = async (bidId: string, winnerEmail?: string) => {
    if (!auction || auction.status === "closed") return;
    try {
      await acceptBid(id as string, bidId);

      if (winnerEmail) {
        await createNotification(winnerEmail, {
          title: "🎉 Ваша ставка выбрана клиентом",
          message: "Ожидайте завершения аукциона.",
          type: "success",
          link: `/auctions/${id}`,
        });
      }

      setBids((prev) =>
        prev.map((b) =>
          b.id === bidId ? { ...b, status: "accepted" } : b
        )
      );

      toast({
        type: "success",
        title: "Ставка выбрана",
        description: "Теперь можно завершить аукцион вручную.",
      });
    } catch (err) {
      console.error("Ошибка выбора победителя:", err);
      toast({
        type: "error",
        title: "Ошибка",
        description: "Не удалось выбрать ставку",
      });
    }
  };

  // 🔹 Завершение аукциона вручную
  const handleCloseAuction = async () => {
    if (!id || typeof id !== "string" || isClosing) return;
    if (!confirm("Вы уверены, что хотите завершить аукцион?")) return;
    try {
      setIsClosing(true);
      await rejectOtherBids(id);
      await closeAuction(id);

      toast({
        type: "info",
        title: "Аукцион завершён",
        description: "Победитель зафиксирован, остальные отклонены.",
      });

      setAuction((prev) => prev && { ...prev, status: "closed" });
    } catch (err) {
      console.error("Ошибка при закрытии аукциона:", err);
      toast({
        type: "error",
        title: "Ошибка",
        description: "Не удалось закрыть аукцион",
      });
    } finally {
      setIsClosing(false);
    }
  };

  // === UI ===
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );

  if (!auction)
    return (
      <div className="text-center py-20 text-slate-600 dark:text-slate-400">
        Аукцион не найден
      </div>
    );

  const renderStatus = (status?: string) => {
    switch (status) {
      case "accepted":
        return (
          <span className="flex items-center gap-1 text-green-600 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Принята
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 text-red-500 font-semibold">
            <XCircle className="w-4 h-4" /> Отклонена
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-yellow-600 font-medium">
            <Clock className="w-4 h-4" /> Ожидает
          </span>
        );
    }
  };

  return (
    <section className="max-w-4xl mx-auto py-16 px-6">
      {auction.status === "closed" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold"
        >
          <Lock className="w-5 h-5 mr-2" /> Аукцион завершён — ставки закрыты
        </motion.div>
      )}

      <h1 className="text-3xl font-bold mb-2 text-blue-600 dark:text-sky-400">
        {auction.title}
      </h1>
      <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
        {auction.description}
      </p>

      <div className="flex items-center gap-3 mb-4 text-slate-500">
        <MapPin className="w-5 h-5" />
        {auction.origin} → {auction.destination}
      </div>

      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold mb-8">
        <Coins className="w-5 h-5" />
        Базовая цена: {auction.price.toLocaleString()} {auction.currency}
      </div>

      {/* ⚡ Сделать ставку */}
      {auction.status !== "closed" && (
        <div className="bg-slate-50 dark:bg-slate-800/70 p-6 rounded-2xl shadow border border-slate-200 dark:border-slate-700 mb-8">
          <h3 className="text-lg font-semibold mb-3">Сделать ставку</h3>
          <div className="flex gap-3">
            <input
  ref={inputRef}
  type="number"
  value={bid}
  onChange={(e) => setBid(Number(e.target.value))}
  placeholder="Введите сумму"
  disabled={auction?.status === "closed"}
  className="flex-1 border p-3 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
/>

            <button
              onClick={handleBid}
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-xl text-white font-semibold transition ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Отправка..." : "Отправить"}
            </button>
          </div>
        </div>
      )}

      {/* 📊 Ставки */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Ставки участников</h3>
        <p className="text-sm text-slate-500 mb-4">
          Клиент самостоятельно выбирает поставщика из предложенных ставок.
        </p>

        {bids.length === 0 ? (
          <p className="text-slate-500">Ставок пока нет</p>
        ) : (
          bids.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`p-4 border rounded-xl flex justify-between items-center ${
                b.status === "accepted"
                  ? "bg-green-100 dark:bg-green-800/40 border-green-400"
                  : b.status === "rejected"
                  ? "bg-red-50 dark:bg-red-900/30 border-red-400"
                  : "bg-white/80 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700"
              }`}
            >
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {b.user}
                  {b.status === "accepted" && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-500 text-white">
                      Победитель
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-500">
                  {b.createdAt?.toDate
                    ? b.createdAt.toDate().toLocaleString()
                    : "—"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                  <Coins className="w-4 h-4" /> {b.amount.toLocaleString()}{" "}
                  {auction.currency}
                </div>

                {renderStatus(b.status)}

                {b.status === "pending" && auction.status !== "closed" && (
                  <button
                    onClick={() => handleAccept(b.id!, b.user)}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ThumbsUp className="w-4 h-4" /> Выбрать
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ✅ Завершить аукцион вручную */}
      {auction.status !== "closed" && (
        <div className="mt-8 text-center">
          <button
            onClick={handleCloseAuction}
            disabled={isClosing}
            className={`px-6 py-3 rounded-xl text-white font-semibold transition ${
              isClosing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isClosing ? "Закрывается..." : "Завершить аукцион"}
          </button>
        </div>
      )}
    </section>
  );
}
