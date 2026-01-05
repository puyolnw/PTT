import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Truck,
  Search,
  Building2,
  DollarSign,
  AlertTriangle,
  X,
  Save,
  TrendingUp,
  FileText,
  User,
  MapPin,
  Droplet,
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import type { DeliveryNote, Receipt, OilType } from "@/types/gasStation";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// const dateFormatter = new Intl.DateTimeFormat("th-TH", {
//   year: "numeric",
//   month: "short",
//   day: "numeric",
// });

// ราคาต่อลิตรของแต่ละชนิดน้ำมัน - ไม่ได้ใช้
// const oilPrices: Record<OilType, number> = {
//   "Premium Diesel": 33.49,
//   "Premium Gasohol 95": 41.49,
//   "Diesel": 32.49,
//   "E85": 28.99,
//   "E20": 35.99,
//   "Gasohol 91": 38.99,
//   "Gasohol 95": 40.99,
//   "Gasohol E20": 35.99,
// };

// Interface สำหรับน้ำมันที่เหลือบนรถ (ดึงจาก Transport Orders)
interface TruckOilItem {
  id: string;
  transportNo: string;
  transportType: "internal" | "external"; // ภายในปั๊ม หรือ รับจาก PTT
  fromBranchId: number;
  fromBranchName: string;
  oilType: OilType;
  quantityOnTruck: number; // จำนวนที่เหลือบนรถ (ลิตร)
  originalQuantity: number; // จำนวนเดิมทั้งหมด
  orderNo: string; // Internal Order No หรือ Purchase Order No
  orderDate: string;
  truckPlateNumber: string;
  trailerPlateNumber?: string;
  driverName: string;
  daysOnTruck: number;
  status: "available" | "sold" | "partial";
  pricePerLiter: number;
}

// Mock data - น้ำมันที่เหลือบนรถ (ในระบบจริงจะดึงจาก InternalTransport และ TruckOrders)
// สมมติว่ามี transport orders ที่ยังไม่ส่งเสร็จ
const generateTruckOilItems = (): TruckOilItem[] => {
  // const today = new Date();
  const items: TruckOilItem[] = [];

  // ตัวอย่างข้อมูลจาก Internal Transport
  items.push({
    id: "TRUCK-INT-001",
    transportNo: "IT-20241215-001",
    transportType: "internal",
    fromBranchId: 1,
    fromBranchName: "ปั๊มไฮโซ",
    oilType: "Premium Diesel",
    quantityOnTruck: 5000,
    originalQuantity: 10000,
    orderNo: "IO-20241215-002",
    orderDate: "2024-12-15",
    truckPlateNumber: "กก 1111",
    trailerPlateNumber: "กข 1234",
    driverName: "สมศักดิ์ ขับรถ",
    daysOnTruck: 1,
    status: "available",
    pricePerLiter: 33.49,
  });

  items.push({
    id: "TRUCK-INT-002",
    transportNo: "IT-20241215-001",
    transportType: "internal",
    fromBranchId: 1,
    fromBranchName: "ปั๊มไฮโซ",
    oilType: "Gasohol 95",
    quantityOnTruck: 3000,
    originalQuantity: 5000,
    orderNo: "IO-20241215-002",
    orderDate: "2024-12-15",
    truckPlateNumber: "กก 1111",
    trailerPlateNumber: "กข 1234",
    driverName: "สมศักดิ์ ขับรถ",
    daysOnTruck: 1,
    status: "available",
    pricePerLiter: 40.99,
  });

  // ตัวอย่างข้อมูลจาก External Transport (PTT)
  items.push({
    id: "TRUCK-EXT-001",
    transportNo: "TP-20241214-002",
    transportType: "external",
    fromBranchId: 1,
    fromBranchName: "ปั๊มไฮโซ",
    oilType: "Diesel",
    quantityOnTruck: 8000,
    originalQuantity: 20000,
    orderNo: "SO-20241214-002",
    orderDate: "2024-12-14",
    truckPlateNumber: "กก 2222",
    trailerPlateNumber: "กข 5678",
    driverName: "วิชัย รักงาน",
    daysOnTruck: 2,
    status: "available",
    pricePerLiter: 32.49,
  });

  return items;
};

export default function TruckSales() {
  const {
    branches,
    // deliveryNotes,
    // receipts,
    createDeliveryNote,
    createReceipt,
    getNextRunningNumber,
    incrementRunningNumber,
    getBranchById,
  } = useGasStation();

  const [truckItems, setTruckItems] = useState<TruckOilItem[]>(generateTruckOilItems());
  const [filterBranch, setFilterBranch] = useState<number | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [filterTransportType, setFilterTransportType] = useState<"all" | "internal" | "external">("all");
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TruckOilItem | null>(null);
  const [saleQuantity, setSaleQuantity] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleToBranch, setSaleToBranch] = useState<number | "">("");

  // Helper function to check if date is in range
  const isDateInRange = (dateStr: string, from: string, to: string) => {
    if (!from && !to) return true;
    const date = new Date(dateStr);
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    if (fromDate && toDate) {
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      return date >= fromDate && date <= toDate;
    } else if (fromDate) {
      fromDate.setHours(0, 0, 0, 0);
      return date >= fromDate;
    } else if (toDate) {
      toDate.setHours(23, 59, 59, 999);
      return date <= toDate;
    }
    return true;
  };

  // กรองข้อมูล
  const filteredItems = useMemo(() => {
    return truckItems.filter((item) => {
      const matchesBranch = filterBranch === "all" || item.fromBranchId === filterBranch;
      const matchesSearch =
        item.oilType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.transportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.truckPlateNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = isDateInRange(item.orderDate, filterDateFrom, filterDateTo);
      const matchesTransportType = filterTransportType === "all" || item.transportType === filterTransportType;
      return matchesBranch && matchesSearch && matchesDate && matchesTransportType;
    });
  }, [truckItems, filterBranch, searchTerm, filterDateFrom, filterDateTo, filterTransportType]);

  // คำนวณสรุปข้อมูล
  const summary = useMemo(() => {
    const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantityOnTruck, 0);
    const totalValue = filteredItems.reduce(
      (sum, item) => sum + item.quantityOnTruck * item.pricePerLiter,
      0
    );
    const totalBranches = new Set(filteredItems.map((item) => item.fromBranchId)).size;
    const totalItems = filteredItems.length;

    return {
      totalQuantity,
      totalValue,
      totalBranches,
      totalItems,
    };
  }, [filteredItems]);

  const handleOpenSaleModal = (item: TruckOilItem) => {
    setSelectedItem(item);
    setSaleQuantity("");
    setSalePrice(item.pricePerLiter.toString());
    setSaleToBranch("");
    setShowSaleModal(true);
  };

  // คำนวณ VAT
  const calculateVAT = (amount: number, vatRate: number = 7) => {
    const beforeVat = amount / (1 + vatRate / 100);
    const vat = amount - beforeVat;
    return {
      beforeVat: Math.round(beforeVat * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      total: amount,
    };
  };


  const handleSale = () => {
    if (!selectedItem || !saleQuantity || !salePrice || !saleToBranch) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const quantity = parseFloat(saleQuantity);
    const price = parseFloat(salePrice);

    if (isNaN(quantity) || quantity <= 0) {
      alert("กรุณากรอกจำนวนที่ถูกต้อง");
      return;
    }

    if (isNaN(price) || price <= 0) {
      alert("กรุณากรอกราคาที่ถูกต้อง");
      return;
    }

    if (quantity > selectedItem.quantityOnTruck) {
      alert(`จำนวนที่ขายเกินน้ำมันที่มีบนรถ (เหลืออยู่: ${selectedItem.quantityOnTruck} ลิตร)`);
      return;
    }

    const toBranch = getBranchById(saleToBranch);
    if (!toBranch) {
      alert("ไม่พบข้อมูลสาขาที่เลือก");
      return;
    }

    const totalAmount = quantity * price;
    const { beforeVat, vat } = calculateVAT(totalAmount, 7);

    // สร้าง Delivery Note (ใบส่งของ)
    const deliveryNoteNo = getNextRunningNumber("delivery-note");
    incrementRunningNumber("delivery-note");

    const newDeliveryNote: DeliveryNote = {
      id: `DN-${Date.now()}`,
      deliveryNoteNo,
      deliveryDate: new Date().toISOString().split("T")[0],
      fromBranchId: selectedItem.fromBranchId,
      fromBranchName: selectedItem.fromBranchName,
      toBranchId: saleToBranch,
      toBranchName: toBranch.name,
      items: [
        {
          id: `item-${Date.now()}`,
          oilType: selectedItem.oilType,
          quantity: quantity,
          pricePerLiter: price,
          totalAmount: totalAmount,
        },
      ],
      totalAmount: totalAmount,
      truckPlateNumber: selectedItem.truckPlateNumber,
      driverName: selectedItem.driverName,
      status: "sent",
      createdAt: new Date().toISOString(),
      createdBy: "ระบบ",
    };

    createDeliveryNote(newDeliveryNote);

    // สร้าง Receipt (ใบรับของ/ใบเสร็จ)
    const receiptNo = getNextRunningNumber("receipt");
    incrementRunningNumber("receipt");

    const newReceipt: Receipt = {
      id: `REC-${Date.now()}`,
      receiptNo,
      receiptDate: new Date().toISOString().split("T")[0],
      deliveryNoteNo,
      customerName: toBranch.name,
      customerAddress: toBranch.address,
      customerTaxId: "",
      items: [
        {
          id: `item-${Date.now()}`,
          oilType: selectedItem.oilType,
          quantity: quantity,
          pricePerLiter: price,
          totalAmount: totalAmount,
        },
      ],
      totalAmount: beforeVat,
      vatAmount: vat,
      grandTotal: totalAmount,
      documentType: "ใบเสร็จรับเงิน",
      status: "issued",
      issuedAt: new Date().toISOString(),
      issuedBy: "ระบบ",
      createdAt: new Date().toISOString(),
      createdBy: "ระบบ",
    };

    createReceipt(newReceipt);

    // อัพเดตจำนวนน้ำมันที่เหลือบนรถ
    const newQuantity = selectedItem.quantityOnTruck - quantity;
    setTruckItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
            ...item,
            quantityOnTruck: newQuantity,
            status: newQuantity === 0 ? "sold" : "partial",
          }
          : item
      )
    );

    alert(
      `บันทึกการขายสำเร็จ!\n\nใบส่งของ: ${deliveryNoteNo}\nใบเสร็จ: ${receiptNo}\n\nสาขาที่ขาย: ${selectedItem.fromBranchName}\nขายให้สาขา: ${toBranch.name}\nประเภทน้ำมัน: ${selectedItem.oilType}\nจำนวน: ${numberFormatter.format(quantity)} ลิตร\nราคาต่อลิตร: ${price.toFixed(2)} บาท\nยอดรวม: ${currencyFormatter.format(totalAmount)}`
    );

    setShowSaleModal(false);
    setSelectedItem(null);
    setSaleQuantity("");
    setSalePrice("");
    setSaleToBranch("");
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
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <Truck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">ขายน้ำมันที่เหลือบนรถ</h1>
            <p className="text-gray-600 dark:text-gray-400">
              บันทึกการขายน้ำมันที่เหลืออยู่บนรถระหว่างสาขา พร้อมออกใบส่งของและใบรับของอัตโนมัติ
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "ยอดรวมบนรถ",
            value: numberFormatter.format(summary.totalQuantity),
            subtitle: "ลิตร",
            icon: Droplet,
            iconColor: "bg-gradient-to-br from-blue-500 to-cyan-500",
            bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
            borderColor: "border-blue-200 dark:border-blue-800",
          },
          {
            title: "มูลค่ารวม",
            value: currencyFormatter.format(summary.totalValue),
            subtitle: "บาท",
            icon: DollarSign,
            iconColor: "bg-gradient-to-br from-emerald-500 to-green-500",
            bgGradient: "from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
            borderColor: "border-emerald-200 dark:border-emerald-800",
          },
          {
            title: "จำนวนสาขา",
            value: summary.totalBranches,
            subtitle: "สาขา",
            icon: Building2,
            iconColor: "bg-gradient-to-br from-purple-500 to-pink-500",
            bgGradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
            borderColor: "border-purple-200 dark:border-purple-800",
          },
          {
            title: "จำนวนรายการ",
            value: summary.totalItems,
            subtitle: "รายการ",
            icon: TrendingUp,
            iconColor: "bg-gradient-to-br from-indigo-500 to-purple-500",
            bgGradient: "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20",
            borderColor: "border-indigo-200 dark:border-indigo-800",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group`}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-14 h-14 ${stat.iconColor} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h6 className="text-gray-600 dark:text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wide">
                  {stat.title}
                </h6>
                <h6 className="text-gray-800 dark:text-white text-3xl font-extrabold mb-1">{stat.value}</h6>
                <p className="text-gray-500 dark:text-gray-500 text-xs">{stat.subtitle}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-6"
      >
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <label htmlFor="truck-sales-search" className="sr-only">ค้นหา</label>
            <input
              id="truck-sales-search"
              type="text"
              placeholder="ค้นหาประเภทน้ำมัน, สาขา, เลขที่ใบสั่งซื้อ, เลขขนส่ง, ทะเบียนรถ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
            />
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label htmlFor="truck-sales-filter-branch" className="sr-only">สาขา</label>
            <select
              id="truck-sales-filter-branch"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
            >
              <option value="all">ทุกสาขา</option>
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

            <label htmlFor="truck-sales-filter-transport" className="sr-only">ประเภทการขนส่ง</label>
            <select
              id="truck-sales-filter-transport"
              value={filterTransportType}
              onChange={(e) =>
                setFilterTransportType(e.target.value as "all" | "internal" | "external")
              }
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
            >
              <option value="all">ทุกประเภท</option>
              <option value="internal">ส่งภายในปั๊ม</option>
              <option value="external">รับจากปั๊ม PTT ใหญ่</option>
            </select>

            <div className="flex items-center gap-2">
              <label htmlFor="truck-sales-filter-date-from" className="sr-only">วันที่เริ่มต้น</label>
              <input
                id="truck-sales-filter-date-from"
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
                title="วันที่เริ่มต้น"
              />
              <span className="text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">ถึง</span>
              <label htmlFor="truck-sales-filter-date-to" className="sr-only">วันที่สิ้นสุด</label>
              <input
                id="truck-sales-filter-date-to"
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
                title="วันที่สิ้นสุด"
              />
            </div>

            {(filterDateFrom || filterDateTo || searchTerm || filterBranch !== "all" || filterTransportType !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterBranch("all");
                  setFilterDateFrom("");
                  setFilterDateTo("");
                  setFilterTransportType("all");
                }}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500" />
                รายการน้ำมันที่เหลือบนรถ
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                น้ำมันที่ยังไม่ได้ลงที่สาขาและสามารถขายให้สาขาอื่นได้
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    สาขา
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4" />
                    ประเภทน้ำมัน
                  </div>
                </th>
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  เหลือบนรถ (ลิตร)
                </th>
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  ราคาต่อลิตร
                </th>
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  มูลค่า
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    เลขขนส่ง
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    ทะเบียนรถ
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    คนขับ
                  </div>
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  ค้าง (วัน)
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center">
                    <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">ไม่พบข้อมูลน้ำมันที่เหลือบนรถ</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const totalValue = item.quantityOnTruck * item.pricePerLiter;
                  const isOverdue = item.daysOnTruck > 3;

                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-red-50/50 dark:hover:from-orange-900/10 dark:hover:to-red-900/10 transition-all duration-200 ${isOverdue ? "bg-red-50/30 dark:bg-red-900/10 border-l-4 border-l-red-500" : ""
                        }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-800 dark:text-white block">
                              {item.fromBranchName}
                            </span>
                            <span
                              className={`text-xs ${item.transportType === "internal"
                                  ? "text-purple-600 dark:text-purple-400"
                                  : "text-blue-600 dark:text-blue-400"
                                }`}
                            >
                              {item.transportType === "internal" ? "ส่งภายในปั๊ม" : "รับจาก PTT"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Droplet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-800 dark:text-white">{item.oilType}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <span className="font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-lg">
                          {numberFormatter.format(item.quantityOnTruck)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {item.pricePerLiter.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {currencyFormatter.format(totalValue)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{item.transportNo}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{item.truckPlateNumber}</span>
                          {item.trailerPlateNumber && (
                            <span className="text-gray-500 dark:text-gray-400">/ {item.trailerPlateNumber}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{item.driverName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className={`font-semibold ${isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"
                              }`}
                          >
                            {item.daysOnTruck} วัน
                          </span>
                          {isOverdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${item.status === "sold"
                              ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                              : item.status === "partial"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                            }`}
                        >
                          {item.status === "sold" ? "ขายหมดแล้ว" : item.status === "partial" ? "ขายบางส่วน" : "พร้อมขาย"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenSaleModal(item)}
                            disabled={item.status === "sold"}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                          >
                            <DollarSign className="w-4 h-4" />
                            ขาย
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Sale Modal */}
      <AnimatePresence>
        {showSaleModal && selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaleModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">ขายน้ำมันบนรถ</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedItem.fromBranchName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSaleModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">สาขาที่ขาย:</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                          {selectedItem.fromBranchName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ประเภทน้ำมัน:</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{selectedItem.oilType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">เหลือบนรถ:</span>
                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                          {numberFormatter.format(selectedItem.quantityOnTruck)} ลิตร
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ราคาต่อลิตร:</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                          {selectedItem.pricePerLiter.toFixed(2)} บาท
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">เลขขนส่ง:</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                          {selectedItem.transportNo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="truck-sales-to-branch" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        ขายให้สาขา *
                      </div>
                    </label>
                    <select
                      id="truck-sales-to-branch"
                      value={saleToBranch}
                      onChange={(e) => setSaleToBranch(e.target.value === "" ? "" : parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                    >
                      <option value="">เลือกสาขา</option>
                      {branches
                        .filter((b) => b.id !== selectedItem.fromBranchId)
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
                  </div>

                  <div>
                    <label htmlFor="truck-sales-quantity" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-blue-500" />
                        จำนวนที่ขาย (ลิตร) *
                      </div>
                    </label>
                    <input
                      id="truck-sales-quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      max={selectedItem.quantityOnTruck}
                      value={saleQuantity}
                      onChange={(e) => setSaleQuantity(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="truck-sales-price" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        ราคาต่อลิตร (บาท) *
                      </div>
                    </label>
                    <input
                      id="truck-sales-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                    />
                  </div>

                  {saleQuantity && salePrice && parseFloat(saleQuantity) > 0 && parseFloat(salePrice) > 0 && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">ยอดรวม:</span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {currencyFormatter.format(parseFloat(saleQuantity) * parseFloat(salePrice))}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>หมายเหตุ:</strong> ระบบจะสร้างใบส่งของและใบรับของอัตโนมัติเมื่อบันทึกการขาย
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={() => setShowSaleModal(false)}
                      className="flex-1 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleSale}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      บันทึกการขาย
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
