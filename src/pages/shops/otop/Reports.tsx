import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  PieChart,
  FileText,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  AlertCircle,
  Calendar,
  Download,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH");

// Import mock data from Stock and Sales (in real app, these would come from context/API)
const mockStockData = [
  {
    id: "P-001",
    name: "ข้าวตังหน้าหมูหยอง 80g",
    category: "ขนมขบเคี้ยว",
    quantity: 5,
    price: 42,
    cost: 30,
  },
  {
    id: "P-002",
    name: "แหนมเนือง",
    category: "อาหารสด",
    quantity: 150,
    price: 200,
    cost: 150,
  },
  {
    id: "P-003",
    name: "เค้กมะพร้าวเนยสด",
    category: "เบเกอรี่",
    quantity: 2,
    price: 150,
    cost: 100,
  },
  {
    id: "P-004",
    name: "คุกกี้สิงค์โปร์",
    category: "ขนมขบเคี้ยว",
    quantity: 45,
    price: 80,
    cost: 50,
  },
  {
    id: "P-005",
    name: "หมูหยอง 1 ขีด",
    category: "ของแห้ง",
    quantity: 8,
    price: 120,
    cost: 80,
  },
];

const mockDailySales = [
  { date: "1/7/2568", productSales: 5849, cash: 2582, transferQr: 2312, other: 990, actualTotal: 5884 },
  { date: "2/7/2568", productSales: 7355, cash: 4855, transferQr: 2760, other: 0, actualTotal: 7615 },
  { date: "3/7/2568", productSales: 6001, cash: 2340, transferQr: 1510, other: 0, actualTotal: 1856 },
  { date: "4/7/2568", productSales: 7861, cash: 4362, transferQr: 3499, other: 0, actualTotal: 7861 },
  { date: "5/7/2568", productSales: 9985, cash: 6747, transferQr: 3238, other: 0, actualTotal: 9985 },
  { date: "6/7/2568", productSales: 5516, cash: 3888, transferQr: 1628, other: 0, actualTotal: 5516 },
  { date: "7/7/2568", productSales: 8194, cash: 3974, transferQr: 4231, other: 0, actualTotal: 8205 },
  { date: "8/7/2568", productSales: 6585, cash: 4370, transferQr: 2214, other: 0, actualTotal: 6584 },
  { date: "9/7/2568", productSales: 7425, cash: 4445, transferQr: 2980, other: 0, actualTotal: 7425 },
  { date: "10/7/2568", productSales: 8942, cash: 3843, transferQr: 5099, other: 0, actualTotal: 8942 },
];

const mockPurchaseHistory = [
  {
    id: "PE-001",
    date: "25/08/2568",
    total: 11017.5,
    items: [
      { productName: "แหนมเนือง", quantity: 50 },
      { productName: "ข้าวตัง", quantity: 10 },
    ],
  },
  {
    id: "PE-002",
    date: "24/08/2568",
    total: 1250,
    items: [
      { productName: "ถุงพลาสติก", quantity: 100 },
      { productName: "กล่องโฟม", quantity: 50 },
    ],
  },
];

export default function OtopReports() {
  // Calculate statistics from mock data
  const reportStats = useMemo(() => {
    // Sales statistics
    const totalSales = mockDailySales.reduce((sum, record) => sum + record.productSales, 0);
    const totalCash = mockDailySales.reduce((sum, record) => sum + record.cash, 0);
    const totalTransferQr = mockDailySales.reduce((sum, record) => sum + record.transferQr, 0);
    const averageDailySales = mockDailySales.length > 0 ? totalSales / mockDailySales.length : 0;

    // Stock statistics
    const totalStockItems = mockStockData.length;
    const totalStockValue = mockStockData.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const totalStockCost = mockStockData.reduce((sum, item) => sum + item.quantity * item.cost, 0);
    const lowStockItems = mockStockData.filter((item) => item.quantity < 10).length;

    // Purchase statistics
    const totalPurchases = mockPurchaseHistory.reduce((sum, entry) => sum + entry.total, 0);
    const totalPurchaseOrders = mockPurchaseHistory.length;

    // Category distribution
    const categorySales: Record<string, number> = {};
    mockStockData.forEach((item) => {
      const salesForItem = (item.quantity * item.price * 0.3); // Estimate 30% sold
      categorySales[item.category] = (categorySales[item.category] || 0) + salesForItem;
    });
    const totalCategorySales = Object.values(categorySales).reduce((sum, val) => sum + val, 0);
    const categoryMix = Object.entries(categorySales).map(([label, value]) => ({
      label,
      value: totalCategorySales > 0 ? Math.round((value / totalCategorySales) * 100) : 0,
    }));

    // Profit calculation
    const grossProfit = totalSales - totalStockCost;
    const profitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

    return {
      totalSales,
      totalCash,
      totalTransferQr,
      averageDailySales,
      totalStockItems,
      totalStockValue,
      lowStockItems,
      totalPurchases,
      totalPurchaseOrders,
      categoryMix,
      grossProfit,
      profitMargin,
    };
  }, []);

  const selectedMonth = "กรกฎาคม 2568";

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="h-8 w-8 text-purple-600" />
            รายงาน - ร้าน OTOP ชุมชน
          </h2>
          <p className="text-slate-500 text-sm mt-1">รายงานประจำเดือน {selectedMonth} • สรุปข้อมูลยอดขาย สต็อก และการซื้อสินค้าเข้า</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              alert("กำลังส่งออกรายงานเป็นไฟล์ Excel...\n\n(ฟังก์ชันนี้ยังเป็น Mock)");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            ส่งออกรายงาน
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span className="font-medium text-slate-700">{selectedMonth}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-6 w-6 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">ยอดขายรวม</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            ฿{numberFormatter.format(reportStats.totalSales)}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            เฉลี่ย {numberFormatter.format(reportStats.averageDailySales)}/วัน
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
            <span className="text-xs text-emerald-600 font-medium">กำไรขั้นต้น</span>
          </div>
          <div className="text-2xl font-bold text-emerald-900">
            ฿{numberFormatter.format(reportStats.grossProfit)}
          </div>
          <div className="text-xs text-emerald-600 mt-1">
            มาร์จิ้น {reportStats.profitMargin.toFixed(1)}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <Package className="h-6 w-6 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">มูลค่าสต็อก</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            ฿{numberFormatter.format(reportStats.totalStockValue)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {reportStats.totalStockItems} รายการ
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">สินค้าใกล้หมด</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {reportStats.lowStockItems}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            รายการ
          </div>
        </motion.div>
      </div>

      {/* Sales and Stock Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
              สรุปยอดขาย
            </h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">ยอดขายรวม</span>
                <span className="text-lg font-bold text-slate-800">
                  ฿{numberFormatter.format(reportStats.totalSales)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>เฉลี่ยต่อวัน</span>
                <span>฿{numberFormatter.format(reportStats.averageDailySales)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-xs text-emerald-600 mb-1">เงินสด</div>
                <div className="text-lg font-bold text-emerald-900">
                  ฿{numberFormatter.format(reportStats.totalCash)}
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 mb-1">โอน/QR</div>
                <div className="text-lg font-bold text-blue-900">
                  ฿{numberFormatter.format(reportStats.totalTransferQr)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stock Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              สรุปสต็อก
            </h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">มูลค่าสต็อกรวม</span>
                <span className="text-lg font-bold text-slate-800">
                  ฿{numberFormatter.format(reportStats.totalStockValue)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>จำนวนรายการ</span>
                <span>{reportStats.totalStockItems} รายการ</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xs text-green-600 mb-1">สินค้าปกติ</div>
                <div className="text-lg font-bold text-green-900">
                  {reportStats.totalStockItems - reportStats.lowStockItems}
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-xs text-orange-600 mb-1">ใกล้หมด</div>
                <div className="text-lg font-bold text-orange-900">
                  {reportStats.lowStockItems}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Mix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              ยอดขายตามหมวดสินค้า
            </h3>
            <p className="text-sm text-gray-500 mt-1">สัดส่วนหมวดหลักของสินค้า OTOP เดือนปัจจุบัน</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportStats.categoryMix.map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl border border-gray-200 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-slate-800">{item.label}</p>
                <p className="text-xs text-gray-500">หมวดหลักในพื้นที่</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">{item.value}%</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            ยอดขายรายวัน (10 วันล่าสุด)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-4 py-3 font-medium text-center">วันที่</th>
                <th className="px-4 py-3 font-medium text-right">ขายสินค้า</th>
                <th className="px-4 py-3 font-medium text-right">เงินสด</th>
                <th className="px-4 py-3 font-medium text-right">โอน/QR</th>
                <th className="px-4 py-3 font-medium text-right">อื่นๆ</th>
                <th className="px-4 py-3 font-bold text-right">รวมรับจริง</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {mockDailySales.slice(0, 10).map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-center text-gray-500 font-mono">{record.date}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {numberFormatter.format(record.productSales)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {numberFormatter.format(record.cash)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {numberFormatter.format(record.transferQr)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {record.other > 0 ? numberFormatter.format(record.other) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    {numberFormatter.format(record.actualTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Purchase Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-purple-600" />
            สรุปการซื้อสินค้าเข้า
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">จำนวนบิล</div>
            <div className="text-2xl font-bold text-slate-800">{reportStats.totalPurchaseOrders}</div>
            <div className="text-xs text-gray-500 mt-1">บิล</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">ยอดซื้อรวม</div>
            <div className="text-2xl font-bold text-slate-800">
              ฿{numberFormatter.format(reportStats.totalPurchases)}
            </div>
            <div className="text-xs text-gray-500 mt-1">บาท</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">เฉลี่ยต่อบิล</div>
            <div className="text-2xl font-bold text-slate-800">
              ฿{numberFormatter.format(
                reportStats.totalPurchaseOrders > 0
                  ? reportStats.totalPurchases / reportStats.totalPurchaseOrders
                  : 0
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">บาท</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
