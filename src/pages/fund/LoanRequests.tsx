import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  FileCheck
} from "lucide-react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { 
  loanRequests, 
  fundMembers,
  employees,
  type LoanRequest,
  type LoanType
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

// Calculate max loan amount based on savings
const calculateMaxLoanAmount = (totalSavings: number, loanType: LoanType): number => {
  switch (loanType) {
    case "สามัญ":
      return totalSavings * 20; // 20-30 เท่า
    case "ฉุกเฉิน":
      return 50000; // สูงสุด 50,000 บาท
    case "ที่อยู่อาศัย":
      return 500000; // สูงสุด 500,000 บาท
    default:
      return 0;
  }
};

// Check if employee has worked for at least 1 year
const checkWorkDuration = (empCode: string): boolean => {
  const employee = employees.find(e => e.code === empCode);
  if (!employee) return false;
  const startDate = new Date(employee.startDate);
  const today = new Date();
  const years = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return years >= 1;
};

// Get required guarantors count (2 people as per requirements)
const getRequiredGuarantors = (amount: number, borrowerSavings: number): number => {
  // หากเงินฝากของผู้กู้ในกองทุนมีมากกว่าเงินที่ต้องการกู้ไม่จำเป็นต้องมีผู้ค้ำประกัน
  if (borrowerSavings >= amount) return 0;
  
  // ผู้ค้ำประกัน จำนวน 2 คน
  return 2;
};

// Check if guarantor can guarantee (เงินฝากในกองทุนของผู้ค้ำต้องไม่น้อยกว่าเงินกู้ยืม)
const canGuarantorGuarantee = (guarantorSavings: number, loanAmount: number): boolean => {
  return guarantorSavings >= loanAmount;
};

// Check if person can guarantee others (บุคคล 1 คน สามารถค้ำประกันให้ได้ 2 คนเท่านั้น)
const canPersonGuaranteeMore = (guarantorCode: string, allLoanRequests: LoanRequest[]): boolean => {
  const currentGuaranteeCount = allLoanRequests.filter(r => 
    r.status === "Pending" || r.status === "Approved" || r.status === "Completed"
  ).reduce((count, r) => {
    return count + (r.guarantors.includes(guarantorCode) ? 1 : 0);
  }, 0);
  return currentGuaranteeCount < 2;
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

export default function LoanRequests() {
  const [filteredRequests, setFilteredRequests] = useState<LoanRequest[]>(loanRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    empCode: "",
    loanType: "" as LoanType | "",
    requestedAmount: "",
    purpose: "",
    guarantors: [] as string[],
    documents: [] as string[]
  });

  // Handle filtering
  const handleFilter = () => {
    let filtered = loanRequests;

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.empCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (deptFilter) {
      filtered = filtered.filter((r) => {
        const dept = getEmployeeDept(r.empCode);
        return dept === deptFilter;
      });
    }

    if (statusFilter) {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter((r) => r.loanType === typeFilter);
    }

    setFilteredRequests(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, typeFilter, deptFilter]);

  // Calculate statistics
  const pendingRequests = filteredRequests.filter((r) => r.status === "Pending").length;
  const approvedRequests = filteredRequests.filter((r) => r.status === "Approved").length;
  const totalRequestedAmount = filteredRequests.reduce((sum, r) => sum + r.requestedAmount, 0);
  const totalApprovedAmount = filteredRequests
    .filter((r) => r.approvedAmount)
    .reduce((sum, r) => sum + (r.approvedAmount || 0), 0);

  // Handle submit new loan request
  const handleSubmitLoanRequest = () => {
    if (!formData.empCode || !formData.loanType || !formData.requestedAmount || !formData.purpose) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    // ตรวจสอบอายุงาน 1 ปีขึ้นไป
    if (!checkWorkDuration(formData.empCode)) {
      alert("ต้องมีอายุงาน 1 ปีขึ้นไปจึงจะสามารถกู้ยืมได้");
      return;
    }

    const member = fundMembers.find(m => m.empCode === formData.empCode);
    if (!member) {
      alert("ไม่พบสมาชิกกองทุนที่ระบุ");
      return;
    }

    const loanAmount = Number(formData.requestedAmount);
    
    // ตรวจสอบผู้ค้ำประกัน
    const guarantorSavings = formData.guarantors.map(code => {
      const guarantor = fundMembers.find(m => m.empCode === code);
      return guarantor ? guarantor.totalSavings : 0;
    });
    
    const requiredGuarantors = getRequiredGuarantors(loanAmount, member.totalSavings);
    
    // หากเงินฝากของผู้กู้ในกองทุนมีมากกว่าเงินที่ต้องการกู้ไม่จำเป็นต้องมีผู้ค้ำประกัน
    if (requiredGuarantors > 0) {
      if (formData.guarantors.length < requiredGuarantors) {
        alert(`ต้องมีผู้ค้ำประกัน ${requiredGuarantors} คน`);
        return;
      }
      
      // ตรวจสอบว่าเงินฝากในกองทุนของผู้ค้ำต้องไม่น้อยกว่าเงินกู้ยืม
      for (let i = 0; i < formData.guarantors.length; i++) {
        const guarantor = fundMembers.find(m => m.empCode === formData.guarantors[i]);
        if (!guarantor) {
          alert(`ไม่พบสมาชิกกองทุนผู้ค้ำประกัน: ${formData.guarantors[i]}`);
          return;
        }
        if (!canGuarantorGuarantee(guarantor.totalSavings, loanAmount)) {
          alert(`ผู้ค้ำประกัน ${guarantor.empName} มีเงินฝากไม่เพียงพอ (ต้องไม่น้อยกว่า ${formatCurrency(loanAmount)})`);
          return;
        }
        // ตรวจสอบว่าบุคคล 1 คน สามารถค้ำประกันให้ได้ 2 คนเท่านั้น
        if (!canPersonGuaranteeMore(formData.guarantors[i], loanRequests)) {
          alert(`ผู้ค้ำประกัน ${guarantor.empName} กำลังค้ำประกันผู้อื่นครบ 2 คนแล้ว`);
          return;
        }
      }
      
      // ตรวจสอบว่าเงินฝากผู้กู้บวกกับผู้ค้ำประกันต้องไม่น้อยกว่าเงินกู้ยืม
      const totalSavings = member.totalSavings + guarantorSavings.reduce((sum, s) => sum + s, 0);
      if (totalSavings < loanAmount) {
        alert(`เงินฝากผู้กู้บวกกับผู้ค้ำประกันต้องไม่น้อยกว่าเงินกู้ยืม (ปัจจุบัน: ${formatCurrency(totalSavings)}, ต้องการ: ${formatCurrency(loanAmount)})`);
        return;
      }
    }

    // ตรวจสอบเอกสาร (คำร้องกู้ยืมกองทุน 2 แผ่น และ สำเนาบัตรประชาชน 1 ฉบับ)
    if (formData.documents.length < 3) {
      alert("กรุณาแนบเอกสารให้ครบถ้วน:\n- คำร้องกู้ยืมกองทุน 2 แผ่น\n- สำเนาบัตรประชาชน 1 ฉบับ");
      return;
    }

    alert(`ยื่นคำขอกู้สำเร็จ! (Mock)\nขั้นตอนต่อไป: กรรมการห้าง -> คุณนิด -> ผู้บริหาร`);
    setFormData({
      empCode: "",
      loanType: "" as LoanType | "",
      requestedAmount: "",
      purpose: "",
      guarantors: [],
      documents: []
    });
    setIsNewRequestModalOpen(false);
  };

  // Handle approve/reject
  const handleApprove = (request: LoanRequest) => {
    setSelectedRequest(request);
    // Approval modal can be opened here if needed
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReject = (_request: LoanRequest) => {
    const reason = prompt("กรุณาระบุเหตุผลที่ไม่อนุมัติ:");
    if (reason) {
      alert(`ไม่อนุมัติคำขอกู้ (Mock)\nเหตุผล: ${reason}`);
    }
  };

  // Get member info
  const getMemberInfo = (empCode: string) => {
    return fundMembers.find(m => m.empCode === empCode);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            คำขอกู้ยืมเงิน
          </h1>
          <p className="text-muted font-light">
            จัดการคำขอกู้ยืมเงินกองทุน • แสดง {filteredRequests.length} จาก {loanRequests.length} รายการ
          </p>
        </div>

        <button
          onClick={() => setIsNewRequestModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          ยื่นคำขอกู้
        </button>
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
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-muted text-sm font-light">รออนุมัติ</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {pendingRequests}
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
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-muted text-sm font-light">อนุมัติแล้ว</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {approvedRequests}
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
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-muted text-sm font-light">ยอดขอรวม</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {formatCurrency(totalRequestedAmount)}
          </p>
          <p className="text-xs text-muted mt-1">
            จำนวนเงินที่ขอ
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
              <CheckCircle className="w-5 h-5 text-ptt-cyan" />
            </div>
            <p className="text-muted text-sm font-light">ยอดอนุมัติรวม</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {formatCurrency(totalApprovedAmount)}
          </p>
          <p className="text-xs text-muted mt-1">
            จำนวนเงินที่อนุมัติ
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
              { label: "Pending", value: "Pending" },
              { label: "Approved", value: "Approved" },
              { label: "Rejected", value: "Rejected" },
              { label: "Completed", value: "Completed" },
            ],
            onChange: (value) => {
              setStatusFilter(value);
              handleFilter();
            },
          },
        ]}
      />

      {/* Requests Table */}
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
                  จำนวนเงิน
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  วัตถุประสงค์
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  วันที่ยื่น
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
              {filteredRequests.map((request, index) => (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-soft transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">
                      {request.empCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-app font-medium">
                      {request.empName}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                        request.loanType === "สามัญ" 
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : request.loanType === "ฉุกเฉิน"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-green-500/20 text-green-400 border border-green-500/30"
                      }`}>
                        {request.loanType === "สามัญ" && "กู้สามัญ"}
                        {request.loanType === "ฉุกเฉิน" && "กู้ฉุกเฉิน"}
                        {request.loanType === "ที่อยู่อาศัย" && "กู้ที่อยู่อาศัย"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm">
                        <div className="text-app font-mono font-semibold">
                          {formatCurrency(request.requestedAmount)}
                        </div>
                        {request.approvedAmount && (
                          <div className="text-xs text-green-400 font-mono">
                            อนุมัติ: {formatCurrency(request.approvedAmount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-app">
                      {request.purpose}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {formatDate(request.requestDate)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusTag variant={getStatusVariant(
                        request.status === "Approved" ? "อนุมัติแล้ว" :
                        request.status === "Rejected" ? "ไม่อนุมัติ" :
                        request.status === "Completed" ? "เสร็จสิ้น" : "รออนุมัติ"
                      )}>
                        {request.status === "Pending" && "รออนุมัติ"}
                        {request.status === "Approved" && "อนุมัติแล้ว"}
                        {request.status === "Rejected" && "ไม่อนุมัติ"}
                        {request.status === "Completed" && "เสร็จสิ้น"}
                      </StatusTag>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs 
                                   bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                                   transition-colors font-medium"
                        >
                          <FileText className="w-3 h-3" />
                          ดู
                        </button>
                        {request.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(request)}
                              className="inline-flex items-center gap-1 px-3 py-2 text-xs 
                                       bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg
                                       transition-colors font-medium"
                            >
                              <CheckCircle className="w-3 h-3" />
                              อนุมัติ
                            </button>
                            <button
                              onClick={() => handleReject(request)}
                              className="inline-flex items-center gap-1 px-3 py-2 text-xs 
                                       bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg
                                       transition-colors font-medium"
                            >
                              <XCircle className="w-3 h-3" />
                              ไม่อนุมัติ
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              
            </tbody>
          </table>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted font-light">ไม่พบคำขอกู้</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* New Loan Request Modal */}
      <ModalForm
        isOpen={isNewRequestModalOpen}
        onClose={() => {
          setIsNewRequestModalOpen(false);
          setFormData({
            empCode: "",
            loanType: "" as LoanType | "",
            requestedAmount: "",
            purpose: "",
            guarantors: [],
            documents: []
          });
        }}
        title="ยื่นคำขอกู้ยืมเงิน"
        onSubmit={handleSubmitLoanRequest}
        submitLabel="ยื่นคำขอ"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              สมาชิกกองทุน <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.empCode}
              onChange={(e) => {
                const member = fundMembers.find(m => m.empCode === e.target.value);
                setFormData({ ...formData, empCode: e.target.value });
                if (member && formData.loanType) {
                  // Calculate max amount for suggestion (can be used for UI hint)
                  calculateMaxLoanAmount(member.totalSavings, formData.loanType as LoanType);
                }
              }}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="">เลือกสมาชิก</option>
              {fundMembers
                .filter(m => m.status === "Active")
                .map((member) => (
                  <option key={member.empCode} value={member.empCode}>
                    {member.empCode} - {member.empName} (สะสม: {formatCurrency(member.totalSavings)})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              ประเภทกู้ <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.loanType}
              onChange={(e) => {
                const loanType = e.target.value as LoanType;
                const member = fundMembers.find(m => m.empCode === formData.empCode);
                setFormData({ ...formData, loanType });
                if (member) {
                  // Calculate max amount for suggestion (can be used for UI hint)
                  calculateMaxLoanAmount(member.totalSavings, loanType);
                }
              }}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="">เลือกประเภทกู้</option>
              <option value="สามัญ">กู้สามัญ (ดอกเบี้ย 1% ต่อเดือน, ผ่อนนานสุด 10 เดือน, หักจากเงินเดือน)</option>
              <option value="ฉุกเฉิน">กู้ฉุกเฉิน (ดอกเบี้ย 1% ต่อเดือน, ผ่อนนานสุด 10 เดือน, หักจากเงินเดือน)</option>
              <option value="ที่อยู่อาศัย">กู้ที่อยู่อาศัย (ดอกเบี้ย 1% ต่อเดือน, ผ่อนนานสุด 10 เดือน, หักจากเงินเดือน)</option>
            </select>
          </div>

          {formData.empCode && formData.loanType && (() => {
            const member = fundMembers.find(m => m.empCode === formData.empCode);
            if (!member) return null;
            const maxAmount = calculateMaxLoanAmount(member.totalSavings, formData.loanType as LoanType);
            const hasWorked1Year = checkWorkDuration(formData.empCode);
            const needsGuarantors = member.totalSavings < Number(formData.requestedAmount || 0);
            return (
              <div className="space-y-2">
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-400">
                    💡 วงเงินกู้สูงสุด: {formatCurrency(maxAmount)}
                    {formData.loanType === "สามัญ" && ` (${member.totalSavings.toLocaleString()} × 20)`}
                  </p>
                </div>
                {!hasWorked1Year && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400">
                      ⚠️ ต้องมีอายุงาน 1 ปีขึ้นไปจึงจะสามารถกู้ยืมได้
                    </p>
                  </div>
                )}
                {needsGuarantors && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-400">
                      ⚠️ ต้องมีผู้ค้ำประกัน 2 คน (เงินฝากในกองทุนของผู้ค้ำต้องไม่น้อยกว่าเงินกู้ยืม)
                    </p>
                  </div>
                )}
                {!needsGuarantors && member.totalSavings >= Number(formData.requestedAmount || 0) && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-400">
                      ✓ เงินฝากในกองทุนเพียงพอ ไม่จำเป็นต้องมีผู้ค้ำประกัน
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              จำนวนเงินที่ขอ (บาท) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={formData.requestedAmount}
              onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
              min="1000"
              step="1000"
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="เช่น 100000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              วัตถุประสงค์ <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="ระบุวัตถุประสงค์ในการกู้ยืม"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              ผู้ค้ำประกัน <span className="text-red-400">*</span>
            </label>
            <select
              multiple
              value={formData.guarantors}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, guarantors: selected });
              }}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              size={5}
            >
              {fundMembers
                .filter(m => m.status === "Active" && m.empCode !== formData.empCode)
                .map((member) => (
                  <option key={member.empCode} value={member.empCode}>
                    {member.empCode} - {member.empName}
                  </option>
                ))}
            </select>
            <p className="text-xs text-muted mt-1">
              {formData.requestedAmount && (() => {
                const member = fundMembers.find(m => m.empCode === formData.empCode);
                if (!member) return "";
                const loanAmount = Number(formData.requestedAmount);
                const required = getRequiredGuarantors(loanAmount, member.totalSavings);
                if (required === 0) {
                  return "✓ เงินฝากในกองทุนเพียงพอ ไม่จำเป็นต้องมีผู้ค้ำประกัน";
                }
                return `ต้องมีผู้ค้ำประกัน ${required} คน (เงินฝากในกองทุนของผู้ค้ำต้องไม่น้อยกว่าเงินกู้ยืม, บุคคล 1 คน สามารถค้ำประกันให้ได้ 2 คนเท่านั้น) (เลือกโดยกด Ctrl/Cmd + คลิก)`;
              })()}
            </p>
          </div>

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-400 mb-2">
              ⚠️ ต้องแนบเอกสาร:
            </p>
            <ul className="text-xs text-yellow-400 list-disc list-inside space-y-1">
              <li>คำร้องกู้ยืมกองทุน 2 แผ่น</li>
              <li>สำเนาบัตรประชาชน 1 ฉบับ</li>
            </ul>
            <p className="text-xs text-yellow-300 mt-2">
              📋 ขั้นตอนการอนุมัติ: พนักงานส่งคำร้องขอกู้ยืม → กรรมการห้างนั้นๆ → คุณนิด → ผู้บริหาร
            </p>
          </div>
        </div>
      </ModalForm>

      {/* Request Detail Modal */}
      <ModalForm
        isOpen={selectedRequest !== null}
        onClose={() => setSelectedRequest(null)}
        title={`รายละเอียดคำขอกู้ - ${selectedRequest?.empName || ""}`}
        size="lg"
      >
        {selectedRequest && (() => {
          const member = getMemberInfo(selectedRequest.empCode);
          return (
            <div className="space-y-6">
              {/* Request Info */}
              <div className="bg-soft rounded-xl p-4 border border-app">
                <h3 className="text-lg font-semibold text-app mb-4 font-display">
                  ข้อมูลคำขอกู้
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted mb-1">รหัสพนักงาน:</p>
                    <p className="text-app font-medium">{selectedRequest.empCode}</p>
                  </div>
                  <div>
                    <p className="text-muted mb-1">ประเภทกู้:</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      selectedRequest.loanType === "สามัญ" 
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                        : selectedRequest.loanType === "ฉุกเฉิน"
                        ? "bg-red-500/10 text-red-400 border border-red-500/30"
                        : "bg-green-500/10 text-green-400 border border-green-500/30"
                    }`}>
                      {selectedRequest.loanType}
                    </span>
                  </div>
                  <div>
                    <p className="text-muted mb-1">จำนวนเงินที่ขอ:</p>
                    <p className="text-app font-mono font-semibold">
                      {formatCurrency(selectedRequest.requestedAmount)}
                    </p>
                  </div>
                  {selectedRequest.approvedAmount && (
                    <div>
                      <p className="text-muted mb-1">จำนวนเงินที่อนุมัติ:</p>
                      <p className="text-green-400 font-mono font-semibold">
                        {formatCurrency(selectedRequest.approvedAmount)}
                      </p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-muted mb-1">วัตถุประสงค์:</p>
                    <p className="text-app">{selectedRequest.purpose}</p>
                  </div>
                  <div>
                    <p className="text-muted mb-1">วันที่ยื่นคำขอ:</p>
                    <p className="text-app">{formatDate(selectedRequest.requestDate)}</p>
                  </div>
                  {selectedRequest.approvalDate && (
                    <div>
                      <p className="text-muted mb-1">วันที่อนุมัติ:</p>
                      <p className="text-app">{formatDate(selectedRequest.approvalDate)}</p>
                    </div>
                  )}
                  {member && (
                    <div className="col-span-2">
                      <p className="text-muted mb-1">เงินสัจจะสะสม:</p>
                      <p className="text-ptt-cyan font-mono font-semibold">
                        {formatCurrency(member.totalSavings)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Guarantors */}
              <div>
                <h3 className="text-lg font-semibold text-app mb-3 font-display">
                  ผู้ค้ำประกัน ({selectedRequest.guarantors.length} คน)
                </h3>
                <div className="space-y-2">
                  {selectedRequest.guarantors.map((guarantorCode) => {
                    const guarantor = fundMembers.find(m => m.empCode === guarantorCode);
                    return (
                      <div
                        key={guarantorCode}
                        className="p-3 bg-soft rounded-lg border-app"
                      >
                        <p className="text-app font-medium">
                          {guarantorCode} - {guarantor?.empName || "ไม่พบข้อมูล"}
                        </p>
                        {guarantor && (
                          <p className="text-xs text-muted">
                            เงินสัจจะสะสม: {formatCurrency(guarantor.totalSavings)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-app mb-3 font-display">
                  เอกสารที่แนบ
                </h3>
                <div className="space-y-2">
                  {selectedRequest.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-soft rounded-lg"
                    >
                      <FileCheck className="w-4 h-4 text-ptt-cyan" />
                      <span className="text-sm text-app">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="p-4 bg-soft rounded-xl border border-app">
                <div className="flex items-center justify-between">
                  <span className="text-muted">สถานะ:</span>
                  <StatusTag variant={getStatusVariant(
                    selectedRequest.status === "Approved" ? "อนุมัติแล้ว" :
                    selectedRequest.status === "Rejected" ? "ไม่อนุมัติ" :
                    selectedRequest.status === "Completed" ? "เสร็จสิ้น" : "รออนุมัติ"
                  )}>
                    {selectedRequest.status === "Pending" && "รออนุมัติ"}
                    {selectedRequest.status === "Approved" && "อนุมัติแล้ว"}
                    {selectedRequest.status === "Rejected" && "ไม่อนุมัติ"}
                    {selectedRequest.status === "Completed" && "เสร็จสิ้น"}
                  </StatusTag>
                </div>
                {selectedRequest.approvedBy && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-muted">ผู้อนุมัติ:</span>
                    <span className="text-app">{selectedRequest.approvedBy}</span>
                  </div>
                )}
                {selectedRequest.rejectionReason && (
                  <div className="mt-2">
                    <p className="text-muted text-sm mb-1">เหตุผลที่ไม่อนุมัติ:</p>
                    <p className="text-red-400 text-sm">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </ModalForm>
    </div>
  );
}

