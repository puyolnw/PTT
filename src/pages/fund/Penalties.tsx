import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  FileText, 
  Ban,
  DollarSign,
  UserX
} from "lucide-react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { 
  loanPenalties, 
  loans,
  employees,
  type LoanPenalty 
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

const getPenaltyActionColor = (action: LoanPenalty["action"]): string => {
  switch (action) {
    case "แจ้งเตือน":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    case "ห้ามกู้ใหม่ 6 เดือน":
      return "bg-orange-500/10 text-orange-400 border-orange-500/30";
    case "ตัดเงินสัจจะชำระหนี้":
      return "bg-red-500/10 text-red-400 border-red-500/30";
    case "แจ้งผู้บริหาร":
      return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    default:
      return "bg-muted/10 text-muted border-muted/20";
  }
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

export default function Penalties() {
  const [filteredPenalties, setFilteredPenalties] = useState<LoanPenalty[]>(loanPenalties);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [selectedPenalty, setSelectedPenalty] = useState<LoanPenalty | null>(null);

  // Handle filtering
  const handleFilter = () => {
    let filtered = loanPenalties;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.empCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (deptFilter) {
      filtered = filtered.filter((p) => {
        const dept = getEmployeeDept(p.empCode);
        return dept === deptFilter;
      });
    }

    if (statusFilter) {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredPenalties(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, deptFilter]);

  // Calculate statistics
  const warningCount = filteredPenalties.filter((p) => p.overdueCount === 1).length;
  const banCount = filteredPenalties.filter((p) => p.overdueCount === 2).length;
  const severeCount = filteredPenalties.filter((p) => p.overdueCount >= 3).length;

  // Get loans with overdue
  const overdueLoans = loans.filter(l => l.overdueCount > 0 && l.status === "Active");

  // Handle apply penalty
  const handleApplyPenalty = (loanId: number) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const overdueCount = loan.overdueCount + 1;
    let action: LoanPenalty["action"];
    let amount: number | undefined;

    if (overdueCount === 1) {
      action = "แจ้งเตือน";
    } else if (overdueCount === 2) {
      action = "ห้ามกู้ใหม่ 6 เดือน";
    } else {
      action = "ตัดเงินสัจจะชำระหนี้";
      // Calculate amount to deduct (use savings to pay loan)
      amount = loan.monthlyPayment;
    }

    alert(`ดำเนินการบทลงโทษ: ${action}${amount ? ` (ตัดเงิน ${formatCurrency(amount)})` : ""} (Mock)`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-app mb-2 font-display">
          บทลงโทษผู้ผิดนัด
        </h1>
        <p className="text-muted font-light">
          จัดการบทลงโทษสำหรับสมาชิกที่ผิดนัดชำระเงินกู้ • แสดง {filteredPenalties.length} รายการ
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
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-muted text-sm font-light">แจ้งเตือน</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {warningCount}
          </p>
          <p className="text-xs text-muted mt-1">
            ครั้งที่ 1
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Ban className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-muted text-sm font-light">ห้ามกู้ใหม่</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {banCount}
          </p>
          <p className="text-xs text-muted mt-1">
            ครั้งที่ 2
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-muted text-sm font-light">ตัดเงินสัจจะ</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {severeCount}
          </p>
          <p className="text-xs text-muted mt-1">
            ครั้งที่ 3+
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-ptt-cyan/20 rounded-lg">
              <UserX className="w-5 h-5 text-ptt-cyan" />
            </div>
            <p className="text-muted text-sm font-light">กู้ที่ผิดนัด</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {overdueLoans.length}
          </p>
          <p className="text-xs text-muted mt-1">
            รายการ
          </p>
        </motion.div>
      </div>

      {/* Overdue Loans Section */}
      {overdueLoans.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-app mb-4 font-display flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            กู้ที่ผิดนัดชำระ (ต้องดำเนินการ)
          </h3>
          <div className="space-y-3">
            {overdueLoans.map((loan) => (
              <div
                key={loan.id}
                className="flex items-center justify-between p-4 bg-soft rounded-xl border border-red-500/30"
              >
                <div>
                  <p className="font-medium text-app">
                    {loan.empCode} - {loan.empName}
                  </p>
                  <p className="text-sm text-muted">
                    ผิดนัด {loan.overdueCount} ครั้ง • ยอดคงเหลือ: {formatCurrency(loan.remainingBalance)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleApplyPenalty(loan.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                             bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg
                             transition-colors font-medium"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    ดำเนินการบทลงโทษ
                  </button>
                  <button
                    onClick={() => {
                      // View loan details (can be implemented later)
                      alert(`ดูรายละเอียดกู้ ID: ${loan.id} (Mock)`);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                             bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                             transition-colors font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            label: "ทุกสถานะ",
            value: statusFilter,
            options: [
              { label: "ทุกสถานะ", value: "" },
              { label: "Active", value: "Active" },
              { label: "Resolved", value: "Resolved" },
            ],
            onChange: (value) => {
              setStatusFilter(value);
              handleFilter();
            },
          },
        ]}
      />

      {/* Penalties Table */}
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
                  ครั้งที่ผิดนัด
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  มาตรการ
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  วันที่ดำเนินการ
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  ผู้ดำเนินการ
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">
                  จำนวนเงิน
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
              {filteredPenalties.map((penalty, index) => (
                <motion.tr
                  key={penalty.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-soft transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">
                    {penalty.empCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-app font-medium">
                    {penalty.empName}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium
                                     bg-red-500/10 text-red-400 border border-red-500/30">
                      ครั้งที่ {penalty.overdueCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${
                      getPenaltyActionColor(penalty.action)
                    }`}>
                      {penalty.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {formatDate(penalty.actionDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-app">
                    {penalty.actionBy}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-app font-mono">
                    {penalty.amount ? formatCurrency(penalty.amount) : "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusTag variant={getStatusVariant(
                      penalty.status === "Active" ? "รออนุมัติ" : "เสร็จสิ้น"
                    )}>
                      {penalty.status === "Active" ? "Active" : "Resolved"}
                    </StatusTag>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedPenalty(penalty)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                               bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                               transition-colors font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      ดูรายละเอียด
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredPenalties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted font-light">ไม่พบข้อมูลบทลงโทษ</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Penalty Rules Info */}
      <div className="bg-soft border border-app rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-app mb-4 font-display">
          มาตรการบทลงโทษ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h4 className="font-semibold text-app">ครั้งที่ 1</h4>
            </div>
            <p className="text-sm text-app">แจ้งเตือนเป็นลายลักษณ์อักษร</p>
          </div>
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="w-5 h-5 text-orange-400" />
              <h4 className="font-semibold text-app">ครั้งที่ 2</h4>
            </div>
            <p className="text-sm text-app">ห้ามกู้ใหม่ 6 เดือน</p>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-red-400" />
              <h4 className="font-semibold text-app">ครั้งที่ 3+</h4>
            </div>
            <p className="text-sm text-app">ตัดเงินสัจจะชำระหนี้ + แจ้งผู้บริหาร</p>
          </div>
        </div>
      </div>

      {/* Penalty Detail Modal */}
      <ModalForm
        isOpen={selectedPenalty !== null}
        onClose={() => setSelectedPenalty(null)}
        title={`รายละเอียดบทลงโทษ - ${selectedPenalty?.empName || ""}`}
      >
        {selectedPenalty && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted mb-1">รหัสพนักงาน:</p>
                <p className="text-app font-medium">{selectedPenalty.empCode}</p>
              </div>
              <div>
                <p className="text-muted mb-1">ครั้งที่ผิดนัด:</p>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium
                                 bg-red-500/10 text-red-400 border border-red-500/30">
                  ครั้งที่ {selectedPenalty.overdueCount}
                </span>
              </div>
              <div>
                <p className="text-muted mb-1">มาตรการ:</p>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                  getPenaltyActionColor(selectedPenalty.action)
                }`}>
                  {selectedPenalty.action}
                </span>
              </div>
              <div>
                <p className="text-muted mb-1">วันที่ดำเนินการ:</p>
                <p className="text-app">{formatDate(selectedPenalty.actionDate)}</p>
              </div>
              <div>
                <p className="text-muted mb-1">ผู้ดำเนินการ:</p>
                <p className="text-app">{selectedPenalty.actionBy}</p>
              </div>
              {selectedPenalty.amount && (
                <div>
                  <p className="text-muted mb-1">จำนวนเงินที่ตัด:</p>
                  <p className="text-red-400 font-mono font-semibold">
                    {formatCurrency(selectedPenalty.amount)}
                  </p>
                </div>
              )}
            </div>
            {selectedPenalty.notes && (
              <div className="p-3 bg-soft rounded-lg">
                <p className="text-sm text-muted mb-1">หมายเหตุ:</p>
                <p className="text-sm text-app">{selectedPenalty.notes}</p>
              </div>
            )}
          </div>
        )}
      </ModalForm>
    </div>
  );
}

