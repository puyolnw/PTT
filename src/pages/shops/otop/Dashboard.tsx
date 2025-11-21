import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  AlertCircle,
  Leaf,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  CreditCard,
  BarChart3,
  Store,
  Gift,
} from "lucide-react";
import { useShop } from "@/contexts/ShopContext";

const numberFormatter = new Intl.NumberFormat("th-TH");

// Mock data from Sales.tsx
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

// Mock data from Stock.tsx
const mockStockData = [
  {
    id: "P-001",
    name: "ข้าวตังหน้าหมูหยอง 80g",
    category: "ขนมขบเคี้ยว",
    quantity: 5,
    price: 42,
    lowStockThreshold: 10,
    supplier: "กลุ่มทอผ้าบ้านโคก",
  },
  {
    id: "P-002",
    name: "แหนมเนือง",
    category: "อาหารสด",
    quantity: 150,
    price: 200,
    lowStockThreshold: 50,
    supplier: "วิสาหกิจแม่สมพร",
  },
  {
    id: "P-003",
    name: "เค้กมะพร้าวเนยสด",
    category: "เบเกอรี่",
    quantity: 2,
    price: 150,
    lowStockThreshold: 8,
    supplier: "ชุมชนบ้านด่านเกวียน",
  },
  {
    id: "P-004",
    name: "คุกกี้สิงค์โปร์",
    category: "ขนมขบเคี้ยว",
    quantity: 45,
    price: 80,
    lowStockThreshold: 20,
    supplier: "กลุ่มสมุนไพรแม่แจ่ม",
  },
  {
    id: "P-005",
    name: "หมูหยอง 1 ขีด",
    category: "ของแห้ง",
    quantity: 8,
    price: 120,
    lowStockThreshold: 15,
    supplier: "กลุ่มทอผ้าบ้านโคก",
  },
];

// Mock data from Purchases.tsx
const mockPurchaseHistory = [
  {
    id: "PE-001",
    date: "25/08/2568",
    total: 11017.5,
    items: [
      { productName: "แหนมเนือง", quantity: 50 },
      { productName: "ข้าวตัง", quantity: 10 },
    ],
    recorder: "พนักงานขาย A",
  },
  {
    id: "PE-002",
    date: "24/08/2568",
    total: 1250,
    items: [
      { productName: "ถุงพลาสติก", quantity: 100 },
      { productName: "กล่องโฟม", quantity: 50 },
    ],
    recorder: "พนักงานขาย B",
  },
];

export default function OtopDashboard() {
  const { currentShop } = useShop();
  const shopName = currentShop?.name || "ร้าน OTOP ชุมชน";

  // Calculate statistics
  const dashboardStats = useMemo(() => {
    // Sales statistics
    const todaySales = mockDailySales[mockDailySales.length - 1]?.productSales || 0;
    const yesterdaySales = mockDailySales[mockDailySales.length - 2]?.productSales || 0;
    const totalSales = mockDailySales.reduce((sum, record) => sum + record.productSales, 0);
    const totalCash = mockDailySales.reduce((sum, record) => sum + record.cash, 0);
    const totalTransferQr = mockDailySales.reduce((sum, record) => sum + record.transferQr, 0);
    const averageDailySales = mockDailySales.length > 0 ? totalSales / mockDailySales.length : 0;
    const salesChange = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;

    // Stock statistics
    const totalStockItems = mockStockData.length;
    const totalStockValue = mockStockData.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const lowStockItems = mockStockData.filter((item) => item.quantity < item.lowStockThreshold).length;
    const outOfStockItems = mockStockData.filter((item) => item.quantity === 0).length;

    // Purchase statistics
    const totalPurchases = mockPurchaseHistory.reduce((sum, entry) => sum + entry.total, 0);
    const totalPurchaseOrders = mockPurchaseHistory.length;

    // Category distribution
    const categoryCount: Record<string, number> = {};
    mockStockData.forEach((item) => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    return {
      todaySales,
      yesterdaySales,
      totalSales,
      totalCash,
      totalTransferQr,
      averageDailySales,
      salesChange,
      totalStockItems,
      totalStockValue,
      lowStockItems,
      outOfStockItems,
      totalPurchases,
      totalPurchaseOrders,
      categoryCount,
    };
  }, []);

  const selectedMonth = "กรกฎาคม 2568";

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Gift className="h-8 w-8 text-purple-600" />
            {shopName}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            ภาพรวมยอดขาย สต็อก และการเตรียมสินค้าท้องถิ่นจากชุมชนเครือข่าย OTOP ที่อยู่ในพื้นที่ปั๊ม
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
          <Calendar className="h-4 w-4 text-purple-500" />
          <span className="font-medium text-slate-700">{selectedMonth}</span>
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
            <span className="text-xs text-purple-600 font-medium">ยอดขายวันนี้</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            ฿{numberFormatter.format(dashboardStats.todaySales)}
          </div>
          <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
            {dashboardStats.salesChange >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {dashboardStats.salesChange >= 0 ? "+" : ""}
            {dashboardStats.salesChange.toFixed(1)}% เทียบเมื่อวาน
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
            <span className="text-xs text-emerald-600 font-medium">ยอดขายรวมเดือนนี้</span>
          </div>
          <div className="text-2xl font-bold text-emerald-900">
            ฿{numberFormatter.format(dashboardStats.totalSales)}
          </div>
          <div className="text-xs text-emerald-600 mt-1">
            เฉลี่ย {numberFormatter.format(dashboardStats.averageDailySales)}/วัน
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
            ฿{numberFormatter.format(dashboardStats.totalStockValue)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {dashboardStats.totalStockItems} รายการ
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
            {dashboardStats.lowStockItems + dashboardStats.outOfStockItems}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            รายการ
          </div>
        </motion.div>
      </div>

      {/* Sales and Payment Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              สรุปยอดขายและช่องทางการชำระเงิน
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">เงินสด</span>
              </div>
              <div className="text-2xl font-bold text-emerald-900">
                ฿{numberFormatter.format(dashboardStats.totalCash)}
              </div>
              <div className="text-xs text-emerald-600 mt-1">
                {dashboardStats.totalSales > 0
                  ? ((dashboardStats.totalCash / dashboardStats.totalSales) * 100).toFixed(1)
                  : 0}
                % ของยอดขาย
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">โอน/QR</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                ฿{numberFormatter.format(dashboardStats.totalTransferQr)}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {dashboardStats.totalSales > 0
                  ? ((dashboardStats.totalTransferQr / dashboardStats.totalSales) * 100).toFixed(1)
                  : 0}
                % ของยอดขาย
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">ยอดขายรวม</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                ฿{numberFormatter.format(dashboardStats.totalSales)}
              </div>
              <div className="text-xs text-purple-600 mt-1">
                {mockDailySales.length} วัน
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
              การซื้อสินค้าเข้า
            </h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">จำนวนบิล</div>
              <div className="text-2xl font-bold text-slate-800">{dashboardStats.totalPurchaseOrders}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">ยอดซื้อรวม</div>
              <div className="text-2xl font-bold text-slate-800">
                ฿{numberFormatter.format(dashboardStats.totalPurchases)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">เฉลี่ยต่อบิล</div>
              <div className="text-2xl font-bold text-slate-800">
                ฿{numberFormatter.format(
                  dashboardStats.totalPurchaseOrders > 0
                    ? dashboardStats.totalPurchases / dashboardStats.totalPurchaseOrders
                    : 0
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stock and Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              สต็อกสินค้า OTOP
            </h3>
          </div>
          <div className="space-y-3">
            {mockStockData.map((item) => {
              const isLowStock = item.quantity < item.lowStockThreshold;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border ${
                    isLowStock ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-slate-800">{item.name}</p>
                        {isLowStock && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-300">
                            ใกล้หมด
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>หมวด: {item.category}</span>
                        <span>คงเหลือ: {numberFormatter.format(item.quantity)}</span>
                        <span>มูลค่า: ฿{numberFormatter.format(item.quantity * item.price)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">โดย {item.supplier}</p>
                    </div>
                    <Leaf className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
              บิลล่าสุด
            </h3>
          </div>
          <div className="space-y-3">
            {mockPurchaseHistory.map((entry) => (
              <div key={entry.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{entry.id}</p>
                    <p className="text-xs text-gray-500">{entry.date}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    สำเร็จ
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {entry.items.map((item) => `${item.productName} ${item.quantity}`).join(", ")}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">โดย {entry.recorder}</span>
                  <span className="font-semibold text-slate-800">
                    ฿{numberFormatter.format(entry.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
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
              {mockDailySales.slice(-10).map((record, index) => (
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

      {/* Category Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Store className="h-5 w-5 text-purple-600" />
            หมวดหมู่สินค้า
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(dashboardStats.categoryCount).map(([category, count]) => (
            <div
              key={category}
              className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-center"
            >
              <div className="text-2xl font-bold text-purple-600">{count}</div>
              <div className="text-xs text-gray-600 mt-1">{category}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
