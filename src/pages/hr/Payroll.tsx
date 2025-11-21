import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, TrendingUp, Users, DollarSign, CheckCircle, Clock, ShieldCheck, View } from "lucide-react";
import ModalForm from "@/components/ModalForm";
import { payroll as initialPayroll, employees, shifts, type Payroll as PayrollType } from "@/data/mockData";

type PayrollRecord = PayrollType & {
  status: "pending" | "paid";
  paidDate?: string;
  history: { date: string; action: string; note?: string }[];
};

type PaymentLogEntry = {
  id: number;
  empCode: string;
  empName: string;
  month: string;
  amount: number;
  date: string;
  note?: string;
};

export default function Payroll() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() =>
    initialPayroll.map((record) => ({
      ...record,
      status: "pending",
      history: [],
    }))
  );
  const [filteredPayroll, setFilteredPayroll] = useState<PayrollRecord[]>(payrollRecords);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<PayrollRecord | null>(null);
  const [paymentLog, setPaymentLog] = useState<PaymentLogEntry[]>([]);
  const [paymentModalRecord, setPaymentModalRecord] = useState<PayrollRecord | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    empCode: "",
    month: "ตุลาคม 2025",
    salary: 0,
    ot: 0,
    bonus: 0,
    deduction: 0,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  // Get employee info by code
  const getEmployeeInfo = (empCode: string) => {
    return employees.find(e => e.code === empCode);
  };

  // Handle filtering
  const handleFilter = () => {
    let filtered = payrollRecords;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.empCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((p) => {
        const employee = getEmployeeInfo(p.empCode);
        return employee?.category === categoryFilter;
      });
    }

    if (deptFilter) {
      filtered = filtered.filter((p) => {
        const employee = getEmployeeInfo(p.empCode);
        return employee?.dept === deptFilter;
      });
    }

    if (shiftFilter !== "") {
      filtered = filtered.filter((p) => {
        const employee = getEmployeeInfo(p.empCode);
        return employee?.shiftId === shiftFilter;
      });
    }

    if (statusFilter) {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredPayroll(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payrollRecords, searchQuery, categoryFilter, deptFilter, shiftFilter, statusFilter]);

  // Get unique categories and departments from employees
  const categories = Array.from(new Set(employees.map(e => e.category).filter(Boolean)));
  const departments = Array.from(new Set(employees.map(e => e.dept)));

  const handleOpenPaymentModal = (record: PayrollRecord) => {
    setPaymentModalRecord(record);
    setPaymentNote("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!paymentModalRecord) return;
    const effectiveDate = paymentDate || new Date().toISOString().split("T")[0];

    setPayrollRecords((prev) =>
      prev.map((item) =>
        item.id === paymentModalRecord.id
          ? {
              ...item,
              status: "paid",
              paidDate: effectiveDate,
              history: [
                {
                  date: effectiveDate,
                  action: "จ่ายเงินเดือน",
                  note: paymentNote || undefined,
                },
                ...item.history,
              ],
            }
          : item
      )
    );

    setPaymentLog((prev) => [
      {
        id: Date.now(),
        empCode: paymentModalRecord.empCode,
        empName: paymentModalRecord.empName,
        month: paymentModalRecord.month,
        amount: paymentModalRecord.net,
        date: effectiveDate,
        note: paymentNote || undefined,
      },
      ...prev,
    ]);

    setIsPaymentModalOpen(false);
    setPaymentModalRecord(null);
    setPaymentNote("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
  };

  const handleGenerateCertificate = (record: PayrollRecord) => {
    setSelectedCertificate(record);
  };

  const resetCreateForm = () => {
    setCreateForm({
      empCode: "",
      month: "ตุลาคม 2025",
      salary: 0,
      ot: 0,
      bonus: 0,
      deduction: 0,
    });
  };

  const handleCreatePayroll = () => {
    if (!createForm.empCode) {
      alert("กรุณาเลือกพนักงาน");
      return;
    }
    if (!createForm.month) {
      alert("กรุณาระบุเดือน");
      return;
    }
    const employee = getEmployeeInfo(createForm.empCode);
    if (!employee) {
      alert("ไม่พบข้อมูลพนักงาน");
      return;
    }

    const salary = Number(createForm.salary) || 0;
    const ot = Number(createForm.ot) || 0;
    const bonus = Number(createForm.bonus) || 0;
    const deduction = Number(createForm.deduction) || 0;
    const net = salary + ot + bonus - deduction;

    const newId = Math.max(...payrollRecords.map((p) => p.id), 0) + 1;
    const newRecord: PayrollRecord = {
      id: newId,
      empCode: employee.code,
      empName: employee.name,
      salary,
      ot,
      bonus,
      deduction,
      net,
      month: createForm.month,
      status: "pending",
      history: [],
    };

    setPayrollRecords((prev) => [...prev, newRecord]);
    setFilteredPayroll((prev) => [...prev, newRecord]);
    setIsCreateModalOpen(false);
    resetCreateForm();
  };

  const handleDownloadCertificate = (record: PayrollRecord) => {
    const employee = getEmployeeInfo(record.empCode);
    const doc = `ใบรับรองเงินเดือน\n\nเรียนผู้เกี่ยวข้อง\n\nขอรับรองว่า ${record.empName} (${record.empCode}) ตำแหน่ง ${employee?.position || "-"} สังกัด ${employee?.dept || "-"} ได้รับเงินเดือนสุทธิ ${formatCurrency(record.net)} ต่อเดือน (ข้อมูลจากเดือน ${record.month})\n\nลงชื่อ\nฝ่ายทรัพยากรบุคคล`;
    const blob = new Blob([doc], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `salary-certificate_${record.empCode}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPaid = payrollRecords.filter((p) => p.status === "paid").length;
  const totalPending = payrollRecords.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            เงินเดือน
          </h1>
          <p className="text-muted font-light">
            ระบบบันทึกการจ่ายเงินเดือนและใบรับรอง • แสดง {filteredPayroll.length} จาก {payrollRecords.length} คน
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 font-semibold"
          >
            <FileText className="w-5 h-5" />
            สร้างรายการเงินเดือน
          </button>
          <button
            onClick={() => {
              if (paymentLog.length === 0) {
                alert("ยังไม่มีประวัติการจ่ายเงินเดือน");
                return;
              }
              let csv = `"วันที่","เดือน","รหัสพนักงาน","ชื่อ","จำนวน","หมายเหตุ"\n`;
              paymentLog.forEach((entry) => {
                csv += `"${entry.date}","${entry.month}","${entry.empCode}","${entry.empName}",${entry.amount},"${entry.note || "-"}"\n`;
              });
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.setAttribute("download", `payment-history_${new Date().toISOString().split("T")[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-soft border border-app hover:bg-soft/80 
                     text-app rounded-xl transition-all duration-200 font-semibold"
          >
            <Download className="w-5 h-5" />
            ดาวน์โหลดประวัติการจ่าย
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-ptt-cyan/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-ptt-cyan" />
            </div>
            <p className="text-muted text-sm font-light">รายจ่ายรวม</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {formatCurrency(filteredPayroll.reduce((sum, p) => sum + p.net, 0))}
          </p>
          <p className="text-xs text-muted mt-1">
            จาก {filteredPayroll.length} คน
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-muted text-sm font-light">จำนวนพนักงาน</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {filteredPayroll.length}
          </p>
          <p className="text-xs text-muted mt-1">
            จากทั้งหมด {payrollRecords.length} คน
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-muted text-sm font-light">จ่ายแล้ว</p>
          </div>
          <p className="text-3xl font-bold text-green-500 font-display">
            {totalPaid} คน
          </p>
          <p className="text-xs text-muted mt-1">
            อัปเดตล่าสุด {paymentLog[0]?.date || "-"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-muted text-sm font-light">ค้างจ่าย</p>
          </div>
          <p className="text-3xl font-bold text-orange-500 font-display">
            {totalPending} คน
          </p>
          <p className="text-xs text-muted mt-1">
            เฉลี่ยต่อคน {formatCurrency(filteredPayroll.length > 0 ? filteredPayroll.reduce((sum, p) => sum + p.net, 0) / filteredPayroll.length : 0)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-muted text-sm font-light">OT รวม</p>
          </div>
          <p className="text-3xl font-bold text-blue-400 font-display">
            {formatCurrency(filteredPayroll.reduce((sum, p) => sum + p.ot, 0))}
          </p>
          <p className="text-xs text-muted mt-1">
            ค่าล่วงเวลา (อ้างอิงข้อมูลเงินเดือน)
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
        <div className="px-6 py-4 border-b border-app bg-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-app font-display">
                รายการเงินเดือน
              </h3>
              <p className="text-xs text-muted mt-1">
                แสดง {filteredPayroll.length} จาก {payrollRecords.length} คน
              </p>
            </div>
          </div>
          
          {/* Filter Bar - Inline with table */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilter();
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                         transition-all font-light"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-3">
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  handleFilter();
                }}
                className="px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app text-sm min-w-[150px]
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                         transition-all cursor-pointer hover:border-app/50"
              >
                <option value="">ทุกแผนก</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  handleFilter();
                }}
                className="px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app text-sm min-w-[150px]
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                         transition-all cursor-pointer hover:border-app/50"
              >
                <option value="">ทุกหมวดหมู่</option>
                {categories.map((c) => (
                  <option key={c} value={c || ""}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={shiftFilter === "" ? "" : String(shiftFilter)}
                onChange={(e) => {
                  setShiftFilter(e.target.value === "" ? "" : Number(e.target.value));
                  handleFilter();
                }}
                className="px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app text-sm min-w-[150px]
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                         transition-all cursor-pointer hover:border-app/50"
              >
                <option value="">ทุกกะ</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={String(shift.id)}>
                    {shift.shiftType ? `กะ${shift.shiftType}` : ""} {shift.name} {shift.description ? `(${shift.description})` : ""}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  handleFilter();
                }}
                className="px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app text-sm min-w-[150px]
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                         transition-all cursor-pointer hover:border-app/50"
              >
                <option value="">ทุกสถานะ</option>
                <option value="pending">รอจ่าย</option>
                <option value="paid">จ่ายแล้ว</option>
              </select>
            </div>
          </div>
        </div>

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
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  แผนก
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  หมวดหมู่
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
                  สถานะจ่าย
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {filteredPayroll.map((item, index) => {
                const employee = getEmployeeInfo(item.empCode);
                return (
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
                  <td className="px-6 py-4 text-sm text-app font-light">
                    {employee?.dept || "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {employee?.category ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium
                                     bg-ptt-cyan/20 text-ptt-cyan border border-ptt-cyan/30">
                        {employee.category}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
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
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === "paid"
                            ? "bg-green-500/20 text-green-600 border border-green-500/40"
                            : "bg-orange-500/20 text-orange-600 border border-orange-500/40"
                        }`}
                      >
                        {item.status === "paid" ? "จ่ายแล้ว" : "รอจ่าย"}
                      </span>
                      {item.paidDate && (
                        <span className="text-[11px] text-muted">จ่ายเมื่อ {new Date(item.paidDate).toLocaleDateString("th-TH")}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedPayslip(item)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                                 bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                                 transition-colors font-medium"
                      >
                        <FileText className="w-4 h-4" />
                        สลิป
                      </button>
                      <button
                        onClick={() => handleGenerateCertificate(item)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs 
                                 bg-soft border border-app hover:bg-soft/70 text-app rounded-lg
                                 transition-colors font-medium"
                        title="ขอใบรับรองเงินเดือน"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        ใบรับรอง
                      </button>
                      <button
                        onClick={() => handleOpenPaymentModal(item)}
                        disabled={item.status === "paid"}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                          item.status === "paid"
                            ? "bg-soft text-muted cursor-not-allowed"
                            : "bg-ptt-cyan/20 text-ptt-cyan hover:bg-ptt-cyan/30"
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        บันทึกจ่าย
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
              })}
            </tbody>
          </table>

          {filteredPayroll.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted font-light">ไม่พบข้อมูลเงินเดือน</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Payment History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-soft border border-app rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-app font-display">ประวัติการจ่ายล่าสุด</h3>
              <p className="text-xs text-muted mt-1">เรียงจากรายการล่าสุด</p>
            </div>
            <span className="text-xs text-muted">
              รวมทั้งหมด {paymentLog.length} รายการ
            </span>
          </div>
          {paymentLog.length === 0 ? (
            <div className="text-center py-6 text-muted text-sm">ยังไม่มีประวัติการจ่าย</div>
          ) : (
            <div className="space-y-3">
              {paymentLog.slice(0, 6).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between bg-soft/60 border border-app rounded-xl p-3">
                  <div>
                    <p className="text-sm font-semibold text-app">{entry.empName}</p>
                    <p className="text-xs text-muted">{entry.empCode} • เดือน {entry.month}</p>
                    {entry.note && <p className="text-xs text-muted mt-1">หมายเหตุ: {entry.note}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-ptt-cyan">{formatCurrency(entry.amount)}</p>
                    <p className="text-[11px] text-muted">{new Date(entry.date).toLocaleDateString("th-TH")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-soft border border-app rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-semibold text-app font-display">พนักงานที่ยังไม่จ่าย</h3>
          {totalPending === 0 ? (
            <div className="text-center py-6 text-sm text-muted">จ่ายครบทุกคนแล้ว 🎉</div>
          ) : (
            <div className="space-y-3">
              {payrollRecords
                .filter((record) => record.status === "pending")
                .slice(0, 6)
                .map((record) => (
                  <div key={record.id} className="flex items-center justify-between border border-app rounded-xl p-3 bg-soft/60">
                    <div>
                      <p className="text-sm font-semibold text-app">{record.empName}</p>
                      <p className="text-xs text-muted">{record.empCode} • {record.month}</p>
                    </div>
                    <button
                      onClick={() => handleOpenPaymentModal(record)}
                      className="text-xs px-3 py-1 rounded-lg bg-ptt-cyan/20 text-ptt-cyan hover:bg-ptt-cyan/30 transition-colors"
                    >
                      บันทึกจ่าย
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Payroll Modal */}
      <ModalForm
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetCreateForm();
        }}
        title="สร้างรายการเงินเดือน"
        onSubmit={handleCreatePayroll}
        submitLabel="บันทึก"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-app mb-2">พนักงาน</label>
            <select
              value={createForm.empCode}
              onChange={(e) => setCreateForm({ ...createForm, empCode: e.target.value })}
              className="w-full px-4 py-2.5 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="">เลือกพนักงาน</option>
              {employees
                .filter((emp) => emp.status === "Active")
                .map((emp) => (
                  <option key={emp.code} value={emp.code}>
                    {emp.code} - {emp.name} ({emp.dept})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-app mb-2">เดือน</label>
            <input
              type="text"
              value={createForm.month}
              onChange={(e) => setCreateForm({ ...createForm, month: e.target.value })}
              className="w-full px-4 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="เช่น ตุลาคม 2025"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-app mb-2">เงินเดือน</label>
              <input
                type="number"
                value={createForm.salary}
                onChange={(e) => setCreateForm({ ...createForm, salary: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-app mb-2">OT</label>
              <input
                type="number"
                value={createForm.ot}
                onChange={(e) => setCreateForm({ ...createForm, ot: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-app mb-2">โบนัส</label>
              <input
                type="number"
                value={createForm.bonus}
                onChange={(e) => setCreateForm({ ...createForm, bonus: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-app mb-2">หัก</label>
              <input
                type="number"
                value={createForm.deduction}
                onChange={(e) => setCreateForm({ ...createForm, deduction: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>
          </div>

          <div className="p-4 bg-soft/60 border border-app rounded-xl">
            <p className="text-sm text-muted">รับสุทธิคำนวณอัตโนมัติ</p>
            <p className="text-2xl font-bold text-ptt-cyan">
              {formatCurrency(createForm.salary + createForm.ot + createForm.bonus - createForm.deduction)}
            </p>
          </div>
        </div>
      </ModalForm>

      {/* Payslip Modal */}
      <ModalForm
        isOpen={selectedPayslip !== null}
        onClose={() => setSelectedPayslip(null)}
        title="สลิปเงินเดือน"
        size="md"
      >
        {selectedPayslip && (() => {
          const record = payrollRecords.find((p) => p.id === selectedPayslip.id) || selectedPayslip;
          const employee = getEmployeeInfo(record.empCode);
          return (
            <div className="space-y-6">
              <div className="text-center pb-6 border-b border-app">
                <h2 className="text-2xl font-bold text-app mb-2 font-display">สลิปเงินเดือน</h2>
                <p className="text-muted font-light">ประจำเดือน {record.month}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted">รหัสพนักงาน:</span>
                  <span className="text-app font-medium">{record.empCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">ชื่อ-นามสกุล:</span>
                  <span className="text-app font-medium">{record.empName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">แผนก:</span>
                  <span className="text-app font-medium">{employee?.dept || "-"}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-app">
                <h3 className="text-lg font-semibold text-app font-display">รายรับ</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-app">เงินเดือน</span>
                    <span className="text-app font-mono">{formatCurrency(record.salary)}</span>
                  </div>
                  {record.ot > 0 && (
                    <div className="flex justify-between">
                      <span className="text-app">ค่าล่วงเวลา (OT)</span>
                      <span className="text-green-400 font-mono">+{formatCurrency(record.ot)}</span>
                    </div>
                  )}
                  {record.bonus > 0 && (
                    <div className="flex justify-between">
                      <span className="text-app">โบนัส</span>
                      <span className="text-green-400 font-mono">+{formatCurrency(record.bonus)}</span>
                    </div>
                  )}
                </div>
              </div>

              {record.deduction > 0 && (
                <div className="space-y-3 pt-4 border-t border-app">
                  <h3 className="text-lg font-semibold text-app font-display">รายหัก</h3>
                  <div className="flex justify-between">
                    <span className="text-app">หักต่างๆ</span>
                    <span className="text-red-400 font-mono">-{formatCurrency(record.deduction)}</span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t-2 border-ptt-blue/30">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-app font-display">รับสุทธิ</span>
                  <span className="text-3xl font-bold text-ptt-cyan font-mono">
                    {formatCurrency(record.net)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-app space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === "paid"
                          ? "bg-green-500/20 text-green-600 border border-green-500/40"
                          : "bg-orange-500/20 text-orange-600 border border-orange-500/40"
                      }`}
                    >
                      {record.status === "paid" ? "จ่ายแล้ว" : "รอจ่าย"}
                    </span>
                    {record.paidDate && (
                      <span className="text-xs text-muted">
                        ล่าสุด {new Date(record.paidDate).toLocaleDateString("th-TH")}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleOpenPaymentModal(record)}
                    className="text-xs px-3 py-1 rounded-lg bg-ptt-cyan/20 text-ptt-cyan hover:bg-ptt-cyan/30 transition-colors"
                  >
                    ตรวจสอบ
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-app">ประวัติการจ่าย</p>
                  {record.history.length === 0 ? (
                    <p className="text-xs text-muted">ยังไม่มีประวัติ</p>
                  ) : (
                    <div className="space-y-2">
                      {record.history.map((entry, idx) => (
                        <div
                          key={`${entry.date}-${idx}`}
                          className="flex items-center justify-between text-xs text-app bg-soft/70 border border-app rounded-lg px-3 py-2"
                        >
                          <div>
                            <p className="font-semibold">{entry.action}</p>
                            {entry.note && <p className="text-muted">หมายเหตุ: {entry.note}</p>}
                          </div>
                          <span className="text-muted">{new Date(entry.date).toLocaleDateString("th-TH")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center pt-4 border-t border-app">
                <p className="text-xs text-muted font-light">
                  เอกสารนี้เป็นเอกสารออกโดยระบบอัตโนมัติ
                </p>
              </div>

              <div className="pt-4 border-t border-app">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleGenerateCertificate(record)}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm 
                             bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                             transition-colors font-medium"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    ขอใบรับรอง
                  </button>
                  <button
                    onClick={() => handleOpenPaymentModal(record)}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm 
                             bg-ptt-cyan/20 hover:bg-ptt-cyan/30 text-ptt-cyan rounded-lg
                             transition-colors font-medium"
                  >
                    <View className="w-4 h-4" />
                    ตรวจสอบ
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </ModalForm>

      {/* Payment Modal */}
      <ModalForm
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentModalRecord(null);
          setPaymentNote("");
        }}
        title="ตรวจสอบ"
        onSubmit={handleConfirmPayment}
        submitLabel="ยืนยันการจ่าย"
      >
        {paymentModalRecord ? (
          <div className="space-y-4">
            <div className="p-4 bg-soft/50 rounded-xl border border-app space-y-1">
              <p className="text-sm text-muted">พนักงาน</p>
              <p className="text-lg font-semibold text-app">{paymentModalRecord.empName}</p>
              <p className="text-xs text-muted">{paymentModalRecord.empCode} • เดือน {paymentModalRecord.month}</p>
              <p className="text-sm text-ptt-cyan font-bold mt-2">
                {formatCurrency(paymentModalRecord.net)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-app">วันที่จ่าย</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-4 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-app">หมายเหตุ (ถ้ามี)</label>
              <textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-app border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue resize-none"
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">ยังไม่เลือกพนักงาน</p>
        )}
      </ModalForm>

      {/* Salary Certificate Modal */}
      <ModalForm
        isOpen={selectedCertificate !== null}
        onClose={() => setSelectedCertificate(null)}
        title="ใบรับรองเงินเดือน"
        size="md"
      >
        {selectedCertificate && (() => {
          const employee = getEmployeeInfo(selectedCertificate.empCode);
          return (
            <div className="space-y-4">
              <div className="bg-soft/60 border border-app rounded-2xl p-5 space-y-1">
                <p className="text-sm text-muted">ออกให้</p>
                <p className="text-lg font-semibold text-app">{selectedCertificate.empName}</p>
                <p className="text-xs text-muted">{selectedCertificate.empCode} • {employee?.position || "-"}</p>
                <p className="text-sm text-app">แผนก {employee?.dept || "-"}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted">รายละเอียด</p>
                <p className="text-sm text-app leading-relaxed bg-soft/60 border border-app rounded-2xl p-4">
                  ขอรับรองว่า {selectedCertificate.empName} ได้รับเงินเดือนสุทธิ {formatCurrency(selectedCertificate.net)} ต่อรอบ
                  โดยข้อมูลนี้อ้างอิงจากเดือน {selectedCertificate.month} และเป็นข้อมูลจากระบบ HR ของบริษัท
                </p>
              </div>

              <div className="flex items-center justify-between text-sm text-muted">
                <span>ออกโดย HR Auto System</span>
                <span>{new Date().toLocaleDateString("th-TH")}</span>
              </div>

              <button
                onClick={() => handleDownloadCertificate(selectedCertificate)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm 
                         bg-ptt-cyan hover:bg-ptt-cyan/80 text-app rounded-lg transition-colors font-semibold"
              >
                <Download className="w-4 h-4" />
                ดาวน์โหลดใบรับรอง
              </button>
            </div>
          );
        })()}
      </ModalForm>
    </div>
  );
}

