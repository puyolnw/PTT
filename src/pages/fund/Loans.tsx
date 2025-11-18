import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  DollarSign, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Wallet
} from "lucide-react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { 
  loans,
  employees,
  type Loan 
} from "@/data/mockData";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatMonthLabel = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  if (!year || !monthIndex) {
    return month;
  }
  const date = new Date(year, monthIndex - 1, 1);
  return date.toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
};

// Helper function to get employee department/category
const getEmployeeDept = (empCode: string): string => {
  const employee = employees.find(e => e.code === empCode);
  return employee?.category || employee?.dept || "";
};

// Get unique departments/categories
const getUniqueDepartments = (): string[] => {
  const depts = new Set<string>();
  employees.forEach(emp => {
    if (emp.category) depts.add(emp.category);
    else if (emp.dept) depts.add(emp.dept);
  });
  return Array.from(depts).sort();
};

export default function Loans() {
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>(loans);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Handle filtering
  const handleFilter = () => {
    let filtered = loans;

    if (searchQuery) {
      filtered = filtered.filter(
        (l) =>
          l.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.empCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (deptFilter) {
      filtered = filtered.filter((l) => {
        const dept = getEmployeeDept(l.empCode);
        return dept === deptFilter;
      });
    }

    if (statusFilter) {
      filtered = filtered.filter((l) => l.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter((l) => l.loanType === typeFilter);
    }

    setFilteredLoans(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, typeFilter, deptFilter]);

  // Calculate statistics
  const activeLoans = filteredLoans.filter((l) => l.status === "Active").length;
  const overdueLoans = filteredLoans.filter((l) => l.status === "Overdue").length;
  const totalOutstanding = filteredLoans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const totalMonthlyPayments = filteredLoans
    .filter((l) => l.status === "Active" || l.status === "Overdue")
    .reduce((sum, l) => sum + l.monthlyPayment, 0);

  // Calculate payment progress
  const getPaymentProgress = (loan: Loan): number => {
    const paid = loan.principalAmount - loan.remainingBalance;
    return (paid / loan.principalAmount) * 100;
  };


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-app mb-2 font-display">
          กองทุนกู้ยืม
        </h1>
        <p className="text-muted font-light">
          จัดการสัญญากู้ยืมเงิน • แสดง {filteredLoans.length} จาก {loans.length} รายการ
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-muted text-sm font-light">กู้ที่กำลังชำระ</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {activeLoans}
          </p>
          <p className="text-xs text-muted mt-1">
            รายการ
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-muted text-sm font-light">ผิดนัดชำระ</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {overdueLoans}
          </p>
          <p className="text-xs text-muted mt-1">
            รายการ
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-muted text-sm font-light">ยอดคงเหลือรวม</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {formatCurrency(totalOutstanding)}
          </p>
          <p className="text-xs text-muted mt-1">
            จำนวนเงินที่ค้างชำระ
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingDown className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-muted text-sm font-light">ค่างวดรวม/เดือน</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {formatCurrency(totalMonthlyPayments)}
          </p>
          <p className="text-xs text-muted mt-1">
            รวมทุกสัญญากู้
          </p>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
        onSearch={(query) => {
          setSearchQuery(query);
          handleFilter();
        }}
        filters={[
          {
            label: "ทุกแผนก",
            value: deptFilter,
            options: [
              { label: "ทุกแผนก", value: "" },
              ...getUniqueDepartments().map((dept) => ({
                label: dept,
                value: dept
              }))
            ],
            onChange: (value) => {
              setDeptFilter(value);
              handleFilter();
            },
          },
          {
            label: "ทุกประเภท",
            value: typeFilter,
            options: [
              { label: "ทุกประเภท", value: "" },
              { label: "กู้สามัญ", value: "สามัญ" },
              { label: "กู้ฉุกเฉิน", value: "ฉุกเฉิน" },
              { label: "กู้ที่อยู่อาศัย", value: "ที่อยู่อาศัย" },
            ],
            onChange: (value) => {
              setTypeFilter(value);
              handleFilter();
            },
          },
          {
            label: "ทุกสถานะ",
            value: statusFilter,
            options: [
              { label: "ทุกสถานะ", value: "" },
              { label: "Active", value: "Active" },
              { label: "Overdue", value: "Overdue" },
              { label: "Completed", value: "Completed" },
              { label: "Defaulted", value: "Defaulted" },
            ],
            onChange: (value) => {
              setStatusFilter(value);
              handleFilter();
            },
          },
        ]}
      />

      {/* Loans Table */}
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
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  ประเภทกู้
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">
                  เงินต้น
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">
                  ยอดคงเหลือ
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">
                  ค่างวด/เดือน
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  ความคืบหน้า
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {filteredLoans.map((loan, index) => {
                const progress = getPaymentProgress(loan);
                return (
                  <motion.tr
                    key={loan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-soft transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">
                      {loan.empCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-app font-medium">
                      {loan.empName}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                        loan.loanType === "สามัญ" 
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : loan.loanType === "ฉุกเฉิน"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-green-500/20 text-green-400 border border-green-500/30"
                      }`}>
                        {loan.loanType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-app font-mono">
                      {formatCurrency(loan.principalAmount)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-ptt-cyan font-bold font-mono">
                      {formatCurrency(loan.remainingBalance)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-app font-mono">
                      {formatCurrency(loan.monthlyPayment)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-soft rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-ptt-blue to-ptt-cyan"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted w-12 text-right">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusTag variant={getStatusVariant(
                        loan.status === "Active" ? "Active" :
                        loan.status === "Overdue" ? "ขาดงาน" :
                        loan.status === "Completed" ? "เสร็จสิ้น" : "Resigned"
                      )}>
                        {loan.status === "Active" && "Active"}
                        {loan.status === "Overdue" && "ผิดนัด"}
                        {loan.status === "Completed" && "เสร็จสิ้น"}
                        {loan.status === "Defaulted" && "ผิดนัดรุนแรง"}
                      </StatusTag>
                      {loan.overdueCount > 0 && (
                        <p className="text-xs text-red-400 mt-1">
                          ผิดนัด {loan.overdueCount} ครั้ง
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedLoan(loan)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs 
                                   bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                                   transition-colors font-medium"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          ดู
                        </button>
                        {(loan.status === "Active" || loan.status === "Overdue") && (
                          <button
                            onClick={() => setSelectedLoan(loan)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs 
                                     bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg
                                     transition-colors font-medium"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            ชำระ
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {filteredLoans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted font-light">ไม่พบข้อมูลการกู้ยืม</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Loan Detail Modal */}
      <ModalForm
        isOpen={selectedLoan !== null}
        onClose={() => setSelectedLoan(null)}
        title={`รายละเอียดการกู้ - ${selectedLoan?.empName || ""}`}
        size="lg"
      >
        {selectedLoan && (
          <div className="space-y-6">
            {/* Loan Info */}
            <div className="bg-soft rounded-xl p-4 border border-app">
              <h3 className="text-lg font-semibold text-app mb-4 font-display">
                ข้อมูลสัญญากู้
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted mb-1">รหัสพนักงาน:</p>
                  <p className="text-app font-medium">{selectedLoan.empCode}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">ประเภทกู้:</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    selectedLoan.loanType === "สามัญ" 
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                      : selectedLoan.loanType === "ฉุกเฉิน"
                      ? "bg-red-500/10 text-red-400 border border-red-500/30"
                      : "bg-green-500/10 text-green-400 border border-green-500/30"
                  }`}>
                    {selectedLoan.loanType}
                  </span>
                </div>
                <div>
                  <p className="text-muted mb-1">เงินต้น:</p>
                  <p className="text-app font-mono font-semibold">
                    {formatCurrency(selectedLoan.principalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-muted mb-1">ยอดคงเหลือ:</p>
                  <p className="text-ptt-cyan font-mono font-bold">
                    {formatCurrency(selectedLoan.remainingBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-muted mb-1">อัตราดอกเบี้ย:</p>
                  <p className="text-app">
                    {selectedLoan.interestRate}% ต่อเดือน (ดอกเบี้ยคงที่)
                    {selectedLoan.interestRate === 0 && " (ปลอดดอกเบี้ย)"}
                  </p>
                </div>
                <div>
                  <p className="text-muted mb-1">ค่างวด/เดือน:</p>
                  <p className="text-app font-mono font-semibold">
                    {formatCurrency(selectedLoan.monthlyPayment)}
                  </p>
                </div>
                <div>
                  <p className="text-muted mb-1">จำนวนงวด:</p>
                  <p className="text-app">{selectedLoan.totalMonths} เดือน (ผ่อนนานสุด 10 เดือน)</p>
                </div>
                <div>
                  <p className="text-muted mb-1">วิธีการชำระ:</p>
                  <p className="text-app">หักจากเงินเดือน</p>
                </div>
                <div>
                  <p className="text-muted mb-1">วันที่เริ่มกู้:</p>
                  <p className="text-app">{formatDate(selectedLoan.startDate)}</p>
                </div>
                {selectedLoan.endDate && (
                  <div>
                    <p className="text-muted mb-1">วันที่ครบกำหนด:</p>
                    <p className="text-app">{formatDate(selectedLoan.endDate)}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted mb-1">ความคืบหน้า:</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-soft rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-ptt-blue to-ptt-cyan"
                        style={{ width: `${getPaymentProgress(selectedLoan)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted">
                      {getPaymentProgress(selectedLoan).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h3 className="text-lg font-semibold text-app mb-4 font-display">
                ประวัติการชำระ ({selectedLoan.paymentHistory.length} งวด)
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedLoan.paymentHistory.length > 0 ? (
                  selectedLoan.paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-soft rounded-xl border-app"
                    >
                      <div>
                        <p className="font-medium text-app">
                          {formatMonthLabel(payment.month)}
                        </p>
                        <p className="text-sm text-muted">
                          ชำระเมื่อ {formatDate(payment.paymentDate)}
                          {payment.deductionDate && ` (หักเมื่อ ${formatDate(payment.deductionDate)})`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-app font-semibold font-mono">
                          {formatCurrency(payment.total)}
                        </p>
                        <p className="text-xs text-muted">
                          ต้น: {formatCurrency(payment.principal)} • ดอก: {formatCurrency(payment.interest)}
                        </p>
                        {payment.status === "Paid" ? (
                          <span className="inline-flex items-center mt-2 px-2 py-1 rounded text-xs font-medium
                                         bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            ชำระแล้ว
                          </span>
                        ) : payment.status === "Overdue" ? (
                          <span className="inline-flex items-center mt-2 px-2 py-1 rounded text-xs font-medium
                                         bg-red-500/10 text-red-400 border border-red-500/30">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            ผิดนัด
                          </span>
                        ) : (
                          <span className="inline-flex items-center mt-2 px-2 py-1 rounded text-xs font-medium
                                         bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                            <Clock className="w-3 h-3 mr-1" />
                            รอชำระ
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted">
                    ยังไม่มีประวัติการชำระ
                  </div>
                )}
              </div>
            </div>

            {/* Loan Summary */}
            <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-app mb-3 font-display">
                สรุปการกู้
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted">ชำระแล้ว:</p>
                  <p className="text-app font-semibold font-mono">
                    {formatCurrency(selectedLoan.principalAmount - selectedLoan.remainingBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-muted">คงเหลือ:</p>
                  <p className="text-ptt-cyan font-bold font-mono">
                    {formatCurrency(selectedLoan.remainingBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-muted">จำนวนงวดที่ชำระ:</p>
                  <p className="text-app font-semibold">
                    {selectedLoan.paymentHistory.filter(p => p.status === "Paid").length} / {selectedLoan.totalMonths}
                  </p>
                </div>
                <div>
                  <p className="text-muted">จำนวนครั้งที่ผิดนัด:</p>
                  <p className={`font-semibold ${selectedLoan.overdueCount > 0 ? "text-red-400" : "text-app"}`}>
                    {selectedLoan.overdueCount} ครั้ง
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}

