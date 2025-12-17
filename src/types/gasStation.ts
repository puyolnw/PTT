// Shared Types for Gas Station Module
// ใช้ร่วมกันระหว่างทุกหน้าในระบบปั๊มน้ำมัน

// ==================== Branch & Legal Entity ====================
export interface Branch {
  id: number;
  name: string;
  code: string;
  address: string;
  legalEntityName: string;
  legalEntityId?: number;
}

export interface LegalEntity {
  id: number;
  name: string;
  taxId?: string;
  address?: string;
}

// ==================== Oil Types ====================
export type OilType = 
  | "Premium Diesel"
  | "Diesel"
  | "Premium Gasohol 95"
  | "Gasohol 95"
  | "Gasohol 91"
  | "E20"
  | "E85"
  | "Gasohol E20";

// ==================== Order & Purchase Order ====================
export interface OrderItem {
  id: string;
  oilType: OilType;
  quantity: number;
  pricePerLiter: number;
  totalAmount: number;
}

export interface OrderSummaryItem {
  branchId: number;
  branchName: string;
  oilType: OilType;
  estimatedOrderAmount: number;
  systemRecommended: number;
  currentStock: number;
  lowStockAlert: boolean;
  quantityOrdered: number;
  legalEntityId: number;
  legalEntityName: string;
  status: "รออนุมัติ" | "อนุมัติแล้ว" | "ส่งแล้ว" | "ยกเลิก";
  requestedAt: string;
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  orderNo?: string;
  supplierOrderNo?: string;
  pricePerLiter?: number;
  totalAmount?: number;
  deliveryDate?: string;
  tolerancePercent?: number;
  isInterbranch?: boolean;
  truckCount?: number;
}

export interface PurchaseOrder {
  orderNo: string;
  supplierOrderNo?: string;
  billNo?: string;
  orderDate: string;
  deliveryDate: string;
  items: OrderItem[];
  totalAmount: number;
  branches: Array<{
    branchId: number;
    branchName: string;
    legalEntityName: string;
    address: string;
    items: OrderItem[];
    totalAmount: number;
    deliveryStatus: "รอส่ง" | "กำลังส่ง" | "ส่งสำเร็จ";
  }>;
  status: "รอเริ่ม" | "กำลังขนส่ง" | "ขนส่งสำเร็จ" | "ยกเลิก";
  approvedBy: string;
  approvedAt: string;
}

// ==================== Quotation ====================
export interface Quotation {
  id: string;
  quotationNo: string; // เลขที่ใบเสนอราคา (Running Number: เลขที่/เล่มที่)
  quotationDate: string;
  purchaseOrderNo?: string; // เชื่อมกับ PO
  fromBranchId: number;
  fromBranchName: string;
  toBranchId: number;
  toBranchName: string;
  items: OrderItem[];
  totalAmount: number;
  status: "draft" | "sent" | "confirmed" | "rejected" | "cancelled";
  confirmedAt?: string;
  confirmedBy?: string;
  createdAt: string;
  createdBy: string;
}

// ==================== Delivery Note ====================
export interface DeliveryNote {
  id: string;
  deliveryNoteNo: string; // เลขที่ใบส่งของ (Running Number)
  deliveryDate: string;
  quotationNo?: string; // เชื่อมกับใบเสนอราคา
  purchaseOrderNo?: string; // เชื่อมกับ PO
  transportNo?: string; // เชื่อมกับ Transport Delivery
  fromBranchId: number;
  fromBranchName: string;
  toBranchId: number;
  toBranchName: string;
  items: OrderItem[];
  totalAmount: number;
  // ข้อมูลรถและคนขับ
  truckId?: string;
  truckPlateNumber?: string;
  trailerId?: string;
  trailerPlateNumber?: string;
  driverId?: string;
  driverName?: string;
  // ข้อมูลการส่ง
  startOdometer?: number;
  endOdometer?: number;
  startTime?: string;
  endTime?: string;
  // ลายเซ็น
  senderSignature?: string; // ลายเซ็นผู้ส่ง (ต้นทาง)
  receiverSignature?: string; // ลายเซ็นผู้รับ (ปลายทาง)
  senderSignedAt?: string;
  receiverSignedAt?: string;
  status: "draft" | "sent" | "in-transit" | "delivered" | "cancelled";
  createdAt: string;
  createdBy: string;
}

// ==================== Receipt / Tax Invoice ====================
export interface Receipt {
  id: string;
  receiptNo: string; // เลขที่ใบเสร็จ (Running Number: เลขที่/เล่มที่)
  receiptDate: string;
  documentType: "ใบเสร็จรับเงิน" | "ใบกำกับภาษี" | "ใบเสร็จรับเงิน / ใบกำกับภาษี";
  // ข้อมูลลูกค้า
  customerName: string; // ชื่อ-นามสกุล หรือ ชื่อนิติบุคคล
  customerAddress: string;
  customerTaxId: string; // เลขประจำตัวผู้เสียภาษี (13 หลัก)
  // รายการสินค้า
  items: OrderItem[];
  // จำนวนเงิน
  amountBeforeVat: number; // ราคาก่อนภาษี
  vatAmount: number; // จำนวนภาษีมูลค่าเพิ่ม
  totalAmount: number; // ยอดรวมสุทธิ
  amountInWords: string; // คำอ่านภาษาไทย (เช่น ยี่สิบสี่บาทสี่สิบเก้าสตางค์)
  // การเชื่อมโยง
  purchaseOrderNo?: string;
  deliveryNoteNo?: string;
  quotationNo?: string;
  // ลายเซ็น
  receiverSignature?: string; // ลายเซ็นผู้รับเงิน (สำคัญมาก!)
  receiverSignedAt?: string;
  receiverName?: string;
  status: "draft" | "issued" | "paid" | "cancelled";
  createdAt: string;
  createdBy: string;
}

// ==================== Transport & Delivery ====================
export interface Compartment {
  chamber: number; // ช่องที่ (1-7)
  capacity: number; // ความจุ (ลิตร)
  oilType?: OilType; // ชนิดน้ำมัน (1 หลุม = 1 ชนิด)
  quantity?: number; // จำนวนลิตรที่จะลง
  destinationBranchId?: number;
  destinationBranchName?: string;
}

export interface DeliveryItem {
  id: string;
  branchId: number;
  branchName: string;
  branchCode: string;
  address: string;
  oilType: OilType;
  quantity: number;
  pricePerLiter: number;
  totalAmount: number;
  orderNo?: string;
  deliveryNoteNo?: string;
  status: "รอส่ง" | "กำลังส่ง" | "ส่งแล้ว";
}

export interface TransportDelivery {
  id: string;
  transportNo: string; // เลขขนส่ง (Transport ID)
  transportDate: string;
  transportTime: string;
  // รถและคนขับ
  truckId: string;
  truckPlateNumber: string;
  trailerId: string;
  trailerPlateNumber: string;
  driverId?: string;
  driverName: string;
  driverCode?: string;
  // ต้นทางและปลายทาง
  sourceBranchId: number;
  sourceBranchName: string;
  destinationBranchIds: number[]; // อาจมีหลายสาขา
  destinationBranchNames: string[];
  // รายการที่ต้องส่ง
  deliveryItems: DeliveryItem[];
  deliveryNoteIds?: string[]; // เชื่อมกับใบส่งของ
  // แผนการลงน้ำมัน
  compartments: Compartment[];
  // เลขไมล์
  startOdometer?: number;
  endOdometer?: number;
  totalDistance?: number; // ระยะทางรวม (กม.)
  // เวลา
  startTime?: string;
  endTime?: string;
  // สถานะ
  status: "รอเริ่ม" | "กำลังขนส่ง" | "ขนส่งสำเร็จ" | "ยกเลิก";
  notes?: string;
  createdAt: string;
  createdBy: string;
}

// ==================== Driver Job (for DriverApp) ====================
export interface DriverJob {
  id: string;
  transportNo: string;
  transportDate: string;
  transportTime: string;
  sourceBranchId: number;
  sourceBranchName: string;
  sourceAddress: string;
  destinationBranches: Array<{
    branchId: number;
    branchName: string;
    address: string;
    oilType: OilType;
    quantity: number;
    status: "รอส่ง" | "กำลังส่ง" | "ส่งแล้ว";
    deliveryConfirmation?: {
      confirmedAt: string;
      photos: string[];
      odometerReading: number;
      notes?: string;
    };
  }>;
  compartments: Compartment[];
  truckPlateNumber: string;
  trailerPlateNumber: string;
  driverId?: string;
  driverName?: string;
  status: "รอเริ่ม" | "ออกเดินทางแล้ว" | "รับน้ำมันแล้ว" | "จัดเรียงเส้นทางแล้ว" | "กำลังส่ง" | "ส่งเสร็จ";
  routeOrder?: number[]; // ลำดับการส่ง (branchId)
  startTrip?: {
    startedAt: string;
    startOdometer: number;
    startOdometerPhoto?: string;
  };
  pickupConfirmation?: {
    confirmedAt: string;
    photos: string[];
    odometerReading: number;
    notes?: string;
  };
}

// ==================== Oil Receipt ====================
export interface QualityTest {
  apiGravity: number;
  waterContent: number;
  temperature: number;
  color: string;
  testResult: "ผ่าน" | "ไม่ผ่าน";
  testedBy: string;
  testDateTime: string;
  notes?: string;
}

export interface DipMeasurement {
  oilType: OilType;
  tankNumber: number;
  quantityOrdered: number;
  beforeDip: number;
  afterDip: number;
  quantityReceived: number;
  differenceLiter: number;
  differenceAmount: number;
  pricePerLiter: number;
  gainLossReason?: string;
}

export interface OilReceipt {
  id: string;
  receiptNo: string;
  purchaseOrderNo: string;
  deliveryNoteNo: string;
  receiveDate: string;
  receiveTime: string;
  truckLicensePlate: string;
  driverName: string;
  driverLicense?: string;
  qualityTest: QualityTest;
  items: DipMeasurement[];
  attachments: Array<{
    id: string;
    type: "delivery_note" | "tax_invoice" | "photo" | "other";
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  }>;
  status: "draft" | "completed" | "cancelled";
  receivedBy: string;
  receivedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Tank Entry ====================
export interface TankEntryRecord {
  id: string;
  entryDate: string;
  entryTime: string;
  receiptNo?: string;
  purchaseOrderNo?: string;
  transportNo?: string;
  source: "PTT" | "Branch" | "Other";
  sourceBranchName?: string;
  truckLicensePlate?: string;
  driverName?: string;
  oilType: OilType;
  tankNumber: number;
  tankCode: string;
  quantity: number;
  beforeDip: number;
  afterDip: number;
  quantityReceived: number;
  pricePerLiter: number;
  totalAmount: number;
  pumpCode?: string;
  description?: string;
  status: "draft" | "completed" | "cancelled";
  recordedBy: string;
  recordedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isIncorrect?: boolean;
}

// ==================== Truck & Trailer ====================
export interface TruckProfile {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  engineNumber: string;
  chassisNumber: string;
  status: "active" | "inactive" | "maintenance";
  totalTrips: number;
  totalDistance: number;
  totalOilDelivered: number;
  lastTripDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  compatibleTrailers: string[];
  currentTrailerId?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  currentLocation?: string;
  homeDepot?: string;
  fuelEfficiency?: number;
  lastFuelEfficiencyUpdate?: string;
  totalMaintenanceCost?: number;
  lastMajorRepair?: string;
  lastMajorRepairDate?: string;
  color?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  notes?: string;
  lastOdometerReading?: number;
  lastOdometerDate?: string;
  compulsoryInsuranceExpiry?: string;
  vehicleTaxExpiry?: string;
  insuranceExpiry?: string;
  hazmatLicenseExpiry?: string;
}

export interface Trailer {
  id: string;
  plateNumber: string;
  capacity: number;
  status: "available" | "in-use" | "maintenance";
  brand?: string;
  model?: string;
  year?: number;
  chassisNumber?: string;
  length?: number;
  width?: number;
  height?: number;
  emptyWeight?: number;
  maxLoadWeight?: number;
  totalTrips?: number;
  totalOilDelivered?: number;
  lastTripDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  totalMaintenanceCost?: number;
  lastMajorRepair?: string;
  lastMajorRepairDate?: string;
  color?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentTruckId?: string;
  notes?: string;
  compulsoryInsuranceExpiry?: string;
  vehicleTaxExpiry?: string;
  insuranceExpiry?: string;
  hazmatLicenseExpiry?: string;
  // Compartment specifications
  compartments?: Array<{
    chamber: number;
    capacity: number;
  }>;
}

// ==================== Running Number ====================
export interface RunningNumber {
  documentType: "quotation" | "delivery_note" | "receipt";
  currentNumber: number; // เลขที่ปัจจุบัน (1-50)
  currentBook: number; // เล่มที่ปัจจุบัน
  lastUpdated: string;
}

// ==================== Helper Functions ====================
export function formatRunningNumber(number: number, book: number): string {
  return `${number}/${book}`;
}

// Note: convertNumberToThaiWords is implemented in @/utils/numberToThaiWords.ts
