import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  PiggyBank, 
  TrendingUp, 
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { 
  savingsDeductions, 
  savingsWithdrawals,
  savingsDeposits,
  fundMembers,
  type SavingsWithdrawal,
  type SavingsDeposit
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

export default function Savings() {
  const [activeTab, setActiveTab] = useState<"deductions" | "deposits" | "withdrawals">("deductions");
  const [filteredDeductions, setFilteredDeductions] = useState(savingsDeductions);
  const [filteredDeposits, setFilteredDeposits] = useState(savingsDeposits);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState(savingsWithdrawals);
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<SavingsWithdrawal | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<SavingsDeposit | null>(null);
  const [isNewWithdrawalModalOpen, setIsNewWithdrawalModalOpen] = useState(false);
  const [isNewDepositModalOpen, setIsNewDepositModalOpen] = useState(false);
  const [withdrawalFormData, setWithdrawalFormData] = useState({
    empCode: "",
    amount: "",
    reason: "" as SavingsWithdrawal["reason"] | "",
    reasonDetail: ""
  });
  const [depositFormData, setDepositFormData] = useState({
    empCode: "",
    amount: "",
    depositMethod: "เงินสด" as SavingsDeposit["depositMethod"],
    receiptNumber: "",
    notes: ""
  });

  // Handle filtering
  const handleFilter = () => {
    let filteredD = savingsDeductions;
    let filteredDep = savingsDeposits;
    let filteredW = savingsWithdrawals;

    if (searchQuery) {
      filteredD = filteredD.filter(
        (d) =>
          d.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.empCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
      filteredDep = filteredDep.filter(
        (d) =>
          d.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.empCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
      filteredW = filteredW.filter(
        (w) =>
          w.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.empCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (monthFilter) {
      filteredD = filteredD.filter((d) => d.month === monthFilter);
    }

    setFilteredDeductions(filteredD);
    setFilteredDeposits(filteredDep);
    setFilteredWithdrawals(filteredW);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, monthFilter]);

  // Calculate statistics
  const totalDeductions = filteredDeductions.reduce((sum, d) => sum + d.amount, 0);
  const totalDeposits = filteredDeposits
    .filter((d) => d.status === "Completed")
    .reduce((sum, d) => sum + d.amount, 0);
  const totalWithdrawals = filteredWithdrawals
    .filter((w) => w.status === "Completed" || w.status === "Approved")
    .reduce((sum, w) => sum + w.amount, 0);
  const totalSavings = fundMembers.reduce((sum, m) => sum + m.totalSavings, 0);

  // Get unique months for filter
  const months = Array.from(new Set(savingsDeductions.map(d => d.month))).sort().reverse();

  // Handle submit withdrawal request
  const handleSubmitWithdrawal = () => {
    if (!withdrawalFormData.empCode || !withdrawalFormData.amount || !withdrawalFormData.reason) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const member = fundMembers.find(m => m.empCode === withdrawalFormData.empCode);
    if (!member) {
      alert("ไม่พบสมาชิกกองทุนที่ระบุ");
      return;
    }

    if (Number(withdrawalFormData.amount) > member.totalSavings) {
      alert("จำนวนเงินที่ถอนเกินเงินสัจจะสะสม");
      return;
    }

    if (member.status !== "Active") {
      alert("สมาชิกต้องมีสถานะ Active ถึงจะถอนเงินได้");
      return;
    }

    alert(`ยื่นคำขอถอนเงินสัจจะสำเร็จ! (Mock)`);
    setWithdrawalFormData({
      empCode: "",
      amount: "",
      reason: "" as SavingsWithdrawal["reason"] | "",
      reasonDetail: ""
    });
    setIsNewWithdrawalModalOpen(false);
  };

  // Handle submit deposit
  const handleSubmitDeposit = () => {
    if (!depositFormData.empCode || !depositFormData.amount) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const member = fundMembers.find(m => m.empCode === depositFormData.empCode);
    if (!member) {
      alert("ไม่พบสมาชิกกองทุนที่ระบุ");
      return;
    }

    if (member.status !== "Active") {
      alert("สมาชิกต้องมีสถานะ Active ถึงจะฝากเงินได้");
      return;
    }

    if (Number(depositFormData.amount) < 100) {
      alert("จำนวนเงินฝากขั้นต่ำ 100 บาท");
      return;
    }

    alert(`บันทึกการฝากเงินสัจจะสำเร็จ! (Mock)`);
    setDepositFormData({
      empCode: "",
      amount: "",
      depositMethod: "เงินสด",
      receiptNumber: "",
      notes: ""
    });
    setIsNewDepositModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            บัญชีสัจจะ
          </h1>
          <p className="text-muted font-light">
            จัดการเงินสัจจะสะสมและการถอนเงิน • แสดง {filteredDeductions.length} รายการหัก • {filteredWithdrawals.length} รายการถอน
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsNewDepositModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-500/80 
                     text-app rounded-xl transition-all duration-200 font-semibold 
                     shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Upload className="w-5 h-5" />
            ฝากเงินเพิ่มเติม
          </button>
          <button
            onClick={() => setIsNewWithdrawalModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                     text-app rounded-xl transition-all duration-200 font-semibold 
                     shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5" />
            ยื่นคำขอถอนเงิน
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
              <PiggyBank className="w-5 h-5 text-ptt-cyan" />
            </div>
            <p className="text-muted text-sm font-light">เงินสัจจะสะสมรวม</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {formatCurrency(totalSavings)}
          </p>
          <p className="text-xs text-muted mt-1">
            จากสมาชิกทั้งหมด
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
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-muted text-sm font-light">หักเงินสัจจะรวม</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {formatCurrency(totalDeductions)}
          </p>
          <p className="text-xs text-muted mt-1">
            จากรายการที่แสดง
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
              <Upload className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-muted text-sm font-light">ฝากเงินเพิ่มเติม</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {formatCurrency(totalDeposits)}
          </p>
          <p className="text-xs text-muted mt-1">
            จำนวนเงินที่ฝากแล้ว
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Download className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-muted text-sm font-light">ถอนเงินรวม</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {formatCurrency(totalWithdrawals)}
          </p>
          <p className="text-xs text-muted mt-1">
            จำนวนเงินที่ถอนแล้ว
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
            label: "ทุกเดือน",
            value: monthFilter,
            options: [
              { label: "ทุกเดือน", value: "" },
              ...months.map((month) => ({
                label: formatMonthLabel(month),
                value: month
              }))
            ],
            onChange: (value) => {
              setMonthFilter(value);
              handleFilter();
            },
          },
        ]}
      />

      {/* Tabs */}
      <div className="bg-soft border border-app rounded-2xl p-6 shadow-xl">
        <div className="flex gap-4 mb-6 border-b border-app">
          <button
            onClick={() => setActiveTab("deductions")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "deductions"
                ? "text-ptt-cyan border-b-2 border-ptt-cyan font-semibold"
                : "text-muted hover:text-app"
            }`}
          >
            ประวัติการหักเงินสัจจะ
          </button>
          <button
            onClick={() => setActiveTab("deposits")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "deposits"
                ? "text-ptt-cyan border-b-2 border-ptt-cyan font-semibold"
                : "text-muted hover:text-app"
            }`}
          >
            ประวัติการฝากเงิน
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "withdrawals"
                ? "text-ptt-cyan border-b-2 border-ptt-cyan font-semibold"
                : "text-muted hover:text-app"
            }`}
          >
            ประวัติการถอนเงิน
          </button>
        </div>

        {/* Deductions Table */}
        {activeTab === "deductions" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-soft border-b border-app">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-app">รหัส</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-app">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-app">เดือน</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-app">จำนวนเงิน</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-app">วันที่หัก</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-app">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filteredDeductions.map((deduction, index) => (
                  <motion.tr
                    key={deduction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-soft transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">{deduction.empCode}</td>
                    <td className="px-6 py-4 text-sm text-app font-medium">{deduction.empName}</td>
                    <td className="px-6 py-4 text-sm text-app">{formatMonthLabel(deduction.month)}</td>
                    <td className="px-6 py-4 text-right text-sm text-green-400 font-mono font-semibold">
                      {formatCurrency(deduction.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{formatDate(deduction.deductionDate)}</td>
                    <td className="px-6 py-4 text-center">
                      {deduction.status === "Deducted" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          หักแล้ว
                        </span>
                      ) : deduction.status === "Pending" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                          <Clock className="w-3 h-3 mr-1" />
                          รอหัก
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          หักไม่สำเร็จ
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredDeductions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted font-light">ไม่พบข้อมูลการหักเงินสัจจะ</p>
              </div>
            )}
          </div>
        )}

        {/* Deposits Table */}
        {activeTab === "deposits" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-soft border-b border-app">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-app">รหัส</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-app">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-app">จำนวนเงิน</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-app">วิธีการฝาก</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-app">เลขที่ใบเสร็จ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-app">วันที่ฝาก</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-app">สถานะ</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-app">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filteredDeposits.map((deposit, index) => (
                  <motion.tr
                    key={deposit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-soft transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">{deposit.empCode}</td>
                    <td className="px-6 py-4 text-sm text-app font-medium">{deposit.empName}</td>
                    <td className="px-6 py-4 text-right text-sm text-green-400 font-mono font-semibold">
                      {formatCurrency(deposit.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-app">{deposit.depositMethod}</td>
                    <td className="px-6 py-4 text-sm text-muted">{deposit.receiptNumber || "-"}</td>
                    <td className="px-6 py-4 text-sm text-muted">{formatDate(deposit.depositDate)}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusTag variant={getStatusVariant(
                        deposit.status === "Completed" ? "อนุมัติแล้ว" :
                        deposit.status === "Cancelled" ? "ไม่อนุมัติ" : "รออนุมัติ"
                      )}>
                        {deposit.status === "Completed" ? "เสร็จสิ้น" :
                         deposit.status === "Pending" ? "รอดำเนินการ" : "ยกเลิก"}
                      </StatusTag>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedDeposit(deposit)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg transition-colors font-medium"
                      >
                        <FileText className="w-4 h-4" />
                        ดูรายละเอียด
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredDeposits.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted font-light">ไม่พบข้อมูลการฝากเงิน</p>
              </div>
            )}
          </div>
        )}

        {/* Withdrawals Table */}
        {activeTab === "withdrawals" && (
          <div className="space-y-3">
            {filteredWithdrawals.map((withdrawal, index) => (
              <motion.div
                key={withdrawal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-soft rounded-xl border-app hover:border-ptt-blue/30 transition-colors cursor-pointer"
                onClick={() => setSelectedWithdrawal(withdrawal)}
              >
                <div>
                  <p className="font-medium text-app">
                    {withdrawal.empCode} - {withdrawal.empName}
                  </p>
                  <p className="text-sm text-muted">
                    {formatDate(withdrawal.withdrawalDate)} • {withdrawal.reason}
                    {withdrawal.reasonDetail && ` - ${withdrawal.reasonDetail}`}
                  </p>
                  {withdrawal.hasOutstandingLoan && (
                    <p className="text-xs text-red-400 mt-1">⚠️ มีหนี้ค้างชำระ</p>
                  )}
                  {withdrawal.isGuarantor && (
                    <p className="text-xs text-yellow-400 mt-1">⚠️ กำลังค้ำประกันผู้อื่น</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-app font-semibold font-mono">{formatCurrency(withdrawal.amount)}</p>
                  <StatusTag variant={getStatusVariant(
                    withdrawal.status === "Approved" || withdrawal.status === "Completed" ? "อนุมัติแล้ว" :
                    withdrawal.status === "Rejected" ? "ไม่อนุมัติ" : "รออนุมัติ"
                  )}>
                    {withdrawal.status === "Pending" && "รออนุมัติ"}
                    {withdrawal.status === "Approved" && "อนุมัติแล้ว"}
                    {withdrawal.status === "Rejected" && "ไม่อนุมัติ"}
                    {withdrawal.status === "Completed" && "เสร็จสิ้น"}
                  </StatusTag>
                </div>
              </motion.div>
            ))}
            {filteredWithdrawals.length === 0 && (
              <div className="text-center py-12 text-muted">ยังไม่มีประวัติการถอนเงิน</div>
            )}
          </div>
        )}
      </div>


      {/* New Withdrawal Modal */}
      <ModalForm
        isOpen={isNewWithdrawalModalOpen}
        onClose={() => {
          setIsNewWithdrawalModalOpen(false);
          setWithdrawalFormData({
            empCode: "",
            amount: "",
            reason: "" as SavingsWithdrawal["reason"] | "",
            reasonDetail: ""
          });
        }}
        title="ยื่นคำขอถอนเงินสัจจะ"
        onSubmit={handleSubmitWithdrawal}
        submitLabel="ยื่นคำขอ"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              สมาชิกกองทุน <span className="text-red-400">*</span>
            </label>
            <select
              value={withdrawalFormData.empCode}
              onChange={(e) => {
                setWithdrawalFormData({ ...withdrawalFormData, empCode: e.target.value });
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

          {withdrawalFormData.empCode && (() => {
            const member = fundMembers.find(m => m.empCode === withdrawalFormData.empCode);
            if (!member) return null;
            return (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-400">
                  💡 เงินสัจจะสะสม: {formatCurrency(member.totalSavings)}
                </p>
              </div>
            );
          })()}

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              จำนวนเงินที่ถอน (บาท) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={withdrawalFormData.amount}
              onChange={(e) => setWithdrawalFormData({ ...withdrawalFormData, amount: e.target.value })}
              min="100"
              step="100"
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="เช่น 5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              เหตุผล <span className="text-red-400">*</span>
            </label>
            <select
              value={withdrawalFormData.reason}
              onChange={(e) => setWithdrawalFormData({ ...withdrawalFormData, reason: e.target.value as SavingsWithdrawal["reason"] })}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="">เลือกเหตุผล</option>
              <option value="ลาออก">ลาออก</option>
              <option value="เกษียณ">เกษียณ</option>
              <option value="เสียชีวิต">เสียชีวิต</option>
              <option value="ครบ 5 ปี">ครบ 5 ปี</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>

          {withdrawalFormData.reason === "อื่นๆ" && (
            <div>
              <label className="block text-sm font-medium text-app mb-2">
                รายละเอียดเพิ่มเติม
              </label>
              <textarea
                value={withdrawalFormData.reasonDetail}
                onChange={(e) => setWithdrawalFormData({ ...withdrawalFormData, reasonDetail: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue"
                placeholder="ระบุรายละเอียดเหตุผล"
              />
            </div>
          )}

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-400">
              ⚠️ เงื่อนไขการถอน: ไม่มีหนี้ค้างชำระ, ไม่ได้กำลังค้ำประกันผู้อื่น
            </p>
          </div>
        </div>
      </ModalForm>

      {/* New Deposit Modal */}
      <ModalForm
        isOpen={isNewDepositModalOpen}
        onClose={() => {
          setIsNewDepositModalOpen(false);
          setDepositFormData({
            empCode: "",
            amount: "",
            depositMethod: "เงินสด",
            receiptNumber: "",
            notes: ""
          });
        }}
        title="ฝากเงินสัจจะเพิ่มเติม"
        onSubmit={handleSubmitDeposit}
        submitLabel="บันทึกการฝาก"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              สมาชิกกองทุน <span className="text-red-400">*</span>
            </label>
            <select
              value={depositFormData.empCode}
              onChange={(e) => setDepositFormData({ ...depositFormData, empCode: e.target.value })}
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

          {depositFormData.empCode && (() => {
            const member = fundMembers.find(m => m.empCode === depositFormData.empCode);
            if (!member) return null;
            return (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-400">
                  💡 เงินสัจจะสะสมปัจจุบัน: {formatCurrency(member.totalSavings)}
                </p>
              </div>
            );
          })()}

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              จำนวนเงินที่ฝาก (บาท) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={depositFormData.amount}
              onChange={(e) => setDepositFormData({ ...depositFormData, amount: e.target.value })}
              min="100"
              step="100"
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="เช่น 5000"
            />
            <p className="text-xs text-muted mt-1">ขั้นต่ำ 100 บาท</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              วิธีการฝาก <span className="text-red-400">*</span>
            </label>
            <select
              value={depositFormData.depositMethod}
              onChange={(e) => setDepositFormData({ ...depositFormData, depositMethod: e.target.value as SavingsDeposit["depositMethod"] })}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="เงินสด">เงินสด</option>
              <option value="โอนเงิน">โอนเงิน</option>
              <option value="เช็ค">เช็ค</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              เลขที่ใบเสร็จ (ถ้ามี)
            </label>
            <input
              type="text"
              value={depositFormData.receiptNumber}
              onChange={(e) => setDepositFormData({ ...depositFormData, receiptNumber: e.target.value })}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="เช่น DEP-2025-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              หมายเหตุ (ถ้ามี)
            </label>
            <textarea
              value={depositFormData.notes}
              onChange={(e) => setDepositFormData({ ...depositFormData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-soft border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="เช่น รอเช็คเคลียร์"
            />
          </div>

          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-xs text-green-400">
              💡 การฝากเงินเพิ่มเติมจะถูกเพิ่มเข้าไปในเงินสัจจะสะสมทันที
            </p>
          </div>
        </div>
      </ModalForm>

      {/* Deposit Detail Modal */}
      <ModalForm
        isOpen={selectedDeposit !== null}
        onClose={() => setSelectedDeposit(null)}
        title={`รายละเอียดการฝาก - ${selectedDeposit?.empName || ""}`}
      >
        {selectedDeposit && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted mb-1">รหัสพนักงาน:</p>
                <p className="text-app font-medium">{selectedDeposit.empCode}</p>
              </div>
              <div>
                <p className="text-muted mb-1">จำนวนเงิน:</p>
                <p className="text-green-400 font-mono font-bold">
                  {formatCurrency(selectedDeposit.amount)}
                </p>
              </div>
              <div>
                <p className="text-muted mb-1">วิธีการฝาก:</p>
                <p className="text-app">{selectedDeposit.depositMethod}</p>
              </div>
              <div>
                <p className="text-muted mb-1">วันที่ฝาก:</p>
                <p className="text-app">{formatDate(selectedDeposit.depositDate)}</p>
              </div>
              {selectedDeposit.receiptNumber && (
                <div>
                  <p className="text-muted mb-1">เลขที่ใบเสร็จ:</p>
                  <p className="text-app">{selectedDeposit.receiptNumber}</p>
                </div>
              )}
              <div>
                <p className="text-muted mb-1">สถานะ:</p>
                <StatusTag variant={getStatusVariant(
                  selectedDeposit.status === "Completed" ? "อนุมัติแล้ว" :
                  selectedDeposit.status === "Cancelled" ? "ไม่อนุมัติ" : "รออนุมัติ"
                )}>
                  {selectedDeposit.status === "Completed" ? "เสร็จสิ้น" :
                   selectedDeposit.status === "Pending" ? "รอดำเนินการ" : "ยกเลิก"}
                </StatusTag>
              </div>
              <div>
                <p className="text-muted mb-1">ผู้บันทึก:</p>
                <p className="text-app">{selectedDeposit.recordedBy}</p>
              </div>
            </div>
            {selectedDeposit.notes && (
              <div className="p-3 bg-soft rounded-lg">
                <p className="text-sm text-muted mb-1">หมายเหตุ:</p>
                <p className="text-sm text-app">{selectedDeposit.notes}</p>
              </div>
            )}
          </div>
        )}
      </ModalForm>

      {/* Withdrawal Detail Modal */}
      <ModalForm
        isOpen={selectedWithdrawal !== null}
        onClose={() => setSelectedWithdrawal(null)}
        title={`รายละเอียดการถอน - ${selectedWithdrawal?.empName || ""}`}
      >
        {selectedWithdrawal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted mb-1">รหัสพนักงาน:</p>
                <p className="text-app font-medium">{selectedWithdrawal.empCode}</p>
              </div>
              <div>
                <p className="text-muted mb-1">จำนวนเงิน:</p>
                <p className="text-ptt-cyan font-mono font-bold">
                  {formatCurrency(selectedWithdrawal.amount)}
                </p>
              </div>
              <div>
                <p className="text-muted mb-1">เหตุผล:</p>
                <p className="text-app">{selectedWithdrawal.reason}</p>
              </div>
              <div>
                <p className="text-muted mb-1">วันที่ยื่นคำขอ:</p>
                <p className="text-app">{formatDate(selectedWithdrawal.withdrawalDate)}</p>
              </div>
              <div>
                <p className="text-muted mb-1">สถานะ:</p>
                <StatusTag variant={getStatusVariant(
                  selectedWithdrawal.status === "Approved" || selectedWithdrawal.status === "Completed" ? "อนุมัติแล้ว" :
                  selectedWithdrawal.status === "Rejected" ? "ไม่อนุมัติ" : "รออนุมัติ"
                )}>
                  {selectedWithdrawal.status}
                </StatusTag>
              </div>
              {selectedWithdrawal.approvedBy && (
                <div>
                  <p className="text-muted mb-1">ผู้อนุมัติ:</p>
                  <p className="text-app">{selectedWithdrawal.approvedBy}</p>
                </div>
              )}
            </div>

            {(selectedWithdrawal.hasOutstandingLoan || selectedWithdrawal.isGuarantor) && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">
                  {selectedWithdrawal.hasOutstandingLoan && "⚠️ มีหนี้ค้างชำระ"}
                  {selectedWithdrawal.hasOutstandingLoan && selectedWithdrawal.isGuarantor && " • "}
                  {selectedWithdrawal.isGuarantor && "⚠️ กำลังค้ำประกันผู้อื่น"}
                </p>
              </div>
            )}
          </div>
        )}
      </ModalForm>
    </div>
  );
}

