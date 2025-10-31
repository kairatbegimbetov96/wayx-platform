"use client";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function TopBarSession() {
  const { user, loading, profile } = useAuth();

  return (
    <div className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between">
        {loading ? (
          <div className="text-xs text-muted-foreground">Проверяем сессию…</div>
        ) : user ? (
          <div className="text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1">
              <span className="size-2 rounded-full bg-emerald-500" /> Вы вошли как <b>{user.email}</b> {profile?.role ? `• ${profile.role}` : ""}
            </span>
          </div>
        ) : (
          <div className="text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1">
              <span className="size-2 rounded-full bg-rose-500" /> Не авторизованы
            </span>
          </div>
        )}
        <div className="text-xs text-muted-foreground hidden sm:block">
          {user ? <Link href="/profile" className="underline">Профиль</Link> : <Link href="/auth/login" className="underline">Войти</Link>}
        </div>
      </div>
    </div>
  );
}
