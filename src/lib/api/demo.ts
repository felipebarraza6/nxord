// Nxord — fixtures demo realistas (APR "Los Alerces", Región de Los Ríos)
import type {
  AlertTrigger,
  Branch,
  Client,
  Payment,
  TaxDocument,
  TelemetryDevice,
  TelemetryReading,
  TelemetryVariable,
} from './types';

export const demoBranches: Branch[] = [
  { id: 1, name: 'APR Los Alerces', commune: 'Panguipulli', region: 'Los Ríos' },
  { id: 2, name: 'APR Río Blanco', commune: 'Los Lagos', region: 'Los Ríos' },
  { id: 3, name: 'Comité de Agua Choshuenco', commune: 'Panguipulli', region: 'Los Ríos' },
];

export const demoDevices: TelemetryDevice[] = [
  { id: 101, name: 'Pozo profundo N°1', code: 'PZ-001', device_type: 'pozo', location: 'Sector El Roble', is_online: true, last_seen_at: minutesAgo(2), variables_count: 3 },
  { id: 102, name: 'Pozo profundo N°2', code: 'PZ-002', device_type: 'pozo', location: 'Sector El Roble', is_online: true, last_seen_at: minutesAgo(4), variables_count: 3 },
  { id: 103, name: 'Estanque acumulación 80 m³', code: 'EST-080', device_type: 'estanque', location: 'Cerro La Bandera', is_online: true, last_seen_at: minutesAgo(1), variables_count: 2 },
  { id: 104, name: 'Cámara de válvulas sector norte', code: 'VLV-N1', device_type: 'valvula', location: 'Camino Vecinal km 3', is_online: false, last_seen_at: hoursAgo(6), variables_count: 1 },
  { id: 105, name: 'Macromedidor salida estanque', code: 'MM-OUT-1', device_type: 'medidor', location: 'Cerro La Bandera', is_online: true, last_seen_at: minutesAgo(3), variables_count: 2 },
  { id: 106, name: 'Macromedidor entrada red', code: 'MM-IN-1', device_type: 'medidor', location: 'Planta de bombeo', is_online: true, last_seen_at: minutesAgo(5), variables_count: 2 },
  { id: 107, name: 'Sensor de presión sector sur', code: 'PRS-S2', device_type: 'medidor', location: 'Calle Los Ulmos', is_online: false, last_seen_at: hoursAgo(22), variables_count: 1 },
  { id: 108, name: 'Estanque reserva 25 m³', code: 'EST-025', device_type: 'estanque', location: 'Sector Altos del Lago', is_online: true, last_seen_at: minutesAgo(7), variables_count: 2 },
];

export const demoVariables: TelemetryVariable[] = [
  { id: 201, device: 101, name: 'Caudal', unit: 'l/s', last_value: 4.8, last_reading_at: minutesAgo(2) },
  { id: 202, device: 101, name: 'Nivel freático', unit: 'm', last_value: 18.2, last_reading_at: minutesAgo(2) },
  { id: 203, device: 102, name: 'Caudal', unit: 'l/s', last_value: 3.6, last_reading_at: minutesAgo(4) },
  { id: 204, device: 103, name: 'Nivel', unit: 'm', last_value: 3.4, last_reading_at: minutesAgo(1) },
  { id: 205, device: 103, name: 'Totalizador', unit: 'm³', last_value: 1284.6, last_reading_at: minutesAgo(1) },
  { id: 206, device: 105, name: 'Caudal', unit: 'l/s', last_value: 12.4, last_reading_at: minutesAgo(3) },
  { id: 207, device: 106, name: 'Caudal', unit: 'l/s', last_value: 9.1, last_reading_at: minutesAgo(5) },
  { id: 208, device: 107, name: 'Presión', unit: 'bar', last_value: 2.1, last_reading_at: hoursAgo(22) },
  { id: 209, device: 108, name: 'Nivel', unit: 'm', last_value: 2.2, last_reading_at: minutesAgo(7) },
];

// Serie de 24 h (cada hora) para una variable de caudal
export function demoReadings24h(variableId = 206): TelemetryReading[] {
  const base = 12.4;
  const out: TelemetryReading[] = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    const h = new Date(now - i * 3600_000);
    const diurnal = Math.sin(((h.getHours() - 14) / 24) * Math.PI * 2) * 2.4;
    const noise = Math.sin(i * 3.7) * 0.5;
    out.push({
      id: 9000 + i,
      variable: variableId,
      value: Math.round((base + diurnal + noise) * 10) / 10,
      recorded_at: h.toISOString(),
    });
  }
  return out;
}

export const demoAlerts: AlertTrigger[] = [
  { id: 301, rule_name: 'Caudal bajo umbral', device_name: 'MM-IN-1', severity: 'warning', message: 'Caudal 9,1 l/s bajo umbral de 10 l/s durante 30 min', triggered_at: minutesAgo(45), acknowledged: false },
  { id: 302, rule_name: 'Desconexión de dispositivo', device_name: 'PRS-S2', severity: 'critical', message: 'Sin reporte hace más de 12 horas', triggered_at: hoursAgo(10), acknowledged: false },
  { id: 303, rule_name: 'Nivel estanque alto', device_name: 'EST-080', severity: 'info', message: 'Nivel sobre 90 % de capacidad', triggered_at: hoursAgo(3), acknowledged: true },
  { id: 304, rule_name: 'Tasa de cambio anómala', device_name: 'PZ-002', severity: 'warning', message: 'Variación de caudal > 35 % en 1 hora', triggered_at: hoursAgo(7), acknowledged: true },
  { id: 305, rule_name: 'Desconexión de dispositivo', device_name: 'VLV-N1', severity: 'critical', message: 'Sin reporte hace más de 4 horas', triggered_at: hoursAgo(5), acknowledged: false },
];

export const demoClients: Client[] = [
  { id: 401, full_name: 'María Eugenia Calfuqueo', rut: '12.345.678-5', commune: 'Panguipulli', address: 'Los Aromos 214', meter_code: 'MED-0142', last_consumption_m3: 18.3, is_active: true },
  { id: 402, full_name: 'José Antonio Rebolledo', rut: '9.876.543-2', commune: 'Panguipulli', address: 'Camino Interior km 2', meter_code: 'MED-0087', last_consumption_m3: 22.7, is_active: true },
  { id: 403, full_name: 'Ana María Painemilla', rut: '15.234.567-8', commune: 'Choshuenco', address: 'Los Coihues 56', meter_code: 'MED-0231', last_consumption_m3: 12.1, is_active: true },
  { id: 404, full_name: 'Pedro Huenchullán', rut: '11.222.333-4', commune: 'Panguipulli', address: 'Ruta CH-201 km 5', meter_code: 'MED-0168', last_consumption_m3: 31.4, is_active: true },
  { id: 405, full_name: 'Rosa Eliana Curilef', rut: '13.456.789-0', commune: 'Los Lagos', address: 'Pasaje Los Notros 8', meter_code: 'MED-0310', last_consumption_m3: 9.8, is_active: true },
  { id: 406, full_name: 'Comité de Deportes El Roble', rut: '65.123.456-7', commune: 'Panguipulli', address: 'Multicancha s/n', meter_code: 'MED-0021', last_consumption_m3: 44.2, is_active: true },
  { id: 407, full_name: 'Héctor Sandoval Riffo', rut: '8.765.432-1', commune: 'Choshuenco', address: 'Av. Los Ulmos 130', meter_code: 'MED-0277', last_consumption_m3: 15.6, is_active: false },
];

export const demoDocuments: TaxDocument[] = [
  { id: 501, doc_type: 39, folio: 342, client_name: 'María Eugenia Calfuqueo', amount: 14820, issued_at: daysAgo(1), status: 'pagado' },
  { id: 502, doc_type: 39, folio: 341, client_name: 'José Antonio Rebolledo', amount: 17680, issued_at: daysAgo(1), status: 'pagado' },
  { id: 503, doc_type: 39, folio: 340, client_name: 'Ana María Painemilla', amount: 10450, issued_at: daysAgo(2), status: 'pendiente' },
  { id: 504, doc_type: 39, folio: 339, client_name: 'Pedro Huenchullán', amount: 23210, issued_at: daysAgo(2), status: 'pendiente' },
  { id: 505, doc_type: 33, folio: 118, client_name: 'Comité de Deportes El Roble', amount: 52480, issued_at: daysAgo(3), status: 'emitido' },
  { id: 506, doc_type: 39, folio: 338, client_name: 'Rosa Eliana Curilef', amount: 8930, issued_at: daysAgo(4), status: 'pagado' },
  { id: 507, doc_type: 61, folio: 22, client_name: 'Héctor Sandoval Riffo', amount: -12400, issued_at: daysAgo(6), status: 'emitido' },
  { id: 508, doc_type: 39, folio: 337, client_name: 'Héctor Sandoval Riffo', amount: 12400, issued_at: daysAgo(6), status: 'anulado' },
];

export const demoPayments: Payment[] = [
  { id: 601, document: 501, client_name: 'María Eugenia Calfuqueo', amount: 14820, paid_at: hoursAgo(5), method: 'transferencia' },
  { id: 602, document: 502, client_name: 'José Antonio Rebolledo', amount: 17680, paid_at: daysAgo(1), method: 'webpay' },
  { id: 603, document: 506, client_name: 'Rosa Eliana Curilef', amount: 8930, paid_at: daysAgo(2), method: 'efectivo' },
  { id: 604, client_name: 'Ana María Painemilla', amount: 10450, paid_at: daysAgo(8), method: 'transferencia' },
];

function minutesAgo(n: number) {
  return new Date(Date.now() - n * 60_000).toISOString();
}
function hoursAgo(n: number) {
  return new Date(Date.now() - n * 3600_000).toISOString();
}
function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}
