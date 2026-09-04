import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'nxord.modules';

interface ModulesState {
  apr: boolean;
}

const DEFAULTS: ModulesState = { apr: false };

let state: ModulesState = load();
const listeners = new Set<() => void>();

function load(): ModulesState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ModulesState>) };
  } catch {
    return { ...DEFAULTS };
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* almacenamiento no disponible */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function setAprEnabled(enabled: boolean) {
  state = { ...state, apr: enabled };
  persist();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Sincroniza entre pestañas
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = load();
      emit();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): ModulesState {
  return state;
}

/** Estado de módulos opcionales de Nxord (persistido en localStorage). */
export function useModules() {
  const modules = useSyncExternalStore(subscribe, getSnapshot);
  const toggleApr = useCallback(() => setAprEnabled(!modules.apr), [modules.apr]);
  return { aprEnabled: modules.apr, toggleApr };
}
