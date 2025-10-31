
'use client';
import { useState } from 'react';
import type { TransportMode, RequestBase } from '@/lib/types';

const Section: React.FC<{title:string, children:any}> = ({ title, children }) => (
  <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-4 mb-4">
    <h3 className="font-semibold mb-3">{title}</h3>
    {children}
  </div>
);

export default function RequestForm({ onSubmit }: { onSubmit: (data: RequestBase)=>void }) {
  const [mode, setMode] = useState<TransportMode>('auto');
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [currency, setCurrency] = useState<'KZT'|'USD'|'EUR'|'RUB'>('KZT');

  const [base, setBase] = useState<RequestBase>({
    authorUid: '',
    status: 'published',
    mode: 'auto',
    title: '',
    description: '',
    currency: 'KZT',
    isAdvanced: false,
    route: {},
    shipment: {},
  } as any);

  const set = (path: string, value: any) => {
    setBase(prev => {
      const clone: any = { ...prev };
      const parts = path.split('.');
      let cur = clone;
      for (let i=0;i<parts.length-1;i++) cur = cur[parts[i]] ||= {};
      cur[parts.at(-1)!] = value;
      return clone;
    });
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e)=>{e.preventDefault(); onSubmit({ ...base, mode, currency, isAdvanced })}}
    >
      <Section title="Базовая информация">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span>Заголовок</span>
            <input className="input" value={base.title} onChange={e=>set('title', e.target.value)} required />
          </label>
          <label className="flex flex-col gap-1">
            <span>Режим</span>
            <select className="input" value={mode} onChange={e=>setMode(e.target.value as any)}>
              <option value="auto">Авто</option>
              <option value="rail">Ж/Д</option>
              <option value="air">Авиа</option>
              <option value="sea">Море</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span>Валюта</span>
            <select className="input" value={currency} onChange={e=>setCurrency(e.target.value as any)}>
              <option>KZT</option><option>USD</option><option>EUR</option><option>RUB</option>
            </select>
          </label>
          <label className="flex items-center gap-2 mt-6">
            <input type="checkbox" checked={isAdvanced} onChange={e=>setIsAdvanced(e.target.checked)} />
            <span>Расширенная форма</span>
          </label>
        </div>
        <label className="flex flex-col gap-1 mt-3">
          <span>Описание</span>
          <textarea className="input" rows={3} value={base.description||''} onChange={e=>set('description', e.target.value)} />
        </label>
      </Section>

      <Section title="Маршрут">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span>Откуда (страна)</span>
            <input className="input" onChange={e=>set('route.fromCountry', e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Откуда (город)</span>
            <input className="input" onChange={e=>set('route.fromCity', e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Куда (страна)</span>
            <input className="input" onChange={e=>set('route.toCountry', e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Куда (город)</span>
            <input className="input" onChange={e=>set('route.toCity', e.target.value)} />
          </label>
        </div>
      </Section>

      <Section title="Груз">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1">
            <span>Тип груза</span>
            <input className="input" onChange={e=>set('shipment.goodsType', e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Вес (кг)</span>
            <input type="number" className="input" onChange={e=>set('shipment.weightKg', +e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Объем (м³)</span>
            <input type="number" className="input" onChange={e=>set('shipment.volumeM3', +e.target.value)} />
          </label>
          {isAdvanced && <>
            <label className="flex flex-col gap-1">
              <span>Паллеты</span>
              <input type="number" className="input" onChange={e=>set('shipment.pallets', +e.target.value)} />
            </label>
            <label className="flex items-center gap-2 mt-6">
              <input type="checkbox" onChange={e=>set('shipment.hazmat', e.target.checked)} />
              <span>Опасный груз</span>
            </label>
            <label className="flex items-center gap-2 mt-6">
              <input type="checkbox" onChange={e=>set('shipment.fragile', e.target.checked)} />
              <span>Хрупкий</span>
            </label>
            <label className="flex flex-col gap-1">
              <span>Температура (°C)</span>
              <input type="number" className="input" onChange={e=>set('shipment.temperatureC', +e.target.value)} />
            </label>
          </>}
        </div>
      </Section>

      {/* Специфика по виду транспорта */}
      <Section title="Параметры транспорта">
        {mode === 'auto' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span>Тип кузова</span>
              <select className="input" onChange={e=>set('params.truckType', e.target.value)}>
                <option value="tent">Тент</option>
                <option value="ref">Реф</option>
                <option value="isotherm">Изотерм</option>
                <option value="container">Контейнер</option>
                <option value="open">Открытый</option>
              </select>
            </label>
            <label className="flex flex-col gap-1"><span>Длина (м)</span><input type="number" className="input" onChange={e=>set('params.bodyLengthM', +e.target.value)}/></label>
            <label className="flex flex-col gap-1"><span>Ширина (м)</span><input type="number" className="input" onChange={e=>set('params.bodyWidthM', +e.target.value)}/></label>
            <label className="flex flex-col gap-1"><span>Высота (м)</span><input type="number" className="input" onChange={e=>set('params.bodyHeightM', +e.target.value)}/></label>
            <label className="flex items-center gap-2 mt-6"><input type="checkbox" onChange={e=>set('params.customs', e.target.checked)}/><span>Таможня</span></label>
          </div>
        )}
        {mode === 'rail' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span>Тип вагона</span>
              <select className="input" onChange={e=>set('params.wagonType', e.target.value)}>
                <option value="box">Крытый</option><option value="flat">Платформа</option><option value="tank">Цистерна</option><option value="refrigerator">Реф</option><option value="hopper">Хоппер</option>
              </select>
            </label>
            <label className="flex flex-col gap-1"><span>Станция отгрузки</span><input className="input" onChange={e=>set('params.stations.from', e.target.value)}/></label>
            <label className="flex flex-col gap-1"><span>Станция назначения</span><input className="input" onChange={e=>set('params.stations.to', e.target.value)}/></label>
            <label className="flex flex-col gap-1"><span>Контейнеры</span><input type="number" className="input" onChange={e=>set('params.containers', +e.target.value)}/></label>
            <label className="flex flex-col gap-1">
              <span>Тип контейнера</span>
              <select className="input" onChange={e=>set('params.containerType', e.target.value)}>
                <option>20DC</option><option>40DC</option><option>40HC</option><option>45HC</option>
              </select>
            </label>
          </div>
        )}
        {mode === 'air' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1"><span>ICAO откуда</span><input className="input" onChange={e=>set('params.icaoFrom', e.target.value)}/></label>
            <label className="flex flex-col gap-1"><span>ICAO куда</span><input className="input" onChange={e=>set('params.icaoTo', e.target.value)}/></label>
            <label className="flex items-center gap-2 mt-6"><input type="checkbox" onChange={e=>set('params.awbRequired', e.target.checked)}/><span>Нужен AWB</span></label>
            <label className="flex items-center gap-2 mt-6"><input type="checkbox" onChange={e=>set('params.stackable', e.target.checked)}/><span>Stackable</span></label>
            <label className="flex items-center gap-2 mt-6"><input type="checkbox" onChange={e=>set('params.nonStackable', e.target.checked)}/><span>Non-Stackable</span></label>
          </div>
        )}
        {mode === 'sea' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1"><span>Инкотермс</span>
              <select className="input" onChange={e=>set('params.incoterms', e.target.value)}>
                <option>FOB</option><option>CIF</option><option>DAP</option><option>EXW</option><option>DDP</option>
              </select>
            </label>
            <label className="flex flex-col gap-1"><span>Тип контейнера</span>
              <select className="input" onChange={e=>set('params.containerType', e.target.value)}>
                <option>20DC</option><option>40DC</option><option>40HC</option><option>45HC</option>
              </select>
            </label>
            <label className="flex flex-col gap-1"><span>Контейнеры</span><input type="number" className="input" onChange={e=>set('params.containers', +e.target.value)}/></label>
            <label className="flex flex-col gap-1"><span>Порт отправления</span><input className="input" onChange={e=>set('params.portFrom', e.target.value)}/></label>
            <label className="flex flex-col gap-1"><span>Порт прибытия</span><input className="input" onChange={e=>set('params.portTo', e.target.value)}/></label>
          </div>
        )}
      </Section>

      <Section title="Бюджет">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1"><span>Мин. бюджет</span><input type="number" className="input" onChange={e=>set('budgetMin', +e.target.value)}/></label>
          <label className="flex flex-col gap-1"><span>Макс. бюджет</span><input type="number" className="input" onChange={e=>set('budgetMax', +e.target.value)}/></label>
        </div>
      </Section>

      <div className="flex justify-end">
        <button className="btn-primary">Создать заявку</button>
      </div>

      <style jsx>{`
        .input { @apply px-3 py-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 outline-none; }
        .btn-primary { @apply px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow; }
      `}</style>
    </form>
  );
}
