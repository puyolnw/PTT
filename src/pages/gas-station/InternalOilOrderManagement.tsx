import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  ShoppingCart,
  Search,
  CheckCircle,
  Clock,
  X,
  Building2,
  FileText,
  Truck,
  Calendar,
  User,
  Eye,
  MapPin,
  Droplet,
  Plus,
  Trash2,
  Download,
  FileCheck,
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import type { InternalOilOrder, OilType } from "@/types/gasStation";

// Interface สำหรับ Internal Transport Order (ดึงจาก InternalTransport.tsx)
interface InternalTransportOrder {
  id: string;
  transportNo: string;
  orderDate: string;
  departureDate: string;
  internalOrderNo: string;
  fromBranchId: number;
  fromBranchName: string;
  toBranchId: number;
  toBranchName: string;
  truckId: string;
  truckPlateNumber: string;
  trailerId: string;
  trailerPlateNumber: string;
  driverId: string;
  driverName: string;
  currentOdometer: number;
  startFuel: number;
  items: Array<{
    oilType: string;
    quantity: number;
  }>;
  totalAmount: number;
  status: "draft" | "ready-to-pickup" | "picking-up" | "completed" | "cancelled";
  createdAt: string;
  createdBy: string;
}

// Mock data - Internal Transport Orders ที่ยังไม่เลยเวลาส่ง (ดึงจาก InternalTransport.tsx)
// ในระบบจริงจะดึงจาก context หรือ API
const mockAvailableTransports: InternalTransportOrder[] = [
  {
    id: "1",
    transportNo: "IT-20241215-001",
    orderDate: "2024-12-15",
    departureDate: "2024-12-18",
    internalOrderNo: "IO-20241215-002",
    fromBranchId: 1,
    fromBranchName: "ปั๊มไฮโซ",
    toBranchId: 3,
    toBranchName: "หนองจิก",
    truckId: "TRUCK-001",
    truckPlateNumber: "กก 1111",
    trailerId: "TRAILER-001",
    trailerPlateNumber: "กข 1234",
    driverId: "32",
    driverName: "สมศักดิ์ ขับรถ",
    currentOdometer: 125500,
    startFuel: 200,
    items: [
      { oilType: "Diesel", quantity: 4000 },
    ],
    totalAmount: 120000,
    status: "ready-to-pickup",
    createdAt: "2024-12-15T15:00:00",
    createdBy: "ระบบ",
  },
  {
    id: "2",
    transportNo: "IT-20241216-001",
    orderDate: "2024-12-16",
    departureDate: "2024-12-19",
    internalOrderNo: "IO-20241216-001",
    fromBranchId: 1,
    fromBranchName: "ปั๊มไฮโซ",
    toBranchId: 2,
    toBranchName: "ดินดำ",
    truckId: "TRUCK-002",
    truckPlateNumber: "กก 2222",
    trailerId: "TRAILER-002",
    trailerPlateNumber: "กข 2345",
    driverId: "33",
    driverName: "สมชาย ขับรถ",
    currentOdometer: 98000,
    startFuel: 150,
    items: [
      { oilType: "Premium Diesel", quantity: 5000 },
    ],
    totalAmount: 162500,
    status: "ready-to-pickup",
    createdAt: "2024-12-16T10:00:00",
    createdBy: "ระบบ",
  },
  {
    id: "3",
    transportNo: "IT-20241217-005",
    orderDate: "2024-12-17",
    departureDate: "2024-12-17",
    internalOrderNo: "",
    fromBranchId: 1,
    fromBranchName: "ปั๊มไฮโซ",
    toBranchId: 4,
    toBranchName: "บายพาส",
    truckId: "TRUCK-003",
    truckPlateNumber: "กก 3333",
    trailerId: "TRAILER-003",
    trailerPlateNumber: "กข 3456",
    driverId: "34",
    driverName: "วิชัย ขับรถ",
    currentOdometer: 110000,
    startFuel: 100,
    items: [
      { oilType: "Gasohol 95", quantity: 2000 },
      { oilType: "E20", quantity: 1500 },
    ],
    totalAmount: 122500,
    status: "completed", // เคสที่ส่งเสร็จแล้วแต่เหลือน้ำมัน
    createdAt: "2024-12-17T08:00:00",
    createdBy: "ระบบ",
  },
];

// Mock data for Suction Oil (น้ำมันจากการดูด)
const mockSuctionOilRecords = [
  {
    id: "SUC-001",
    branchId: 1,
    branchName: "ปั๊มไฮโซ",
    date: "2024-12-18",
    items: [
      { oilType: "Diesel", quantity: 800, pricePerLiter: 30.0 },
    ],
    notes: "ดูดจากถังพักน้ำมัน",
  },
  {
    id: "SUC-002",
    branchId: 2,
    branchName: "ดินดำ",
    date: "2024-12-18",
    items: [
      { oilType: "Premium Diesel", quantity: 500, pricePerLiter: 32.5 },
    ],
    notes: "ดูดจากการล้างถัง",
  }
];

// Mock data - ราคาน้ำมันต่อลิตร
const oilPrices: Record<OilType, number> = {
  "Premium Diesel": 32.50,
  "Diesel": 30.00,
  "Premium Gasohol 95": 45.00,
  "Gasohol 95": 43.00,
  "Gasohol 91": 38.00,
  "E20": 35.00,
  "E85": 33.00,
  "Gasohol E20": 35.00,
};

const oilTypes: OilType[] = [
  "Premium Diesel",
  "Diesel",
  "Premium Gasohol 95",
  "Gasohol 95",
  "Gasohol 91",
  "E20",
  "E85",
  "Gasohol E20",
];

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

interface DeliveryItem {
  oilType: OilType;
  quantity: number; // จำนวนที่สั่งมาเดิม
  quantityToDeliver: number; // จำนวนที่จะส่งจริง (user input)
  pricePerLiter: number;
  totalAmount: number;
  isFromOrder: boolean;
  sourceAvailableQty?: number; // จำนวนที่มีในแหล่งที่มา (รถ/ดูด)
  assignedFromBranchId: number;
  deliverySource: "truck" | "suction"; // เอา "none" ออก
  selectedTruckTripId?: string;
  transportNo?: string;
}

export default function InternalOilOrderManagement() {
  const { internalOrders, updateInternalOrder, approveInternalOrder, cancelInternalOrder, branches } = useGasStation();
  const { selectedBranches } = useBranch();
  
  // ตรวจสอบว่ามีการเลือกปั๊มไฮโซ (ID: 1) ใน Global Filter หรือไม่
  const isHisoSelected = useMemo(() => {
    return selectedBranches.length === 0 || selectedBranches.includes("1");
  }, [selectedBranches]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | InternalOilOrder["status"]>("all");
  const [filterBranch, setFilterBranch] = useState<number | "all">("all");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<InternalOilOrder | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // State for managing oil items (แสดงและแก้ไขรายการน้ำมัน)
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);

  // Helper function to check if date is in range
  const isDateInRange = (dateStr: string, from: string, to: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (from && !to) return d >= new Date(from);
    if (!from && to) return d <= new Date(to);
    if (from && to) return d >= new Date(from) && d <= new Date(to);
    return true;
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    // ถ้าไม่ได้เลือกปั๊มไฮโซ ไม่ต้องแสดงข้อมูลใดๆ
    if (!isHisoSelected) return [];

    return internalOrders.filter((order) => {
      // เฉพาะออเดอร์ที่สั่งมายังไฮโซ (หรือยังไม่ได้ระบุผู้ส่ง ซึ่งถือว่าเป็นไฮโซ)
      const isMeantForHiso = order.assignedFromBranchId === 1 || order.status === "รออนุมัติ";
      if (!isMeantForHiso) return false;

      const matchesSearch =
        order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.assignedFromBranchName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || order.status === filterStatus;
      
      // หน้านี้ไม่รองรับการกรองสาขาจากหน้าบาร์ (ยกเว้นการเช็คว่าต้องเป็นไฮโซถึงจะเห็น)
      // แต่ยังรองรับการกรองจาก Dropdown ภายในหน้าเอง (filterBranch)
      const matchesBranch = filterBranch === "all" || order.fromBranchId === filterBranch;

      const matchesDate = isDateInRange(order.orderDate, filterDateFrom, filterDateTo);
      return matchesSearch && matchesStatus && matchesBranch && matchesDate;
    });
  }, [internalOrders, searchTerm, filterStatus, filterBranch, filterDateFrom, filterDateTo, isHisoSelected]);

  // Statistics
  const stats = useMemo(() => {
    if (!isHisoSelected) {
      return { total: 0, pending: 0, approved: 0, delivering: 0, completed: 0 };
    }
    const hisoOrders = internalOrders.filter(o => o.assignedFromBranchId === 1 || o.status === "รออนุมัติ");
    const total = hisoOrders.length;
    const pending = hisoOrders.filter((o) => o.status === "รออนุมัติ").length;
    const approved = hisoOrders.filter((o) => o.status === "อนุมัติแล้ว").length;
    const delivering = hisoOrders.filter((o) => o.status === "กำลังจัดส่ง").length;
    const completed = hisoOrders.filter((o) => o.status === "ส่งแล้ว").length;
    return { total, pending, approved, delivering, completed };
  }, [internalOrders, isHisoSelected]);

  const handleViewDetail = (order: InternalOilOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleApprove = (order: InternalOilOrder) => {
    setSelectedOrder(order);
    setDeliveryDate(order.requestedDate);
    setNotes("");
    // Initialize delivery items from order items with default source/branch
    setDeliveryItems(order.items.map((item) => ({
      oilType: item.oilType,
      quantity: item.quantity, // จำนวนที่สั่ง
      quantityToDeliver: item.quantity, // Default: ส่งตามที่สั่ง
      pricePerLiter: item.pricePerLiter,
      totalAmount: item.totalAmount,
      isFromOrder: true, // มาจากออเดอร์
      assignedFromBranchId: 1, // Default: ปั๊มไฮโซ
      deliverySource: "truck", // เปลี่ยนจาก none เป็น truck
      selectedTruckTripId: "",
      transportNo: "",
    })));
    setShowAssignModal(true);
  };

  const handleAddDeliveryItem = () => {
    setDeliveryItems([...deliveryItems, {
      oilType: "Premium Diesel",
      quantity: 0, // ไม่มีในออเดอร์
      quantityToDeliver: 0,
      pricePerLiter: oilPrices["Premium Diesel"],
      totalAmount: 0,
      isFromOrder: false, // เพิ่มใหม่
      assignedFromBranchId: 1,
      deliverySource: "truck", // เปลี่ยนจาก none เป็น truck
      selectedTruckTripId: "",
      transportNo: "",
    }]);
  };

  const handleRemoveDeliveryItem = (index: number) => {
    setDeliveryItems(deliveryItems.filter((_, i) => i !== index));
  };

  const handleUpdateDeliveryItem = (index: number, field: keyof DeliveryItem, value: OilType | number | string | undefined) => {
    setDeliveryItems((prev) => {
      const next = [...prev];
      const item = { ...next[index] };

    if (field === "oilType") {
        const type = value as OilType;
        const price = oilPrices[type] || 0;
        item.oilType = type;
        item.pricePerLiter = price;
        item.totalAmount = item.quantityToDeliver * price;
      } else if (field === "quantityToDeliver") {
        const qty = value as number;
        // ตรวจสอบไม่ให้เกินจำนวนที่มีในแหล่งที่มา (ถ้ามีการเลือกแหล่งที่มา)
        if (item.sourceAvailableQty !== undefined && qty > item.sourceAvailableQty) {
          return prev;
        }
        item.quantityToDeliver = qty;
        item.totalAmount = qty * item.pricePerLiter;
      } else if (field === "pricePerLiter") {
        const price = value as number;
        item.pricePerLiter = price;
        item.totalAmount = item.quantityToDeliver * price;
      } else if (field === "assignedFromBranchId") {
        item.assignedFromBranchId = value as number;
        item.deliverySource = "truck"; // เปลี่ยนจาก none เป็น truck
        item.selectedTruckTripId = "";
        item.transportNo = "";
        item.sourceAvailableQty = undefined;
      } else {
        // Use a safe way to update other fields to avoid injection warnings if possible,
        // but for mock/internal use this is generally fine. 
        // We'll cast to satisfy TS.
        (item as any)[field] = value;
      }

      next[index] = item;
      return next;
    });
  };

  const handleUpdateDeliveryItemMultiple = (index: number, updates: Partial<DeliveryItem>) => {
    setDeliveryItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], ...updates };

      // Recalculate total if quantity or price changed
      if (updates.quantityToDeliver !== undefined || updates.pricePerLiter !== undefined) {
        item.totalAmount = item.quantityToDeliver * item.pricePerLiter;
      }

      next[index] = item;
      return next;
    });
  };

  const handleSaveAssignment = () => {
    if (!selectedOrder) return;
    
    if (deliveryItems.length === 0) {
      alert("กรุณาเพิ่มรายการน้ำมันที่จะส่ง");
      return;
    }
    if (deliveryItems.some((item) => item.quantityToDeliver <= 0)) {
      alert("กรุณากรอกจำนวนน้ำมันที่จะส่งให้ถูกต้อง");
      return;
    }

    // Update order with delivery items using context
    // เราจะใช้สาขาของรายการแรกเป็นหลักสำหรับข้อมูลหลักของออเดอร์ (assignedFromBranchId)
    const primaryBranchId = deliveryItems[0].assignedFromBranchId;

    approveInternalOrder(
      selectedOrder.id,
      "พี่นิด", // ในระบบจริงควรเป็น user.name
      primaryBranchId,
      deliveryItems.map((item) => ({
            oilType: item.oilType,
            quantity: item.quantityToDeliver, // จำนวนที่จะส่งจริง
            pricePerLiter: item.pricePerLiter,
            totalAmount: item.totalAmount,
        requestedQuantity: item.quantity, // เก็บจำนวนที่ขอมาตอนแรก
        deliverySource: item.deliverySource,
        transportNo: item.transportNo || "",
        truckTripId: item.selectedTruckTripId,
      }))
    );

    setShowAssignModal(false);
    setSelectedOrder(null);
    setDeliveryItems([]);
    alert(`อนุมัติออเดอร์สำเร็จ!\n\nเลขที่ออเดอร์: ${selectedOrder.orderNo}\nมูลค่ารวม: ${numberFormatter.format(deliveryItems.reduce((sum, item) => sum + item.totalAmount, 0))} บาท`);
  };

  const handleCancelOrder = (order: InternalOilOrder) => {
    if (confirm(`คุณต้องการยกเลิกคำสั่งซื้อเลขที่ ${order.orderNo} ใช่หรือไม่?`)) {
      cancelInternalOrder(order.id, "พี่นิด");
      alert("ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว");
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: InternalOilOrder["status"]) => {
    updateInternalOrder(orderId, { status: newStatus });
  };

  // กรองรอบการจัดส่งตามปั๊มที่เลือก และประเภทน้ำมัน
  const getAvailableTrips = (branchId: number, oilType: OilType) => {
    return mockAvailableTransports.filter(t => {
      const matchBranch = t.fromBranchId === branchId;
      const hasOilType = t.items.some(item => item.oilType === oilType);
      return matchBranch && hasOilType;
    });
  };

  // กรองรายการดูดน้ำมันตามปั๊มที่เลือก
  const getAvailableSuctionRecords = (branchId: number, oilType: OilType) => {
    return mockSuctionOilRecords.filter(r => 
      r.branchId === branchId && 
      r.items.some(it => it.oilType === oilType)
    );
  };

  // ฟังก์ชันสำหรับดาวน์โหลดเอกสาร (จำลองการสร้าง PDF ด้วยการพิมพ์ HTML)
  const handleDownload = (type: "po" | "dn", order: InternalOilOrder) => {
    const isPO = type === "po";
    const title = isPO ? "ใบสั่งซื้อน้ำมันภายใน (Internal PO)" : "ใบส่งของน้ำมันภายใน (Internal DN)";
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} - ${order.orderNo}</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&display=swap');
          body { font-family: 'Sarabun', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-bold: true; color: #1e40af; }
          .title { font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 30px; text-transform: uppercase; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-box { border: 1px solid #e5e7eb; padding: 15px; rounded: 8px; }
          .info-label { font-size: 12px; color: #6b7280; font-weight: bold; margin-bottom: 5px; }
          .info-value { font-size: 14px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background-color: #f3f4f6; text-align: left; padding: 12px; border-bottom: 2px solid #e5e7eb; font-size: 14px; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .total-row { font-weight: bold; background-color: #f9fafb; }
          .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center; }
          .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 10px; font-size: 12px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">PTT - ${isPO ? 'Purchase Order' : 'Delivery Note'}</div>
          <div style="text-align: right">
            <div style="font-weight: bold; font-size: 18px;">${order.orderNo}</div>
            <div style="font-size: 12px; color: #666;">วันที่: ${dateFormatter.format(new Date(order.orderDate))}</div>
          </div>
        </div>

        <div class="title">${title}</div>

        <div class="info-grid">
          <div class="info-box">
            <div class="info-label">${isPO ? 'ผู้สั่งซื้อ / ปลายทาง' : 'ผู้รับสินค้า / ปลายทาง'}</div>
            <div class="info-value">${order.fromBranchName}</div>
            <div class="info-label" style="margin-top: 10px;">ผู้ทำรายการ</div>
            <div class="info-value">${order.requestedBy}</div>
          </div>
          <div class="info-box">
            <div class="info-label">${isPO ? 'ผู้จำหน่าย / ต้นทาง' : 'ผู้ส่งสินค้า / ต้นทาง'}</div>
            <div class="info-value">${order.assignedFromBranchName || "ปั๊มไฮโซ"}</div>
            <div class="info-label" style="margin-top: 10px;">เลขที่ขนส่ง / วันที่ส่ง</div>
            <div class="info-value">${order.transportNo || '-'} / ${order.deliveryDate ? dateFormatter.format(new Date(order.deliveryDate)) : '-'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50px;">ลำดับ</th>
              <th>รายการน้ำมัน</th>
              <th style="text-align: right;">จำนวน (ลิตร)</th>
              <th style="text-align: right;">ราคา/ลิตร</th>
              <th style="text-align: right;">จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.oilType}</td>
                <td style="text-align: right;">${item.quantity.toLocaleString()}</td>
                <td style="text-align: right;">${item.pricePerLiter.toFixed(2)}</td>
                <td style="text-align: right;">${item.totalAmount.toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2" style="text-align: right;">รวมทั้งสิ้น</td>
              <td style="text-align: right;">${order.items.reduce((sum, i) => sum + i.quantity, 0).toLocaleString()}</td>
              <td></td>
              <td style="text-align: right;">${order.totalAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div class="info-box" style="margin-bottom: 40px;">
          <div class="info-label">หมายเหตุ</div>
          <div class="info-value">${order.notes || '-'}</div>
        </div>

        <div class="footer">
          <div>
            <div class="signature-line">ผู้สั่งซื้อ / ผู้รับสินค้า</div>
            <div style="margin-top: 5px;">(......................................................)</div>
          </div>
          <div>
            <div class="signature-line">ผู้อนุมัติ / ผู้ส่งสินค้า</div>
            <div style="margin-top: 5px;">(......................................................)</div>
          </div>
          <div>
            <div class="signature-line">เจ้าหน้าที่คลังน้ำมัน</div>
            <div style="margin-top: 5px;">(......................................................)</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            // window.close(); // ปิดหน้าต่างหลังจากพิมพ์ (ถ้าต้องการ)
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const getStatusColor = (status: InternalOilOrder["status"]) => {
    switch (status) {
      case "รออนุมัติ":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "อนุมัติแล้ว":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "กำลังจัดส่ง":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "ส่งแล้ว":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "ยกเลิก":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ShoppingCart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            จัดการการสั่งซื้อน้ำมันภายในปั๊ม
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-600 dark:text-gray-400">
              ดูและจัดการการสั่งซื้อน้ำมันจากปั๊มต่างๆ ในเครือข่าย (เฉพาะสาขาไฮโซ)
            </p>
            {!isHisoSelected && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 shadow-sm backdrop-blur-sm">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  กรุณาเลือก &quot;ปั๊มไฮโซ&quot; ที่หน้าบาร์เพื่อดูข้อมูล
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">รออนุมัติ</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">อนุมัติแล้ว</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.approved}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">กำลังจัดส่ง</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.delivering}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Truck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ส่งแล้ว</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเลขที่ออเดอร์, ปั๊ม..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                title="วันที่เริ่มต้น"
              />
              <span className="text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">ถึง</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                title="วันที่สิ้นสุด"
              />
            </div>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">ทุกปั๊ม</option>
              {branches
                .sort((a, b) => {
                  const branchOrder = ["ปั๊มไฮโซ", "ดินดำ", "หนองจิก", "ตักสิลา", "บายพาส"];
                  return branchOrder.indexOf(a.name) - branchOrder.indexOf(b.name);
                })
                .map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | InternalOilOrder["status"])}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="รออนุมัติ">รออนุมัติ</option>
              <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
              <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
              <option value="ส่งแล้ว">ส่งแล้ว</option>
              <option value="ยกเลิก">ยกเลิก</option>
            </select>
            {(filterDateFrom || filterDateTo || searchTerm || filterStatus !== "all" || filterBranch !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterBranch("all");
                  setFilterDateFrom("");
                  setFilterDateTo("");
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600 whitespace-nowrap"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  เลขที่ออเดอร์
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  ปั๊มที่สั่ง
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  วันที่ต้องการ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  ปั๊มที่จะส่ง
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  รายการน้ำมัน
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  มูลค่ารวม
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-purple-50/50 dark:hover:bg-gray-700/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{order.orderNo}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{order.fromBranchName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {dateFormatter.format(new Date(order.requestedDate))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.assignedFromBranchName ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {order.assignedFromBranchName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">ยังไม่ได้กำหนด</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{item.oilType}:</span>
                          <span className="text-gray-600 dark:text-gray-400 ml-1">
                            {numberFormatter.format(item.quantity)} ลิตร
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {numberFormatter.format(order.totalAmount)} บาท
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 justify-center">
                      {order.status === "รออนุมัติ" && (
                        <>
                        <button
                          onClick={() => handleApprove(order)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                        >
                            ยืนยัน
                        </button>
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium shadow-sm"
                          >
                            ยกเลิก
                          </button>
                        </>
                      )}
                      {order.status === "อนุมัติแล้ว" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "กำลังจัดส่ง")}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                        >
                          เริ่มจัดส่ง
                        </button>
                      )}
                      {order.status === "กำลังจัดส่ง" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "ส่งแล้ว")}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                        >
                          ส่งแล้ว
                        </button>
                      )}
                      <button
                        onClick={() => handleViewDetail(order)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">ไม่พบรายการสั่งซื้อ</p>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  รายละเอียดออเดอร์ - {selectedOrder.orderNo}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">สถานะ</span>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      ปั๊มที่สั่ง
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.fromBranchName}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      วันที่ต้องการ
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {dateFormatter.format(new Date(selectedOrder.requestedDate))}
                    </p>
                  </div>
                  {selectedOrder.assignedFromBranchName && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        ปั๊มที่จะส่ง
                      </p>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {selectedOrder.assignedFromBranchName}
                      </p>
                    </div>
                  )}
                  {selectedOrder.transportNo && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        เลขที่ขนส่ง
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.transportNo}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      ผู้สั่งซื้อ
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.requestedBy}</p>
                  </div>
                  {selectedOrder.approvedBy && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        ผู้อนุมัติ
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.approvedBy}</p>
                    </div>
                  )}
                </div>

                {/* รายการน้ำมัน */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">รายการน้ำมัน</p>
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-800/50 p-4 rounded-xl border border-blue-200 dark:border-gray-600"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-bold text-gray-900 dark:text-white text-lg">{item.oilType}</p>
                          {selectedOrder.status !== "รออนุมัติ" && selectedOrder.status !== "ยกเลิก" && (
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold shadow-sm">
                              ฿{item.pricePerLiter.toFixed(2)} / ลิตร
                                </span>
                          )}
                              </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">จำนวนที่สั่ง</p>
                            <p className="font-bold text-gray-700 dark:text-gray-300">
                              {(item.requestedQuantity || item.quantity).toLocaleString()} ลิตร
                            </p>
                              </div>
                          <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-green-100 dark:border-green-900/30">
                            <p className="text-[10px] text-green-600 dark:text-green-400 uppercase font-bold mb-1">จำนวนที่ส่งจริง</p>
                            <p className={`font-bold ${selectedOrder.status === "รออนุมัติ" ? "text-gray-400 italic" : "text-green-600 dark:text-green-400"}`}>
                              {selectedOrder.status === "รออนุมัติ" ? "รอการยืนยัน" : `${item.quantity.toLocaleString()} ลิตร`}
                            </p>
                          </div>
                        </div>

                        {selectedOrder.status !== "รออนุมัติ" && selectedOrder.status !== "ยกเลิก" && (
                          <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-900/30 flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-500">มูลค่ารายการนี้</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">฿{item.totalAmount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">มูลค่ารวมทั้งหมด:</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {numberFormatter.format(selectedOrder.totalAmount)} บาท
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedOrder.status !== "รออนุมัติ" && selectedOrder.status !== "ยกเลิก" && (
                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">เอกสารดิจิทัล</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleDownload("po", selectedOrder)}
                        className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 text-blue-600 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all shadow-sm group"
                      >
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-bold uppercase text-gray-400">เอกสารใบสั่งซื้อ</p>
                          <p className="text-sm font-bold">Download PO (PDF)</p>
                        </div>
                        <Download className="w-4 h-4 ml-auto text-gray-300" />
                      </button>
                      <button 
                        onClick={() => handleDownload("dn", selectedOrder)}
                        className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 text-purple-600 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-all shadow-sm group"
                      >
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-bold uppercase text-gray-400">เอกสารใบส่งของ</p>
                          <p className="text-sm font-bold">Download DN (PDF)</p>
                        </div>
                        <Download className="w-4 h-4 ml-auto text-gray-300" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  อนุมัติและกำหนดการจัดส่ง - {selectedOrder.orderNo}
                </h2>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    📋 ตรวจสอบคำขอจาก: {selectedOrder.fromBranchName}
                  </p>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>วันที่ต้องการ: {dateFormatter.format(new Date(selectedOrder.requestedDate))}</p>
                    <p>จำนวนที่ขอมาทั้งหมด: {numberFormatter.format(selectedOrder.items.reduce((sum, i) => sum + (i.requestedQuantity || i.quantity), 0))} ลิตร</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    วันที่ส่ง
                  </label>
                  <input
                    id="deliveryDate"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={selectedOrder.requestedDate}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* รายการน้ำมันที่จะส่ง */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      รายการน้ำมันที่จะส่ง *
                    </span>
                    <button
                      type="button"
                      onClick={handleAddDeliveryItem}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      เพิ่มรายการน้ำมัน
                    </button>
                  </div>
                  <div className="space-y-6">
                    {deliveryItems.map((item: DeliveryItem, index) => (
                      <div
                        key={index}
                        className={`p-5 rounded-2xl border-2 ${
                          item.isFromOrder
                            ? "bg-white dark:bg-gray-800 border-blue-100 dark:border-blue-900/50 shadow-sm"
                            : "bg-white dark:bg-gray-800 border-purple-100 dark:border-purple-900/50 shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            {item.isFromOrder ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md">
                                จากออเดอร์
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-md">
                                เพิ่มใหม่
                              </span>
                            )}
                            {item.isFromOrder ? (
                              <h3 className="font-bold text-gray-900 dark:text-white">{item.oilType}</h3>
                            ) : (
                              <select
                                value={item.oilType}
                                onChange={(e) => handleUpdateDeliveryItem(index, "oilType", e.target.value as OilType)}
                                className="px-3 py-1 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                              >
                                {oilTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDeliveryItem(index)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* ส่วนเลือกปั๊มและแหล่งที่มา */}
                          <div className="space-y-4">
                            <div>
                              <label htmlFor={`assigned-branch-${index}`} className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                ปั๊มที่จะส่งให้ *
                              </label>
                              <select
                                id={`assigned-branch-${index}`}
                                value={item.assignedFromBranchId}
                                onChange={(e) => handleUpdateDeliveryItem(index, "assignedFromBranchId", Number(e.target.value))}
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    {branches.filter((b) => b.id !== selectedOrder.fromBranchId).map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                              <label htmlFor={`delivery-source-${index}`} className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                แหล่งที่มาของน้ำมัน *
                  </label>
                              <select
                                 id={`delivery-source-${index}`}
                                 value={item.deliverySource}
                                 onChange={(e) => {
                                   const source = e.target.value as "truck" | "suction";
                                   handleUpdateDeliveryItem(index, "deliverySource", source);
                                   handleUpdateDeliveryItem(index, "selectedTruckTripId", "");
                                   handleUpdateDeliveryItem(index, "transportNo", "");
                                 }}
                                 className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                               >
                               <option value="truck">ขายให้จากน้ำมันในรถ</option>
                               <option value="suction">ขายให้จากการดูด</option>
                             </select>
                           </div>
                </div>

                          <div className="space-y-4">
                            {item.deliverySource === "truck" && (
                <div>
                                <label htmlFor={`truck-trip-${index}`} className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                  เลือกรอบการจัดส่ง *
                  </label>
                  <select
                                  id={`truck-trip-${index}`}
                                  value={item.selectedTruckTripId}
                    onChange={(e) => {
                                     const tripId = e.target.value;
                                     const trips = getAvailableTrips(item.assignedFromBranchId, item.oilType);
                                     const trip = trips.find(t => t.id === tripId);
                                     if (trip) {
                                       let newNo = trip.transportNo;
                                       // ถ้าสถานะเป็น 'completed' (จัดส่งแล้วแต่มีน้ำมันค้าง) ต้องสร้างเลขขนส่งใหม่ทันที
                                       if (trip.status === "completed") {
                                         const now = new Date();
                                         const dateStr = now.getFullYear().toString() + 
                                                       (now.getMonth() + 1).toString().padStart(2, '0') + 
                                                       now.getDate().toString().padStart(2, '0');
                                         const random = Math.floor(100 + Math.random() * 900).toString();
                                         newNo = `IT-${dateStr}-${random}`;
                                       }
                                       
                                       const sourceItem = trip.items.find(it => it.oilType === item.oilType);
                                       const updates: Partial<DeliveryItem> = {
                                         selectedTruckTripId: tripId,
                                         transportNo: newNo,
                                       };
                                       
                                       if (sourceItem) {
                                         updates.sourceAvailableQty = sourceItem.quantity;
                                         // อัพเดตจำนวนที่จะส่งให้ไม่เกินจำนวนที่มีบนรถ
                                         if (item.quantityToDeliver > sourceItem.quantity) {
                                           updates.quantityToDeliver = sourceItem.quantity;
                                         }
                                       }
                                       
                                       handleUpdateDeliveryItemMultiple(index, updates);
                                     }
                                   }}
                                  className="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50/30 dark:bg-blue-900/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                  <option value="">เลือกรอบรถ</option>
                                   {getAvailableTrips(item.assignedFromBranchId, item.oilType).map((trip) => {
                                     const qty = trip.items.find(it => it.oilType === item.oilType)?.quantity || 0;
                                     let statusLabel = "";
                                     let statusColor = "";
                                     
                                     if (trip.status === "completed") {
                                       statusLabel = "จัดส่งแล้ว-มีน้ำมันค้างบนรถ (สร้างรอบใหม่)";
                                       statusColor = "text-orange-600";
                                     } else {
                                       statusLabel = "กำลังอยู่ระหว่างจัดส่ง";
                                       statusColor = "text-blue-600";
                                     }

                                     return (
                                       <option key={trip.id} value={trip.id} className={statusColor}>
                                         {trip.transportNo} | {qty.toLocaleString()} ลิตร - {statusLabel}
                      </option>
                                     );
                                   })}
                  </select>

                                 {/* แสดงรายละเอียดน้ำมันทั้งหมดในรถรอบนี้ */}
                                 {item.selectedTruckTripId && (
                                   <div className="mt-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                                     <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-2 flex items-center gap-1">
                                       <Truck className="w-3 h-3" /> รายละเอียดน้ำมันทั้งหมดบนรถ
                                     </p>
                                     <div className="space-y-1">
                                       {(() => {
                                         const trip = mockAvailableTransports.find(t => t.id === item.selectedTruckTripId);
                                         if (!trip) return null;
                                         return (
                                           <>
                                             {trip.items.map((it, i) => (
                                               <div key={i} className="flex justify-between text-[11px]">
                                                 <span className={it.oilType === item.oilType ? "font-bold text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"}>
                                                   {it.oilType} {it.oilType === item.oilType && "(รายการที่เลือก)"}
                          </span>
                                                 <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                                                   {it.quantity.toLocaleString()} ลิตร
                          </span>
                        </div>
                                             ))}
                                             <div className="mt-1 pt-1 border-t border-blue-200 dark:border-blue-800 flex justify-between text-[11px] font-bold">
                                               <span>รวมน้ำมันบนรถทั้งหมด:</span>
                                               <span className="text-blue-700 dark:text-blue-300">
                                                 {trip.items.reduce((sum, it) => sum + it.quantity, 0).toLocaleString()} ลิตร
                          </span>
                        </div>
                                           </>
                                         );
                                       })()}
                        </div>
                        </div>
                                 )}
                               </div>
                            )}

                            {item.deliverySource === "suction" && (
                        <div>
                                <label htmlFor={`suction-record-${index}`} className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                  เลือกรายการที่ดูดมา *
                                </label>
                                <select
                                  id={`suction-record-${index}`}
                                  value={item.selectedTruckTripId}
                                   onChange={(e) => {
                                     const recId = e.target.value;
                                     const records = getAvailableSuctionRecords(item.assignedFromBranchId, item.oilType);
                                     const record = records.find(r => r.id === recId);
                                     if (record) {
                                       const now = new Date();
                                       const dateStr = now.getFullYear().toString() + 
                                                     (now.getMonth() + 1).toString().padStart(2, '0') + 
                                                     now.getDate().toString().padStart(2, '0');
                                       const random = Math.floor(100 + Math.random() * 900).toString();
                                       const newNo = `SUC-${dateStr}-${random}`;
                                       
                                       const sourceItem = record.items.find(it => it.oilType === item.oilType);
                                       const updates: Partial<DeliveryItem> = {
                                         selectedTruckTripId: recId,
                                         transportNo: newNo,
                                       };
                                       
                                       if (sourceItem) {
                                         updates.sourceAvailableQty = sourceItem.quantity;
                                         // ล็อคจำนวนที่จะส่งให้ไม่เกินจำนวนที่มีจากการดูด
                                         if (item.quantityToDeliver > sourceItem.quantity) {
                                           updates.quantityToDeliver = sourceItem.quantity;
                                         }
                                       }
                                       
                                       handleUpdateDeliveryItemMultiple(index, updates);
                                     }
                                   }}
                                  className="w-full px-3 py-2 text-sm border border-purple-200 dark:border-purple-800 rounded-xl bg-purple-50/30 dark:bg-blue-900/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                  <option value="">เลือกรายการดูด</option>
                                   {getAvailableSuctionRecords(item.assignedFromBranchId, item.oilType).map((rec) => {
                                     const qty = rec.items.find(it => it.oilType === item.oilType)?.quantity || 0;
                                     return (
                                       <option key={rec.id} value={rec.id}>
                                         {rec.date} - {rec.notes} | {qty.toLocaleString()} ลิตร
                                       </option>
                                     );
                                   })}
                                 </select>

                                 {/* แสดงรายละเอียดน้ำมันทั้งหมดที่ดูดมา */}
                                 {item.selectedTruckTripId && (
                                   <div className="mt-2 p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800">
                                     <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase mb-2 flex items-center gap-1">
                                       <Droplet className="w-3 h-3" /> รายละเอียดการดูดน้ำมันทั้งหมด
                                     </p>
                                     <div className="space-y-1">
                                       {(() => {
                                         const record = mockSuctionOilRecords.find(r => r.id === item.selectedTruckTripId);
                                         if (!record) return null;
                                         return (
                                           <>
                                             {record.items.map((it, i) => (
                                               <div key={i} className="flex justify-between text-[11px]">
                                                 <span className={it.oilType === item.oilType ? "font-bold text-purple-700 dark:text-purple-300" : "text-gray-600 dark:text-gray-400"}>
                                                   {it.oilType} {it.oilType === item.oilType && "(รายการที่เลือก)"}
                                                 </span>
                                                 <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                                                   {it.quantity.toLocaleString()} ลิตร
                          </span>
                              </div>
                            ))}
                                             <div className="mt-1 pt-1 border-t border-purple-200 dark:border-purple-800 flex justify-between text-[11px] font-bold">
                                               <span>รวมน้ำมันที่ดูดมาทั้งหมด:</span>
                                               <span className="text-purple-700 dark:text-purple-300">
                                                 {record.items.reduce((sum, it) => sum + it.quantity, 0).toLocaleString()} ลิตร
                                               </span>
                          </div>
                                           </>
                                         );
                                       })()}
                        </div>
                    </div>
                  )}
                </div>
                            )}

                            <div>
                              <label htmlFor={`transport-no-${index}`} className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                เลขที่ขนส่ง / อ้างอิง
                              </label>
                              <input
                                id={`transport-no-${index}`}
                                type="text"
                                value={item.transportNo || ""}
                                onChange={(e) => handleUpdateDeliveryItem(index, "transportNo", e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="ระบุเลขที่ขนส่ง"
                              />
                            </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                              <div>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              จำนวนที่ขอ (ลิตร)
                            </span>
                            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm font-semibold text-gray-500">
                              {numberFormatter.format(item.quantity)}
                              </div>
                          </div>
                                <div>
                            <label htmlFor={`qty-del-${index}`} className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              จะส่งจริง (ลิตร) *
                                  </label>
                                  <input
                              id={`qty-del-${index}`}
                              type="number"
                              value={item.quantityToDeliver}
                              onChange={(e) => handleUpdateDeliveryItem(index, "quantityToDeliver", Number(e.target.value))}
                              className="w-full px-3 py-2 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {item.sourceAvailableQty !== undefined && (
                              <p className="mt-1 text-[10px] text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                จำนวนในแหล่งที่มา: {item.sourceAvailableQty.toLocaleString()} ลิตร
                              </p>
                            )}
                          </div>
                              <div>
                            <label htmlFor={`price-${index}`} className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              ราคา/ลิตร *
                                </label>
                                <input
                              id={`price-${index}`}
                                  type="number"
                              value={item.pricePerLiter}
                              onChange={(e) => handleUpdateDeliveryItem(index, "pricePerLiter", Number(e.target.value))}
                              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                              </div>
                              <div>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              รวมเงิน
                                </span>
                            <div className="px-3 py-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400 text-right">
                              ฿{numberFormatter.format(item.totalAmount)}
                              </div>
                              </div>
                        </div>
                      </div>
                    ))}
                      </div>

                  {deliveryItems.length > 0 && selectedOrder && (
                    <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-900/10 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-inner">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShoppingCart className="w-3 h-3" /> สรุปข้อมูลการจัดส่งทั้งหมด
                      </p>

                      {/* รายละเอียดหลักของออเดอร์ */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">เลขที่ใบสั่งซื้อ</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{selectedOrder.orderNo}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">สั่งซื้อจากปั๊ม</span>
                          <span className="text-sm font-black text-blue-600 dark:text-blue-400">{selectedOrder.fromBranchName}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">เลขที่ขนส่งอ้างอิง</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Array.from(new Set(deliveryItems.map(item => item.transportNo).filter(Boolean))).length > 0 ? (
                              Array.from(new Set(deliveryItems.map(item => item.transportNo).filter(Boolean))).map((no, idx) => (
                                <span key={idx} className="inline-block px-2 py-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-lg text-[10px] font-bold shadow-sm">
                                  {no}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">ยังไม่ระบุเลขขนส่ง</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ฝั่งสรุปจำนวนน้ำมันแยกตามประเภท */}
                        <div className="space-y-2">
                          {Array.from(new Set(deliveryItems.map(item => item.oilType))).map(oilType => {
                            const totalQty = deliveryItems
                              .filter(item => item.oilType === oilType)
                              .reduce((sum, item) => sum + item.quantityToDeliver, 0);
                            if (totalQty === 0) return null;
                            return (
                              <div key={oilType} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400 font-medium">{oilType}</span>
                                <span className="font-bold text-gray-900 dark:text-white">{totalQty.toLocaleString()} ลิตร</span>
                              </div>
                            );
                          })}
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm font-black">
                            <span className="text-blue-600 dark:text-blue-400">รวมจำนวนลิตรทั้งสิ้น:</span>
                            <span className="text-blue-600 dark:text-blue-400 underline decoration-double">
                              {deliveryItems.reduce((sum, item) => sum + item.quantityToDeliver, 0).toLocaleString()} ลิตร
                            </span>
                          </div>
                        </div>

                        {/* ฝั่งสรุปยอดเงินรวม */}
                        <div className="flex flex-col justify-end items-end border-l border-gray-200 dark:border-gray-700 pl-6">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">มูลค่ารวมที่จะส่งทั้งสิ้น</span>
                          <span className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">
                            ฿{numberFormatter.format(deliveryItems.reduce((sum, item) => sum + item.totalAmount, 0))}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium mt-1">* ราคานี้รวมภาษีมูลค่าเพิ่มแล้ว (ถ้ามี)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="notesInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    หมายเหตุ
                  </label>
                  <textarea
                    id="notesInput"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ระบุหมายเหตุ (ถ้ามี)"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveAssignment}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    อนุมัติและบันทึก
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getStatusText(status: InternalOilOrder["status"]): string {
  return status;
}
