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
} from "lucide-react";
import { branches } from "../../data/gasStationOrders";
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
];

// Mock data - ราคาน้ำมันต่อลิตร
const oilPrices = new Map<OilType, number>([
  ["Premium Diesel", 32.50],
  ["Diesel", 30.00],
  ["Premium Gasohol 95", 45.00],
  ["Gasohol 95", 43.00],
  ["Gasohol 91", 38.00],
  ["E20", 35.00],
  ["E85", 33.00],
  ["Gasohol E20", 35.00],
]);

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

// Mock data - Internal Oil Orders (ดึงจาก InternalOilOrder.tsx)
const mockInternalOrders: InternalOilOrder[] = [
  {
    id: "1",
    orderNo: "IO-20241215-001",
    orderDate: "2024-12-15",
    requestedDate: "2024-12-20",
    fromBranchId: 2,
    fromBranchName: "ดินดำ",
    items: [
      { oilType: "Premium Diesel", quantity: 5000, pricePerLiter: 32.50, totalAmount: 162500 },
      { oilType: "Gasohol 95", quantity: 3000, pricePerLiter: 43.00, totalAmount: 129000 },
    ],
    totalAmount: 291500,
    status: "รออนุมัติ",
    requestedBy: "ผู้จัดการดินดำ",
    requestedAt: "2024-12-15T10:30:00",
  },
  {
    id: "2",
    orderNo: "IO-20241215-002",
    orderDate: "2024-12-15",
    requestedDate: "2024-12-18",
    fromBranchId: 3,
    fromBranchName: "หนองจิก",
    items: [
      { oilType: "Diesel", quantity: 4000, pricePerLiter: 30.00, totalAmount: 120000 },
    ],
    totalAmount: 120000,
    status: "อนุมัติแล้ว",
    requestedBy: "ผู้จัดการหนองจิก",
    requestedAt: "2024-12-15T11:00:00",
    approvedBy: "พี่นิด",
    approvedAt: "2024-12-15T14:00:00",
    assignedFromBranchId: 1,
    assignedFromBranchName: "ปั๊มไฮโซ",
  },
];

export default function InternalOilOrderManagement() {
  const [internalOrders, setInternalOrders] = useState<InternalOilOrder[]>(mockInternalOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | InternalOilOrder["status"]>("all");
  const [filterBranch, setFilterBranch] = useState<number | "all">("all");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<InternalOilOrder | null>(null);
  const [assignedFromBranchId, setAssignedFromBranchId] = useState<number>(1);
  const [transportNo, setTransportNo] = useState<string>("");
  const [selectedTransportNo, setSelectedTransportNo] = useState<string>(""); // เลขที่ขนส่งที่เลือกจาก dropdown
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  // State for managing oil items (แสดงและแก้ไขรายการน้ำมัน)
  const [deliveryItems, setDeliveryItems] = useState<Array<{
    oilType: OilType;
    quantity: number; // จำนวนที่สั่ง
    quantityToDeliver: number; // จำนวนที่จะส่งจริง
    pricePerLiter: number;
    totalAmount: number;
    isFromOrder: boolean; // มาจากออเดอร์หรือเพิ่มใหม่
  }>>([]);

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
    return internalOrders.filter((order) => {
      const matchesSearch =
        order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.assignedFromBranchName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || order.status === filterStatus;
      const matchesBranch = filterBranch === "all" || order.fromBranchId === filterBranch;
      const matchesDate = isDateInRange(order.orderDate, filterDateFrom, filterDateTo);
      return matchesSearch && matchesStatus && matchesBranch && matchesDate;
    });
  }, [internalOrders, searchTerm, filterStatus, filterBranch, filterDateFrom, filterDateTo]);

  // Statistics
  const stats = useMemo(() => {
    const total = internalOrders.length;
    const pending = internalOrders.filter((o) => o.status === "รออนุมัติ").length;
    const approved = internalOrders.filter((o) => o.status === "อนุมัติแล้ว").length;
    const delivering = internalOrders.filter((o) => o.status === "กำลังจัดส่ง").length;
    const completed = internalOrders.filter((o) => o.status === "ส่งแล้ว").length;
    return { total, pending, approved, delivering, completed };
  }, [internalOrders]);

  const handleViewDetail = (order: InternalOilOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleApprove = (order: InternalOilOrder) => {
    setSelectedOrder(order);
    setAssignedFromBranchId(1); // Default: ปั๊มไฮโซ
    setTransportNo("");
    setDeliveryDate(order.requestedDate);
    setNotes("");
    // Initialize delivery items from order items
    setDeliveryItems(order.items.map((item) => ({
      oilType: item.oilType,
      quantity: item.quantity, // จำนวนที่สั่ง
      quantityToDeliver: item.quantity, // Default: ส่งตามที่สั่ง
      pricePerLiter: item.pricePerLiter,
      totalAmount: item.totalAmount,
      isFromOrder: true, // มาจากออเดอร์
    })));
    setShowAssignModal(true);
  };

  const handleAddDeliveryItem = () => {
    setDeliveryItems([...deliveryItems, {
      oilType: "Premium Diesel",
      quantity: 0, // ไม่มีในออเดอร์
      quantityToDeliver: 0,
      pricePerLiter: oilPrices.get("Premium Diesel") || 0,
      totalAmount: 0,
      isFromOrder: false, // เพิ่มใหม่
    }]);
  };

  const handleRemoveDeliveryItem = (index: number) => {
    setDeliveryItems(deliveryItems.filter((_, i) => i !== index));
  };

  const handleUpdateDeliveryItem = (index: number, field: "oilType" | "quantityToDeliver", value: OilType | number) => {
    setDeliveryItems(prevItems => prevItems.map((item, i) => {
      if (i !== index) return item;

      if (field === "oilType") {
        const oilType = value as OilType;
        const pricePerLiter = oilPrices.get(oilType) || 0;
        return {
          ...item,
          oilType,
          pricePerLiter,
          totalAmount: item.quantityToDeliver * pricePerLiter,
        };
      } else {
        const quantityToDeliver = value as number;
        return {
          ...item,
          quantityToDeliver,
          totalAmount: quantityToDeliver * item.pricePerLiter,
        };
      }
    }));
  };

  const handleSaveAssignment = () => {
    if (!selectedOrder) return;
    if (!assignedFromBranchId) {
      alert("กรุณาเลือกปั๊มที่จะส่งน้ำมัน");
      return;
    }
    if (!deliveryDate) {
      alert("กรุณาเลือกวันที่ส่ง");
      return;
    }
    if (deliveryItems.length === 0) {
      alert("กรุณาเพิ่มรายการน้ำมันที่จะส่ง");
      return;
    }
    if (deliveryItems.some((item) => item.quantityToDeliver <= 0)) {
      alert("กรุณากรอกจำนวนน้ำมันที่จะส่งให้ถูกต้อง");
      return;
    }

    const assignedBranch = branches.find((b) => b.id === assignedFromBranchId);

    // Calculate total amount from delivery items
    const totalAmount = deliveryItems.reduce((sum, item) => sum + item.totalAmount, 0);

    // Update order with delivery items
    const updatedOrders = internalOrders.map((order) => {
      if (order.id === selectedOrder.id) {
        return {
          ...order,
          status: "อนุมัติแล้ว" as const,
          approvedBy: "พี่นิด",
          approvedAt: new Date().toISOString(),
          assignedFromBranchId,
          assignedFromBranchName: assignedBranch?.name || "",
          transportNo: transportNo || undefined,
          deliveryDate,
          notes,
          // Update items with delivery items
          items: deliveryItems.map((item) => ({
            oilType: item.oilType,
            quantity: item.quantityToDeliver, // จำนวนที่จะส่งจริง
            pricePerLiter: item.pricePerLiter,
            totalAmount: item.totalAmount,
          })),
          totalAmount, // Update total amount
        };
      }
      return order;
    });

    setInternalOrders(updatedOrders);
    setShowAssignModal(false);
    setSelectedOrder(null);
    setDeliveryItems([]);
    alert(`อนุมัติออเดอร์สำเร็จ!\n\nเลขที่ออเดอร์: ${selectedOrder.orderNo}\nปั๊มที่จะส่ง: ${assignedBranch?.name}\nมูลค่ารวม: ${numberFormatter.format(totalAmount)} บาท`);
  };

  const handleUpdateStatus = (orderId: string, newStatus: InternalOilOrder["status"]) => {
    const updatedOrders = internalOrders.map((order) => {
      if (order.id === orderId) {
        return { ...order, status: newStatus };
      }
      return order;
    });
    setInternalOrders(updatedOrders);
  };

  // Get selected transport order
  const selectedTransport = mockAvailableTransports.find(
    (t) => t.transportNo === selectedTransportNo
  ) || null;

  // Get available transports (ที่ยังไม่เลยเวลาส่ง)
  const availableTransports = mockAvailableTransports.filter(
    (t) => t.status === "ready-to-pickup" || t.status === "picking-up"
  );

  // Handle assign to transport
  const handleAssignToTransport = () => {
    if (!selectedTransportNo) {
      alert("กรุณาเลือกเลขที่ขนส่ง");
      return;
    }
    if (!selectedOrder) return;
    if (deliveryItems.length === 0) {
      alert("กรุณาเพิ่มรายการน้ำมันที่จะส่ง");
      return;
    }
    if (deliveryItems.some((item) => item.quantityToDeliver <= 0)) {
      alert("กรุณากรอกจำนวนน้ำมันที่จะส่งให้ถูกต้อง");
      return;
    }

    // อัพเดต Internal Order ให้เชื่อมกับ Transport
    const updatedOrders = internalOrders.map((order) => {
      if (order.id === selectedOrder.id) {
        return {
          ...order,
          status: "กำลังจัดส่ง" as const,
          transportNo: selectedTransportNo,
          assignedFromBranchId: selectedTransport?.fromBranchId || assignedFromBranchId,
          assignedFromBranchName: selectedTransport?.fromBranchName || branches.find((b) => b.id === assignedFromBranchId)?.name || "",
          deliveryDate: deliveryDate || selectedTransport?.departureDate,
          notes: notes || `ยัดข้อมูลไปยังรถขนส่ง: ${selectedTransport?.truckPlateNumber} (${selectedTransport?.driverName})`,
        };
      }
      return order;
    });

    setInternalOrders(updatedOrders);
    setShowAssignModal(false);
    setSelectedOrder(null);
    setDeliveryItems([]);
    setSelectedTransportNo("");
    alert(`ยัดข้อมูลน้ำมันไปยังรถขนส่งสำเร็จ!\n\nเลขที่ขนส่ง: ${selectedTransportNo}\nรถ: ${selectedTransport?.truckPlateNumber}\nคนขับ: ${selectedTransport?.driverName}\nมูลค่ารวม: ${numberFormatter.format(deliveryItems.reduce((sum, item) => sum + item.totalAmount, 0))} บาท`);
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
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            ดูและจัดการการสั่งซื้อน้ำมันจากปั๊มต่างๆ ในเครือข่าย
          </p>
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
              <label htmlFor="filter-date-from" className="sr-only">วันที่เริ่มต้น</label>
              <input
                id="filter-date-from"
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                title="วันที่เริ่มต้น"
              />
              <span className="text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">ถึง</span>
              <label htmlFor="filter-date-to" className="sr-only">วันที่สิ้นสุด</label>
              <input
                id="filter-date-to"
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                title="วันที่สิ้นสุด"
              />
            </div>
            <div>
              <label htmlFor="filter-branch" className="sr-only">กรองปั๊ม</label>
              <select
                id="filter-branch"
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
            </div>
            <div>
              <label htmlFor="filter-status" className="sr-only">กรองสถานะ</label>
              <select
                id="filter-status"
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
            </div>
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
                        <button
                          onClick={() => handleApprove(order)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                        >
                          อนุมัติ
                        </button>
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
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{item.oilType}</p>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">จำนวน:</span>
                                <span className="font-semibold text-gray-900 dark:text-white ml-2">
                                  {numberFormatter.format(item.quantity)} ลิตร
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">ราคาต่อลิตร:</span>
                                <span className="font-semibold text-gray-900 dark:text-white ml-2">
                                  {numberFormatter.format(item.pricePerLiter)} บาท
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">มูลค่ารวม</p>
                            <p className="font-bold text-blue-600 dark:text-blue-400">
                              {numberFormatter.format(item.totalAmount)} บาท
                            </p>
                          </div>
                        </div>
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
                    📋 ออเดอร์จาก: {selectedOrder.fromBranchName}
                  </p>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>วันที่ต้องการ: {dateFormatter.format(new Date(selectedOrder.requestedDate))}</p>
                    <p>มูลค่ารวม (ที่สั่ง): {numberFormatter.format(selectedOrder.totalAmount)} บาท</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="assign-branch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ปั๊มที่จะส่งน้ำมันให้ *
                  </label>
                  <select
                    id="assign-branch"
                    value={assignedFromBranchId}
                    onChange={(e) => setAssignedFromBranchId(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    {branches.filter((b) => b.id !== selectedOrder.fromBranchId).map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="assign-delivery-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    วันที่ส่ง
                  </label>
                  <input
                    id="assign-delivery-date"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={selectedOrder.requestedDate}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="assign-transport-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    เลือกเลขที่ขนส่ง (รถที่ยังไม่เลยเวลาส่ง) *
                  </label>
                  <select
                    id="assign-transport-select"
                    value={selectedTransportNo}
                    onChange={(e) => {
                      setSelectedTransportNo(e.target.value);
                      const transport = mockAvailableTransports.find((t) => t.transportNo === e.target.value);
                      if (transport) {
                        setTransportNo(transport.transportNo);
                        setAssignedFromBranchId(transport.fromBranchId);
                        setDeliveryDate(transport.departureDate);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">เลือกเลขที่ขนส่ง</option>
                    {availableTransports.map((transport) => (
                      <option key={transport.id} value={transport.transportNo}>
                        {transport.transportNo} - {transport.truckPlateNumber} ({transport.driverName}) - {transport.toBranchName} - {transport.status === "ready-to-pickup" ? "พร้อมรับ" : "กำลังไปรับ"}
                      </option>
                    ))}
                  </select>
                  {selectedTransport && (
                    <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        🚛 ข้อมูลรถขนส่ง: {selectedTransport.transportNo}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">รถ:</span>
                          <span className="font-medium text-gray-900 dark:text-white ml-1">
                            {selectedTransport.truckPlateNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">หาง:</span>
                          <span className="font-medium text-gray-900 dark:text-white ml-1">
                            {selectedTransport.trailerPlateNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">คนขับ:</span>
                          <span className="font-medium text-gray-900 dark:text-white ml-1">
                            {selectedTransport.driverName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">ปลายทาง:</span>
                          <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                            {selectedTransport.toBranchName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">วันที่ออก:</span>
                          <span className="font-medium text-gray-900 dark:text-white ml-1">
                            {dateFormatter.format(new Date(selectedTransport.departureDate))}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">สถานะ:</span>
                          <span className={`font-medium ml-1 ${selectedTransport.status === "ready-to-pickup"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-orange-600 dark:text-orange-400"
                            }`}>
                            {selectedTransport.status === "ready-to-pickup" ? "พร้อมรับ" : "กำลังไปรับ"}
                          </span>
                        </div>
                      </div>
                      {selectedTransport.items && selectedTransport.items.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">รายการน้ำมันเดิม:</p>
                          <div className="space-y-1">
                            {selectedTransport.items.map((item, idx) => (
                              <div key={idx} className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded">
                                <span className="font-medium">{item.oilType}:</span>{" "}
                                <span>{numberFormatter.format(item.quantity)} ลิตร</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="assign-transport-no" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    เลขที่ขนส่ง (แก้ไขได้)
                  </label>
                  <input
                    id="assign-transport-no"
                    type="text"
                    value={transportNo}
                    onChange={(e) => setTransportNo(e.target.value)}
                    placeholder="IT-YYYYMMDD-XXX"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    💡 เลขที่ขนส่งจะถูกดึงมาจาก dropdown อัตโนมัติ หรือสามารถแก้ไขได้
                  </p>
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
                  <div className="space-y-3">
                    {deliveryItems.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${item.isFromOrder
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800"
                          : "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800"
                          }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {item.isFromOrder && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                                  จากออเดอร์
                                </span>
                              )}
                              {!item.isFromOrder && (
                                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded">
                                  เพิ่มใหม่
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label htmlFor={`delivery-item-type-${index}`} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  ประเภทน้ำมัน *
                                </label>
                                <select
                                  id={`delivery-item-type-${index}`}
                                  value={item.oilType}
                                  onChange={(e) => handleUpdateDeliveryItem(index, "oilType", e.target.value as OilType)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  required
                                >
                                  {oilTypes.map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {item.isFromOrder && (
                                <div>
                                  <label htmlFor={`delivery-item-ordered-${index}`} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    จำนวนที่สั่ง (ลิตร)
                                  </label>
                                  <input
                                    id={`delivery-item-ordered-${index}`}
                                    type="text"
                                    value={numberFormatter.format(item.quantity)}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm"
                                  />
                                </div>
                              )}
                              <div>
                                <label htmlFor={`delivery-item-deliver-${index}`} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  จำนวนที่จะส่ง (ลิตร) *
                                </label>
                                <input
                                  id={`delivery-item-deliver-${index}`}
                                  type="number"
                                  value={item.quantityToDeliver}
                                  onChange={(e) => handleUpdateDeliveryItem(index, "quantityToDeliver", Number(e.target.value))}
                                  placeholder="กรอกจำนวนที่จะส่ง"
                                  min="0"
                                  step="100"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  required
                                />
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">ราคาต่อลิตร:</span>
                                <span className="font-semibold text-gray-900 dark:text-white ml-1">
                                  {numberFormatter.format(item.pricePerLiter)} บาท
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">มูลค่ารวม:</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400 ml-1">
                                  {numberFormatter.format(item.totalAmount)} บาท
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDeliveryItem(index)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-2"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {deliveryItems.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <Droplet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">ยังไม่มีรายการน้ำมัน</p>
                        <p className="text-xs mt-1">รายการน้ำมันจากออเดอร์จะแสดงอัตโนมัติ หรือคลิกปุ่ม &quot;เพิ่มรายการน้ำมัน&quot;</p>
                      </div>
                    )}
                  </div>
                  {deliveryItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">มูลค่ารวมที่จะส่ง:</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {numberFormatter.format(deliveryItems.reduce((sum, item) => sum + item.totalAmount, 0))} บาท
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="assign-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    หมายเหตุ
                  </label>
                  <textarea
                    id="assign-notes"
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
                  onClick={selectedTransportNo ? handleAssignToTransport : handleSaveAssignment}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {selectedTransportNo ? "ยัดข้อมูลไปยังรถขนส่ง" : "อนุมัติและบันทึก"}
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
