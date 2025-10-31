"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import CreateRequestForm from "@/components/CreateRequestForm";
import { Loader2, PackageSearch } from "lucide-react";
import { motion } from "framer-motion";

export default function MyRequestsPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;

    const q = query(
      collection(db, "requests"),
      where("ownerUid", "==", u.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto py-10 px-4 space-y-10">
        <motion.h1
          className="text-3xl font-bold text-blue-600 dark:text-blue-400 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          📦 Мои заявки
        </motion.h1>

        {/* 🔹 Форма создания */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Создать новую заявку
          </h2>
          <CreateRequestForm />
        </div>

        {/* 🔹 Список заявок */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            <PackageSearch className="h-10 w-10 mx-auto mb-2 opacity-60" />
            Пока нет заявок.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {list.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm"
              >
                <div className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                  {r.origin} → {r.destination}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {r.transport}, {r.weightTons ?? "-"} т
                </div>

                {r.desiredPrice && (
                  <div className="mt-2 text-blue-600 dark:text-blue-400 font-medium">
                    💰 Ставка клиента: {r.desiredPrice.toLocaleString()} ₸
                  </div>
                )}

                <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  Статус:{" "}
                  <span
                    className={`font-semibold ${
                      r.status === "completed"
                        ? "text-green-600"
                        : r.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {r.status || "Не указан"}
                  </span>
                </div>

                {r.auctionId && (
                  <a
                    href={`/auctions/${r.auctionId}`}
                    className="inline-block mt-3 text-blue-600 hover:underline text-sm"
                  >
                    Перейти к аукциону →
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
