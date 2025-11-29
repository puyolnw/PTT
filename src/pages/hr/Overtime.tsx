import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Timer, 
  AlertCircle, 
  Play, 
  Pause, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock,
  CheckCircle,
  XCircle,
  Send,
  FileText,
  Users,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { employees, shifts, attendanceLogs as initialAttendanceLogs, type AttendanceLog } from "@/data/mockData";

// ========== OT Request Types ==========
type OTRequestStatus = "pending_manager" | "pending_hr" | "pending_admin" | "approved" | "rejected" | "completed";
type OTRateType = "normal" | "special" | "seven_eleven_double"; // 1 เท่า, 1.5 เท่า, 7-Eleven ควงกะ

interface OTRequest {
  id: number;
  empCode: string;
  empName: string;
  category: string;
  date: string;
  requestedHours: number; // ชั่วโมงที่ขอทำ OT
  actualHours?: number; // ชั่วโมงที่ทำจริง (จากหน้างาน)
  rateType: OTRateType;
  baseSalary: number; // ฐานเงินเดือน
  otRate: number; // อัตรา OT ต่อชั่วโมง (คำนวณจากฐานเงินเดือน)
  otAmount: number; // เงิน OT
  reason: string; // เหตุผลการทำ OT
  requestedBy: string; // ผู้ยื่นเรื่อง (ผู้จัดการแผนก)
  requestedDate: string; // วันที่ยื่นเรื่อง
  status: OTRequestStatus;
  hrSentDate?: string; // วันที่ HR ส่งเรื่อง
  approvedBy?: string; // ผู้อนุมัติ (หัวหน้าสถานี)
  approvedDate?: string; // วันที่อนุมัติ
  rejectedReason?: string; // เหตุผลการปฏิเสธ
  fingerprintIn?: string; // เวลาสแกนนิ้วมือเข้า OT
  fingerprintOut?: string; // เวลาสแกนนิ้วมือออก OT
  managerConfirmedHours?: number; // ชั่วโมงที่ผู้จัดการยืนยันจากหน้างานจริง
}

// Mock data for OT Requests
const mockOTRequests: OTRequest[] = [
  {
    id: 1,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    category: "เซเว่น",
    date: "2025-11-15",
    requestedHours: 2,
    rateType: "seven_eleven_double",
    baseSalary: 18000,
    otRate: 35,
    otAmount: 70,
    reason: "คนขาดงาน ต้องทำ OT เพื่อให้งานเสร็จ",
    requestedBy: "หัวหน้าเซเว่น",
    requestedDate: "2025-11-14",
    status: "approved",
    hrSentDate: "2025-11-14",
    approvedBy: "หัวหน้าสถานี",
    approvedDate: "2025-11-14",
    fingerprintIn: "17:00",
    fingerprintOut: "19:30",
    managerConfirmedHours: 2.5
  },
  {
    id: 2,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    category: "ปั๊ม",
    date: "2025-11-16",
    requestedHours: 1,
    rateType: "normal",
    baseSalary: 30000,
    otRate: 35,
    otAmount: 35,
    reason: "งานล้นมือ ต้องทำ OT",
    requestedBy: "หัวหน้าปั๊ม",
    requestedDate: "2025-11-15",
    status: "pending_hr",
    hrSentDate: "2025-11-15"
  },
  {
    id: 3,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    category: "ปึงหงี่เชียง",
    date: "2025-11-17",
    requestedHours: 3,
    rateType: "special",
    baseSalary: 25000,
    otRate: 52.5, // 35 * 1.5
    otAmount: 157.5,
    reason: "งานสำคัญ ต้องทำทั้งวัน",
    requestedBy: "หัวหน้าร้าน",
    requestedDate: "2025-11-16",
    status: "pending_admin"
  }
];

// Helper function to calculate OT rate from base salary
const calculateOTRate = (baseSalary: number, rateType: OTRateType): number => {
  // คำนวณจากฐานเงินเดือน: ฐานเงินเดือน / 30 วัน / 8 ชั่วโมง = ต่อชั่วโมง
  const hourlyRate = baseSalary / 30 / 8;
  
  switch (rateType) {
    case "normal":
      return Math.round(hourlyRate * 10) / 10; // 1 เท่า
    case "special":
      return Math.round(hourlyRate * 1.5 * 10) / 10; // 1.5 เท่า
    case "seven_eleven_double":
      // 7-Eleven ควงกะ (ทำงานทั้งวัน) = 1.5 เท่า
      return Math.round(hourlyRate * 1.5 * 10) / 10;
    default:
      return Math.round(hourlyRate * 10) / 10;
  }
};

// Helper function to get base salary from employee
const getEmployeeBaseSalary = (empCode: string): number => {
  // ในระบบจริงจะดึงจากฐานข้อมูล
  // ตอนนี้ใช้ค่า mock
  const employee = employees.find(e => e.code === empCode);
  if (!employee) return 0;
  
  // Mock base salary (ฐานเงินเดือน)
  const mockBaseSalaries: Record<string, number> = {
    "EMP-0001": 30000,
    "EMP-0002": 25000,
    "EMP-0003": 22000,
    "EMP-0004": 18000,
    "EMP-0005": 25000,
    "EMP-0006": 19000,
    "EMP-0007": 20000,
    "EMP-0008": 25000,
    "EMP-0009": 18000,
    "EMP-0012": 17000,
    "EMP-0013": 23000,
    "EMP-0014": 24000,
    "EMP-0015": 19000,
    "EMP-0016": 20000,
    "EMP-0017": 20000,
    "EMP-0018": 19500,
    "EMP-0019": 24000,
    "EMP-0020": 22000,
    "EMP-0021": 21000,
    "EMP-0022": 21500,
    "EMP-0023": 28000,
    "EMP-0024": 27000,
    "EMP-0025": 17500,
    "EMP-0026": 25000,
    "EMP-0027": 26000,
    "EMP-0028": 24000,
    "EMP-0029": 20000,
    "EMP-0030": 21000,
    "EMP-0031": 18000,
    "EMP-0032": 22000,
  };
  
  return mockBaseSalaries[empCode] || 20000;
};

export default function Overtime() {
  const [otRequests, setOtRequests] = useState<OTRequest[]>(mockOTRequests);
  const [viewMode, setViewMode] = useState<"requests" | "approval" | "records">("requests");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OTRequest | null>(null);
  
  // Form states
  const [requestForm, setRequestForm] = useState({
    empCode: "",
    date: "",
    requestedHours: "",
    rateType: "normal" as OTRateType,
    reason: ""
  });
  
  const [recordForm, setRecordForm] = useState({
    requestId: "",
    fingerprintIn: "",
    fingerprintOut: "",
    managerConfirmedHours: ""
  });

  // Get all unique categories
  const categories = Array.from(new Set(employees.map(e => e.category).filter(Boolean)));

  // Filter OT requests
  const filteredRequests = useMemo(() => {
    let filtered = otRequests;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req => 
        req.empName.toLowerCase().includes(query) ||
        req.empCode.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(req => req.category === selectedCategory);
    }
    
    const [year, month] = selectedMonth.split('-').map(Number);
    filtered = filtered.filter(req => {
      const reqDate = new Date(req.date);
      return reqDate.getFullYear() === year && reqDate.getMonth() + 1 === month;
    });
    
    return filtered;
  }, [otRequests, searchQuery, selectedCategory, selectedMonth]);

  // Group requests by status
  const pendingManagerRequests = filteredRequests.filter(r => r.status === "pending_manager");
  const pendingHRRequests = filteredRequests.filter(r => r.status === "pending_hr");
  const pendingAdminRequests = filteredRequests.filter(r => r.status === "pending_admin");
  const approvedRequests = filteredRequests.filter(r => r.status === "approved");
  const completedRequests = filteredRequests.filter(r => r.status === "completed");

  // Handle create OT request (ผู้จัดการแผนกยื่นเรื่อง)
  const handleCreateRequest = () => {
    if (!requestForm.empCode || !requestForm.date || !requestForm.requestedHours || !requestForm.reason) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const employee = employees.find(e => e.code === requestForm.empCode);
    if (!employee) {
      alert("ไม่พบข้อมูลพนักงาน");
      return;
    }

    const baseSalary = getEmployeeBaseSalary(requestForm.empCode);
    const otRate = calculateOTRate(baseSalary, requestForm.rateType);
    const requestedHours = parseFloat(requestForm.requestedHours);
    const otAmount = requestedHours * otRate;

    const newRequest: OTRequest = {
      id: Math.max(...otRequests.map(r => r.id), 0) + 1,
      empCode: employee.code,
      empName: employee.name,
      category: employee.category || "",
      date: requestForm.date,
      requestedHours,
      rateType: requestForm.rateType,
      baseSalary,
      otRate,
      otAmount,
      reason: requestForm.reason,
      requestedBy: "ผู้จัดการแผนก", // ในระบบจริงจะดึงจาก session
      requestedDate: new Date().toISOString().split('T')[0],
      status: "pending_manager"
    };

    setOtRequests([...otRequests, newRequest]);
    setIsRequestModalOpen(false);
    setRequestForm({
      empCode: "",
      date: "",
      requestedHours: "",
      rateType: "normal",
      reason: ""
    });
    
    alert("ยื่นเรื่อง OT สำเร็จ! รอการพิจารณาจากผู้จัดการแผนก");
  };

  // Handle HR send request (HR ส่งเรื่อง)
  const handleHRSend = (requestId: number) => {
    const updated = otRequests.map(req => 
      req.id === requestId 
        ? { ...req, status: "pending_hr" as OTRequestStatus, hrSentDate: new Date().toISOString().split('T')[0] }
        : req
    );
    setOtRequests(updated);
    alert("ส่งเรื่องให้หัวหน้าสถานีแล้ว");
  };

  // Handle admin approve/reject (หัวหน้าสถานีอนุมัติ/ปฏิเสธ)
  const handleAdminApprove = (requestId: number) => {
    const updated = otRequests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: "approved" as OTRequestStatus, 
            approvedBy: "หัวหน้าสถานี",
            approvedDate: new Date().toISOString().split('T')[0]
          }
        : req
    );
    setOtRequests(updated);
    alert("อนุมัติ OT สำเร็จ");
  };

  const handleAdminReject = (requestId: number, reason: string) => {
    if (!reason.trim()) {
      alert("กรุณาระบุเหตุผลการปฏิเสธ");
      return;
    }
    
    const updated = otRequests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: "rejected" as OTRequestStatus,
            rejectedReason: reason,
            approvedBy: "หัวหน้าสถานี",
            approvedDate: new Date().toISOString().split('T')[0]
          }
        : req
    );
    setOtRequests(updated);
    alert("ปฏิเสธ OT แล้ว");
  };

  // Handle record OT (บันทึก OT จากหน้างานจริง)
  const handleRecordOT = () => {
    if (!recordForm.requestId || !recordForm.managerConfirmedHours) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const requestId = parseInt(recordForm.requestId);
    const request = otRequests.find(r => r.id === requestId);
    if (!request) {
      alert("ไม่พบข้อมูล OT Request");
      return;
    }

    const confirmedHours = parseFloat(recordForm.managerConfirmedHours);
    const actualAmount = confirmedHours * request.otRate;

    const updated = otRequests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            actualHours: confirmedHours,
            managerConfirmedHours: confirmedHours,
            fingerprintIn: recordForm.fingerprintIn || undefined,
            fingerprintOut: recordForm.fingerprintOut || undefined,
            status: "completed" as OTRequestStatus,
            otAmount: actualAmount
          }
        : req
    );
    setOtRequests(updated);
    setIsRecordModalOpen(false);
    setRecordForm({
      requestId: "",
      fingerprintIn: "",
      fingerprintOut: "",
      managerConfirmedHours: ""
    });
    
    alert(`บันทึก OT สำเร็จ! ${confirmedHours} ชั่วโมง = ${actualAmount.toFixed(2)} บาท`);
  };

  // Get status badge
  const getStatusBadge = (status: OTRequestStatus) => {
    const badges = {
      pending_manager: { text: "รอผู้จัดการพิจารณา", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      pending_hr: { text: "รอ HR ส่งเรื่อง", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      pending_admin: { text: "รอหัวหน้าสถานีอนุมัติ", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      approved: { text: "อนุมัติแล้ว", color: "bg-green-500/20 text-green-400 border-green-500/30" },
      rejected: { text: "ปฏิเสธ", color: "bg-red-500/20 text-red-400 border-red-500/30" },
      completed: { text: "ทำ OT เสร็จแล้ว", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" }
    };
    
    const badge = badges[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  // Get rate type label
  const getRateTypeLabel = (rateType: OTRateType) => {
    const labels = {
      normal: "1 เท่า (งานทั่วไป)",
      special: "1.5 เท่า (งานสำคัญ)",
      seven_eleven_double: "1.5 เท่า (7-Eleven ควงกะ)"
    };
    return labels[rateType];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-app mb-2 font-display">
            การทำ OT (Overtime)
          </h1>
          <p className="text-muted font-light">
            จัดการการทำ OT: ผู้จัดการยื่นเรื่อง → HR ส่งเรื่อง → หัวหน้าสถานีอนุมัติ → บันทึกผลจากหน้างาน
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("requests")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
              viewMode === "requests"
                ? "bg-ptt-cyan text-app"
                : "bg-soft hover:bg-soft/80 text-app border border-app"
            }`}
          >
            <FileText className="w-4 h-4" />
            ยื่นเรื่อง OT
          </button>
          <button
            onClick={() => setViewMode("approval")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
              viewMode === "approval"
                ? "bg-ptt-cyan text-app"
                : "bg-soft hover:bg-soft/80 text-app border border-app"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            อนุมัติ OT
          </button>
          <button
            onClick={() => setViewMode("records")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
              viewMode === "records"
                ? "bg-ptt-cyan text-app"
                : "bg-soft hover:bg-soft/80 text-app border border-app"
            }`}
          >
            <Clock className="w-4 h-4" />
            บันทึก OT
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-soft border border-app rounded-xl text-app placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ptt-blue"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
        >
          <option value="">ทุกแผนก</option>
          {categories.map(cat => (
            <option key={cat} value={cat || ""}>{cat}</option>
          ))}
        </select>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
        />
      </div>

      {/* View: Requests (ผู้จัดการยื่นเรื่อง) */}
      {viewMode === "requests" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="px-6 py-4 border-b border-app bg-soft flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-app font-display flex items-center gap-2">
                <FileText className="w-5 h-5 text-ptt-cyan" />
                รายการยื่นเรื่อง OT
              </h3>
              <p className="text-xs text-muted mt-1">
                ผู้จัดการแผนกยื่นเรื่องเปิด OT ให้พนักงาน
              </p>
            </div>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-ptt-cyan hover:bg-ptt-cyan/80 text-app rounded-xl transition-all duration-200 font-semibold"
            >
              <Plus className="w-4 h-4" />
              ยื่นเรื่อง OT
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-soft border-b-2 border-app">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-app">รหัส</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-app">ชื่อ-สกุล</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-app">แผนก</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-app">ชั่วโมง OT</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-app">ประเภท</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-app">อัตรา OT</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-app">เงิน OT</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-app">เหตุผล</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filteredRequests.map((req) => (
                  <motion.tr
                    key={req.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hover:bg-soft/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-app">{req.date}</td>
                    <td className="px-6 py-4 text-sm text-ptt-cyan font-medium">{req.empCode}</td>
                    <td className="px-6 py-4 text-sm text-app font-medium">{req.empName}</td>
                    <td className="px-6 py-4 text-sm text-app">{req.category}</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-app">{req.requestedHours} ชม.</td>
                    <td className="px-6 py-4 text-center text-xs text-app">{getRateTypeLabel(req.rateType)}</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-400">{req.otRate.toFixed(2)} บาท/ชม.</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-400">{req.otAmount.toFixed(2)} บาท</td>
                    <td className="px-6 py-4 text-sm text-muted max-w-xs truncate">{req.reason}</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(req.status)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* View: Approval (HR ส่งเรื่อง, หัวหน้าสถานีอนุมัติ) */}
      {viewMode === "approval" && (
        <div className="space-y-6">
          {/* Pending HR (รอ HR ส่งเรื่อง) */}
          {pendingHRRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="px-6 py-4 border-b border-app bg-blue-500/10">
                <h3 className="text-lg font-semibold text-app font-display flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-400" />
                  รอ HR ส่งเรื่อง ({pendingHRRequests.length} รายการ)
                </h3>
                <p className="text-xs text-muted mt-1">ผู้จัดการยื่นเรื่องแล้ว รอ HR ส่งเรื่องให้หัวหน้าสถานี</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-soft border-b border-app">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-app">พนักงาน</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">ชั่วโมง OT</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">เงิน OT</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-app">เหตุผล</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app">
                    {pendingHRRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-soft/50">
                        <td className="px-6 py-4 text-sm text-app">{req.date}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-app">{req.empName}</div>
                          <div className="text-xs text-ptt-cyan">{req.empCode}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-app">{req.requestedHours} ชม.</td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-green-400">{req.otAmount.toFixed(2)} บาท</td>
                        <td className="px-6 py-4 text-sm text-muted">{req.reason}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleHRSend(req.id)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            ส่งเรื่อง
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Pending Admin (รอหัวหน้าสถานีอนุมัติ) */}
          {pendingAdminRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="px-6 py-4 border-b border-app bg-purple-500/10">
                <h3 className="text-lg font-semibold text-app font-display flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                  รอหัวหน้าสถานีอนุมัติ ({pendingAdminRequests.length} รายการ)
                </h3>
                <p className="text-xs text-muted mt-1">HR ส่งเรื่องแล้ว รอหัวหน้าสถานีอนุมัติ</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-soft border-b border-app">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-app">พนักงาน</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">ชั่วโมง OT</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">เงิน OT</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-app">เหตุผล</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">การดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app">
                    {pendingAdminRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-soft/50">
                        <td className="px-6 py-4 text-sm text-app">{req.date}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-app">{req.empName}</div>
                          <div className="text-xs text-ptt-cyan">{req.empCode}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-app">{req.requestedHours} ชม.</td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-green-400">{req.otAmount.toFixed(2)} บาท</td>
                        <td className="px-6 py-4 text-sm text-muted">{req.reason}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleAdminApprove(req.id)}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              อนุมัติ
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("ระบุเหตุผลการปฏิเสธ:");
                                if (reason) handleAdminReject(req.id, reason);
                              }}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              ปฏิเสธ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Approved (อนุมัติแล้ว) */}
          {approvedRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="px-6 py-4 border-b border-app bg-green-500/10">
                <h3 className="text-lg font-semibold text-app font-display flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  อนุมัติแล้ว ({approvedRequests.length} รายการ)
                </h3>
                <p className="text-xs text-muted mt-1">รอการบันทึกผลจากหน้างาน</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-soft border-b border-app">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-app">พนักงาน</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">ชั่วโมง OT</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">เงิน OT</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app">
                    {approvedRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-soft/50">
                        <td className="px-6 py-4 text-sm text-app">{req.date}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-app">{req.empName}</div>
                          <div className="text-xs text-ptt-cyan">{req.empCode}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-app">{req.requestedHours} ชม.</td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-green-400">{req.otAmount.toFixed(2)} บาท</td>
                        <td className="px-6 py-4 text-center">{getStatusBadge(req.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* View: Records (บันทึก OT จากหน้างานจริง) */}
      {viewMode === "records" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="px-6 py-4 border-b border-app bg-soft flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-app font-display flex items-center gap-2">
                <Clock className="w-5 h-5 text-ptt-cyan" />
                บันทึก OT จากหน้างานจริง
              </h3>
              <p className="text-xs text-muted mt-1">
                บันทึกผลการทำ OT จากสแกนนิ้วมือและยืนยันจากผู้จัดการแผนก
              </p>
            </div>
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-ptt-cyan hover:bg-ptt-cyan/80 text-app rounded-xl transition-all duration-200 font-semibold"
            >
              <Plus className="w-4 h-4" />
              บันทึก OT
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-soft border-b-2 border-app">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-app">วันที่</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-app">พนักงาน</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-app">สแกนเข้า</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-app">สแกนออก</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-app">ชั่วโมงที่ยืนยัน</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-app">อัตรา OT</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-app">เงิน OT</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-app">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {completedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-soft/50">
                    <td className="px-6 py-4 text-sm text-app">{req.date}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-app">{req.empName}</div>
                      <div className="text-xs text-ptt-cyan">{req.empCode}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-mono text-app">{req.fingerprintIn || "-"}</td>
                    <td className="px-6 py-4 text-center text-sm font-mono text-app">{req.fingerprintOut || "-"}</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-app">{req.managerConfirmedHours || req.actualHours || 0} ชม.</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-400">{req.otRate.toFixed(2)} บาท/ชม.</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-400">{req.otAmount.toFixed(2)} บาท</td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(req.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-soft border border-app rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 px-6 py-4 border-b border-app bg-soft flex items-center justify-between">
              <h3 className="text-xl font-bold text-app font-display">ยื่นเรื่อง OT</h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-muted hover:text-app"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-app mb-2">เลือกพนักงาน *</label>
                <select
                  value={requestForm.empCode}
                  onChange={(e) => {
                    const emp = employees.find(emp => emp.code === e.target.value);
                    setRequestForm({ ...requestForm, empCode: e.target.value });
                  }}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                >
                  <option value="">เลือกพนักงาน</option>
                  {employees.filter(e => e.status === "Active").map(emp => (
                    <option key={emp.id} value={emp.code}>
                      {emp.code} - {emp.name} ({emp.category})
                    </option>
                  ))}
                </select>
              </div>
              {requestForm.empCode && (() => {
                const emp = employees.find(e => e.code === requestForm.empCode);
                const baseSalary = getEmployeeBaseSalary(requestForm.empCode);
                return (
                  <div className="p-3 bg-soft/50 rounded-lg border border-app">
                    <p className="text-xs text-muted">ฐานเงินเดือน: {baseSalary.toLocaleString()} บาท</p>
                    <p className="text-xs text-muted">อัตรา OT 1 เท่า: {calculateOTRate(baseSalary, "normal").toFixed(2)} บาท/ชม.</p>
                    <p className="text-xs text-muted">อัตรา OT 1.5 เท่า: {calculateOTRate(baseSalary, "special").toFixed(2)} บาท/ชม.</p>
                  </div>
                );
              })()}
              <div>
                <label className="block text-sm font-semibold text-app mb-2">วันที่ทำ OT *</label>
                <input
                  type="date"
                  value={requestForm.date}
                  onChange={(e) => setRequestForm({ ...requestForm, date: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-app mb-2">ชั่วโมง OT *</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={requestForm.requestedHours}
                  onChange={(e) => setRequestForm({ ...requestForm, requestedHours: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                  placeholder="1.0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-app mb-2">ประเภท OT *</label>
                <select
                  value={requestForm.rateType}
                  onChange={(e) => setRequestForm({ ...requestForm, rateType: e.target.value as OTRateType })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                >
                  <option value="normal">1 เท่า (งานทั่วไป)</option>
                  <option value="special">1.5 เท่า (งานสำคัญ)</option>
                  <option value="seven_eleven_double">1.5 เท่า (7-Eleven ควงกะ)</option>
                </select>
              </div>
              {requestForm.empCode && requestForm.requestedHours && (() => {
                const baseSalary = getEmployeeBaseSalary(requestForm.empCode);
                const otRate = calculateOTRate(baseSalary, requestForm.rateType);
                const hours = parseFloat(requestForm.requestedHours) || 0;
                const amount = hours * otRate;
                return (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-app">เงิน OT:</span>
                      <span className="text-xl font-bold text-green-400">{amount.toFixed(2)} บาท</span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {hours} ชม. × {otRate.toFixed(2)} บาท/ชม. ({getRateTypeLabel(requestForm.rateType)})
                    </p>
                  </div>
                );
              })()}
              <div>
                <label className="block text-sm font-semibold text-app mb-2">เหตุผล *</label>
                <textarea
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                  rows={3}
                  placeholder="ระบุเหตุผลการทำ OT..."
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 bg-soft border border-app rounded-lg text-app"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleCreateRequest}
                  className="px-6 py-2 bg-ptt-cyan hover:bg-ptt-cyan/80 text-app rounded-lg font-semibold"
                >
                  ยื่นเรื่อง
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Record Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-soft border border-app rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 px-6 py-4 border-b border-app bg-soft flex items-center justify-between">
              <h3 className="text-xl font-bold text-app font-display">บันทึก OT จากหน้างานจริง</h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-muted hover:text-app"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-app mb-2">เลือก OT Request *</label>
                <select
                  value={recordForm.requestId}
                  onChange={(e) => setRecordForm({ ...recordForm, requestId: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                >
                  <option value="">เลือก OT Request</option>
                  {approvedRequests.map(req => (
                    <option key={req.id} value={req.id.toString()}>
                      {req.date} - {req.empName} ({req.requestedHours} ชม.)
                    </option>
                  ))}
                </select>
              </div>
              {recordForm.requestId && (() => {
                const req = approvedRequests.find(r => r.id.toString() === recordForm.requestId);
                if (!req) return null;
                return (
                  <div className="p-3 bg-soft/50 rounded-lg border border-app">
                    <p className="text-sm font-medium text-app">{req.empName} ({req.empCode})</p>
                    <p className="text-xs text-muted">วันที่: {req.date}</p>
                    <p className="text-xs text-muted">OT ที่อนุมัติ: {req.requestedHours} ชม.</p>
                    <p className="text-xs text-muted">อัตรา OT: {req.otRate.toFixed(2)} บาท/ชม.</p>
                  </div>
                );
              })()}
              <div>
                <label className="block text-sm font-semibold text-app mb-2">เวลาสแกนนิ้วมือเข้า OT</label>
                <input
                  type="time"
                  value={recordForm.fingerprintIn}
                  onChange={(e) => setRecordForm({ ...recordForm, fingerprintIn: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-app mb-2">เวลาสแกนนิ้วมือออก OT</label>
                <input
                  type="time"
                  value={recordForm.fingerprintOut}
                  onChange={(e) => setRecordForm({ ...recordForm, fingerprintOut: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-app mb-2">ชั่วโมงที่ยืนยันจากผู้จัดการ *</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={recordForm.managerConfirmedHours}
                  onChange={(e) => setRecordForm({ ...recordForm, managerConfirmedHours: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                  placeholder="1.0"
                />
                <p className="text-xs text-muted mt-1">ผู้จัดการแผนกยืนยันชั่วโมง OT จากหน้างานจริง (1 ชั่วโมงขึ้นไป)</p>
              </div>
              {recordForm.requestId && recordForm.managerConfirmedHours && (() => {
                const req = approvedRequests.find(r => r.id.toString() === recordForm.requestId);
                if (!req) return null;
                const hours = parseFloat(recordForm.managerConfirmedHours) || 0;
                const amount = hours * req.otRate;
                return (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-app">เงิน OT ที่จะได้รับ:</span>
                      <span className="text-xl font-bold text-green-400">{amount.toFixed(2)} บาท</span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {hours} ชม. × {req.otRate.toFixed(2)} บาท/ชม.
                    </p>
                  </div>
                );
              })()}
              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 bg-soft border border-app rounded-lg text-app"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleRecordOT}
                  className="px-6 py-2 bg-ptt-cyan hover:bg-ptt-cyan/80 text-app rounded-lg font-semibold"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
