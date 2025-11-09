import { motion } from "framer-motion";
import { FileText, Download, Calendar, Scale } from "lucide-react";
import { useState } from "react";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

// Mock data - Trial Balance
const mockTrialBalance = {
  period: "ตุลาคม 2568",
  date: "2024-10-31",
  accounts: [
    { code: "1110", name: "เงินสด", debit: 500000, credit: 0 },
    { code: "1120", name: "เงินฝากธนาคาร", debit: 5000000, credit: 0 },
    { code: "1130", name: "ลูกหนี้", debit: 200000, credit: 0 },
    { code: "1140", name: "สต็อก", debit: 1000000, credit: 0 },
    { code: "2010", name: "เจ้าหนี้", debit: 0, credit: 300000 },
    { code: "2011", name: "VAT Output", debit: 0, credit: 350000 },
    { code: "3010", name: "ทุน", debit: 0, credit: 10000000 },
    { code: "4110", name: "รายได้", debit: 0, credit: 5500000 },
    { code: "5120", name: "ค่าใช้จ่าย", debit: 4200000, credit: 0 },
  ],
};

export default function TrialBalance() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-10");

  const totalDebit = mockTrialBalance.accounts.reduce((sum, acc) => sum + acc.debit, 0);
  const totalCredit = mockTrialBalance.accounts.reduce((sum, acc) => sum + acc.credit, 0);
  const isBalanced = totalDebit === totalCredit;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-app mb-2 font-display">งบทดลอง (Trial Balance)</h2>
        <p className="text-muted font-light">
          สรุปยอดคงเหลือของทุกบัญชี ณ วันสิ้นงวด
        </p>
      </motion.div>

      {/* Period Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="date"
              value={`2024-${selectedPeriod.split("-")[1]}-01`}
              onChange={(e) => {
                const date = e.target.value.split("-");
                setSelectedPeriod(`${date[0]}-${date[1]}`);
              }}
              className="pl-10 pr-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>
          <span className="text-sm text-muted">
            วันที่: {new Date(mockTrialBalance.date).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-ptt-blue/10 hover:bg-ptt-blue/20 border border-ptt-blue/30 rounded-xl text-ptt-cyan transition-colors">
          <Download className="w-5 h-5" />
          <span>ส่งออก Excel</span>
        </button>
      </div>

      {/* Balance Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`panel rounded-2xl p-6 shadow-app border-2 ${
          isBalanced
            ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5"
            : "border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className={`w-6 h-6 ${isBalanced ? "text-emerald-400" : "text-red-400"}`} />
            <div>
              <h3 className="text-lg font-semibold text-app">สถานะงบทดลอง</h3>
              <p className="text-sm text-muted">
                {isBalanced ? "ยอดเดบิตและเครดิตสมดุล" : "ยอดเดบิตและเครดิตไม่สมดุล"}
              </p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full font-medium ${
            isBalanced
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}>
            {isBalanced ? "✓ สมดุล" : "✗ ไม่สมดุล"}
          </span>
        </div>
      </motion.div>

      {/* Trial Balance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="panel rounded-2xl p-6 shadow-app"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-app">งบทดลอง - {mockTrialBalance.period}</h3>
            <p className="text-sm text-muted">ยอดคงเหลือ ณ วันที่ {new Date(mockTrialBalance.date).toLocaleDateString("th-TH")}</p>
          </div>
          <FileText className="w-6 h-6 text-muted" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted">รหัสบัญชี</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted">ชื่อบัญชี</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">เดบิต</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-muted">เครดิต</th>
              </tr>
            </thead>
            <tbody>
              {mockTrialBalance.accounts.map((account) => (
                <tr
                  key={account.code}
                  className="border-b border-app/50 hover:bg-soft/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold text-app">{account.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-app">{account.name}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {account.debit > 0 && (
                      <span className="font-semibold text-emerald-400">
                        {currencyFormatter.format(account.debit)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {account.credit > 0 && (
                      <span className="font-semibold text-red-400">
                        {currencyFormatter.format(account.credit)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-app font-bold">
                <td colSpan={2} className="py-4 px-4 text-right">
                  <span className="text-app">รวม</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-emerald-400 text-lg">
                    {currencyFormatter.format(totalDebit)}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-red-400 text-lg">
                    {currencyFormatter.format(totalCredit)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="panel rounded-2xl p-6 shadow-app">
          <h4 className="text-lg font-semibold text-app mb-4">สรุปยอดเดบิต</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">จำนวนบัญชี</span>
              <span className="font-semibold text-app">
                {mockTrialBalance.accounts.filter(a => a.debit > 0).length} บัญชี
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">ยอดรวม</span>
              <span className="text-xl font-bold text-emerald-400">
                {currencyFormatter.format(totalDebit)}
              </span>
            </div>
          </div>
        </div>
        <div className="panel rounded-2xl p-6 shadow-app">
          <h4 className="text-lg font-semibold text-app mb-4">สรุปยอดเครดิต</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">จำนวนบัญชี</span>
              <span className="font-semibold text-app">
                {mockTrialBalance.accounts.filter(a => a.credit > 0).length} บัญชี
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">ยอดรวม</span>
              <span className="text-xl font-bold text-red-400">
                {currencyFormatter.format(totalCredit)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

