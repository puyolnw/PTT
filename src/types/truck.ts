export interface Trailer {
    id: string;
    plateNumber: string; // ทะเบียนรถส่วนหาง (Tail License Plate)
    capacity: number; // ความจุ (ลิตร)
    status: "available" | "in-use" | "maintenance";
    // Physical Specifications
    brand?: string; // ยี่ห้อ
    model?: string; // รุ่น
    year?: number; // ปีที่ผลิต
    chassisNumber?: string; // เลขตัวถัง
    // Dimensions & Weight
    length?: number; // ความยาว (เมตร)
    width?: number; // ความกว้าง (เมตร)
    height?: number; // ความสูง (เมตร)
    emptyWeight?: number; // น้ำหนักเปล่า (กก.)
    maxLoadWeight?: number; // น้ำหนักบรรทุกสูงสุด (กก.)
    // Usage Statistics
    totalTrips?: number; // จำนวนเที่ยวทั้งหมด
    totalOilDelivered?: number; // ปริมาณน้ำมันที่ส่งทั้งหมด (ลิตร)
    lastTripDate?: string; // วันที่เดินทางล่าสุด
    // Maintenance
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    totalMaintenanceCost?: number; // ค่าซ่อมบำรุงสะสม (บาท)
    lastMajorRepair?: string; // การซ่อมใหญ่ครั้งล่าสุด
    lastMajorRepairDate?: string; // วันที่ซ่อมใหญ่ครั้งล่าสุด
    // Additional Info
    color?: string; // สีหาง
    purchaseDate?: string; // วันที่ซื้อ
    purchasePrice?: number; // ราคาซื้อ (บาท)
    currentTruckId?: string; // รถที่ใช้อยู่ตอนนี้
    notes?: string; // หมายเหตุเพิ่มเติม
    // เอกสารประจำหาง
    compulsoryInsuranceExpiry?: string; // พ.ร.บ.
    vehicleTaxExpiry?: string; // ทะเบียนรถ/ป้ายวงกลม
    insuranceExpiry?: string; // ประกันภัย
    hazmatLicenseExpiry?: string; // ใบอนุญาตขนส่งวัตถุอันตราย
}

export interface TruckProfile {
    id: string;
    plateNumber: string; // ทะเบียนรถส่วนหัว (Head License Plate)
    brand: string;
    model: string;
    year: number;
    engineNumber: string;
    chassisNumber: string;
    status: "active" | "inactive" | "maintenance";
    totalTrips: number;
    totalDistance: number; // กิโลเมตร
    totalOilDelivered: number; // ลิตร
    lastTripDate?: string;
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    compatibleTrailers: string[]; // ID ของหางที่ใช้ได้
    currentTrailerId?: string; // หางที่ใช้อยู่ตอนนี้
    // Driver Assignment
    assignedDriverId?: string; // ID ของคนขับประจำ
    assignedDriverName?: string; // ชื่อคนขับประจำ
    // Location & Depot
    currentLocation?: string; // ที่จอดรถปัจจุบัน/คลัง
    homeDepot?: string; // คลังหลัก/ฐานที่ตั้ง
    // Fuel Efficiency
    fuelEfficiency?: number; // อัตราการใช้น้ำมันเฉลี่ย (กม./ลิตร)
    lastFuelEfficiencyUpdate?: string; // วันที่อัปเดตข้อมูลล่าสุด
    // Maintenance History (summary)
    totalMaintenanceCost?: number; // ค่าซ่อมบำรุงสะสม (บาท)
    lastMajorRepair?: string; // การซ่อมใหญ่ครั้งล่าสุด
    lastMajorRepairDate?: string; // วันที่ซ่อมใหญ่ครั้งล่าสุด
    // Additional Info
    color?: string; // สีรถ
    purchaseDate?: string; // วันที่ซื้อ
    purchasePrice?: number; // ราคาซื้อ (บาท)
    notes?: string; // หมายเหตุเพิ่มเติม
    // Odometer tracking
    lastOdometerReading?: number; // เลขไมล์ล่าสุด (กม.)
    lastOdometerDate?: string; // วันที่บันทึกไมล์ล่าสุด
    // เอกสารประจำรถหัวลาก
    compulsoryInsuranceExpiry?: string; // พ.ร.บ.
    vehicleTaxExpiry?: string; // ทะเบียนรถ/ป้ายวงกลม
    insuranceExpiry?: string; // ประกันภัย
    hazmatLicenseExpiry?: string; // ใบอนุญาตขนส่งวัตถุอันตราย
}

export interface MaintenanceRecord {
    id: string;
    vehicleId: string; // ID ของรถหรือหาง
    vehicleType: "truck" | "trailer"; // ประเภทยานพาหนะ
    date: string; // วันที่ซ่อม
    type: "routine" | "repair" | "major"; // ประเภทการซ่อม
    description: string; // รายละเอียดงานซ่อม
    cost: number; // ค่าใช้จ่าย (บาท)
    mileage?: number; // เลขไมล์ขณะซ่อม (สำหรับรถ)
    performedBy: string; // ช่างผู้ทำ/ศูนย์บริการ
    nextServiceDue?: string; // วันที่ต้องเข้าซ่อมครั้งถัดไป
    notes?: string; // หมายเหตุ
}

export interface TruckOrder {
    id: string;
    orderNo: string; // เลขที่รอบรับน้ำมัน
    orderDate: string;
    purchaseOrderNo?: string; // เลขที่ใบสั่งซื้อที่เชื่อมกับ PO
    transportNo: string; // เลขที่ขนส่ง (TR-YYYYMMDD-XXX)
    truckId: string;
    truckPlateNumber: string;
    trailerId: string;
    trailerPlateNumber: string;
    driver: string;
    fromBranch: string;
    toBranch: string;
    oilType: string;
    quantity: number; // ลิตร
    status: "draft" | "quotation-recorded" | "ready-to-pickup" | "picking-up" | "completed" | "cancelled";

    // PTT Quotation fields (ใบเสนอราคาจาก ปตท.)
    pttQuotationNo?: string; // เลขที่ใบเสนอราคาจาก ปตท.
    pttQuotationDate?: string; // วันที่ใบเสนอราคา
    pttQuotationAmount?: number; // มูลค่ารวมในใบเสนอราคา
    pttQuotationAttachment?: string; // ไฟล์แนบใบเสนอราคา

    // Scheduled pickup (วันนัดรับ)
    scheduledPickupDate?: string; // วันที่นัดไปรับน้ำมัน
    scheduledPickupTime?: string; // เวลาที่นัดไปรับ

    // Odometer tracking fields
    currentOdometer?: number; // เลขไมล์ปัจจุบันก่อนออกวิ่ง
    startOdometer?: number; // เลขไมล์เริ่มต้น (กม.)
    endOdometer?: number; // เลขไมล์สิ้นสุด (กม.)
    totalDistance?: number; // ระยะทางรวม (กม.)
    startTime?: string; // เวลาเริ่มเดินทาง
    endTime?: string; // เวลาถึงปลายทาง
    tripDuration?: number; // ระยะเวลา (นาที)
    odometerStartPhoto?: string; // รูปไมล์ตอนออก (optional)
    odometerEndPhoto?: string; // รูปไมล์ตอนกลับ (optional)

    // Fuel tracking fields
    startFuel?: number; // น้ำมันตอนเริ่มต้น (ลิตร)
    endFuel?: number; // น้ำมันตอนสิ้นสุด (ลิตร)
    fuelConsumed?: number; // น้ำมันที่ใช้ไป (ลิตร)

    // Integration with Oil Receipt
    deliveryNoteNo?: string; // เลขที่ใบส่งของจาก PTT
    oilReceiptId?: string; // ID ของใบรับน้ำมัน (เชื่อมกับ OilReceipt)
    selectedBranches?: number[]; // สาขาที่จะส่ง
    usedInOrderId?: string; // ID ของออเดอร์น้ำมันที่เรียกใช้ออเดอร์รถนี้
    notes?: string;
    createdAt: string;
    createdBy: string;
}
