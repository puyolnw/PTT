import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Upload,
  TrendingUp,
  FileText,
  Fuel,
  CreditCard,
  Ticket,
} from "lucide-react";
import FilterBar from "@/components/FilterBar";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

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
      // Simulate file processing from PTT BackOffice
      alert(`กำลังประมวลผลไฟล์ ${file.name}...\n\nระบบจะประมวลผลยอดขายแยกตามช่องทางชำระเงิน 12 ช่องทาง`);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ยอดขาย - M1</h2>
        <p className="text-muted font-light">
          ประมวลผลยอดขายแยกตามช่องทางชำระเงิน 12 ช่องทาง (เงินสด, Master/VISA, KBANK-CARD, PTT Privilege Energy Card, Fleet Card, Top up Card, ttb Fill&GO+, BBL Fleet Card, Visa Local Card, QR/KPLUS/PROMPTPAY, คูปองสถานี, ลูกหนี้เงินเชื่อ) นำเข้า Excel จาก PTT BackOffice
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-emerald-400" />
            <span className="text-sm text-muted">ยอดขายวันนี้</span>
          </div>
          <p className="text-2xl font-bold text-app">{currencyFormatter.format(todaySales)}</p>
          <p className="text-sm text-muted">
            {salesData.filter((s) => s.date === new Date().toISOString().split("T")[0]).length} รายการ
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-ptt-cyan" />
            <span className="text-sm text-muted">ยอดขายเดือนนี้</span>
          </div>
          <p className="text-2xl font-bold text-app">{currencyFormatter.format(thisMonthSales)}</p>
          <p className="text-sm text-muted">รายเดือน</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-muted">รายการทั้งหมด</span>
          </div>
          <p className="text-2xl font-bold text-app">{salesData.length}</p>
          <p className="text-sm text-muted">รายการขาย</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-8 h-8 text-green-400" />
            <span className="text-sm text-muted">ช่องทางชำระ</span>
          </div>
          <p className="text-2xl font-bold text-app">
            {Object.keys(salesByPayment).length}
          </p>
          <p className="text-sm text-muted">ช่องทาง</p>
        </motion.div>
      </div>

      {/* คูปองสถานี - ส่วนสรุปแยกต่างหาก */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="panel rounded-2xl p-6 border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/30">
              <Ticket className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-app">ระบบคูปองสถานี</h3>
              <p className="text-sm text-muted">ยอดขายด้วยคูปองสถานี (ยอดขายเต็มราคา - ไม่มีส่วนลด)</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-app/50 rounded-xl p-4 border border-orange-500/20">
            <p className="text-sm text-muted mb-1">ยอดขายด้วยคูปอง</p>
            <p className="text-2xl font-bold text-orange-400">
              {currencyFormatter.format(
                salesData
                  .filter((s) => s.paymentMethod === "คูปองสถานี")
                  .reduce((sum, s) => sum + s.amount, 0)
              )}
            </p>
            <p className="text-xs text-muted mt-1">
              {salesData.filter((s) => s.paymentMethod === "คูปองสถานี").length} รายการ
            </p>
          </div>
          <div className="bg-app/50 rounded-xl p-4 border border-orange-500/20">
            <p className="text-sm text-muted mb-1">จำนวนคูปองที่ใช้</p>
            <p className="text-2xl font-bold text-orange-400">
              {salesData.filter((s) => s.couponCode).length} ใบ
            </p>
            <p className="text-xs text-muted mt-1">
              {salesData
                .filter((s) => s.couponCode)
                .map((s) => s.couponCode)
                .filter((code, index, self) => self.indexOf(code) === index)
                .join(", ")}
            </p>
          </div>
          <div className="bg-app/50 rounded-xl p-4 border border-orange-500/20">
            <p className="text-sm text-muted mb-1">สถานะ</p>
            <p className="text-2xl font-bold text-emerald-400">ปกติ</p>
            <p className="text-xs text-muted mt-1">ยอดขายเต็มราคา - ไม่หักส่วนลด</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <p className="text-xs text-orange-400/80">
            <strong>หมายเหตุ:</strong> คูปองสถานีใน M1 เป็นช่องทางการชำระเงินเท่านั้น (PaymentType = Coupon) 
            ไม่มีการหักส่วนลด ยอดขายยังคงเต็มราคา (Full Price) ตามข้อมูลจาก PTT BackOffice
          </p>
        </div>
      </motion.div>

      {/* Sales by Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-app mb-4">ยอดขายแยกตามช่องทางชำระเงิน (เงินสด 60%, QR 25%, คูปองสถานี {((salesData.filter((s) => s.paymentMethod === "คูปองสถานี").reduce((sum, s) => sum + s.amount, 0) / totalSales) * 100).toFixed(1)}%)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(salesByPayment)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([method, amount]) => (
              <div key={method} className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
                <p className="text-sm text-muted mb-1">{method}</p>
                <p className="text-2xl font-bold text-ptt-cyan">
                  {currencyFormatter.format(amount)}
                </p>
                <p className="text-xs text-muted mt-1">
                  {totalSales > 0 ? ((amount / totalSales) * 100).toFixed(1) : 0}% ของยอดขาย
                </p>
              </div>
            ))}
        </div>
      </motion.div>

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
          <label className="flex items-center gap-2 px-4 py-2 bg-soft text-app rounded-lg hover:bg-app/10 transition-colors cursor-pointer">
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6"
      >
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="p-4 bg-soft rounded-xl border border-app hover:border-ptt-blue/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-app">
                    {new Date(sale.date).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted">{sale.branch}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-app">{currencyFormatter.format(sale.amount)}</p>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-xs px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30">
                      {sale.paymentMethod}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {sale.source}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-ptt-cyan" />
                  <span className="text-muted">
                    {sale.fuelType} • {sale.quantity.toLocaleString("th-TH")} ลิตร
                  </span>
                  {sale.couponCode && (
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
                      คูปอง: {sale.couponCode}
                    </span>
                  )}
                </div>
                {sale.paymentMethod === "คูปองสถานี" && (
                  <span className="text-xs text-muted italic">
                    (ยอดขายเต็มราคา - ไม่มีส่วนลด)
                  </span>
                )}
              </div>
            </div>
          ))}
          {filteredSales.length === 0 && (
            <div className="text-center py-12 text-muted">
              ไม่พบข้อมูลยอดขาย
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

