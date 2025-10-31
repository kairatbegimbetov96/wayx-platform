"use client";

import { useState } from "react";
import { placeBid } from "@/lib/firestore";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function BidForm({ auctionId }: { auctionId: string }) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = auth.currentUser;

    if (!u) {
      (window as any).toast?.("⚠️ Войдите как поставщик", "error");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      (window as any).toast?.("❗ Укажите корректную сумму ставки", "error");
      return;
    }

    setLoading(true);
    try {
      await placeBid(auctionId, u.uid, Number(amount), message);
      setAmount("");
      setMessage("");
      (window as any).toast?.("✅ Ставка отправлена", "success");
    } catch (e: any) {
      (window as any).toast?.(e.message || "Ошибка при отправке ставки", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="p-4 border rounded-xl bg-white dark:bg-gray-800 space-y-3"
    >
      <div className="grid md:grid-cols-3 gap-3">
        <input
          type="number"
          placeholder="Ваша цена, ₸"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-transparent md:col-span-1"
          required
        />
        <input
          type="text"
          placeholder="Комментарий / условия (опц.)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border rounded-lg px-3 py-2 bg-transparent md:col-span-2"
        />
      </div>
      <button
        disabled={loading}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-70 hover:bg-blue-700"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Отправить ставку
      </button>
    </form>
  );
}
