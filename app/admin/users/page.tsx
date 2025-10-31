"use client";

import RoleGate from "@/components/RoleGate";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // ✅ используем уже инициализированный Firestore
import { useEffect, useState, useMemo } from "react";
import AdminTable from "@/components/AdminTable";

type Row = {
  uid: string;
  email: string;
  role: string;
  legalType: string;
  supplierType?: string;
  companyName?: string;
  bin?: string;
  verified?: boolean;
};

export default function AdminUsers() {
  return (
    <RoleGate allow={["admin"]}>
      <UsersInner />
    </RoleGate>
  );
}

function UsersInner() {
  const [rows, setRows] = useState<Row[]>([]);
  const [role, setRole] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [verified, setVerified] = useState<"all" | "yes" | "no">("all");

  useEffect(() => {
    const base = collection(db, "users");
    const q = query(base, orderBy("createdAt", "desc"), limit(200));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        uid: d.id,
        ...(d.data() as Record<string, any>),
      }));
      setRows(data as Row[]);
    });

    return () => unsub();
  }, []);

  // 🔍 Фильтрация пользователей
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const roleOk = role === "all" || r.role === role;
      const verOk = verified === "all" || (!!r.verified === (verified === "yes"));
      const text = `${r.email || ""} ${r.companyName || ""} ${r.bin || ""} ${r.supplierType || ""}`.toLowerCase();
      const sOk = search ? text.includes(search.toLowerCase()) : true;
      return roleOk && verOk && sOk;
    });
  }, [rows, role, verified, search]);

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        👥 Пользователи
      </h1>

      {/* 🔹 Фильтры */}
      <div className="grid md:grid-cols-4 gap-3">
        <select
          className="border rounded-xl p-3 bg-white dark:bg-gray-800 dark:border-gray-700"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="all">Все роли</option>
          <option value="client">Клиент</option>
          <option value="supplier">Поставщик</option>
          <option value="admin">Администратор</option>
        </select>

        <select
          className="border rounded-xl p-3 bg-white dark:bg-gray-800 dark:border-gray-700"
          value={verified}
          onChange={(e) => setVerified(e.target.value as any)}
        >
          <option value="all">Все статусы</option>
          <option value="yes">Верифицирован</option>
          <option value="no">Не верифицирован</option>
        </select>

        <input
          className="border rounded-xl p-3 md:col-span-2 bg-white dark:bg-gray-800 dark:border-gray-700"
          placeholder="Поиск (email, компания, БИН)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 📋 Таблица */}
      <AdminTable
        headers={[
          "UID",
          "Email",
          "Роль",
          "Тип лица",
          "Тип поставщика",
          "Компания",
          "БИН",
          "Вериф.",
        ]}
      >
        {filtered.map((r) => (
          <tr key={r.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
            <td className="px-3 py-2 font-mono text-xs text-gray-500">{r.uid}</td>
            <td className="px-3 py-2">{r.email}</td>
            <td className="px-3 py-2 capitalize">{r.role}</td>
            <td className="px-3 py-2">{r.legalType}</td>
            <td className="px-3 py-2">
              {r.role === "supplier" ? r.supplierType || "—" : "—"}
            </td>
            <td className="px-3 py-2">{r.companyName || "—"}</td>
            <td className="px-3 py-2">{r.bin || "—"}</td>
            <td className="px-3 py-2 text-center">
              {r.verified ? "✅" : "—"}
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
