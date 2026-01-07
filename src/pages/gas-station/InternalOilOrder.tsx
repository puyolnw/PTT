import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle,
  Clock,
  X,
  Building2,
  FileText,
  Eye,
  DollarSign,
  Droplet,
  Truck,
  CheckCircle2,
  PlusCircle,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import type { InternalOilOrder, OilType } from "@/types/gasStation";
import TableActionMenu from "@/components/TableActionMenu";
import { mockDrivers } from "@/data/mockData";
import { mockTrucks, mockTrailers } from "./TruckProfiles";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});


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

const RECOVERED_STORAGE_KEY = "ptt.delivery.recoveredOil.v1";

interface RecoveredOilItem {
  id: string;
  createdAt: string;
  fromBranchId: number;
  fromBranchName: string;
  tankNumber?: number;
  oilType: OilType;
  quantityAvailable: number;
  notes?: string;
}

export default function InternalOilOrder() {
  const { 
    branches, 
    internalOrders, 
    createInternalOrder, 
    getNextRunningNumber,
    driverJobs
  } = useGasStation();
  const { selectedBranches } = useBranch();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isHiso = branches.find(b => b.id === 1)?.name === "ปั๊มไฮโซ" && user?.role === "gas-station"; // Simplified check
  const canCreate = isAdmin || isHiso;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | InternalOilOrder["status"]>("all");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<InternalOilOrder | null>(null);
  
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1); // Default: ปั๊มไฮโซ
  const [sourceType, setSourceType] = useState<"external" | "sucked" | "remaining">("sucked");
  const [sourceRefId, setSourceRefId] = useState<string>("");
  
  const [orderItems, setOrderItems] = useState<Array<{
    oilType: OilType;
    quantity: number;
    pricePerLiter: number;
    sourceRefId?: string;
  }>>([]);
  const [requestedDate, setRequestedDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Logistics state
  const [selectedDriverId, setSelectedDriverId] = useState<number | "">("");
  const [selectedTruckId, setSelectedTruckId] = useState<string>("");
  const [selectedTrailerId, setSelectedTrailerId] = useState<string>("");

  // Load recovered oil from storage
  const recoveredOilItems = useMemo(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(RECOVERED_STORAGE_KEY);
      return raw ? JSON.parse(raw) as RecoveredOilItem[] : [];
    } catch {
      return [];
    }
  }, []);

  // Calculate remaining on truck items
  const remainingOnTruckItems = useMemo(() => {
    const all: Array<{
      id: string;
      transportNo: string;
      branchName: string;
      oilType: OilType;
      remainingQty: number;
    }> = [];
    
    driverJobs.forEach((job) => {
      job.destinationBranches.forEach((b) => {
        if (b.status !== "ส่งแล้ว") {
          all.push({
            id: `${job.id}-${b.branchId}-${b.oilType}`,
            transportNo: job.transportNo,
            branchName: b.branchName,
            oilType: b.oilType,
            remainingQty: b.quantity,
          });
        }
      });
    });
    return all;
  }, [driverJobs]);

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
        order.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || order.status === filterStatus;
      const matchesDate = isDateInRange(order.orderDate, filterDateFrom, filterDateTo);
      const matchesGlobalBranch = selectedBranchIds.length === 0 || selectedBranchIds.includes(order.fromBranchId);
      return matchesSearch && matchesStatus && matchesDate && matchesGlobalBranch;
    });
  }, [internalOrders, searchTerm, filterStatus, filterDateFrom, filterDateTo, selectedBranchIds]);

  // Statistics
  const stats = useMemo(() => {
    const total = internalOrders.length;
    const pending = internalOrders.filter((o) => o.status === "รออนุมัติ").length;
    const approved = internalOrders.filter((o) => o.status === "อนุมัติแล้ว").length;
    const delivering = internalOrders.filter((o) => o.status === "กำลังจัดส่ง").length;
    const completed = internalOrders.filter((o) => o.status === "ส่งแล้ว").length;
    return { total, pending, approved, delivering, completed };
  }, [internalOrders]);

  const handleAddOrderItem = () => {
    setOrderItems([...orderItems, { 
      oilType: "Premium Diesel", 
      quantity: 0,
      pricePerLiter: oilPrices["Premium Diesel"] 
    }]);
  };

  const handleRemoveOrderItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateOrderItem = (index: number, field: "oilType" | "quantity" | "pricePerLiter", value: OilType | number) => {
    setOrderItems(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      const updatedItem = { ...item };
      if (field === "oilType") {
        updatedItem.oilType = value as OilType;
        updatedItem.pricePerLiter = oilPrices[value as OilType] || 0;
      } else if (field === "quantity") {
        updatedItem.quantity = value as number;
      } else if (field === "pricePerLiter") {
        updatedItem.pricePerLiter = value as number;
      }
      return updatedItem;
    }));
  };

  const handleSaveOrder = () => {
    if (!requestedDate) {
      alert("กรุณาเลือกวันที่ต้องการรับ");
      return;
    }
    if (orderItems.length === 0) {
      alert("กรุณาเพิ่มรายการน้ำมัน");
      return;
    }
    if (orderItems.some((item) => item.quantity <= 0)) {
      alert("กรุณากรอกจำนวนน้ำมันให้ถูกต้อง");
      return;
    }

    // Calculate totals
    const itemsWithTotal = orderItems.map((item) => ({
      ...item,
      totalAmount: item.quantity * item.pricePerLiter,
    }));

    const allSourceRefIds = orderItems.map(i => i.sourceRefId).filter(Boolean) as string[];
    const combinedSourceRefId = allSourceRefIds.length > 0 ? allSourceRefIds.join(",") : sourceRefId;

    const totalAmount = itemsWithTotal.reduce((sum, item) => sum + item.totalAmount, 0);

    // Generate order number
    const orderNo = getNextRunningNumber("internal-oil-order");
    const today = new Date();

    const selectedBranch = branches.find((b) => b.id === selectedBranchId);
    const driver = mockDrivers.find(d => d.id === selectedDriverId);
    const truck = mockTrucks.find(t => t.id === selectedTruckId);
    const trailer = mockTrailers.find(t => t.id === selectedTrailerId);

    const newOrder: InternalOilOrder = {
      id: `IO-${Date.now()}`,
      orderNo,
      orderDate: today.toISOString().split("T")[0],
      requestedDate,
      fromBranchId: selectedBranchId,
      fromBranchName: selectedBranch?.name || "",
      items: itemsWithTotal,
      totalAmount,
      status: "รออนุมัติ",
      requestedBy: user?.name || "ผู้ใช้ปัจจุบัน",
      requestedAt: today.toISOString(),
      notes,
      sourceType,
      sourceRefId: combinedSourceRefId,
      // Logistics
      driverId: selectedDriverId || undefined,
      driverName: driver?.name,
      truckId: selectedTruckId || undefined,
      truckPlate: truck?.plateNumber,
      trailerId: selectedTrailerId || undefined,
      trailerPlate: trailer?.plateNumber,
    };

    createInternalOrder(newOrder);
    setShowCreateModal(false);
    setOrderItems([]);
    setRequestedDate("");
    setNotes("");
    setSelectedDriverId("");
    setSelectedTruckId("");
    setSelectedTrailerId("");
    alert(`สร้างออเดอร์สำเร็จ!\n\nเลขที่ออเดอร์: ${orderNo}\nปั๊ม: ${selectedBranch?.name}\nคนขับ: ${driver?.name || "ไม่ระบุ"}\nมูลค่ารวม: ${numberFormatter.format(totalAmount)} บาท`);
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
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white font-display">
            สั่งซื้อน้ำมันภายในปั๊ม
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ปั๊มไฮโซ - สั่งน้ำมันให้ทุกสาขา
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
          </span>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">ทั้งหมด</p>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {stats.total}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">รออนุมัติ</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.pending}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">อนุมัติแล้ว</p>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.approved}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Truck className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">กำลังจัดส่ง</p>
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.delivering}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">ส่งแล้ว</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.completed}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <DollarSign className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">มูลค่ารวม</p>
          </div>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 truncate">
            {numberFormatter.format(internalOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
          </p>
        </motion.div>
      </div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden text-sm"
      >
        {/* Filters & Actions Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center gap-4 lg:flex-row">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ออเดอร์, ปั๊ม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-1 rounded-lg border border-gray-200 dark:border-gray-600">
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => setFilterDateFrom(e.target.value)}
                className="bg-transparent border-none text-gray-700 dark:text-gray-200 text-sm focus:ring-0 cursor-pointer"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={e => setFilterDateTo(e.target.value)}
                className="bg-transparent border-none text-gray-700 dark:text-gray-200 text-sm focus:ring-0 cursor-pointer"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | InternalOilOrder["status"])}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="รออนุมัติ">รออนุมัติ</option>
              <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
              <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
              <option value="ส่งแล้ว">ส่งแล้ว</option>
              <option value="ยกเลิก">ยกเลิก</option>
            </select>

            {canCreate && (
              <button
                onClick={() => {
                  setOrderItems([]);
                  setSourceType("sucked");
                  setSourceRefId("");
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                สร้างออเดอร์ใหม่
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-medium">
                <tr>
                  <th className="px-6 py-4 text-left">เลขที่ออเดอร์</th>
                  <th className="px-6 py-4 text-left">ปั๊มที่สั่ง</th>
                  <th className="px-6 py-4 text-left">แหล่งที่มา</th>
                  <th className="px-6 py-4 text-left">วันที่สั่ง/รับ</th>
                  <th className="px-6 py-4 text-left">รายการน้ำมัน</th>
                  <th className="px-6 py-4 text-right">มูลค่ารวม</th>
                  <th className="px-6 py-4 text-center">สถานะ</th>
                  <th className="px-6 py-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredOrders.map((order) => {
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrderDetail(order)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900 dark:text-white">{order.orderNo}</div>
                        {order.transportNo && (
                          <div className="text-xs text-gray-500 mt-0.5">Ref: {order.transportNo}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {order.fromBranchName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.sourceType === "external" && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 text-xs font-medium">
                            <Building2 className="w-3 h-3" /> คลังน้ำมัน (PTT)
                          </span>
                        )}
                        {order.sourceType === "sucked" && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 text-xs font-medium">
                            <Droplet className="w-3 h-3" /> น้ำมันดูดคืน
                          </span>
                        )}
                        {order.sourceType === "remaining" && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800 text-xs font-medium">
                            <Truck className="w-3 h-3" /> น้ำมันเหลือบนรถ
                          </span>
                        )}
                        {!order.sourceType && (
                          <span className="text-gray-400 text-xs italic">ไม่ระบุ</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-700 dark:text-gray-200">
                          {order.orderDate}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          รับ: {order.requestedDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 dark:text-white font-medium">
                          {order.items.length} รายการ
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">
                          {order.items.map(i => i.oilType).join(", ")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                        {numberFormatter.format(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <TableActionMenu
                          actions={[
                            {
                              label: "ดูรายละเอียด",
                              icon: Eye,
                              onClick: () => setSelectedOrderDetail(order),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">ไม่พบรายการสั่งซื้อ</h3>
            <p className="text-gray-500">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
          </div>
        )}
      </motion.div>

      {/* Create Order Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                  สร้างออเดอร์ใหม่
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Branch and Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="fromBranch" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      สั่งซื้อให้สาขา
                    </label>
                    <select
                      id="fromBranch"
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                      disabled={!canCreate}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                    >
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="requestedDate" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      วันที่ต้องการรับน้ำมัน
                    </label>
                    <input
                      id="requestedDate"
                      type="date"
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                {/* Source Selection */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    แหล่งที่มาของน้ำมัน
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => setSourceType("sucked")}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        sourceType === "sucked"
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                          : "border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800"
                      }`}
                    >
                      <Droplet className="w-6 h-6" />
                      <span className="text-sm font-bold">น้ำมันดูดคืน</span>
                    </button>
                    <button
                      onClick={() => setSourceType("remaining")}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        sourceType === "remaining"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                          : "border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800"
                      }`}
                    >
                      <Truck className="w-6 h-6" />
                      <span className="text-sm font-bold">น้ำมันเหลือบนรถ</span>
                    </button>
                  </div>
                </div>

                {/* Specific Source Data Selection */}
                {sourceType === "sucked" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                      รายการน้ำมันดูดคืนที่พร้อมใช้
                    </span>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {recoveredOilItems.length > 0 ? (
                        recoveredOilItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const isSelected = orderItems.some(i => i.sourceRefId === item.id);
                              if (isSelected) {
                                setOrderItems(prev => prev.filter(i => i.sourceRefId !== item.id));
                              } else {
                                setOrderItems(prev => [
                                  ...prev,
                                  {
                                    oilType: item.oilType,
                                    quantity: item.quantityAvailable,
                                    pricePerLiter: oilPrices[item.oilType] || 0,
                                    sourceRefId: item.id
                                  }
                                ]);
                              }
                            }}
                            className={`w-full p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors text-left ${
                              orderItems.some(i => i.sourceRefId === item.id)
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm"
                                : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                                <Droplet className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                  {item.oilType} ({item.quantityAvailable.toLocaleString()} ลิตร)
                                </div>
                                <div className="text-xs text-gray-500">
                                  จาก: {item.fromBranchName} | {item.createdAt}
                                </div>
                              </div>
                            </div>
                            {orderItems.some(i => i.sourceRefId === item.id) && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-500 italic">
                          ไม่พบรายการน้ำมันดูดคืนที่พร้อมใช้งาน
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {sourceType === "remaining" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                      รายการน้ำมันเหลือบนรถ
                    </span>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {remainingOnTruckItems.length > 0 ? (
                        remainingOnTruckItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const isSelected = orderItems.some(i => i.sourceRefId === item.id);
                              if (isSelected) {
                                setOrderItems(prev => prev.filter(i => i.sourceRefId !== item.id));
                              } else {
                                setOrderItems(prev => [
                                  ...prev,
                                  {
                                    oilType: item.oilType,
                                    quantity: item.remainingQty,
                                    pricePerLiter: oilPrices[item.oilType] || 0,
                                    sourceRefId: item.id
                                  }
                                ]);
                              }
                            }}
                            className={`w-full p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors text-left ${
                              orderItems.some(i => i.sourceRefId === item.id)
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm"
                                : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                                <Truck className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                  {item.oilType} ({item.remainingQty.toLocaleString()} ลิตร)
                                </div>
                                <div className="text-xs text-gray-500">
                                  รถ: {item.transportNo} | สาขา: {item.branchName}
                                </div>
                              </div>
                            </div>
                            {orderItems.some(i => i.sourceRefId === item.id) && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-500 italic">
                          ไม่พบรายการน้ำมันที่เหลือบนรถ
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Logistics Selection */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    ข้อมูลพนักงานขับรถและพาหนะ
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="driver" className="text-[10px] font-bold text-gray-500 uppercase">
                        พนักงานขับรถ
                      </label>
                      <select
                        id="driver"
                        value={selectedDriverId}
                        onChange={(e) => setSelectedDriverId(Number(e.target.value) || "")}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                      >
                        <option value="">-- เลือกคนขับ --</option>
                        {mockDrivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name} ({driver.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="truck" className="text-[10px] font-bold text-gray-500 uppercase">
                        ทะเบียนรถ (หัว)
                      </label>
                      <select
                        id="truck"
                        value={selectedTruckId}
                        onChange={(e) => setSelectedTruckId(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                      >
                        <option value="">-- เลือกหัวรถ --</option>
                        {mockTrucks.map((truck) => (
                          <option key={truck.id} value={truck.id}>
                            {truck.plateNumber} ({truck.brand})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="trailer" className="text-[10px] font-bold text-gray-500 uppercase">
                        ทะเบียนหาง
                      </label>
                      <select
                        id="trailer"
                        value={selectedTrailerId}
                        onChange={(e) => setSelectedTrailerId(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                      >
                        <option value="">-- เลือกหาง --</option>
                        {mockTrailers.map((trailer) => (
                          <option key={trailer.id} value={trailer.id}>
                            {trailer.plateNumber} ({numberFormatter.format(trailer.capacity)} ลิตร)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                      รายการน้ำมันที่ต้องการสั่ง
                    </span>
                    {sourceType === "external" && (
                      <button
                        onClick={handleAddOrderItem}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        เพิ่มรายการ
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-end gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 relative group"
                      >
                        <div className="flex-1 space-y-1.5">
                          <label htmlFor={`oilType-${index}`} className="text-[10px] font-bold text-gray-400 uppercase">
                            ชนิดน้ำมัน
                          </label>
                          <select
                            id={`oilType-${index}`}
                            value={item.oilType}
                            onChange={(e) => handleUpdateOrderItem(index, "oilType", e.target.value as OilType)}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500/50 outline-none text-sm"
                          >
                            {Object.keys(oilPrices).map((oil) => (
                              <option key={oil} value={oil}>
                                {oil}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-1/4 space-y-1.5">
                          <label htmlFor={`quantity-${index}`} className="text-[10px] font-bold text-gray-400 uppercase">
                            จำนวน (ลิตร)
                          </label>
                          <input
                            id={`quantity-${index}`}
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateOrderItem(index, "quantity", Number(e.target.value))}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500/50 outline-none text-sm"
                          />
                        </div>
                        <div className="w-1/4 space-y-1.5">
                          <label htmlFor={`price-${index}`} className="text-[10px] font-bold text-gray-400 uppercase">
                            ราคา (ต่อลิตร)
                          </label>
                          <input
                            id={`price-${index}`}
                            type="number"
                            step="0.01"
                            value={item.pricePerLiter}
                            onChange={(e) => handleUpdateOrderItem(index, "pricePerLiter", Number(e.target.value))}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500/50 outline-none text-sm"
                          />
                        </div>
                        {(sourceType === "external" || orderItems.length > 0) && (
                          <button
                            onClick={() => handleRemoveOrderItem(index)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mb-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {orderItems.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                        <p className="text-gray-400 text-sm">ยังไม่มีรายการน้ำมัน</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="notes" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    หมายเหตุ
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ระบุข้อมูลเพิ่มเติม (ถ้ามี)"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px]"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">รวมมูลค่าโดยประมาณ</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {numberFormatter.format(
                      orderItems.reduce(
                        (sum, item) => sum + item.quantity * item.pricePerLiter,
                        0
                      )
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-bold"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSaveOrder}
                    disabled={orderItems.length === 0 || !requestedDate}
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    ยืนยันการสั่งซื้อ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrderDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    รายละเอียดออเดอร์ {selectedOrderDetail.orderNo}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    สั่งเมื่อ: {selectedOrderDetail.orderDate} โดย {selectedOrderDetail.requestedBy}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrderDetail(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">สาขาที่สั่ง</p>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedOrderDetail.fromBranchName}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">วันที่ต้องการรับ</p>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedOrderDetail.requestedDate}</p>
                  </div>
                </div>

                {/* Logistics Info in View Modal */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-3">
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">ข้อมูลการขนส่ง</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">คนขับ</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{selectedOrderDetail.driverName || "ไม่ระบุ"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">รถ/หาง</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">
                          {selectedOrderDetail.truckPlate || "-"} / {selectedOrderDetail.trailerPlate || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">รายการน้ำมัน</p>
                  <div className="space-y-2">
                    {selectedOrderDetail.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <Droplet className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">{item.oilType}</span>
                        </div>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{item.quantity.toLocaleString()} ลิตร</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrderDetail.notes && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                    <p className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-1">หมายเหตุ</p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">{selectedOrderDetail.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">มูลค่ารวม</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ฿{numberFormatter.format(selectedOrderDetail.totalAmount)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrderDetail(null)}
                  className="px-8 py-2.5 bg-gray-800 dark:bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
