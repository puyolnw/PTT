import { motion } from "framer-motion";
import { useState } from "react";
import {
  Receipt,
  Download,
  Eye,
  Search,
  Filter,
  CheckCircle,
  Clock,
  FileText,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  Droplet,
  Printer,
  ShoppingCart,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Mock data - บิลสั่งซื้อน้ำมัน (จะมาจาก Orders เมื่ออนุมัติแล้ว)
const mockPurchaseBills = [
  {
    id: 1,
    billNo: "BILL-20241215-001",
    orderNo: "SO-20241215-001",
    supplierOrderNo: "PTT-20241215-001",
    branchId: 4,
    branchName: "สาขา 4",
    orderDate: "2024-12-15",
    deliveryDate: "2024-12-16",
    items: [
      { oilType: "Premium Diesel", quantity: 24000, pricePerLiter: 32.5, totalAmount: 780000 },
    ],
    totalAmount: 780000,
    legalEntityName: "บริษัท D จำกัด",
    status: "ส่งแล้ว",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-15 14:30",
    sentAt: "2024-12-15 15:00",
    printedAt: null,
  },
  {
    id: 2,
    billNo: "BILL-20241215-002",
    orderNo: "SO-20241215-002",
    supplierOrderNo: "PTT-20241215-002",
    branchId: 2,
    branchName: "สาขา 2",
    orderDate: "2024-12-15",
    deliveryDate: "2024-12-16",
    items: [
      { oilType: "Premium Diesel", quantity: 22000, pricePerLiter: 32.5, totalAmount: 715000 },
      { oilType: "Gasohol 95", quantity: 18000, pricePerLiter: 35.0, totalAmount: 630000 },
    ],
    totalAmount: 1345000,
    legalEntityName: "บริษัท B จำกัด",
    status: "รอส่ง",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-15 16:00",
    sentAt: null,
    printedAt: null,
  },
  {
    id: 3,
    billNo: "BILL-20241215-003",
    orderNo: "SO-20241215-003",
    supplierOrderNo: "PTT-20241215-003",
    branchId: 3,
    branchName: "สาขา 3",
    orderDate: "2024-12-15",
    deliveryDate: "2024-12-16",
    items: [
      { oilType: "Diesel", quantity: 20000, pricePerLiter: 30.0, totalAmount: 600000 },
    ],
    totalAmount: 600000,
    legalEntityName: "บริษัท C จำกัด",
    status: "รอส่ง",
    approvedBy: "คุณนิด",
    approvedAt: "2024-12-15 16:15",
    sentAt: null,
    printedAt: null,
  },
];

export default function PurchaseBills() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [filterBranch, setFilterBranch] = useState("ทั้งหมด");
  const [selectedBill, setSelectedBill] = useState<typeof mockPurchaseBills[0] | null>(null);

  const branches = [
    { id: 1, name: "ปั๊มไฮโซ", code: "HQ" },
    { id: 2, name: "สาขา 2", code: "B2" },
    { id: 3, name: "สาขา 3", code: "B3" },
    { id: 4, name: "สาขา 4", code: "B4" },
    { id: 5, name: "สาขา 5", code: "B5" },
  ];

  const filteredBills = mockPurchaseBills.filter((bill) => {
    const matchesSearch =
      bill.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.branchName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "ทั้งหมด" || bill.status === filterStatus;
    const matchesBranch = filterBranch === "ทั้งหมด" || bill.branchName === filterBranch;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "รอส่ง":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800";
      case "ส่งแล้ว":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
      case "พิมพ์แล้ว":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
    }
  };

  const handlePrintBill = (bill: typeof mockPurchaseBills[0]) => {
    // In real app, this would open print dialog
    console.log("Printing bill:", bill.billNo);
    // Update printedAt timestamp
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">บิลสั่งซื้อน้ำมัน</h1>
        <p className="text-gray-600 dark:text-gray-400">รายการบิลสั่งซื้อน้ำมันที่อนุมัติแล้ว - สามารถพิมพ์บิลให้แต่ละปั๊มได้</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "บิลทั้งหมด",
            value: mockPurchaseBills.length,
            subtitle: "รายการ",
            icon: Receipt,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
          {
            title: "รอส่ง",
            value: mockPurchaseBills.filter((b) => b.status === "รอส่ง").length,
            subtitle: "รายการ",
            icon: Clock,
            iconColor: "bg-gradient-to-br from-orange-500 to-orange-600",
            badge: "รอส่ง",
            badgeColor: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800",
          },
          {
            title: "ส่งแล้ว",
            value: mockPurchaseBills.filter((b) => b.status === "ส่งแล้ว").length,
            subtitle: "รายการ",
            icon: CheckCircle,
            iconColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
            badge: "ส่งแล้ว",
            badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
          },
          {
            title: "ยอดรวม",
            value: currencyFormatter.format(mockPurchaseBills.reduce((sum, b) => sum + b.totalAmount, 0)),
            subtitle: "บาท",
            icon: DollarSign,
            iconColor: "bg-gradient-to-br from-purple-500 to-purple-600",
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

      {/* Filters */}
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
            placeholder="ค้นหาเลขที่บิล, เลขที่ออเดอร์, สาขา..."
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
            <option>รอส่ง</option>
            <option>ส่งแล้ว</option>
            <option>พิมพ์แล้ว</option>
          </select>
        </div>
      </motion.div>

      {/* Bills Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            รายการบิลสั่งซื้อน้ำมัน
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">บิลที่อนุมัติแล้วจากหน้าสั่งซื้อน้ำมัน</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">เลขที่บิล</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">เลขที่ออเดอร์</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">สาขา</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">วันที่สั่ง</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">วันที่ส่ง</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ยอดรวม</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">สถานะ</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill, index) => (
                <motion.tr
                  key={bill.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">{bill.billNo}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{bill.orderNo}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">{bill.branchName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{bill.orderDate}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{bill.deliveryDate}</td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                    {currencyFormatter.format(bill.totalAmount)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusColor(bill.status)}`}>
                      {bill.status === "รอส่ง" && <Clock className="w-3.5 h-3.5" />}
                      {bill.status === "ส่งแล้ว" && <CheckCircle className="w-3.5 h-3.5" />}
                      {bill.status === "พิมพ์แล้ว" && <Printer className="w-3.5 h-3.5" />}
                      {bill.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                      </button>
                      <button
                        onClick={() => handlePrintBill(bill)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        title="พิมพ์บิล"
                      >
                        <Printer className="w-4 h-4 text-gray-400 hover:text-green-500" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        title="ดาวน์โหลด PDF"
                      >
                        <Download className="w-4 h-4 text-gray-400 hover:text-purple-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBill(null)}>
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
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                    รายละเอียดบิลสั่งซื้อน้ำมัน
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedBill.billNo} - {selectedBill.branchName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBill(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                aria-label="ปิด"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
              <div className="space-y-6">
                {/* Bill Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">เลขที่บิล</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedBill.billNo}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">เลขที่ออเดอร์</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedBill.orderNo}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PTT: {selectedBill.supplierOrderNo}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">สาขา</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedBill.branchName}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">นิติบุคคล</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedBill.legalEntityName}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <Droplet className="w-4 h-4" />
                      รายการน้ำมัน
                    </h4>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">ประเภทน้ำมัน</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">ปริมาณ (ลิตร)</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">ราคาต่อลิตร</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">ยอดรวม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-4 text-sm text-gray-800 dark:text-white">{item.oilType}</td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">{numberFormatter.format(item.quantity)}</td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">{item.pricePerLiter.toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm text-right font-semibold text-gray-800 dark:text-white">{currencyFormatter.format(item.totalAmount)}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 dark:bg-gray-900/50">
                        <td colSpan={3} className="py-3 px-4 text-sm font-semibold text-gray-800 dark:text-white text-right">รวมทั้งสิ้น</td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-800 dark:text-white text-right">{currencyFormatter.format(selectedBill.totalAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Timeline */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    ประวัติการดำเนินการ
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">อนุมัติแล้ว</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">โดย {selectedBill.approvedBy}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{selectedBill.approvedAt}</p>
                      </div>
                    </div>
                    {selectedBill.sentAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">ส่งออเดอร์แล้ว</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{selectedBill.sentAt}</p>
                        </div>
                      </div>
                    )}
                    {selectedBill.printedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">พิมพ์บิลแล้ว</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{selectedBill.printedAt}</p>
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
                onClick={() => setSelectedBill(null)}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              >
                ปิด
              </button>
              <button
                onClick={() => handlePrintBill(selectedBill)}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                พิมพ์บิล
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

