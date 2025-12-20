import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle,
  Clock,
  X,
  Save,
  Building2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { branches } from "../../data/gasStationOrders";
import type { InternalOilOrder, OilType } from "@/types/gasStation";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "long",
  day: "numeric",
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

// Mock data - Internal Oil Orders
const mockInternalOrders: InternalOilOrder[] = [
  {
    id: "1",
    orderNo: "IO-20241215-001",
    orderDate: "2024-12-15",
    requestedDate: "2024-12-20",
    fromBranchId: 2,
    fromBranchName: "ดินดำ",
    items: [
      { oilType: "Premium Diesel", quantity: 5000, pricePerLiter: oilPrices["Premium Diesel"], totalAmount: 162500 },
      { oilType: "Gasohol 95", quantity: 3000, pricePerLiter: oilPrices["Gasohol 95"], totalAmount: 129000 },
    ],
    totalAmount: 291500,
    status: "รออนุมัติ",
    requestedBy: "ผู้จัดการดินดำ",
    requestedAt: "2024-12-15T10:30:00",
  },
];

export default function InternalOilOrder() {
  const [internalOrders, setInternalOrders] = useState<InternalOilOrder[]>(mockInternalOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | InternalOilOrder["status"]>("all");
  const [filterBranch, setFilterBranch] = useState<number | "all">("all");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1); // Default: ปั๊มไฮโซ
  const [orderItems, setOrderItems] = useState<Array<{
    oilType: OilType;
    quantity: number;
  }>>([]);
  const [requestedDate, setRequestedDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

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

  const handleAddItem = () => {
    setOrderItems([...orderItems, { oilType: "Premium Diesel", quantity: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: "oilType" | "quantity", value: OilType | number) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
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
      pricePerLiter: oilPrices[item.oilType],
      totalAmount: item.quantity * oilPrices[item.oilType],
    }));

    const totalAmount = itemsWithTotal.reduce((sum, item) => sum + item.totalAmount, 0);

    // Generate order number
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
    const orderNo = `IO-${dateStr}-${String(internalOrders.length + 1).padStart(3, "0")}`;

    const selectedBranch = branches.find((b) => b.id === selectedBranchId);

    const newOrder: InternalOilOrder = {
      id: String(internalOrders.length + 1),
      orderNo,
      orderDate: today.toISOString().split("T")[0],
      requestedDate,
      fromBranchId: selectedBranchId,
      fromBranchName: selectedBranch?.name || "",
      items: itemsWithTotal,
      totalAmount,
      status: "รออนุมัติ",
      requestedBy: "ผู้ใช้ปัจจุบัน", // ในระบบจริงจะดึงจาก auth
      requestedAt: today.toISOString(),
      notes,
    };

    setInternalOrders([...internalOrders, newOrder]);
    setShowCreateModal(false);
    setOrderItems([]);
    setRequestedDate("");
    setNotes("");
    alert(`สร้างออเดอร์สำเร็จ!\n\nเลขที่ออเดอร์: ${orderNo}\nปั๊ม: ${selectedBranch?.name}\nมูลค่ารวม: ${numberFormatter.format(totalAmount)} บาท`);
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

  const getStatusText = (status: InternalOilOrder["status"]) => {
    return status;
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
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ShoppingCart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            สั่งซื้อน้ำมันภายในปั๊ม
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            สั่งซื้อน้ำมันจากปั๊มอื่นในเครือข่าย
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          สร้างออเดอร์ใหม่
        </button>
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
              <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="วันที่เริ่มต้น"
              />
              <span className="text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">ถึง</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="วันที่สิ้นสุด"
              />
            </div>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  เลขที่ออเดอร์
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  ปั๊มที่สั่ง
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  วันที่สั่ง
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  วันที่ต้องการ
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/70 transition-colors">
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
                      {dateFormatter.format(new Date(order.orderDate))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {dateFormatter.format(new Date(order.requestedDate))}
                    </span>
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

      {/* Create Order Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">สร้างออเดอร์ใหม่</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ปั๊มที่สั่งซื้อ *
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    วันที่ต้องการรับ *
                  </label>
                  <input
                    type="date"
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      รายการน้ำมัน *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      เพิ่มรายการ
                    </button>
                  </div>
                  <div className="space-y-3">
                    {orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex-1">
                          <select
                            value={item.oilType}
                            onChange={(e) => handleItemChange(index, "oilType", e.target.value as OilType)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          >
                            {Object.keys(oilPrices).map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                            placeholder="จำนวนลิตร"
                            min="0"
                            step="100"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                        <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                          {item.quantity > 0 && (
                            <span>
                              {numberFormatter.format(item.quantity * oilPrices[item.oilType])} บาท
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {orderItems.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">ยังไม่มีรายการน้ำมัน</p>
                        <p className="text-xs mt-1">คลิกปุ่ม "เพิ่มรายการ" เพื่อเพิ่มน้ำมัน</p>
                      </div>
                    )}
                  </div>
                  {orderItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">มูลค่ารวมทั้งหมด:</span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {numberFormatter.format(
                            orderItems.reduce((sum, item) => sum + item.quantity * oilPrices[item.oilType], 0)
                          )} บาท
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    หมายเหตุ
                  </label>
                  <textarea
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
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveOrder}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    บันทึกออเดอร์
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
