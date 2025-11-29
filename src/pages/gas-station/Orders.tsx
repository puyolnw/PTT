import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Eye,
  Upload,
  Download,
  Truck,
  Building2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CheckCircle2,
  X,
  Save,
  DollarSign,
  Droplet,
  History,
  MapPin,
  Info,
  Receipt,
  Calendar,
  FileText,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Mock data - สาขาทั้ง 5 แห่ง
const branches = [
  { id: 1, name: "ปั๊มไฮโซ", code: "HQ", address: "100 ถนนเพชรบุรี กรุงเทพมหานคร 10400", legalEntityName: "บริษัท A จำกัด" },
  { id: 2, name: "สาขา 2", code: "B2", address: "456 ถนนพหลโยธิน กรุงเทพมหานคร 10400", legalEntityName: "บริษัท B จำกัด" },
  { id: 3, name: "สาขา 3", code: "B3", address: "789 ถนนรัชดาภิเษก กรุงเทพมหานคร 10320", legalEntityName: "บริษัท C จำกัด" },
  { id: 4, name: "สาขา 4", code: "B4", address: "123 ถนนสุขุมวิท กรุงเทพมหานคร 10110", legalEntityName: "บริษัท D จำกัด" },
  { id: 5, name: "สาขา 5", code: "B5", address: "321 ถนนสีลม กรุงเทพมหานคร 10500", legalEntityName: "บริษัท E จำกัด" },
];

// ประเภทน้ำมัน (reserved for future use)
// const oilTypes = [
//   "Premium Diesel",
//   "Premium Gasohol 95",
//   "Diesel",
//   "E85",
//   "E20",
//   "Gasohol 91",
//   "Gasohol 95",
// ];

// นิติบุคคล
const legalEntities = [
  { id: 1, name: "บริษัท A จำกัด" },
  { id: 2, name: "บริษัท B จำกัด" },
  { id: 3, name: "บริษัท C จำกัด" },
  { id: 4, name: "บริษัท D จำกัด" },
  { id: 5, name: "บริษัท E จำกัด" },
];

// Mock data - สรุปคำขอจากทั้ง 5 สาขา
const mockOrderSummary = [
  {
    branchId: 2,
    branchName: "สาขา 2",
    oilType: "Premium Diesel",
    estimatedOrderAmount: 20000, // ยอดขอจากสาขา
    systemRecommended: 22000, // ยอดวิเคราะห์จากระบบ
    currentStock: 8500, // ยอดคงเหลือใต้ดิน
    lowStockAlert: true, // แจ้งเตือนต่ำกว่าเกณฑ์
    quantityOrdered: 22000, // ยอดที่คุณนิดแก้ไข/อนุมัติ
    legalEntityId: 2,
    legalEntityName: "บริษัท B จำกัด",
    status: "รออนุมัติ",
    requestedAt: "2024-12-15 10:30",
    requestedBy: "ผู้จัดการสาขา 2",
  },
  {
    branchId: 2,
    branchName: "สาขา 2",
    oilType: "Gasohol 95",
    estimatedOrderAmount: 15000,
    systemRecommended: 18000,
    currentStock: 12000,
    lowStockAlert: false,
    quantityOrdered: 18000,
    legalEntityId: 2,
    legalEntityName: "บริษัท B จำกัด",
    status: "รออนุมัติ",
    requestedAt: "2024-12-15 10:30",
    requestedBy: "ผู้จัดการสาขา 2",
  },
  {
    branchId: 3,
    branchName: "สาขา 3",
    oilType: "Diesel",
    estimatedOrderAmount: 18000,
    systemRecommended: 20000,
    currentStock: 5000,
    lowStockAlert: true,
    quantityOrdered: 20000,
    legalEntityId: 3,
    legalEntityName: "บริษัท C จำกัด",
    status: "รออนุมัติ",
    requestedAt: "2024-12-15 11:00",
    requestedBy: "ผู้จัดการสาขา 3",
  },
  {
    branchId: 4,
    branchName: "สาขา 4",
    oilType: "Premium Diesel",
    estimatedOrderAmount: 25000,
    systemRecommended: 24000,
    currentStock: 15000,
    lowStockAlert: false,
    quantityOrdered: 24000,
    legalEntityId: 4,
    legalEntityName: "บริษัท D จำกัด",
    status: "อนุมัติแล้ว",
    requestedAt: "2024-12-15 09:45",
    requestedBy: "ผู้จัดการสาขา 4",
    approvedAt: "2024-12-15 14:30",
    approvedBy: "คุณนิด",
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
    branchId: 5,
    branchName: "สาขา 5",
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
    requestedBy: "ผู้จัดการสาขา 5",
  },
];

// Mock data - ใบสั่งซื้อที่อนุมัติแล้ว (บิลรวมการสั่งในแต่ละครั้ง)
const mockApprovedOrders = [
  {
    orderNo: "SO-20241215-001",
    supplierOrderNo: "PTT-20241215-001",
    billNo: "BILL-20241215-001",
    orderDate: "2024-12-15",
    deliveryDate: "2024-12-16",
    items: [
      { oilType: "Premium Diesel", quantity: 24000, pricePerLiter: 32.5, totalAmount: 780000 },
    ],
    totalAmount: 780000,
    branches: [
      {
        branchId: 4,
        branchName: "สาขา 4",
    legalEntityName: "บริษัท D จำกัด",
        address: "123 ถนนสุขุมวิท กรุงเทพมหานคร 10110",
        items: [
          { oilType: "Premium Diesel", quantity: 24000, pricePerLiter: 32.5, totalAmount: 780000 },
        ],
        totalAmount: 780000,
      },
    ],
    status: "ส่งแล้ว",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-15 14:30",
  },
  {
    orderNo: "SO-20241215-002",
    supplierOrderNo: "PTT-20241215-002",
    billNo: "BILL-20241215-002",
    orderDate: "2024-12-15",
    deliveryDate: "2024-12-16",
    items: [
      { oilType: "Premium Diesel", quantity: 22000, pricePerLiter: 32.5, totalAmount: 715000 },
      { oilType: "Gasohol 95", quantity: 18000, pricePerLiter: 35.0, totalAmount: 630000 },
    ],
    totalAmount: 1345000,
    branches: [
      {
        branchId: 2,
        branchName: "สาขา 2",
        legalEntityName: "บริษัท B จำกัด",
        address: "456 ถนนพหลโยธิน กรุงเทพมหานคร 10400",
        items: [
          { oilType: "Premium Diesel", quantity: 22000, pricePerLiter: 32.5, totalAmount: 715000 },
          { oilType: "Gasohol 95", quantity: 18000, pricePerLiter: 35.0, totalAmount: 630000 },
        ],
        totalAmount: 1345000,
      },
    ],
    status: "ส่งแล้ว",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-15 16:00",
  },
  {
    orderNo: "SO-20241215-003",
    supplierOrderNo: "PTT-20241215-003",
    billNo: "BILL-20241215-003",
    orderDate: "2024-12-15",
    deliveryDate: "2024-12-16",
    items: [
      { oilType: "Diesel", quantity: 20000, pricePerLiter: 30.0, totalAmount: 600000 },
      { oilType: "Premium Diesel", quantity: 15000, pricePerLiter: 32.5, totalAmount: 487500 },
    ],
    totalAmount: 1087500,
    branches: [
      {
        branchId: 3,
        branchName: "สาขา 3",
        legalEntityName: "บริษัท C จำกัด",
        address: "789 ถนนรัชดาภิเษก กรุงเทพมหานคร 10320",
        items: [
          { oilType: "Diesel", quantity: 20000, pricePerLiter: 30.0, totalAmount: 600000 },
        ],
        totalAmount: 600000,
      },
      {
        branchId: 5,
        branchName: "สาขา 5",
        legalEntityName: "บริษัท E จำกัด",
        address: "321 ถนนสีลม กรุงเทพมหานคร 10500",
        items: [
          { oilType: "Premium Diesel", quantity: 15000, pricePerLiter: 32.5, totalAmount: 487500 },
        ],
        totalAmount: 487500,
      },
    ],
    status: "ส่งแล้ว",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-15 16:15",
  },
];

// Mock data - ความจุรถ
const mockTruckCapacity = {
  morning: {
    truckCount: 2,
    chambers: [
      { chamber: 1, capacity: 3000 },
      { chamber: 2, capacity: 7000 },
      { chamber: 3, capacity: 4000 },
      { chamber: 4, capacity: 5000 },
      { chamber: 5, capacity: 0 },
      { chamber: 6, capacity: 0 },
      { chamber: 7, capacity: 0 },
    ],
  },
  afternoon: {
    truckCount: 1,
    chambers: [
      { chamber: 1, capacity: 3000 },
      { chamber: 2, capacity: 7000 },
      { chamber: 3, capacity: 4000 },
      { chamber: 4, capacity: 0 },
      { chamber: 5, capacity: 0 },
      { chamber: 6, capacity: 0 },
      { chamber: 7, capacity: 0 },
    ],
  },
  evening: {
    truckCount: 0,
    chambers: [],
  },
};

export default function Orders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [filterBranch, setFilterBranch] = useState("ทั้งหมด");
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [showSummaryView, setShowSummaryView] = useState(true);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<typeof mockOrderSummary[0] | null>(null);
  const [selectedApprovedOrder, setSelectedApprovedOrder] = useState<typeof mockApprovedOrders[0] | null>(null);
  const [showConsolidateModal, setShowConsolidateModal] = useState(false);
  const [editingOrders, setEditingOrders] = useState<typeof mockOrderSummary>([]);

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (showTruckModal || selectedOrderDetail || showConsolidateModal || selectedApprovedOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showTruckModal, selectedOrderDetail, showConsolidateModal, selectedApprovedOrder]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showConsolidateModal) setShowConsolidateModal(false);
        if (selectedOrderDetail) setSelectedOrderDetail(null);
        if (selectedApprovedOrder) setSelectedApprovedOrder(null);
        if (showTruckModal) setShowTruckModal(false);
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showTruckModal, selectedOrderDetail, showConsolidateModal, selectedApprovedOrder]);

  // คำนวณยอดรวมที่ต้องสั่ง
  const totalQuantity = mockOrderSummary.reduce((sum, order) => sum + (order.quantityOrdered || 0), 0);
  const totalTruckCapacity = mockTruckCapacity.morning.chambers.reduce((sum, c) => sum + c.capacity, 0) +
    mockTruckCapacity.afternoon.chambers.reduce((sum, c) => sum + c.capacity, 0);

  const isOverCapacity = totalQuantity > totalTruckCapacity;

  const filteredOrders = mockOrderSummary.filter((order) => {
    const matchesSearch = 
      order.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.oilType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "ทั้งหมด" || order.status === filterStatus;
    const matchesBranch = filterBranch === "ทั้งหมด" || order.branchName === filterBranch;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  // จัดกลุ่มตาม branchId
  const groupedOrders = filteredOrders.reduce((acc, order) => {
    const key = order.branchId;
    if (!acc[key]) {
      acc[key] = {
        branchId: order.branchId,
        branchName: order.branchName,
        legalEntityId: order.legalEntityId,
        legalEntityName: order.legalEntityName,
        status: order.status,
        orders: [],
        totalEstimated: 0,
        totalRecommended: 0,
        totalOrdered: 0,
        hasLowStock: false,
      };
    }
    acc[key].orders.push(order);
    acc[key].totalEstimated += order.estimatedOrderAmount;
    acc[key].totalRecommended += order.systemRecommended;
    acc[key].totalOrdered += order.quantityOrdered;
    if (order.lowStockAlert) acc[key].hasLowStock = true;
    return acc;
  }, {} as Record<number, {
    branchId: number;
    branchName: string;
    legalEntityId: number;
    legalEntityName: string;
    status: string;
    orders: typeof mockOrderSummary;
    totalEstimated: number;
    totalRecommended: number;
    totalOrdered: number;
    hasLowStock: boolean;
  }>);

  const groupedOrdersArray = Object.values(groupedOrders);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "รออนุมัติ":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800";
      case "อนุมัติแล้ว":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
      case "ส่งแล้ว":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
      case "ยกเลิก":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
    }
  };

  const handleEditQuantity = (index: number, newQuantity: number) => {
    // In real app, this would update the state
    console.log(`Editing order ${index} to ${newQuantity}`);
  };

  // const handleApproveOrders = () => {
  //   // In real app, this would approve all pending orders
  //   console.log("Approving orders...");
  // };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">การสั่งซื้อน้ำมัน</h1>
        <p className="text-gray-600 dark:text-gray-400">สรุปคำขอสั่งน้ำมันทั้ง 5 สาขา - ศูนย์กลางอยู่ที่ปั๊มไฮโซ</p>
      </motion.div>

      {/* Summary Cards - Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "ใบสั่งซื้อรออนุมัติ",
            value: mockOrderSummary.filter((o) => o.status === "รออนุมัติ").length,
            subtitle: "รายการ",
            icon: Clock,
            iconColor: "bg-gradient-to-br from-orange-500 to-orange-600",
            badge: "รออนุมัติ",
            badgeColor: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800",
          },
          {
            title: "ใบสั่งซื้ออนุมัติแล้ว",
            value: mockOrderSummary.filter((o) => o.status === "อนุมัติแล้ว").length,
            subtitle: "รายการ",
            icon: CheckCircle,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
            badge: "อนุมัติแล้ว",
            badgeColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
          },
          {
            title: "ยอดรวมที่ต้องสั่ง",
            value: numberFormatter.format(totalQuantity),
            subtitle: "ลิตร",
            icon: ShoppingCart,
            iconColor: "bg-gradient-to-br from-purple-500 to-purple-600",
          },
          {
            title: "ความจุรถทั้งหมด",
            value: numberFormatter.format(totalTruckCapacity),
            subtitle: "ลิตร",
            icon: Truck,
            iconColor: isOverCapacity ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-green-500 to-green-600",
            alert: isOverCapacity,
            alertText: isOverCapacity ? `⚠️ เกินความจุ ${numberFormatter.format(totalQuantity - totalTruckCapacity)} ลิตร` : undefined,
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
              {(stat.badge || stat.alert) && (
                <div className="mt-3 flex items-center justify-end gap-2">
                  {stat.badge && (
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${stat.badgeColor}`}>
                      {stat.badge}
                    </span>
                  )}
                  {stat.alert && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
          </div>
              )}
              {stat.alertText && (
                <p className="text-xs text-red-500 mt-2 font-medium">{stat.alertText}</p>
              )}
            </div>
        </motion.div>
        ))}
      </div>

      {/* Alert - Over Capacity */}
      {isOverCapacity && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 flex items-center gap-4 shadow-sm mb-6"
        >
          <div className="p-2 bg-red-500/20 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
              ปริมาณรวม {numberFormatter.format(totalQuantity)} ลิตร เกินความจุรถ {numberFormatter.format(totalTruckCapacity)} ลิตร
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">กรุณาตรวจสอบและแบ่งวัน หรือเพิ่มจำนวนรถ</p>
          </div>
          <button
            onClick={() => setShowTruckModal(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            จัดการรถ
          </button>
        </motion.div>
      )}

      {/* Filters - Dashboard Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาสาขา, ประเภทน้ำมัน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          />
        </div>
        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
        >
          <option>ทั้งหมด</option>
          {branches.map((branch) => (
            <option key={branch.id}>{branch.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          >
            <option>ทั้งหมด</option>
            <option>รออนุมัติ</option>
            <option>อนุมัติแล้ว</option>
            <option>ส่งแล้ว</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSummaryView(!showSummaryView)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <BarChart3 className="w-4 h-4" />
            {showSummaryView ? "ดูรายการ" : "ดูสรุป"}
          </button>
          <button className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Upload className="w-4 h-4" />
            Import Excel
          </button>
          <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            สร้างใบสั่งซื้อใหม่
          </button>
        </div>
      </motion.div>

      {/* Summary View - Card Style จัดกลุ่มตามปั้ม */}
      {showSummaryView && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-4 mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                สรุปคำขอสั่งน้ำมันทั้ง 5 สาขา
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">รายการน้ำมันทั้งหมดของแต่ละปั้มรวมกัน</p>
            </div>
            <button
              onClick={() => {
                setEditingOrders([...mockOrderSummary.filter((o) => o.status === "รออนุมัติ")]);
                setShowConsolidateModal(true);
              }}
              disabled={mockOrderSummary.filter((o) => o.status === "รออนุมัติ").length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <ShoppingCart className="w-4 h-4" />
              รวบรวมและสั่งน้ำมัน
            </button>
          </div>

          {/* Branch Cards */}
          <div className="grid grid-cols-1 gap-4">
            {groupedOrdersArray.map((group, groupIndex) => {
              const mainStatus = group.orders[0]?.status || "รออนุมัติ";
              
              return (
                <motion.div
                  key={group.branchId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 ${
                    group.hasLowStock 
                      ? "border-red-500 dark:border-red-600" 
                      : mainStatus === "รออนุมัติ"
                      ? "border-orange-500 dark:border-orange-600"
                      : mainStatus === "อนุมัติแล้ว"
                      ? "border-blue-500 dark:border-blue-600"
                      : "border-emerald-500 dark:border-emerald-600"
                  }`}
                >
                  {/* Branch Header */}
                  <div className={`p-5 border-b border-gray-200 dark:border-gray-700 ${
                    group.hasLowStock ? "bg-red-50/30 dark:bg-red-900/10" : "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
                  }`}>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                          mainStatus === "รออนุมัติ"
                            ? "bg-gradient-to-br from-orange-500 to-orange-600"
                            : mainStatus === "อนุมัติแล้ว"
                            ? "bg-gradient-to-br from-blue-500 to-blue-600"
                            : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                        }`}>
                          <MapPin className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                              {group.branchName}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusColor(mainStatus)}`}>
                              {mainStatus === "รออนุมัติ" && <Clock className="w-3.5 h-3.5" />}
                              {mainStatus === "อนุมัติแล้ว" && <CheckCircle className="w-3.5 h-3.5" />}
                              {mainStatus === "ส่งแล้ว" && <CheckCircle className="w-3.5 h-3.5" />}
                              {mainStatus}
                            </span>
                            {group.hasLowStock && (
                              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span className="text-xs font-semibold">สต็อกต่ำ</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">{group.legalEntityName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Droplet className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {group.orders.length} ประเภทน้ำมัน
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrderDetail(group.orders[0])}
                          className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors" 
                          title="ดูรายละเอียด"
                        >
                          <Eye className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Oil Items List */}
                  <div className="p-5">
                    <div className="space-y-3">
                      {group.orders.map((order, orderIndex) => {
                        const difference = order.quantityOrdered - order.estimatedOrderAmount;
                        const isEditing = editingOrder === orderIndex && group.branchId === order.branchId;
                        
                        return (
                          <div
                            key={`${order.branchId}-${order.oilType}`}
                            className={`p-4 rounded-xl border transition-all ${
                              order.lowStockAlert
                                ? "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                                : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                            }`}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                              {/* Oil Type */}
                              <div className="md:col-span-3">
                                <div className="flex items-center gap-2">
                                  <Droplet className={`w-4 h-4 ${order.lowStockAlert ? "text-red-500" : "text-blue-500"}`} />
                                  <span className="font-semibold text-gray-800 dark:text-white">{order.oilType}</span>
                                  {order.lowStockAlert && (
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                  )}
                                </div>
                              </div>

                              {/* ยอดขอจากสาขา */}
                              <div className="md:col-span-2">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ยอดขอ</div>
                                <div className="font-semibold text-gray-800 dark:text-white">
                                  {numberFormatter.format(order.estimatedOrderAmount)} ลิตร
                                </div>
                              </div>

                              {/* ยอดวิเคราะห์ */}
                              <div className="md:col-span-2">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ยอดวิเคราะห์</div>
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    {numberFormatter.format(order.systemRecommended)}
                                  </span>
                                  {order.systemRecommended > order.estimatedOrderAmount && (
                                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                                  )}
                                  {order.systemRecommended < order.estimatedOrderAmount && (
                                    <TrendingDown className="w-3.5 h-3.5 text-orange-500" />
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">ลิตร</div>
                              </div>

                              {/* สต็อกปัจจุบัน */}
                              <div className="md:col-span-2">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">สต็อกปัจจุบัน</div>
                                <div className={`font-semibold ${
                                  order.lowStockAlert 
                                    ? "text-red-600 dark:text-red-400" 
                                    : "text-gray-800 dark:text-white"
                                }`}>
                                  {numberFormatter.format(order.currentStock)} ลิตร
                                </div>
                              </div>

                              {/* ยอดสั่งจริง */}
                              <div className="md:col-span-2">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ยอดสั่งจริง</div>
                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      defaultValue={order.quantityOrdered}
                                      className="w-24 px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
                                      onBlur={(e) => {
                                        handleEditQuantity(orderIndex, parseInt(e.target.value) || 0);
                                        setEditingOrder(null);
                                      }}
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => setEditingOrder(null)}
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                                      {numberFormatter.format(order.quantityOrdered)} ลิตร
                                    </span>
                                    {difference !== 0 && (
                                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                        difference > 0 
                                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                                          : 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30'
                                      }`}>
                                        {difference > 0 ? '+' : ''}{numberFormatter.format(difference)}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => setEditingOrder(orderIndex)}
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors" 
                                      title="แก้ไขยอด"
                                    >
                                      <Edit className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* นิติบุคคล */}
                              <div className="md:col-span-1">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">นิติบุคคล</div>
                                <select
                                  defaultValue={order.legalEntityId}
                                  className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white w-full"
                                >
                                  {legalEntities.map((entity) => (
                                    <option key={entity.id} value={entity.id}>
                                      {entity.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ยอดรวมที่ขอ</div>
                          <div className="text-lg font-bold text-gray-800 dark:text-white">
                            {numberFormatter.format(group.totalEstimated)} ลิตร
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ยอดรวมที่วิเคราะห์</div>
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {numberFormatter.format(group.totalRecommended)} ลิตร
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ยอดรวมที่สั่ง</div>
                          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {numberFormatter.format(group.totalOrdered)} ลิตร
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">จำนวนรายการ</div>
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {group.orders.length} รายการ
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {groupedOrdersArray.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">ไม่พบข้อมูลคำสั่งซื้อ</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Approved Orders List */}
      {!showSummaryView && mockApprovedOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                  ใบสั่งซื้อที่อนุมัติแล้ว
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">รายการใบสั่งซื้อที่ส่งไปยัง ปตท. E-Order แล้ว - แสดงบิลรวมที่สั่งซื้อ</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ยอดรวมทั้งหมด</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {currencyFormatter.format(mockApprovedOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">เลขที่ใบสั่งซื้อ</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">เลขที่บิล</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">เลขที่ออเดอร์ ปตท.</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">วันที่สั่ง</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">วันที่ต้องการรับ</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">รายการ</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ยอดรวม</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">สถานะ</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {mockApprovedOrders.map((order, index) => (
                  <motion.tr
                    key={order.orderNo}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{order.orderNo}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {order.billNo ? (
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-purple-500" />
                          <NavLink
                            to="/app/gas-station/purchase-book"
                            className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-colors"
                          >
                            {order.billNo}
                          </NavLink>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{order.supplierOrderNo}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{order.orderDate}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{order.deliveryDate}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{item.oilType}:</span> {numberFormatter.format(item.quantity)} ลิตร
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                      {currencyFormatter.format(order.totalAmount)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedApprovedOrder(order)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                        </button>
                        {order.billNo && (
                          <NavLink
                            to="/app/gas-station/purchase-book"
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            title="ดูบิล"
                          >
                            <Receipt className="w-4 h-4 text-gray-400 hover:text-purple-500" />
                          </NavLink>
                        )}
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors" title="Export Excel">
                          <Download className="w-4 h-4 text-gray-400 hover:text-green-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Truck Capacity Modal */}
      <AnimatePresence>
      {showTruckModal && (
          <>
            {/* Backdrop */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTruckModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
              <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">จัดการความจุรถน้ำมัน</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">กรอกความจุจริงของรถที่จะมาในวันนี้</p>
                    </div>
              </div>
              <button
                onClick={() => setShowTruckModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                    aria-label="ปิด"
              >
                    <X className="w-5 h-5" />
              </button>
            </div>
                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="space-y-6">
              {/* Morning Shift */}
              <div>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">รอบเช้า</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                          <label className="text-sm text-gray-600 dark:text-gray-400 w-24">จำนวนรถ:</label>
                    <input
                      type="number"
                      defaultValue={mockTruckCapacity.morning.truckCount}
                            className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((chamber) => {
                      const chamberData = mockTruckCapacity.morning.chambers.find((c) => c.chamber === chamber);
                      return (
                        <div key={chamber} className="space-y-1">
                                <label className="text-xs text-gray-600 dark:text-gray-400 font-medium">ช่อง {chamber}</label>
                          <input
                            type="number"
                            defaultValue={chamberData?.capacity || 0}
                            placeholder="0"
                                  className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Afternoon Shift */}
              <div>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">รอบบ่าย</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                          <label className="text-sm text-gray-600 dark:text-gray-400 w-24">จำนวนรถ:</label>
                    <input
                      type="number"
                      defaultValue={mockTruckCapacity.afternoon.truckCount}
                            className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((chamber) => {
                      const chamberData = mockTruckCapacity.afternoon.chambers.find((c) => c.chamber === chamber);
                      return (
                        <div key={chamber} className="space-y-1">
                                <label className="text-xs text-gray-600 dark:text-gray-400 font-medium">ช่อง {chamber}</label>
                          <input
                            type="number"
                            defaultValue={chamberData?.capacity || 0}
                            placeholder="0"
                                  className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
                          />
                        </div>
                      );
                    })}
                        </div>
                      </div>
                  </div>
                </div>
              </div>

                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowTruckModal(false)}
                    className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => setShowTruckModal(false)}
                    className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  บันทึก
                </button>
            </div>
          </motion.div>
        </div>
          </>
      )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
      {selectedOrderDetail && (
          <>
            {/* Backdrop */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderDetail(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                    รายละเอียดคำขอสั่งซื้อน้ำมัน
                  </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedOrderDetail.branchName} - {selectedOrderDetail.oilType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                    aria-label="ปิด"
              >
                    <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border ${getStatusColor(selectedOrderDetail.status)}`}>
                  {selectedOrderDetail.status === "รออนุมัติ" && <Clock className="w-4 h-4" />}
                  {selectedOrderDetail.status === "อนุมัติแล้ว" && <CheckCircle className="w-4 h-4" />}
                  {selectedOrderDetail.status === "ส่งแล้ว" && <CheckCircle className="w-4 h-4" />}
                  {selectedOrderDetail.status}
                </span>
                {selectedOrderDetail.lowStockAlert && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-semibold">สต็อกต่ำกว่าเกณฑ์</span>
                  </div>
                )}
              </div>

              {/* Main Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* สาขา */}
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">สาขา</span>
                  </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedOrderDetail.branchName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">รหัสสาขา: {selectedOrderDetail.branchId}</p>
                </div>

                {/* ประเภทน้ำมัน */}
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                          <Droplet className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">ประเภทน้ำมัน</span>
                  </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedOrderDetail.oilType}</p>
                </div>

                {/* ยอดขอจากสาขา */}
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                          <ShoppingCart className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">ยอดขอจากสาขา</span>
                  </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {numberFormatter.format(selectedOrderDetail.estimatedOrderAmount)} ลิตร
                  </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ประมาณการจากผู้จัดการสาขา</p>
                </div>

                {/* ยอดวิเคราะห์จากระบบ */}
                      <div className="bg-white dark:bg-gray-800 border-y border-r border-gray-200 dark:border-gray-700 border-l-4 border-blue-500 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">ยอดวิเคราะห์จากระบบ</span>
                  </div>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {numberFormatter.format(selectedOrderDetail.systemRecommended)} ลิตร
                  </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    คำนวณจากยอดขายเฉลี่ย 7-14 วัน + สต็อกปัจจุบัน
                  </p>
                  {selectedOrderDetail.systemRecommended !== selectedOrderDetail.estimatedOrderAmount && (
                    <div className="flex items-center gap-1 mt-2">
                      {selectedOrderDetail.systemRecommended > selectedOrderDetail.estimatedOrderAmount ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-blue-500" />
                          <span className="text-xs text-blue-500">
                            มากกว่าที่ขอ {numberFormatter.format(selectedOrderDetail.systemRecommended - selectedOrderDetail.estimatedOrderAmount)} ลิตร
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3 text-orange-500" />
                          <span className="text-xs text-orange-500">
                            น้อยกว่าที่ขอ {numberFormatter.format(selectedOrderDetail.estimatedOrderAmount - selectedOrderDetail.systemRecommended)} ลิตร
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* สต็อกปัจจุบัน */}
                      <div className={`bg-white dark:bg-gray-800 border-y border-r border-gray-200 dark:border-gray-700 border-l-4 p-4 rounded-xl shadow-sm ${selectedOrderDetail.lowStockAlert ? 'border-red-500' : 'border-emerald-500'}`}>
                  <div className="flex items-center gap-2 mb-2">
                          <Droplet className={`w-4 h-4 ${selectedOrderDetail.lowStockAlert ? 'text-red-500' : 'text-gray-400'}`} />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">สต็อกปัจจุบัน</span>
                  </div>
                        <p className={`text-lg font-bold ${selectedOrderDetail.lowStockAlert ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
                    {numberFormatter.format(selectedOrderDetail.currentStock)} ลิตร
                  </p>
                  {selectedOrderDetail.lowStockAlert && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">⚠️ เหลือต่ำกว่าเกณฑ์ที่ตั้งไว้</p>
                  )}
                </div>

                {/* ยอดสั่งจริง */}
                      <div className="bg-white dark:bg-gray-800 border-y border-r border-gray-200 dark:border-gray-700 border-l-4 border-orange-500 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-orange-500" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">ยอดสั่งจริง</span>
                  </div>
                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {numberFormatter.format(selectedOrderDetail.quantityOrdered)} ลิตร
                  </p>
                  {selectedOrderDetail.quantityOrdered !== selectedOrderDetail.estimatedOrderAmount && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      แก้ไขจาก {numberFormatter.format(selectedOrderDetail.estimatedOrderAmount)} ลิตร
                    </p>
                  )}
                </div>

                {/* นิติบุคคล */}
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">นิติบุคคล</span>
                  </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedOrderDetail.legalEntityName}</p>
                </div>

                {/* ราคา (ถ้ามี) */}
                {selectedOrderDetail.orderNo && (
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">ราคาต่อลิตร</span>
                    </div>
                          <p className="text-lg font-bold text-gray-800 dark:text-white">32.50 บาท</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ราคา ณ วันที่สั่ง</p>
                  </div>
                )}
              </div>

              {/* Timeline */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  ประวัติการดำเนินการ
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                    <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">ส่งคำขอสั่งซื้อ</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">โดย {selectedOrderDetail.requestedBy}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{selectedOrderDetail.requestedAt}</p>
                    </div>
                  </div>
                  {selectedOrderDetail.approvedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800 dark:text-white">อนุมัติแล้ว</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">โดย {selectedOrderDetail.approvedBy}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">{selectedOrderDetail.approvedAt}</p>
                        {selectedOrderDetail.orderNo && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">เลขที่ใบสั่งซื้อ: {selectedOrderDetail.orderNo}</p>
                        )}
                        {selectedOrderDetail.supplierOrderNo && (
                                <p className="text-xs text-blue-600 dark:text-blue-400">เลขที่ออเดอร์ ปตท.: {selectedOrderDetail.supplierOrderNo}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    ข้อมูลเพิ่มเติม
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">วันที่ต้องการรับ:</span>
                            <span className="font-semibold text-gray-800 dark:text-white">2024-12-16</span>
                    </div>
                    <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">ความคลาดเคลื่อนที่ยอมรับ:</span>
                            <span className="font-semibold text-gray-800 dark:text-white">±0.3%</span>
                    </div>
                    <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">ส่งระหว่างสาขา:</span>
                            <span className="font-semibold text-gray-800 dark:text-white">ไม่ใช่</span>
                    </div>
                  </div>
                </div>

                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    ข้อมูลรถขนส่ง
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">จำนวนรถที่ต้องใช้:</span>
                            <span className="font-semibold text-gray-800 dark:text-white">1 คัน</span>
                    </div>
                    <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">ความจุรวม:</span>
                            <span className="font-semibold text-gray-800 dark:text-white">{numberFormatter.format(totalTruckCapacity)} ลิตร</span>
                    </div>
                    <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">รอบส่ง:</span>
                            <span className="font-semibold text-gray-800 dark:text-white">เช้า / บ่าย</span>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSelectedOrderDetail(null)}
                    className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                >
                  ปิด
                </button>
                {selectedOrderDetail.status === "รออนุมัติ" && (
                  <>
                    <button
                      onClick={() => {
                        setEditingOrder(filteredOrders.findIndex(o => o === selectedOrderDetail));
                        setSelectedOrderDetail(null);
                      }}
                        className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      แก้ไขยอด
                    </button>
                      <button className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      อนุมัติ
                    </button>
                  </>
                )}
                {selectedOrderDetail.orderNo && (
                    <button className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Excel
                  </button>
                )}
            </div>
          </motion.div>
        </div>
          </>
      )}
      </AnimatePresence>

      {/* Consolidate and Order Modal */}
      <AnimatePresence>
      {showConsolidateModal && (
          <>
            {/* Backdrop */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConsolidateModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                    รวบรวมและสั่งน้ำมัน
                  </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                    รายละเอียดคำขอจากทั้ง {editingOrders.length} สาขา - แก้ไขข้อมูลได้ทั้งหมด
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConsolidateModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                    aria-label="ปิด"
              >
                    <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
              <div className="space-y-4">
                {editingOrders.map((order, index) => {
                      const handleUpdateOrder = (field: keyof typeof order, value: string | number | boolean) => {
                    const updated = [...editingOrders];
                        (updated[index] as Record<string, string | number | boolean>)[field] = value;
                    setEditingOrders(updated);
                  };

                  return (
                    <motion.div
                      key={`${order.branchId}-${order.oilType}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-white dark:bg-gray-800 border-y border-r border-gray-200 dark:border-gray-700 border-l-4 border-orange-500 p-6 rounded-xl shadow-sm"
                    >
                      {/* Header Card */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                              {order.branchName}
                            </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{order.oilType}</p>
                          </div>
                        </div>
                        {order.lowStockAlert && (
                              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800">
                            <AlertTriangle className="w-4 h-4" />
                                <span className="text-xs font-semibold">สต็อกต่ำ</span>
                          </div>
                        )}
                      </div>

                      {/* Editable Fields Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* ยอดขอจากสาขา */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                            ยอดขอจากสาขา (ลิตร)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={order.estimatedOrderAmount}
                              onChange={(e) => handleUpdateOrder('estimatedOrderAmount', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-500">ลิตร</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ประมาณการจากผู้จัดการสาขา</p>
                        </div>

                        {/* ยอดวิเคราะห์จากระบบ */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                            ยอดวิเคราะห์จากระบบ (ลิตร)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={order.systemRecommended}
                              readOnly
                              className="w-full px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-600 dark:text-blue-400 font-semibold"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 dark:text-blue-400">ลิตร</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">คำนวณจากยอดขายเฉลี่ย 7-14 วัน</p>
                        </div>

                        {/* สต็อกปัจจุบัน */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                            สต็อกปัจจุบัน (ลิตร) {order.lowStockAlert && <AlertTriangle className="w-3 h-3 text-red-500 inline ml-1" />}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={order.currentStock}
                              readOnly
                              className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-xl ${
                                order.lowStockAlert ? 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white'
                              }`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-500">ลิตร</span>
                          </div>
                          {order.lowStockAlert && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">⚠️ เหลือต่ำกว่าเกณฑ์</p>
                          )}
                        </div>

                        {/* ยอดสั่งจริง (แก้ไขได้) */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                            ยอดสั่งจริง (ลิตร)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={order.quantityOrdered}
                              onChange={(e) => handleUpdateOrder('quantityOrdered', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-orange-600 dark:text-orange-400 font-semibold"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-600 dark:text-orange-400">ลิตร</span>
                          </div>
                          {order.quantityOrdered !== order.estimatedOrderAmount && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {order.quantityOrdered > order.estimatedOrderAmount ? '+' : ''}
                              {numberFormatter.format(order.quantityOrdered - order.estimatedOrderAmount)} ลิตร
                              {order.quantityOrdered > order.estimatedOrderAmount ? ' (เพิ่ม)' : ' (ลด)'}
                            </p>
                          )}
                        </div>

                        {/* นิติบุคคล (แก้ไขได้) */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                            นิติบุคคล
                          </label>
                          <select
                            value={order.legalEntityId}
                            onChange={(e) => {
                              const entity = legalEntities.find(le => le.id === parseInt(e.target.value));
                              handleUpdateOrder('legalEntityId', parseInt(e.target.value));
                              if (entity) {
                                handleUpdateOrder('legalEntityName', entity.name);
                              }
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                          >
                            {legalEntities.map((entity) => (
                              <option key={entity.id} value={entity.id}>
                                {entity.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* วันที่ต้องการรับ */}
                        <div>
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                            วันที่ต้องการรับ
                          </label>
                          <input
                            type="date"
                            defaultValue="2024-12-16"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Comparison Info */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">ส่วนต่างจากที่ขอ:</span>
                            <span className={`ml-2 font-semibold ${
                              order.quantityOrdered - order.estimatedOrderAmount > 0 ? 'text-blue-600 dark:text-blue-400' : 
                              order.quantityOrdered - order.estimatedOrderAmount < 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {order.quantityOrdered - order.estimatedOrderAmount > 0 ? '+' : ''}
                              {numberFormatter.format(order.quantityOrdered - order.estimatedOrderAmount)} ลิตร
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">ส่วนต่างจากระบบ:</span>
                            <span className={`ml-2 font-semibold ${
                              order.quantityOrdered - order.systemRecommended > 0 ? 'text-blue-600 dark:text-blue-400' : 
                              order.quantityOrdered - order.systemRecommended < 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {order.quantityOrdered - order.systemRecommended > 0 ? '+' : ''}
                              {numberFormatter.format(order.quantityOrdered - order.systemRecommended)} ลิตร
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">ผู้ขอ:</span>
                            <span className="ml-2 font-semibold text-gray-800 dark:text-white">{order.requestedBy}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Summary Section */}
                  <div className="mt-6 bg-white dark:bg-gray-800 border-y border-r border-gray-200 dark:border-gray-700 border-l-4 border-orange-500 p-6 rounded-xl shadow-sm bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  สรุปยอดรวม
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">ยอดรวมที่ขอ</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">
                      {numberFormatter.format(editingOrders.reduce((sum, o) => sum + o.estimatedOrderAmount, 0))} ลิตร
                    </p>
                  </div>
                  <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">ยอดรวมที่วิเคราะห์</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {numberFormatter.format(editingOrders.reduce((sum, o) => sum + o.systemRecommended, 0))} ลิตร
                    </p>
                  </div>
                  <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">ยอดรวมที่สั่ง</p>
                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {numberFormatter.format(editingOrders.reduce((sum, o) => sum + o.quantityOrdered, 0))} ลิตร
                    </p>
                  </div>
                  <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">จำนวนสาขา</p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">
                      {editingOrders.length} สาขา
                    </p>
                  </div>
                </div>
                {totalQuantity > totalTruckCapacity && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        ยอดรวม {numberFormatter.format(editingOrders.reduce((sum, o) => sum + o.quantityOrdered, 0))} ลิตร 
                        เกินความจุรถ {numberFormatter.format(totalTruckCapacity)} ลิตร
                      </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">กรุณาตรวจสอบและแบ่งวัน หรือเพิ่มจำนวนรถ</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
                <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-semibold">รวม {editingOrders.length} รายการ</p>
                <p className="text-xs">ยอดรวม {numberFormatter.format(editingOrders.reduce((sum, o) => sum + o.quantityOrdered, 0))} ลิตร</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowConsolidateModal(false)}
                      className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => setShowTruckModal(true)}
                      className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 flex items-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  จัดการรถ
                </button>
                <button
                  onClick={() => {
                    // สร้างข้อมูลบิลจาก orders ที่อนุมัติ
                    const orderDate = new Date().toISOString().split('T')[0];
                    const deliveryDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // วันถัดไป
                    
                    // สร้าง orderNo และ supplierOrderNo
                    const orderNo = `SO-${orderDate.replace(/-/g, '')}-${String(mockApprovedOrders.length + 1).padStart(3, '0')}`;
                    const supplierOrderNo = `PTT-${orderDate.replace(/-/g, '')}-${String(mockApprovedOrders.length + 1).padStart(3, '0')}`;
                    const billNo = `BILL-${orderDate.replace(/-/g, '')}-${String(mockApprovedOrders.length + 1).padStart(3, '0')}`;
                    
                    // คำนวณราคาต่อลิตร (mock - ในระบบจริงจะดึงจาก API)
                    const priceMap: Record<string, number> = {
                      "Premium Diesel": 32.50,
                      "Gasohol 95": 35.00,
                      "Diesel": 30.00,
                      "E85": 28.00,
                      "E20": 33.00,
                      "Gasohol 91": 36.00,
                    };
                    
                    // สร้าง items และ branches จาก editingOrders
                    const items: Array<{ oilType: string; quantity: number; pricePerLiter: number; totalAmount: number }> = [];
                    const branchesData: Array<{
                      branchId: number;
                      branchName: string;
                      legalEntityName: string;
                      address: string;
                      items: Array<{ oilType: string; quantity: number; pricePerLiter: number; totalAmount: number }>;
                      totalAmount: number;
                    }> = [];
                    
                    // จัดกลุ่มตามสาขา
                    const branchGroups = new Map<number, typeof editingOrders>();
                    editingOrders.forEach(order => {
                      if (!branchGroups.has(order.branchId)) {
                        branchGroups.set(order.branchId, []);
                      }
                      branchGroups.get(order.branchId)!.push(order);
                    });
                    
                    // สร้างข้อมูลแต่ละสาขา
                    branchGroups.forEach((orders, branchId) => {
                      const branchInfo = branches.find(b => b.id === branchId);
                      const branchItems: typeof items = [];
                      let branchTotal = 0;
                      
                      orders.forEach(order => {
                        const price = priceMap[order.oilType] || 32.50;
                        const totalAmount = order.quantityOrdered * price;
                        branchItems.push({
                          oilType: order.oilType,
                          quantity: order.quantityOrdered,
                          pricePerLiter: price,
                          totalAmount: totalAmount,
                        });
                        branchTotal += totalAmount;
                        
                        // เพิ่มใน items รวม
                        const existingItem = items.find(i => i.oilType === order.oilType);
                        if (existingItem) {
                          existingItem.quantity += order.quantityOrdered;
                          existingItem.totalAmount += totalAmount;
                        } else {
                          items.push({
                            oilType: order.oilType,
                            quantity: order.quantityOrdered,
                            pricePerLiter: price,
                            totalAmount: totalAmount,
                          });
                        }
                      });
                      
                      branchesData.push({
                        branchId: branchId,
                        branchName: orders[0].branchName,
                        legalEntityName: orders[0].legalEntityName,
                        address: branchInfo?.address || "",
                        items: branchItems,
                        totalAmount: branchTotal,
                      });
                    });
                    
                    const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);
                    
                    // สร้างข้อมูลบิล
                    const billData = {
                      orderNo,
                      supplierOrderNo,
                      billNo,
                      orderDate,
                      deliveryDate,
                      items,
                      totalAmount,
                      branches: branchesData,
                      status: "ส่งแล้ว",
                      approvedBy: "คุณนิด",
                      approvedAt: new Date().toLocaleString('th-TH', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }),
                    };
                    
                    // Navigate ไปยังหน้า PurchaseBook พร้อมข้อมูลบิล
                    navigate('/app/gas-station/purchase-book', {
                      state: {
                        newBill: billData,
                        fromOrders: true,
                      }
                    });
                    
                    setShowConsolidateModal(false);
                  }}
                      className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  อนุมัติและส่งออเดอร์
                </button>
              </div>
            </div>
          </motion.div>
        </div>
          </>
        )}
      </AnimatePresence>

      {/* Approved Order Detail Modal */}
      <AnimatePresence>
        {selectedApprovedOrder && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApprovedOrder(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                        รายละเอียดบิลรวมการสั่งซื้อ
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedApprovedOrder.orderNo} - {selectedApprovedOrder.billNo}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedApprovedOrder(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                    aria-label="ปิด"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border ${getStatusColor(selectedApprovedOrder.status)}`}>
                        {selectedApprovedOrder.status === "ส่งแล้ว" && <CheckCircle className="w-4 h-4" />}
                        {selectedApprovedOrder.status}
                      </span>
                    </div>

                    {/* Main Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* เลขที่ใบสั่งซื้อ */}
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <ShoppingCart className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">เลขที่ใบสั่งซื้อ</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedApprovedOrder.orderNo}</p>
                      </div>

                      {/* เลขที่บิล */}
                      {selectedApprovedOrder.billNo && (
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Receipt className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">เลขที่บิล</span>
                          </div>
                          <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedApprovedOrder.billNo}</p>
                        </div>
                      )}

                      {/* เลขที่ออเดอร์ ปตท. */}
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">เลขที่ออเดอร์ ปตท.</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedApprovedOrder.supplierOrderNo}</p>
                      </div>

                      {/* วันที่สั่ง */}
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">วันที่สั่ง</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedApprovedOrder.orderDate}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">วันที่ต้องการรับ: {selectedApprovedOrder.deliveryDate}</p>
                      </div>
                    </div>

                    {/* รายละเอียดแต่ละสาขา */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          รายละเอียดสาขาในบิลรวม (5 สาขา)
                        </h4>
                      </div>
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {branches.map((branchInfo) => {
                          // หาข้อมูลสาขานี้ในบิล
                          const branchData = selectedApprovedOrder.branches.find(b => b.branchId === branchInfo.id);
                          const hasItems = branchData && branchData.items && branchData.items.length > 0;
                          
                          return (
                            <div key={branchInfo.id} className="p-6">
                              {/* สาขา Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4 flex-1">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                                    hasItems 
                                      ? "bg-gradient-to-br from-blue-500 to-cyan-500" 
                                      : "bg-gray-200 dark:bg-gray-700"
                                  }`}>
                                    <MapPin className={`w-6 h-6 ${hasItems ? "text-white" : "text-gray-400"}`} />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-base font-bold text-gray-800 dark:text-white mb-1">{branchInfo.name}</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                      {branchData?.legalEntityName || branchInfo.legalEntityName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1 mt-1">
                                      <MapPin className="w-3 h-3" />
                                      {branchData?.address || branchInfo.address}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ยอดรวมสาขา</p>
                                  <p className={`text-lg font-bold ${
                                    hasItems 
                                      ? "text-blue-600 dark:text-blue-400" 
                                      : "text-gray-400 dark:text-gray-500"
                                  }`}>
                                    {hasItems 
                                      ? currencyFormatter.format(branchData.totalAmount || 0)
                                      : "฿0"
                                    }
                                  </p>
                                </div>
                              </div>

                              {/* รายการน้ำมันของสาขานี้ */}
                              {hasItems ? (
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl overflow-hidden">
                                  <table className="w-full">
                                    <thead className="bg-gray-100 dark:bg-gray-800">
                                      <tr>
                                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">ประเภทน้ำมัน</th>
                                        <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">ปริมาณ (ลิตร)</th>
                                        <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">ราคาต่อลิตร</th>
                                        <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">ยอดรวม</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(branchData.items || []).map((item, itemIdx) => (
                                        <tr key={itemIdx} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                                          <td className="py-2.5 px-4 text-sm text-gray-800 dark:text-white">
                                            <div className="flex items-center gap-2">
                                              <Droplet className="w-3.5 h-3.5 text-blue-500" />
                                              {item.oilType}
                                            </div>
                                          </td>
                                          <td className="py-2.5 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                                            {numberFormatter.format(item.quantity)}
                                          </td>
                                          <td className="py-2.5 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                                            {item.pricePerLiter.toFixed(2)}
                                          </td>
                                          <td className="py-2.5 px-4 text-sm text-right font-semibold text-gray-800 dark:text-white">
                                            {currencyFormatter.format(item.totalAmount)}
                                          </td>
                                        </tr>
                                      ))}
                                      <tr className="bg-white dark:bg-gray-800">
                                        <td colSpan={3} className="py-2.5 px-4 text-sm font-semibold text-gray-800 dark:text-white text-right">
                                          รวมสาขา
                                        </td>
                                        <td className="py-2.5 px-4 text-sm font-bold text-blue-600 dark:text-blue-400 text-right">
                                          {currencyFormatter.format(branchData.totalAmount || 0)}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-center">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">ไม่มีรายการสั่งซื้อในบิลนี้</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* สรุปยอดรวมทั้งหมด */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-gray-800 dark:text-white">ยอดรวมทั้งบิล</span>
                          </div>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {currencyFormatter.format(selectedApprovedOrder.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <History className="w-4 h-4" />
                        ประวัติการดำเนินการ
                      </h4>
                      <div className="space-y-3">
                        {selectedApprovedOrder.approvedAt && (
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800 dark:text-white">อนุมัติแล้ว</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">โดย {selectedApprovedOrder.approvedBy}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">{selectedApprovedOrder.approvedAt}</p>
                            </div>
                          </div>
                        )}
                        {selectedApprovedOrder.status === "ส่งแล้ว" && (
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800 dark:text-white">ส่งออเดอร์แล้ว</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">ส่งไปยัง PTT E-Order แล้ว</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setSelectedApprovedOrder(null)}
                    className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    ปิด
                  </button>
                  {selectedApprovedOrder.billNo && (
                    <NavLink
                      to="/app/gas-station/purchase-book"
                      className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 flex items-center gap-2"
                    >
                      <Receipt className="w-4 h-4" />
                      ดูบิล
                    </NavLink>
                  )}
                  <button className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Excel
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
