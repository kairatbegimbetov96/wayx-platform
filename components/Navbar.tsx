"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import NotificationsBell from "@/components/NotificationsBell";
import UserMenu from "@/components/UserMenu";

interface UserProfile {
  name?: string;
  role?: "admin" | "supplier" | "client" | string;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const pathname = usePathname();

  // 🎨 Инициализация темы
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = savedTheme === "dark";
    document.documentElement.classList.toggle("dark", prefersDark);
    setDarkMode(prefersDark);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDarkMode(next);
  };

  // 👤 Авторизация и загрузка профиля
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        try {
          const ref = doc(db, "users", u.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            // fallback если профиль не создан
            setProfile({
              name: u.displayName || u.email?.split("@")[0] || "Пользователь",
              role: "client",
            });
          }
        } catch (err) {
          console.error("Ошибка при загрузке профиля:", err);
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsub();
  }, []);

  const links = [
    { href: "/", label: "Главная" },
    { href: "/orders/new", label: "Новая заявка" },
    { href: "/market", label: "Биржа" },
    { href: "/calendar", label: "Календарь" },
    { href: "/support", label: "Поддержка" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 border-b transition-all duration-500 backdrop-blur-xl ${
        darkMode
          ? "bg-slate-950/85 border-slate-800 shadow-[0_0_25px_rgba(56,189,248,0.25)]"
          : "bg-white/70 border-blue-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* 🌐 Логотип WayX */}
        <Link href="/" className="flex items-center gap-2 group select-none">
          <img
            src="/logo-wayx.png"
            alt="WayX"
            className="block dark:hidden w-9 h-9 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(37,99,235,0.25)]"
          />
          <img
            src="/logo-wayx-white.png"
            alt="WayX"
            className="hidden dark:block w-9 h-9 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_18px_rgba(56,189,248,0.35)]"
          />
          <span
            className={`text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-sky-400 bg-clip-text text-transparent group-hover:opacity-90 ${
              darkMode ? "dark:from-sky-300 dark:to-cyan-400" : ""
            }`}
          >
            WayX
          </span>
        </Link>

        {/* 💻 Десктопное меню */}
        <ul
          className={`hidden md:flex items-center space-x-8 font-medium ${
            darkMode ? "text-gray-200" : "text-slate-800"
          }`}
        >
          {links.map((link) => (
            <li key={link.href} className="relative group">
              <Link
                href={link.href}
                className={`transition-all ${
                  pathname === link.href
                    ? "text-blue-600 dark:text-sky-400 font-semibold"
                    : "hover:text-blue-600 dark:hover:text-sky-400"
                }`}
              >
                {link.label}
              </Link>
              <span
                className={`absolute left-0 bottom-0 h-[2px] bg-gradient-to-r from-sky-400 to-blue-600 rounded transition-all duration-300 ${
                  pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </li>
          ))}
        </ul>

        {/* ⚙️ Правая панель */}
        <div className="hidden md:flex items-center gap-4">
          {/* 🔔 Колокольчик уведомлений */}
          {user && <NotificationsBell userId={user.uid} />}

          {/* 🌙 Тема */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition hover:scale-105 ${
              darkMode
                ? "bg-slate-900 border-slate-700 text-yellow-300 hover:bg-slate-800"
                : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
            }`}
            aria-label="Тема"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* 👤 Пользователь */}
          {user ? (
            <UserMenu profile={profile || undefined} />
          ) : (
            <Link
              href="/auth/login"
              className={`px-5 py-2 rounded-lg font-semibold shadow transition-transform hover:scale-105 ${
                darkMode
                  ? "bg-gradient-to-r from-blue-700 to-sky-500 text-white"
                  : "bg-gradient-to-r from-blue-600 to-sky-400 text-white"
              }`}
            >
              Войти
            </Link>
          )}
        </div>

        {/* 📱 Мобильное меню (кнопка) */}
        <button
          className={`md:hidden ${darkMode ? "text-white" : "text-slate-800"}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* 📲 Мобильное меню */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-96" : "max-h-0"
        } ${darkMode ? "bg-slate-950/95 text-white" : "bg-white/95 text-slate-800"}`}
      >
        <ul className="flex flex-col space-y-3 px-6 py-4 font-medium">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block py-1 transition-all ${
                  pathname === link.href
                    ? "text-blue-600 dark:text-sky-400 font-semibold"
                    : "hover:text-blue-600 dark:hover:text-sky-400"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Нижняя панель */}
          <li className="flex justify-between items-center pt-4 border-t border-slate-200/50 dark:border-slate-700/50 mt-3">
            {/* 🌗 Тема */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            {user ? (
              <UserMenu mobile profile={profile || undefined} />
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-2 rounded-lg font-semibold transition-transform hover:scale-105 ${
                  darkMode
                    ? "bg-gradient-to-r from-blue-700 to-sky-500 text-white"
                    : "bg-gradient-to-r from-blue-600 to-sky-400 text-white"
                }`}
              >
                Войти
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
