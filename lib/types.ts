
// lib/types.ts — единые типы данных CRM и Биржи
export type TransportMode = 'auto' | 'rail' | 'air' | 'sea';

export type RequestBase = {
  id?: string;
  createdAt?: number;
  updatedAt?: number;
  authorUid: string;
  status: 'draft' | 'published' | 'in_progress' | 'closed' | 'cancelled';
  mode: TransportMode;
  title: string;
  description?: string;
  currency: 'KZT' | 'USD' | 'EUR' | 'RUB';
  budgetMin?: number;
  budgetMax?: number;
  isAdvanced: boolean; // упрощённая/расширенная форма
  route: {
    fromCountry?: string;
    fromCity?: string;
    toCountry?: string;
    toCity?: string;
    distanceKm?: number;
  };
  shipment: {
    readyDate?: string; // ISO
    goodsType?: string; // тип груза
    weightKg?: number;
    volumeM3?: number;
    pallets?: number;
    hazmat?: boolean;
    fragile?: boolean;
    temperatureC?: number | null;
  };
  // специфические параметры по видам транспорта
  params?: AutoParams | RailParams | AirParams | SeaParams;
};

export type AutoParams = {
  truckType?: 'tent' | 'ref' | 'isotherm' | 'container' | 'open';
  bodyLengthM?: number;
  bodyWidthM?: number;
  bodyHeightM?: number;
  loading?: ('top' | 'side' | 'rear')[];
  customs?: boolean;
};

export type RailParams = {
  wagonType?: 'box' | 'flat' | 'tank' | 'refrigerator' | 'hopper';
  stations?: { from?: string; to?: string };
  containers?: number;
  containerType?: '20DC' | '40DC' | '40HC' | '45HC';
};

export type AirParams = {
  icaoFrom?: string;
  icaoTo?: string;
  awbRequired?: boolean;
  stackable?: boolean;
  nonStackable?: boolean;
};

export type SeaParams = {
  incoterms?: 'FOB' | 'CIF' | 'DAP' | 'EXW' | 'DDP';
  vessel?: string;
  containerType?: '20DC' | '40DC' | '40HC' | '45HC';
  containers?: number;
  portFrom?: string;
  portTo?: string;
};

export type Bid = {
  id?: string;
  requestId: string;
  supplierUid: string;
  amount: number;
  currency: 'KZT' | 'USD' | 'EUR' | 'RUB';
  comment?: string;
  createdAt?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  counterAmount?: number;
};

export type Deal = {
  id?: string;
  requestId: string;
  clientUid: string;
  supplierUid: string;
  agreedAmount: number;
  currency: 'KZT' | 'USD' | 'EUR' | 'RUB';
  createdAt?: number;
  status: 'new' | 'processing' | 'done' | 'cancelled';
};
