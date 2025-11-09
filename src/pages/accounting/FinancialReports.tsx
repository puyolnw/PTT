import { motion } from "framer-motion";
import { FileText, Download, BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Financial Reports
const mockReports = {
  balanceSheet: {
    period: "ตุลาคม 2568",
    assets: {
      current: {
        cash: 500000,
        bank: 5000000,
        receivables: 200000,
        inventory: 1000000,
        total: 6700000,
      },
      fixed: {
        equipment: 5000000,
        building: 3000000,
        total: 8000000,
      },
      total: 14700000,
    },
    liabilities: {
      current: {
        payables: 300000,
        vatPayable: 70000,
        total: 370000,
      },
      longTerm: {
        loans: 5000000,
        total: 5000000,
      },
      total: 5370000,
    },
    equity: {
      capital: 10000000,
      retainedEarnings: -670000,
      total: 9330000,
    },
  },
  incomeStatement: {
    period: "ตุลาคม 2568",
    revenue: {
      sales: 5000000,
      rental: 150000,
      interest: 150000,
      other: 200000,
      total: 5500000,
    },
    expenses: {
      salaries: 2000000,
      rent: 50000,
      utilities: 100000,
      depreciation: 50000,
      other: 2000000,
      total: 4200000,
    },
    netProfit: 1300000,
  },
  cashFlow: {
    period: "ตุลาคม 2568",
    operating: {
      netIncome: 1300000,
      depreciation: 50000,
      changesInWorkingCapital: -200000,
      total: 1150000,
    },
    investing: {
      equipment: -500000,
      total: -500000,
    },
    financing: {
      loans: 1000000,
      dividends: -300000,
      total: 700000,
    },
    netChange: 1350000,
    beginningBalance: 3650000,
    endingBalance: 5000000,
  },
};

export default function FinancialReports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">รายงานการเงิน</h2>
        <p className="text-muted font-light">
          งบกำไรขาดทุน, งบดุล, Cash Flow • PDF/Excel
        </p>
      </motion.div>

      {/* Report Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app cursor-pointer hover:border-ptt-blue/30 transition-all"
          onClick={() => setSelectedReport("balance")}
        >
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-ptt-cyan" />
            <span className="px-3 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30 text-xs">
              งบดุล
            </span>
          </div>
          <h3 className="text-lg font-semibold text-app mb-2">งบดุล (Balance Sheet)</h3>
          <p className="text-sm text-muted mb-4">แสดงสินทรัพย์ หนี้สิน และทุน</p>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 transition-colors">
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app cursor-pointer hover:border-ptt-blue/30 transition-all"
          onClick={() => setSelectedReport("income")}
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs">
              งบกำไรขาดทุน
            </span>
          </div>
          <h3 className="text-lg font-semibold text-app mb-2">งบกำไรขาดทุน (P&L)</h3>
          <p className="text-sm text-muted mb-4">แสดงรายได้และค่าใช้จ่าย</p>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 transition-colors">
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app cursor-pointer hover:border-ptt-blue/30 transition-all"
          onClick={() => setSelectedReport("cashflow")}
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-blue-400" />
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs">
              งบกระแสเงินสด
            </span>
          </div>
          <h3 className="text-lg font-semibold text-app mb-2">งบกระแสเงินสด (Cash Flow)</h3>
          <p className="text-sm text-muted mb-4">แสดงการไหลเข้าออกของเงินสด</p>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 transition-colors">
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Balance Sheet Detail */}
      {selectedReport === "balance" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-app">งบดุล - {mockReports.balanceSheet.period}</h3>
              <p className="text-sm text-muted">Balance Sheet</p>
            </div>
            <FileText className="w-6 h-6 text-muted" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assets */}
            <div>
              <h4 className="text-lg font-semibold text-app mb-4">สินทรัพย์ (Assets)</h4>
              <div className="space-y-3">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-sm text-muted mb-2">สินทรัพย์หมุนเวียน</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">เงินสด</span>
                      <span className="text-app font-semibold">{currencyFormatter.format(mockReports.balanceSheet.assets.current.cash)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">เงินฝากธนาคาร</span>
                      <span className="text-app font-semibold">{currencyFormatter.format(mockReports.balanceSheet.assets.current.bank)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">ลูกหนี้</span>
                      <span className="text-app font-semibold">{currencyFormatter.format(mockReports.balanceSheet.assets.current.receivables)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">สต็อก</span>
                      <span className="text-app font-semibold">{currencyFormatter.format(mockReports.balanceSheet.assets.current.inventory)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-emerald-500/30">
                      <span className="font-semibold text-app">รวมสินทรัพย์หมุนเวียน</span>
                      <span className="font-bold text-emerald-400">{currencyFormatter.format(mockReports.balanceSheet.assets.current.total)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-sm text-muted mb-2">สินทรัพย์ถาวร</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">อุปกรณ์</span>
                      <span className="text-app font-semibold">{currencyFormatter.format(mockReports.balanceSheet.assets.fixed.equipment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">อาคาร</span>
                      <span className="text-app font-semibold">{currencyFormatter.format(mockReports.balanceSheet.assets.fixed.building)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-500/30">
                      <span className="font-semibold text-app">รวมสินทรัพย์ถาวร</span>
                      <span className="font-bold text-blue-400">{currencyFormatter.format(mockReports.balanceSheet.assets.fixed.total)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-app">รวมสินทรัพย์</span>
                    <span className="text-2xl font-bold text-ptt-cyan">{currencyFormatter.format(mockReports.balanceSheet.assets.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div>
              <h4 className="text-lg font-semibold text-app mb-4">หนี้สินและทุน</h4>
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-sm text-muted mb-2">หนี้สินหมุนเวียน</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">เจ้าหนี้</span>
                      <span className="text-app font-semibold">{currencyFormatter.format(mockReports.balanceSheet.liabilities.current.payables)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">VAT ที่ต้องจ่าย</span>
                      <span className="text-app font-semibold">{currencyFormatter.format(mockReports.balanceSheet.liabilities.current.vatPayable)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-red-500/30">
                      <span className="font-semibold text-app">รวมหนี้สินหมุนเวียน</span>
                      <span className="font-bold text-red-400">{currencyFormatter.format(mockReports.balanceSheet.liabilities.current.total)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                  <p className="text-sm text-muted mb-2">หนี้สินระยะยาว</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">เงินกู้</span>
                      <span className="text-app font-semibold">{currencyFormatter.format(mockReports.balanceSheet.liabilities.longTerm.loans)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-orange-500/30">
                      <span className="font-semibold text-app">รวมหนี้สินระยะยาว</span>
                      <span className="font-bold text-orange-400">{currencyFormatter.format(mockReports.balanceSheet.liabilities.longTerm.total)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <p className="text-sm text-muted mb-2">ทุน</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">ทุนจดทะเบียน</span>
                      <span className="text-app font-semibold">{currencyFormatter.format(mockReports.balanceSheet.equity.capital)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">กำไรสะสม</span>
                      <span className="text-app font-semibold">{currencyFormatter.format(mockReports.balanceSheet.equity.retainedEarnings)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-purple-500/30">
                      <span className="font-semibold text-app">รวมทุน</span>
                      <span className="font-bold text-purple-400">{currencyFormatter.format(mockReports.balanceSheet.equity.total)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-app">รวมหนี้สินและทุน</span>
                    <span className="text-2xl font-bold text-ptt-cyan">{currencyFormatter.format(mockReports.balanceSheet.liabilities.total + mockReports.balanceSheet.equity.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Income Statement Detail */}
      {selectedReport === "income" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-app">งบกำไรขาดทุน - {mockReports.incomeStatement.period}</h3>
              <p className="text-sm text-muted">Income Statement / Profit & Loss</p>
            </div>
            <TrendingUp className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-app mb-4">รายได้ (Revenue)</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">ขายน้ำมัน</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.incomeStatement.revenue.sales)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">ค่าเช่า</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.incomeStatement.revenue.rental)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">ดอกเบี้ย</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.incomeStatement.revenue.interest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">อื่นๆ</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.incomeStatement.revenue.other)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-emerald-500/30">
                  <span className="text-lg font-semibold text-app">รวมรายได้</span>
                  <span className="text-2xl font-bold text-emerald-400">{currencyFormatter.format(mockReports.incomeStatement.revenue.total)}</span>
                </div>
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-app mb-4">ค่าใช้จ่าย (Expenses)</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">เงินเดือน</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.incomeStatement.expenses.salaries)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">ค่าเช่า</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.incomeStatement.expenses.rent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">สาธารณูปโภค</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.incomeStatement.expenses.utilities)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">ค่าเสื่อมราคา</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.incomeStatement.expenses.depreciation)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">อื่นๆ</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.incomeStatement.expenses.other)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-red-500/30">
                  <span className="text-lg font-semibold text-app">รวมค่าใช้จ่าย</span>
                  <span className="text-2xl font-bold text-red-400">{currencyFormatter.format(mockReports.incomeStatement.expenses.total)}</span>
                </div>
              </div>
            </div>
            <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-6">
              <div className="flex justify-between">
                <span className="text-xl font-semibold text-app">กำไรสุทธิ (Net Profit)</span>
                <span className="text-3xl font-bold text-ptt-cyan">{currencyFormatter.format(mockReports.incomeStatement.netProfit)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cash Flow Detail */}
      {selectedReport === "cashflow" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-app">งบกระแสเงินสด - {mockReports.cashFlow.period}</h3>
              <p className="text-sm text-muted">Cash Flow Statement</p>
            </div>
            <DollarSign className="w-6 h-6 text-muted" />
          </div>
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-app mb-4">กระแสเงินสดจากการดำเนินงาน</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">กำไรสุทธิ</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.cashFlow.operating.netIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">ค่าเสื่อมราคา</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.cashFlow.operating.depreciation)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">การเปลี่ยนแปลงเงินทุนหมุนเวียน</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.cashFlow.operating.changesInWorkingCapital)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-emerald-500/30">
                  <span className="text-lg font-semibold text-app">รวมกระแสเงินสดจากการดำเนินงาน</span>
                  <span className="text-2xl font-bold text-emerald-400">{currencyFormatter.format(mockReports.cashFlow.operating.total)}</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-app mb-4">กระแสเงินสดจากการลงทุน</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">ซื้ออุปกรณ์</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.cashFlow.investing.equipment)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-blue-500/30">
                  <span className="text-lg font-semibold text-app">รวมกระแสเงินสดจากการลงทุน</span>
                  <span className="text-2xl font-bold text-blue-400">{currencyFormatter.format(mockReports.cashFlow.investing.total)}</span>
                </div>
              </div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-app mb-4">กระแสเงินสดจากการจัดหาเงิน</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">เงินกู้</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.cashFlow.financing.loans)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">จ่ายเงินปันผล</span>
                  <span className="text-app font-semibold">{currencyFormatter.format(mockReports.cashFlow.financing.dividends)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-purple-500/30">
                  <span className="text-lg font-semibold text-app">รวมกระแสเงินสดจากการจัดหาเงิน</span>
                  <span className="text-2xl font-bold text-purple-400">{currencyFormatter.format(mockReports.cashFlow.financing.total)}</span>
                </div>
              </div>
            </div>
            <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-app">การเปลี่ยนแปลงสุทธิของเงินสด</span>
                  <span className="text-2xl font-bold text-ptt-cyan">{currencyFormatter.format(mockReports.cashFlow.netChange)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-ptt-blue/30">
                  <span className="text-lg font-semibold text-app">ยอดเงินสดต้นงวด</span>
                  <span className="text-xl font-bold text-app">{currencyFormatter.format(mockReports.cashFlow.beginningBalance)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-ptt-blue/30">
                  <span className="text-xl font-semibold text-app">ยอดเงินสดปลายงวด</span>
                  <span className="text-3xl font-bold text-ptt-cyan">{currencyFormatter.format(mockReports.cashFlow.endingBalance)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

