import { motion } from "framer-motion";
import { FileText, Download, Calculator, CheckCircle } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Tax Reports
const mockTaxReports = {
  withholdingTax: {
    pnd1: {
      period: "ตุลาคม 2568",
      total: 50000,
      items: [
        { id: "1", name: "เงินเดือน", amount: 2000000, tax: 40000, rate: 2 },
        { id: "2", name: "ค่าบริการ", amount: 200000, tax: 10000, rate: 5 },
      ],
      status: "พร้อมยื่น",
    },
    pnd3: {
      period: "ตุลาคม 2568",
      total: 30000,
      items: [
        { id: "1", name: "ค่าเช่า", amount: 500000, tax: 30000, rate: 6 },
      ],
      status: "พร้อมยื่น",
    },
    pnd53: {
      period: "ตุลาคม 2568",
      total: 20000,
      items: [
        { id: "1", name: "ค่าบริการอื่นๆ", amount: 400000, tax: 20000, rate: 5 },
      ],
      status: "พร้อมยื่น",
    },
  },
  socialSecurity: {
    period: "ตุลาคม 2568",
    total: 150000,
    items: [
      { id: "1", name: "สปส.1-10", description: "รายงานประกันสังคม", amount: 150000, status: "พร้อมยื่น" },
    ],
  },
  vat: {
    period: "ตุลาคม 2568",
    vatOutput: 350000,
    vatInput: 280000,
    vatPayable: 70000,
    status: "พร้อมยื่น",
  },
};

export default function TaxReports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">รายงานภาษีและกฎหมาย</h2>
        <p className="text-muted font-light">
          จัดทำภ.ง.ด.1/3/53, สปส.1-10, และรายงานยื่นออนไลน์
        </p>
      </motion.div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app cursor-pointer hover:border-ptt-blue/30 transition-all"
          onClick={() => setSelectedReport("pnd1")}
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-ptt-cyan" />
            <span className="px-3 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30 text-xs">
              ภ.ง.ด.1
            </span>
          </div>
          <h3 className="text-lg font-semibold text-app mb-2">ภ.ง.ด.1</h3>
          <p className="text-sm text-muted mb-3">ภาษีหัก ณ ที่จ่าย (เงินเดือน)</p>
          <p className="text-2xl font-bold text-ptt-cyan">
            {currencyFormatter.format(mockTaxReports.withholdingTax.pnd1.total)}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">{mockTaxReports.withholdingTax.pnd1.status}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel rounded-2xl p-6 shadow-app cursor-pointer hover:border-ptt-blue/30 transition-all"
          onClick={() => setSelectedReport("pnd3")}
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-blue-400" />
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs">
              ภ.ง.ด.3
            </span>
          </div>
          <h3 className="text-lg font-semibold text-app mb-2">ภ.ง.ด.3</h3>
          <p className="text-sm text-muted mb-3">ภาษีหัก ณ ที่จ่าย (ค่าเช่า)</p>
          <p className="text-2xl font-bold text-blue-400">
            {currencyFormatter.format(mockTaxReports.withholdingTax.pnd3.total)}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">{mockTaxReports.withholdingTax.pnd3.status}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel rounded-2xl p-6 shadow-app cursor-pointer hover:border-ptt-blue/30 transition-all"
          onClick={() => setSelectedReport("pnd53")}
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-purple-400" />
            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs">
              ภ.ง.ด.53
            </span>
          </div>
          <h3 className="text-lg font-semibold text-app mb-2">ภ.ง.ด.53</h3>
          <p className="text-sm text-muted mb-3">ภาษีหัก ณ ที่จ่าย (บริการ)</p>
          <p className="text-2xl font-bold text-purple-400">
            {currencyFormatter.format(mockTaxReports.withholdingTax.pnd53.total)}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">{mockTaxReports.withholdingTax.pnd53.status}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="panel rounded-2xl p-6 shadow-app cursor-pointer hover:border-ptt-blue/30 transition-all"
          onClick={() => setSelectedReport("social")}
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-orange-400" />
            <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs">
              สปส.1-10
            </span>
          </div>
          <h3 className="text-lg font-semibold text-app mb-2">สปส.1-10</h3>
          <p className="text-sm text-muted mb-3">รายงานประกันสังคม</p>
          <p className="text-2xl font-bold text-orange-400">
            {currencyFormatter.format(mockTaxReports.socialSecurity.total)}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">{mockTaxReports.socialSecurity.items[0].status}</span>
          </div>
        </motion.div>
      </div>

      {/* PND1 Detail */}
      {selectedReport === "pnd1" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">ภ.ง.ด.1 - {mockTaxReports.withholdingTax.pnd1.period}</h3>
              <p className="text-sm text-muted">ภาษีหัก ณ ที่จ่าย (เงินเดือน)</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
                <Download className="w-4 h-4" />
                <span>ส่งกรมสรรพากร</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-soft hover:bg-soft/80 border border-app rounded-xl text-app transition-colors">
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {mockTaxReports.withholdingTax.pnd1.items.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-app">{item.name}</p>
                    <p className="text-sm text-muted">
                      ยอดรวม: {currencyFormatter.format(item.amount)} • อัตรา: {item.rate}%
                    </p>
                  </div>
                  <p className="text-xl font-bold text-ptt-cyan">
                    {currencyFormatter.format(item.tax)}
                  </p>
                </div>
              </div>
            ))}
            <div className="p-4 bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-app">รวมภาษีหัก ณ ที่จ่าย</span>
                <span className="text-2xl font-bold text-ptt-cyan">
                  {currencyFormatter.format(mockTaxReports.withholdingTax.pnd1.total)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* VAT Report */}
      {selectedReport === "vat" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-app">ภ.พ.30 - {mockTaxReports.vat.period}</h3>
              <p className="text-sm text-muted">รายงานภาษีมูลค่าเพิ่ม</p>
            </div>
            <Calculator className="w-6 h-6 text-muted" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">VAT Output</p>
              <p className="text-2xl font-bold text-purple-400">
                {currencyFormatter.format(mockTaxReports.vat.vatOutput)}
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">VAT Input</p>
              <p className="text-2xl font-bold text-blue-400">
                {currencyFormatter.format(mockTaxReports.vat.vatInput)}
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <p className="text-sm text-muted mb-1">VAT ที่ต้องจ่าย</p>
              <p className="text-2xl font-bold text-emerald-400">
                {currencyFormatter.format(mockTaxReports.vat.vatPayable)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
              <Download className="w-4 h-4" />
              <span>ส่งกรมสรรพากร (e-Tax)</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-soft hover:bg-soft/80 border border-app rounded-xl text-app transition-colors">
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

