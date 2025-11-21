import { useState, useMemo } from "react";
import {
  DollarSign,
  Upload,
  Fuel,
  Ticket,
  Droplet,
} from "lucide-react";
import FilterBar from "@/components/FilterBar";

const numberFormatter = new Intl.NumberFormat("th-TH");

// ช่องทางชำระเงิน 12 ช่องทาง
const paymentMethods = [
  "เงินสด",
  "Master / VISA",
  "KBANK-CARD",
  "PTT Privilege Energy Card",
  "Fleet Card",
  "Top up Card",
  "ttb Fill&GO+",
  "BBL Fleet Card",
  "Visa Local Card",
  "QR / KPLUS / PROMPTPAY",
  "คูปองสถานี",
  "ลูกหนี้เงินเชื่อ",
];

const branches = ["สำนักงานใหญ่", "สาขา A", "สาขา B", "สาขา C", "สาขา D"];

// Mock data สำหรับยอดขาย (รวมคูปองสถานี)
const initialSalesData = [
  {
    id: "1",
    date: "2024-12-15",
    fuelType: "Gasohol 95",
    quantity: 5000,
    amount: 200000,
    paymentMethod: "เงินสด",
    branch: "สำนักงานใหญ่",
    source: "SALES_20241215.xlsx",
    couponCode: null,
  },
  {
    id: "2",
    date: "2024-12-15",
    fuelType: "Diesel",
    quantity: 4000,
    amount: 160000,
    paymentMethod: "QR / KPLUS / PROMPTPAY",
    branch: "สาขา A",
    source: "SALES_20241215.xlsx",
    couponCode: null,
  },
  {
    id: "3",
    date: "2024-12-15",
    fuelType: "Gasohol 95",
    quantity: 30,
    amount: 1200,
    paymentMethod: "คูปองสถานี",
    branch: "สำนักงานใหญ่",
    source: "SALES_20241215.xlsx",
    couponCode: "C001",
  },
  {
    id: "4",
    date: "2024-12-14",
    fuelType: "Gasohol 95",
    quantity: 3000,
    amount: 120000,
    paymentMethod: "Master / VISA",
    branch: "สาขา B",
    source: "SALES_20241214.xlsx",
    couponCode: null,
  },
  {
    id: "5",
    date: "2024-12-14",
    fuelType: "Diesel",
    quantity: 50,
    amount: 1750,
    paymentMethod: "คูปองสถานี",
    branch: "สาขา A",
    source: "SALES_20241214.xlsx",
    couponCode: "C002",
  },
];

export default function Sales() {
  const [salesData] = useState(initialSalesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Calculate statistics
  const stats = useMemo(() => {
    const todaySales = salesData
      .filter((sale) => sale.date === new Date().toISOString().split("T")[0])
      .reduce((sum, sale) => sum + sale.amount, 0);

    const thisMonthSales = salesData.reduce((sum, sale) => {
      const saleMonth = sale.date.substring(0, 7);
      const currentMonth = new Date().toISOString().substring(0, 7);
      return saleMonth === currentMonth ? sum + sale.amount : sum;
    }, 0);

    // Calculate sales by payment method
    const salesByPayment = salesData.reduce((acc, sale) => {
      if (!acc[sale.paymentMethod]) {
        acc[sale.paymentMethod] = 0;
      }
      acc[sale.paymentMethod] += sale.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalSales = Object.values(salesByPayment).reduce((sum, val) => sum + val, 0);

    const couponSales = salesData
      .filter((s) => s.paymentMethod === "คูปองสถานี")
      .reduce((sum, s) => sum + s.amount, 0);

    const couponCount = salesData.filter((s) => s.couponCode).length;
    const uniqueCoupons = salesData
      .filter((s) => s.couponCode)
      .map((s) => s.couponCode)
      .filter((code, index, self) => self.indexOf(code) === index);

    return {
      todaySales,
      thisMonthSales,
      totalSales,
      salesByPayment,
      couponSales,
      couponCount,
      uniqueCoupons,
      totalRecords: salesData.length,
      paymentMethodsCount: Object.keys(salesByPayment).length,
      todayRecords: salesData.filter((s) => s.date === new Date().toISOString().split("T")[0]).length,
    };
  }, [salesData]);

  // Filter sales data
  const filteredSales = salesData.filter((sale) => {
    const matchesSearch = sale.fuelType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPayment = !paymentFilter || sale.paymentMethod === paymentFilter;
    const matchesBranch = !branchFilter || sale.branch === branchFilter;
    const matchesDate = !dateFilter || sale.date === dateFilter;
    return matchesSearch && matchesPayment && matchesBranch && matchesDate;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะประมวลผลยอดขายแยกตามช่องทางชำระเงิน 12 ช่องทาง`);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Droplet className="h-8 w-8 text-blue-600" />
          ยอดขาย - M1
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          ประมวลผลยอดขายแยกตามช่องทางชำระเงิน 12 ช่องทาง (เงินสด, Master/VISA, KBANK-CARD, PTT Privilege Energy Card, Fleet Card, Top up Card, ttb Fill&GO+, BBL Fleet Card, Visa Local Card, QR/KPLUS/PROMPTPAY, คูปองสถานี, ลูกหนี้เงินเชื่อ) นำเข้า Excel จาก PTT BackOffice
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
            ฿{numberFormatter.format(stats.todaySales)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {stats.todayRecords} รายการ
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">ยอดขายเดือนนี้</div>
          <div className="text-xl font-bold text-slate-800">
            ฿{numberFormatter.format(stats.thisMonthSales)}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (stats.thisMonthSales / 20000000) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">รายการทั้งหมด</div>
          <div className="text-xl font-bold text-slate-800">
            {stats.totalRecords}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-purple-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (stats.totalRecords / 1000) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">ช่องทางชำระ</div>
          <div className="text-xl font-bold text-slate-800">
            {stats.paymentMethodsCount}
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${(stats.paymentMethodsCount / 12) * 100}%` }}
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
            <p className="text-sm text-orange-600 mb-1">ยอดขายด้วยคูปอง</p>
            <p className="text-2xl font-bold text-orange-900">
              ฿{numberFormatter.format(stats.couponSales)}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              {salesData.filter((s) => s.paymentMethod === "คูปองสถานี").length} รายการ
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <p className="text-sm text-orange-600 mb-1">จำนวนคูปองที่ใช้</p>
            <p className="text-2xl font-bold text-orange-900">
              {stats.couponCount} ใบ
            </p>
            <p className="text-xs text-orange-600 mt-1">
              {stats.uniqueCoupons.join(", ") || "-"}
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <p className="text-sm text-orange-600 mb-1">สถานะ</p>
            <p className="text-2xl font-bold text-green-700">ปกติ</p>
            <p className="text-xs text-orange-600 mt-1">ยอดขายเต็มราคา - ไม่หักส่วนลด</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-xs text-orange-700">
            <strong>หมายเหตุ:</strong> คูปองสถานีใน M1 เป็นช่องทางการชำระเงินเท่านั้น (PaymentType = Coupon) 
            ไม่มีการหักส่วนลด ยอดขายยังคงเต็มราคา (Full Price) ตามข้อมูลจาก PTT BackOffice
          </p>
        </div>
      </div>

      {/* Sales by Payment Method */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">
          ยอดขายแยกตามช่องทางชำระเงิน (เงินสด 60%, QR 25%, คูปองสถานี {stats.totalSales > 0 ? ((stats.couponSales / stats.totalSales) * 100).toFixed(1) : 0}%)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.salesByPayment)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([method, amount]) => (
              <div key={method} className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-600 mb-1">{method}</p>
                <p className="text-2xl font-bold text-blue-900">
                  ฿{numberFormatter.format(amount)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.totalSales > 0 ? ((amount / stats.totalSales) * 100).toFixed(1) : 0}% ของยอดขาย
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <FilterBar
          onSearch={setSearchQuery}
          filters={[
            {
              label: "วันที่",
              value: dateFilter,
              options: [{ value: "", label: "ทั้งหมด" }],
              onChange: setDateFilter,
            },
            {
              label: "ช่องทางชำระ",
              value: paymentFilter,
              options: [{ value: "", label: "ทั้งหมด" }, ...paymentMethods.map((method) => ({ value: method, label: method }))],
              onChange: setPaymentFilter,
            },
            {
              label: "สาขา",
              value: branchFilter,
              options: [{ value: "", label: "ทั้งหมด" }, ...branches.map((branch) => ({ value: branch, label: branch }))],
              onChange: setBranchFilter,
            },
          ]}
        />

        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-slate-800 rounded-lg border border-blue-200 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>นำเข้า SALES_YYYYMMDD.xlsx</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-800">
                    {new Date(sale.date).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-500">{sale.branch}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-800">฿{numberFormatter.format(sale.amount)}</p>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                      {sale.paymentMethod}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                      {sale.source}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">
                    {sale.fuelType} • {sale.quantity.toLocaleString("th-TH")} ลิตร
                  </span>
                  {sale.couponCode && (
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-300">
                      คูปอง: {sale.couponCode}
                    </span>
                  )}
                </div>
                {sale.paymentMethod === "คูปองสถานี" && (
                  <span className="text-xs text-gray-500 italic">
                    (ยอดขายเต็มราคา - ไม่มีส่วนลด)
                  </span>
                )}
              </div>
            </div>
          ))}
          {filteredSales.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              ไม่พบข้อมูลยอดขาย
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
