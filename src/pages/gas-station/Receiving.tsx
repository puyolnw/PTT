import { motion } from "framer-motion";
import { useState } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  FileText,
  Upload,
  Download,
  Truck,
  Droplet,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Info,
  X,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data
const mockReceivings = [
  {
    id: "RC-20241215-001",
    orderNo: "SO-20241215-001",
    supplierOrderNo: "PTT-20241215-001",
    deliveryNoteNo: "DN-20241215-001",
    branchId: 1,
    branch: "ปั๊มไฮโซ",
    receiveDate: "2024-12-15",
    receiveTime: "14:30",
    oilType: "Premium Diesel",
    quantityOrdered: 20000,
    quantityReceived: 19950,
    difference: -50,
    differencePercent: -0.25,
    apiCheck: 35.2,
    driverName: "สมชาย ใจดี",
    truckLicensePlate: "กก-1234",
    receiverEmployee: "พนักงาน A",
    status: "รับแล้ว",
    pricePerLiter: 32.5,
    totalAmount: 648375,
  },
  {
    id: "RC-20241215-002",
    orderNo: "SO-20241215-002",
    supplierOrderNo: "PTT-20241215-002",
    deliveryNoteNo: "DN-20241215-002",
    branchId: 2,
    branch: "สาขา 2",
    receiveDate: "2024-12-15",
    receiveTime: "15:45",
    oilType: "Gasohol 95",
    quantityOrdered: 15000,
    quantityReceived: 15020,
    difference: 20,
    differencePercent: 0.13,
    apiCheck: 52.5,
    driverName: "สมหญิง รักดี",
    truckLicensePlate: "ขข-5678",
    receiverEmployee: "พนักงาน B",
    status: "รับแล้ว",
    pricePerLiter: 35.0,
    totalAmount: 525700,
  },
  {
    id: "RC-20241215-003",
    orderNo: "SO-20241215-003",
    supplierOrderNo: "PTT-20241215-003",
    deliveryNoteNo: "DN-20241215-003",
    branchId: 4,
    branch: "สาขา 4",
    receiveDate: "2024-12-16",
    receiveTime: "09:15",
    oilType: "Premium Diesel",
    quantityOrdered: 24000,
    quantityReceived: 0,
    difference: 0,
    differencePercent: 0,
    apiCheck: null,
    driverName: null,
    truckLicensePlate: null,
    receiverEmployee: null,
    status: "รอรับ",
    pricePerLiter: 32.5,
    totalAmount: 0,
  },
];

const branches = [
  { id: 1, name: "ปั๊มไฮโซ", code: "HQ" },
  { id: 2, name: "สาขา 2", code: "B2" },
  { id: 3, name: "สาขา 3", code: "B3" },
  { id: 4, name: "สาขา 4", code: "B4" },
  { id: 5, name: "สาขา 5", code: "B5" },
];

export default function Receiving() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [filterBranch, setFilterBranch] = useState("ทั้งหมด");
  const [selectedReceiving, setSelectedReceiving] = useState<typeof mockReceivings[0] | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const filteredReceivings = mockReceivings.filter((receiving) => {
    const matchesSearch = 
      receiving.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receiving.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receiving.deliveryNoteNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receiving.branch.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "ทั้งหมด" || receiving.status === filterStatus;
    const matchesBranch = filterBranch === "ทั้งหมด" || receiving.branch === filterBranch;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const getDifferenceColor = (_diff: number, percent: number) => {
    if (Math.abs(percent) <= 0.3) return "text-emerald-600 dark:text-emerald-400";
    if (Math.abs(percent) <= 1.0) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "รอรับ":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800";
      case "รับแล้ว":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
    }
  };

  const handleImportFromPTT = () => {
    // In real app, this would call PTT API to import data
    console.log("Importing data from PTT system...");
    setShowImportModal(false);
    // Show success notification
  };

  const totalReceived = mockReceivings.filter(r => r.status === "รับแล้ว").reduce((sum, r) => sum + r.quantityReceived, 0);
  const totalTrips = mockReceivings.filter(r => r.status === "รับแล้ว").length;
  const averageDifference = mockReceivings.filter(r => r.status === "รับแล้ว").length > 0
    ? mockReceivings.filter(r => r.status === "รับแล้ว").reduce((sum, r) => sum + Math.abs(r.differencePercent), 0) / mockReceivings.filter(r => r.status === "รับแล้ว").length
    : 0;
  const pendingReceivings = mockReceivings.filter(r => r.status === "รอรับ").length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">การรับน้ำมัน</h1>
        <p className="text-gray-600 dark:text-gray-400">บันทึกการรับน้ำมันจากรถขนส่ง ปตท. - นำเข้าข้อมูลจากระบบ PTT ได้</p>
      </motion.div>

      {/* Summary Cards - Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "รับน้ำมันวันนี้",
            value: numberFormatter.format(totalReceived),
            subtitle: "ลิตร",
            icon: Droplet,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
          {
            title: "จำนวนเที่ยว",
            value: totalTrips,
            subtitle: "เที่ยว",
            icon: Truck,
            iconColor: "bg-gradient-to-br from-purple-500 to-purple-600",
          },
          {
            title: "รอรับ",
            value: pendingReceivings,
            subtitle: "รายการ",
            icon: Clock,
            iconColor: "bg-gradient-to-br from-orange-500 to-orange-600",
            badge: "รอรับ",
            badgeColor: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800",
          },
          {
            title: "ส่วนต่างเฉลี่ย",
            value: `${averageDifference.toFixed(2)}%`,
            subtitle: "จากยอดสั่ง",
            icon: TrendingUp,
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
              {stat.badge && (
                <div className="mt-3 flex items-center justify-end">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${stat.badgeColor}`}>
                    {stat.badge}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

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
            placeholder="ค้นหาเลขที่รับ, เลขที่ใบสั่งซื้อ, เลขที่ใบส่งของ..."
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
            <option>รับแล้ว</option>
            <option>รอรับ</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <Upload className="w-4 h-4" />
            Import จาก PTT
          </button>
          <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            เริ่มรับน้ำมันใหม่
          </button>
        </div>
      </motion.div>

      {/* Receivings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            รายการรับน้ำมัน
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">รายการรับน้ำมันจากรถขนส่ง ปตท.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">เลขที่รับ</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">เลขที่ใบสั่งซื้อ</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">เลขที่ใบส่งของ</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">สาขา</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">วันที่รับ</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ประเภทน้ำมัน</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">สั่ง (ลิตร)</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">รับ (ลิตร)</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ส่วนต่าง</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">สถานะ</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceivings.map((receiving, index) => (
                <motion.tr
                  key={receiving.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">{receiving.id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{receiving.orderNo}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{receiving.deliveryNoteNo}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">{receiving.branch}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                    {receiving.receiveDate} {receiving.receiveTime && ` ${receiving.receiveTime}`}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{receiving.oilType}</td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                    {numberFormatter.format(receiving.quantityOrdered)}
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                    {numberFormatter.format(receiving.quantityReceived)}
                  </td>
                  <td className="py-4 px-6 text-sm text-right">
                    {receiving.status === "รับแล้ว" ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className={`font-semibold ${getDifferenceColor(receiving.difference, receiving.differencePercent)}`}>
                          {receiving.difference > 0 ? '+' : ''}{numberFormatter.format(receiving.difference)}
                        </span>
                        <span className={`text-xs ${getDifferenceColor(receiving.difference, receiving.differencePercent)}`}>
                          ({receiving.differencePercent > 0 ? '+' : ''}{receiving.differencePercent.toFixed(2)}%)
                        </span>
                        {Math.abs(receiving.differencePercent) > 0.3 && (
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusColor(receiving.status)}`}>
                      {receiving.status === "รอรับ" && <Clock className="w-3.5 h-3.5" />}
                      {receiving.status === "รับแล้ว" && <CheckCircle className="w-3.5 h-3.5" />}
                      {receiving.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedReceiving(receiving)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                      </button>
                      {receiving.status === "รับแล้ว" && (
                        <button
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                          title="ดูเอกสาร"
                        >
                          <FileText className="w-4 h-4 text-gray-400 hover:text-purple-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowImportModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                    Import ข้อมูลจากระบบ PTT
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    นำเข้าข้อมูลการส่งน้ำมันจากระบบ PTT E-Order
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                aria-label="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    ข้อมูลที่จะนำเข้า
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      เลขที่ใบสั่งซื้อ (Order No.)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      เลขที่ใบส่งของ (Delivery Note No.)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      วันที่ส่งน้ำมัน
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ประเภทน้ำมันและปริมาณ
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ข้อมูลรถขนส่ง
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ข้อมูลคนขับรถ
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                        วิธีการ Import
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        ระบบจะเชื่อมต่อกับ PTT E-Order API เพื่อดึงข้อมูลการส่งน้ำมันที่ยังไม่ได้รับเข้ามาในระบบอัตโนมัติ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                  <label className="text-sm font-semibold text-gray-800 dark:text-white mb-2 block">
                    เลือกวันที่
                  </label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    เลือกวันที่ที่ต้องการดึงข้อมูลการส่งน้ำมันจากระบบ PTT
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleImportFromPTT}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import จาก PTT
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Receiving Detail Modal */}
      {selectedReceiving && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReceiving(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                    รายละเอียดการรับน้ำมัน
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedReceiving.id} - {selectedReceiving.branch}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceiving(null)}
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
                  <span className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border ${getStatusColor(selectedReceiving.status)}`}>
                    {selectedReceiving.status === "รอรับ" && <Clock className="w-4 h-4" />}
                    {selectedReceiving.status === "รับแล้ว" && <CheckCircle className="w-4 h-4" />}
                    {selectedReceiving.status}
                  </span>
                  {selectedReceiving.status === "รับแล้ว" && Math.abs(selectedReceiving.differencePercent) > 0.3 && (
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-semibold">ส่วนต่างเกินเกณฑ์</span>
                    </div>
                  )}
                </div>

                {/* Main Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* เลขที่รับ */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">เลขที่รับ</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedReceiving.id}</p>
                  </div>

                  {/* เลขที่ใบสั่งซื้อ */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">เลขที่ใบสั่งซื้อ</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedReceiving.orderNo}</p>
                    {selectedReceiving.supplierOrderNo && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PTT: {selectedReceiving.supplierOrderNo}</p>
                    )}
                  </div>

                  {/* เลขที่ใบส่งของ */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">เลขที่ใบส่งของ</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedReceiving.deliveryNoteNo}</p>
                  </div>

                  {/* สาขา */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">สาขา</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedReceiving.branch}</p>
                  </div>

                  {/* วันที่รับ */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">วันที่รับ</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      {selectedReceiving.receiveDate} {selectedReceiving.receiveTime && ` ${selectedReceiving.receiveTime}`}
                    </p>
                  </div>

                  {/* ประเภทน้ำมัน */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplet className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">ประเภทน้ำมัน</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedReceiving.oilType}</p>
                  </div>

                  {/* ปริมาณที่สั่ง */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">ปริมาณที่สั่ง</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      {numberFormatter.format(selectedReceiving.quantityOrdered)} ลิตร
                    </p>
                  </div>

                  {/* ปริมาณที่รับ */}
                  {selectedReceiving.status === "รับแล้ว" && (
                    <>
                      <div className="bg-white dark:bg-gray-800 border-y border-r border-gray-200 dark:border-gray-700 border-l-4 border-emerald-500 p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">ปริมาณที่รับ</span>
                        </div>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {numberFormatter.format(selectedReceiving.quantityReceived)} ลิตร
                        </p>
                      </div>

                      {/* ส่วนต่าง */}
                      <div className={`bg-white dark:bg-gray-800 border-y border-r border-gray-200 dark:border-gray-700 border-l-4 p-4 rounded-xl shadow-sm ${
                        Math.abs(selectedReceiving.differencePercent) <= 0.3 ? 'border-emerald-500' : 
                        Math.abs(selectedReceiving.differencePercent) <= 1.0 ? 'border-orange-500' : 'border-red-500'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {selectedReceiving.difference > 0 ? (
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                          ) : selectedReceiving.difference < 0 ? (
                            <TrendingDown className="w-4 h-4 text-orange-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          )}
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">ส่วนต่าง</span>
                        </div>
                        <p className={`text-lg font-bold ${
                          Math.abs(selectedReceiving.differencePercent) <= 0.3 ? 'text-emerald-600 dark:text-emerald-400' : 
                          Math.abs(selectedReceiving.differencePercent) <= 1.0 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {selectedReceiving.difference > 0 ? '+' : ''}{numberFormatter.format(selectedReceiving.difference)} ลิตร
                        </p>
                        <p className={`text-xs mt-1 ${
                          Math.abs(selectedReceiving.differencePercent) <= 0.3 ? 'text-emerald-600 dark:text-emerald-400' : 
                          Math.abs(selectedReceiving.differencePercent) <= 1.0 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          ({selectedReceiving.differencePercent > 0 ? '+' : ''}{selectedReceiving.differencePercent.toFixed(2)}%)
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Additional Info */}
                {selectedReceiving.status === "รับแล้ว" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        ข้อมูลรถขนส่ง
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">ทะเบียนรถ:</span>
                          <span className="font-semibold text-gray-800 dark:text-white">{selectedReceiving.truckLicensePlate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">คนขับรถ:</span>
                          <span className="font-semibold text-gray-800 dark:text-white">{selectedReceiving.driverName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        ข้อมูลเพิ่มเติม
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">API Check:</span>
                          <span className="font-semibold text-gray-800 dark:text-white">{selectedReceiving.apiCheck?.toFixed(1) || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">ผู้รับ:</span>
                          <span className="font-semibold text-gray-800 dark:text-white">{selectedReceiving.receiverEmployee}</span>
                        </div>
                        {selectedReceiving.totalAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">ยอดรวม:</span>
                            <span className="font-semibold text-gray-800 dark:text-white">{currencyFormatter.format(selectedReceiving.totalAmount)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedReceiving(null)}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              >
                ปิด
              </button>
              {selectedReceiving.status === "รับแล้ว" && (
                <>
                  <button className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    ดูเอกสาร
                  </button>
                  <button className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Excel
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
