import RoleGate from "@/components/RoleGate";

export default function AdminPage() {
  return (
    <RoleGate allow={['admin']}> 
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Администрирование</h1>
        <div className="grid md:grid-cols-3 gap-4">
          <a href="/admin/users" className="rounded-2xl border p-4 hover:bg-gray-50">
            <div className="font-medium">Пользователи</div>
            <div className="text-sm opacity-70">Списки, роли, поиск</div>
          </a>
          <a href="/admin/orders" className="rounded-2xl border p-4 hover:bg-gray-50">
            <div className="font-medium">Заказы</div>
            <div className="text-sm opacity-70">Модерация, статусы</div>
          </a>
          <a href="/admin/bids" className="rounded-2xl border p-4 hover:bg-gray-50">
            <div className="font-medium">Ставки</div>
            <div className="text-sm opacity-70">Проверка, блокировки</div>
          </a>
        </div>
        <p className="text-sm opacity-70">Для доступа необходима роль администратора.</p>
      </div>
    </RoleGate>
  )
}
