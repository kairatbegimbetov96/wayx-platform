"use client";

import { motion } from "framer-motion";
import { Wallet, Star, CheckCircle2 } from "lucide-react";

interface DashboardStatsProps {
  name: string;
  balance: number;
  rating: number;
  verified: boolean;
}

export default function DashboardStats({
  name,
  balance,
  rating,
  verified,
}: DashboardStatsProps) {
  return (
    <motion.div
      className="grid md:grid-cols-3 gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* 💰 Баланс */}
      <div className="flex flex-col items-center justify-center">
        <Wallet className="w-6 h-6 text-blue-600 mb-2" />
        <p className="text-gray-500 text-sm">Баланс</p>
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {balance.toLocaleString("ru-RU")} ₸
        </p>
      </div>

      {/* ⭐ Рейтинг */}
      <div className="flex flex-col items-center justify-center">
        <Star className="w-6 h-6 text-yellow-500 mb-2" />
        <p className="text-gray-500 text-sm">Рейтинг</p>
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {rating.toFixed(1)} / 5
        </p>
      </div>

      {/* ✅ Верификация */}
      <div className="flex flex-col items-center justify-center">
        <CheckCircle2
          className={`w-6 h-6 mb-2 ${
            verified ? "text-green-500" : "text-gray-400"
          }`}
        />
        <p className="text-gray-500 text-sm">Статус</p>
        <p
          className={`text-xl font-semibold ${
            verified
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {verified ? "Подтверждён" : "Не подтверждён"}
        </p>
      </div>
    </motion.div>
  );
}
