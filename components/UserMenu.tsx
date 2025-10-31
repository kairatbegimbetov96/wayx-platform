"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  User,
  LogOut,
  ClipboardList,
  Truck,
  LayoutDashboard,
  Settings,
  Briefcase,
  Shield,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserProfile {
  name?: string;
  role?: "admin" | "supplier" | "client" | string;
}

interface UserMenuProps {
  profile?: UserProfile;
  mobile?: boolean;
}

export default function UserMenu({ profile, mobile = false }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const logout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/auth/login";
    } catch (err) {
      console.error("Ошибка при выходе:", err);
    }
  };

  const userName =
    profile?.name || auth.currentUser?.displayName || "Пользователь";

  const roleKey = profile?.role || "client";
  const roleMap: Record<string, { title: string; color: string }> = {
    admin: {
      title: "Администратор",
      color: "bg-gradient-to-r from-purple-500 to-pink-400",
    },
    supplier: {
      title: "Поставщик",
      color: "bg-gradient-to-r from-green-500 to-emerald-400",
    },
    client: {
      title: "Клиент",
      color: "bg-gradient-to-r from-blue-500 to-cyan-400",
    },
  };
  const roleInfo = roleMap[roleKey] || roleMap.client;

  // 🔒 Закрытие при клике вне меню
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 📱 Мобильная версия ---
  if (mobile) {
    return (
      <div className="w-full flex flex-col gap-2 text-sm">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
          <div>
            <p className="font-semibold">{userName}</p>
            <span
              className={`text-xs inline-block px-2 py-0.5 rounded-full text-white ${roleInfo.color}`}
            >
              {roleInfo.title}
            </span>
          </div>
        </div>

        <MenuLink href="/profile" icon={<User />} label="Профиль" />

        {roleKey === "client" && (
          <MenuLink
            href="/orders"
            icon={<ClipboardList />}
            label="Мои заказы"
          />
        )}

        {roleKey === "supplier" && (
          <MenuLink href="/bids" icon={<Truck />} label="Мои ставки" />
        )}

        {roleKey === "admin" && (
          <MenuLink
            href="/admin"
            icon={<LayoutDashboard />}
            label="Панель администратора"
          />
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-500 py-2 hover:opacity-80 transition"
        >
          <LogOut className="w-4 h-4" /> Выйти
        </button>
      </div>
    );
  }

  // --- 💻 Десктопная версия ---
  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition-transform"
      >
        <User className="w-4 h-4" />
        <span>{userName}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {/* 👤 Шапка профиля */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-sm">
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {userName}
              </p>
              <span
                className={`inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold text-white rounded-full ${roleInfo.color}`}
              >
                {roleInfo.title}
              </span>
            </div>

            {/* 📋 Меню */}
            <ul className="text-sm">
              <MenuLink
                href="/dashboard"
                icon={<Briefcase className="w-4 h-4 text-indigo-500" />}
                label="Панель управления"
                onClick={() => setOpen(false)}
              />

              <MenuLink
                href="/profile"
                icon={<User className="w-4 h-4 text-blue-500" />}
                label="Профиль"
                onClick={() => setOpen(false)}
              />

              {roleKey === "client" && (
                <MenuLink
                  href="/orders"
                  icon={<ClipboardList className="w-4 h-4 text-green-500" />}
                  label="Мои заказы"
                  onClick={() => setOpen(false)}
                />
              )}

              {roleKey === "supplier" && (
                <MenuLink
                  href="/bids"
                  icon={<Truck className="w-4 h-4 text-amber-500" />}
                  label="Мои ставки"
                  onClick={() => setOpen(false)}
                />
              )}

              {roleKey === "admin" && (
                <MenuLink
                  href="/admin"
                  icon={<Shield className="w-4 h-4 text-purple-500" />}
                  label="Админ-панель"
                  onClick={() => setOpen(false)}
                />
              )}

              <MenuLink
                href="/settings"
                icon={<Settings className="w-4 h-4 text-gray-500" />}
                label="Настройки"
                onClick={() => setOpen(false)}
              />

              <li>
                <button
                  onClick={logout}
                  className="w-full text-left flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                >
                  <LogOut className="w-4 h-4" /> Выйти
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 🔹 Вспомогательная ссылка меню
function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: JSX.Element;
  label: string;
  onClick?: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        {icon}
        <span>{label}</span>
      </Link>
    </li>
  );
}
