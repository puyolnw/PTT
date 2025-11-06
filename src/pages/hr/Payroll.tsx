import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Printer, Send, Download } from "lucide-react";
import ModalForm from "@/components/ModalForm";
import { payroll, type Payroll as PayrollType } from "@/data/mockData";

export default function Payroll() {
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollType | null>(null);
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  // Handle print document
  const handlePrintDocument = (docType: string) => {
    if (!selectedPayslip) return;
    
    const docNames: Record<string, string> = {
      payslip: "สลิปเงินเดือน",
      pnd1: "ภ.ง.ด.1",
      pnd91: "ภ.ง.ด.91",
      sso1: "สปส.1",
      sso2: "สปส.2",
      sso3: "สปส.3",
      sso4: "สปส.4",
      sso5: "สปส.5",
      sso6: "สปส.6",
      sso7: "สปส.7",
      sso8: "สปส.8",
      sso9: "สปส.9",
      sso10: "สปส.10"
    };

    alert(`กำลังพิมพ์${docNames[docType] || docType} สำหรับ ${selectedPayslip.empName} (Mock)`);
    setIsPrintMenuOpen(false);
  };

  // Handle send to M6
  const handleSendToM6 = () => {
    // Calculate summary data
    const totalSalary = payroll.reduce((sum, p) => sum + p.salary, 0);
    const totalOT = payroll.reduce((sum, p) => sum + p.ot, 0);
    const totalDeduction = payroll.reduce((sum, p) => sum + p.deduction, 0);
    const totalNet = payroll.reduce((sum, p) => sum + p.net, 0);
    
    // Estimate tax and social security (mock calculation)
    const estimatedTax = totalSalary * 0.05; // 5% tax estimate
    const estimatedSSO = totalSalary * 0.05; // 5% SSO estimate

    alert(`ส่งข้อมูลเงินเดือนไปบัญชี (M6) สำเร็จ!\n\nสรุป:\n- เงินเดือนรวม: ${formatCurrency(totalSalary)}\n- OT รวม: ${formatCurrency(totalOT)}\n- หักลา/อื่นๆ: ${formatCurrency(totalDeduction)}\n- ภาษี: ${formatCurrency(estimatedTax)}\n- ประกันสังคม: ${formatCurrency(estimatedSSO)}\n- สุทธิรวม: ${formatCurrency(totalNet)}`);
    setIsSendModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            เงินเดือน
          </h1>
          <p className="text-muted font-light">
            รายการเงินเดือนประจำเดือน ตุลาคม 2025
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-cyan hover:bg-ptt-cyan/80 
                       text-app rounded-xl transition-all duration-200 font-semibold 
                       shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Printer className="w-5 h-5" />
              พิมพ์เอกสาร
            </button>

            {/* Print Menu Dropdown */}
            {isPrintMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-ink-800 border border-app rounded-xl shadow-xl z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-muted font-semibold mb-1">สลิปเงินเดือน</div>
                  <button
                    onClick={() => handlePrintDocument("payslip")}
                    className="w-full text-left px-3 py-2 text-sm text-app hover:bg-ink-700 rounded-lg transition-colors"
                  >
                    สลิปเงินเดือน
                  </button>
                  
                  <div className="px-3 py-2 text-xs text-muted font-semibold mt-2 mb-1">เอกสารภาษี</div>
                  <button
                    onClick={() => handlePrintDocument("pnd1")}
                    className="w-full text-left px-3 py-2 text-sm text-app hover:bg-ink-700 rounded-lg transition-colors"
                  >
                    ภ.ง.ด.1
                  </button>
                  <button
                    onClick={() => handlePrintDocument("pnd91")}
                    className="w-full text-left px-3 py-2 text-sm text-app hover:bg-ink-700 rounded-lg transition-colors"
                  >
                    ภ.ง.ด.91
                  </button>
                  
                  <div className="px-3 py-2 text-xs text-muted font-semibold mt-2 mb-1">เอกสารประกันสังคม</div>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => handlePrintDocument(`sso${num}`)}
                      className="w-full text-left px-3 py-2 text-sm text-app hover:bg-ink-700 rounded-lg transition-colors"
                    >
                      สปส.{num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSendModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-500/80 
                     text-app rounded-xl transition-all duration-200 font-semibold 
                     shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Send className="w-5 h-5" />
            ส่งข้อมูลไป M6
          </button>
        </div>
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
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedPayslip(item)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                                 bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                                 transition-colors font-medium"
                      >
                        <FileText className="w-4 h-4" />
                        ดูสลิป
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPayslip(item);
                          setIsPrintMenuOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs 
                                 bg-ptt-cyan/20 hover:bg-ptt-cyan/30 text-ptt-cyan rounded-lg
                                 transition-colors font-medium"
                        title="พิมพ์เอกสาร"
                      >
                        <Printer className="w-3 h-3" />
                      </button>
                    </div>
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

            {/* Print Buttons */}
            <div className="pt-4 border-t border-app">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePrintDocument("payslip")}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm 
                           bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                           transition-colors font-medium"
                >
                  <Printer className="w-4 h-4" />
                  พิมพ์สลิป
                </button>
                <button
                  onClick={() => {
                    setSelectedPayslip(null);
                    setIsPrintMenuOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm 
                           bg-ptt-cyan/20 hover:bg-ptt-cyan/30 text-ptt-cyan rounded-lg
                           transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  เอกสารอื่นๆ
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalForm>

      {/* Send to M6 Modal */}
      <ModalForm
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        title="ส่งข้อมูลเงินเดือนไปบัญชี (M6)"
        onSubmit={handleSendToM6}
        submitLabel="ส่งข้อมูล"
      >
        <div className="space-y-4">
          <div className="p-4 bg-ink-800/50 rounded-lg">
            <h3 className="text-lg font-semibold text-app mb-4 font-display">
              สรุปข้อมูลที่จะส่ง
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted">จำนวนพนักงาน:</span>
                <span className="text-app font-semibold">{payroll.length} คน</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">เงินเดือนรวม:</span>
                <span className="text-app font-semibold font-mono">
                  {formatCurrency(payroll.reduce((sum, p) => sum + p.salary, 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">OT รวม:</span>
                <span className="text-green-400 font-semibold font-mono">
                  {formatCurrency(payroll.reduce((sum, p) => sum + p.ot, 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">หักลา/อื่นๆ:</span>
                <span className="text-red-400 font-semibold font-mono">
                  {formatCurrency(payroll.reduce((sum, p) => sum + p.deduction, 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">ภาษี (ประมาณ):</span>
                <span className="text-yellow-400 font-semibold font-mono">
                  {formatCurrency(payroll.reduce((sum, p) => sum + p.salary, 0) * 0.05)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">ประกันสังคม (ประมาณ):</span>
                <span className="text-yellow-400 font-semibold font-mono">
                  {formatCurrency(payroll.reduce((sum, p) => sum + p.salary, 0) * 0.05)}
                </span>
              </div>
              <div className="pt-3 border-t border-app flex justify-between text-base">
                <span className="text-app font-semibold">สุทธิรวม:</span>
                <span className="text-ptt-cyan font-bold font-mono">
                  {formatCurrency(payroll.reduce((sum, p) => sum + p.net, 0))}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              ⚠️ ข้อมูลจะถูกส่งไปยังระบบบัญชี (M6) และไม่สามารถแก้ไขได้หลังส่งแล้ว
            </p>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

