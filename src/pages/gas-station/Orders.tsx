import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useGasStation } from "@/contexts/GasStationContext";
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
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
  User,
  Upload,
  Image,
  Paperclip,
} from "lucide-react";
import NewOrderForm from "./NewOrderForm";
import { mockTruckOrders, type TruckOrder, mockTrucks, mockTrailers } from "./TruckProfiles";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// ตัวเลือกปริมาณมาตรฐาน (ลิตร) สำหรับ dropdown
const quantityOptions = [
  1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
  12000, 15000, 18000, 20000, 22000, 24000, 25000, 28000, 30000,
  32000, 35000, 38000, 40000, 45000, 50000, 60000, 70000, 80000, 90000, 100000
];

// Import shared data from gasStationOrders.ts
import { branches, legalEntities } from "@/data/gasStationOrders";
import type { PurchaseOrder, OrderSummaryItem } from "@/types/gasStation";

// Mock data - ใบสั่งซื้อที่อนุมัติแล้ว (บิลรวมการสั่งในแต่ละครั้ง)
// ข้อมูลนี้ถูกย้ายไปที่ src/data/gasStationOrders.ts แล้ว
// ใช้ import mockApprovedOrders จาก "@/data/gasStationOrders" แทน

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
  const { orders, purchaseOrders, createPurchaseOrder, updateOrder } = useGasStation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [filterBranch, setFilterBranch] = useState("ทั้งหมด");
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<typeof orders[0] | null>(null);
  const [selectedApprovedOrder, setSelectedApprovedOrder] = useState<typeof purchaseOrders[0] | null>(null);
  const [showConsolidateModal, setShowConsolidateModal] = useState(false);
  const [editingOrders, setEditingOrders] = useState<typeof orders>([]);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderItems, setNewOrderItems] = useState<Array<{
    branchId: number;
    branchName: string;
    oilType: string;
    quantity: number;
    legalEntityId: number;
    legalEntityName: string;
  }>>([]);
  const [selectedTruckOrders, setSelectedTruckOrders] = useState<TruckOrder[]>([]);
  const [showTruckOrderModal, setShowTruckOrderModal] = useState(false);
  const [selectedTrucksAndDrivers, setSelectedTrucksAndDrivers] = useState<Array<{
    truckId: string;
    truckPlateNumber: string;
    trailerId: string;
    trailerPlateNumber: string;
    driverId: number;
    driverName: string;
    driverCode: string;
  }>>([]);
  const [orderAttachments, setOrderAttachments] = useState<Array<{
    id: string;
    name: string;
    type: "image" | "file";
    url: string;
    file?: File;
    size?: number;
  }>>([]);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [viewingAttachments, setViewingAttachments] = useState<typeof orderAttachments>([]);

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
        if (showNewOrderModal) setShowNewOrderModal(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showTruckModal, selectedOrderDetail, showConsolidateModal, selectedApprovedOrder, showNewOrderModal]);

  // คำนวณยอดรวมที่ต้องสั่ง
  const totalQuantity = orders.reduce((sum, order) => sum + (order.quantityOrdered || 0), 0);
  const totalTruckCapacity = mockTruckCapacity.morning.chambers.reduce((sum, c) => sum + c.capacity, 0) +
    mockTruckCapacity.afternoon.chambers.reduce((sum, c) => sum + c.capacity, 0);


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


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                บันทึกใบเสนอราคาจากปตท.
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                ปั๊มไฮโซ - สั่งน้ำมันให้ทุกสาขา
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ใบสั่งซื้อรออนุมัติ</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{orders.filter((o) => o.status === "รออนุมัติ").length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ใบสั่งซื้ออนุมัติแล้ว</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{orders.filter((o) => o.status === "อนุมัติแล้ว").length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ยอดรวมที่ต้องสั่ง</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{numberFormatter.format(totalQuantity)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ความจุรถทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{numberFormatter.format(totalTruckCapacity)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ส่งแล้ว</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{orders.filter((o) => o.status === "ส่งแล้ว").length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">มูลค่ารวม</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {currencyFormatter.format(purchaseOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
              </p>
            </div>
          </div>



          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาสาขา, ประเภทน้ำมัน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>ทั้งหมด</option>
                {branches.map((branch) => (
                  <option key={branch.id}>{branch.name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>ทั้งหมด</option>
                <option>รออนุมัติ</option>
                <option>อนุมัติแล้ว</option>
                <option>ส่งแล้ว</option>
              </select>
            </div>
            <button
              onClick={() => {
                setNewOrderItems([]);
                setShowNewOrderModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              สร้างใบสั่งซื้อใหม่
            </button>
          </div>
        </div>

        {/* Purchase Orders List */}
        {purchaseOrders.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              ใบสั่งซื้อที่อนุมัติแล้ว
            </h2>
            <div className="space-y-4">
              {purchaseOrders.map((order) => (
                <motion.div
                  key={order.orderNo}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                          เลขที่: {order.orderNo}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">วันที่สั่ง</p>
                            <p className="font-semibold text-gray-800 dark:text-white">{order.orderDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">วันที่ต้องการรับ</p>
                            <p className="font-semibold text-gray-800 dark:text-white">{order.deliveryDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">เลขที่ออเดอร์ ปตท.</p>
                            <p className="font-semibold text-gray-800 dark:text-white">{order.supplierOrderNo}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">มูลค่ารวม</p>
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              {currencyFormatter.format(order.totalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {order.billNo && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">เลขที่บิล</p>
                          <NavLink
                            to="/app/gas-station/purchase-book"
                            className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-colors flex items-center gap-2"
                          >
                            <Receipt className="w-4 h-4" />
                            {order.billNo}
                          </NavLink>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm"
                          >
                            <Droplet className="inline h-4 w-4 mr-1" />
                            {item.oilType}: {numberFormatter.format(item.quantity)} ลิตร
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setSelectedApprovedOrder(order)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        ดูรายละเอียด
                      </button>
                      <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

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
                      <div className="bg-white dark:bg-gray-800 border-l-4 border-blue-500 border-t border-b border-r border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
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
                      <div className="bg-white dark:bg-gray-800 border-l-4 border-orange-500 border-t border-b border-r border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
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
                        รายละเอียดคำขอจากทั้ง {new Set(editingOrders.map(o => o.branchId)).size} สาขา ({editingOrders.length} รายการ) - แก้ไขข้อมูลได้ทั้งหมด
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
                        (updated[index] as unknown as Record<string, string | number | boolean>)[field] = value;
                        setEditingOrders(updated);
                      };

                      return (
                        <motion.div
                          key={`${order.branchId}-${order.oilType}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-white dark:bg-gray-800 border-l-4 border-orange-500 border-t border-b border-r border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-sm"
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
                              <select
                                value={order.estimatedOrderAmount}
                                onChange={(e) => handleUpdateOrder('estimatedOrderAmount', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                              >
                                {quantityOptions.map((qty) => (
                                  <option key={qty} value={qty}>
                                    {numberFormatter.format(qty)} ลิตร
                                  </option>
                                ))}
                              </select>
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
                                  className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-xl ${order.lowStockAlert ? 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white'
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
                              <select
                                value={order.quantityOrdered}
                                onChange={(e) => handleUpdateOrder('quantityOrdered', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-orange-600 dark:text-orange-400 font-semibold"
                              >
                                {quantityOptions.map((qty) => (
                                  <option key={qty} value={qty}>
                                    {numberFormatter.format(qty)} ลิตร
                                  </option>
                                ))}
                              </select>
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
                                <span className={`ml-2 font-semibold ${order.quantityOrdered - order.estimatedOrderAmount > 0 ? 'text-blue-600 dark:text-blue-400' :
                                    order.quantityOrdered - order.estimatedOrderAmount < 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'
                                  }`}>
                                  {order.quantityOrdered - order.estimatedOrderAmount > 0 ? '+' : ''}
                                  {numberFormatter.format(order.quantityOrdered - order.estimatedOrderAmount)} ลิตร
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">ส่วนต่างจากระบบ:</span>
                                <span className={`ml-2 font-semibold ${order.quantityOrdered - order.systemRecommended > 0 ? 'text-blue-600 dark:text-blue-400' :
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

                  {/* Selected Trucks and Drivers Display */}
                  {selectedTrucksAndDrivers.length > 0 && (
                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        รถและคนขับที่เลือก ({selectedTrucksAndDrivers.length} คัน)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedTrucksAndDrivers.map((pair, index) => {
                          const truck = mockTrucks.find((t) => t.id === pair.truckId);
                          const trailer = mockTrailers.find((t) => t.id === pair.trailerId);

                          return (
                            <div
                              key={index}
                              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-2">
                                      <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                      <span className="text-gray-600 dark:text-gray-400">
                                        รถ: {pair.truckPlateNumber}
                                        {truck && ` (${truck.brand} ${truck.model})`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Droplet className="w-3.5 h-3.5 text-orange-500" />
                                      <span className="text-gray-600 dark:text-gray-400">
                                        หาง: {pair.trailerPlateNumber}
                                        {trailer && ` (${numberFormatter.format(trailer.capacity)} ลิตร)`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span className="text-gray-600 dark:text-gray-400">
                                        คนขับ: {pair.driverName} ({pair.driverCode})
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setSelectedTrucksAndDrivers(selectedTrucksAndDrivers.filter((_, i) => i !== index))}
                                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-2"
                                >
                                  <X className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Attachments Section */}
                  <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      หลักฐานใบเสนอราคา ({orderAttachments.length} ไฟล์)
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              files.forEach((file) => {
                                const isImage = file.type.startsWith("image/");
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const url = event.target?.result as string;
                                  const newAttachment = {
                                    id: `att-${Date.now()}-${Math.random()}`,
                                    name: file.name,
                                    type: (isImage ? "image" : "file") as "image" | "file",
                                    url,
                                    file,
                                    size: file.size,
                                  };
                                  setOrderAttachments((prev) => [...prev, newAttachment]);
                                };
                                if (isImage) {
                                  reader.readAsDataURL(file);
                                } else {
                                  // สำหรับไฟล์ที่ไม่ใช่รูปภาพ ใช้ object URL
                                  const url = URL.createObjectURL(file);
                                  const newAttachment = {
                                    id: `att-${Date.now()}-${Math.random()}`,
                                    name: file.name,
                                    type: "file" as const,
                                    url,
                                    file,
                                    size: file.size,
                                  };
                                  setOrderAttachments((prev) => [...prev, newAttachment]);
                                }
                              });
                            }}
                            className="hidden"
                          />
                          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
                            <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                              เพิ่มหลักฐาน (รูปภาพ/ไฟล์)
                            </span>
                          </div>
                        </label>
                      </div>
                      {orderAttachments.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {orderAttachments.map((att) => (
                            <div
                              key={att.id}
                              className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-700 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {att.type === "image" ? (
                                  <Image className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                ) : (
                                  <Paperclip className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-800 dark:text-white truncate">{att.name}</p>
                                  {att.size && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {(att.size / 1024).toFixed(1)} KB
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => setOrderAttachments(orderAttachments.filter((a) => a.id !== att.id))}
                                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-2 flex-shrink-0"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="mt-6 bg-white dark:bg-gray-800 border-l-4 border-orange-500 border-t border-b border-r border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-sm bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      สรุปยอดรวมทุกสาขา
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
                          {new Set(editingOrders.map(o => o.branchId)).size} สาขา ({editingOrders.length} รายการ)
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
                    <p className="font-semibold">รวม {new Set(editingOrders.map(o => o.branchId)).size} สาขา ({editingOrders.length} รายการ)</p>
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
                      onClick={() => setShowTruckOrderModal(true)}
                      className="px-6 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 font-medium rounded-xl border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 flex items-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      เลือกออเดอร์รถ ({selectedTruckOrders.length})
                    </button>
                    <button
                      onClick={() => {
                        // สร้างข้อมูลบิลจาก orders ที่อนุมัติ
                        const orderDate = new Date().toISOString().split('T')[0];
                        const deliveryDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // วันถัดไป

                        // สร้าง orderNo และ supplierOrderNo
                        const orderNo = `SO-${orderDate.replace(/-/g, '')}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
                        const supplierOrderNo = `PTT-${orderDate.replace(/-/g, '')}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
                        const billNo = `BILL-${orderDate.replace(/-/g, '')}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;

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
                          status: "รอเริ่ม" as const, // เปลี่ยนเป็นรอเริ่มเพื่อให้สามารถสร้าง Transport ได้
                          approvedBy: "คุณนิด",
                          approvedAt: new Date().toISOString(),
                          attachments: orderAttachments.map((att) => ({
                            id: att.id,
                            name: att.name,
                            type: att.type,
                            url: att.url,
                            size: att.size,
                            uploadedAt: new Date().toISOString(),
                          })),
                        };

                        // บันทึก Purchase Order ใน context
                        createPurchaseOrder({
                          ...billData,
                          items: billData.items.map((item, idx) => ({
                            id: `item-${idx}`,
                            oilType: item.oilType as PurchaseOrder["items"][0]["oilType"],
                            quantity: item.quantity,
                            pricePerLiter: item.pricePerLiter,
                            totalAmount: item.totalAmount,
                          })),
                          branches: billData.branches.map((branch) => ({
                            branchId: branch.branchId,
                            branchName: branch.branchName,
                            legalEntityName: branch.legalEntityName,
                            address: branch.address,
                            deliveryStatus: "รอส่ง" as const,
                            items: branch.items.map((item, idx) => ({
                              id: `item-${idx}`,
                              oilType: item.oilType as PurchaseOrder["items"][0]["oilType"],
                              quantity: item.quantity,
                              pricePerLiter: item.pricePerLiter,
                              totalAmount: item.totalAmount,
                            })),
                            totalAmount: branch.totalAmount,
                          })),
                          attachments: billData.attachments,
                        });

                        // อัปเดตสถานะ Order ทั้งหมดเป็น "อนุมัติแล้ว"
                        editingOrders.forEach((order) => {
                          const orderId = `${order.branchId}-${order.oilType}`;
                          updateOrder(orderId, {
                            status: "อนุมัติแล้ว",
                            orderNo: orderNo,
                            supplierOrderNo: supplierOrderNo,
                            approvedBy: "คุณนิด",
                            approvedAt: new Date().toISOString(),
                          });
                        });

                        // ตรวจสอบว่ามีการเลือกรถและคนขับหรือไม่
                        if (selectedTrucksAndDrivers.length === 0) {
                          alert("กรุณาเลือกรถ หาง และคนขับสำหรับจัดส่ง");
                          return;
                        }

                        // อัพเดตสถานะออเดอร์รถที่เลือก
                        if (selectedTruckOrders.length > 0) {
                          selectedTruckOrders.forEach((truckOrder) => {
                            // ในระบบจริงจะอัพเดตผ่าน API
                            console.log(`อัพเดตออเดอร์รถ ${truckOrder.orderNo} เป็น in-use และใช้ในออเดอร์ ${orderNo}`);
                          });
                        }

                        // Navigate ไปยังหน้า PurchaseBook พร้อมข้อมูลบิล
                        navigate('/app/gas-station/purchase-book', {
                          state: {
                            newBill: billData,
                            fromOrders: true,
                            trucksAndDrivers: selectedTrucksAndDrivers,
                          }
                        });

                        setShowConsolidateModal(false);
                        setSelectedTrucksAndDrivers([]);
                        setOrderAttachments([]);
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

      {/* Truck Order Selection Modal */}
      <AnimatePresence>
        {showTruckOrderModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTruckOrderModal(false)}
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
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                        เลือกออเดอร์รถน้ำมัน
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        เลือกออเดอร์รถที่ต้องการใช้ในการส่งน้ำมัน
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTruckOrderModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="space-y-3">
                    {mockTruckOrders
                      .filter((order) => order.status === "ready-to-pickup")
                      .map((order) => {
                        const isSelected = selectedTruckOrders.some((o) => o.id === order.id);
                        return (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                              }`}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedTruckOrders(selectedTruckOrders.filter((o) => o.id !== order.id));
                              } else {
                                setSelectedTruckOrders([...selectedTruckOrders, order]);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">{order.orderNo}</h4>
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-medium">
                                    รอเรียกใช้
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs">รถ</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{order.truckPlateNumber}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs">หาง</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{order.trailerPlateNumber}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs">คนขับ</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{order.driver}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs">ปริมาณ</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      {numberFormatter.format(order.quantity)} ลิตร
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                  <span>{order.fromBranch}</span> → <span>{order.toBranch}</span> • {order.oilType}
                                </div>
                              </div>
                              <div className="ml-4">
                                {isSelected && (
                                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    {mockTruckOrders.filter((order) => order.status === "ready-to-pickup").length === 0 && (
                      <div className="text-center py-12">
                        <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">ไม่มีออเดอร์รถที่พร้อมใช้งาน</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between px-6 py-5 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    เลือกแล้ว {selectedTruckOrders.length} ออเดอร์
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowTruckOrderModal(false)}
                      className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={() => setShowTruckOrderModal(false)}
                      className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      ยืนยัน ({selectedTruckOrders.length})
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* New Order Modal - สร้างใบสั่งซื้อใหม่สำหรับทุกสาขา */}
      <AnimatePresence>
        {showNewOrderModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewOrderModal(false)}
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
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                        สร้างใบสั่งซื้อใหม่ - ทุกสาขา
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        สั่งน้ำมันได้จากทุกสาขาพร้อมกัน
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNewOrderModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                    aria-label="ปิด"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="space-y-6">
                    {/* New Order Form */}
                    <NewOrderForm
                      branches={branches}
                      legalEntities={legalEntities}
                      items={newOrderItems}
                      onItemsChange={setNewOrderItems}
                      onClose={() => setShowNewOrderModal(false)}
                      onSave={(items, selectedTrucksAndDriversFromForm) => {
                        // แปลง items เป็น editingOrders format
                        const now = new Date();
                        const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
                        const dateString = `${now.toISOString().split("T")[0]} ${timeString}`;

                        // สร้างรายการใหม่ในรูปแบบ editingOrders
                        const newOrders = items.map((item) => ({
                          branchId: item.branchId,
                          branchName: item.branchName,
                          oilType: item.oilType,
                          estimatedOrderAmount: item.quantity,
                          systemRecommended: item.quantity,
                          currentStock: 0, // จะดึงจากระบบจริง
                          lowStockAlert: false,
                          quantityOrdered: item.quantity,
                          legalEntityId: item.legalEntityId,
                          legalEntityName: item.legalEntityName,
                          status: "รออนุมัติ" as const,
                          requestedAt: dateString,
                          requestedBy: "คุณนิด",
                        }));

                        // เก็บข้อมูลรถและคนขับที่เลือก
                        setEditingOrders(newOrders.map((order) => ({
                          ...order,
                          oilType: order.oilType as OrderSummaryItem["oilType"],
                        })));
                        // แปลง TruckDriverPair ให้ตรงกับ type ที่ต้องการ
                        setSelectedTrucksAndDrivers(selectedTrucksAndDriversFromForm.map((pair) => ({
                          truckId: pair.truckId,
                          truckPlateNumber: pair.truckPlateNumber,
                          trailerId: pair.trailerId,
                          trailerPlateNumber: pair.trailerPlateNumber,
                          driverId: pair.driverId ? parseInt(pair.driverId) : 0,
                          driverName: pair.driverName || "",
                          driverCode: pair.driverCode || "",
                        })));
                        setShowNewOrderModal(false);
                        setNewOrderItems([]);
                        setShowConsolidateModal(true);
                      }}
                    />

                    {/* Attachments Section */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        หลักฐานใบเสนอราคา ({orderAttachments.length} ไฟล์)
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              multiple
                              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                files.forEach((file) => {
                                  const isImage = file.type.startsWith("image/");
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const url = event.target?.result as string;
                                    const newAttachment = {
                                      id: `att-${Date.now()}-${Math.random()}`,
                                      name: file.name,
                                      type: (isImage ? "image" : "file") as "image" | "file",
                                      url,
                                      file,
                                      size: file.size,
                                    };
                                    setOrderAttachments((prev) => [...prev, newAttachment]);
                                  };
                                  if (isImage) {
                                    reader.readAsDataURL(file);
                                  } else {
                                    // สำหรับไฟล์ที่ไม่ใช่รูปภาพ ใช้ object URL
                                    const url = URL.createObjectURL(file);
                                    const newAttachment = {
                                      id: `att-${Date.now()}-${Math.random()}`,
                                      name: file.name,
                                      type: "file" as const,
                                      url,
                                      file,
                                      size: file.size,
                                    };
                                    setOrderAttachments((prev) => [...prev, newAttachment]);
                                  }
                                });
                              }}
                              className="hidden"
                            />
                            <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
                              <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                เพิ่มหลักฐาน (รูปภาพ/ไฟล์)
                              </span>
                            </div>
                          </label>
                        </div>
                        {orderAttachments.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {orderAttachments.map((att) => (
                              <div
                                key={att.id}
                                className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-700 flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {att.type === "image" ? (
                                    <Image className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                  ) : (
                                    <Paperclip className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-800 dark:text-white truncate">{att.name}</p>
                                    {att.size && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {(att.size / 1024).toFixed(1)} KB
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => setOrderAttachments(orderAttachments.filter((a) => a.id !== att.id))}
                                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-2 flex-shrink-0"
                                >
                                  <X className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
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
                        {selectedApprovedOrder.status === "ขนส่งสำเร็จ" && <CheckCircle className="w-4 h-4" />}
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
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${hasItems
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
                                  <p className={`text-lg font-bold ${hasItems
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
                        {selectedApprovedOrder.status === "ขนส่งสำเร็จ" && (
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
                  <button
                    onClick={() => {
                      setViewingAttachments(selectedApprovedOrder.attachments || []);
                      setShowAttachmentsModal(true);
                    }}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-200 font-medium flex items-center gap-2"
                  >
                    <Paperclip className="w-4 h-4" />
                    ดูหลักฐาน {selectedApprovedOrder.attachments && selectedApprovedOrder.attachments.length > 0 && `(${selectedApprovedOrder.attachments.length})`}
                  </button>
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

      {/* Attachments View Modal */}
      <AnimatePresence>
        {showAttachmentsModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAttachmentsModal(false)}
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
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Paperclip className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                        หลักฐานใบเสนอราคา
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {viewingAttachments.length} ไฟล์
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAttachmentsModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                    aria-label="ปิด"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        {att.type === "image" ? (
                          <div className="relative">
                            <img
                              src={att.url}
                              alt={att.name}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Image className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{att.name}</p>
                                </div>
                                <a
                                  href={att.url}
                                  download={att.name}
                                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                >
                                  <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </a>
                              </div>
                              {att.size && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {(att.size / 1024).toFixed(1)} KB
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Paperclip className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{att.name}</p>
                                {att.size && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {(att.size / 1024).toFixed(1)} KB
                                  </p>
                                )}
                              </div>
                            </div>
                            <a
                              href={att.url}
                              download={att.name}
                              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              ดาวน์โหลดไฟล์
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {viewingAttachments.length === 0 && (
                    <div className="text-center py-12">
                      <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">ไม่มีหลักฐาน</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowAttachmentsModal(false)}
                    className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    ปิด
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
