import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  FileText,
  Printer,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Plus
} from "lucide-react";
import ModalForm from "@/components/ModalForm";
import {
  socialSecurity as initialSocialSecurity,
  socialSecurityContributions,
  employees as initialEmployees,
  shifts,
  type SocialSecurity as SocialSecurityType,
  type SocialSecurityContribution as ContributionType
} from "@/data/mockData";
import { useBranch } from "@/contexts/BranchContext";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

type NewRecord = {
  empCode: string;
  empName: string;
  ssoNumber: string;
  registrationDate: string;
  section: SocialSecurityType["section"];
  status: SocialSecurityType["status"];
  salaryBase: number;
  employeeContribution: number;
  employerContribution: number;
};

const initialNewRecord: NewRecord = {
  empCode: "",
  empName: "",
  ssoNumber: "",
  registrationDate: "",
  section: "33",
  status: "Active",
  salaryBase: 0,
  employeeContribution: 0,
  employerContribution: 0,
};

export default function SocialSecurity() {
  const { selectedBranches } = useBranch();

  // Filter core data based on branch
  const employees = useMemo(() =>
    initialEmployees.filter(emp => selectedBranches.includes(String(emp.branchId))),
    [selectedBranches]
  );

  const empCodes = useMemo(() => new Set(employees.map(e => e.code)), [employees]);

  const currentBranchSSO = useMemo(() =>
    initialSocialSecurity.filter(sso => empCodes.has(sso.empCode)),
    [empCodes]
  );

  const [records, setRecords] = useState<SocialSecurityType[]>(currentBranchSSO);

  // Sync records when branch changes
  useEffect(() => {
    setRecords(currentBranchSSO);
  }, [currentBranchSSO]);

  const [filteredSSO, setFilteredSSO] = useState<SocialSecurityType[]>(records);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState<number | "">("");
  const [selectedEmployee, setSelectedEmployee] = useState<SocialSecurityType | null>(null);
  const [selectedContributions, setSelectedContributions] = useState<ContributionType[]>([]);
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<NewRecord>(initialNewRecord);

  // Get employee info by code
  const getEmployeeInfo = useCallback((empCode: string) => {
    return employees.find(emp => emp.code === empCode);
  }, [employees]);

  useEffect(() => {
    let filtered = records;

    if (searchQuery) {
      filtered = filtered.filter(
        (sso) =>
          sso.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sso.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sso.ssoNumber.includes(searchQuery)
      );
    }

    if (sectionFilter) {
      filtered = filtered.filter((sso) => sso.section === sectionFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((sso) => sso.status === statusFilter);
    }

    if (deptFilter) {
      filtered = filtered.filter((sso) => {
        const empInfo = getEmployeeInfo(sso.empCode);
        return empInfo?.dept === deptFilter;
      });
    }

    if (shiftFilter !== "") {
      filtered = filtered.filter((sso) => {
        const empInfo = getEmployeeInfo(sso.empCode);
        return empInfo?.shiftId === shiftFilter;
      });
    }

    setFilteredSSO(filtered);
  }, [records, searchQuery, sectionFilter, statusFilter, deptFilter, shiftFilter, getEmployeeInfo]);

  // Handle view employee contributions
  const handleViewContributions = (sso: SocialSecurityType) => {
    setSelectedEmployee(sso);
    const contributions = socialSecurityContributions.filter(
      (c) => c.empCode === sso.empCode
    );
    setSelectedContributions(contributions);
  };

  const handleNewRecordChange = (field: keyof NewRecord, value: string) => {
    setNewRecord((prev) => ({
      ...prev,
      [field]:
        field === "salaryBase" ||
          field === "employeeContribution" ||
          field === "employerContribution"
          ? Number(value) || 0
          : value,
    }));
  };

  const handleSubmitNewRecord = () => {
    if (!newRecord.empCode || !newRecord.empName || !newRecord.ssoNumber) {
      alert("กรุณากรอกรหัสพนักงาน ชื่อ และเลขประกันสังคมให้ครบถ้วน");
      return;
    }

    const totalContribution = newRecord.employeeContribution + newRecord.employerContribution;

    const entry: SocialSecurityType = {
      id: Date.now(),
      empCode: newRecord.empCode,
      empName: newRecord.empName,
      ssoNumber: newRecord.ssoNumber,
      registrationDate: newRecord.registrationDate || new Date().toISOString().split("T")[0],
      section: newRecord.section,
      status: newRecord.status,
      salaryBase: newRecord.salaryBase,
      employeeContribution: newRecord.employeeContribution,
      employerContribution: newRecord.employerContribution,
      totalContribution,
    };

    setRecords((prev) => [entry, ...prev]);
    setIsAddModalOpen(false);
    setNewRecord(initialNewRecord);
  };

  // Handle print document
  const handlePrintDocument = (docType: string) => {
    if (!selectedEmployee) return;

    const docNames = new Map([
      ["sso1", "สปส.1-10 (ใบสำคัญแสดงการส่งเงินสมทบ)"],
      ["sso2", "สปส.2-10 (ใบสำคัญแสดงการส่งเงินสมทบ)"],
      ["sso3", "สปส.3-10 (ใบสำคัญแสดงการส่งเงินสมทบ)"],
      ["sso4", "สปส.4-10 (ใบสำคัญแสดงการส่งเงินสมทบ)"],
      ["sso5", "สปส.5-10 (ใบสำคัญแสดงการส่งเงินสมทบ)"],
      ["sso6", "สปส.6-10 (ใบสำคัญแสดงการส่งเงินสมทบ)"],
      ["sso7", "สปส.7-10 (ใบสำคัญแสดงการส่งเงินสมทบ)"],
      ["sso8", "สปส.8-10 (ใบสำคัญแสดงการส่งเงินสมทบ)"],
      ["sso9", "สปส.9-10 (ใบสำคัญแสดงการส่งเงินสมทบ)"],
      ["sso10", "สปส.10-10 (ใบสำคัญแสดงการส่งเงินสมทบ)"],
      ["registration", "ใบขึ้นทะเบียนประกันสังคม"],
      ["statement", "ใบแจ้งยอดเงินสมทบ"]
    ]);

    alert(`กำลังพิมพ์${docNames.get(docType) || docType} สำหรับ ${selectedEmployee.empName} (Mock)`);
    setIsPrintMenuOpen(false);
  };

  // Calculate statistics
  const totalEmployees = filteredSSO.length;
  const activeEmployees = filteredSSO.filter((sso) => sso.status === "Active").length;
  const section33Count = filteredSSO.filter((sso) => sso.section === "33").length;
  const section39Count = filteredSSO.filter((sso) => sso.section === "39").length;
  const totalMonthlyContribution = filteredSSO.reduce(
    (sum, sso) => sum + sso.totalContribution,
    0
  );
  const totalEmployeeContribution = filteredSSO.reduce(
    (sum, sso) => sum + sso.employeeContribution,
    0
  );
  const totalEmployerContribution = filteredSSO.reduce(
    (sum, sso) => sum + sso.employerContribution,
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            ประกันสังคม
          </h1>
          <p className="text-muted font-light">
            บันทึกสถานะการยื่นประกันสังคมจากระบบภายนอก • แสดง {filteredSSO.length} จาก {records.length} คน
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-500/80
                       text-white rounded-xl transition-all duration-200 font-semibold 
                       shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            เพิ่มข้อมูลประกันสังคม
          </button>
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
              <div className="absolute right-0 mt-2 w-72 bg-ink-800 border border-app rounded-xl shadow-xl z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-muted font-semibold mb-1">เอกสารประกันสังคม</div>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => handlePrintDocument(`sso${num}`)}
                      className="w-full text-left px-3 py-2 text-sm text-app hover:bg-ink-700 rounded-lg transition-colors"
                    >
                      สปส.{num}-10
                    </button>
                  ))}
                  <div className="px-3 py-2 text-xs text-muted font-semibold mt-2 mb-1">เอกสารอื่นๆ</div>
                  <button
                    onClick={() => handlePrintDocument("registration")}
                    className="w-full text-left px-3 py-2 text-sm text-app hover:bg-ink-700 rounded-lg transition-colors"
                  >
                    ใบขึ้นทะเบียนประกันสังคม
                  </button>
                  <button
                    onClick={() => handlePrintDocument("statement")}
                    className="w-full text-left px-3 py-2 text-sm text-app hover:bg-ink-700 rounded-lg transition-colors"
                  >
                    ใบแจ้งยอดเงินสมทบ
                  </button>
                </div>
              </div>
            )}
          </div>
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
              <Users className="w-5 h-5 text-ptt-cyan" />
            </div>
            <p className="text-muted text-sm font-light">พนักงานทั้งหมด</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {totalEmployees}
          </p>
          <p className="text-xs text-muted mt-1">
            {activeEmployees} คน สถานะ Active
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
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-muted text-sm font-light">เงินสมทบรวม/เดือน</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {formatCurrency(totalMonthlyContribution)}
          </p>
          <p className="text-xs text-muted mt-1">
            ลูกจ้าง: {formatCurrency(totalEmployeeContribution)} • นายจ้าง: {formatCurrency(totalEmployerContribution)}
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
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-muted text-sm font-light">มาตรา 33</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {section33Count}
          </p>
          <p className="text-xs text-muted mt-1">
            ลูกจ้างในสถานประกอบการ
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
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-muted text-sm font-light">มาตรา 39</p>
          </div>
          <p className="text-3xl font-bold text-app font-display">
            {section39Count}
          </p>
          <p className="text-xs text-muted mt-1">
            รักษาสิทธิ์ต่อเนื่อง
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
                รายการประกันสังคม
              </h3>
              <p className="text-xs text-muted mt-1">
                แสดง {filteredSSO.length} รายการ
              </p>
            </div>
          </div>

          {/* Filter Bar - Inline with table */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <label htmlFor="sso-search" className="sr-only">ค้นหาพนักงาน</label>
              <input
                id="sso-search"
                type="text"
                placeholder="ค้นหาชื่อ รหัสพนักงาน หรือเลขประกันสังคม..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <div className="flex flex-col">
                <label htmlFor="sso-dept-filter" className="sr-only">กรองตามแผนก</label>
                <select
                  id="sso-dept-filter"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-4 py-2.5 bg-soft border border-app rounded-xl
                           text-app text-sm min-w-[150px]
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                           transition-all cursor-pointer hover:border-app/50"
                >
                  <option value="">ทุกแผนก</option>
                  {Array.from(new Set(employees.map(e => e.dept))).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="sso-shift-filter" className="sr-only">กรองตามกะ</label>
                <select
                  id="sso-shift-filter"
                  value={shiftFilter === "" ? "" : String(shiftFilter)}
                  onChange={(e) => setShiftFilter(e.target.value === "" ? "" : Number(e.target.value))}
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
              </div>

              <div className="flex flex-col">
                <label htmlFor="sso-section-filter" className="sr-only">กรองตามมาตรา</label>
                <select
                  id="sso-section-filter"
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="px-4 py-2.5 bg-soft border border-app rounded-xl
                           text-app text-sm min-w-[150px]
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                           transition-all cursor-pointer hover:border-app/50"
                >
                  <option value="">ทุกมาตรา</option>
                  <option value="33">มาตรา 33</option>
                  <option value="39">มาตรา 39</option>
                  <option value="40">มาตรา 40</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="sso-status-filter" className="sr-only">กรองตามสถานะ</label>
                <select
                  id="sso-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-soft border border-app rounded-xl
                           text-app text-sm min-w-[150px]
                           focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                           transition-all cursor-pointer hover:border-app/50"
                >
                  <option value="">ทุกสถานะ</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
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
                  เลขประกันสังคม
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-app">
                  มาตรา
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-app">
                  วันที่ขึ้นทะเบียน
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">
                  ฐานเงินเดือน
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-app">
                  เงินสมทบ/เดือน
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
              {filteredSSO.map((item, index) => (
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
                  <td className="px-6 py-4 text-sm text-app font-mono">
                    {item.ssoNumber}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium
                                     bg-ptt-blue/20 text-ptt-cyan border border-ptt-blue/30">
                      มาตรา {item.section}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-app font-light">
                    {formatDate(item.registrationDate)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-app font-mono">
                    {item.salaryBase > 0 ? formatCurrency(item.salaryBase) : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm">
                      <div className="text-app font-mono">
                        {formatCurrency(item.totalContribution)}
                      </div>
                      <div className="text-xs text-muted">
                        ลูกจ้าง: {formatCurrency(item.employeeContribution)} • นายจ้าง: {formatCurrency(item.employerContribution)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.status === "Active" ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium
                                       bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    ) : item.status === "Inactive" ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium
                                       bg-gray-500/10 text-gray-400 border border-gray-500/30">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium
                                       bg-red-500/10 text-red-400 border border-red-500/30">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewContributions(item)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm 
                                   bg-ptt-blue/20 hover:bg-ptt-blue/30 text-ptt-cyan rounded-lg
                                   transition-colors font-medium"
                      >
                        <FileText className="w-4 h-4" />
                        ดูประวัติ
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredSSO.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted font-light">ไม่พบข้อมูลประกันสังคม</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Contribution History Modal */}
      <ModalForm
        isOpen={selectedEmployee !== null}
        onClose={() => {
          setSelectedEmployee(null);
          setSelectedContributions([]);
        }}
        title={`ประวัติการจ่ายเงินสมทบ - ${selectedEmployee?.empName || ""}`}
        size="lg"
      >
        {selectedEmployee && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="bg-soft rounded-xl p-4 border border-app">
              <h3 className="text-lg font-semibold text-app mb-4 font-display">
                ข้อมูลประกันสังคม
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted mb-1">เลขประกันสังคม:</p>
                  <p className="text-app font-mono">{selectedEmployee.ssoNumber}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">มาตรา:</p>
                  <p className="text-app">มาตรา {selectedEmployee.section}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">วันที่ขึ้นทะเบียน:</p>
                  <p className="text-app">{formatDate(selectedEmployee.registrationDate)}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">สถานะ:</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${selectedEmployee.status === "Active"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : selectedEmployee.status === "Inactive"
                      ? "bg-gray-500/10 text-gray-400 border border-gray-500/30"
                      : "bg-red-500/10 text-red-400 border border-red-500/30"
                    }`}>
                    {selectedEmployee.status}
                  </span>
                </div>
                {selectedEmployee.salaryBase > 0 && (
                  <div>
                    <p className="text-muted mb-1">ฐานเงินเดือน:</p>
                    <p className="text-app font-mono">{formatCurrency(selectedEmployee.salaryBase)}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted mb-1">เงินสมทบ/เดือน:</p>
                  <p className="text-app font-mono">{formatCurrency(selectedEmployee.totalContribution)}</p>
                </div>
              </div>
            </div>

            {/* Contribution History */}
            <div>
              <h3 className="text-lg font-semibold text-app mb-4 font-display">
                ประวัติการจ่ายเงินสมทบ
              </h3>
              <div className="space-y-3">
                {selectedContributions.length > 0 ? (
                  selectedContributions.map((contribution) => (
                    <div
                      key={contribution.id}
                      className="flex items-center justify-between p-4 bg-soft rounded-xl border-app"
                    >
                      <div>
                        <p className="font-medium text-app">
                          {formatMonthLabel(contribution.month)}
                        </p>
                        <p className="text-sm text-muted">
                          จ่ายเมื่อ {formatDate(contribution.paymentDate)}
                        </p>
                        {contribution.salaryBase > 0 && (
                          <p className="text-xs text-muted mt-1">
                            ฐานเงินเดือน: {formatCurrency(contribution.salaryBase)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-app font-semibold font-mono">
                          {formatCurrency(contribution.totalContribution)}
                        </p>
                        <p className="text-xs text-muted">
                          ลูกจ้าง: {formatCurrency(contribution.employeeContribution)} •
                          นายจ้าง: {formatCurrency(contribution.employerContribution)}
                        </p>
                        {contribution.status === "Paid" ? (
                          <span className="inline-flex items-center mt-2 px-2 py-1 rounded text-xs font-medium
                                         bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            จ่ายแล้ว
                          </span>
                        ) : contribution.status === "Pending" ? (
                          <span className="inline-flex items-center mt-2 px-2 py-1 rounded text-xs font-medium
                                         bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                            <Clock className="w-3 h-3 mr-1" />
                            รอจ่าย
                          </span>
                        ) : (
                          <span className="inline-flex items-center mt-2 px-2 py-1 rounded text-xs font-medium
                                         bg-red-500/10 text-red-400 border border-red-500/30">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            เกินกำหนด
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted">
                    ยังไม่มีประวัติการจ่ายเงินสมทบ
                  </div>
                )}
              </div>
            </div>

            {/* Benefits Info */}
            <div className="bg-ptt-blue/10 border border-ptt-blue/30 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-app mb-3 font-display">
                สิทธิประโยชน์ประกันสังคม
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-app font-medium">กรณีเจ็บป่วย</p>
                    <p className="text-muted text-xs">รักษาพยาบาลฟรีที่สถานพยาบาลตามสิทธิ์</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-app font-medium">กรณีคลอดบุตร</p>
                    <p className="text-muted text-xs">เงินสงเคราะห์การคลอดบุตร</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-app font-medium">กรณีทุพพลภาพ</p>
                    <p className="text-muted text-xs">เงินทดแทนการขาดรายได้</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-app font-medium">กรณีเสียชีวิต</p>
                    <p className="text-muted text-xs">เงินค่าทำศพและเงินสงเคราะห์</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-app font-medium">กรณีชราภาพ</p>
                    <p className="text-muted text-xs">เงินบำเหน็จหรือบำนาญชราภาพ</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-app font-medium">กรณีสงเคราะห์บุตร</p>
                    <p className="text-muted text-xs">เงินสงเคราะห์บุตร</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-app font-medium">กรณีว่างงาน</p>
                    <p className="text-muted text-xs">เงินทดแทนการขาดรายได้</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalForm>

      <ModalForm
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewRecord(initialNewRecord);
        }}
        title="เพิ่มข้อมูลประกันสังคม"
        onSubmit={handleSubmitNewRecord}
        submitLabel="บันทึกข้อมูล"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="add-sso-emp-code" className="block text-sm font-semibold text-app mb-1.5">
                รหัสพนักงาน <span className="text-red-400">*</span>
              </label>
              <input
                id="add-sso-emp-code"
                type="text"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
                value={newRecord.empCode}
                onChange={(event) => handleNewRecordChange("empCode", event.target.value)}
                placeholder="เช่น EMP-0101"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="add-sso-emp-name" className="block text-sm font-semibold text-app mb-1.5">
                ชื่อ-นามสกุล <span className="text-red-400">*</span>
              </label>
              <input
                id="add-sso-emp-name"
                type="text"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
                value={newRecord.empName}
                onChange={(event) => handleNewRecordChange("empName", event.target.value)}
                placeholder="ระบุชื่อให้ตรงกับระบบหลัก"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="add-sso-number" className="block text-sm font-semibold text-app mb-1.5">
                เลขประกันสังคม <span className="text-red-400">*</span>
              </label>
              <input
                id="add-sso-number"
                type="text"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
                value={newRecord.ssoNumber}
                onChange={(event) => handleNewRecordChange("ssoNumber", event.target.value)}
                placeholder="13 หลัก"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="add-sso-reg-date" className="block text-sm font-semibold text-app mb-1.5">
                วันที่ขึ้นทะเบียน
              </label>
              <input
                id="add-sso-reg-date"
                type="date"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50 cursor-pointer"
                value={newRecord.registrationDate}
                onChange={(event) => handleNewRecordChange("registrationDate", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="add-sso-section" className="block text-sm font-semibold text-app mb-1.5">
                มาตรา <span className="text-red-400">*</span>
              </label>
              <select
                id="add-sso-section"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50 cursor-pointer"
                value={newRecord.section}
                onChange={(event) => handleNewRecordChange("section", event.target.value)}
              >
                <option value="33">มาตรา 33 (ลูกจ้างในสถานประกอบการ)</option>
                <option value="39">มาตรา 39 (ส่งต่อสิทธิ์ด้วยตนเอง)</option>
                <option value="40">มาตรา 40 (อาชีพอิสระ)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="add-sso-status" className="block text-sm font-semibold text-app mb-1.5">
                สถานะการยื่น <span className="text-red-400">*</span>
              </label>
              <select
                id="add-sso-status"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50 cursor-pointer"
                value={newRecord.status}
                onChange={(event) => handleNewRecordChange("status", event.target.value)}
              >
                <option value="Active">Active (ยื่นและใช้งานอยู่)</option>
                <option value="Inactive">Inactive (ยกเลิกชั่วคราว)</option>
                <option value="Suspended">Suspended (ยังไม่ยื่น/ระงับ)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="add-sso-salary-base" className="block text-sm font-semibold text-app mb-1.5">
                ฐานเงินเดือน (บาท)
              </label>
              <input
                id="add-sso-salary-base"
                type="number"
                min="0"
                step="100"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
                value={newRecord.salaryBase}
                onChange={(event) => handleNewRecordChange("salaryBase", event.target.value)}
                placeholder="ใส่ 0 สำหรับมาตรา 39 หรือ 40"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="add-sso-emp-contrib" className="block text-sm font-semibold text-app mb-1.5">
                เงินสมทบฝ่ายลูกจ้าง
              </label>
              <input
                id="add-sso-emp-contrib"
                type="number"
                min="0"
                step="10"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
                value={newRecord.employeeContribution}
                onChange={(event) => handleNewRecordChange("employeeContribution", event.target.value)}
                placeholder="เช่น 750 หรือ 432"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="add-sso-employer-contrib" className="block text-sm font-semibold text-app mb-1.5">
                เงินสมทบฝั่งนายจ้าง
              </label>
              <input
                id="add-sso-employer-contrib"
                type="number"
                min="0"
                step="10"
                className="w-full px-4 py-3 bg-soft border border-app rounded-xl
                         text-app placeholder:text-muted
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-ptt-blue/50
                         transition-all duration-200 hover:border-app/50"
                value={newRecord.employerContribution}
                onChange={(event) => handleNewRecordChange("employerContribution", event.target.value)}
                placeholder="ใส่ 0 หากไม่มี"
              />
            </div>
          </div>

          {/* Info Card */}
          <div className="p-4 bg-gradient-to-r from-ptt-blue/10 via-ptt-cyan/10 to-ptt-blue/10 
                        border border-ptt-blue/30 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-ptt-blue/20 rounded-lg">
                <svg className="w-5 h-5 text-ptt-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-app mb-1">ข้อมูลสำคัญ</p>
                <p className="text-xs text-muted leading-relaxed">
                  หลังจากบันทึกแล้ว ระบบจะคำนวณยอดรวมเงินสมทบให้อัตโนมัติและเพิ่มในตารางประวัติ • ข้อมูลที่ทำเครื่องหมาย <span className="text-red-400">*</span> เป็นข้อมูลที่จำเป็นต้องกรอก
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}

