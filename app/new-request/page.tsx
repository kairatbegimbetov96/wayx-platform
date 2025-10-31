// app/new-request/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Truck,
  Plane,
  Ship,
  TrainFront,
  Send,
  Loader2,
  MapPin,
  ClipboardCheck,
  Sparkles,
  ThermometerSnowflake,
  Boxes,
  ShieldAlert,
  Landmark,
  MapPinned,
  Container,
  Factory,
  Building2,
  CalendarDays,
  Info,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RoutePreview from "@/components/RoutePreview";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/** Карта соответствий для хранения в Firestore */
const TYPE_MAP: Record<string, "auto" | "rail" | "air" | "sea" | "multi"> = {
  Авто: "auto",
  ЖД: "rail",
  Авиа: "air",
  Море: "sea",
  Мультимодальная: "multi",
};

/** Источники для автоподсказок без внешних API */
const CITY_SUGGEST = [
  "Алматы",
  "Астана",
  "Шымкент",
  "Караганда",
  "Атырау",
  "Актау",
  "Павлодар",
  "Уральск",
  "Костанай",
  "Талдыкорган",
  "Тараз",
  "Семей",
  "Кызылорда",
  "Петропавловск",
];
const RAIL_STATIONS = [
  "Алматы-1",
  "Алматы-2",
  "Нур-Султан-1",
  "Шымкент",
  "Актогай",
  "Достык",
  "Костанай",
  "Семей",
];
const AIR_PORTS = ["ALA", "NQZ", "CIT", "KZO", "PLX", "DMB", "AKX", "SCO"]; // IATA
const SEA_PORTS = ["Актау", "Курык", "Баку", "Туркменбаши", "Бандар-Аббас", "Новороссийск"];
const CONTAINER_TYPES = ["20DC", "40DC", "40HC", "45HC", "20RF", "40RF"];

export default function NewRequestPage() {
  /** Верхняя карточка: УПРОЩЁННЫЙ поиск */
  const [transport, setTransport] = useState<keyof typeof TYPE_MAP | "">("");
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    weight: "",
    description: "",
  });

  /** Нижняя карточка: РАСШИРЕННЫЕ параметры (отдельный переключатель видимости) */
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advModeExtended, setAdvModeExtended] = useState(true); // true = расширенные (10+), false = упрощённые (<=6)

  // Типо-специфичные параметры
  const [params, setParams] = useState<any>({
    // Авто
    auto_bodyType: "",
    auto_capacityTons: "",
    auto_tempControl: false,
    auto_loadingType: "",
    auto_adr: false,
    auto_palletized: false,
    auto_dimensions: "",
    auto_brand: "",

    // ЖД
    rail_stationFrom: "",
    rail_stationTo: "",
    rail_etsng: "",
    rail_gng: "",
    rail_wagonType: "",
    rail_wagonsCount: "",
    rail_transitStation: "",
    rail_dg: false,
    rail_customs: false,
    rail_insurance: false,

    // Авиа
    air_airportFrom: "",
    air_airportTo: "",
    air_chargeableWeight: "",
    air_volumeM3: "",
    air_commodityClass: "",
    air_dg: false,
    air_dimensions: "",
    air_priority: "",

    // Море
    sea_portFrom: "",
    sea_portTo: "",
    sea_containerType: "",
    sea_containersCount: "",
    sea_incoterms: "",
    sea_readyDate: "",
    sea_shipType: "",
    sea_imo: "",

    // Мультимодальная
    multi_legs: "Авто + ЖД",
    multi_transshipments: "",
    multi_customs: false,
    multi_insurance: false,
    multi_notes: "",
    multi_incoterms: "",
  });

  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const transportOptions = [
    { id: "Авто" as const, label: "Авто", icon: Truck, color: "from-blue-500 to-cyan-400" },
    { id: "ЖД" as const, label: "ЖД", icon: TrainFront, color: "from-green-500 to-emerald-400" },
    { id: "Авиа" as const, label: "Авиа", icon: Plane, color: "from-sky-500 to-indigo-400" },
    { id: "Море" as const, label: "Море", icon: Ship, color: "from-indigo-500 to-blue-500" },
    { id: "Мультимодальная" as const, label: "Мультимодальная", icon: Container, color: "from-amber-500 to-orange-400" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const setP = (name: string, value: any) => setParams((p: any) => ({ ...p, [name]: value }));

  /** Поля для нижнего блока: зависят от типа и режима (упрощённые/расширенные) */
  const advFields = useMemo(
    () => getFieldsByTransport(transport, advModeExtended),
    [transport, advModeExtended]
  );

  /** Поля маршрута меняются по виду перевозки */
  const route = getRouteByTransport(transport);

  // 🚀 Обработка формы (создаёт заявку с базовыми и, если открыты, расширенными параметрами)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transport) return (window as any).toast?.("⚠️ Выберите тип перевозки", "info");
    if (!form.origin || !form.destination)
      return (window as any).toast?.(`❗ Укажите ${route.fromLabel.toLowerCase()} и ${route.toLabel.toLowerCase()}`, "error");
    if (form.weight && Number.isNaN(Number(form.weight)))
      return (window as any).toast?.("⚠️ Вес должен быть числом", "error");

    setLoading(true);
    setSaved(false);
    setRouteInfo(null);

    // 🧭 Имитация расчёта маршрута (UI-оценка)
    setTimeout(async () => {
      const distance = Math.floor(Math.random() * 2000 + 300);
      const duration =
        transport === "Авиа"
          ? "1–2 дня"
          : transport === "Море"
          ? "10–15 дней"
          : transport === "ЖД"
          ? "5–7 дней"
          : transport === "Мультимодальная"
          ? "7–12 дней"
          : "3–5 дней";

      setRouteInfo({ distance, duration });

      try {
        const user = auth.currentUser;
        if (user) {
          await addDoc(collection(db, "requests"), {
            uid: user.uid,
            type: TYPE_MAP[transport], // 'auto' | 'rail' | ...
            transport, // читабельный вид
            base: {
              origin: form.origin.trim(),
              destination: form.destination.trim(),
              weightTons: form.weight ? Number(form.weight) : null,
              description: form.description?.trim() || "",
            },
            // Если расширенный блок открыт — сохраняем выбранные поля текущего режима
            advanced: showAdvanced
              ? {
                  mode: advModeExtended ? "extended" : "simple",
                  params: buildParamsPayload(transport, advModeExtended, params),
                }
              : null,
            status: "pending",
            createdAt: serverTimestamp(),
          });
          setSaved(true);
          (window as any).toast?.("✅ Заявка успешно создана!", "success");
        } else {
          (window as any).toast?.("⚠️ Войдите в систему, чтобы создать заявку", "info");
        }
      } catch (err) {
        console.error("Ошибка сохранения заявки:", err);
        (window as any).toast?.("❌ Ошибка при сохранении заявки", "error");
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Заголовок страницы */}
      <motion.h1
        className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-8 flex items-center justify-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Sparkles className="text-yellow-400" /> Создание новой заявки
      </motion.h1>

      {/* =================== УПРОЩЁННЫЙ ПОИСК (всегда сверху) =================== */}
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 sm:p-8 space-y-6 border border-gray-100 dark:border-gray-700 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.4 }}
      >
        <Header title="Базовая заявка (упрощённый поиск)" subtitle="Укажите ключевые параметры. Расширенные поля можно открыть ниже." />

        {/* Маршрут (простые поля с автоподсказками) */}
        <Section title="Маршрут" subtitle={route.subtitle} icon={<MapPin className="w-4 h-4" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label={route.fromLabel}
              name="origin"
              placeholder={route.fromPh}
              icon={<MapPin className="w-4 h-4 text-blue-500" />}
              value={form.origin}
              onChange={handleChange}
              list={route.listId}
              required
            />
            <Input
              label={route.toLabel}
              name="destination"
              placeholder={route.toPh}
              icon={<MapPin className="w-4 h-4 text-blue-500" />}
              value={form.destination}
              onChange={handleChange}
              list={route.listId}
              required
            />
          </div>

          {/* datalist — автоподсказки без API */}
          {route.listId === "cities" && <datalist id="cities">{CITY_SUGGEST.map((c) => <option value={c} key={c} />)}</datalist>}
          {route.listId === "railStations" && <datalist id="railStations">{RAIL_STATIONS.map((s) => <option value={s} key={s} />)}</datalist>}
          {route.listId === "airPorts" && <datalist id="airPorts">{AIR_PORTS.map((s) => <option value={s} key={s} />)}</datalist>}
          {route.listId === "seaPorts" && <datalist id="seaPorts">{SEA_PORTS.map((s) => <option value={s} key={s} />)}</datalist>}
        </Section>

        {/* Тип перевозки (в упрощённом — только выбор типа, без параметров) */}
        <Section title="Тип перевозки" subtitle="Выберите вид — срок/маршрут расчётно обновятся">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {transportOptions.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTransport(id)}
                className={`flex flex-col items-center justify-center border rounded-xl py-3 transition-all relative overflow-hidden group ${
                  transport === id ? "border-blue-600 scale-[1.03] shadow-lg" : "border-gray-300 dark:border-gray-700 hover:border-blue-400"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <Icon className={`h-6 w-6 mb-1 ${transport === id ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-300"}`} />
                <span className={`text-xs font-medium ${transport === id ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"}`}>{label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Груз (общие поля) */}
        <Section title="Груз" subtitle="Базовые сведения, видны во всех типах">
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Вес (тонн)" name="weight" type="number" placeholder="Например: 12" value={form.weight} onChange={handleChange} />
            <TextArea label="Описание груза" name="description" placeholder="Например: стройматериалы, контейнеры..." value={form.description} onChange={handleChange} />
          </div>
        </Section>

        {/* Действия (создать заявку) */}
        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition-all disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" /> Сохраняем...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" /> Создать заявку
              </>
            )}
          </button>
        </div>
      </motion.form>

      {/* Кнопка раскрытия/сворачивания расширенного поиска */}
      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition text-sm font-medium"
          aria-expanded={showAdvanced}
          aria-controls="advanced-panel"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showAdvanced ? "Скрыть расширенные параметры" : "Показать расширенные параметры"}
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* =================== РАСШИРЕННЫЙ ПОИСК (разворачивается ниже) =================== */}
      <AnimatePresence initial={false}>
        {showAdvanced && (
          <motion.div
            id="advanced-panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35 }}
            className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 sm:p-8 space-y-6 border border-gray-100 dark:border-gray-700"
          >
            <Header title="Расширенные параметры" subtitle="Профессиональные поля по типу перевозки — для точной ставки и подбора" />

            {/* Подсказка о текущем типе */}
            <Section
              title="Текущий тип перевозки"
              subtitle={transport ? "Поля ниже обновлены под выбранный тип" : "Сначала выберите тип перевозки в упрощённом блоке"}
              icon={<Info className="w-4 h-4" />}
              dense
            >
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Тип: </span>
                {transport || "—"}
              </div>
            </Section>

            {/* Переключатель режима внутри расширенного блока */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setAdvModeExtended(false)}
                className={`px-4 py-2 rounded-lg border transition ${
                  !advModeExtended ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                }`}
              >
                Упрощённые поля
              </button>
              <button
                type="button"
                onClick={() => setAdvModeExtended(true)}
                className={`px-4 py-2 rounded-lg border transition ${
                  advModeExtended ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                }`}
              >
                Расширенные поля
              </button>
            </div>

            {/* Динамические поля по типу для расширенного блока */}
            <Section title={`Параметры: ${transport || "—"}`} subtitle={advModeExtended ? "Расширенные" : "Упрощённые"} icon={<SlidersHorizontal className="w-4 h-4" />}>
              {transport ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    {advFields.map((f) =>
                      f.kind === "textarea" ? (
                        <TextArea key={f.name} label={f.label} name={f.name} placeholder={f.placeholder} value={params[f.name] ?? ""} onChange={(e: any) => setP(f.name, e.target.value)} />
                      ) : f.kind === "checkbox" ? (
                        <Checkbox key={f.name} label={f.label} checked={!!params[f.name]} onChange={(v) => setP(f.name, v)} hint={f.hint} />
                      ) : (
                        <Input
                          key={f.name}
                          label={f.label}
                          placeholder={f.placeholder}
                          value={params[f.name] ?? ""}
                          onChange={(e: any) => setP(f.name, e.target.value)}
                          type={f.type || "text"}
                          icon={f.icon}
                          list={f.listId}
                        />
                      )
                    )}
                  </div>

                  {/* Текстовые подсказки по типам */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-4 pt-2">
                    {transport === "Авто" && (
                      <>
                        <Hint icon={<Boxes className="w-3.5 h-3.5" />} text="Тип кузова (тент, реф, изотерм, борт)" />
                        <Hint icon={<ThermometerSnowflake className="w-3.5 h-3.5" />} text="Температурный режим для скоропорта" />
                        <Hint icon={<ShieldAlert className="w-3.5 h-3.5" />} text="ADR — опасные грузы" />
                      </>
                    )}
                    {transport === "ЖД" && (
                      <>
                        <Hint icon={<Landmark className="w-3.5 h-3.5" />} text="ЕТСНГ/ГНГ — код груза" />
                        <Hint icon={<Building2 className="w-3.5 h-3.5" />} text="Тип вагона: полувагон, крытый, платформа" />
                      </>
                    )}
                    {transport === "Авиа" && (
                      <>
                        <Hint icon={<Factory className="w-3.5 h-3.5" />} text="Класс груза (IATA Commodity Class)" />
                        <Hint icon={<ShieldAlert className="w-3.5 h-3.5" />} text="DG — Dangerous Goods" />
                      </>
                    )}
                    {transport === "Море" && (
                      <>
                        <Hint icon={<Container className="w-3.5 h-3.5" />} text="Тип контейнера (20DC, 40HC и т.д.)" />
                        <Hint icon={<CalendarDays className="w-3.5 h-3.5" />} text="Готовность груза, Incoterms" />
                      </>
                    )}
                    {transport === "Мультимодальная" && (
                      <>
                        <Hint icon={<MapPinned className="w-3.5 h-3.5" />} text="Пункты перегруза и плечи" />
                        <Hint icon={<ShieldAlert className="w-3.5 h-3.5" />} text="Таможня / Страхование" />
                      </>
                    )}
                  </div>

                  {/* datalist для проф. полей */}
                  <datalist id="railStations">{RAIL_STATIONS.map((s) => <option value={s} key={s} />)}</datalist>
                  <datalist id="airPorts">{AIR_PORTS.map((s) => <option value={s} key={s} />)}</datalist>
                  <datalist id="seaPorts">{SEA_PORTS.map((s) => <option value={s} key={s} />)}</datalist>
                  <datalist id="containerTypes">{CONTAINER_TYPES.map((s) => <option value={s} key={s} />)}</datalist>
                </>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">Сначала выберите тип перевозки в верхнем блоке.</div>
              )}
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📊 Итоги маршрута */}
      {routeInfo && (
        <motion.div
          className="mt-10 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-md text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">Итоги маршрута</h2>
          <div className="text-gray-700 dark:text-gray-300 text-lg space-y-1">
            <p>
              Расстояние: <strong>{routeInfo.distance} км</strong>
            </p>
            <p>
              Срок доставки: <strong>{routeInfo.duration}</strong>
            </p>
          </div>

          <RoutePreview origin={form.origin} destination={form.destination} transport={transport} />

          {saved && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
              <ClipboardCheck className="h-5 w-5" /> Заявка сохранена успешно!
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

/* ==================== ЛОГИКА ПОЛЕЙ ПО ТИПАМ ==================== */

type Field =
  | { name: string; label: string; placeholder?: string; kind?: "input"; type?: string; icon?: JSX.Element; listId?: string }
  | { name: string; label: string; placeholder?: string; kind: "textarea" }
  | { name: string; label: string; kind: "checkbox"; hint?: string };

function getFieldsByTransport(transport: string | "", extended: boolean): Field[] {
  if (!transport) return [];

  if (transport === "Авто") {
    return extended
      ? [
          { name: "auto_bodyType", label: "Тип кузова (тент/реф/изо/борт)" },
          { name: "auto_capacityTons", label: "Грузоподъёмность, т", type: "number", icon: <Boxes className="w-4 h-4 text-blue-500" /> },
          { name: "auto_dimensions", label: "Габариты (Д×Ш×В), м" },
          { name: "auto_loadingType", label: "Погрузка/Разгрузка (верх/бок/зад)" },
          { name: "auto_tempControl", label: "Требуется температурный режим", kind: "checkbox", hint: "для скоропортящихся" },
          { name: "auto_adr", label: "Опасный груз (ADR)", kind: "checkbox" },
          { name: "auto_palletized", label: "На поддонах", kind: "checkbox" },
          { name: "auto_brand", label: "Марка/тип ТС (опц.)" },
        ]
      : [
          { name: "auto_bodyType", label: "Тип кузова (тент/реф/изо/борт)" },
          { name: "auto_capacityTons", label: "Грузоподъёмность, т", type: "number" },
          { name: "auto_loadingType", label: "Погрузка (верх/бок/зад)" },
          { name: "auto_tempControl", label: "Темп. режим", kind: "checkbox" },
          { name: "auto_adr", label: "ADR", kind: "checkbox" },
        ];
  }

  if (transport === "ЖД") {
    return extended
      ? [
          { name: "rail_stationFrom", label: "Станция отправления (ЕСР/код)", listId: "railStations" },
          { name: "rail_stationTo", label: "Станция назначения (ЕСР/код)", listId: "railStations" },
          { name: "rail_etsng", label: "Код ЕТСНГ" },
          { name: "rail_gng", label: "Код ГНГ" },
          { name: "rail_wagonType", label: "Тип вагона (полувагон/крытый/платформа)" },
          { name: "rail_wagonsCount", label: "Кол-во вагонов", type: "number" },
          { name: "rail_transitStation", label: "Станция перевалки (опц.)", listId: "railStations" },
          { name: "rail_dg", label: "Опасный груз", kind: "checkbox" },
          { name: "rail_customs", label: "Таможня", kind: "checkbox" },
          { name: "rail_insurance", label: "Страхование", kind: "checkbox" },
        ]
      : [
          { name: "rail_stationFrom", label: "Станция отправления", listId: "railStations" },
          { name: "rail_stationTo", label: "Станция назначения", listId: "railStations" },
          { name: "rail_etsng", label: "Код ЕТСНГ" },
          { name: "rail_gng", label: "Код ГНГ" },
          { name: "rail_wagonType", label: "Тип вагона" },
          { name: "rail_wagonsCount", label: "Кол-во вагонов", type: "number" },
        ];
  }

  if (transport === "Авиа") {
    return extended
      ? [
          { name: "air_airportFrom", label: "Аэропорт отправления (IATA)", listId: "airPorts" },
          { name: "air_airportTo", label: "Аэропорт назначения (IATA)", listId: "airPorts" },
          { name: "air_chargeableWeight", label: "Расчётный вес (CW), кг", type: "number" },
          { name: "air_volumeM3", label: "Объём, м³", type: "number" },
          { name: "air_commodityClass", label: "Класс груза (IATA)" },
          { name: "air_dimensions", label: "Габариты (Д×Ш×В), см" },
          { name: "air_priority", label: "Срочность (Normal/Priority)" },
          { name: "air_dg", label: "Опасный груз (DG)", kind: "checkbox" },
        ]
      : [
          { name: "air_airportFrom", label: "Аэропорт отправления (IATA)", listId: "airPorts" },
          { name: "air_airportTo", label: "Аэропорт назначения (IATA)", listId: "airPorts" },
          { name: "air_chargeableWeight", label: "Вес, кг", type: "number" },
          { name: "air_volumeM3", label: "Объём, м³", type: "number" },
          { name: "air_dg", label: "DG", kind: "checkbox" },
        ];
  }

  if (transport === "Море") {
    return extended
      ? [
          { name: "sea_portFrom", label: "Порт отправления", listId: "seaPorts" },
          { name: "sea_portTo", label: "Порт назначения", listId: "seaPorts" },
          { name: "sea_containerType", label: "Тип контейнера", listId: "containerTypes" },
          { name: "sea_containersCount", label: "Кол-во контейнеров", type: "number" },
          { name: "sea_incoterms", label: "Инкотермс (FOB/CIF/DDP...)" },
          { name: "sea_readyDate", label: "Готовность груза (дата, опц.)", type: "date" },
          { name: "sea_shipType", label: "Тип судна (опц.)" },
          { name: "sea_imo", label: "IMO-код (опц.)" },
        ]
      : [
          { name: "sea_portFrom", label: "Порт отправления", listId: "seaPorts" },
          { name: "sea_portTo", label: "Порт назначения", listId: "seaPorts" },
          { name: "sea_containerType", label: "Тип контейнера", listId: "containerTypes" },
          { name: "sea_containersCount", label: "Кол-во контейнеров", type: "number" },
          { name: "sea_incoterms", label: "Инкотермс (опц.)" },
        ];
  }

  // Мультимодальная
  return extended
    ? [
        { name: "multi_legs", label: "Маршрут/плечи (пример: Авто→ЖД→Море)" },
        { name: "multi_transshipments", label: "Пункты перегруза" },
        { name: "multi_incoterms", label: "Инкотермс (опц.)" },
        { name: "multi_customs", label: "Таможенное оформление", kind: "checkbox" },
        { name: "multi_insurance", label: "Страхование", kind: "checkbox" },
        { name: "multi_notes", label: "Заметки по мультимодальной схеме", kind: "textarea" },
      ]
    : [
        { name: "multi_legs", label: "Схема (например, Авто + ЖД)" },
        { name: "multi_transshipments", label: "Пункты перегруза (опц.)" },
        { name: "multi_customs", label: "Таможня", kind: "checkbox" },
        { name: "multi_insurance", label: "Страхование", kind: "checkbox" },
      ];
}

/** Маршрутные поля/подсказки для верхнего блока */
function getRouteByTransport(transport: string | ""): {
  fromLabel: string;
  toLabel: string;
  fromPh: string;
  toPh: string;
  listId: "cities" | "railStations" | "airPorts" | "seaPorts";
  subtitle: string;
} {
  switch (transport) {
    case "ЖД":
      return {
        fromLabel: "Станция отправления",
        toLabel: "Станция назначения",
        fromPh: "Например: Алматы-1",
        toPh: "Например: Нур-Султан-1",
        listId: "railStations",
        subtitle: "Укажите железнодорожные станции (ЕСР/название)",
      };
    case "Авиа":
      return {
        fromLabel: "Аэропорт отправления (IATA)",
        toLabel: "Аэропорт назначения (IATA)",
        fromPh: "Например: ALA",
        toPh: "Например: NQZ",
        listId: "airPorts",
        subtitle: "Укажите коды IATA (например, ALA, NQZ)",
      };
    case "Море":
      return {
        fromLabel: "Порт отправления",
        toLabel: "Порт назначения",
        fromPh: "Например: Актау",
        toPh: "Например: Баку",
        listId: "seaPorts",
        subtitle: "Укажите порты (Каспий и далее)",
      };
    // Авто и Мультимодальная — города/адреса
    default:
      return {
        fromLabel: "Откуда (город/адрес)",
        toLabel: "Куда (город/адрес)",
        fromPh: "Алматы, ул. ...",
        toPh: "Астана, ул. ...",
        listId: "cities",
        subtitle: "Укажите пункт отправления и назначения",
      };
  }
}

/** Возвращаем только актуальные поля для записи в Firestore */
function buildParamsPayload(transport: string, extended: boolean, all: any) {
  const names = getFieldsByTransport(transport, extended).map((f) => f.name);
  const payload: Record<string, any> = {};
  for (const n of names) payload[n] = all[n] ?? (typeof all[n] === "boolean" ? false : "");
  return payload;
}

/* ==================== УНИВЕРСАЛЬНЫЕ UI-КОМПОНЕНТЫ ==================== */

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle ? <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p> : null}
    </div>
  );
}

function Section({
  title,
  subtitle,
  icon,
  children,
  dense,
}: {
  title: string;
  subtitle?: string;
  icon?: JSX.Element;
  children: React.ReactNode;
  dense?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm ${dense ? "p-5" : "p-6"}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon ? <div className="text-blue-600 dark:text-blue-400">{icon}</div> : null}
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      {subtitle ? <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{subtitle}</p> : null}
      {children}
    </div>
  );
}

function Hint({ icon, text }: { icon: JSX.Element; text: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      {text}
    </span>
  );
}

function Input({ label, icon, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-2.5">{icon}</div>}
        <input
          {...props}
          className={`w-full border border-gray-300 dark:border-gray-700 rounded-lg ${icon ? "pl-9" : "pl-4"} pr-4 py-2 bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none`}
        />
      </div>
    </div>
  );
}

function TextArea(props: any) {
  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium mb-1">{props.label}</label>
      <textarea
        {...props}
        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-transparent focus:ring-2 focus:ring-blue-500 h-24 focus:outline-none"
      />
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm">
        <span className="font-medium">{label}</span>
        {hint ? <span className="block text-xs text-gray-500 dark:text-gray-400">{hint}</span> : null}
      </span>
    </label>
  );
}
