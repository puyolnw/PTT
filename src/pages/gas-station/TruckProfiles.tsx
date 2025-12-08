import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Search,
  Calendar,
  MapPin,
  Droplet,
  Activity,
  ChevronRight,
  Wrench,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  Save,
  Eye,
  User,
  Building2,
  Clock,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Interface สำหรับหาง (Trailer)
interface Trailer {
  id: string;
  plateNumber: string;
  capacity: number; // ความจุ (ลิตร)
  status: "available" | "in-use" | "maintenance";
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

// Interface สำหรับรถ (Truck Head)
interface TruckProfile {
  id: string;
  plateNumber: string;
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
}

// Interface สำหรับออเดอร์รถน้ำมัน
export interface TruckOrder {
  id: string;
  orderNo: string;
  orderDate: string;
  truckId: string;
  truckPlateNumber: string;
  trailerId: string;
  trailerPlateNumber: string;
  driver: string;
  fromBranch: string;
  toBranch: string;
  oilType: string;
  quantity: number; // ลิตร
  status: "pending" | "in-use" | "completed" | "cancelled";
  usedInOrderId?: string; // ID ของออเดอร์น้ำมันที่เรียกใช้ออเดอร์รถนี้
  notes?: string;
  createdAt: string;
  createdBy: string;
}

// Export interfaces and mock data for use in other components
export type { Trailer, TruckProfile };

// Mock data - หาง 3 หาง
const mockTrailers: Trailer[] = [
  {
    id: "TRAILER-001",
    plateNumber: "กข 1234",
    capacity: 10000,
    status: "in-use",
    lastMaintenanceDate: "2024-11-15",
    nextMaintenanceDate: "2025-02-15",
  },
  {
    id: "TRAILER-002",
    plateNumber: "กข 5678",
    capacity: 12000,
    status: "available",
    lastMaintenanceDate: "2024-10-20",
    nextMaintenanceDate: "2025-01-20",
  },
  {
    id: "TRAILER-003",
    plateNumber: "กข 9012",
    capacity: 15000,
    status: "in-use",
    lastMaintenanceDate: "2024-12-01",
    nextMaintenanceDate: "2025-03-01",
  },
];

// Mock data - รถ 2 คัน
const mockTrucks: TruckProfile[] = [
  {
    id: "TRUCK-001",
    plateNumber: "กก 1111",
    brand: "Isuzu",
    model: "FVR 34-260",
    year: 2020,
    engineNumber: "ENG-2020-001",
    chassisNumber: "CHS-2020-001",
    status: "active",
    totalTrips: 245,
    totalDistance: 125000,
    totalOilDelivered: 2500000,
    lastTripDate: "2024-12-15",
    lastMaintenanceDate: "2024-11-20",
    nextMaintenanceDate: "2025-02-20",
    compatibleTrailers: ["TRAILER-001", "TRAILER-002", "TRAILER-003"],
    currentTrailerId: "TRAILER-001",
  },
  {
    id: "TRUCK-002",
    plateNumber: "กก 2222",
    brand: "Hino",
    model: "300 Series",
    year: 2021,
    engineNumber: "ENG-2021-002",
    chassisNumber: "CHS-2021-002",
    status: "active",
    totalTrips: 198,
    totalDistance: 98000,
    totalOilDelivered: 1980000,
    lastTripDate: "2024-12-14",
    lastMaintenanceDate: "2024-12-01",
    nextMaintenanceDate: "2025-03-01",
    compatibleTrailers: ["TRAILER-001", "TRAILER-002", "TRAILER-003"],
    currentTrailerId: "TRAILER-003",
  },
];

// Export mock data
export { mockTrailers, mockTrucks };

// Mock data - ออเดอร์รถน้ำมัน
export const mockTruckOrders: TruckOrder[] = [
  {
    id: "TO-001",
    orderNo: "TO-20241215-001",
    orderDate: "2024-12-15",
    truckId: "TRUCK-001",
    truckPlateNumber: "กก 1111",
    trailerId: "TRAILER-001",
    trailerPlateNumber: "กข 1234",
    driver: "สมชาย ใจดี",
    fromBranch: "ปั๊มไฮโซ",
    toBranch: "สาขา 2",
    oilType: "Premium Diesel",
    quantity: 10000,
    status: "in-use",
    usedInOrderId: "SO-20241215-001",
    notes: "รับน้ำมันจากปั๊มไฮโซ",
    createdAt: "2024-12-15 08:00:00",
    createdBy: "ผู้จัดการ",
  },
  {
    id: "TO-002",
    orderNo: "TO-20241215-002",
    orderDate: "2024-12-15",
    truckId: "TRUCK-002",
    truckPlateNumber: "กก 2222",
    trailerId: "TRAILER-003",
    trailerPlateNumber: "กข 9012",
    driver: "วิชัย รักงาน",
    fromBranch: "ปั๊มไฮโซ",
    toBranch: "สาขา 3",
    oilType: "Gasohol 95",
    quantity: 12000,
    status: "pending",
    notes: "",
    createdAt: "2024-12-15 09:00:00",
    createdBy: "ผู้จัดการ",
  },
  {
    id: "TO-003",
    orderNo: "TO-20241214-001",
    orderDate: "2024-12-14",
    truckId: "TRUCK-001",
    truckPlateNumber: "กก 1111",
    trailerId: "TRAILER-002",
    trailerPlateNumber: "กข 5678",
    driver: "สมชาย ใจดี",
    fromBranch: "ปั๊มไฮโซ",
    toBranch: "สาขา 4",
    oilType: "Diesel",
    quantity: 8000,
    status: "completed",
    usedInOrderId: "SO-20241214-001",
    notes: "",
    createdAt: "2024-12-14 10:00:00",
    createdBy: "ผู้จัดการ",
  },
];

export default function TruckProfiles() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "maintenance">("all");
  const [selectedTab, setSelectedTab] = useState<"trucks" | "orders">("trucks");
  const [truckOrders, setTruckOrders] = useState<TruckOrder[]>(mockTruckOrders);
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderFilterStatus, setOrderFilterStatus] = useState<"all" | "pending" | "in-use" | "completed" | "cancelled">("all");
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TruckOrder | null>(null);
  
  // Form state for creating order
  const [formData, setFormData] = useState({
    orderDate: new Date().toISOString().split("T")[0],
    truckId: "",
    trailerId: "",
    driver: "",
    fromBranch: "ปั๊มไฮโซ",
    toBranch: "",
    oilType: "",
    quantity: "",
    notes: "",
  });

  // รวมข้อมูลรถกับหาง
  const trucksWithTrailers = useMemo(() => {
    return mockTrucks.map((truck) => {
      const currentTrailer = truck.currentTrailerId
        ? mockTrailers.find((t) => t.id === truck.currentTrailerId)
        : null;
      const compatibleTrailers = truck.compatibleTrailers
        .map((id) => mockTrailers.find((t) => t.id === id))
        .filter((t): t is Trailer => t !== undefined);

      return {
        ...truck,
        currentTrailer,
        compatibleTrailers,
      };
    });
  }, []);

  // กรองข้อมูล
  const filteredTrucks = useMemo(() => {
    return trucksWithTrailers.filter((truck) => {
      const matchesSearch =
        truck.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || truck.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [trucksWithTrailers, searchTerm, filterStatus]);

  // สรุปข้อมูล
  const summary = useMemo(() => {
    const activeTrucks = mockTrucks.filter((t) => t.status === "active").length;
    const totalTrips = mockTrucks.reduce((sum, t) => sum + t.totalTrips, 0);
    const totalDistance = mockTrucks.reduce((sum, t) => sum + t.totalDistance, 0);
    const totalOilDelivered = mockTrucks.reduce((sum, t) => sum + t.totalOilDelivered, 0);

    return {
      activeTrucks,
      totalTrips,
      totalDistance,
      totalOilDelivered,
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "inactive":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
      case "maintenance":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "inactive":
        return <AlertCircle className="w-4 h-4" />;
      case "maintenance":
        return <Wrench className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return truckOrders.filter((order) => {
      const matchesSearch =
        order.orderNo.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.truckPlateNumber.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.trailerPlateNumber.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.driver.toLowerCase().includes(orderSearchTerm.toLowerCase());
      const matchesStatus = orderFilterStatus === "all" || order.status === orderFilterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [truckOrders, orderSearchTerm, orderFilterStatus]);

  // Order summary
  const orderSummary = useMemo(() => {
    const pending = truckOrders.filter((o) => o.status === "pending").length;
    const inUse = truckOrders.filter((o) => o.status === "in-use").length;
    const completed = truckOrders.filter((o) => o.status === "completed").length;
    const total = truckOrders.length;
    return { pending, inUse, completed, total };
  }, [truckOrders]);

  // Available trailers based on selected truck
  const availableTrailers = useMemo(() => {
    if (!formData.truckId) return [];
    const truck = mockTrucks.find((t) => t.id === formData.truckId);
    if (!truck) return [];
    return mockTrailers.filter((trailer) => truck.compatibleTrailers.includes(trailer.id));
  }, [formData.truckId]);

  const handleCreateOrder = () => {
    if (!formData.truckId || !formData.trailerId || !formData.driver || !formData.quantity) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const truck = mockTrucks.find((t) => t.id === formData.truckId);
    const trailer = mockTrailers.find((t) => t.id === formData.trailerId);

    if (!truck || !trailer) {
      alert("ไม่พบข้อมูลรถหรือหาง");
      return;
    }

    const newOrder: TruckOrder = {
      id: `TO-${Date.now()}`,
      orderNo: `TO-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${String(truckOrders.length + 1).padStart(3, "0")}`,
      orderDate: formData.orderDate,
      truckId: formData.truckId,
      truckPlateNumber: truck.plateNumber,
      trailerId: formData.trailerId,
      trailerPlateNumber: trailer.plateNumber,
      driver: formData.driver,
      fromBranch: formData.fromBranch,
      toBranch: formData.toBranch,
      oilType: formData.oilType,
      quantity: parseFloat(formData.quantity),
      status: "pending",
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      createdBy: "ผู้ใช้ปัจจุบัน",
    };

    setTruckOrders([newOrder, ...truckOrders]);
    setShowCreateOrderModal(false);
    setFormData({
      orderDate: new Date().toISOString().split("T")[0],
      truckId: "",
      trailerId: "",
      driver: "",
      fromBranch: "ปั๊มไฮโซ",
      toBranch: "",
      oilType: "",
      quantity: "",
      notes: "",
    });
    alert("สร้างออเดอร์รถสำเร็จ");
  };

  const handleViewOrderDetail = (order: TruckOrder) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "in-use":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "รอเรียกใช้";
      case "in-use":
        return "เรียกใช้แล้ว";
      case "completed":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            โปรไฟล์รถส่งน้ำมัน
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            จัดการข้อมูลรถและหางส่งน้ำมัน รวมถึงประวัติการใช้งานและออเดอร์รถ
          </p>
        </div>
        {selectedTab === "orders" && (
          <button
            onClick={() => setShowCreateOrderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            สร้างออเดอร์ใหม่
          </button>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setSelectedTab("trucks")}
          className={`px-6 py-3 font-medium transition-colors ${
            selectedTab === "trucks"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          รถส่งน้ำมัน
        </button>
        <button
          onClick={() => setSelectedTab("orders")}
          className={`px-6 py-3 font-medium transition-colors ${
            selectedTab === "orders"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          ออเดอร์รถน้ำมัน ({orderSummary.total})
        </button>
      </div>

      {/* Summary Cards - Show different cards based on tab */}
      {selectedTab === "trucks" && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">รถที่ใช้งาน</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {summary.activeTrucks} / {mockTrucks.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">จำนวนเที่ยวทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {numberFormatter.format(summary.totalTrips)}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ระยะทางรวม</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {numberFormatter.format(summary.totalDistance)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">กิโลเมตร</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">น้ำมันส่งรวม</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {numberFormatter.format(summary.totalOilDelivered)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ลิตร</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Droplet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>
      )}

      {selectedTab === "orders" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orderSummary.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">รอเรียกใช้</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orderSummary.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">เรียกใช้แล้ว</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orderSummary.inUse}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">เสร็จสิ้น</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orderSummary.completed}</p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search and Filter */}
      {selectedTab === "trucks" && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาจากเลขทะเบียน, ยี่ห้อ, รุ่น..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">ใช้งาน</option>
              <option value="inactive">ไม่ใช้งาน</option>
              <option value="maintenance">ซ่อมบำรุง</option>
            </select>
          </div>
        </div>
      </motion.div>
      )}

      {selectedTab === "orders" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาจากเลขออเดอร์, ทะเบียนรถ, หาง, คนขับ..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={orderFilterStatus}
              onChange={(e) => setOrderFilterStatus(e.target.value as typeof orderFilterStatus)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="pending">รอเรียกใช้</option>
              <option value="in-use">เรียกใช้แล้ว</option>
              <option value="completed">เสร็จสิ้น</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>
        </motion.div>
      )}

      {/* Trucks List */}
      {selectedTab === "trucks" && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTrucks.map((truck, index) => (
          <motion.div
            key={truck.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/app/gas-station/truck-profiles/${truck.id}`)}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {truck.plateNumber}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {truck.brand} {truck.model} ({truck.year})
                    </p>
                  </div>
                </div>
                <span
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    truck.status
                  )}`}
                >
                  {getStatusIcon(truck.status)}
                  {truck.status === "active" ? "ใช้งาน" : truck.status === "inactive" ? "ไม่ใช้งาน" : "ซ่อมบำรุง"}
                </span>
              </div>

              {/* Current Trailer */}
              {truck.currentTrailer && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">หางที่ใช้อยู่:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {truck.currentTrailer.plateNumber}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      ความจุ {numberFormatter.format(truck.currentTrailer.capacity)} ลิตร
                    </span>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {numberFormatter.format(truck.totalTrips)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">เที่ยว</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {numberFormatter.format(truck.totalDistance)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">กม.</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {numberFormatter.format(truck.totalOilDelivered)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ลิตร</p>
                </div>
              </div>

              {/* Compatible Trailers */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                  หางที่ใช้ได้ ({truck.compatibleTrailers.length} หาง):
                </p>
                <div className="flex flex-wrap gap-2">
                  {truck.compatibleTrailers.map((trailer) => (
                    <span
                      key={trailer.id}
                      className={`text-xs px-2 py-1 rounded ${
                        trailer.id === truck.currentTrailerId
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {trailer.plateNumber}
                    </span>
                  ))}
                </div>
              </div>

              {/* Last Trip */}
              {truck.lastTripDate && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>เที่ยวล่าสุด: {dateFormatter.format(new Date(truck.lastTripDate))}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      )}

      {/* Orders Table */}
      {selectedTab === "orders" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    เลขที่ออเดอร์
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    วันที่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    รถ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    หาง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    คนขับ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    จาก → ไป
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ประเภทน้ำมัน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ปริมาณ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{order.orderNo}</div>
                      {order.usedInOrderId && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          ใช้ใน: {order.usedInOrderId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {dateFormatter.format(new Date(order.orderDate))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {order.truckPlateNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {order.trailerPlateNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{order.driver}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-gray-400" />
                          {order.fromBranch}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          {order.toBranch}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-900 dark:text-white">{order.oilType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      {numberFormatter.format(order.quantity)} ลิตร
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewOrderDetail(order)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">ไม่พบข้อมูลออเดอร์</p>
            </div>
          )}
        </motion.div>
      )}

      {selectedTab === "trucks" && filteredTrucks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
        >
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">ไม่พบข้อมูลรถ</p>
        </motion.div>
      )}

      {/* Create Order Modal */}
      <AnimatePresence>
        {showCreateOrderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">สร้างออเดอร์รถใหม่</h2>
                <button
                  onClick={() => setShowCreateOrderModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    วันที่ออเดอร์
                  </label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    เลือกรถ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.truckId}
                    onChange={(e) => {
                      setFormData({ ...formData, truckId: e.target.value, trailerId: "" });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- เลือกรถ --</option>
                    {mockTrucks
                      .filter((t) => t.status === "active")
                      .map((truck) => (
                        <option key={truck.id} value={truck.id}>
                          {truck.plateNumber} - {truck.brand} {truck.model}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    เลือกหาง <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.trailerId}
                    onChange={(e) => setFormData({ ...formData, trailerId: e.target.value })}
                    disabled={!formData.truckId || availableTrailers.length === 0}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- เลือกหาง --</option>
                    {availableTrailers.map((trailer) => (
                      <option key={trailer.id} value={trailer.id}>
                        {trailer.plateNumber} - ความจุ {numberFormatter.format(trailer.capacity)} ลิตร
                      </option>
                    ))}
                  </select>
                  {!formData.truckId && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">กรุณาเลือกรถก่อน</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    คนขับ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.driver}
                    onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                    placeholder="ชื่อคนขับ"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">จาก</label>
                    <input
                      type="text"
                      value={formData.fromBranch}
                      onChange={(e) => setFormData({ ...formData, fromBranch: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ไป</label>
                    <input
                      type="text"
                      value={formData.toBranch}
                      onChange={(e) => setFormData({ ...formData, toBranch: e.target.value })}
                      placeholder="สาขาปลายทาง"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ประเภทน้ำมัน <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.oilType}
                      onChange={(e) => setFormData({ ...formData, oilType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- เลือกประเภทน้ำมัน --</option>
                      <option value="Premium Diesel">Premium Diesel</option>
                      <option value="Premium Gasohol 95">Premium Gasohol 95</option>
                      <option value="Diesel">Diesel</option>
                      <option value="E85">E85</option>
                      <option value="E20">E20</option>
                      <option value="Gasohol 91">Gasohol 91</option>
                      <option value="Gasohol 95">Gasohol 95</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ปริมาณ (ลิตร) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">หมายเหตุ</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="หมายเหตุเพิ่มเติม..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowCreateOrderModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleCreateOrder}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  บันทึก
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showOrderDetailModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOrderDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">รายละเอียดออเดอร์</h2>
                <button
                  onClick={() => setShowOrderDetailModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">เลขที่ออเดอร์</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedOrder.orderNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">สถานะ</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(selectedOrder.status)}`}>
                      {getOrderStatusText(selectedOrder.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">รถ</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedOrder.truckPlateNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">หาง</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedOrder.trailerPlateNumber}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">คนขับ</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedOrder.driver}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">จาก</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedOrder.fromBranch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ไป</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedOrder.toBranch}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ประเภทน้ำมัน</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedOrder.oilType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ปริมาณ</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {numberFormatter.format(selectedOrder.quantity)} ลิตร
                    </p>
                  </div>
                </div>

                {selectedOrder.usedInOrderId && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">เรียกใช้ในออเดอร์</p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {selectedOrder.usedInOrderId}
                    </p>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">หมายเหตุ</p>
                    <p className="text-gray-900 dark:text-white">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

