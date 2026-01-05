import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  PackageCheck,
  Search,
  Eye,
  CheckCircle,
  X,
  Droplet,
  Truck,
  FileText,
  Building2,
  Calendar,
  Clock,
  MapPin,
  User,
  ShoppingCart,
  Filter,
} from "lucide-react";
import { mockApprovedOrders } from "../../data/gasStationOrders";
import type { InternalOilOrder } from "@/types/gasStation";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Interface สำหรับ Receive Oil Item (รวมทั้งสองประเภท)
interface ReceiveOilItem {
  id: string;
  orderNo: string; // เลขที่ออเดอร์
  orderType: "internal" | "purchase"; // ประเภท: ภายในปั๊ม หรือ ฝากปั๊มหลักสั่ง
  transportNo?: string; // เลขขนส่ง (ถ้ามี)
  fromBranchId: number; // ปั๊มที่จะส่ง
  fromBranchName: string;
  toBranchId: number; // ปั๊มที่ต้องรับ
  toBranchName: string;
  orderDate: string;
  requestedDate: string; // วันที่ต้องการรับ
  // ข้อมูลรถและคนขับ
  truckPlateNumber?: string;
  trailerPlateNumber?: string;
  driverName?: string;
  // รายการน้ำมัน
  items: Array<{
    oilType: string;
    quantity: number; // จำนวนที่สั่ง
    pricePerLiter: number;
    totalAmount: number;
  }>;
  totalAmount: number;
  // สถานะ
  status: "รอรับ" | "รับแล้ว" | "ยกเลิก";
  receivedBy?: string;
  receivedByName?: string;
  receivedAt?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

// Mock data - Internal Oil Orders ที่อนุมัติแล้ว
const mockApprovedInternalOrders: InternalOilOrder[] = [
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
    transportNo: "IT-20241215-001",
  },
];

// Generate receive items from both sources
const generateReceiveItems = (): ReceiveOilItem[] => {
  const items: ReceiveOilItem[] = [];

  // จาก Internal Oil Orders
  mockApprovedInternalOrders.forEach((order) => {
    if (order.status === "อนุมัติแล้ว" && order.assignedFromBranchId) {
      const item: ReceiveOilItem = {
        id: `internal-${order.id}`,
        orderNo: order.orderNo,
        orderType: "internal",
        transportNo: order.transportNo,
        fromBranchId: order.assignedFromBranchId,
        fromBranchName: order.assignedFromBranchName || "",
        toBranchId: order.fromBranchId,
        toBranchName: order.fromBranchName,
        orderDate: order.orderDate,
        requestedDate: order.requestedDate,
        truckPlateNumber: "กก 1111", // Mock - ในระบบจริงจะดึงจาก transport
        trailerPlateNumber: "กข 1234",
        driverName: "สมศักดิ์ ขับรถ",
        items: order.items.map((item) => ({
          oilType: item.oilType,
          quantity: item.quantity,
          pricePerLiter: item.pricePerLiter,
          totalAmount: item.totalAmount,
        })),
        totalAmount: order.totalAmount,
        status: "รอรับ",
        createdAt: order.approvedAt || order.requestedAt,
        createdBy: order.approvedBy || order.requestedBy,
      };
      items.push(item);
    }
  });

  // จาก Purchase Orders (ฝากปั๊มหลักสั่ง)
  mockApprovedOrders.forEach((po) => {
    po.branches.forEach((branch) => {
      const item: ReceiveOilItem = {
        id: `purchase-${po.orderNo}-${branch.branchId}`,
        orderNo: po.orderNo,
        orderType: "purchase",
        transportNo: `TP-${po.orderDate.replace(/-/g, '')}-001`, // Mock transport number
        fromBranchId: 1, // ปั๊มหลัก
        fromBranchName: "ปั๊มไฮโซ",
        toBranchId: branch.branchId,
        toBranchName: branch.branchName,
        orderDate: po.orderDate,
        requestedDate: po.deliveryDate,
        truckPlateNumber: po.truckPlateNumber || "-",
        trailerPlateNumber: po.trailerPlateNumber || "-",
        driverName: po.driverName || "-",
        items: branch.items.map((item) => ({
          oilType: item.oilType,
          quantity: item.quantity,
          pricePerLiter: item.pricePerLiter,
          totalAmount: item.totalAmount,
        })),
        totalAmount: branch.totalAmount,
        status: branch.deliveryStatus === "ส่งสำเร็จ" ? "รับแล้ว" : "รอรับ",
        receivedBy: "",
        receivedByName: "",
        receivedAt: branch.deliveryStatus === "ส่งสำเร็จ" ? new Date().toISOString() : undefined,
        createdAt: po.approvedAt,
        createdBy: po.approvedBy,
      };
      items.push(item);
    });
  });

  return items;
};

export default function ReceiveOil() {
  const [receiveItems] = useState<ReceiveOilItem[]>(generateReceiveItems());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOrderType, setFilterOrderType] = useState<"all" | "internal" | "purchase">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "รอรับ" | "รับแล้ว" | "ยกเลิก">("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReceiveOilItem | null>(null);

  // Form state for receiving oil
  const [receiveFormData, setReceiveFormData] = useState({
    receiveDate: new Date().toISOString().split("T")[0],
    receiveTime: new Date().toTimeString().slice(0, 5),
    receivedByName: "",
    items: [] as Array<{
      oilType: string;
      quantityOrdered: number;
      quantityReceived: number;
    }>,
    notes: "",
  });

  // Filter items
  const filteredItems = useMemo(() => {
    return receiveItems.filter((item) => {
      const matchesSearch =
        item.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.transportNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.toBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.truckPlateNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesOrderType = filterOrderType === "all" || item.orderType === filterOrderType;
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      return matchesSearch && matchesOrderType && matchesStatus;
    });
  }, [receiveItems, searchTerm, filterOrderType, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = receiveItems.length;
    const internal = receiveItems.filter((i) => i.orderType === "internal").length;
    const purchase = receiveItems.filter((i) => i.orderType === "purchase").length;
    const pending = receiveItems.filter((i) => i.status === "รอรับ").length;
    const received = receiveItems.filter((i) => i.status === "รับแล้ว").length;
    return { total, internal, purchase, pending, received };
  }, [receiveItems]);

  const handleViewDetail = (item: ReceiveOilItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleReceive = (item: ReceiveOilItem) => {
    setSelectedItem(item);
    setReceiveFormData({
      receiveDate: new Date().toISOString().split("T")[0],
      receiveTime: new Date().toTimeString().slice(0, 5),
      receivedByName: "",
      items: item.items.map((item) => ({
        oilType: item.oilType,
        quantityOrdered: item.quantity,
        quantityReceived: item.quantity, // Default to ordered quantity
      })),
      notes: "",
    });
    setShowReceiveModal(true);
  };

  const handleSaveReceive = () => {
    if (!selectedItem || !receiveFormData.receivedByName) {
      alert("กรุณากรอกชื่อผู้รับ");
      return;
    }

    // In real app, this would call API
    console.log("Receiving oil:", {
      itemId: selectedItem.id,
      orderNo: selectedItem.orderNo,
      orderType: selectedItem.orderType,
      ...receiveFormData,
    });

    alert(`รับน้ำมันสำเร็จ!\n\n${selectedItem.orderType === "internal" ? "ออเดอร์ภายในปั๊ม" : "ออเดอร์ฝากปั๊มหลัก"}: ${selectedItem.orderNo}\n${selectedItem.transportNo ? `เลขขนส่ง: ${selectedItem.transportNo}\n` : ""}ปั๊ม: ${selectedItem.toBranchName}`);
    setShowReceiveModal(false);
    setSelectedItem(null);
  };

  const getStatusColor = (status: ReceiveOilItem["status"]) => {
    switch (status) {
      case "รอรับ":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "รับแล้ว":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "ยกเลิก":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getOrderTypeColor = (type: ReceiveOilItem["orderType"]) => {
    switch (type) {
      case "internal":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "purchase":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getOrderTypeText = (type: ReceiveOilItem["orderType"]) => {
    switch (type) {
      case "internal":
        return "ภายในปั๊ม";
      case "purchase":
        return "ฝากปั๊มหลัก";
      default:
        return type;
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
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <PackageCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            รับน้ำมัน
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            รับน้ำมันทั้งจากภายในปั๊มและฝากปั๊มหลักสั่ง
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
              <p className="text-sm text-gray-600 dark:text-gray-400">ภายในปั๊ม</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.internal}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">ฝากปั๊มหลัก</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.purchase}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">รอรับ</p>
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
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">รับแล้ว</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.received}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเลขที่ออเดอร์, เลขขนส่ง, ปั๊ม..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filterOrderType}
            onChange={(e) => setFilterOrderType(e.target.value as "all" | "internal" | "purchase")}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">ประเภททั้งหมด</option>
            <option value="internal">ภายในปั๊ม</option>
            <option value="purchase">ฝากปั๊มหลัก</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "รอรับ" | "รับแล้ว" | "ยกเลิก")}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="รอรับ">รอรับ</option>
            <option value="รับแล้ว">รับแล้ว</option>
            <option value="ยกเลิก">ยกเลิก</option>
          </select>
        </div>
      </motion.div>

      {/* Items Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    ประเภท
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    เลขที่ออเดอร์
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    เลขขนส่ง
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    ต้นทาง → ปลายทาง
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    วันที่ต้องการ
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    รถ / หาง
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    คนขับ
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4" />
                    รายการน้ำมัน
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-emerald-50/50 dark:hover:bg-gray-700/70 cursor-pointer transition-all duration-200 group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${getOrderTypeColor(item.orderType)}`}>
                      {getOrderTypeText(item.orderType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.orderNo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {item.transportNo || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.fromBranchName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <span className="ml-5">→ {item.toBranchName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {dateFormatter.format(new Date(item.requestedDate))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.truckPlateNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <span className="ml-5">{item.trailerPlateNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{item.driverName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {item.items.map((oilItem, idx) => (
                        <div key={idx} className="mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{oilItem.oilType}:</span>
                          <span className="text-gray-600 dark:text-gray-400 ml-1">
                            {numberFormatter.format(oilItem.quantity)} ลิตร
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${getStatusColor(item.status)}`}>
                      {item.status === "รับแล้ว" && <CheckCircle className="w-3.5 h-3.5" />}
                      {item.status === "รอรับ" && <Clock className="w-3.5 h-3.5" />}
                      {item.status === "ยกเลิก" && <X className="w-3.5 h-3.5" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 justify-center">
                      {item.status === "รอรับ" && (
                        <button
                          onClick={() => handleReceive(item)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                        >
                          รับน้ำมัน
                        </button>
                      )}
                      <button
                        onClick={() => handleViewDetail(item)}
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
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <PackageCheck className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">ไม่พบรายการรับน้ำมัน</p>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedItem && (
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
                  รายละเอียดการรับน้ำมัน - {selectedItem.toBranchName}
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
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getOrderTypeColor(selectedItem.orderType)}`}>
                      {getOrderTypeText(selectedItem.orderType)}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">สถานะ</span>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(selectedItem.status)}`}>
                    {selectedItem.status === "รับแล้ว" && <CheckCircle className="w-4 h-4" />}
                    {selectedItem.status === "รอรับ" && <Clock className="w-4 h-4" />}
                    {selectedItem.status}
                  </span>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      เลขที่ออเดอร์
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.orderNo}</p>
                  </div>
                  {selectedItem.transportNo && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        เลขขนส่ง
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.transportNo}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      ต้นทาง
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.fromBranchName}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      ปลายทาง
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.toBranchName}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      วันที่ต้องการ
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {dateFormatter.format(new Date(selectedItem.requestedDate))}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      รถหัวลาก
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.truckPlateNumber}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      หางบรรทุก
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.trailerPlateNumber}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      คนขับ
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.driverName}</p>
                  </div>
                </div>

                {/* รายการน้ำมัน */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Droplet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">รายการน้ำมัน</p>
                  </div>
                  <div className="space-y-3">
                    {selectedItem.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-700/50 dark:to-gray-800/50 p-4 rounded-xl border border-emerald-200 dark:border-gray-600"
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
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                              {numberFormatter.format(item.totalAmount)} บาท
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">มูลค่ารวมทั้งหมด:</span>
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {numberFormatter.format(selectedItem.totalAmount)} บาท
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

      {/* Receive Modal */}
      <AnimatePresence>
        {showReceiveModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReceiveModal(false)}
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
                  รับน้ำมัน - {selectedItem.toBranchName}
                </h2>
                <button
                  onClick={() => setShowReceiveModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">ประเภท:</span>
                      <span className={`font-semibold ml-2 px-2 py-1 rounded text-xs ${getOrderTypeColor(selectedItem.orderType)}`}>
                        {getOrderTypeText(selectedItem.orderType)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">เลขที่ออเดอร์:</span>
                      <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedItem.orderNo}</span>
                    </div>
                    {selectedItem.transportNo && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">เลขขนส่ง:</span>
                        <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedItem.transportNo}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">รถ:</span>
                      <span className="font-semibold text-gray-900 dark:text-white ml-2">
                        {selectedItem.truckPlateNumber} / {selectedItem.trailerPlateNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">คนขับ:</span>
                      <span className="font-semibold text-gray-900 dark:text-white ml-2">{selectedItem.driverName}</span>
                    </div>
                  </div>
                </div>

                {/* Receive Form */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="receive-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      วันที่รับ *
                    </label>
                    <input
                      id="receive-date"
                      type="date"
                      value={receiveFormData.receiveDate}
                      onChange={(e) => setReceiveFormData({ ...receiveFormData, receiveDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="receive-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      เวลารับ *
                    </label>
                    <input
                      id="receive-time"
                      type="time"
                      value={receiveFormData.receiveTime}
                      onChange={(e) => setReceiveFormData({ ...receiveFormData, receiveTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="receive-receiver-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ชื่อผู้รับ *
                  </label>
                  <input
                    id="receive-receiver-name"
                    type="text"
                    value={receiveFormData.receivedByName}
                    onChange={(e) => setReceiveFormData({ ...receiveFormData, receivedByName: e.target.value })}
                    placeholder="กรอกชื่อผู้รับน้ำมัน"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Items */}
                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    รายการน้ำมันที่รับ
                  </span>
                  <div className="space-y-3">
                    {receiveFormData.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="mb-2">
                          <p className="font-semibold text-gray-900 dark:text-white">{item.oilType}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            จำนวนที่สั่ง: {numberFormatter.format(item.quantityOrdered)} ลิตร
                          </p>
                        </div>
                        <div>
                          <label htmlFor={`receive-quantity-${idx}`} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            จำนวนที่รับจริง (ลิตร) *
                          </label>
                          <input
                            id={`receive-quantity-${idx}`}
                            type="number"
                            value={item.quantityReceived}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              const newItems = receiveFormData.items.map((it, i) =>
                                i === idx ? { ...it, quantityReceived: value } : it
                              );
                              setReceiveFormData({ ...receiveFormData, items: newItems });
                            }}
                            placeholder="กรอกจำนวนที่รับจริง"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            min="0"
                            step="0.1"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="receive-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    หมายเหตุ
                  </label>
                  <textarea
                    id="receive-notes"
                    value={receiveFormData.notes}
                    onChange={(e) => setReceiveFormData({ ...receiveFormData, notes: e.target.value })}
                    placeholder="ระบุหมายเหตุ (ถ้ามี)"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowReceiveModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveReceive}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    ยืนยันการรับน้ำมัน
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
