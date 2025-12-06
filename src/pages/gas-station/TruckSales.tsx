import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Truck,
  Search,
  Droplet,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  AlertTriangle,
  X,
  Save,
  Filter,
  Download,
  TrendingUp,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

// Mock data - สาขาทั้ง 5 แห่ง
const branches = [
  { id: 1, name: "ปั๊มไฮโซ", code: "HQ", address: "100 ถนนเพชรบุรี กรุงเทพมหานคร 10400" },
  { id: 2, name: "สาขา 2", code: "B2", address: "456 ถนนพหลโยธิน กรุงเทพมหานคร 10400" },
  { id: 3, name: "สาขา 3", code: "B3", address: "789 ถนนรัชดาภิเษก กรุงเทพมหานคร 10320" },
  { id: 4, name: "สาขา 4", code: "B4", address: "123 ถนนสุขุมวิท กรุงเทพมหานคร 10110" },
  { id: 5, name: "สาขา 5", code: "B5", address: "321 ถนนสีลม กรุงเทพมหานคร 10500" },
];

// ราคาต่อลิตรของแต่ละชนิดน้ำมัน
const oilPrices: Record<string, number> = {
  "Premium Diesel": 33.49,
  "Premium Gasohol 95": 41.49,
  "Diesel": 32.49,
  "E85": 28.99,
  "E20": 35.99,
  "Gasohol 91": 38.99,
  "Gasohol 95": 40.99,
};

// Interface สำหรับน้ำมันที่เหลือบนรถ
interface TruckOilItem {
  id: string;
  branchId: number;
  branchName: string;
  oilType: string;
  quantityOnTruck: number; // จำนวนที่เหลือบนรถ (ลิตร)
  orderNo: string;
  orderDate: string;
  expectedDeliveryDate: string;
  daysOnTruck: number;
  status: "available" | "sold" | "partial";
}

// Mock data - น้ำมันที่เหลือบนรถ
const mockTruckOilItems: TruckOilItem[] = [
  {
    id: "TRUCK-001",
    branchId: 1,
    branchName: "ปั๊มไฮโซ",
    oilType: "Premium Diesel",
    quantityOnTruck: 5000,
    orderNo: "SO-20241215-001",
    orderDate: "2024-12-15",
    expectedDeliveryDate: "2024-12-16",
    daysOnTruck: 1,
    status: "available",
  },
  {
    id: "TRUCK-002",
    branchId: 1,
    branchName: "ปั๊มไฮโซ",
    oilType: "Gasohol 95",
    quantityOnTruck: 3000,
    orderNo: "SO-20241215-001",
    orderDate: "2024-12-15",
    expectedDeliveryDate: "2024-12-16",
    daysOnTruck: 1,
    status: "available",
  },
  {
    id: "TRUCK-003",
    branchId: 2,
    branchName: "สาขา 2",
    oilType: "Diesel",
    quantityOnTruck: 8000,
    orderNo: "SO-20241214-002",
    orderDate: "2024-12-14",
    expectedDeliveryDate: "2024-12-15",
    daysOnTruck: 2,
    status: "available",
  },
  {
    id: "TRUCK-004",
    branchId: 3,
    branchName: "สาขา 3",
    oilType: "Premium Gasohol 95",
    quantityOnTruck: 4500,
    orderNo: "SO-20241213-003",
    orderDate: "2024-12-13",
    expectedDeliveryDate: "2024-12-14",
    daysOnTruck: 3,
    status: "available",
  },
  {
    id: "TRUCK-005",
    branchId: 4,
    branchName: "สาขา 4",
    oilType: "E20",
    quantityOnTruck: 2000,
    orderNo: "SO-20241212-004",
    orderDate: "2024-12-12",
    expectedDeliveryDate: "2024-12-13",
    daysOnTruck: 4,
    status: "partial",
  },
  {
    id: "TRUCK-006",
    branchId: 5,
    branchName: "สาขา 5",
    oilType: "Gasohol 91",
    quantityOnTruck: 3500,
    orderNo: "SO-20241211-005",
    orderDate: "2024-12-11",
    expectedDeliveryDate: "2024-12-12",
    daysOnTruck: 5,
    status: "available",
  },
];

export default function TruckSales() {
  const [truckItems, setTruckItems] = useState<TruckOilItem[]>(mockTruckOilItems);
  const [selectedBranch, setSelectedBranch] = useState<number | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TruckOilItem | null>(null);
  const [saleQuantity, setSaleQuantity] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleToBranch, setSaleToBranch] = useState<number | "">("");

  // กรองข้อมูลตามสาขาและ search term
  const filteredItems = useMemo(() => {
    return truckItems.filter((item) => {
      const matchesBranch = selectedBranch === "all" || item.branchId === selectedBranch;
      const matchesSearch =
        item.oilType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orderNo.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesBranch && matchesSearch;
    });
  }, [truckItems, selectedBranch, searchTerm]);

  // คำนวณสรุปข้อมูล
  const summary = useMemo(() => {
    const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantityOnTruck, 0);
    const totalValue = filteredItems.reduce(
      (sum, item) => sum + item.quantityOnTruck * (oilPrices[item.oilType] || 0),
      0
    );
    const totalBranches = new Set(filteredItems.map((item) => item.branchId)).size;
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
    setSalePrice((oilPrices[item.oilType] || 0).toString());
    setSaleToBranch("");
    setShowSaleModal(true);
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

    const newQuantity = selectedItem.quantityOnTruck - quantity;
    const totalAmount = quantity * price;
    const targetBranch = branches.find((b) => b.id === saleToBranch);

    // อัพเดตสถานะ
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
      `บันทึกการขายสำเร็จ!\n\nสาขาที่ขาย: ${selectedItem.branchName}\nขายให้สาขา: ${targetBranch?.name || "ไม่ระบุ"}\nประเภทน้ำมัน: ${selectedItem.oilType}\nจำนวน: ${numberFormatter.format(quantity)} ลิตร\nราคาต่อลิตร: ${price.toFixed(2)} บาท\nยอดรวม: ${currencyFormatter.format(totalAmount)}`
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
              บันทึกการขายน้ำมันที่เหลืออยู่บนรถของแต่ละสาขา
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
                <div className={`w-14 h-14 ${stat.iconColor} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h6 className="text-gray-600 dark:text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wide">{stat.title}</h6>
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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาประเภทน้ำมัน, สาขา, เลขที่ใบสั่งซื้อ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
            />
          </div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value === "all" ? "all" : parseInt(e.target.value))}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white transition-all duration-200"
          >
            <option value="all">ทุกสาขา</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Filter className="w-4 h-4" />
              กรอง
            </button>
            <button className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Download className="w-4 h-4" />
              Export
            </button>
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
                น้ำมันที่ยังไม่ได้ลงที่สาขาและสามารถขายได้
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
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">เหลือบนรถ (ลิตร)</th>
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ราคาต่อลิตร</th>
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">มูลค่า</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    เลขที่ใบสั่งซื้อ
                  </div>
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ค้าง (วัน)</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">สถานะ</th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">ไม่พบข้อมูลน้ำมันที่เหลือบนรถ</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const price = oilPrices[item.oilType] || 0;
                  const totalValue = item.quantityOnTruck * price;
                  const isOverdue = item.daysOnTruck > 3;

                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-red-50/50 dark:hover:from-orange-900/10 dark:hover:to-red-900/10 transition-all duration-200 ${
                        isOverdue ? "bg-red-50/30 dark:bg-red-900/10 border-l-4 border-l-red-500" : ""
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-800 dark:text-white">{item.branchName}</span>
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
                          {price.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {currencyFormatter.format(totalValue)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{item.orderNo}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className={`font-semibold ${isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                            {item.daysOnTruck} วัน
                          </span>
                          {isOverdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          item.status === "sold"
                            ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                            : item.status === "partial"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
                        }`}>
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedItem.branchName}</p>
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
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{selectedItem.branchName}</span>
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
                          {oilPrices[selectedItem.oilType]?.toFixed(2) || "0.00"} บาท
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        ขายให้สาขา *
                      </div>
                    </label>
                    <select
                      value={saleToBranch}
                      onChange={(e) => setSaleToBranch(e.target.value === "" ? "" : parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white"
                    >
                      <option value="">เลือกสาขา</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-blue-500" />
                        จำนวนที่ขาย (ลิตร) *
                      </div>
                    </label>
                    <input
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
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        ราคาต่อลิตร (บาท) *
                      </div>
                    </label>
                    <input
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

