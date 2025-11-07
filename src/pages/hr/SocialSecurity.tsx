import { useState, useEffect } from "react";
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
  DollarSign
} from "lucide-react";
import FilterBar from "@/components/FilterBar";
import ModalForm from "@/components/ModalForm";
import { 
  socialSecurity, 
  socialSecurityContributions,
  type SocialSecurity as SocialSecurityType,
  type SocialSecurityContribution as ContributionType
} from "@/data/mockData";

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

export default function SocialSecurity() {
  const [filteredSSO, setFilteredSSO] = useState<SocialSecurityType[]>(socialSecurity);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<SocialSecurityType | null>(null);
  const [selectedContributions, setSelectedContributions] = useState<ContributionType[]>([]);
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);

  // Handle filtering
  const handleFilter = () => {
    let filtered = socialSecurity;

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

    setFilteredSSO(filtered);
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sectionFilter, statusFilter]);

  // Handle view employee contributions
  const handleViewContributions = (sso: SocialSecurityType) => {
    setSelectedEmployee(sso);
    const contributions = socialSecurityContributions.filter(
      (c) => c.empCode === sso.empCode
    );
    setSelectedContributions(contributions);
  };

  // Handle print document
  const handlePrintDocument = (docType: string) => {
    if (!selectedEmployee) return;
    
    const docNames: Record<string, string> = {
      sso1: "สปส.1-10 (ใบสำคัญแสดงการส่งเงินสมทบ)",
      sso2: "สปส.2-10 (ใบสำคัญแสดงการส่งเงินสมทบ)",
      sso3: "สปส.3-10 (ใบสำคัญแสดงการส่งเงินสมทบ)",
      sso4: "สปส.4-10 (ใบสำคัญแสดงการส่งเงินสมทบ)",
      sso5: "สปส.5-10 (ใบสำคัญแสดงการส่งเงินสมทบ)",
      sso6: "สปส.6-10 (ใบสำคัญแสดงการส่งเงินสมทบ)",
      sso7: "สปส.7-10 (ใบสำคัญแสดงการส่งเงินสมทบ)",
      sso8: "สปส.8-10 (ใบสำคัญแสดงการส่งเงินสมทบ)",
      sso9: "สปส.9-10 (ใบสำคัญแสดงการส่งเงินสมทบ)",
      sso10: "สปส.10-10 (ใบสำคัญแสดงการส่งเงินสมทบ)",
      registration: "ใบขึ้นทะเบียนประกันสังคม",
      statement: "ใบแจ้งยอดเงินสมทบ"
    };

    alert(`กำลังพิมพ์${docNames[docType] || docType} สำหรับ ${selectedEmployee.empName} (Mock)`);
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
            จัดการข้อมูลประกันสังคมของพนักงาน • แสดง {filteredSSO.length} จาก {socialSecurity.length} คน
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

      {/* Filter Bar */}
      <FilterBar
        placeholder="ค้นหาชื่อ รหัสพนักงาน หรือเลขประกันสังคม..."
        onSearch={(query) => {
          setSearchQuery(query);
          handleFilter();
        }}
        filters={[
          {
            label: "ทุกมาตรา",
            value: sectionFilter,
            options: [
              { label: "ทุกมาตรา", value: "" },
              { label: "มาตรา 33", value: "33" },
              { label: "มาตรา 39", value: "39" },
              { label: "มาตรา 40", value: "40" },
            ],
            onChange: (value) => {
              setSectionFilter(value);
              handleFilter();
            },
          },
          {
            label: "ทุกสถานะ",
            value: statusFilter,
            options: [
              { label: "ทุกสถานะ", value: "" },
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
              { label: "Suspended", value: "Suspended" },
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
            <div className="bg-ink-800 rounded-xl p-4 border border-app">
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
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    selectedEmployee.status === "Active" 
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
    </div>
  );
}

