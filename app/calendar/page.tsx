"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { CalendarDays, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";

// 📅 Тип заявки
interface RequestData {
  id: string;
  origin: string;
  destination: string;
  transport: string;
  weight: string;
  description: string;
  date?: string;
}

export default function CalendarPage() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: RequestData[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RequestData[];
      setRequests(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-600 dark:text-blue-400">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto py-12 px-4">
        <motion.h1
          className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Календарь заявок
        </motion.h1>

        {requests.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Пока нет активных заявок.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req, index) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {req.date || "Дата не указана"}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {req.transport}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-1">
                  {req.origin} → {req.destination}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                  Вес: {req.weight} т
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {req.description || "Без описания"}
                </p>

                <div className="flex justify-end mt-4">
                  <CalendarDays className="w-5 h-5 text-blue-500" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
