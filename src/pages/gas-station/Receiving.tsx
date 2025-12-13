import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  FileText,
  Package,
  Truck,
  Clock,
  CheckCircle,
  Droplet,
  Calendar,
  User,
  AlertTriangle,
  Save,
  MapPin,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Mock data - รายการที่รอรับ (จากใบสั่งซื้อที่อนุมัติแล้ว)
const mockPendingOrders = [
  {
    orderNo: "SO-20241215-001",
    supplierOrderNo: "PTT-20241215-001",
    deliveryDate: "2024-12-16",
    branch: "ปั๊มไฮโซ",
    branchId: 1,
    items: [
      { oilType: "Premium Diesel", quantityOrdered: 25000 },
      { oilType: "Gasohol 95", quantityOrdered: 20000 },
    ],
    driverName: "",
    truckLicensePlate: "",
    status: "รอรับ",
  },
  {
    orderNo: "SO-20241215-002",
    supplierOrderNo: "PTT-20241215-002",
    deliveryDate: "2024-12-16",
    branch: "สาขา 2",
    branchId: 2,
    items: [
      { oilType: "Diesel", quantityOrdered: 30000 },
    ],
    driverName: "",
    truckLicensePlate: "",
    status: "รอรับ",
  },
];

// Mock data - รายการที่รับแล้ว
const mockReceivings = [
  {
    id: "RC-20241215-001",
    orderNo: "SO-20241214-001",
    supplierOrderNo: "PTT-20241214-001",
    deliveryNoteNo: "DN-20241215-001",
    branch: "ปั๊มไฮโซ",
    receiveDate: "2024-12-15",
    receiveTime: "14:30",
    items: [
      {
        oilType: "Premium Diesel",
        quantityOrdered: 20000,
        quantityReceived: 19950,
        difference: -50,
        differencePercent: -0.25,
        apiCheck: 35.2,
      },
    ],
    driverName: "สมชาย ใจดี",
    truckLicensePlate: "กก-1234",
    receiverEmployee: "พนักงาน A",
    status: "รับแล้ว",
  },
  {
    id: "RC-20241215-002",
    orderNo: "SO-20241214-002",
    supplierOrderNo: "PTT-20241214-002",
    deliveryNoteNo: "DN-20241215-002",
    branch: "สาขา 2",
    receiveDate: "2024-12-15",
    receiveTime: "15:45",
    items: [
      {
        oilType: "Gasohol 95",
        quantityOrdered: 15000,
        quantityReceived: 15020,
        difference: 20,
        differencePercent: 0.13,
        apiCheck: 52.5,
      },
    ],
    driverName: "สมหญิง รักดี",
    truckLicensePlate: "ขข-5678",
    receiverEmployee: "พนักงาน B",
    status: "รับแล้ว",
  },
];

type ReceivingItem = {
  oilType: string;
  quantityOrdered: number;
  quantityReceived: number;
  difference: number;
  differencePercent: number;
  actualUnitPrice: number; // NEW: ราคาต่อหน่วยจริงจากใบกำกับ
  totalAmount: number; // NEW: quantityReceived * actualUnitPrice
  apiCheck?: number;
};

type ReceivingForm = {
  orderNo: string;
  supplierOrderNo: string;
  deliveryNoteNo: string;
  taxInvoiceNo: string; // NEW: Required - เลขที่ใบกำกับภาษี
  taxInvoiceDate: string; // NEW: Required - วันที่ใบกำกับภาษี
  branch: string;
  branchId: number;
  items: ReceivingItem[];
  driverName: string;
  truckLicensePlate: string;
  receiverEmployee: string;
  receiveDate: string;
  receiveTime: string;
};

export default function Receiving() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ทั้งหมด");
  const [showReceivingForm, setShowReceivingForm] = useState(false);
  const [receivingForm, setReceivingForm] = useState<ReceivingForm | null>(null);
  const [receivings, setReceivings] = useState(mockReceivings);

  // เริ่มรับน้ำมันใหม่
  const startReceiving = (order: typeof mockPendingOrders[0]) => {
    const now = new Date();
    const form: ReceivingForm = {
      orderNo: order.orderNo,
      supplierOrderNo: order.supplierOrderNo,
      deliveryNoteNo: `DN-${now.toISOString().split("T")[0].replace(/-/g, "")}-${String(receivings.length + 1).padStart(3, "0")}`,
      taxInvoiceNo: "", // NEW: Required field
      taxInvoiceDate: now.toISOString().split("T")[0], // NEW: Default to today
      branch: order.branch,
      branchId: order.branchId,
      items: order.items.map((item) => ({
        oilType: item.oilType,
        quantityOrdered: item.quantityOrdered,
        quantityReceived: item.quantityOrdered, // เริ่มต้นด้วยจำนวนที่สั่ง
        difference: 0,
        differencePercent: 0,
        actualUnitPrice: 30, // NEW: Default price (should be from config)
        totalAmount: item.quantityOrdered * 30, // NEW
      })),
      driverName: order.driverName || "",
      truckLicensePlate: order.truckLicensePlate || "",
      receiverEmployee: "พนักงาน A", // ในระบบจริงจะดึงจาก session
      receiveDate: now.toISOString().split("T")[0],
      receiveTime: now.toTimeString().slice(0, 5),
    };
    setReceivingForm(form);
    setShowReceivingForm(true);
  };

  // อัพเดทจำนวนที่รับ
  const updateQuantityReceived = (oilType: string, quantity: number) => {
    if (!receivingForm) return;

    const updatedItems = receivingForm.items.map((item) => {
      if (item.oilType === oilType) {
        const difference = quantity - item.quantityOrdered;
        const differencePercent = (difference / item.quantityOrdered) * 100;
        const totalAmount = quantity * item.actualUnitPrice; // NEW: Calculate total
        return {
          ...item,
          quantityReceived: quantity,
          difference,
          differencePercent,
          totalAmount, // NEW
        };
      }
      return item;
    });

    setReceivingForm({
      ...receivingForm,
      items: updatedItems,
    });
  };

  // บันทึกการรับน้ำมัน
  const saveReceiving = () => {
    if (!receivingForm) return;

    // Validate
    if (!receivingForm.driverName || !receivingForm.truckLicensePlate) {
      alert("กรุณากรอกชื่อคนขับและทะเบียนรถ");
      return;
    }

    // NEW: Validate tax invoice (CRITICAL - Required for VAT claim)
    if (!receivingForm.taxInvoiceNo || receivingForm.taxInvoiceNo.trim() === "") {
      alert("⚠️ กรุณากรอกเลขที่ใบกำกับภาษี\n\nเลขที่ใบกำกับภาษีเป็นข้อมูลที่จำเป็นสำหรับการเคลมภาษีซื้อ (Input VAT)");
      return;
    }

    if (!receivingForm.taxInvoiceDate) {
      alert("กรุณาระบุวันที่ใบกำกับภาษี");
      return;
    }

    const newReceiving = {
      id: `RC-${receivingForm.receiveDate.replace(/-/g, "")}-${String(receivings.length + 1).padStart(3, "0")}`,
      orderNo: receivingForm.orderNo,
      supplierOrderNo: receivingForm.supplierOrderNo,
      deliveryNoteNo: receivingForm.deliveryNoteNo,
      branch: receivingForm.branch,
      receiveDate: receivingForm.receiveDate,
      receiveTime: receivingForm.receiveTime,
      items: receivingForm.items.map(item => ({
        ...item,
        apiCheck: item.apiCheck || 0,
      })),
      driverName: receivingForm.driverName,
      truckLicensePlate: receivingForm.truckLicensePlate,
      receiverEmployee: receivingForm.receiverEmployee,
      status: "รับแล้ว",
    };

    setReceivings([newReceiving, ...receivings]);
    setShowReceivingForm(false);
    setReceivingForm(null);
    alert("บันทึกการรับน้ำมันสำเร็จ!");
  };

  const filteredReceivings = receivings.filter((receiving) => {
    const matchesSearch =
      receiving.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receiving.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receiving.deliveryNoteNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receiving.branch.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "ทั้งหมด" || receiving.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getDifferenceColor = (percent: number) => {
    if (Math.abs(percent) <= 0.3) return "text-emerald-500";
    if (Math.abs(percent) <= 1.0) return "text-orange-500";
    return "text-red-500";
  };

  const totalReceivedToday = receivings
    .filter((r) => r.receiveDate === new Date().toISOString().split("T")[0])
    .reduce((sum, r) => sum + r.items.reduce((s, i) => s + i.quantityReceived, 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                การรับน้ำมัน
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                บันทึกการรับน้ำมันจากรถขนส่ง ปตท. ลงหลุม
              </p>
            </div>
            <button
              onClick={() => setShowReceivingForm(!showReceivingForm)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {showReceivingForm ? "ปิดฟอร์ม" : "เริ่มรับน้ำมันใหม่"}
            </button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              title: "รับน้ำมันวันนี้",
              value: numberFormatter.format(totalReceivedToday),
              subtitle: "ลิตร",
              icon: Package,
              iconColor: "bg-gradient-to-br from-blue-500 to-blue-600",
            },
            {
              title: "จำนวนเที่ยว",
              value: receivings.filter(
                (r) => r.receiveDate === new Date().toISOString().split("T")[0]
              ).length,
              subtitle: "เที่ยว",
              icon: Truck,
              iconColor: "bg-gradient-to-br from-green-500 to-green-600",
            },
            {
              title: "รอรับ",
              value: mockPendingOrders.length,
              subtitle: "รายการ",
              icon: Clock,
              iconColor: "bg-gradient-to-br from-orange-500 to-orange-600",
            },
            {
              title: "ส่วนต่างเฉลี่ย",
              value:
                receivings.length > 0
                  ? (
                    receivings.reduce(
                      (sum, r) =>
                        sum +
                        r.items.reduce((s, i) => s + Math.abs(i.differencePercent), 0) /
                        r.items.length,
                      0
                    ) / receivings.length
                  ).toFixed(2)
                  : "0.00",
              subtitle: "%",
              icon: CheckCircle,
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
                  <div
                    className={`w-16 h-16 ${stat.iconColor} rounded-lg flex items-center justify-center shadow-lg mr-4`}
                  >
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h6 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">
                      {stat.title}
                    </h6>
                    <h6 className="text-gray-800 dark:text-white text-2xl font-extrabold mb-0">
                      {stat.value}
                    </h6>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pending Orders - รายการที่รอรับ */}
        {mockPendingOrders.length > 0 && !showReceivingForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                รายการที่รอรับ
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                เลือกรายการเพื่อเริ่มบันทึกการรับน้ำมัน
              </p>
            </div>
            <div className="p-6 space-y-4">
              {mockPendingOrders.map((order, index) => (
                <motion.div
                  key={order.orderNo}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-white">
                            {order.orderNo}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.supplierOrderNo}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                          <Clock className="w-3.5 h-3.5" />
                          รอรับ
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">สาขา: </span>
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {order.branch}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">วันที่ส่ง: </span>
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {new Date(order.deliveryDate).toLocaleDateString("th-TH")}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          รายการน้ำมัน:
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <Droplet className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-gray-800 dark:text-white">
                                  {item.oilType}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                {numberFormatter.format(item.quantityOrdered)} ลิตร
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => startReceiving(order)}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      เริ่มรับน้ำมัน
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Receiving Form */}
        <AnimatePresence>
          {showReceivingForm && receivingForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  บันทึกการรับน้ำมัน
                </h2>

                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">เลขที่ใบสั่งซื้อ</div>
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {receivingForm.orderNo}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">เลขที่ออเดอร์ ปตท.</div>
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {receivingForm.supplierOrderNo}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">สาขา</div>
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {receivingForm.branch}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">เลขที่ใบส่งของ</div>
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {receivingForm.deliveryNoteNo}
                    </div>
                  </div>
                </div>

                {/* Tax Invoice Info - CRITICAL REQUIRED FIELDS */}
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
                      ข้อมูลใบกำกับภาษี (Required)
                    </h3>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    ⚠️ เลขที่ใบกำกับภาษีเป็นข้อมูลที่จำเป็นสำหรับการเคลมภาษีซื้อ (Input VAT) ห้ามเว้นว่าง
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                        เลขที่ใบกำกับภาษี *
                      </label>
                      <input
                        type="text"
                        value={receivingForm.taxInvoiceNo}
                        onChange={(e) =>
                          setReceivingForm({
                            ...receivingForm,
                            taxInvoiceNo: e.target.value,
                          })
                        }
                        placeholder="กรอกเลขที่ใบกำกับภาษี (เช่น TAX-2024-001)"
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-gray-800 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                        วันที่ใบกำกับภาษี *
                      </label>
                      <input
                        type="date"
                        value={receivingForm.taxInvoiceDate}
                        onChange={(e) =>
                          setReceivingForm({
                            ...receivingForm,
                            taxInvoiceDate: e.target.value,
                          })
                        }
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 text-gray-800 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Driver & Truck Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ชื่อคนขับ *
                    </label>
                    <input
                      type="text"
                      value={receivingForm.driverName}
                      onChange={(e) =>
                        setReceivingForm({
                          ...receivingForm,
                          driverName: e.target.value,
                        })
                      }
                      placeholder="กรอกชื่อคนขับ"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ทะเบียนรถ *
                    </label>
                    <input
                      type="text"
                      value={receivingForm.truckLicensePlate}
                      onChange={(e) =>
                        setReceivingForm({
                          ...receivingForm,
                          truckLicensePlate: e.target.value,
                        })
                      }
                      placeholder="กรอกทะเบียนรถ"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Oil Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    รายการน้ำมันที่รับ
                  </h3>
                  {receivingForm.items.map((item, index) => {
                    const isWithinTolerance = Math.abs(item.differencePercent) <= 0.3;
                    const isWarning = Math.abs(item.differencePercent) > 0.3 && Math.abs(item.differencePercent) <= 1.0;
                    const isError = Math.abs(item.differencePercent) > 1.0;

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border-2 ${isError
                          ? "bg-red-50/50 dark:bg-red-900/10 border-red-300 dark:border-red-800"
                          : isWarning
                            ? "bg-orange-50/50 dark:bg-orange-900/10 border-orange-300 dark:border-orange-800"
                            : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                          }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Droplet className="w-5 h-5 text-blue-500" />
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {item.oilType}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                              จำนวนที่สั่ง
                            </label>
                            <div className="font-semibold text-gray-800 dark:text-white">
                              {numberFormatter.format(item.quantityOrdered)} ลิตร
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                              จำนวนที่รับจริง (ลิตร) *
                            </label>
                            <input
                              type="number"
                              value={item.quantityReceived}
                              onChange={(e) =>
                                updateQuantityReceived(
                                  item.oilType,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white ${isError
                                ? "border-red-300 dark:border-red-700"
                                : isWarning
                                  ? "border-orange-300 dark:border-orange-700"
                                  : "border-gray-200 dark:border-gray-700"
                                }`}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                              ส่วนต่าง
                            </label>
                            <div className={`font-semibold ${getDifferenceColor(item.differencePercent)}`}>
                              {item.difference > 0 ? "+" : ""}
                              {numberFormatter.format(item.difference)} ลิตร
                              <span className="text-xs ml-1">
                                ({item.differencePercent > 0 ? "+" : ""}
                                {item.differencePercent.toFixed(2)}%)
                              </span>
                            </div>
                            {isError && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-red-600 dark:text-red-400">
                                <AlertTriangle className="w-3 h-3" />
                                เกินความคลาดเคลื่อนที่ยอมรับ
                              </div>
                            )}
                            {isWarning && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-orange-600 dark:text-orange-400">
                                <AlertTriangle className="w-3 h-3" />
                                ใกล้เกินความคลาดเคลื่อน
                              </div>
                            )}
                            {isWithinTolerance && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="w-3 h-3" />
                                อยู่ในเกณฑ์ที่ยอมรับ
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowReceivingForm(false);
                      setReceivingForm(null);
                    }}
                    className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={saveReceiving}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    บันทึกการรับน้ำมัน
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-wrap items-center gap-4 mb-6"
        >
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่รับ, เลขที่ใบสั่งซื้อ, เลขที่ใบส่งของ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
            />
          </div>
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
        </motion.div>

        {/* Receivings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
              ประวัติการรับน้ำมัน
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              รายการที่รับน้ำมันแล้ว
            </p>
          </div>

          {filteredReceivings.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">ยังไม่มีรายการรับน้ำมัน</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReceivings.map((receiving, index) => (
                <motion.div
                  key={receiving.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                            {receiving.id}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {receiving.orderNo} • {receiving.deliveryNoteNo}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                          <CheckCircle className="w-3.5 h-3.5" />
                          รับแล้ว
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">สาขา: </span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {receiving.branch}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">วันที่รับ: </span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {new Date(receiving.receiveDate).toLocaleDateString("th-TH")} {receiving.receiveTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">ผู้รับ: </span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {receiving.receiverEmployee}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">คนขับ: </span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {receiving.driverName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">ทะเบียนรถ: </span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {receiving.truckLicensePlate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          รายการน้ำมัน:
                        </h4>
                        <div className="space-y-2">
                          {receiving.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Droplet className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                                    {item.oilType}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-gray-800 dark:text-white">
                                    {numberFormatter.format(item.quantityReceived)} ลิตร
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    สั่ง: {numberFormatter.format(item.quantityOrdered)} ลิตร
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  ส่วนต่าง:
                                </span>
                                <span
                                  className={`text-xs font-semibold ${getDifferenceColor(item.differencePercent)}`}
                                >
                                  {item.difference > 0 ? "+" : ""}
                                  {numberFormatter.format(item.difference)} ลิตร (
                                  {item.differencePercent > 0 ? "+" : ""}
                                  {item.differencePercent.toFixed(2)}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        title="ดูเอกสาร"
                      >
                        <FileText className="w-4 h-4 text-gray-400 hover:text-purple-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
