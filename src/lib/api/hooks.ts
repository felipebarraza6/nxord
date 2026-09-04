// Nxord — hooks react-query con fallback a datos demo
import { useQuery } from '@tanstack/react-query';
import { apiList, getToken } from './client';
import {
  demoAlerts,
  demoBranches,
  demoClients,
  demoDevices,
  demoDocuments,
  demoPayments,
  demoReadings24h,
  demoVariables,
} from './demo';
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

export interface QueryResult<T> {
  data: T;
  isDemo: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

async function withDemo<T>(apiCall: () => Promise<T>, demoData: T): Promise<{ data: T; isDemo: boolean }> {
  // Sin token configurado no intentamos la API: directo a demo
  if (!getToken()) return { data: demoData, isDemo: true };
  try {
    const data = await apiCall();
    return { data, isDemo: false };
  } catch {
    return { data: demoData, isDemo: true };
  }
}

function wrap<T>(q: { data?: { data: T; isDemo: boolean }; isLoading: boolean; isError: boolean; refetch: () => void }, fallback: T): QueryResult<T> {
  return {
    data: q.data?.data ?? fallback,
    isDemo: q.data?.isDemo ?? true,
    isLoading: q.isLoading,
    isError: q.isError,
    refetch: q.refetch,
  };
}

const RETRY = { retry: 1, staleTime: 30_000 } as const;

export function useBranches(): QueryResult<Branch[]> {
  const q = useQuery({
    queryKey: ['branches'],
    queryFn: () => withDemo(() => apiList<Branch>('accounts/branches/'), demoBranches),
    ...RETRY,
  });
  return wrap(q, demoBranches);
}

export function useDevices(): QueryResult<TelemetryDevice[]> {
  const q = useQuery({
    queryKey: ['devices'],
    queryFn: () => withDemo(() => apiList<TelemetryDevice>('iot-telemetry/devices/'), demoDevices),
    ...RETRY,
  });
  return wrap(q, demoDevices);
}

export function useVariables(deviceId?: number): QueryResult<TelemetryVariable[]> {
  const q = useQuery({
    queryKey: ['variables', deviceId ?? 'all'],
    queryFn: () =>
      withDemo(
        () => apiList<TelemetryVariable>(`iot-telemetry/variables/${deviceId ? `?device=${deviceId}` : ''}`),
        deviceId ? demoVariables.filter((v) => v.device === deviceId) : demoVariables,
      ),
    ...RETRY,
  });
  return wrap(q, deviceId ? demoVariables.filter((v) => v.device === deviceId) : demoVariables);
}

export function useReadings24h(variableId?: number): QueryResult<TelemetryReading[]> {
  const demo = demoReadings24h(variableId ?? 206);
  const q = useQuery({
    queryKey: ['readings24h', variableId ?? 206],
    queryFn: () =>
      withDemo(
        () => apiList<TelemetryReading>(`iot-telemetry/readings/?variable=${variableId ?? 206}&hours=24`),
        demo,
      ),
    ...RETRY,
  });
  return wrap(q, demo);
}

export function useAlertTriggers(): QueryResult<AlertTrigger[]> {
  const q = useQuery({
    queryKey: ['alert-triggers'],
    queryFn: () => withDemo(() => apiList<AlertTrigger>('iot-telemetry/alert-triggers/'), demoAlerts),
    ...RETRY,
  });
  return wrap(q, demoAlerts);
}

export function useClients(): QueryResult<Client[]> {
  const q = useQuery({
    queryKey: ['clients'],
    queryFn: () => withDemo(() => apiList<Client>('customers/clients/'), demoClients),
    ...RETRY,
  });
  return wrap(q, demoClients);
}

export function useTaxDocuments(): QueryResult<TaxDocument[]> {
  const q = useQuery({
    queryKey: ['tax-documents'],
    queryFn: () => withDemo(() => apiList<TaxDocument>('finance/tax-documents/'), demoDocuments),
    ...RETRY,
  });
  return wrap(q, demoDocuments);
}

export function usePayments(): QueryResult<Payment[]> {
  const q = useQuery({
    queryKey: ['payments'],
    queryFn: () => withDemo(() => apiList<Payment>('finance/payments/'), demoPayments),
    ...RETRY,
  });
  return wrap(q, demoPayments);
}

// Estado global de conexión (derivado de cualquier query)
export function useApiStatus(): { isDemo: boolean } {
  const devices = useDevices();
  return { isDemo: devices.isDemo };
}
