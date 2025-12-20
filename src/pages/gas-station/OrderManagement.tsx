import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useGasStation } from "@/contexts/GasStationContext";
import {
  CheckCircle,
  Clock,
  Eye,
  Download,
  Building2,
  Droplet,
  Calendar,
  FileText,
  X,
  Truck,
  Receipt,
  Search,
} from "lucide-react";
// Import shared data from gasStationOrders.ts (ข้อมูลเดียวกันกับหน้า "บันทึกใบเสนอราคาจากปตท")
// import { branches } from "@/data/gasStationOrders";
import type { PurchaseOrder } from "@/types/gasStation";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});


// ใช้ข้อมูลจากหน้า "บันทึกใบเสนอราคาจากปตท" (mockApprovedOrders)
// แสดงข้อมูลตามเลขที่ใบสั่งซื้อ (orderNo) แทนการจัดกลุ่มตามปั๊ม

export default function OrderManagement() {
  const { purchaseOrders } = useGasStation();
  const [filterOrderNo] = useState("ล่าสุด"); // Default: แสดงใบสั่งซื้อล่าสุด
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [filterBranch, setFilterBranch] = useState<string>("ทั้งหมด");
  const [filterStatus, setFilterStatus] = useState<string>("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // ใช้ข้อมูลจาก context โดยตรง (แสดงตามเลขที่ใบสั่งซื้อ)
  // เรียงตาม orderDate และ orderNo เพื่อหา "ล่าสุด"
  const orders = useMemo(() => {
    return [...purchaseOrders].sort((a, b) => {
      // เรียงตาม orderDate (ล่าสุดก่อน)
      const dateCompare = new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      // ถ้าวันที่เท่ากัน เรียงตาม orderNo (ล่าสุดก่อน)
      return b.orderNo.localeCompare(a.orderNo);
    });
  }, [purchaseOrders]);

  // หาเลขที่ใบสั่งซื้อล่าสุด
  const latestOrderNo = useMemo(() => {
    return orders.length > 0 ? orders[0].orderNo : "";
  }, [orders]);

  // คำนวณสถิติ (ใช้ข้อมูลทั้งหมด ไม่ใช่แค่ที่กรองแล้ว)
  const totalOrders = orders.length;
  const totalBranches = orders.reduce((sum, order) => sum + order.branches.length, 0);
  const totalQuantity = orders.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0), 0);
  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingCount = orders.filter((o) => o.status === "รอเริ่ม").length;
  const inProgressCount = orders.filter((o) => o.status === "กำลังขนส่ง").length;
  const completedCount = orders.filter((o) => o.status === "ขนส่งสำเร็จ").length;

  // Helper function to check if date is in range
  const isDateInRange = (dateStr: string, from: string, to: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (from && !to) return d >= new Date(from);
    if (!from && to) return d <= new Date(to);
    if (from && to) return d >= new Date(from) && d <= new Date(to);
    return true;
  };

  // Get unique branch names from orders
  const availableBranches = useMemo(() => {
    const branchSet = new Set<string>();
    orders.forEach((order) => {
      order.branches.forEach((branch) => {
        branchSet.add(branch.branchName);
      });
    });
    return Array.from(branchSet).sort();
  }, [orders]);

  // กรองข้อมูล - แสดงเฉพาะใบสั่งซื้อล่าสุด + filters
  const displayOrders = useMemo(() => {
    let filtered = orders;
    
    // Filter by order number
    if (filterOrderNo === "ล่าสุด") {
      filtered = filtered.filter((order) => order.orderNo === latestOrderNo);
    } else if (filterOrderNo !== "ทั้งหมด") {
      filtered = filtered.filter((order) => order.orderNo === filterOrderNo);
    }
    
    // Filter by date range
    if (filterDateFrom || filterDateTo) {
      filtered = filtered.filter((order) => 
        isDateInRange(order.orderDate, filterDateFrom, filterDateTo)
      );
    }
    
    // Filter by branch
    if (filterBranch !== "ทั้งหมด") {
      filtered = filtered.filter((order) =>
        order.branches.some((b) => b.branchName === filterBranch)
      );
    }
    
    // Filter by status
    if (filterStatus !== "ทั้งหมด") {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((order) =>
        order.orderNo.toLowerCase().includes(term) ||
        order.supplierOrderNo?.toLowerCase().includes(term) ||
        order.branches.some((b) => b.branchName.toLowerCase().includes(term)) ||
        order.items.some((i) => i.oilType.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }, [orders, filterOrderNo, latestOrderNo, filterDateFrom, filterDateTo, filterBranch, filterStatus, searchTerm]);

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


  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedOrder]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedOrder) {
        setSelectedOrder(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedOrder]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">จัดการการสั่งซื้อ</h1>
        <p className="text-gray-600 dark:text-gray-400">ดูรายละเอียดการสั่งซื้อของแต่ละปั๊ม</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "จำนวนใบสั่งซื้อ",
            value: totalOrders,
            subtitle: "ใบ",
            icon: FileText,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
          {
            title: "จำนวนปั๊ม",
            value: totalBranches,
            subtitle: "ปั๊ม",
            icon: Building2,
            iconColor: "bg-gradient-to-br from-purple-500 to-purple-600",
          },
          {
            title: "ยอดรวมที่ต้องสั่ง",
            value: numberFormatter.format(totalQuantity),
            subtitle: "ลิตร",
            icon: Droplet,
            iconColor: "bg-gradient-to-br from-cyan-500 to-cyan-600",
          },
          {
            title: "มูลค่ารวม",
            value: currencyFormatter.format(totalAmount),
            subtitle: "บาท",
            icon: Receipt,
            iconColor: "bg-gradient-to-br from-green-500 to-green-600",
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

      {/* Status Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <Clock className="w-6 h-6 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">รอเริ่ม</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{pendingCount} ใบ</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <Truck className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">กำลังขนส่ง</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{inProgressCount} ใบ</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ขนส่งสำเร็จ</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount} ใบ</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่, ปั๊ม, ประเภทน้ำมัน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="วันที่เริ่มต้น"
            />
            <span className="text-gray-500 dark:text-gray-400">ถึง</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="วันที่สิ้นสุด"
            />
          </div>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ทั้งหมด">ทุกปั๊ม</option>
            {availableBranches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ทั้งหมด">ทุกสถานะ</option>
            <option value="รอเริ่ม">รอเริ่ม</option>
            <option value="กำลังขนส่ง">กำลังขนส่ง</option>
            <option value="ขนส่งสำเร็จ">ขนส่งสำเร็จ</option>
            <option value="ยกเลิก">ยกเลิก</option>
          </select>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  เลขที่ใบสั่งซื้อ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  วันที่สั่ง
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  วันที่ส่ง
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  จำนวนปั๊ม
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  รายการน้ำมัน
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  ปริมาณรวม (ลิตร)
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
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
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                displayOrders.map((order) => {
          const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
          const branchCount = order.branches.length;
                  const branchNames = order.branches.map((b) => b.branchName).join(", ");

          return (
                    <tr
              key={order.orderNo}
                      className="hover:bg-blue-50/50 dark:hover:bg-gray-700/70 transition-colors cursor-pointer"
              onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{order.orderNo}</div>
                {order.supplierOrderNo && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">ปตท.: {order.supplierOrderNo}</div>
                )}
              </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{order.orderDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{order.deliveryDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{branchCount} ปั๊ม</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={branchNames}>
                              {branchNames}
                  </div>
                  </div>
                </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="mb-1">
                              <span className="font-medium">{item.oilType}:</span>
                              <span className="text-gray-600 dark:text-gray-400 ml-1">
                                {numberFormatter.format(item.quantity)} ลิตร
                    </span>
                  </div>
                          ))}
                  </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {numberFormatter.format(totalQuantity)}
                    </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {currencyFormatter.format(order.totalAmount)}
                    </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="ดูรายละเอียด"
                        >
                  <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
              </div>
            </motion.div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
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
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">รายละเอียดใบสั่งซื้อ</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.orderNo}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
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
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">เลขที่ใบสั่งซื้อ</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedOrder.orderNo}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">สถานะ</p>
                        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">เลขที่ออเดอร์ ปตท.</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedOrder.supplierOrderNo}</p>
                      </div>
                      {selectedOrder.billNo && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">เลขที่บิล</p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedOrder.billNo}</p>
                        </div>
                      )}
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">วันที่สั่ง</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedOrder.orderDate}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">วันที่ส่ง</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedOrder.deliveryDate}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl col-span-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ยอดรวม</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {currencyFormatter.format(selectedOrder.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Branches */}
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">
                        ปั๊มที่สั่งในใบสั่งซื้อนี้ ({selectedOrder.branches.length} ปั๊ม)
                      </p>
                      <div className="space-y-3">
                        {selectedOrder.branches.map((branch) => {
                          return (
                            <div
                              key={branch.branchId}
                              className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3 flex-1">
                                  <Building2 className="w-5 h-5 text-blue-500" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="text-sm font-bold text-gray-800 dark:text-white">{branch.branchName}</h5>
                                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${branch.deliveryStatus === "ส่งสำเร็จ"
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                          : branch.deliveryStatus === "กำลังส่ง"
                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                        }`}>
                                        {branch.deliveryStatus}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">{branch.legalEntityName}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{branch.address}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500 dark:text-gray-500">ยอดรวม</p>
                                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                    {currencyFormatter.format(branch.totalAmount)}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {branch.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <Droplet className="w-4 h-4 text-cyan-500" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white">{item.oilType}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                          {numberFormatter.format(item.quantity)} ลิตร × {currencyFormatter.format(item.pricePerLiter)}/ลิตร
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                      {currencyFormatter.format(item.totalAmount)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Approval Info */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-2 font-semibold">ข้อมูลการอนุมัติ</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">อนุมัติโดย:</span>
                          <span className="font-semibold text-gray-800 dark:text-white">{selectedOrder.approvedBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">วันที่อนุมัติ:</span>
                          <span className="font-semibold text-gray-800 dark:text-white">{selectedOrder.approvedAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setSelectedOrder(null)}
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
