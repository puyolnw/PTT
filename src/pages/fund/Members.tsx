import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  PiggyBank, 
  TrendingUp,
  DollarSign
} from "lucide-react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { 
  fundMembers, 
  savingsDeductions,
  employees,
  type FundMember 
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

export default function Members() {
  const [filteredMembers, setFilteredMembers] = useState<FundMember[]>(fundMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FundMember | null>(null);
  const [formData, setFormData] = useState({
    empCode: "",
    monthlySavings: ""
  });

  // Handle filtering
  const handleFilter = () => {
    let filtered = fundMembers;

    if (searchQuery) {
      filtered = filtered.filter(
        (m) =>
          m.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.empCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    setFilteredMembers(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter]);

  // Calculate statistics
  const totalMembers = filteredMembers.length;
  const activeMembers = filteredMembers.filter((m) => m.status === "Active").length;
  const totalSavings = filteredMembers.reduce((sum, m) => sum + m.totalSavings, 0);
  const monthlySavingsTotal = filteredMembers.reduce((sum, m) => sum + m.monthlySavings, 0);

  // Handle add new member
  const handleAddMember = () => {
    if (!formData.empCode || !formData.monthlySavings) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const employee = employees.find(e => e.code === formData.empCode);
    if (!employee) {
      alert("ไม่พบพนักงานที่ระบุ");
      return;
    }

    // Check if already a member
    if (fundMembers.find(m => m.empCode === formData.empCode)) {
      alert("พนักงานนี้เป็นสมาชิกกองทุนอยู่แล้ว");
      return;
    }

    alert(`เพิ่มสมาชิก "${employee.name}" สำเร็จ! (Mock)`);
    setFormData({ empCode: "", monthlySavings: "" });
    setIsAddModalOpen(false);
  };

  // Get member savings history
  const getMemberSavingsHistory = (empCode: string) => {
    return savingsDeductions.filter(d => d.empCode === empCode);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            สมาชิกกองทุน
          </h1>
          <p className="text-muted font-light">
            จัดการสมาชิกกองทุนสัจจะออมทรัพย์ • แสดง {filteredMembers.length} จาก {fundMembers.length} คน
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ptt-blue hover:bg-ptt-blue/80 
                   text-app rounded-xl transition-all duration-200 font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <UserPlus className="w-5 h-5" />
          เพิ่มสมาชิก
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
            <div className="p-2 bg-ptt-cyan/20 rounded-lg">
              <Users className="w-5 h-5 text-ptt-cyan" />
            </div>
            <p className="text-muted text-sm font-light">สมาชิกทั้งหมด</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {totalMembers}
          </p>
          <p className="text-xs text-muted mt-1">
            {activeMembers} คน สถานะ Active
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
              <PiggyBank className="w-5 h-5 text-green-400" />
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
          transition={{ delay: 0.2 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-muted text-sm font-light">เงินสัจจะ/เดือน</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {formatCurrency(monthlySavingsTotal)}
          </p>
          <p className="text-xs text-muted mt-1">
            รวมทุกสมาชิก
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-soft border border-app rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-muted text-sm font-light">เฉลี่ยต่อคน</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {formatCurrency(totalMembers > 0 ? totalSavings / totalMembers : 0)}
          </p>
          <p className="text-xs text-muted mt-1">
            เงินสัจจะสะสมเฉลี่ย
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
            label: "ทุกสถานะ",
            value: statusFilter,
            options: [
              { label: "ทุกสถานะ", value: "" },
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
              { label: "Withdrawn", value: "Withdrawn" },
            ],
            onChange: (value) => {
              setStatusFilter(value);
              handleFilter();
            },
          },
        ]}
      />

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
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  ตำแหน่ง
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  วันที่สมัคร
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">
                  เงินสัจจะ/เดือน
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">
                  เงินสัจจะสะสม
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMembers.map((member, index) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-soft transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">
                    {member.empCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-app font-medium">
                    {member.empName}
                  </td>
                  <td className="px-6 py-4 text-sm text-app font-light">
                    {member.position}
                  </td>
                  <td className="px-6 py-4 text-sm text-app font-light">
                    {formatDate(member.joinDate)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-app font-mono">
                    {formatCurrency(member.monthlySavings)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-ptt-cyan font-bold font-mono">
                    {formatCurrency(member.totalSavings)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusTag variant={getStatusVariant(
                      member.status === "Active" ? "Active" :
                      member.status === "Inactive" ? "Leave" : "Resigned"
                    )}>
                      {member.status === "Active" ? "Active" :
                       member.status === "Inactive" ? "Inactive" : "Withdrawn"}
                    </StatusTag>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                               bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                               transition-colors font-medium"
                    >
                      <PiggyBank className="w-4 h-4" />
                      ดูรายละเอียด
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted font-light">ไม่พบข้อมูลสมาชิก</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Member Modal */}
      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormData({ empCode: "", monthlySavings: "" });
        }}
        title="เพิ่มสมาชิกกองทุน"
        onSubmit={handleAddMember}
        submitLabel="บันทึก"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-2">
              รหัสพนักงาน <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.empCode}
              onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
              className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                       text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
            >
              <option value="">เลือกพนักงาน</option>
              {employees
                .filter(e => !fundMembers.find(m => m.empCode === e.code))
                .map((emp) => (
                  <option key={emp.code} value={emp.code}>
                    {emp.code} - {emp.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-app mb-2">
              เงินสัจจะต่อเดือน (บาท) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={formData.monthlySavings}
              onChange={(e) => setFormData({ ...formData, monthlySavings: e.target.value })}
              min="100"
              step="100"
              className="w-full px-4 py-2.5 bg-ink-800 border border-app rounded-xl
                       text-app placeholder:text-muted
                       focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              placeholder="เช่น 300, 500"
            />
            <p className="text-xs text-muted mt-1">
              ขั้นต่ำ 100-300 บาท/เดือน (ตามระดับตำแหน่ง)
            </p>
          </div>

          <div className="p-3 bg-ptt-blue/10 border border-ptt-blue/30 rounded-lg">
            <p className="text-xs text-ptt-cyan">
              💡 เงินสัจจะจะถูกหักอัตโนมัติจากเงินเดือนทุกเดือน
            </p>
          </div>
        </div>
      </ModalForm>

      {/* Member Detail Modal */}
      <ModalForm
        isOpen={selectedMember !== null}
        onClose={() => setSelectedMember(null)}
        title={`รายละเอียดสมาชิก - ${selectedMember?.empName || ""}`}
        size="lg"
      >
        {selectedMember && (
          <div className="space-y-6">
            {/* Member Info */}
            <div className="bg-ink-800 rounded-xl p-4 border border-app">
              <h3 className="text-lg font-semibold text-app mb-4 font-display">
                ข้อมูลสมาชิก
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted mb-1">รหัสพนักงาน:</p>
                  <p className="text-app font-medium">{selectedMember.empCode}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">ตำแหน่ง:</p>
                  <p className="text-app">{selectedMember.position}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">วันที่สมัคร:</p>
                  <p className="text-app">{formatDate(selectedMember.joinDate)}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">สถานะ:</p>
                  <StatusTag variant={getStatusVariant(
                    selectedMember.status === "Active" ? "Active" :
                    selectedMember.status === "Inactive" ? "Leave" : "Resigned"
                  )}>
                    {selectedMember.status}
                  </StatusTag>
                </div>
                <div>
                  <p className="text-muted mb-1">เงินสัจจะ/เดือน:</p>
                  <p className="text-app font-mono font-semibold">
                    {formatCurrency(selectedMember.monthlySavings)}
                  </p>
                </div>
                <div>
                  <p className="text-muted mb-1">เงินสัจจะสะสม:</p>
                  <p className="text-ptt-cyan font-mono font-bold text-lg">
                    {formatCurrency(selectedMember.totalSavings)}
                  </p>
                </div>
              </div>
            </div>

            {/* Savings History */}
            <div>
              <h3 className="text-lg font-semibold text-app mb-4 font-display">
                ประวัติการหักเงินสัจจะ
              </h3>
              <div className="space-y-3">
                {getMemberSavingsHistory(selectedMember.empCode).length > 0 ? (
                  getMemberSavingsHistory(selectedMember.empCode).map((deduction) => (
                    <div
                      key={deduction.id}
                      className="flex items-center justify-between p-4 bg-soft rounded-xl border-app"
                    >
                      <div>
                        <p className="font-medium text-app">
                          {new Date(deduction.month + "-01").toLocaleDateString("th-TH", {
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                        <p className="text-sm text-muted">
                          หักเมื่อ {formatDate(deduction.deductionDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-app font-semibold font-mono">
                          {formatCurrency(deduction.amount)}
                        </p>
                        {deduction.status === "Deducted" ? (
                          <span className="inline-flex items-center mt-2 px-2 py-1 rounded text-xs font-medium
                                         bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            หักแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center mt-2 px-2 py-1 rounded text-xs font-medium
                                         bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                            รอหัก
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted">
                    ยังไม่มีประวัติการหักเงินสัจจะ
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </ModalForm>
    </div>
  );
}

