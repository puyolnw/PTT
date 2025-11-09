import { motion } from "framer-motion";
import { Download, Filter, Calendar, RefreshCw } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Journal Entries
const mockJournalEntries = [
  {
    id: "JE-001",
    date: "2024-12-15",
    description: "M1 ขายน้ำมัน 500,000 บาท",
    module: "M1 (ปั๊มน้ำมัน)",
    debit: [
      { account: "1120 - เงินฝากธนาคาร", amount: 500000 }
    ],
    credit: [
      { account: "4111 - รายได้ขายน้ำมัน", amount: 467290 },
      { account: "2011 - VAT Output", amount: 32710 }
    ],
    total: 500000,
    status: "Posted",
    createdBy: "ระบบอัตโนมัติ",
  },
  {
    id: "JE-002",
    date: "2024-12-14",
    description: "M2 รับค่าเช่า 25,000 บาท",
    module: "M2 (พื้นที่เช่า)",
    debit: [
      { account: "1110 - เงินสด", amount: 25000 }
    ],
    credit: [
      { account: "4112 - รายได้ค่าเช่า", amount: 23364 },
      { account: "2011 - VAT Output", amount: 1636 }
    ],
    total: 25000,
    status: "Posted",
    createdBy: "ระบบอัตโนมัติ",
  },
  {
    id: "JE-003",
    date: "2024-12-13",
    description: "M3 เงินเดือน 200,000 บาท",
    module: "M3 (บุคคล)",
    debit: [
      { account: "5121 - ค่าแรง", amount: 200000 }
    ],
    credit: [
      { account: "2010 - เจ้าหนี้", amount: 200000 }
    ],
    total: 200000,
    status: "Posted",
    createdBy: "ระบบอัตโนมัติ",
  },
  {
    id: "JE-004",
    date: "2024-12-12",
    description: "M5 กู้ยืม 100,000 บาท",
    module: "M5 (กองทุน)",
    debit: [
      { account: "1130 - ลูกหนี้", amount: 100000 }
    ],
    credit: [
      { account: "1110 - เงินสด", amount: 100000 }
    ],
    total: 100000,
    status: "Posted",
    createdBy: "ระบบอัตโนมัติ",
  },
];

export default function JournalEntries() {
  const [dateFilter, setDateFilter] = useState<string>("");

  const filteredEntries = mockJournalEntries.filter(entry => {
    if (dateFilter) {
      return entry.date === dateFilter;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">รายการบัญชี (Journal Entries)</h2>
        <p className="text-muted font-light">
          รับข้อมูลจาก M1, M2, M3, M5 → ลง Journal อัตโนมัติ
        </p>
      </motion.div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 items-center">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-soft hover:bg-soft/80 border border-app rounded-xl text-app transition-colors">
            <Filter className="w-5 h-5" />
            <span>กรอง</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-soft hover:bg-soft/80 border border-app rounded-xl text-app transition-colors">
            <RefreshCw className="w-5 h-5" />
            <span>รีเฟรช</span>
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
          <Download className="w-5 h-5" />
          <span>ส่งออก Excel</span>
        </button>
      </div>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {filteredEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="panel rounded-2xl p-6 shadow-app"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-app">{entry.id}</h3>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs">
                    {entry.status}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan border border-ptt-blue/30 text-xs">
                    {entry.module}
                  </span>
                </div>
                <p className="text-muted">{entry.description}</p>
                <p className="text-xs text-muted mt-1">
                  วันที่: {new Date(entry.date).toLocaleDateString("th-TH")} • สร้างโดย: {entry.createdBy}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted mb-1">ยอดรวม</p>
                <p className="text-2xl font-bold text-app">
                  {currencyFormatter.format(entry.total)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Debit */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-emerald-400 mb-3">เดบิต (Debit)</h4>
                <div className="space-y-2">
                  {entry.debit.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-app">{item.account}</span>
                      <span className="text-sm font-semibold text-emerald-400">
                        {currencyFormatter.format(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Credit */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-red-400 mb-3">เครดิต (Credit)</h4>
                <div className="space-y-2">
                  {entry.credit.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-app">{item.account}</span>
                      <span className="text-sm font-semibold text-red-400">
                        {currencyFormatter.format(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Balance Check */}
            <div className="mt-4 p-3 bg-soft rounded-lg border border-app">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">ยอดรวมเดบิต</span>
                <span className="text-sm font-semibold text-emerald-400">
                  {currencyFormatter.format(entry.debit.reduce((sum, item) => sum + item.amount, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-muted">ยอดรวมเครดิต</span>
                <span className="text-sm font-semibold text-red-400">
                  {currencyFormatter.format(entry.credit.reduce((sum, item) => sum + item.amount, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-app">
                <span className="text-sm font-semibold text-app">ยอดรวม</span>
                <span className={`text-sm font-bold ${
                  entry.debit.reduce((sum, item) => sum + item.amount, 0) === 
                  entry.credit.reduce((sum, item) => sum + item.amount, 0)
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}>
                  {entry.debit.reduce((sum, item) => sum + item.amount, 0) === 
                   entry.credit.reduce((sum, item) => sum + item.amount, 0)
                    ? "✓ สมดุล"
                    : "✗ ไม่สมดุล"}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

