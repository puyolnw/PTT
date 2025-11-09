import { motion } from "framer-motion";
import { Calculator, FileText, Download, RefreshCw, AlertCircle } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Tax Calculation
const mockTaxData = {
  period: "ตุลาคม 2568",
  vatRate: 7,
  vatOutput: {
    total: 350000,
    fromM1: 320000, // จาก M1 ขายน้ำมัน
    fromM2: 11000,  // จาก M2 ค่าเช่า
    fromM3: 0,
    fromM5: 19000,  // จาก M5 ดอกเบี้ย
    transactions: [
      { id: "1", date: "2024-10-15", description: "M1 ขายน้ำมัน 500,000 บาท", amount: 500000, vat: 32710, module: "M1" },
      { id: "2", date: "2024-10-14", description: "M2 รับค่าเช่า 25,000 บาท", amount: 25000, vat: 1636, module: "M2" },
      { id: "3", date: "2024-10-13", description: "M5 ดอกเบี้ย 270,000 บาท", amount: 270000, vat: 18900, module: "M5" },
    ],
  },
  vatInput: {
    total: 280000,
    fromPurchases: 250000,
    fromExpenses: 30000,
    transactions: [
      { id: "1", date: "2024-10-10", description: "ซื้อน้ำมัน 3,500,000 บาท", amount: 3500000, vat: 245000 },
      { id: "2", date: "2024-10-08", description: "ค่าใช้จ่ายอื่นๆ 430,000 บาท", amount: 430000, vat: 30000 },
    ],
  },
  withholdingTax: {
    total: 50000,
    fromSalaries: 40000,
    fromServices: 10000,
    transactions: [
      { id: "1", date: "2024-10-13", description: "หัก ณ ที่จ่าย - เงินเดือน", amount: 2000000, tax: 40000, rate: 2 },
      { id: "2", date: "2024-10-05", description: "หัก ณ ที่จ่าย - บริการ", amount: 200000, tax: 10000, rate: 5 },
    ],
  },
  vatPayable: 70000, // VAT Output - VAT Input
  netTaxPayable: 120000, // VAT Payable + Withholding Tax
};

export default function TaxCalculation() {

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">คำนวณภาษีอัตโนมัติ</h2>
        <p className="text-muted font-light">
          VAT Input/Output, ภาษีหัก ณ ที่จ่าย จากทุกธุรกรรม
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-purple-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <Calculator className="w-6 h-6 text-purple-400" />
            <span className="text-xs text-muted">VAT Output</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">
            {currencyFormatter.format(mockTaxData.vatOutput.total)}
          </p>
          <p className="text-xs text-muted mt-1">อัตรา {mockTaxData.vatRate}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-blue-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <Calculator className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-muted">VAT Input</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {currencyFormatter.format(mockTaxData.vatInput.total)}
          </p>
          <p className="text-xs text-muted mt-1">หักลดหย่อนได้</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-orange-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <Calculator className="w-6 h-6 text-orange-400" />
            <span className="text-xs text-muted">ภาษีหัก ณ ที่จ่าย</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {currencyFormatter.format(mockTaxData.withholdingTax.total)}
          </p>
          <p className="text-xs text-muted mt-1">หักจากทุกธุรกรรม</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6 shadow-app border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5"
        >
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-muted">ภาษีที่ต้องจ่าย</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {currencyFormatter.format(mockTaxData.netTaxPayable)}
          </p>
          <p className="text-xs text-muted mt-1">
            VAT: {currencyFormatter.format(mockTaxData.vatPayable)} + หัก ณ ที่จ่าย: {currencyFormatter.format(mockTaxData.withholdingTax.total)}
          </p>
        </motion.div>
      </div>

      {/* VAT Output Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">VAT Output (ภาษีขาย)</h3>
            <p className="text-sm text-muted">รวม: {currencyFormatter.format(mockTaxData.vatOutput.total)}</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-soft rounded-lg transition-colors">
              <RefreshCw className="w-5 h-5 text-muted" />
            </button>
            <button className="p-2 hover:bg-soft rounded-lg transition-colors">
              <Download className="w-5 h-5 text-muted" />
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {mockTaxData.vatOutput.transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl"
            >
              <div>
                <p className="font-medium text-app">{transaction.description}</p>
                <p className="text-xs text-muted">
                  {new Date(transaction.date).toLocaleDateString("th-TH")} • {transaction.module}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted">ยอดรวม</p>
                <p className="text-lg font-bold text-app">
                  {currencyFormatter.format(transaction.amount)}
                </p>
                <p className="text-sm text-purple-400 mt-1">
                  VAT {mockTaxData.vatRate}%: {currencyFormatter.format(transaction.vat)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* VAT Input Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">VAT Input (ภาษีซื้อ)</h3>
            <p className="text-sm text-muted">รวม: {currencyFormatter.format(mockTaxData.vatInput.total)}</p>
          </div>
        </div>
        <div className="space-y-3">
          {mockTaxData.vatInput.transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
            >
              <div>
                <p className="font-medium text-app">{transaction.description}</p>
                <p className="text-xs text-muted">
                  {new Date(transaction.date).toLocaleDateString("th-TH")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted">ยอดรวม</p>
                <p className="text-lg font-bold text-app">
                  {currencyFormatter.format(transaction.amount)}
                </p>
                <p className="text-sm text-blue-400 mt-1">
                  VAT {mockTaxData.vatRate}%: {currencyFormatter.format(transaction.vat)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Withholding Tax Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">ภาษีหัก ณ ที่จ่าย</h3>
            <p className="text-sm text-muted">รวม: {currencyFormatter.format(mockTaxData.withholdingTax.total)}</p>
          </div>
        </div>
        <div className="space-y-3">
          {mockTaxData.withholdingTax.transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl"
            >
              <div>
                <p className="font-medium text-app">{transaction.description}</p>
                <p className="text-xs text-muted">
                  {new Date(transaction.date).toLocaleDateString("th-TH")} • อัตรา {transaction.rate}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted">ยอดรวม</p>
                <p className="text-lg font-bold text-app">
                  {currencyFormatter.format(transaction.amount)}
                </p>
                <p className="text-sm text-orange-400 mt-1">
                  หัก {transaction.rate}%: {currencyFormatter.format(transaction.tax)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tax Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="panel rounded-2xl p-6 shadow-app bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-2 border-emerald-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-app">สรุปภาษีที่ต้องจ่าย</h3>
          <FileText className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-soft border border-app rounded-xl p-4">
            <p className="text-sm text-muted mb-1">VAT Output</p>
            <p className="text-2xl font-bold text-purple-400">
              {currencyFormatter.format(mockTaxData.vatOutput.total)}
            </p>
          </div>
          <div className="bg-soft border border-app rounded-xl p-4">
            <p className="text-sm text-muted mb-1">VAT Input (หักลดหย่อน)</p>
            <p className="text-2xl font-bold text-blue-400">
              -{currencyFormatter.format(mockTaxData.vatInput.total)}
            </p>
          </div>
          <div className="bg-soft border border-app rounded-xl p-4">
            <p className="text-sm text-muted mb-1">VAT ที่ต้องจ่าย</p>
            <p className="text-2xl font-bold text-emerald-400">
              {currencyFormatter.format(mockTaxData.vatPayable)}
            </p>
          </div>
        </div>
        <div className="mt-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted mb-1">ภาษีหัก ณ ที่จ่าย</p>
              <p className="text-2xl font-bold text-emerald-400">
                {currencyFormatter.format(mockTaxData.withholdingTax.total)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted mb-1">รวมภาษีที่ต้องจ่าย</p>
              <p className="text-3xl font-bold text-emerald-400">
                {currencyFormatter.format(mockTaxData.netTaxPayable)}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
            <Download className="w-5 h-5" />
            <span>ส่งกรมสรรพากร (e-Tax)</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-soft hover:bg-soft/80 border border-app rounded-xl text-app transition-colors">
            <FileText className="w-5 h-5" />
            <span>ออกรายงาน PDF</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

