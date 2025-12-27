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
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white font-display">
              สั่งซื้อน้ำมันภายในปั๊ม
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              สั่งซื้อน้ำมันจากปั๊มอื่นในเครือข่าย
            </p>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
          transition={{ delay: 0.2 }}
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
          transition={{ delay: 0.3 }}
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
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingCart className="w-4 h-4 text-purple-600" />
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
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">ส่งแล้ว</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.completed}
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full lg:w-auto">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />

            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
              className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="รออนุมัติ">รออนุมัติ</option>
              <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
              <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
              <option value="ส่งแล้ว">ส่งแล้ว</option>
              <option value="ยกเลิก">ยกเลิก</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            {(filterDateFrom || filterDateTo || searchTerm || filterStatus !== "all" || filterBranch !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterBranch("all");
                  setFilterDateFrom("");
                  setFilterDateTo("");
                }}
                className="px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors whitespace-nowrap"
              >
                ล้างตัวกรอง
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap w-full justify-center lg:w-auto"
            >
              <Plus className="w-4 h-4" />
              สร้างออเดอร์ใหม่
            </button>
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
                  <th className="px-6 py-4 text-left">วันที่สั่ง</th>
                  <th className="px-6 py-4 text-left">วันที่ต้องการ</th>
                  <th className="px-6 py-4 text-left">รายการน้ำมัน</th>
                  <th className="px-6 py-4 text-left">มูลค่ารวม</th>
                  <th className="px-6 py-4 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {order.orderNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {order.fromBranchName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {dateFormatter.format(new Date(order.orderDate))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {dateFormatter.format(new Date(order.requestedDate))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm flex items-center justify-between min-w-[150px]">
                            <span className="text-gray-700 dark:text-gray-300">{item.oilType}</span>
                            <span className="text-gray-500 dark:text-gray-400">{numberFormatter.format(item.quantity)} ลิตร</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600 dark:text-blue-400">
                      {numberFormatter.format(order.totalAmount)} บาท
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    สร้างออเดอร์ใหม่
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">กรอกข้อมูลการสั่งซื้อน้ำมันภายใน</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Form Fields */}
                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ปั๊มที่สั่งซื้อ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
                      วันที่ต้องการรับ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-bold text-gray-800 dark:text-white">
                        รายการน้ำมัน <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        เพิ่มรายการ
                      </button>
                    </div>

                    <div className="space-y-3">
                      {orderItems.map((item, index) => (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          key={index}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                        >
                          <div className="flex-1 w-full sm:w-auto">
                            <select
                              value={item.oilType}
                              onChange={(e) => handleItemChange(index, "oilType", e.target.value as OilType)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                            >
                              {Object.keys(oilPrices).map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-full sm:w-32">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                              placeholder="จำนวนลิตร"
                              min="0"
                              step="100"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                          </div>
                          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap min-w-[80px] text-right">
                              {item.quantity > 0 ? `${numberFormatter.format(item.quantity * oilPrices[item.oilType])} บ.` : '0 บ.'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}

                      {orderItems.length === 0 && (
                        <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">ยังไม่มีรายการน้ำมัน</p>
                        </div>
                      )}
                    </div>

                    {orderItems.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-end">
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">ราคารวมโดยประมาณ</p>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {numberFormatter.format(
                              orderItems.reduce((sum, item) => sum + item.quantity * oilPrices[item.oilType], 0)
                            )} บาท
                          </p>
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
                      placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 rounded-b-xl">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors font-medium shadow-sm"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveOrder}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  บันทึกออเดอร์
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
