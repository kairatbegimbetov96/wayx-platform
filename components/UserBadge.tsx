'use client';
import { WayxUserProfile } from '@/types/user';

export default function UserBadge({ profile }: { profile: WayxUserProfile }) {
  const roleMap: Record<string, string> = {
    client: 'Заказчик',
    supplier: 'Поставщик',
    admin: 'Администратор',
  };
  const legMap: Record<string, string> = {
    individual: 'Физ. лицо',
    company: 'Юр. лицо'
  };
  const suppMap: Record<string, string> = {
    logistics: 'Логистическая компания',
    expeditor: 'Экспедиторская компания',
    driver: 'Водитель',
    logist: 'Логист'
  };
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-1 text-sm">
      <span className="font-medium">{roleMap[profile.role]}</span>
      <span className="opacity-70">•</span>
      <span>{legMap[profile.legalType]}</span>
      {profile.role === 'supplier' && profile.supplierType && (<>
        <span className="opacity-70">•</span>
        <span>{suppMap[profile.supplierType]}</span>
      </>)}
    </div>
  );
}
