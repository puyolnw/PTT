import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  Lock,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Receipt,
  Building2,
  Package,
  Clock,
  Users,
  Link2,
  History,
  AlertTriangle,
  Bell,
} from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data สำหรับ M6 - ระบบบัญชีและการปิดงบดุล
const mockAccountingData = {
  currentMonth: {
    revenue: 5500000, // รายได้รวม
    expenses: 4200000, // ค่าใช้จ่ายรวม
    netProfit: 1300000, // กำไรสุทธิ
    vatOutput: 350000, // VAT Output
    vatInput: 280000, // VAT Input
    vatPayable: 70000, // VAT ที่ต้องจ่าย
  },
  lastMonth: {
    revenue: 5200000,
    expenses: 4000000,
    netProfit: 1200000,
  },
  bySource: {
    m1: { amount: 5000000, name: "ขายน้ำมัน (M1)", percentage: 90.9 },
    m2: { amount: 150000, name: "ค่าเช่า (M2)", percentage: 2.7 },
    m3: { amount: 200000, name: "อื่นๆ (M3)", percentage: 3.6 },
    m5: { amount: 150000, name: "ดอกเบี้ย (M5)", percentage: 2.7 },
  },
  financialRatios: {
    currentRatio: 1.8,
    debtToEquity: 0.6,
    liquidity: "ดี",
  },
  monthEndStatus: {
    isClosed: true,
    closedDate: "2024-10-31",
    closedBy: "ผู้ดูแลระบบ",
  },
  recentJournalEntries: [
    { id: "1", date: "2024-12-15", description: "M1 ขายน้ำมัน 500,000 บาท", amount: 500000, type: "revenue" },
    { id: "2", date: "2024-12-14", description: "M2 รับค่าเช่า 25,000 บาท", amount: 25000, type: "revenue" },
    { id: "3", date: "2024-12-13", description: "M3 เงินเดือน 200,000 บาท", amount: 200000, type: "expense" },
  ],
  bankReconciliation: {
    systemBalance: 5000000,
    bankBalance: 4990000,
    difference: 10000,
    matchRate: 99.8,
  },
};

export default function AccountingDashboard() {
  const revenueChange = ((mockAccountingData.currentMonth.revenue - mockAccountingData.lastMonth.revenue) / mockAccountingData.lastMonth.revenue) * 100;
  const profitChange = ((mockAccountingData.currentMonth.netProfit - mockAccountingData.lastMonth.netProfit) / mockAccountingData.lastMonth.netProfit) * 100;

  const overviewStats = [
    {
      title: "รายได้รวม",
      value: currencyFormatter.format(mockAccountingData.currentMonth.revenue),
      subtitle: `เดือนที่แล้ว ${currencyFormatter.format(mockAccountingData.lastMonth.revenue)}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-500",
      change: revenueChange > 0 ? `+${revenueChange.toFixed(1)}%` : `${revenueChange.toFixed(1)}%`,
    },
    {
      title: "ค่าใช้จ่ายรวม",
      value: currencyFormatter.format(mockAccountingData.currentMonth.expenses),
      subtitle: `รวมทุกโมดูล`,
      icon: TrendingDown,
      gradient: "from-red-500 to-orange-500",
    },
    {
      title: "กำไรสุทธิ",
      value: currencyFormatter.format(mockAccountingData.currentMonth.netProfit),
      subtitle: `เดือนที่แล้ว ${currencyFormatter.format(mockAccountingData.lastMonth.netProfit)}`,
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      change: profitChange > 0 ? `+${profitChange.toFixed(1)}%` : `${profitChange.toFixed(1)}%`,
    },
    {
      title: "VAT ที่ต้องจ่าย",
      value: currencyFormatter.format(mockAccountingData.currentMonth.vatPayable),
      subtitle: `Output ${currencyFormatter.format(mockAccountingData.currentMonth.vatOutput)} - Input ${currencyFormatter.format(mockAccountingData.currentMonth.vatInput)}`,
      icon: Calculator,
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">M6: ระบบบัญชีและการปิดงบดุล</h2>
        <p className="text-muted font-light">
          รับข้อมูลจากทุกโมดูล → ลงบัญชีอัตโนมัติ → ปิดงบดุลรายเดือน → ออกรายงานการเงิน
        </p>
        <p className="text-xs text-muted/70">
          อัปเดตล่าสุด: {new Date().toLocaleDateString("th-TH", { 
            year: "numeric", 
            month: "long", 
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="panel rounded-2xl p-6 hover:border-ptt-blue/30 transition-all duration-200 shadow-app"
          >
            <div className="flex items-center justify-between mb-5">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                <stat.icon className="w-6 h-6 text-app" />
              </div>
              {stat.change && (
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {stat.change.startsWith('+') ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              )}
            </div>
            <h3 className="text-muted text-sm mb-2">{stat.title}</h3>
            <p className="text-2xl font-bold text-app mb-1">{stat.value}</p>
            <p className="text-sm text-muted">{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* สถานะปิดงบดุล */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`panel rounded-2xl p-6 shadow-app border-2 ${
          mockAccountingData.monthEndStatus.isClosed 
            ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5" 
            : "border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              mockAccountingData.monthEndStatus.isClosed 
                ? "bg-emerald-500/20 border border-emerald-500/30" 
                : "bg-orange-500/20 border border-orange-500/30"
            }`}>
              <Lock className={`w-6 h-6 ${
                mockAccountingData.monthEndStatus.isClosed ? "text-emerald-400" : "text-orange-400"
              }`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-app">สถานะปิดงบดุล</h3>
              <p className="text-sm text-muted">
                {mockAccountingData.monthEndStatus.isClosed 
                  ? `ปิดแล้ว (${new Date(mockAccountingData.monthEndStatus.closedDate).toLocaleDateString("th-TH")})` 
                  : "ยังไม่ปิดงบดุล"}
              </p>
            </div>
          </div>
          {mockAccountingData.monthEndStatus.isClosed && (
            <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
              ✅ ปิดแล้ว
            </span>
          )}
        </div>
        {mockAccountingData.monthEndStatus.isClosed && (
          <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <p className="text-sm text-emerald-400/80">
              ปิดงบดุลเมื่อ: {new Date(mockAccountingData.monthEndStatus.closedDate).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })} โดย {mockAccountingData.monthEndStatus.closedBy}
            </p>
          </div>
        )}
      </motion.div>

      {/* รายได้แยกตามโมดูล */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายได้แยกตามโมดูล</h3>
            <p className="text-sm text-muted">ข้อมูลจาก M1, M2, M3, M5 → ลงบัญชีอัตโนมัติ</p>
          </div>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(mockAccountingData.bySource).map(([key, data]) => (
            <div key={key} className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">{data.name}</p>
              <p className="text-2xl font-bold text-ptt-cyan">
                {currencyFormatter.format(data.amount)}
              </p>
              <p className="text-xs text-muted mt-1">
                {data.percentage}% ของรายได้รวม
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* สภาพคล่องและอัตราส่วนทางการเงิน */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="panel rounded-2xl p-6 shadow-app xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">สภาพคล่องและอัตราส่วนทางการเงิน</h3>
              <p className="text-sm text-muted">Current Ratio, D/E Ratio</p>
            </div>
            <BarChart3 className="w-6 h-6 text-muted" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">Current Ratio</p>
              <p className="text-3xl font-bold text-emerald-400">
                {mockAccountingData.financialRatios.currentRatio}
              </p>
              <p className="text-xs text-muted mt-1">สภาพคล่อง: {mockAccountingData.financialRatios.liquidity}</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">หนี้ต่อทุน (D/E)</p>
              <p className="text-3xl font-bold text-blue-400">
                {mockAccountingData.financialRatios.debtToEquity}
              </p>
              <p className="text-xs text-muted mt-1">อัตราส่วนหนี้สินต่อทุน</p>
            </div>
          </div>
        </motion.div>

        {/* กระทบยอดธนาคาร */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">กระทบยอดธนาคาร</h3>
              <p className="text-sm text-muted">อัตราการตรงกัน: {mockAccountingData.bankReconciliation.matchRate}%</p>
            </div>
            <Building2 className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-4">
            <div className="bg-soft border border-app rounded-xl p-4">
              <p className="text-sm text-muted mb-1">ยอดระบบ</p>
              <p className="text-xl font-bold text-app">
                {currencyFormatter.format(mockAccountingData.bankReconciliation.systemBalance)}
              </p>
            </div>
            <div className="bg-soft border border-app rounded-xl p-4">
              <p className="text-sm text-muted mb-1">ยอดธนาคาร</p>
              <p className="text-xl font-bold text-app">
                {currencyFormatter.format(mockAccountingData.bankReconciliation.bankBalance)}
              </p>
            </div>
            <div className={`rounded-xl p-4 ${
              Math.abs(mockAccountingData.bankReconciliation.difference) < 10000
                ? "bg-emerald-500/10 border border-emerald-500/30"
                : "bg-orange-500/10 border border-orange-500/30"
            }`}>
              <p className="text-sm text-muted mb-1">ส่วนต่าง</p>
              <p className={`text-xl font-bold ${
                Math.abs(mockAccountingData.bankReconciliation.difference) < 10000
                  ? "text-emerald-400"
                  : "text-orange-400"
              }`}>
                {currencyFormatter.format(mockAccountingData.bankReconciliation.difference)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* รายการบัญชีล่าสุด */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">รายการบัญชีล่าสุด</h3>
            <p className="text-sm text-muted">Journal Entries จากทุกโมดูล (อัตโนมัติ)</p>
          </div>
          <Receipt className="w-6 h-6 text-muted" />
        </div>
        <div className="space-y-3">
          {mockAccountingData.recentJournalEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 bg-soft rounded-xl border border-app"
            >
              <div>
                <p className="font-medium text-app">{entry.description}</p>
                <p className="text-sm text-muted">
                  {new Date(entry.date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold ${
                  entry.type === "revenue" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {entry.type === "revenue" ? "+" : "-"}
                  {currencyFormatter.format(entry.amount)}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                  entry.type === "revenue" 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                }`}>
                  {entry.type === "revenue" ? "รายได้" : "ค่าใช้จ่าย"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* สรุปการเงิน - เดือนตุลาคม 2568 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-app">สรุปการเงิน - เดือนตุลาคม 2568</h3>
          <FileText className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">รายได้รวม</p>
            <p className="text-2xl font-bold text-emerald-400">
              {currencyFormatter.format(mockAccountingData.currentMonth.revenue)}
            </p>
            <div className="mt-2 space-y-1">
              {Object.entries(mockAccountingData.bySource).map(([key, data]) => (
                <p key={key} className="text-xs text-muted">
                  - {data.name}: {currencyFormatter.format(data.amount)}
                </p>
              ))}
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">ค่าใช้จ่ายรวม</p>
            <p className="text-2xl font-bold text-red-400">
              {currencyFormatter.format(mockAccountingData.currentMonth.expenses)}
            </p>
            <p className="text-xs text-muted mt-1">รวมทุกโมดูล</p>
          </div>
          <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
            <p className="text-sm text-muted mb-1">กำไรสุทธิ</p>
            <p className="text-2xl font-bold text-ptt-cyan">
              {currencyFormatter.format(mockAccountingData.currentMonth.netProfit)}
            </p>
            <p className="text-xs text-muted mt-1">
              สภาพคล่อง (Current Ratio): {mockAccountingData.financialRatios.currentRatio}
            </p>
            <p className="text-xs text-muted">
              หนี้ต่อทุน (D/E): {mockAccountingData.financialRatios.debtToEquity}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Links to New Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-app">ฟีเจอร์เพิ่มเติม</h3>
          <BarChart3 className="w-6 h-6 text-muted" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <a href="/app/accounting/fixed-assets" className="flex flex-col items-center gap-2 p-4 bg-soft hover:bg-soft/80 border border-app rounded-xl transition-all hover:border-ptt-blue/30 hover:scale-105">
            <Package className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-center text-app font-medium">สินทรัพย์ถาวร</span>
          </a>
          <a href="/app/accounting/inventory-reconciliation" className="flex flex-col items-center gap-2 p-4 bg-soft hover:bg-soft/80 border border-app rounded-xl transition-all hover:border-ptt-blue/30 hover:scale-105">
            <Package className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-center text-app font-medium">กระทบยอดสต็อก</span>
          </a>
          <a href="/app/accounting/trial-balance" className="flex flex-col items-center gap-2 p-4 bg-soft hover:bg-soft/80 border border-app rounded-xl transition-all hover:border-ptt-blue/30 hover:scale-105">
            <FileText className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-center text-app font-medium">งบทดลอง</span>
          </a>
          <a href="/app/accounting/aging-report" className="flex flex-col items-center gap-2 p-4 bg-soft hover:bg-soft/80 border border-app rounded-xl transition-all hover:border-ptt-blue/30 hover:scale-105">
            <Clock className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-center text-app font-medium">รายงานอายุหนี้</span>
          </a>
          <a href="/app/accounting/vendors-customers" className="flex flex-col items-center gap-2 p-4 bg-soft hover:bg-soft/80 border border-app rounded-xl transition-all hover:border-ptt-blue/30 hover:scale-105">
            <Users className="w-6 h-6 text-purple-400" />
            <span className="text-xs text-center text-app font-medium">คู่ค้า</span>
          </a>
          <a href="/app/accounting/gl-mapping" className="flex flex-col items-center gap-2 p-4 bg-soft hover:bg-soft/80 border border-app rounded-xl transition-all hover:border-ptt-blue/30 hover:scale-105">
            <Link2 className="w-6 h-6 text-ptt-cyan" />
            <span className="text-xs text-center text-app font-medium">GL Mapping</span>
          </a>
          <a href="/app/accounting/legal-entities" className="flex flex-col items-center gap-2 p-4 bg-soft hover:bg-soft/80 border border-app rounded-xl transition-all hover:border-ptt-blue/30 hover:scale-105">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-center text-app font-medium">นิติบุคคล</span>
          </a>
          <a href="/app/accounting/audit-trail" className="flex flex-col items-center gap-2 p-4 bg-soft hover:bg-soft/80 border border-app rounded-xl transition-all hover:border-ptt-blue/30 hover:scale-105">
            <History className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-center text-app font-medium">Audit Trail</span>
          </a>
          <a href="/app/accounting/tax-reports" className="flex flex-col items-center gap-2 p-4 bg-soft hover:bg-soft/80 border border-app rounded-xl transition-all hover:border-ptt-blue/30 hover:scale-105">
            <FileText className="w-6 h-6 text-red-400" />
            <span className="text-xs text-center text-app font-medium">รายงานภาษี</span>
          </a>
          <a href="/app/accounting/advanced-analytics" className="flex flex-col items-center gap-2 p-4 bg-soft hover:bg-soft/80 border border-app rounded-xl transition-all hover:border-ptt-blue/30 hover:scale-105">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-center text-app font-medium">วิเคราะห์ขั้นสูง</span>
          </a>
          <a href="/app/accounting/risk-dashboard" className="flex flex-col items-center gap-2 p-4 bg-soft hover:bg-soft/80 border border-app rounded-xl transition-all hover:border-ptt-blue/30 hover:scale-105">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-center text-app font-medium">แดชบอร์ดความเสี่ยง</span>
          </a>
          <a href="/app/accounting/alerts" className="flex flex-col items-center gap-2 p-4 bg-soft hover:bg-soft/80 border border-app rounded-xl transition-all hover:border-ptt-blue/30 hover:scale-105">
            <Bell className="w-6 h-6 text-purple-400" />
            <span className="text-xs text-center text-app font-medium">การแจ้งเตือน</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}

