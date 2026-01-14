export type PriceAdjustmentHistoryChange = {
  oilTypeCode: string;
  oilTypeName: string;
  oldPrice: number;
  newPrice: number;
  effectiveDate: string; // YYYY-MM-DD
  effectiveTime: string; // HH:mm
};

export type PriceAdjustmentHistoryEntry = {
  id: string;
  branch: string;
  appliedAtISO: string; // ISO datetime
  appliedBy: string;
  source: "ไฟล์ ปตท." | "กรอกมือ" | "API";
  changes: PriceAdjustmentHistoryChange[];
};

const STORAGE_KEY = "gasStation.priceAdjustmentHistory.v1";

function uid(prefix: string) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${id}`;
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadPriceAdjustmentHistory(): PriceAdjustmentHistoryEntry[] {
  return loadJSON<PriceAdjustmentHistoryEntry[]>(STORAGE_KEY, []);
}

export function addPriceAdjustmentHistoryEntry(
  entry: Omit<PriceAdjustmentHistoryEntry, "id">
): PriceAdjustmentHistoryEntry {
  const full: PriceAdjustmentHistoryEntry = { ...entry, id: uid("PAH") };
  const prev = loadPriceAdjustmentHistory();
  saveJSON(STORAGE_KEY, [full, ...prev]);
  return full;
}

export function clearPriceAdjustmentHistory() {
  saveJSON<PriceAdjustmentHistoryEntry[]>(STORAGE_KEY, []);
}

