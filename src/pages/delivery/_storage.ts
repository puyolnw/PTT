export type DeliveryPOStatus = "จ่ายเงินแล้ว" | "รอรับของ" | "รับแล้ว" | "รอตรวจสอบ";

export type DeliveryTripStatus =
  | "สร้างออเดอร์แล้ว"
  | "รถออกเดินทาง"
  | "กำลังรับน้ำมันที่คลัง"
  | "กำลังมุ่งหน้าไปยังสาขา"
  | "ส่งมอบสำเร็จ";

export interface DeliveryPurchaseOrderItem {
  product: string;
  liters: number;
}

export interface DeliveryPurchaseOrder {
  id: string;
  createdAt: string;
  approveNo: string;
  invoiceNo: string;
  status: DeliveryPOStatus;
  items: DeliveryPurchaseOrderItem[];
  invoicePdfName?: string;
  receiptPdfName?: string;
}

export interface DeliveryTrip {
  id: string;
  createdAt: string;
  poId: string;
  driverName: string;
  truckHeadPlate: string;
  trailerPlate: string;
  status: DeliveryTripStatus;
  startOdometer?: number;
  endOdometer?: number;
  startOdometerPhotoName?: string;
  invoicePhotoName?: string;
  endOdometerPhotoName?: string;
  fueledLiters?: number;
}

const keys = {
  purchaseOrders: "delivery.purchaseOrders.v1",
  trips: "delivery.trips.v1",
  allocations: "delivery.allocations.v1",
};

export function uid(prefix: string) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${id}`;
}

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function storageKeys() {
  return keys;
}

export function loadPurchaseOrders(): DeliveryPurchaseOrder[] {
  return loadJSON<DeliveryPurchaseOrder[]>(keys.purchaseOrders, []);
}

export function savePurchaseOrders(list: DeliveryPurchaseOrder[]) {
  saveJSON(keys.purchaseOrders, list);
}

export function loadTrips(): DeliveryTrip[] {
  return loadJSON<DeliveryTrip[]>(keys.trips, []);
}

export function saveTrips(list: DeliveryTrip[]) {
  saveJSON(keys.trips, list);
}


