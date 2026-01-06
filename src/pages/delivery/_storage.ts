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
  branchId: number; // Added
  createdAt: string;
  approveNo: string;
  invoiceNo: string;
  status: DeliveryPOStatus;
  items: DeliveryPurchaseOrderItem[];
  totalAmount?: number;
  netAmount?: number;
  invoicePdfName?: string;
  receiptPdfName?: string;
}

export interface DeliveryTrip {
  id: string;
  branchId: number; // Added
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

const defaultPos: DeliveryPurchaseOrder[] = [
  {
    id: "PO-1",
    branchId: 1,
    createdAt: "2024-12-10T10:00:00Z",
    approveNo: "APP-001",
    invoiceNo: "INV-001",
    status: "รอรับของ",
    items: [{ product: "ดีเซล", liters: 10000 }],
    totalAmount: 350000,
    netAmount: 348000,
  },
  {
    id: "PO-2",
    branchId: 2,
    createdAt: "2024-12-11T11:00:00Z",
    approveNo: "APP-002",
    invoiceNo: "INV-002",
    status: "จ่ายเงินแล้ว",
    items: [{ product: "เบนซิน", liters: 5000 }],
    totalAmount: 200000,
    netAmount: 198000,
  },
  {
    id: "PO-3",
    branchId: 3,
    createdAt: "2024-12-12T09:00:00Z",
    approveNo: "APP-003",
    invoiceNo: "INV-003",
    status: "รอรับของ",
    items: [{ product: "ดีเซล", liters: 8000 }],
    totalAmount: 280000,
    netAmount: 278000,
  },
  {
    id: "PO-4",
    branchId: 4,
    createdAt: "2024-12-13T14:00:00Z",
    approveNo: "APP-004",
    invoiceNo: "INV-004",
    status: "จ่ายเงินแล้ว",
    items: [{ product: "ดีเซล", liters: 12000 }],
    totalAmount: 420000,
    netAmount: 418000,
  },
  {
    id: "PO-5",
    branchId: 5,
    createdAt: "2024-12-14T08:30:00Z",
    approveNo: "APP-005",
    invoiceNo: "INV-005",
    status: "รอรับของ",
    items: [{ product: "เบนซิน", liters: 4000 }],
    totalAmount: 160000,
    netAmount: 158000,
  },
];

export function loadPurchaseOrders(): DeliveryPurchaseOrder[] {
  return loadJSON<DeliveryPurchaseOrder[]>(keys.purchaseOrders, defaultPos);
}

export function savePurchaseOrders(list: DeliveryPurchaseOrder[]) {
  saveJSON(keys.purchaseOrders, list);
}

const defaultTrips: DeliveryTrip[] = [
  {
    id: "TR-1",
    branchId: 1,
    createdAt: "2024-12-10T12:00:00Z",
    poId: "PO-1",
    driverName: "สมชาย ใจดี",
    truckHeadPlate: "70-1111",
    trailerPlate: "T-111",
    status: "กำลังมุ่งหน้าไปยังสาขา",
    startOdometer: 125000,
  },
  {
    id: "TR-2",
    branchId: 3,
    createdAt: "2024-12-12T10:00:00Z",
    poId: "PO-3",
    driverName: "มานะ อดทน",
    truckHeadPlate: "70-2222",
    trailerPlate: "T-222",
    status: "กำลังรับน้ำมันที่คลัง",
  },
  {
    id: "TR-3",
    branchId: 5,
    createdAt: "2024-12-14T09:00:00Z",
    poId: "PO-5",
    driverName: "วิชัย สู้ชีวิต",
    truckHeadPlate: "70-3333",
    trailerPlate: "T-333",
    status: "สร้างออเดอร์แล้ว",
  },
];

export function loadTrips(): DeliveryTrip[] {
  return loadJSON<DeliveryTrip[]>(keys.trips, defaultTrips);
}

export function saveTrips(list: DeliveryTrip[]) {
  saveJSON(keys.trips, list);
}


