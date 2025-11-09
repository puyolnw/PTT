import { motion } from "framer-motion";
import { BookOpen, Plus, Search, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - ผังบัญชี
const mockChartOfAccounts = [
  { code: "1110", name: "เงินสด", type: "Asset", level: 1, parent: null, balance: 500000 },
  { code: "1120", name: "เงินฝากธนาคาร", type: "Asset", level: 1, parent: null, balance: 5000000 },
  { code: "1130", name: "ลูกหนี้", type: "Asset", level: 1, parent: null, balance: 200000 },
  { code: "1140", name: "สต็อก", type: "Asset", level: 1, parent: null, balance: 1000000 },
  { code: "2010", name: "เจ้าหนี้", type: "Liability", level: 1, parent: null, balance: 300000 },
  { code: "2011", name: "VAT Output", type: "Liability", level: 2, parent: "2010", balance: 350000 },
  { code: "2012", name: "VAT Input", type: "Liability", level: 2, parent: "2010", balance: 280000 },
  { code: "3010", name: "ทุน", type: "Equity", level: 1, parent: null, balance: 10000000 },
  { code: "4110", name: "รายได้", type: "Income", level: 1, parent: null, balance: 5500000 },
  { code: "4111", name: "รายได้ขายน้ำมัน", type: "Income", level: 2, parent: "4110", balance: 5000000 },
  { code: "4112", name: "รายได้ค่าเช่า", type: "Income", level: 2, parent: "4110", balance: 150000 },
  { code: "4113", name: "รายได้ดอกเบี้ย", type: "Income", level: 2, parent: "4110", balance: 150000 },
  { code: "5120", name: "ค่าใช้จ่าย", type: "Expense", level: 1, parent: null, balance: 4200000 },
  { code: "5121", name: "ค่าแรง", type: "Expense", level: 2, parent: "5120", balance: 2000000 },
  { code: "5122", name: "ค่าเช่า", type: "Expense", level: 2, parent: "5120", balance: 50000 },
];

const accountTypeColors = {
  Asset: "from-emerald-500 to-teal-500",
  Liability: "from-red-500 to-orange-500",
  Equity: "from-blue-500 to-cyan-500",
  Income: "from-purple-500 to-pink-500",
  Expense: "from-orange-500 to-red-500",
};

export default function ChartOfAccounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredAccounts = mockChartOfAccounts.filter(account => {
    const matchesSearch = account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || account.type === selectedType;
    return matchesSearch && matchesType;
  });

  const groupedByType = filteredAccounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = [];
    }
    acc[account.type].push(account);
    return acc;
  }, {} as Record<string, typeof mockChartOfAccounts>);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">ผังบัญชี (Chart of Accounts)</h2>
        <p className="text-muted font-light">
          ตั้งค่า COA ไม่จำกัดระดับ • Asset, Liability, Equity, Income, Expense
        </p>
      </motion.div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="ค้นหาด้วยรหัสหรือชื่อบัญชี..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-soft border border-app rounded-xl text-app placeholder-muted focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>
          <select
            value={selectedType || ""}
            onChange={(e) => setSelectedType(e.target.value || null)}
            className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
          >
            <option value="">ทุกประเภท</option>
            <option value="Asset">Asset</option>
            <option value="Liability">Liability</option>
            <option value="Equity">Equity</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
          <Plus className="w-5 h-5" />
          <span>เพิ่มบัญชีใหม่</span>
        </button>
      </div>

      {/* Chart of Accounts by Type */}
      {Object.entries(groupedByType).map(([type, accounts]) => (
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-2xl p-6 shadow-app"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${accountTypeColors[type as keyof typeof accountTypeColors]}`}>
              <BookOpen className="w-5 h-5 text-app" />
            </div>
            <h3 className="text-xl font-semibold text-app">{type}</h3>
            <span className="px-3 py-1 rounded-full bg-soft text-muted text-sm">
              {accounts.length} บัญชี
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-app">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">รหัสบัญชี</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">ชื่อบัญชี</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted">ยอดคงเหลือ</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted">ระดับ</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr
                    key={account.code}
                    className={`border-b border-app/50 hover:bg-soft/50 transition-colors ${
                      account.level > 1 ? "bg-soft/30" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {account.level > 1 && (
                          <span className="text-muted">└─</span>
                        )}
                        <span className="font-mono font-semibold text-app">{account.code}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-app">{account.name}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-semibold ${
                        account.type === "Income" || account.type === "Asset" 
                          ? "text-emerald-400" 
                          : "text-red-400"
                      }`}>
                        {currencyFormatter.format(account.balance)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 rounded-full bg-ptt-blue/10 text-ptt-cyan text-xs">
                        ระดับ {account.level}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-soft rounded-lg transition-colors" title="แก้ไข">
                          <Edit className="w-4 h-4 text-muted" />
                        </button>
                        <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="ลบ">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

