// Nxord — tipos de la capa de datos (API Yggdra vía DRF)

export interface Branch {
  id: number;
  name: string;
  commune?: string;
  region?: string;
}

export interface TelemetryDevice {
  id: number;
  name: string;
  code: string;
  device_type: string; // pozo | estanque | medidor | valvula
  location?: string;
  is_online: boolean;
  last_seen_at?: string;
  variables_count?: number;
}

export interface TelemetryVariable {
  id: number;
  device: number;
  name: string; // caudal | nivel | presion | totalizador
  unit: string; // l/s, m, bar, m3
  last_value?: number;
  last_reading_at?: string;
}

export interface TelemetryReading {
  id: number;
  variable: number;
  value: number;
  recorded_at: string;
}

export interface AlertTrigger {
  id: number;
  rule_name: string;
  device_name?: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggered_at: string;
  acknowledged: boolean;
}

export interface Client {
  id: number;
  full_name: string;
  rut: string;
  commune: string;
  address?: string;
  meter_code?: string;
  last_consumption_m3?: number;
  is_active: boolean;
}

export interface TaxDocument {
  id: number;
  doc_type: 33 | 39 | 56 | 61; // factura | boleta | ND | NC
  folio: number;
  client_name: string;
  amount: number;
  issued_at: string;
  status: 'emitido' | 'pagado' | 'pendiente' | 'anulado';
}

export interface Payment {
  id: number;
  document?: number;
  client_name: string;
  amount: number;
  paid_at: string;
  method: 'transferencia' | 'efectivo' | 'tarjeta' | 'webpay';
}

export interface Paginated<T> {
  count: number;
  results: T[];
}
