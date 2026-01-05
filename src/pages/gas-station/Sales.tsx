import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Fuel,
  Search,
  DollarSign,
  Droplet,
  BarChart3,
  Calendar,
  Upload,
  X,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader,
  Plus,
  Clock,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Mock data - สร้างข้อมูลการขายน้ำมันจำนวนมากสำหรับปั๊ม PTT
const generateMockSales = () => {
  const sales = [];
  const oilTypes = [
    "Premium Diesel",
    "Premium Gasohol 95",
    "Diesel",
    "E85",
    "E20",
    "Gasohol 91",
    "Gasohol 95",
  ];
  const nozzles = ["P18", "P26", "P34", "P42", "P59", "P67", "P75", "P83", "P91", "P99"];
  const paymentMethods = [
    "เงินสด",
    "QR| PROMPTPAY",
    "QR| KPLUS",
    "VISA",
    "Master",
    "PTT Privilege",
    "Energy Card",
    "Fleet Card",
  ];

  // ราคาต่อลิตรของแต่ละชนิดน้ำมัน
  const prices = new Map<string, number>([
    ["Premium Diesel", 33.49],
    ["Premium Gasohol 95", 41.49],
    ["Diesel", 32.49],
    ["E85", 28.99],
    ["E20", 35.99],
    ["Gasohol 91", 38.99],
    ["Gasohol 95", 40.99],
  ]);

  // สัดส่วนการขายของแต่ละชนิดน้ำมัน (เปอร์เซ็นต์)
  const distribution: Record<string, number> = {
    "Premium Diesel": 25,
    "Premium Gasohol 95": 20,
    "Diesel": 30,
    "E85": 5,
    "E20": 8,
    "Gasohol 91": 7,
    "Gasohol 95": 5,
  };

  // สร้างข้อมูลประมาณ 450 รายการต่อวัน (ประมาณ 18-19 รายการต่อชั่วโมง)
  const totalTransactions = 450;
  let transactionId = 1;

  for (let hour = 6; hour < 24; hour++) {
    const transactionsPerHour = Math.floor(Math.random() * 25) + 15; // 15-40 รายการต่อชั่วโมง

    for (let i = 0; i < transactionsPerHour && transactionId <= totalTransactions; i++) {
      // เลือกประเภทน้ำมันตามสัดส่วน
      const rand = Math.random() * 100;
      let cumulative = 0;
      let selectedOilType = oilTypes[0];

      for (const [oilType, percentage] of Object.entries(distribution)) {
        cumulative += percentage;
        if (rand <= cumulative) {
          selectedOilType = oilType;
          break;
        }
      }

      // สุ่มจำนวนลิตร (20-80 ลิตร สำหรับรถยนต์, 100-300 ลิตร สำหรับรถบรรทุก)
      const isTruck = Math.random() < 0.15; // 15% เป็นรถบรรทุก
      const quantity = isTruck
        ? Math.round((Math.random() * 200 + 100) * 10) / 10 // 100-300 ลิตร
        : Math.round((Math.random() * 60 + 20) * 10) / 10; // 20-80 ลิตร

      const price = prices.get(selectedOilType) || 0;
      const amount = Math.round(quantity * price);

      // สุ่มเวลาในชั่วโมงนั้น
      const minute = Math.floor(Math.random() * 60);
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      sales.push({
        id: `SALE-20241215-${String(transactionId).padStart(3, '0')}`,
        date: "2024-12-15",
        time: time,
        oilType: selectedOilType,
        quantity: quantity,
        amount: amount,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        nozzle: nozzles[Math.floor(Math.random() * nozzles.length)],
      });

      transactionId++;
    }
  }

  return sales;
};

const mockSales = generateMockSales();

// คำนวณสรุปข้อมูลจาก mockSales
const calculateSalesSummary = () => {
  const totalAmount = mockSales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalLiters = mockSales.reduce((sum, sale) => sum + sale.quantity, 0);
  const transactions = mockSales.length;

  // คำนวณตามวิธีชำระเงิน
  const byPaymentMethod = mockSales.reduce((acc, sale) => {
    const method = sale.paymentMethod;
    acc.set(method, (acc.get(method) || 0) + sale.amount);
    return acc;
  }, new Map<string, number>());

  // คำนวณตามประเภทน้ำมัน
  const byOilTypeMap = mockSales.reduce((acc, sale) => {
    const type = sale.oilType;
    acc.set(type, (acc.get(type) || 0) + sale.amount);
    return acc;
  }, new Map<string, number>());

  const byOilType = Object.fromEntries(byOilTypeMap);

  return {
    today: {
      totalAmount,
      totalLiters: Math.round(totalLiters),
      transactions,
      byPaymentMethod: {
        cash: byPaymentMethod.get("เงินสด") || 0,
        card: (byPaymentMethod.get("VISA") || 0) + (byPaymentMethod.get("Master") || 0),
        qr: (byPaymentMethod.get("QR| PROMPTPAY") || 0) + (byPaymentMethod.get("QR| KPLUS") || 0),
        fleet: byPaymentMethod.get("Fleet Card") || 0,
      },
      byOilType,
    },
  };
};

const mockSalesSummary = calculateSalesSummary();

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [importMessage, setImportMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    oilType: "",
    quantity: "",
    amount: "",
    nozzle: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // จัดกลุ่มข้อมูลตามประเภทน้ำมันและรวมยอดขาย
  const groupedByOilTypeMap = mockSales.reduce((acc, sale) => {
    const key = sale.oilType;
    const existing = acc.get(key);
    if (!existing) {
      acc.set(key, {
        oilType: sale.oilType,
        totalQuantity: sale.quantity,
        totalAmount: sale.amount,
        transactionCount: 1,
      });
    } else {
      existing.totalQuantity += sale.quantity;
      existing.totalAmount += sale.amount;
      existing.transactionCount += 1;
    }
    return acc;
  }, new Map<string, { oilType: string; totalQuantity: number; totalAmount: number; transactionCount: number }>());

  // แปลงเป็น array และกรองตาม search term
  const filteredSales = Array.from(groupedByOilTypeMap.values()).filter((sale) => {
    const matchesSearch =
      sale.oilType.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const avgPerTransaction = mockSalesSummary.today.totalAmount / mockSalesSummary.today.transactions;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">การขายน้ำมัน</h1>
          <p className="text-gray-600 dark:text-gray-400">รายการขายน้ำมันจากหัวจ่ายปั๊มไฮโซ</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>เพิ่มข้อมูล</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Upload className="w-5 h-5" />
            <span>นำเข้าข้อมูล</span>
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "ยอดขายวันนี้",
            value: currencyFormatter.format(mockSalesSummary.today.totalAmount),
            subtitle: "บาท",
            icon: DollarSign,
            iconColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
            change: "+5.2%",
          },
          {
            title: "จำนวนลิตร",
            value: numberFormatter.format(mockSalesSummary.today.totalLiters),
            subtitle: "ลิตร",
            icon: Droplet,
            iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
          },
          {
            title: "จำนวนรายการ",
            value: numberFormatter.format(mockSalesSummary.today.transactions),
            subtitle: "รายการ",
            icon: Fuel,
            iconColor: "bg-gradient-to-br from-purple-500 to-purple-600",
          },
          {
            title: "เฉลี่ยต่อรายการ",
            value: currencyFormatter.format(avgPerTransaction),
            subtitle: "บาท",
            icon: BarChart3,
            iconColor: "bg-gradient-to-br from-orange-500 to-orange-600",
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
              {stat.change && (
                <div className="mt-3 flex items-center justify-end">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                    {stat.change}
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
            placeholder="ค้นหาประเภทน้ำมัน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            รายการขายน้ำมันปั๊มไฮโซ
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">ยอดขายแยกตามประเภทน้ำมัน</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ประเภทน้ำมัน</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">จำนวน (ลิตร)</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">ยอดขาย (บาท)</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale, index) => (
                <motion.tr
                  key={sale.oilType}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">{sale.oilType}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                    {numberFormatter.format(sale.totalQuantity)} ลิตร
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    {currencyFormatter.format(sale.totalAmount)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowImportModal(false);
                setSelectedFile(null);
                setImportStatus("idle");
                setImportMessage("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setImportStatus("idle");
                  setImportMessage("");
                }
              }}
              role="button"
              tabIndex={0}
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
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="none"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <Upload className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">นำเข้าข้อมูลการขาย</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        อัปโหลดไฟล์ข้อมูลการขายน้ำมัน (Excel, CSV)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setSelectedFile(null);
                      setImportStatus("idle");
                      setImportMessage("");
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          setImportStatus("idle");
                          setImportMessage("");
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center">
                        <FileText className="w-8 h-8 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
                          {selectedFile ? selectedFile.name : "คลิกเพื่อเลือกไฟล์หรือลากไฟล์มาวางที่นี่"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          รองรับไฟล์ Excel (.xlsx, .xls) หรือ CSV (.csv)
                        </p>
                      </div>
                      {!selectedFile && (
                        <button
                          type="button"
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                        >
                          เลือกไฟล์
                        </button>
                      )}
                    </label>
                  </div>

                  {/* Selected File Info */}
                  {selectedFile && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setImportStatus("idle");
                          setImportMessage("");
                        }}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  )}

                  {/* Import Instructions */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      รูปแบบไฟล์ที่รองรับ:
                    </h3>
                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                      <li>คอลัมน์: วันที่, เวลา, ประเภทน้ำมัน, จำนวน (ลิตร), ยอดเงิน, หัวจ่าย</li>
                      <li>ไฟล์ Excel (.xlsx, .xls) หรือ CSV (.csv)</li>
                      <li>ข้อมูลจะถูกนำเข้าและอัปเดตในระบบอัตโนมัติ</li>
                    </ul>
                  </div>

                  {/* Status Message */}
                  {importStatus !== "idle" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl p-4 flex items-center gap-3 ${importStatus === "success"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                        : importStatus === "error"
                          ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                          : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                        }`}
                    >
                      {importStatus === "uploading" && (
                        <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                      )}
                      {importStatus === "success" && (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                      {importStatus === "error" && (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <p
                        className={`text-sm font-medium ${importStatus === "success"
                          ? "text-emerald-800 dark:text-emerald-200"
                          : importStatus === "error"
                            ? "text-red-800 dark:text-red-200"
                            : "text-blue-800 dark:text-blue-200"
                          }`}
                      >
                        {importMessage || "กำลังประมวลผล..."}
                      </p>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setShowImportModal(false);
                        setSelectedFile(null);
                        setImportStatus("idle");
                        setImportMessage("");
                      }}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={async () => {
                        if (!selectedFile) {
                          setImportStatus("error");
                          setImportMessage("กรุณาเลือกไฟล์ก่อน");
                          return;
                        }

                        setImportStatus("uploading");
                        setImportMessage("กำลังอัปโหลดและประมวลผลข้อมูล...");

                        // Simulate file upload and processing
                        try {
                          // ในอนาคตจะเชื่อมต่อกับ API จริง
                          await new Promise((resolve) => setTimeout(resolve, 2000));

                          // Simulate success
                          setImportStatus("success");
                          setImportMessage(
                            `นำเข้าข้อมูลสำเร็จ: ${selectedFile.name} (${Math.floor(Math.random() * 100) + 50} รายการ)`
                          );

                          // Auto close after 2 seconds
                          setTimeout(() => {
                            setShowImportModal(false);
                            setSelectedFile(null);
                            setImportStatus("idle");
                            setImportMessage("");
                            // ในอนาคตจะ refresh ข้อมูลในตาราง
                          }, 2000);
                        } catch {
                          setImportStatus("error");
                          setImportMessage("เกิดข้อผิดพลาดในการนำเข้าข้อมูล กรุณาลองใหม่อีกครั้ง");
                        }
                      }}
                      disabled={!selectedFile || importStatus === "uploading"}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {importStatus === "uploading" && (
                        <Loader className="w-4 h-4 animate-spin" />
                      )}
                      <span>นำเข้าข้อมูล</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Sale Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddModal(false);
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toTimeString().slice(0, 5),
                  oilType: "",
                  quantity: "",
                  amount: "",
                  nozzle: "",
                });
                setFormErrors({});
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowAddModal(false);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toTimeString().slice(0, 5),
                    oilType: "",
                    quantity: "",
                    amount: "",
                    nozzle: "",
                  });
                  setFormErrors({});
                }
              }}
              role="button"
              tabIndex={0}
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
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                role="none"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <Plus className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">เพิ่มข้อมูลการขาย</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">กรอกข้อมูลการขายน้ำมันใหม่</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        date: new Date().toISOString().split('T')[0],
                        time: new Date().toTimeString().slice(0, 5),
                        oilType: "",
                        quantity: "",
                        amount: "",
                        nozzle: "",
                      });
                      setFormErrors({});
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    <div>
                      <label htmlFor="sales-date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        วันที่ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="sales-date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => {
                            setFormData({ ...formData, date: e.target.value });
                            if (formErrors.date) setFormErrors({ ...formErrors, date: "" });
                          }}
                          className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all ${formErrors.date ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-700"
                            }`}
                        />
                      </div>
                      {formErrors.date && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.date}</p>
                      )}
                    </div>

                    {/* Time */}
                    <div>
                      <label htmlFor="sales-time" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        เวลา <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="sales-time"
                          type="time"
                          value={formData.time}
                          onChange={(e) => {
                            setFormData({ ...formData, time: e.target.value });
                            if (formErrors.time) setFormErrors({ ...formErrors, time: "" });
                          }}
                          className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all ${formErrors.time ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-700"
                            }`}
                        />
                      </div>
                      {formErrors.time && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.time}</p>
                      )}
                    </div>

                    {/* Oil Type */}
                    <div>
                      <label htmlFor="sales-oil-type" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ประเภทน้ำมัน <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="sales-oil-type"
                        value={formData.oilType}
                        onChange={(e) => {
                          setFormData({ ...formData, oilType: e.target.value });
                          if (formErrors.oilType) setFormErrors({ ...formErrors, oilType: "" });
                        }}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all ${formErrors.oilType ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-700"
                          }`}
                      >
                        <option value="">เลือกประเภทน้ำมัน</option>
                        <option value="Premium Diesel">Premium Diesel</option>
                        <option value="Premium Gasohol 95">Premium Gasohol 95</option>
                        <option value="Diesel">Diesel</option>
                        <option value="E85">E85</option>
                        <option value="E20">E20</option>
                        <option value="Gasohol 91">Gasohol 91</option>
                        <option value="Gasohol 95">Gasohol 95</option>
                      </select>
                      {formErrors.oilType && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.oilType}</p>
                      )}
                    </div>

                    {/* Nozzle */}
                    <div>
                      <label htmlFor="sales-nozzle" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        หัวจ่าย <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="sales-nozzle"
                        value={formData.nozzle}
                        onChange={(e) => {
                          setFormData({ ...formData, nozzle: e.target.value });
                          if (formErrors.nozzle) setFormErrors({ ...formErrors, nozzle: "" });
                        }}
                        className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all ${formErrors.nozzle ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-700"
                          }`}
                      >
                        <option value="">เลือกหัวจ่าย</option>
                        <option value="P18">P18</option>
                        <option value="P26">P26</option>
                        <option value="P34">P34</option>
                        <option value="P42">P42</option>
                        <option value="P59">P59</option>
                        <option value="P67">P67</option>
                        <option value="P75">P75</option>
                        <option value="P83">P83</option>
                        <option value="P91">P91</option>
                        <option value="P99">P99</option>
                      </select>
                      {formErrors.nozzle && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.nozzle}</p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div>
                      <label htmlFor="sales-quantity" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        จำนวน (ลิตร) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="sales-quantity"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.quantity}
                          onChange={(e) => {
                            setFormData({ ...formData, quantity: e.target.value });
                            if (formErrors.quantity) setFormErrors({ ...formErrors, quantity: "" });
                          }}
                          placeholder="0.00"
                          className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all ${formErrors.quantity ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-700"
                            }`}
                        />
                      </div>
                      {formErrors.quantity && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.quantity}</p>
                      )}
                    </div>

                    {/* Amount */}
                    <div>
                      <label htmlFor="sales-amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ยอดเงิน (บาท) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="sales-amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.amount}
                          onChange={(e) => {
                            setFormData({ ...formData, amount: e.target.value });
                            if (formErrors.amount) setFormErrors({ ...formErrors, amount: "" });
                          }}
                          placeholder="0.00"
                          className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all ${formErrors.amount ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-700"
                            }`}
                        />
                      </div>
                      {formErrors.amount && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.amount}</p>
                      )}
                    </div>

                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setFormData({
                          date: new Date().toISOString().split('T')[0],
                          time: new Date().toTimeString().slice(0, 5),
                          oilType: "",
                          quantity: "",
                          amount: "",
                          nozzle: "",
                        });
                        setFormErrors({});
                      }}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={async () => {
                        // Validate form
                        const errors: Record<string, string> = {};

                        if (!formData.date) errors.date = "กรุณาเลือกวันที่";
                        if (!formData.time) errors.time = "กรุณาเลือกเวลา";
                        if (!formData.oilType) errors.oilType = "กรุณาเลือกประเภทน้ำมัน";
                        if (!formData.nozzle) errors.nozzle = "กรุณาเลือกหัวจ่าย";
                        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
                          errors.quantity = "กรุณากรอกจำนวนลิตรที่ถูกต้อง";
                        }
                        if (!formData.amount || parseFloat(formData.amount) <= 0) {
                          errors.amount = "กรุณากรอกยอดเงินที่ถูกต้อง";
                        }

                        if (Object.keys(errors).length > 0) {
                          setFormErrors(errors);
                          return;
                        }

                        setIsSubmitting(true);

                        try {
                          // Simulate API call
                          await new Promise((resolve) => setTimeout(resolve, 1000));

                          // Success
                          setShowAddModal(false);
                          setFormData({
                            date: new Date().toISOString().split('T')[0],
                            time: new Date().toTimeString().slice(0, 5),
                            oilType: "",
                            quantity: "",
                            amount: "",
                            nozzle: "",
                          });
                          setFormErrors({});
                          alert("บันทึกข้อมูลการขายสำเร็จ");
                          // ในอนาคตจะ refresh ข้อมูลในตาราง
                        } catch {
                          alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                      <span>{isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
