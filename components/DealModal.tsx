"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, Building2, Star, MapPin } from "lucide-react";
import { getUserByEmail } from "@/lib/users";
import { getAuctionById, Auction } from "@/lib/auctions";
import { motion, AnimatePresence } from "framer-motion";

interface DealModalProps {
  open: boolean;
  onClose: () => void;
  supplierEmail: string;
  auctionId: string;
  amount: number;
}

export default function DealModal({
  open,
  onClose,
  supplierEmail,
  auctionId,
  amount,
}: DealModalProps) {
  const [supplier, setSupplier] = useState<any>(null);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const [userData, auctionData] = await Promise.all([
        getUserByEmail(supplierEmail),
        getAuctionById(auctionId),
      ]);
      setSupplier(userData);
      setAuction(auctionData);
      setLoading(false);
    })();
  }, [open, supplierEmail, auctionId]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed z-[9999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-[90%] max-w-md p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
          >
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                  Сделка подтверждена ✅
                </h2>

                <div className="space-y-3 text-slate-700 dark:text-slate-300">
                  <p>
                    <strong>Поставщик:</strong>{" "}
                    {supplier?.name || "Без имени"}
                  </p>
                  {supplier?.company && (
                    <p className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      {supplier.company}
                    </p>
                  )}
                  {supplier?.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-500" />
                      {supplier.phone}
                    </p>
                  )}
                  {supplier?.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sky-500" />
                      {supplier.email}
                    </p>
                  )}
                  {supplier?.rating && (
                    <p className="flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.round(supplier.rating)
                              ? "fill-yellow-400"
                              : "fill-slate-300 dark:fill-slate-600"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                        {supplier.rating.toFixed(1)}
                      </span>
                    </p>
                  )}
                  {auction && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      {auction.origin} → {auction.destination}
                    </p>
                  )}
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    Сумма сделки: {amount.toLocaleString()} {auction?.currency}
                  </p>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <button
                    onClick={() => window.location.href = `/auction/${auctionId}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    Перейти к сделке
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg font-medium transition"
                  >
                    Закрыть
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
