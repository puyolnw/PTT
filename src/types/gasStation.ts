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

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "file";
  url: string;
  size?: number;
}

export interface PurchaseOrder {
  // เลขอ้างอิงจากเอกสารจริง (optional)
  approveNo?: string; // ใบอนุมัติขายเลขที่
  contractNo?: string; // Contract No.
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
  attachments?: Attachment[]; // หลักฐาน (รูปภาพและไฟล์)
}

// ==================== Internal Oil Order (สั่งซื้อน้ำมันภายในปั๊ม) ====================
export interface InternalOilOrder {
  id: string;
  orderNo: string; // เลขที่ออเดอร์ (Running Number)
  orderDate: string; // วันที่สั่งซื้อ
  requestedDate: string; // วันที่ต้องการรับ
  fromBranchId: number; // ปั๊มที่สั่งซื้อ
  fromBranchName: string;
  items: Array<{
    oilType: OilType;
    quantity: number; // จำนวนลิตร
    pricePerLiter: number;
    totalAmount: number;
  }>;
  totalAmount: number;
  status: "รออนุมัติ" | "อนุมัติแล้ว" | "กำลังจัดส่ง" | "ส่งแล้ว" | "ยกเลิก";
  requestedBy: string; // ผู้สั่งซื้อ
  requestedAt: string;
  approvedBy?: string; // ผู้อนุมัติ (พี่นิด)
  approvedAt?: string;
  // ข้อมูลการจัดส่ง (จัดการโดยพี่นิด)
  assignedFromBranchId?: number; // ปั๊มที่จะส่งน้ำมันให้
  assignedFromBranchName?: string;
  transportNo?: string; // เลขที่ขนส่ง
  deliveryDate?: string; // วันที่ส่ง
  notes?: string;
}

// ==================== Quotation ====================
export interface Quotation {
  id: string;
  quotationNo: string; // เลขที่ใบเสนอราคา (Running Number: เลขที่/เล่มที่)
  quotationDate: string;
  purchaseOrderNo?: string; // เชื่อมกับ PO
  fromBranchId: number; // สาขาใหญ่ (ผู้ขาย/ผู้ส่ง)
  fromBranchName: string;
  // รายการสาขาย่อยที่สั่งน้ำมัน (หลายปั๊ม)
  branches: Array<{
    branchId: number;
    branchName: string;
    legalEntityName: string;
    address: string;
    items: OrderItem[]; // รายการน้ำมันที่ปั๊มนี้สั่ง
    totalAmount: number;
    status: "รอยืนยัน" | "ยืนยันแล้ว" | "ยกเลิก";
    confirmedAt?: string;
    confirmedBy?: string;
  }>;
  // รายการรวมทั้งหมด
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
  transportNo?: string;
  deliveryDate: string;
  purchaseOrderNo?: string; // เชื่อมกับ PO
  quotationNo?: string; // เชื่อมกับ Quotation
  fromBranchId: number;
  fromBranchName: string;
  toBranchId: number;
  toBranchName: string;
  items: OrderItem[];
  totalAmount: number;
  truckPlateNumber?: string;
  trailerPlateNumber?: string;
  driverName?: string;
  status: "draft" | "sent" | "delivered" | "cancelled";
  signedBy?: string; // ผู้รับ
  signedAt?: string;
  senderSignature?: string; // ผู้ส่ง
  senderSignedAt?: string;
  startOdometer?: number;
  endOdometer?: number;
  receiverName?: string;
  receiverSignedAt?: string;
  createdAt: string;
  createdBy: string;
}

// ==================== Receipt ====================
export interface Receipt {
  id: string;
  receiptNo: string; // เลขที่ใบเสร็จ (Running Number)
  receiptDate: string;
  deliveryNoteNo?: string; // เชื่อมกับ Delivery Note
  purchaseOrderNo?: string;
  quotationNo?: string;
  customerName: string;
  customerAddress: string;
  customerTaxId?: string;
  items: OrderItem[];
  totalAmount: number;
  vatAmount: number;
  grandTotal: number;
  receiverName?: string;
  amountInWords?: string;
  documentType: "ใบเสร็จรับเงิน" | "ใบกำกับภาษี";
  status: "draft" | "issued" | "cancelled";
  issuedAt?: string;
  issuedBy?: string;
  createdAt: string;
  createdBy: string;
}

// ==================== Oil Receipt (ใบรับของ) ====================
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
  tankNumber: number;
  beforeDip: number;
  afterDip: number;
  quantityReceived: number;
}

export interface OilReceipt {
  id: string;
  receiptNo: string; // เลขที่ใบรับของ (Running Number)
  deliveryNoteNo: string; // เลขที่ใบส่งของ
  purchaseOrderNo?: string;
  receiveDate: string;
  receiveTime: string;
  truckLicensePlate: string;
  driverName: string;
  driverLicense?: string;
  qualityTest: QualityTest;
  items: Array<{
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
  }>;
  totalAmount: number;
  status: "draft" | "completed" | "cancelled";
  notes?: string;
  updatedAt?: string;
  createdAt: string;
  createdBy: string;
}

// ==================== Tank Entry Record ====================
export interface TankEntryRecord {
  id: string;
  entryNo: string; // เลขที่บันทึก (Running Number)
  entryDate: string;
  entryTime: string;
  tankNumber: number;
  oilType: OilType;
  quantity: number; // ลิตร
  source: "รับจากปตท" | "รับจากสาขาอื่น" | "ย้ายจากหลุมอื่น" | "อื่นๆ";
  sourceBranchId?: number;
  sourceBranchName?: string;
  deliveryNoteNo?: string;
  oilReceiptNo?: string;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
}

// ==================== Compartment (ช่องบรรทุกน้ำมัน) ====================
export interface Compartment {
  id: string;
  chamber?: number;
  compartmentNumber: number; // หมายเลขช่อง (1, 2, 3, ...)
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
  orderType?: "internal" | "external"; // ประเภทเที่ยว: ภายในปั๊ม หรือ รับจาก PTT
  // สำหรับ Internal Transport
  internalOrderNo?: string; // เลขที่ออเดอร์ภายในปั๊ม
  // สำหรับ External Transport (PTT)
  purchaseOrderNo?: string; // เลขที่ใบสั่งซื้อ
  pttQuotationNo?: string; // เลขที่ใบเสนอราคาจาก PTT
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
    startFuel?: number; // น้ำมันตอนเริ่มต้น
  };
  pickupConfirmation?: {
    confirmedAt: string;
    photos: string[];
    odometerReading: number;
    notes?: string;
    senderSignature?: string; // Added
    senderSignedAt?: string; // Added
  };
  // ขั้นตอนยืนยันออเดอร์ก่อนรับน้ำมัน (กรอกเลขที่คลัง + ถ่ายรูปหลักฐาน)
  warehouseConfirmation?: {
    confirmedAt: string;
    warehouseNo: string; // เลขที่คลัง
    depotDocumentNo?: string; // เลขเอกสารจากคลัง (เช่น เลขบิล/ใบส่งของ)
    photos: string[];
    notes?: string;
  };
  endOdometer?: number; // Added
  notes?: string; // Added
  createdAt?: string; // Made optional
  createdBy?: string; // Made optional
  updatedAt?: string; // Added
}

// ==================== Running Number ====================
export interface RunningNumber {
  id: string;
  documentType: "quotation" | "delivery-note" | "receipt" | "oil-receipt" | "tank-entry" | "internal-oil-order";
  prefix: string;
  year: number;
  month?: number;
  currentNumber: number;
  lastUpdated: string;
}
