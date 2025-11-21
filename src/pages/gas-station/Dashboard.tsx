import { useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
  BarChart3,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Upload,
  Fuel,
  Building2,
  Ticket,
  Gauge,
  Bell,
  FileCheck,
  Clock,
  Camera,
  Droplet,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("th-TH");

// Mock data สำหรับ M1 - บริหารจัดการปั๊มน้ำมัน
const mockSalesData = {
  today: 500000,
  yesterday: 480000,
  thisMonth: 15000000,
  lastMonth: 14000000,
  byPaymentMethod: {
    cash: { amount: 300000, percentage: 60, name: "เงินสด" },
    qr: { amount: 125000, percentage: 25, name: "QR / KPLUS / PROMPTPAY" },
    card: { amount: 50000, percentage: 10, name: "Master / VISA" },
    coupon: { amount: 2950, percentage: 0.6, name: "คูปองสถานี" },
    others: { amount: 22050, percentage: 4.4, name: "อื่นๆ" },
  },
  byFuelType: {
    g95: { amount: 300000, percentage: 60, name: "Gasohol 95" },
    diesel: { amount: 200000, percentage: 40, name: "Diesel" },
  },
};

const mockStockData = [
  { name: "Gasohol 95", quantity: 28500, unit: "ลิตร", tank: "TK-001", branch: "สำนักงานใหญ่", lowStock: false },
  { name: "Diesel", quantity: 32000, unit: "ลิตร", tank: "TK-002", branch: "สำนักงานใหญ่", lowStock: false },
  { name: "Premium Gasohol 95", quantity: 15000, unit: "ลิตร", tank: "TK-003", branch: "สำนักงานใหญ่", lowStock: true },
  { name: "E20", quantity: 8000, unit: "ลิตร", tank: "TK-004", branch: "สาขา A", lowStock: true },
];

const mockFinancialData = {
  revenue: 500000,
  cost: 400000,
  profit: 100000,
  expenses: 15000,
  netProfit: 85000,
};

const mockRecentPurchases = [
  { id: "1", date: "2024-12-15", fuelType: "Gasohol 95", quantity: 50000, amount: 2000000, branch: "สำนักงานใหญ่", source: "PURCHASE_20241215.xlsx" },
  { id: "2", date: "2024-12-14", fuelType: "Diesel", quantity: 40000, amount: 1600000, branch: "สาขา A", source: "PURCHASE_20241214.xlsx" },
  { id: "3", date: "2024-12-13", fuelType: "Premium Gasohol 95", quantity: 20000, amount: 900000, branch: "สาขา B", source: "PURCHASE_20241213.xlsx" },
];

const mockTopSellingBranches = [
  { name: "สำนักงานใหญ่", sales: 500000, trend: "+10%", profit: 85000 },
  { name: "สาขา A", sales: 450000, trend: "+8%", profit: 76500 },
  { name: "สาขา B", sales: 400000, trend: "+12%", profit: 68000 },
  { name: "สาขา C", sales: 350000, trend: "+5%", profit: 59500 },
  { name: "สาขา D", sales: 300000, trend: "+15%", profit: 51000 },
];

export default function GasStationDashboard() {
  const dashboardStats = useMemo(() => {
    const salesChange = ((mockSalesData.today - mockSalesData.yesterday) / mockSalesData.yesterday) * 100;
    const monthlyChange = ((mockSalesData.thisMonth - mockSalesData.lastMonth) / mockSalesData.lastMonth) * 100;
    const lowStockItems = mockStockData.filter(item => item.lowStock);
    const totalStock = mockStockData.reduce((sum, item) => sum + item.quantity, 0);

    return {
      todaySales: mockSalesData.today,
      yesterdaySales: mockSalesData.yesterday,
      thisMonthSales: mockSalesData.thisMonth,
      lastMonthSales: mockSalesData.lastMonth,
      salesChange,
      monthlyChange,
      lowStockItems: lowStockItems.length,
      totalStockItems: mockStockData.length,
      totalStock,
      netProfit: mockFinancialData.netProfit,
      revenue: mockFinancialData.revenue,
      cost: mockFinancialData.cost,
      profit: mockFinancialData.profit,
      expenses: mockFinancialData.expenses,
    };
  }, []);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplet className="h-8 w-8 text-blue-600" />
          M1: บริหารจัดการปั๊มน้ำมัน
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          ภาพรวมยอดขาย สต็อก กำไรแบบเรียลไทม์ สำหรับ 5 ปั๊ม (1 สำนักงานใหญ่ + 4 สาขา) นำเข้าข้อมูลจาก PTT BackOffice (Excel)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <DollarSign className="h-5 w-5" />
            <span className="font-bold">ยอดขายวันนี้</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            ฿{numberFormatter.format(dashboardStats.todaySales)}
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
            {dashboardStats.salesChange >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {dashboardStats.salesChange >= 0 ? "+" : ""}
            {dashboardStats.salesChange.toFixed(1)}% เทียบเมื่อวาน
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">ยอดขายรวมเดือนนี้</div>
          <div className="text-xl font-bold text-slate-800">
            ฿{numberFormatter.format(dashboardStats.thisMonthSales)}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (dashboardStats.thisMonthSales / 20000000) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">กำไรสุทธิวันนี้</div>
          <div className="text-xl font-bold text-slate-800">
            ฿{numberFormatter.format(dashboardStats.netProfit)}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-purple-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (dashboardStats.netProfit / dashboardStats.revenue) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">สต็อกใกล้หมด</div>
          <div className="text-xl font-bold text-slate-800">
            {dashboardStats.lowStockItems} ถัง
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-orange-500 h-1.5 rounded-full"
              style={{ width: `${(dashboardStats.lowStockItems / dashboardStats.totalStockItems) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* คูปองสถานี - ส่วนสรุปแยกต่างหาก */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-orange-600" />
            ระบบคูปองสถานี
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <p className="text-sm text-orange-600 mb-1">ยอดขายด้วยคูปองวันนี้</p>
            <p className="text-2xl font-bold text-orange-900">
              ฿{numberFormatter.format(mockSalesData.byPaymentMethod.coupon.amount)}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              {mockSalesData.byPaymentMethod.coupon.percentage}% ของยอดขายทั้งหมด
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <p className="text-sm text-orange-600 mb-1">จำนวนคูปองที่ใช้</p>
            <p className="text-2xl font-bold text-orange-900">2 ใบ</p>
            <p className="text-xs text-orange-600 mt-1">C001, C002</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <p className="text-sm text-orange-600 mb-1">สถานะ</p>
            <p className="text-2xl font-bold text-green-700">ปกติ</p>
            <p className="text-xs text-orange-600 mt-1">ยอดขายเต็มราคา - ไม่หักส่วนลด</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-xs text-orange-700">
            <strong>หมายเหตุ:</strong> คูปองสถานีใน M1 เป็นช่องทางการชำระเงินเท่านั้น (PaymentType = Coupon) ไม่มีการหักส่วนลด 
            ยอดขายยังคงเต็มราคา (Full Price) ตามข้อมูลจาก PTT BackOffice
          </p>
        </div>
      </div>

      {/* Sales by Payment Method */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            ยอดขายแยกตามช่องทางชำระเงิน
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <p className="text-sm text-emerald-600 mb-1">{mockSalesData.byPaymentMethod.cash.name}</p>
            <p className="text-2xl font-bold text-emerald-900">
              ฿{numberFormatter.format(mockSalesData.byPaymentMethod.cash.amount)}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              {mockSalesData.byPaymentMethod.cash.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-600 mb-1">{mockSalesData.byPaymentMethod.qr.name}</p>
            <p className="text-2xl font-bold text-blue-900">
              ฿{numberFormatter.format(mockSalesData.byPaymentMethod.qr.amount)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {mockSalesData.byPaymentMethod.qr.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <p className="text-sm text-purple-600 mb-1">{mockSalesData.byPaymentMethod.card.name}</p>
            <p className="text-2xl font-bold text-purple-900">
              ฿{numberFormatter.format(mockSalesData.byPaymentMethod.card.amount)}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              {mockSalesData.byPaymentMethod.card.percentage}% ของยอดขาย
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <p className="text-sm text-orange-600 mb-1">{mockSalesData.byPaymentMethod.coupon.name}</p>
            <p className="text-2xl font-bold text-orange-900">
              ฿{numberFormatter.format(mockSalesData.byPaymentMethod.coupon.amount)}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              {mockSalesData.byPaymentMethod.coupon.percentage}% ของยอดขาย
            </p>
            <p className="text-xs text-orange-700 mt-1 italic">
              (ยอดขายเต็มราคา - ไม่มีส่วนลด)
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">{mockSalesData.byPaymentMethod.others.name}</p>
            <p className="text-2xl font-bold text-gray-900">
              ฿{numberFormatter.format(mockSalesData.byPaymentMethod.others.amount)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {mockSalesData.byPaymentMethod.others.percentage}% ของยอดขาย
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* สต็อกน้ำมัน */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Fuel className="h-5 w-5 text-blue-600" />
              สต็อกน้ำมัน
            </h3>
          </div>
          <div className="space-y-3">
            {mockStockData.map((item) => (
              <div
                key={item.name}
                className={`p-4 rounded-xl border ${
                  item.lowStock 
                    ? "bg-orange-50 border-orange-200" 
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-800">{item.name}</p>
                      {item.lowStock && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-300">
                          ใกล้หมด
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                        {item.branch}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>ถัง: {item.tank}</span>
                      <span>คงเหลือ: {numberFormatter.format(item.quantity)} {item.unit}</span>
                    </div>
                  </div>
                  <Fuel className={`h-6 w-6 ${
                    item.lowStock ? "text-orange-400" : "text-emerald-400"
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* สรุปการเงิน */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              สรุปการเงินวันนี้
            </h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-600 mb-1">รายรับ</p>
              <p className="text-2xl font-bold text-emerald-900">
                ฿{numberFormatter.format(dashboardStats.revenue)}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-600 mb-1">ต้นทุน</p>
              <p className="text-2xl font-bold text-red-900">
                ฿{numberFormatter.format(dashboardStats.cost)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">กำไรขั้นต้น</p>
              <p className="text-2xl font-bold text-blue-900">
                ฿{numberFormatter.format(dashboardStats.profit)}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-600 mb-1">รายจ่าย</p>
              <p className="text-2xl font-bold text-orange-900">
                ฿{numberFormatter.format(dashboardStats.expenses)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600 mb-1">กำไรสุทธิ</p>
              <p className="text-2xl font-bold text-purple-900">
                ฿{numberFormatter.format(dashboardStats.netProfit)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* สาขาขายดี */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              ยอดขายแยกตามสาขา
            </h3>
          </div>
          <div className="space-y-3">
            {mockTopSellingBranches.map((branch, index) => (
              <div
                key={branch.name}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    index === 0 ? "bg-blue-100 text-blue-600" :
                    index === 1 ? "bg-emerald-100 text-emerald-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{branch.name}</p>
                    <p className="text-xs text-gray-500">กำไร: ฿{numberFormatter.format(branch.profit)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">
                    ฿{numberFormatter.format(branch.sales)}
                  </p>
                  <div className={`flex items-center gap-1 text-xs text-emerald-600 mt-1`}>
                    <TrendingUp className="w-3 h-3" />
                    {branch.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* การซื้อน้ำมันเข้า */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              การซื้อน้ำมันเข้า
            </h3>
          </div>
          <div className="space-y-3">
            {mockRecentPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-800">{purchase.fuelType}</p>
                    <p className="text-xs text-gray-500">{purchase.branch}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">
                      ฿{numberFormatter.format(purchase.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {numberFormatter.format(purchase.quantity)} ลิตร
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {new Date(purchase.date).toLocaleDateString("th-TH")}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                    {purchase.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">การดำเนินการด่วน</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer">
            <Upload className="w-5 h-5 text-blue-600" />
            <span className="text-slate-800 font-medium">นำเข้า Excel จาก PTT BackOffice</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
            />
          </label>
          <button className="flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span className="text-slate-800 font-medium">ดูรายงานยอดขาย</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors">
            <FileText className="w-5 h-5 text-purple-600" />
            <span className="text-slate-800 font-medium">ออกรายงาน PDF</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            <span className="text-slate-800 font-medium">ส่งข้อมูลไป M6</span>
          </button>
        </div>
      </div>

      {/* Quick Links to New Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            ฟีเจอร์เพิ่มเติม
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <a href="/app/gas-station/meter-dip" className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all hover:border-blue-300 hover:scale-105">
            <Gauge className="w-6 h-6 text-blue-600" />
            <span className="text-xs text-center text-slate-800 font-medium">Meter & Dip</span>
          </a>
          <a href="/app/gas-station/stock-alerts" className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all hover:border-blue-300 hover:scale-105">
            <Bell className="w-6 h-6 text-orange-600" />
            <span className="text-xs text-center text-slate-800 font-medium">แจ้งเตือนสต็อก</span>
          </a>
          <a href="/app/gas-station/price-management" className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all hover:border-blue-300 hover:scale-105">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <span className="text-xs text-center text-slate-800 font-medium">ปรับราคา</span>
          </a>
          <a href="/app/gas-station/requisitions" className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all hover:border-blue-300 hover:scale-105">
            <FileCheck className="w-6 h-6 text-blue-600" />
            <span className="text-xs text-center text-slate-800 font-medium">สั่งซื้อน้ำมัน</span>
          </a>
          <a href="/app/gas-station/shift-management" className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all hover:border-blue-300 hover:scale-105">
            <Clock className="w-6 h-6 text-purple-600" />
            <span className="text-xs text-center text-slate-800 font-medium">กะพนักงาน</span>
          </a>
          <a href="/app/gas-station/pos-integration" className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all hover:border-blue-300 hover:scale-105">
            <Camera className="w-6 h-6 text-red-600" />
            <span className="text-xs text-center text-slate-800 font-medium">POS & CCTV</span>
          </a>
        </div>
      </div>
    </div>
  );
}

