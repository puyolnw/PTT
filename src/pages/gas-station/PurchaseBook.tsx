import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FileText,
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  DollarSign,
  Droplet,
  Calendar,
  Receipt,
  X,
  Building2,
  Package,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

type PurchaseStatus = "รอใบกำกับ" | "มีใบกำกับแล้ว" | "ชำระแล้ว";

type PurchaseItem = {
  id: string;
  receiveDate: string;
  deliveryNoteNo: string;
  orderNo: string;
  supplierOrderNo: string;
  branch: string;
  legalEntity: string;
  oilType: string;
  quantityReceived: number; // ลิตร
  pricePerLiter: number;
  totalAmount: number; // ยังไม่รวม VAT
  vatAmount: number; // ภาษีซื้อ 7%
  totalWithVat: number; // รวม VAT
  taxInvoiceNo?: string;
  taxInvoiceDate?: string;
  discount?: number;
  status: PurchaseStatus;
  paymentDate?: string;
  paymentSlipNo?: string;
  daysSinceReceive: number;
  daysSinceInvoice?: number;
};

// Mock data
const mockPurchaseData: PurchaseItem[] = [
  {
    id: "PB-20241215-001",
    receiveDate: "2024-12-15",
    deliveryNoteNo: "DN-20241215-001",
    orderNo: "SO-20241215-001",
    supplierOrderNo: "PTT-ORD-20241215-001",
    branch: "ปั๊มไฮโซ",
    legalEntity: "ห้าง A",
    oilType: "Premium Diesel",
    quantityReceived: 20000,
    pricePerLiter: 33.49,
    totalAmount: 669800,
    vatAmount: 46886,
    totalWithVat: 716686,
    status: "ชำระแล้ว",
    taxInvoiceNo: "TAX-20241215-001",
    taxInvoiceDate: "2024-12-15",
    paymentDate: "2024-12-18",
    paymentSlipNo: "SLIP-20241218-001",
    daysSinceReceive: 0,
    daysSinceInvoice: 0,
  },
  {
    id: "PB-20241214-002",
    receiveDate: "2024-12-14",
    deliveryNoteNo: "DN-20241214-002",
    orderNo: "SO-20241214-002",
    supplierOrderNo: "PTT-ORD-20241214-002",
    branch: "ปั๊มไฮโซ",
    legalEntity: "ห้าง A",
    oilType: "Gasohol 95",
    quantityReceived: 15000,
    pricePerLiter: 41.49,
    totalAmount: 622350,
    vatAmount: 43564.5,
    totalWithVat: 665914.5,
    status: "มีใบกำกับแล้ว",
    taxInvoiceNo: "TAX-20241214-002",
    taxInvoiceDate: "2024-12-14",
    daysSinceReceive: 1,
    daysSinceInvoice: 1,
  },
  {
    id: "PB-20241213-003",
    receiveDate: "2024-12-13",
    deliveryNoteNo: "DN-20241213-003",
    orderNo: "SO-20241213-003",
    supplierOrderNo: "PTT-ORD-20241213-003",
    branch: "ปั๊มไฮโซ",
    legalEntity: "ห้าง A",
    oilType: "Diesel",
    quantityReceived: 25000,
    pricePerLiter: 32.49,
    totalAmount: 812250,
    vatAmount: 56857.5,
    totalWithVat: 869107.5,
    status: "มีใบกำกับแล้ว",
    taxInvoiceNo: "TAX-20241213-003",
    taxInvoiceDate: "2024-12-13",
    discount: 5000,
    daysSinceReceive: 2,
    daysSinceInvoice: 2,
  },
  {
    id: "PB-20241212-004",
    receiveDate: "2024-12-12",
    deliveryNoteNo: "DN-20241212-004",
    orderNo: "SO-20241212-004",
    supplierOrderNo: "PTT-ORD-20241212-004",
    branch: "ปั๊มไฮโซ",
    legalEntity: "ห้าง A",
    oilType: "E20",
    quantityReceived: 18000,
    pricePerLiter: 36.90,
    totalAmount: 664200,
    vatAmount: 46494,
    totalWithVat: 710694,
    status: "รอใบกำกับ",
    daysSinceReceive: 3,
  },
  {
    id: "PB-20241211-005",
    receiveDate: "2024-12-11",
    deliveryNoteNo: "DN-20241211-005",
    orderNo: "SO-20241211-005",
    supplierOrderNo: "PTT-ORD-20241211-005",
    branch: "ปั๊มไฮโซ",
    legalEntity: "ห้าง A",
    oilType: "Premium Diesel",
    quantityReceived: 22000,
    pricePerLiter: 33.49,
    totalAmount: 736780,
    vatAmount: 51574.6,
    totalWithVat: 788354.6,
    status: "ชำระแล้ว",
    taxInvoiceNo: "TAX-20241211-005",
    taxInvoiceDate: "2024-12-11",
    paymentDate: "2024-12-15",
    paymentSlipNo: "SLIP-20241215-002",
    daysSinceReceive: 4,
    daysSinceInvoice: 4,
  },
  {
    id: "PB-20241210-006",
    receiveDate: "2024-12-10",
    deliveryNoteNo: "DN-20241210-006",
    orderNo: "SO-20241210-006",
    supplierOrderNo: "PTT-ORD-20241210-006",
    branch: "ปั๊มไฮโซ",
    legalEntity: "ห้าง A",
    oilType: "Gasohol 91",
    quantityReceived: 12000,
    pricePerLiter: 38.49,
    totalAmount: 461880,
    vatAmount: 32331.6,
    totalWithVat: 494211.6,
    status: "มีใบกำกับแล้ว",
    taxInvoiceNo: "TAX-20241210-006",
    taxInvoiceDate: "2024-12-10",
    daysSinceReceive: 5,
    daysSinceInvoice: 5,
  },
];

export default function PurchaseBook() {
  const location = useLocation();
  const [purchaseData, setPurchaseData] = useState<PurchaseItem[]>(mockPurchaseData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ทั้งหมด" | PurchaseStatus>("ทั้งหมด");
  const [selectedOilType, setSelectedOilType] = useState("ทั้งหมด");
  const [selectedItem, setSelectedItem] = useState<PurchaseItem | null>(null);

  // รับข้อมูลบิลใหม่จาก Orders page
  useEffect(() => {
    if (location.state?.newBill && location.state?.fromOrders) {
      const newBill = location.state.newBill;
      
      // แปลงข้อมูลบิลเป็น PurchaseItem format
      const newPurchaseItems: PurchaseItem[] = newBill.branches.flatMap((branch: any) => 
        branch.items.map((item: any, idx: number) => {
          const receiveDate = newBill.deliveryDate; // วันที่รับ = วันที่ส่ง
          const vatAmount = item.totalAmount * 0.07;
          const totalWithVat = item.totalAmount + vatAmount;
          
          return {
            id: `PB-${receiveDate.replace(/-/g, '')}-${String(purchaseData.length + idx + 1).padStart(3, '0')}`,
            receiveDate: receiveDate,
            deliveryNoteNo: `DN-${receiveDate.replace(/-/g, '')}-${String(purchaseData.length + idx + 1).padStart(3, '0')}`,
            orderNo: newBill.orderNo,
            supplierOrderNo: newBill.supplierOrderNo,
            branch: branch.branchName,
            legalEntity: branch.legalEntityName,
            oilType: item.oilType,
            quantityReceived: item.quantity,
            pricePerLiter: item.pricePerLiter,
            totalAmount: item.totalAmount,
            vatAmount: vatAmount,
            totalWithVat: totalWithVat,
            status: "รอใบกำกับ" as PurchaseStatus,
            daysSinceReceive: 0,
          };
        })
      );
      
      // เพิ่มข้อมูลใหม่เข้าไปในรายการ
      setPurchaseData(prev => [...newPurchaseItems, ...prev]);
      
      // แสดง notification หรือ highlight รายการใหม่
      alert(`เพิ่มบิลใหม่ ${newPurchaseItems.length} รายการจากใบสั่งซื้อ ${newBill.orderNo}`);
      
      // Clear state เพื่อไม่ให้เพิ่มซ้ำ
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.newBill?.orderNo]);

  const filteredPurchases = purchaseData.filter((item) => {
    const matchesSearch =
      item.deliveryNoteNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplierOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.oilType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.taxInvoiceNo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === "ทั้งหมด" || item.status === selectedStatus;
    const matchesOilType = selectedOilType === "ทั้งหมด" || item.oilType === selectedOilType;

    return matchesSearch && matchesStatus && matchesOilType;
  });

  const summary = {
    totalItems: purchaseData.length,
    totalQuantity: purchaseData.reduce((sum, item) => sum + item.quantityReceived, 0),
    totalAmount: purchaseData.reduce((sum, item) => sum + item.totalAmount, 0),
    totalVat: purchaseData.reduce((sum, item) => sum + item.vatAmount, 0),
    totalWithVat: purchaseData.reduce((sum, item) => sum + item.totalWithVat, 0),
    waitingInvoice: purchaseData.filter((item) => item.status === "รอใบกำกับ").length,
    waitingPayment: purchaseData.filter((item) => item.status === "มีใบกำกับแล้ว").length,
    paid: purchaseData.filter((item) => item.status === "ชำระแล้ว").length,
  };

  const getStatusBadgeClasses = (status: PurchaseStatus) => {
    if (status === "ชำระแล้ว") {
      return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    }
    if (status === "มีใบกำกับแล้ว") {
      return "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
    }
    return "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
  };

  const getStatusIcon = (status: PurchaseStatus) => {
    if (status === "ชำระแล้ว") return CheckCircle;
    if (status === "มีใบกำกับแล้ว") return Clock;
    return AlertTriangle;
  };

  const getRowColor = (status: PurchaseStatus, daysSinceInvoice?: number) => {
    if (status === "ชำระแล้ว") return "";
    if (status === "มีใบกำกับแล้ว" && daysSinceInvoice && daysSinceInvoice >= 7) {
      return "bg-red-50/30 dark:bg-red-900/10";
    }
    if (status === "มีใบกำกับแล้ว") {
      return "bg-yellow-50/30 dark:bg-yellow-900/10";
    }
    return "bg-orange-50/30 dark:bg-orange-900/10";
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-500" />
          สมุดซื้อน้ำมัน
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          บันทึกรายการซื้อน้ำมันทั้งหมด ตั้งแต่รับน้ำมันจนถึงชำระเงิน พร้อมสถานะใบกำกับภาษี
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "รวมจำนวนลิตร",
            value: numberFormatter.format(summary.totalQuantity),
            subtitle: "ลิตร",
            icon: Droplet,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
          {
            title: "มูลค่ารวม (ไม่รวม VAT)",
            value: currencyFormatter.format(summary.totalAmount),
            subtitle: "บาท",
            icon: DollarSign,
            iconColor: "bg-gradient-to-br from-purple-500 to-purple-600",
          },
          {
            title: "ภาษีซื้อรวม",
            value: currencyFormatter.format(summary.totalVat),
            subtitle: "บาท",
            icon: Receipt,
            iconColor: "bg-gradient-to-br from-indigo-500 to-indigo-600",
          },
          {
            title: "มูลค่ารวม (รวม VAT)",
            value: currencyFormatter.format(summary.totalWithVat),
            subtitle: "บาท",
            icon: FileText,
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

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            title: "รอใบกำกับ",
            value: summary.waitingInvoice,
            icon: AlertTriangle,
            iconColor: "text-orange-500",
            bgColor: "bg-orange-50 dark:bg-orange-900/20",
            borderColor: "border-orange-200 dark:border-orange-800",
          },
          {
            title: "มีใบกำกับแล้ว (รอชำระ)",
            value: summary.waitingPayment,
            icon: Clock,
            iconColor: "text-yellow-500",
            bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
            borderColor: "border-yellow-200 dark:border-yellow-800",
          },
          {
            title: "ชำระแล้ว",
            value: summary.paid,
            icon: CheckCircle,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            borderColor: "border-emerald-200 dark:border-emerald-800",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-4 flex items-center gap-3`}
          >
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value} รายการ</p>
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
            placeholder="ค้นหาเลขที่ใบส่งของ, เลขที่ใบสั่งซื้อ, เลขที่ใบกำกับ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as "ทั้งหมด" | PurchaseStatus)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          >
            <option>ทั้งหมด</option>
            <option value="รอใบกำกับ">รอใบกำกับ</option>
            <option value="มีใบกำกับแล้ว">มีใบกำกับแล้ว</option>
            <option value="ชำระแล้ว">ชำระแล้ว</option>
          </select>
        </div>
        <select
          value={selectedOilType}
          onChange={(e) => setSelectedOilType(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
        >
          <option>ทั้งหมด</option>
          <option>Premium Diesel</option>
          <option>Premium Gasohol 95</option>
          <option>Diesel</option>
          <option>E85</option>
          <option>E20</option>
          <option>Gasohol 91</option>
          <option>Gasohol 95</option>
        </select>
      </motion.div>

      {/* Purchase Book Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">รายการสมุดซื้อน้ำมัน</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            บันทึกรายการซื้อน้ำมันตั้งแต่รับน้ำมันจนถึงชำระเงิน เรียงตามวันที่รับ
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  วันที่รับ
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  เลขที่ใบส่งของ
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  เลขที่ใบสั่งซื้อ
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  ประเภทน้ำมัน
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  จำนวน (ลิตร)
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  ราคาต่อลิตร
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  มูลค่า (ไม่รวม VAT)
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  ภาษีซื้อ
                </th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  รวม VAT
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  เลขที่ใบกำกับ
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  วันที่จ่าย
                </th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  สถานะ
                </th>
                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    ไม่พบข้อมูลที่ตรงกับเงื่อนไขค้นหา
                  </td>
                </tr>
              )}
              {filteredPurchases.map((item, index) => {
                const StatusIcon = getStatusIcon(item.status);
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${getRowColor(
                      item.status,
                      item.daysSinceInvoice
                    )}`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-800 dark:text-white">{item.receiveDate}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">
                        {item.deliveryNoteNo}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-600 dark:text-gray-400">{item.orderNo}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">{item.supplierOrderNo}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">{item.oilType}</td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                      {numberFormatter.format(item.quantityReceived)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-600 dark:text-gray-400">
                      {numberFormatter.format(item.pricePerLiter)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                      {currencyFormatter.format(item.totalAmount)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-600 dark:text-gray-400">
                      {currencyFormatter.format(item.vatAmount)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                      {currencyFormatter.format(item.totalWithVat)}
                    </td>
                    <td className="py-4 px-6">
                      {item.taxInvoiceNo ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800 dark:text-white">
                            {item.taxInvoiceNo}
                          </span>
                          {item.taxInvoiceDate && (
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {item.taxInvoiceDate}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {item.paymentDate ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-800 dark:text-white">{item.paymentDate}</span>
                          {item.paymentSlipNo && (
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {item.paymentSlipNo}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusBadgeClasses(
                          item.status
                        )}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {item.status}
                      </span>
                      {item.status === "มีใบกำกับแล้ว" && item.daysSinceInvoice && item.daysSinceInvoice >= 7 && (
                        <div className="mt-1">
                          <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
                            เกินกำหนด {item.daysSinceInvoice} วัน
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">รายละเอียดการซื้อน้ำมัน</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedItem.deliveryNoteNo}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-center">
                    <span
                      className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border ${getStatusBadgeClasses(
                        selectedItem.status
                      )}`}
                    >
                      {(() => {
                        const StatusIcon = getStatusIcon(selectedItem.status);
                        return <StatusIcon className="w-4 h-4" />;
                      })()}
                      {selectedItem.status}
                    </span>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">วันที่รับ</h3>
                      </div>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedItem.receiveDate}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-5 h-5 text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">เลขที่ใบส่งของ</h3>
                      </div>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedItem.deliveryNoteNo}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">เลขที่ใบสั่งซื้อ</h3>
                      </div>
                      <p className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                        {selectedItem.orderNo}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedItem.supplierOrderNo}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">สาขา / นิติบุคคล</h3>
                      </div>
                      <p className="text-base font-semibold text-gray-800 dark:text-white mb-1">
                        {selectedItem.branch}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedItem.legalEntity}</p>
                    </div>
                  </div>

                  {/* Oil Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-4">
                      <Droplet className="w-6 h-6 text-blue-500" />
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">ข้อมูลน้ำมัน</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ประเภทน้ำมัน</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedItem.oilType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">จำนวน (ลิตร)</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {numberFormatter.format(selectedItem.quantityReceived)} ลิตร
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ราคาต่อลิตร</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                          {numberFormatter.format(selectedItem.pricePerLiter)} บาท
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-4">
                      <DollarSign className="w-6 h-6 text-purple-500" />
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">ข้อมูลการเงิน</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">มูลค่า (ไม่รวม VAT)</span>
                        <span className="text-lg font-bold text-gray-800 dark:text-white">
                          {currencyFormatter.format(selectedItem.totalAmount)}
                        </span>
                      </div>
                      {selectedItem.discount && (
                        <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-800">
                          <span className="text-sm text-gray-600 dark:text-gray-400">ส่วนลด</span>
                          <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                            -{currencyFormatter.format(selectedItem.discount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-800">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ภาษีซื้อ (7%)</span>
                        <span className="text-lg font-bold text-gray-800 dark:text-white">
                          {currencyFormatter.format(selectedItem.vatAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-white dark:bg-gray-800 rounded-lg px-4 mt-2">
                        <span className="text-base font-bold text-gray-800 dark:text-white">รวมทั้งสิ้น</span>
                        <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                          {currencyFormatter.format(selectedItem.totalWithVat)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tax Invoice Information */}
                  {selectedItem.taxInvoiceNo && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-3 mb-4">
                        <Receipt className="w-6 h-6 text-emerald-500" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">ข้อมูลใบกำกับภาษี</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">เลขที่ใบกำกับ</p>
                          <p className="text-lg font-bold text-gray-800 dark:text-white">
                            {selectedItem.taxInvoiceNo}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">วันที่ใบกำกับ</p>
                          <p className="text-lg font-bold text-gray-800 dark:text-white">
                            {selectedItem.taxInvoiceDate}
                          </p>
                        </div>
                        {selectedItem.daysSinceInvoice !== undefined && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">จำนวนวันที่ผ่านมา</p>
                            <p className="text-lg font-bold text-gray-800 dark:text-white">
                              {selectedItem.daysSinceInvoice} วัน
                              {selectedItem.daysSinceInvoice >= 7 && (
                                <span className="ml-2 text-red-600 dark:text-red-400">(เกินกำหนด)</span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  {selectedItem.paymentDate && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">ข้อมูลการชำระเงิน</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">วันที่จ่าย</p>
                          <p className="text-lg font-bold text-gray-800 dark:text-white">
                            {selectedItem.paymentDate}
                          </p>
                        </div>
                        {selectedItem.paymentSlipNo && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">เลขที่สลิป</p>
                            <p className="text-lg font-bold text-gray-800 dark:text-white">
                              {selectedItem.paymentSlipNo}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Waiting Information */}
                  {selectedItem.status === "รอใบกำกับ" && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-orange-500" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">รอใบกำกับภาษี</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            รายการนี้ยังไม่ได้รับใบกำกับภาษีจากผู้ขาย
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedItem.status === "มีใบกำกับแล้ว" && !selectedItem.paymentDate && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-yellow-500" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">รอการชำระเงิน</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            มีใบกำกับแล้ว แต่ยังไม่ชำระเงิน
                            {selectedItem.daysSinceInvoice && selectedItem.daysSinceInvoice >= 7 && (
                              <span className="ml-2 text-red-600 dark:text-red-400 font-semibold">
                                (เกินกำหนด {selectedItem.daysSinceInvoice} วัน)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
