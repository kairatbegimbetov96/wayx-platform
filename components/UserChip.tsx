"use client";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

export default function UserChip() {
  const { user } = useAuth();
  if (!user) return null;
  const avatar = user.photoURL ?? "/avatar-placeholder.png";
  return (
    <div className="flex items-center gap-2 rounded-full border px-2.5 py-1">
      <Image src={avatar} alt="avatar" width={20} height={20} className="rounded-full" />
      <span className="text-sm">{user.email}</span>
    </div>
  );
}
