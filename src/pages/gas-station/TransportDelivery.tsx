import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Building2,
  Droplet,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  MapPin,
  User,
  Save,
  Play,
  Package,
  Route,
  Gauge,
} from "lucide-react";
// Import shared data
import { branches, mockOrderSummary, mockApprovedOrders } from "@/data/gasStationOrders";
// Import truck data
import { mockTrucks, mockTrailers } from "./TruckProfiles";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Interface สำหรับ Compartment (ช่อง/หลุมในหางรถ)
interface Compartment {
  chamber: number; // ช่องที่ (1-7)
  capacity: number; // ความจุ (ลิตร)
  oilType?: string; // ชนิดน้ำมันที่จะลง (1 หลุม = 1 ชนิด)
  quantity?: number; // จำนวนลิตรที่จะลง
  destinationBranchId?: number; // สาขาปลายทาง
  destinationBranchName?: string;
}

// Interface สำหรับ Delivery Item (รายการที่ต้องส่ง)
interface DeliveryItem {
  id: string;
  branchId: number;
  branchName: string;
  branchCode: string;
  address: string;
  oilType: string;
  quantity: number;
  pricePerLiter: number;
  totalAmount: number;
  orderNo?: string;
  status: "รอส่ง" | "กำลังส่ง" | "ส่งแล้ว";
}

// Interface สำหรับ Transport Delivery (รอบส่งน้ำมัน)
interface TransportDelivery {
  id: string;
  transportNo: string; // เลขขนส่ง (Transport ID)
  transportDate: string;
  transportTime: string;
  truckId: string;
  truckPlateNumber: string;
  trailerId: string;
  trailerPlateNumber: string;
  driverId?: string;
  driverName: string;
  driverCode?: string;
  sourceBranchId: number; // ต้นทาง
  sourceBranchName: string;
  destinationBranchIds: number[]; // ปลายทาง (อาจมีหลายสาขา)
  destinationBranchNames: string[];
  deliveryItems: DeliveryItem[]; // รายการที่ต้องส่ง
  compartments: Compartment[]; // แผนการลงน้ำมัน
  startOdometer?: number; // เลขไมล์เริ่มต้น
  endOdometer?: number; // เลขไมล์สิ้นสุด
  totalDistance?: number; // ระยะทางรวม (กม.)
  status: "รอเริ่ม" | "กำลังขนส่ง" | "ขนส่งสำเร็จ" | "ยกเลิก";
  startTime?: string; // เวลาเริ่มขนส่ง
  endTime?: string; // เวลาถึงปลายทาง
  notes?: string;
  createdAt: string;
  createdBy: string;
}

// Mock data - คนขับ
const mockDrivers = [
  { id: "DRIVER-001", name: "สมชาย ใจดี", code: "D001", phone: "081-234-5678", licenseNo: "1234567890" },
  { id: "DRIVER-002", name: "วิชัย รักงาน", code: "D002", phone: "082-345-6789", licenseNo: "2345678901" },
  { id: "DRIVER-003", name: "ประเสริฐ ขยัน", code: "D003", phone: "083-456-7890", licenseNo: "3456789012" },
];

// Mock data - รอบส่งน้ำมัน
const mockTransportDeliveries: TransportDelivery[] = [
  {
    id: "TRANS-001",
    transportNo: "TR-20241215-001",
    transportDate: "2024-12-15",
    transportTime: "08:00",
    truckId: "TRUCK-001",
    truckPlateNumber: "กก 1111",
    trailerId: "TRAILER-001",
    trailerPlateNumber: "กข 1234",
    driverName: "สมชาย ใจดี",
    driverCode: "D001",
    sourceBranchId: 1,
    sourceBranchName: "ปั๊มไฮโซ",
    destinationBranchIds: [2, 3],
    destinationBranchNames: ["สาขา 2", "สาขา 3"],
    deliveryItems: [
      {
        id: "DEL-001",
        branchId: 2,
        branchName: "สาขา 2",
        branchCode: "B2",
        address: "456 ถนนพหลโยธิน กรุงเทพมหานคร 10400",
        oilType: "Premium Diesel",
        quantity: 22000,
        pricePerLiter: 32.5,
        totalAmount: 715000,
        orderNo: "SO-20241215-002",
        status: "ส่งแล้ว",
      },
      {
        id: "DEL-002",
        branchId: 3,
        branchName: "สาขา 3",
        branchCode: "B3",
        address: "789 ถนนรัชดาภิเษก กรุงเทพมหานคร 10320",
        oilType: "Diesel",
        quantity: 20000,
        pricePerLiter: 30.0,
        totalAmount: 600000,
        orderNo: "SO-20241215-003",
        status: "ส่งแล้ว",
      },
    ],
    compartments: [
      { chamber: 1, capacity: 3000, oilType: "Premium Diesel", quantity: 3000, destinationBranchId: 2, destinationBranchName: "สาขา 2" },
      { chamber: 2, capacity: 7000, oilType: "Premium Diesel", quantity: 7000, destinationBranchId: 2, destinationBranchName: "สาขา 2" },
      { chamber: 3, capacity: 4000, oilType: "Premium Diesel", quantity: 4000, destinationBranchId: 2, destinationBranchName: "สาขา 2" },
      { chamber: 4, capacity: 5000, oilType: "Premium Diesel", quantity: 5000, destinationBranchId: 2, destinationBranchName: "สาขา 2" },
      { chamber: 5, capacity: 3000, oilType: "Premium Diesel", quantity: 3000, destinationBranchId: 2, destinationBranchName: "สาขา 2" },
      { chamber: 6, capacity: 0, oilType: "Diesel", quantity: 0, destinationBranchId: 3, destinationBranchName: "สาขา 3" },
      { chamber: 7, capacity: 0, oilType: "Diesel", quantity: 0, destinationBranchId: 3, destinationBranchName: "สาขา 3" },
    ],
    startOdometer: 125000,
    endOdometer: 125350,
    totalDistance: 350,
    status: "ขนส่งสำเร็จ",
    startTime: "2024-12-15 08:00",
    endTime: "2024-12-15 12:30",
    createdAt: "2024-12-15 07:30",
    createdBy: "ผู้จัดการคลัง",
  },
  {
    id: "TRANS-002",
    transportNo: "TR-20241215-002",
    transportDate: "2024-12-15",
    transportTime: "13:00",
    truckId: "TRUCK-002",
    truckPlateNumber: "กก 2222",
    trailerId: "TRAILER-002",
    trailerPlateNumber: "กข 5678",
    driverName: "วิชัย รักงาน",
    driverCode: "D002",
    sourceBranchId: 1,
    sourceBranchName: "ปั๊มไฮโซ",
    destinationBranchIds: [4],
    destinationBranchNames: ["สาขา 4"],
    deliveryItems: [
      {
        id: "DEL-003",
        branchId: 4,
        branchName: "สาขา 4",
        branchCode: "B4",
        address: "123 ถนนสุขุมวิท กรุงเทพมหานคร 10110",
        oilType: "Premium Diesel",
        quantity: 24000,
        pricePerLiter: 32.5,
        totalAmount: 780000,
        orderNo: "SO-20241215-001",
        status: "กำลังส่ง",
      },
    ],
    compartments: [
      { chamber: 1, capacity: 3000, oilType: "Premium Diesel", quantity: 3000, destinationBranchId: 4, destinationBranchName: "สาขา 4" },
      { chamber: 2, capacity: 7000, oilType: "Premium Diesel", quantity: 7000, destinationBranchId: 4, destinationBranchName: "สาขา 4" },
      { chamber: 3, capacity: 4000, oilType: "Premium Diesel", quantity: 4000, destinationBranchId: 4, destinationBranchName: "สาขา 4" },
      { chamber: 4, capacity: 5000, oilType: "Premium Diesel", quantity: 5000, destinationBranchId: 4, destinationBranchName: "สาขา 4" },
      { chamber: 5, capacity: 5000, oilType: "Premium Diesel", quantity: 5000, destinationBranchId: 4, destinationBranchName: "สาขา 4" },
    ],
    startOdometer: 98000,
    status: "กำลังขนส่ง",
    startTime: "2024-12-15 13:00",
    createdAt: "2024-12-15 12:30",
    createdBy: "ผู้จัดการคลัง",
  },
];

// Helper function: ดึงข้อมูลใบส่งของที่รอส่ง (จาก OrderManagement - ข้อมูลที่อนุมัติแล้ว)
function getPendingDeliveryItems(): DeliveryItem[] {
  // ดึงข้อมูลจาก mockOrderSummary ที่มี status = "อนุมัติแล้ว" หรือ "ส่งแล้ว"
  const approvedOrders = mockOrderSummary.filter(
    (order) => order.status === "อนุมัติแล้ว" || order.status === "ส่งแล้ว"
  );

  const deliveryItems: DeliveryItem[] = [];
  approvedOrders.forEach((order) => {
    const branch = branches.find((b) => b.id === order.branchId);
    if (!branch) return;

    deliveryItems.push({
      id: `${order.branchId}-${order.oilType}`,
      branchId: order.branchId,
      branchName: order.branchName,
      branchCode: branch.code,
      address: branch.address,
      oilType: order.oilType,
      quantity: order.quantityOrdered,
      pricePerLiter: order.pricePerLiter || 0,
      totalAmount: order.totalAmount || order.quantityOrdered * (order.pricePerLiter || 0),
      orderNo: order.orderNo,
      status: order.status === "ส่งแล้ว" ? "ส่งแล้ว" : "รอส่ง",
    });
  });

  return deliveryItems;
}

// Helper function: Generate Transport No
function generateTransportNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
  const timeStr = now.toTimeString().split(":")[0] + now.toTimeString().split(":")[1];
  return `TR-${dateStr}-${timeStr}`;
}

export default function TransportDelivery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<TransportDelivery | null>(null);
  const [expandedTransports, setExpandedTransports] = useState<Set<string>>(new Set());

  // Form state for creating new transport
  const [newTransport, setNewTransport] = useState({
    transportDate: new Date().toISOString().split("T")[0],
    transportTime: new Date().toTimeString().slice(0, 5),
    purchaseOrderNo: "", // เลขที่ใบสั่งซื้อที่จะส่ง
    truckId: "",
    trailerId: "",
    driverId: "",
    sourceBranchId: 1, // ปั๊มไฮโซเป็นต้นทาง
    selectedBranches: [] as number[], // IDs ของปั๊มที่จะส่งในรอบนี้
    selectedDeliveryItems: [] as string[], // IDs ของ delivery items ที่เลือก
    startOdometer: "",
    notes: "",
  });

  // Get selected purchase order details
  const selectedPurchaseOrder = mockApprovedOrders.find(
    (order) => order.orderNo === newTransport.purchaseOrderNo
  );

  // Get pending delivery items
  const pendingDeliveryItems = useMemo(() => getPendingDeliveryItems(), []);

  // Filter transports
  const filteredTransports = mockTransportDeliveries.filter((transport) => {
    const matchesSearch =
      transport.transportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transport.truckPlateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transport.trailerPlateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transport.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transport.destinationBranchNames.some((name) => name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === "ทั้งหมด" || transport.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Summary stats
  const stats = {
    total: mockTransportDeliveries.length,
    pending: mockTransportDeliveries.filter((t) => t.status === "รอเริ่ม").length,
    inProgress: mockTransportDeliveries.filter((t) => t.status === "กำลังขนส่ง").length,
    completed: mockTransportDeliveries.filter((t) => t.status === "ขนส่งสำเร็จ").length,
  };

  const toggleTransport = (transportId: string) => {
    const newExpanded = new Set(expandedTransports);
    if (newExpanded.has(transportId)) {
      newExpanded.delete(transportId);
    } else {
      newExpanded.add(transportId);
    }
    setExpandedTransports(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "รอเริ่ม":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800";
      case "กำลังขนส่ง":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
      case "ขนส่งสำเร็จ":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
      case "ยกเลิก":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
    }
  };

  const handleCreateTransport = () => {
    // Validate
    if (!newTransport.truckId || !newTransport.trailerId || !newTransport.driverId) {
      alert("กรุณาเลือก หัวรถ, หางรถ และคนขับ");
      return;
    }

    if (newTransport.selectedDeliveryItems.length === 0) {
      alert("กรุณาเลือกรายการที่ต้องส่ง");
      return;
    }

    // Get selected items
    const selectedItems = pendingDeliveryItems.filter((item) =>
      newTransport.selectedDeliveryItems.includes(item.id)
    );

    // Get truck and trailer info
    const truck = mockTrucks.find((t) => t.id === newTransport.truckId);
    const trailer = mockTrailers.find((t) => t.id === newTransport.trailerId);
    const driver = mockDrivers.find((d) => d.id === newTransport.driverId);

    if (!truck || !trailer || !driver) {
      alert("ไม่พบข้อมูลรถหรือคนขับ");
      return;
    }

    // Generate compartments (Loading Plan)
    // TODO: Implement smart algorithm to assign oil to compartments
    // For now, simple assignment
    const compartments: Compartment[] = [];
    let currentChamber = 1;
    let remainingCapacity = trailer.capacity;

    selectedItems.forEach((item) => {
      let remainingQuantity = item.quantity;
      while (remainingQuantity > 0 && currentChamber <= 7) {
        // Assume each chamber can hold up to 5000 liters (should get from trailer spec)
        const chamberCapacity = 5000; // This should come from trailer spec
        const fillAmount = Math.min(remainingQuantity, chamberCapacity, remainingCapacity);

        compartments.push({
          chamber: currentChamber,
          capacity: chamberCapacity,
          oilType: item.oilType,
          quantity: fillAmount,
          destinationBranchId: item.branchId,
          destinationBranchName: item.branchName,
        });

        remainingQuantity -= fillAmount;
        remainingCapacity -= fillAmount;
        currentChamber++;
      }
    });

    // Create new transport
    const newTransportData: TransportDelivery = {
      id: `TRANS-${Date.now()}`,
      transportNo: generateTransportNo(),
      transportDate: newTransport.transportDate,
      transportTime: newTransport.transportTime,
      truckId: newTransport.truckId,
      truckPlateNumber: truck.plateNumber,
      trailerId: newTransport.trailerId,
      trailerPlateNumber: trailer.plateNumber,
      driverId: newTransport.driverId,
      driverName: driver.name,
      driverCode: driver.code,
      sourceBranchId: newTransport.sourceBranchId,
      sourceBranchName: branches.find((b) => b.id === newTransport.sourceBranchId)?.name || "",
      destinationBranchIds: [...new Set(selectedItems.map((item) => item.branchId))],
      destinationBranchNames: [...new Set(selectedItems.map((item) => item.branchName))],
      deliveryItems: selectedItems,
      compartments: compartments,
      startOdometer: newTransport.startOdometer ? parseInt(newTransport.startOdometer) : undefined,
      status: "รอเริ่ม",
      notes: newTransport.notes,
      createdAt: new Date().toISOString(),
      createdBy: "ผู้จัดการคลัง",
    };

    // In real app, this would call API
    console.log("Creating transport:", newTransportData);

    // Reset form
    setNewTransport({
      transportDate: new Date().toISOString().split("T")[0],
      transportTime: new Date().toTimeString().slice(0, 5),
      purchaseOrderNo: "",
      truckId: "",
      trailerId: "",
      driverId: "",
      sourceBranchId: 1,
      selectedBranches: [],
      selectedDeliveryItems: [],
      startOdometer: "",
      notes: "",
    });

    setShowCreateModal(false);
    alert("สร้างรอบส่งน้ำมันสำเร็จ!");
  };

  const handleStartTransport = (transport: TransportDelivery) => {
    if (!transport.startOdometer) {
      alert("กรุณากรอกเลขไมล์เริ่มต้น");
      return;
    }

    // In real app, this would call API
    console.log("Starting transport:", transport.id);
    alert("เริ่มขนส่งแล้ว!");
  };

  const handleViewDetail = (transport: TransportDelivery) => {
    setSelectedTransport(transport);
    setShowDetailModal(true);
  };

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (showCreateModal || showDetailModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCreateModal, showDetailModal]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showCreateModal) setShowCreateModal(false);
        if (showDetailModal) setShowDetailModal(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showCreateModal, showDetailModal]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">รอบส่งน้ำมัน</h1>
        <p className="text-gray-600 dark:text-gray-400">บันทึกข้อมูลการส่งน้ำมันไปยังสาขาย่อย</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "รอบส่งทั้งหมด",
            value: stats.total,
            subtitle: "รอบ",
            icon: Truck,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
          {
            title: "รอเริ่ม",
            value: stats.pending,
            subtitle: "รอบ",
            icon: Clock,
            iconColor: "bg-gradient-to-br from-orange-500 to-orange-600",
          },
          {
            title: "กำลังขนส่ง",
            value: stats.inProgress,
            subtitle: "รอบ",
            icon: Route,
            iconColor: "bg-gradient-to-br from-cyan-500 to-cyan-600",
          },
          {
            title: "ขนส่งสำเร็จ",
            value: stats.completed,
            subtitle: "รอบ",
            icon: CheckCircle,
            iconColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center">
                <div className={`w-16 h-16 ${stat.iconColor} rounded-lg flex items-center justify-center shadow-lg mr-4`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h6 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">{stat.title}</h6>
                  <h6 className="text-gray-800 dark:text-white text-2xl font-extrabold mb-0">{stat.value}</h6>
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{stat.subtitle}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาเลขขนส่ง, ทะเบียนรถ, คนขับ, สาขา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          >
            <option>ทั้งหมด</option>
            <option>รอเริ่ม</option>
            <option>กำลังขนส่ง</option>
            <option>ขนส่งสำเร็จ</option>
            <option>ยกเลิก</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          สร้างรอบส่งใหม่
        </button>
      </motion.div>

      {/* Transport List */}
      <div className="space-y-4">
        {filteredTransports.map((transport, index) => {
          const isExpanded = expandedTransports.has(transport.id);
          const totalQuantity = transport.deliveryItems.reduce((sum, item) => sum + item.quantity, 0);

          return (
            <motion.div
              key={transport.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
            >
              {/* Transport Header */}
              <div
                className="p-5 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => toggleTransport(transport.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{transport.transportNo}</h3>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(transport.status)}`}>
                          {transport.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {transport.transportDate} {transport.transportTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          {transport.truckPlateNumber} / {transport.trailerPlateNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {transport.driverName}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {transport.sourceBranchName} → {transport.destinationBranchNames.join(", ")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {transport.deliveryItems.length} รายการ
                        </span>
                        <span className="flex items-center gap-1">
                          <Droplet className="w-3 h-3" />
                          {numberFormatter.format(totalQuantity)} ลิตร
                        </span>
                        {transport.startOdometer && (
                          <span className="flex items-center gap-1">
                            <Gauge className="w-3 h-3" />
                            ไมล์: {numberFormatter.format(transport.startOdometer)}
                            {transport.endOdometer && ` → ${numberFormatter.format(transport.endOdometer)}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {transport.status === "รอเริ่ม" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartTransport(transport);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition-all duration-200 font-semibold flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        เริ่มขนส่ง
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(transport);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="ดูรายละเอียด"
                    >
                      <Eye className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Transport Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 bg-gray-50 dark:bg-gray-900/50 space-y-4">
                      {/* Delivery Items */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          รายการที่ต้องส่ง
                        </h4>
                        <div className="space-y-2">
                          {transport.deliveryItems.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Building2 className="w-4 h-4 text-blue-500" />
                                    <span className="font-semibold text-gray-800 dark:text-white">{item.branchName}</span>
                                    <span className="text-xs text-gray-500">({item.branchCode})</span>
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">{item.oilType}:</span> {numberFormatter.format(item.quantity)} ลิตร
                                    {item.orderNo && (
                                      <>
                                        <span className="mx-2">•</span>
                                        <span className="text-xs">PO: {item.orderNo}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                    {currencyFormatter.format(item.totalAmount)}
                                  </p>
                                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                                    {item.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Loading Plan (Compartment Plan) */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <Droplet className="w-4 h-4" />
                          แผนการลงน้ำมัน (Loading Plan)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {transport.compartments
                            .filter((comp) => comp.quantity && comp.quantity > 0)
                            .map((comp) => (
                              <div
                                key={comp.chamber}
                                className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    ช่องที่ {comp.chamber}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {numberFormatter.format(comp.quantity || 0)} / {numberFormatter.format(comp.capacity)} ลิตร
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">ชนิด:</span> {comp.oilType}
                                  </div>
                                  {comp.destinationBranchName && (
                                    <div className="text-xs text-gray-500">
                                      <span className="font-medium">ปลายทาง:</span> {comp.destinationBranchName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Route Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            เส้นทาง
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">ต้นทาง:</span>
                              <span className="ml-2 font-medium text-gray-800 dark:text-white">{transport.sourceBranchName}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">ปลายทาง:</span>
                              <span className="ml-2 font-medium text-gray-800 dark:text-white">
                                {transport.destinationBranchNames.join(", ")}
                              </span>
                            </div>
                            {transport.totalDistance && (
                              <div>
                                <span className="text-gray-500">ระยะทาง:</span>
                                <span className="ml-2 font-medium text-gray-800 dark:text-white">
                                  {numberFormatter.format(transport.totalDistance)} กิโลเมตร
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <Gauge className="w-4 h-4" />
                            เลขไมล์
                          </h5>
                          <div className="space-y-2 text-sm">
                            {transport.startOdometer && (
                              <div>
                                <span className="text-gray-500">เริ่มต้น:</span>
                                <span className="ml-2 font-medium text-gray-800 dark:text-white">
                                  {numberFormatter.format(transport.startOdometer)} กม.
                                </span>
                              </div>
                            )}
                            {transport.endOdometer && (
                              <div>
                                <span className="text-gray-500">สิ้นสุด:</span>
                                <span className="ml-2 font-medium text-gray-800 dark:text-white">
                                  {numberFormatter.format(transport.endOdometer)} กม.
                                </span>
                              </div>
                            )}
                            {transport.totalDistance && (
                              <div>
                                <span className="text-gray-500">ระยะทาง:</span>
                                <span className="ml-2 font-medium text-gray-800 dark:text-white">
                                  {numberFormatter.format(transport.totalDistance)} กม.
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Create Transport Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">สร้างรอบส่งน้ำมันใหม่</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">บันทึกข้อมูลการส่งน้ำมันไปยังสาขาย่อย</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                    aria-label="ปิด"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="space-y-6">
                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          วันที่ส่ง <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={newTransport.transportDate}
                          onChange={(e) => setNewTransport({ ...newTransport, transportDate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          เวลาส่ง <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={newTransport.transportTime}
                          onChange={(e) => setNewTransport({ ...newTransport, transportTime: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Purchase Order Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        เลขที่ใบสั่งซื้อ (Purchase Order) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newTransport.purchaseOrderNo}
                        onChange={(e) => {
                          setNewTransport({ ...newTransport, purchaseOrderNo: e.target.value, selectedBranches: [] });
                        }}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                      >
                        <option value="">เลือกใบสั่งซื้อ</option>
                        {mockApprovedOrders.map((order) => (
                          <option key={order.orderNo} value={order.orderNo}>
                            {order.orderNo} - {order.supplierOrderNo} ({order.branches.length} ปั๊ม)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Branch Selection - แสดงเมื่อเลือกใบสั่งซื้อแล้ว */}
                    {selectedPurchaseOrder && (
                      <div className="border border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-900/50">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          เลือกปั๊มที่จะส่งในรอบนี้ ({newTransport.selectedBranches.length}/{selectedPurchaseOrder.branches.length} ปั๊ม)
                        </label>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {selectedPurchaseOrder.branches.map((branch) => {
                            const isSelected = newTransport.selectedBranches.includes(branch.branchId);
                            const totalQuantity = branch.items.reduce((sum, item) => sum + item.quantity, 0);

                            return (
                              <div
                                key={branch.branchId}
                                onClick={() => {
                                  if (isSelected) {
                                    setNewTransport({
                                      ...newTransport,
                                      selectedBranches: newTransport.selectedBranches.filter(id => id !== branch.branchId)
                                    });
                                  } else {
                                    setNewTransport({
                                      ...newTransport,
                                      selectedBranches: [...newTransport.selectedBranches, branch.branchId]
                                    });
                                  }
                                }}
                                className={`p-3 border rounded-lg cursor-pointer transition-all ${isSelected
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300"
                                  }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => { }} // Handled by parent div
                                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                          {branch.branchName}
                                        </span>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${branch.deliveryStatus === "ส่งสำเร็จ"
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                          : branch.deliveryStatus === "กำลังส่ง"
                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                          }`}>
                                          {branch.deliveryStatus}
                                        </span>
                                      </div>
                                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {numberFormatter.format(totalQuantity)} ลิตร
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                      {branch.legalEntityName}
                                    </p>
                                    <div className="space-y-1">
                                      {branch.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs">
                                          <span className="text-gray-600 dark:text-gray-400">
                                            {item.oilType}
                                          </span>
                                          <span className="text-gray-900 dark:text-white font-medium">
                                            {numberFormatter.format(item.quantity)} ลิตร
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setNewTransport({
                              ...newTransport,
                              selectedBranches: selectedPurchaseOrder.branches.map(b => b.branchId)
                            })}
                            className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                          >
                            เลือกทั้งหมด
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewTransport({ ...newTransport, selectedBranches: [] })}
                            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            ยกเลิกทั้งหมด
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Vehicle Selection */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">เลือกรถ</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            หัวรถ <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newTransport.truckId}
                            onChange={(e) => setNewTransport({ ...newTransport, truckId: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                          >
                            <option value="">เลือกหัวรถ</option>
                            {mockTrucks.filter((t) => t.status === "active").map((truck) => (
                              <option key={truck.id} value={truck.id}>
                                {truck.plateNumber} - {truck.brand} {truck.model}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            หางรถ <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newTransport.trailerId}
                            onChange={(e) => setNewTransport({ ...newTransport, trailerId: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                          >
                            <option value="">เลือกหางรถ</option>
                            {mockTrailers
                              .filter((t) => t.status === "available" || t.status === "in-use")
                              .map((trailer) => (
                                <option key={trailer.id} value={trailer.id}>
                                  {trailer.plateNumber} - {numberFormatter.format(trailer.capacity)} ลิตร
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            คนขับ <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newTransport.driverId}
                            onChange={(e) => setNewTransport({ ...newTransport, driverId: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                          >
                            <option value="">เลือกคนขับ</option>
                            {mockDrivers.map((driver) => (
                              <option key={driver.id} value={driver.id}>
                                {driver.name} ({driver.code})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Source Branch */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ต้นทาง <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newTransport.sourceBranchId}
                        onChange={(e) => setNewTransport({ ...newTransport, sourceBranchId: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                      >
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name} ({branch.code})
                          </option>
                        ))}
                      </select>
                    </div>


                    {/* Start Odometer */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        เลขไมล์เริ่มต้น (กม.)
                      </label>
                      <input
                        type="number"
                        value={newTransport.startOdometer}
                        onChange={(e) => setNewTransport({ ...newTransport, startOdometer: e.target.value })}
                        placeholder="กรอกเลขไมล์เริ่มต้น"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">หมายเหตุ</label>
                      <textarea
                        value={newTransport.notes}
                        onChange={(e) => setNewTransport({ ...newTransport, notes: e.target.value })}
                        rows={3}
                        placeholder="หมายเหตุเพิ่มเติม..."
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white resize-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-semibold"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleCreateTransport}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    สร้างรอบส่ง
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedTransport && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">รายละเอียดรอบส่งน้ำมัน</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTransport.transportNo}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                    aria-label="ปิด"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">เลขขนส่ง</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedTransport.transportNo}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">สถานะ</p>
                        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(selectedTransport.status)}`}>
                          {selectedTransport.status}
                        </span>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">วันที่และเวลา</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          {selectedTransport.transportDate} {selectedTransport.transportTime}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">คนขับ</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedTransport.driverName}</p>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-2 font-semibold">ข้อมูลรถ</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">หัวรถ:</span>
                          <span className="ml-2 font-semibold text-gray-800 dark:text-white">{selectedTransport.truckPlateNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">หางรถ:</span>
                          <span className="ml-2 font-semibold text-gray-800 dark:text-white">{selectedTransport.trailerPlateNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Route Info */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">เส้นทาง</p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">ต้นทาง:</span>
                          <span className="ml-2 font-semibold text-gray-800 dark:text-white">{selectedTransport.sourceBranchName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">ปลายทาง:</span>
                          <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                            {selectedTransport.destinationBranchNames.join(", ")}
                          </span>
                        </div>
                        {selectedTransport.totalDistance && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">ระยะทาง:</span>
                            <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                              {numberFormatter.format(selectedTransport.totalDistance)} กิโลเมตร
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Loading Plan */}
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">แผนการลงน้ำมัน (Loading Plan)</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedTransport.compartments
                          .filter((comp) => comp.quantity && comp.quantity > 0)
                          .map((comp) => (
                            <div
                              key={comp.chamber}
                              className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">ช่องที่ {comp.chamber}</span>
                                <span className="text-xs text-gray-500">
                                  {numberFormatter.format(comp.quantity || 0)} / {numberFormatter.format(comp.capacity)} ลิตร
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <span className="font-medium">ชนิด:</span> {comp.oilType}
                                </div>
                                {comp.destinationBranchName && (
                                  <div className="text-xs text-gray-500">
                                    <span className="font-medium">ปลายทาง:</span> {comp.destinationBranchName}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-semibold"
                  >
                    ปิด
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
