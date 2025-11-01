import { useState } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import ModalForm from "@/components/ModalForm";
import { payroll, type Payroll as PayrollType } from "@/data/mockData";

export default function Payroll() {
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollType | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-app mb-2 font-display">
          เงินเดือน
        </h1>
        <p className="text-muted font-light">
          รายการเงินเดือนประจำเดือน ตุลาคม 2025
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <p className="text-muted text-sm mb-1 font-light">รายจ่ายรวม</p>
          <p className="text-3xl font-bold text-app font-display">
            {formatCurrency(payroll.reduce((sum, p) => sum + p.net, 0))}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <p className="text-muted text-sm mb-1 font-light">จำนวนพนักงาน</p>
          <p className="text-3xl font-bold text-app font-display">
            {payroll.length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <p className="text-muted text-sm mb-1 font-light">เฉลี่ยต่อคน</p>
          <p className="text-3xl font-bold text-app font-display">
            {formatCurrency(payroll.reduce((sum, p) => sum + p.net, 0) / payroll.length)}
          </p>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-soft border-b border-app">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  รหัส
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">
                  เงินเดือน
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">
                  OT
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">
                  โบนัส
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">
                  หัก
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">
                  สุทธิ
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  สลิป
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payroll.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-soft transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">
                    {item.empCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-app font-medium">
                    {item.empName}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-app font-mono">
                    {formatCurrency(item.salary)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-green-400 font-mono">
                    +{formatCurrency(item.ot)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-green-400 font-mono">
                    +{formatCurrency(item.bonus)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-red-400 font-mono">
                    -{formatCurrency(item.deduction)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-ptt-cyan font-bold font-mono">
                    {formatCurrency(item.net)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedPayslip(item)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                               bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                               transition-colors font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      ดูสลิป
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payslip Modal */}
      <ModalForm
        isOpen={selectedPayslip !== null}
        onClose={() => setSelectedPayslip(null)}
        title="สลิปเงินเดือน"
        size="md"
      >
        {selectedPayslip && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center pb-6 border-b border-app">
              <h2 className="text-2xl font-bold text-app mb-2 font-display">
                สลิปเงินเดือน
              </h2>
              <p className="text-muted font-light">
                ประจำเดือน {selectedPayslip.month}
              </p>
            </div>

            {/* Employee Info */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted">รหัสพนักงาน:</span>
                <span className="text-app font-medium">{selectedPayslip.empCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">ชื่อ-นามสกุล:</span>
                <span className="text-app font-medium">{selectedPayslip.empName}</span>
              </div>
            </div>

            {/* Earnings */}
            <div className="space-y-3 pt-4 border-t border-app">
              <h3 className="text-lg font-semibold text-app font-display">
                รายรับ
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-app">เงินเดือน</span>
                  <span className="text-app font-mono">{formatCurrency(selectedPayslip.salary)}</span>
                </div>
                {selectedPayslip.ot > 0 && (
                  <div className="flex justify-between">
                    <span className="text-app">ค่าล่วงเวลา (OT)</span>
                    <span className="text-green-400 font-mono">+{formatCurrency(selectedPayslip.ot)}</span>
                  </div>
                )}
                {selectedPayslip.bonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-app">โบนัส</span>
                    <span className="text-green-400 font-mono">+{formatCurrency(selectedPayslip.bonus)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Deductions */}
            {selectedPayslip.deduction > 0 && (
              <div className="space-y-3 pt-4 border-t border-app">
                <h3 className="text-lg font-semibold text-app font-display">
                  รายหัก
                </h3>
                <div className="flex justify-between">
                  <span className="text-app">หักต่างๆ</span>
                  <span className="text-red-400 font-mono">-{formatCurrency(selectedPayslip.deduction)}</span>
                </div>
              </div>
            )}

            {/* Net Pay */}
            <div className="pt-4 border-t-2 border-ptt-blue/30">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-app font-display">
                  รับสุทธิ
                </span>
                <span className="text-3xl font-bold text-ptt-cyan font-mono">
                  {formatCurrency(selectedPayslip.net)}
                </span>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center pt-4 border-t border-app">
              <p className="text-xs text-muted font-light">
                เอกสารนี้เป็นเอกสารออกโดยระบบอัตโนมัติ
              </p>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}

