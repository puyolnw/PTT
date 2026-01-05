// Shared data for Orders and OrderManagement pages
// ข้อมูลที่ใช้ร่วมกันระหว่างหน้า "บันทึกใบเสนอราคาจากปตท" และ "จัดการการสั่งซื้อ"

// สาขาทั้ง 5 แห่ง
export const branches = [
  { id: 1, name: "ปั๊มไฮโซ", code: "HQ", address: "มหาสารคาม", legalEntityName: "บริษัท A จำกัด" },
  { id: 2, name: "ดินดำ", code: "B2", address: "มหาสารคาม", legalEntityName: "บริษัท B จำกัด" },
  { id: 3, name: "หนองจิก", code: "B3", address: "มหาสารคาม", legalEntityName: "บริษัท C จำกัด" },
  { id: 4, name: "ตักสิลา", code: "B4", address: "มหาสารคาม", legalEntityName: "บริษัท D จำกัด" },
  { id: 5, name: "บายพาส", code: "B5", address: "มหาสารคาม", legalEntityName: "บริษัท E จำกัด" },
];

// นิติบุคคล
export const legalEntities = [
  { id: 1, name: "บริษัท A จำกัด" },
  { id: 2, name: "บริษัท B จำกัด" },
  { id: 3, name: "บริษัท C จำกัด" },
  { id: 4, name: "บริษัท D จำกัด" },
  { id: 5, name: "บริษัท E จำกัด" },
];

// Interface สำหรับ Order Summary Item
export interface OrderSummaryItem {
  branchId: number;
  branchName: string;
  oilType: string;
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

// Mock data - สรุปคำขอจากทั้ง 5 สาขา (รวมปั๊มไฮโซ)
// ข้อมูลนี้มาจากหน้า "บันทึกใบเสนอราคาจากปตท"
export const mockOrderSummary: OrderSummaryItem[] = [
  // ปั๊มไฮโซ
  {
    branchId: 1,
    branchName: "ปั๊มไฮโซ",
    oilType: "Premium Diesel",
    estimatedOrderAmount: 30000,
    systemRecommended: 32000,
    currentStock: 12000,
    lowStockAlert: false,
    quantityOrdered: 32000,
    legalEntityId: 1,
    legalEntityName: "บริษัท A จำกัด",
    status: "รออนุมัติ",
    requestedAt: "2024-12-15 09:00",
    requestedBy: "ผู้จัดการปั๊มไฮโซ",
  },
  {
    branchId: 1,
    branchName: "ปั๊มไฮโซ",
    oilType: "Premium Gasohol 95",
    estimatedOrderAmount: 25000,
    systemRecommended: 28000,
    currentStock: 15000,
    lowStockAlert: false,
    quantityOrdered: 28000,
    legalEntityId: 1,
    legalEntityName: "บริษัท A จำกัด",
    status: "รออนุมัติ",
    requestedAt: "2024-12-15 09:00",
    requestedBy: "ผู้จัดการปั๊มไฮโซ",
  },
  {
    branchId: 1,
    branchName: "ปั๊มไฮโซ",
    oilType: "Diesel",
    estimatedOrderAmount: 35000,
    systemRecommended: 38000,
    currentStock: 20000,
    lowStockAlert: false,
    quantityOrdered: 38000,
    legalEntityId: 1,
    legalEntityName: "บริษัท A จำกัด",
    status: "รออนุมัติ",
    requestedAt: "2024-12-15 09:00",
    requestedBy: "ผู้จัดการปั๊มไฮโซ",
  },
  // ดินดำ
  {
    branchId: 2,
    branchName: "ดินดำ",
    oilType: "Premium Diesel",
    estimatedOrderAmount: 20000,
    systemRecommended: 22000,
    currentStock: 8500,
    lowStockAlert: true,
    quantityOrdered: 22000,
    legalEntityId: 2,
    legalEntityName: "บริษัท B จำกัด",
    status: "รออนุมัติ",
    requestedAt: "2024-12-15 10:30",
    requestedBy: "ผู้จัดการดินดำ",
  },
  {
    branchId: 2,
    branchName: "ดินดำ",
    oilType: "Gasohol 95",
    estimatedOrderAmount: 15000,
    systemRecommended: 18000,
    currentStock: 12000,
    lowStockAlert: false,
    quantityOrdered: 18000,
    legalEntityId: 2,
    legalEntityName: "บริษัท B จำกัด",
    status: "อนุมัติแล้ว",
    requestedAt: "2024-12-15 10:30",
    requestedBy: "ผู้จัดการดินดำ",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-15 14:30",
    orderNo: "SO-20241215-002",
    supplierOrderNo: "PTT-20241215-002",
    pricePerLiter: 35.0,
    totalAmount: 630000,
    deliveryDate: "2024-12-16",
  },
  {
    branchId: 2,
    branchName: "ดินดำ",
    oilType: "E85",
    estimatedOrderAmount: 8000,
    systemRecommended: 10000,
    currentStock: 3000,
    lowStockAlert: true,
    quantityOrdered: 10000,
    legalEntityId: 2,
    legalEntityName: "บริษัท B จำกัด",
    status: "รออนุมัติ",
    requestedAt: "2024-12-15 10:30",
    requestedBy: "ผู้จัดการดินดำ",
  },
  // หนองจิก
  {
    branchId: 3,
    branchName: "หนองจิก",
    oilType: "Diesel",
    estimatedOrderAmount: 18000,
    systemRecommended: 20000,
    currentStock: 5000,
    lowStockAlert: true,
    quantityOrdered: 20000,
    legalEntityId: 3,
    legalEntityName: "บริษัท C จำกัด",
    status: "ส่งแล้ว",
    requestedAt: "2024-12-15 11:00",
    requestedBy: "ผู้จัดการหนองจิก",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-15 14:00",
    orderNo: "SO-20241215-003",
    supplierOrderNo: "PTT-20241215-003",
    pricePerLiter: 30.0,
    totalAmount: 600000,
    deliveryDate: "2024-12-16",
  },
  {
    branchId: 3,
    branchName: "หนองจิก",
    oilType: "Gasohol 91",
    estimatedOrderAmount: 12000,
    systemRecommended: 15000,
    currentStock: 8000,
    lowStockAlert: false,
    quantityOrdered: 15000,
    legalEntityId: 3,
    legalEntityName: "บริษัท C จำกัด",
    status: "รออนุมัติ",
    requestedAt: "2024-12-15 11:00",
    requestedBy: "ผู้จัดการหนองจิก",
  },
  // ตักสิลา
  {
    branchId: 4,
    branchName: "ตักสิลา",
    oilType: "Premium Diesel",
    estimatedOrderAmount: 25000,
    systemRecommended: 24000,
    currentStock: 15000,
    lowStockAlert: false,
    quantityOrdered: 24000,
    legalEntityId: 4,
    legalEntityName: "บริษัท D จำกัด",
    status: "ส่งแล้ว",
    requestedAt: "2024-12-15 09:45",
    requestedBy: "ผู้จัดการตักสิลา",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-15 14:30",
    orderNo: "SO-20241215-001",
    supplierOrderNo: "PTT-20241215-001",
    pricePerLiter: 32.50,
    totalAmount: 780000,
    deliveryDate: "2024-12-16",
    tolerancePercent: 0.3,
    isInterbranch: false,
    truckCount: 1,
  },
  {
    branchId: 4,
    branchName: "ตักสิลา",
    oilType: "E20",
    estimatedOrderAmount: 15000,
    systemRecommended: 18000,
    currentStock: 10000,
    lowStockAlert: false,
    quantityOrdered: 18000,
    legalEntityId: 4,
    legalEntityName: "บริษัท D จำกัด",
    status: "รออนุมัติ",
    requestedAt: "2024-12-15 09:45",
    requestedBy: "ผู้จัดการตักสิลา",
  },
  // บายพาส
  {
    branchId: 5,
    branchName: "บายพาส",
    oilType: "Gasohol 95",
    estimatedOrderAmount: 12000,
    systemRecommended: 15000,
    currentStock: 3000,
    lowStockAlert: true,
    quantityOrdered: 15000,
    legalEntityId: 5,
    legalEntityName: "บริษัท E จำกัด",
    status: "รออนุมัติ",
    requestedAt: "2024-12-15 11:30",
    requestedBy: "ผู้จัดการบายพาส",
  },
  {
    branchId: 5,
    branchName: "บายพาส",
    oilType: "Gasohol 91",
    estimatedOrderAmount: 10000,
    systemRecommended: 12000,
    currentStock: 5000,
    lowStockAlert: true,
    quantityOrdered: 12000,
    legalEntityId: 5,
    legalEntityName: "บริษัท E จำกัด",
    status: "รออนุมัติ",
    requestedAt: "2024-12-15 11:30",
    requestedBy: "ผู้จัดการบายพาส",
  },
];

// Helper function: แปลง OrderSummaryItem เป็นรูปแบบที่ใช้ใน OrderManagement
export function groupOrdersByBranch(orderSummary: OrderSummaryItem[]) {
  const branchMap = new Map<number, {
    branchId: number;
    branchName: string;
    branchCode: string;
    legalEntityName: string;
    address: string;
    items: Array<{
      id: string;
      oilType: string;
      quantity: number;
      pricePerLiter: number;
      totalAmount: number;
      status: "รออนุมัติ" | "อนุมัติแล้ว" | "ส่งแล้ว" | "ยกเลิก";
      requestedAt: string;
      requestedBy: string;
      approvedBy?: string;
      approvedAt?: string;
      orderNo?: string;
      supplierOrderNo?: string;
      deliveryDate?: string;
    }>;
    totalQuantity: number;
    totalAmount: number;
    status: "รออนุมัติ" | "อนุมัติแล้ว" | "ส่งแล้ว" | "ยกเลิก";
    lastUpdated: string;
  }>();

  orderSummary.forEach((order) => {
    const branch = branches.find((b) => b.id === order.branchId);
    if (!branch) return;

    if (!branchMap.has(order.branchId)) {
      branchMap.set(order.branchId, {
        branchId: order.branchId,
        branchName: order.branchName,
        branchCode: branch.code,
        legalEntityName: order.legalEntityName,
        address: branch.address,
        items: [],
        totalQuantity: 0,
        totalAmount: 0,
        status: "รออนุมัติ",
        lastUpdated: order.requestedAt,
      });
    }

    const branchData = branchMap.get(order.branchId)!;
    const pricePerLiter = order.pricePerLiter || 0;
    const totalAmount = order.totalAmount || (order.quantityOrdered * pricePerLiter);

    branchData.items.push({
      id: `${order.branchId}-${order.oilType}`,
      oilType: order.oilType,
      quantity: order.quantityOrdered,
      pricePerLiter: pricePerLiter,
      totalAmount: totalAmount,
      status: order.status,
      requestedAt: order.requestedAt,
      requestedBy: order.requestedBy,
      approvedBy: order.approvedBy,
      approvedAt: order.approvedAt,
      orderNo: order.orderNo,
      supplierOrderNo: order.supplierOrderNo,
      deliveryDate: order.deliveryDate,
    });

    branchData.totalQuantity += order.quantityOrdered;
    branchData.totalAmount += totalAmount;

    // อัพเดตสถานะ: ถ้ามีรายการใดที่สถานะสูงกว่า ให้ใช้สถานะนั้น
    const statusPriority = { "รออนุมัติ": 1, "อนุมัติแล้ว": 2, "ส่งแล้ว": 3, "ยกเลิก": 0 };
    if (statusPriority[order.status] > statusPriority[branchData.status]) {
      branchData.status = order.status;
    }

    // อัพเดต lastUpdated: ใช้เวลาล่าสุด
    if (order.approvedAt && order.approvedAt > branchData.lastUpdated) {
      branchData.lastUpdated = order.approvedAt;
    } else if (order.requestedAt > branchData.lastUpdated) {
      branchData.lastUpdated = order.requestedAt;
    }
  });

  return Array.from(branchMap.values());
}

// Interface สำหรับ Approved Order (ใบสั่งซื้อที่อนุมัติแล้ว)
export interface ApprovedOrder {
  orderNo: string;
  supplierOrderNo: string;
  billNo?: string;
  orderDate: string;
  deliveryDate: string;
  items: Array<{
    oilType: string;
    quantity: number;
    pricePerLiter: number;
    totalAmount: number;
  }>;
  totalAmount: number;
  branches: Array<{
    branchId: number;
    branchName: string;
    legalEntityName: string;
    address: string;
    items: Array<{
      oilType: string;
      quantity: number;
      pricePerLiter: number;
      totalAmount: number;
    }>;
    totalAmount: number;
    deliveryStatus: "รอส่ง" | "กำลังส่ง" | "ส่งสำเร็จ"; // สถานะการจัดส่งของแต่ละปั๊ม
  }>;
  status: "รอเริ่ม" | "กำลังขนส่ง" | "ขนส่งสำเร็จ" | "ยกเลิก";
  approvedBy: string;
  approvedAt: string;
  // ข้อมูลรถและคนขับ (fix มากับใบสั่งซื้อ)
  truckId?: string;
  truckPlateNumber?: string;
  trailerId?: string;
  trailerPlateNumber?: string;
  driverId?: string;
  driverName?: string;
  currentOdometer?: number; // เลขไมล์ปัจจุบัน
}

// Mock data - ใบสั่งซื้อที่อนุมัติแล้ว (บิลรวมการสั่งในแต่ละครั้ง)
// ข้อมูลนี้มาจากหน้า "บันทึกใบเสนอราคาจากปตท"
// แต่ละเลขที่ใบสั่งซื้อจะมีข้อมูลจากทั้ง 5 ปั๊ม
export const mockApprovedOrders: ApprovedOrder[] = [
  {
    orderNo: "SO-20241215-001",
    supplierOrderNo: "PTT-20241215-001",
    billNo: "BILL-20241215-001",
    orderDate: "2024-12-15",
    deliveryDate: "2024-12-16",
    items: [
      { oilType: "Premium Diesel", quantity: 32000, pricePerLiter: 32.5, totalAmount: 1040000 },
      { oilType: "Premium Gasohol 95", quantity: 28000, pricePerLiter: 35.0, totalAmount: 980000 },
      { oilType: "Diesel", quantity: 38000, pricePerLiter: 30.0, totalAmount: 1140000 },
      { oilType: "Premium Diesel", quantity: 24000, pricePerLiter: 32.5, totalAmount: 780000 },
      { oilType: "Gasohol 95", quantity: 18000, pricePerLiter: 35.0, totalAmount: 630000 },
    ],
    totalAmount: 6500000, // 3160000 + 1345000 + 600000 + 780000 + 525000
    branches: [
      {
        branchId: 1,
        branchName: "ปั๊มไฮโซ",
        legalEntityName: "บริษัท A จำกัด",
        address: "100 ถนนเพชรบุรี กรุงเทพมหานคร 10400",
        items: [
          { oilType: "Premium Diesel", quantity: 32000, pricePerLiter: 32.5, totalAmount: 1040000 },
          { oilType: "Premium Gasohol 95", quantity: 28000, pricePerLiter: 35.0, totalAmount: 980000 },
          { oilType: "Diesel", quantity: 38000, pricePerLiter: 30.0, totalAmount: 1140000 },
        ],
        totalAmount: 3160000,
        deliveryStatus: "ส่งสำเร็จ",
      },
      {
        branchId: 2,
        branchName: "ดินดำ",
        legalEntityName: "บริษัท B จำกัด",
        address: "456 ถนนพหลโยธิน กรุงเทพมหานคร 10400",
        items: [
          { oilType: "Premium Diesel", quantity: 22000, pricePerLiter: 32.5, totalAmount: 715000 },
          { oilType: "Gasohol 95", quantity: 18000, pricePerLiter: 35.0, totalAmount: 630000 },
        ],
        totalAmount: 1345000,
        deliveryStatus: "กำลังส่ง",
      },
      {
        branchId: 3,
        branchName: "หนองจิก",
        legalEntityName: "บริษัท C จำกัด",
        address: "789 ถนนรัชดาภิเษก กรุงเทพมหานคร 10320",
        items: [
          { oilType: "Diesel", quantity: 20000, pricePerLiter: 30.0, totalAmount: 600000 },
        ],
        totalAmount: 600000,
        deliveryStatus: "ส่งสำเร็จ",
      },
      {
        branchId: 4,
        branchName: "ตักสิลา",
        legalEntityName: "บริษัท D จำกัด",
        address: "123 ถนนสุขุมวิท กรุงเทพมหานคร 10110",
        items: [
          { oilType: "Premium Diesel", quantity: 24000, pricePerLiter: 32.5, totalAmount: 780000 },
        ],
        totalAmount: 780000,
        deliveryStatus: "รอส่ง",
      },
      {
        branchId: 5,
        branchName: "บายพาส",
        legalEntityName: "บริษัท E จำกัด",
        address: "321 ถนนสีลม กรุงเทพมหานคร 10500",
        items: [
          { oilType: "Gasohol 95", quantity: 15000, pricePerLiter: 35.0, totalAmount: 525000 },
        ],
        totalAmount: 525000,
        deliveryStatus: "รอส่ง",
      },
    ],
    status: "ขนส่งสำเร็จ",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-15 14:30",
    // ข้อมูลรถและคนขับ (fix มากับใบสั่งซื้อ)
    truckId: "TRUCK-001",
    truckPlateNumber: "กก 1111",
    trailerId: "TRAILER-001",
    trailerPlateNumber: "กข 1234",
    driverId: "32",
    driverName: "สมศักดิ์ ขับรถ",
    currentOdometer: 125500,
  },
  {
    orderNo: "SO-20241215-002",
    supplierOrderNo: "PTT-20241215-002",
    billNo: "BILL-20241215-002",
    orderDate: "2024-12-15",
    deliveryDate: "2024-12-16",
    items: [
      { oilType: "Premium Diesel", quantity: 30000, pricePerLiter: 32.5, totalAmount: 975000 },
      { oilType: "Gasohol 95", quantity: 25000, pricePerLiter: 35.0, totalAmount: 875000 },
      { oilType: "Diesel", quantity: 35000, pricePerLiter: 30.0, totalAmount: 1050000 },
      { oilType: "Premium Diesel", quantity: 20000, pricePerLiter: 32.5, totalAmount: 650000 },
      { oilType: "E20", quantity: 18000, pricePerLiter: 33.0, totalAmount: 594000 },
    ],
    totalAmount: 4552000, // 1850000 + 1050000 + 650000 + 594000 + 408000
    branches: [
      {
        branchId: 1,
        branchName: "ปั๊มไฮโซ",
        legalEntityName: "บริษัท A จำกัด",
        address: "100 ถนนเพชรบุรี กรุงเทพมหานคร 10400",
        items: [
          { oilType: "Premium Diesel", quantity: 30000, pricePerLiter: 32.5, totalAmount: 975000 },
          { oilType: "Gasohol 95", quantity: 25000, pricePerLiter: 35.0, totalAmount: 875000 },
        ],
        totalAmount: 1850000,
        deliveryStatus: "ส่งสำเร็จ",
      },
      {
        branchId: 2,
        branchName: "ดินดำ",
        legalEntityName: "บริษัท B จำกัด",
        address: "456 ถนนพหลโยธิน กรุงเทพมหานคร 10400",
        items: [
          { oilType: "Diesel", quantity: 35000, pricePerLiter: 30.0, totalAmount: 1050000 },
        ],
        totalAmount: 1050000,
        deliveryStatus: "ส่งสำเร็จ",
      },
      {
        branchId: 3,
        branchName: "หนองจิก",
        legalEntityName: "บริษัท C จำกัด",
        address: "789 ถนนรัชดาภิเษก กรุงเทพมหานคร 10320",
        items: [
          { oilType: "Premium Diesel", quantity: 20000, pricePerLiter: 32.5, totalAmount: 650000 },
        ],
        totalAmount: 650000,
        deliveryStatus: "รอส่ง",
      },
      {
        branchId: 4,
        branchName: "ตักสิลา",
        legalEntityName: "บริษัท D จำกัด",
        address: "123 ถนนสุขุมวิท กรุงเทพมหานคร 10110",
        items: [
          { oilType: "E20", quantity: 18000, pricePerLiter: 33.0, totalAmount: 594000 },
        ],
        totalAmount: 594000,
        deliveryStatus: "กำลังส่ง",
      },
      {
        branchId: 5,
        branchName: "บายพาส",
        legalEntityName: "บริษัท E จำกัด",
        address: "321 ถนนสีลม กรุงเทพมหานคร 10500",
        items: [
          { oilType: "Gasohol 91", quantity: 12000, pricePerLiter: 34.0, totalAmount: 408000 },
        ],
        totalAmount: 408000,
        deliveryStatus: "รอส่ง",
      },
    ],
    status: "ขนส่งสำเร็จ",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-15 16:00",
    // ข้อมูลรถและคนขับ (fix มากับใบสั่งซื้อ)
    truckId: "TRUCK-002",
    truckPlateNumber: "กก 2222",
    trailerId: "TRAILER-002",
    trailerPlateNumber: "กข 5678",
    driverId: "32",
    driverName: "สมศักดิ์ ขับรถ",
    currentOdometer: 98000,
  },
  {
    orderNo: "SO-20241215-003",
    supplierOrderNo: "PTT-20241215-003",
    billNo: "BILL-20241215-003",
    orderDate: "2024-12-15",
    deliveryDate: "2024-12-16",
    items: [
      { oilType: "Diesel", quantity: 25000, pricePerLiter: 30.0, totalAmount: 750000 },
      { oilType: "Premium Diesel", quantity: 20000, pricePerLiter: 32.5, totalAmount: 650000 },
      { oilType: "Gasohol 95", quantity: 22000, pricePerLiter: 35.0, totalAmount: 770000 },
      { oilType: "Premium Diesel", quantity: 15000, pricePerLiter: 32.5, totalAmount: 487500 },
      { oilType: "Diesel", quantity: 18000, pricePerLiter: 30.0, totalAmount: 540000 },
    ],
    totalAmount: 3197500, // 750000 + 650000 + 770000 + 487500 + 540000
    branches: [
      {
        branchId: 1,
        branchName: "ปั๊มไฮโซ",
        legalEntityName: "บริษัท A จำกัด",
        address: "100 ถนนเพชรบุรี กรุงเทพมหานคร 10400",
        items: [
          { oilType: "Diesel", quantity: 25000, pricePerLiter: 30.0, totalAmount: 750000 },
        ],
        totalAmount: 750000,
        deliveryStatus: "รอส่ง",
      },
      {
        branchId: 2,
        branchName: "ดินดำ",
        legalEntityName: "บริษัท B จำกัด",
        address: "456 ถนนพหลโยธิน กรุงเทพมหานคร 10400",
        items: [
          { oilType: "Premium Diesel", quantity: 20000, pricePerLiter: 32.5, totalAmount: 650000 },
        ],
        totalAmount: 650000,
        deliveryStatus: "รอส่ง",
      },
      {
        branchId: 3,
        branchName: "หนองจิก",
        legalEntityName: "บริษัท C จำกัด",
        address: "789 ถนนรัชดาภิเษก กรุงเทพมหานคร 10320",
        items: [
          { oilType: "Gasohol 95", quantity: 22000, pricePerLiter: 35.0, totalAmount: 770000 },
        ],
        totalAmount: 770000,
        deliveryStatus: "รอส่ง",
      },
      {
        branchId: 4,
        branchName: "ตักสิลา",
        legalEntityName: "บริษัท D จำกัด",
        address: "123 ถนนสุขุมวิท กรุงเทพมหานคร 10110",
        items: [
          { oilType: "Premium Diesel", quantity: 15000, pricePerLiter: 32.5, totalAmount: 487500 },
        ],
        totalAmount: 487500,
        deliveryStatus: "รอส่ง",
      },
      {
        branchId: 5,
        branchName: "บายพาส",
        legalEntityName: "บริษัท E จำกัด",
        address: "321 ถนนสีลม กรุงเทพมหานคร 10500",
        items: [
          { oilType: "Diesel", quantity: 18000, pricePerLiter: 30.0, totalAmount: 540000 },
        ],
        totalAmount: 540000,
        deliveryStatus: "รอส่ง",
      },
    ],
    status: "ขนส่งสำเร็จ",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-15 16:15",
    // ข้อมูลรถและคนขับ (fix มากับใบสั่งซื้อ)
    truckId: "TRUCK-001",
    truckPlateNumber: "กก 1111",
    trailerId: "TRAILER-003",
    trailerPlateNumber: "กข 9012",
    driverId: "32",
    driverName: "สมศักดิ์ ขับรถ",
    currentOdometer: 125800,
  },
];

// PTT Quotation Interface
export interface PTTQuotation {
  id: string;
  purchaseOrderNo: string;
  pttQuotationNo: string;
  pttQuotationDate: string;
  pttQuotationAmount: number;
  pttQuotationAttachment?: string;
  scheduledPickupDate?: string;
  scheduledPickupTime?: string;
  transportNo?: string;
  truckId: string;
  truckPlateNumber: string;
  trailerId: string;
  trailerPlateNumber: string;
  driverId: string;
  driverName: string;
  driverCode: string;
  status: "draft" | "confirmed" | "ready-to-pickup" | "completed";
  createdAt: string;
  createdBy: string;
}

// Mock PTT Quotations
export const mockPTTQuotations: PTTQuotation[] = [
  {
    id: "PTTQ-001",
    purchaseOrderNo: "PO-20241214-001",
    pttQuotationNo: "QT-PTT-2024-001",
    pttQuotationDate: "2024-12-14",
    pttQuotationAmount: 450000,
    scheduledPickupDate: "2024-12-16",
    scheduledPickupTime: "09:00",
    truckId: "T001",
    truckPlateNumber: "กข-1234 กรุงเทพ",
    trailerId: "TR001",
    trailerPlateNumber: "ฮฮ-5678 กรุงเทพ",
    driverId: "1",
    driverName: "สมชาย ใจดี",
    driverCode: "EMP001",
    status: "confirmed",
    createdAt: "2024-12-14T10:30:00",
    createdBy: "คุณนิด",
  },
  {
    id: "PTTQ-002",
    purchaseOrderNo: "PO-20241214-002",
    pttQuotationNo: "QT-PTT-2024-002",
    pttQuotationDate: "2024-12-14",
    pttQuotationAmount: 380000,
    scheduledPickupDate: "2024-12-17",
    scheduledPickupTime: "10:30",
    truckId: "T002",
    truckPlateNumber: "คค-2345 กรุงเทพ",
    trailerId: "TR002",
    trailerPlateNumber: "จจ-6789 กรุงเทพ",
    driverId: "2",
    driverName: "สมหญิง รักงาน",
    driverCode: "EMP002",
    status: "draft",
    createdAt: "2024-12-14T11:00:00",
    createdBy: "คุณนิด",
  },
];
