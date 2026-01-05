import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Trophy,
  Medal,
  Download,
  FileText,
  Plus,
  Save,
  X,
  DollarSign,
  Fuel,
  Package,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar,
} from "lucide-react";
import { employees, attendanceLogs, leaves } from "@/data/mockData";

// ========== Types ==========
type RewardType = "เบี้ยขยัน" | "รางวัล Audit" | "ค่าเรทน้ำมัน";
type EligibleDept = "เซเว่น" | "OTOP" | "หน้าลาน" | "Amazon";

interface RewardRecord {
  id: number;
  empCode: string;
  empName: string;
  dept: string;
  category: string;
  rewardType: RewardType;
  month: string; // YYYY-MM
  amount: number;
  details: string;
  calculatedBy?: string; // "system" | "manual"
  auditCategory?: "7-Eleven" | "Amazon" | "OTOP" | "PTT";
  auditScore?: number;
  auditRemarks?: string;
  paidDate?: string;
  paidBy?: string;
  notes?: string;
  // สำหรับรางวัล PTT
  pttScore?: number; // 98-99 หรือ 100
  pttAttempt?: number; // ครั้งที่ 1, 2, 3
  hasComplaint1365?: boolean; // ไม่มีข้อร้องเรียนจาก 1365
  // สำหรับรางวัล Amazon
  amazonAttempt?: number; // ครั้งที่ 1, 2, 3 หรือมากกว่า
  // สำหรับรางวัล 7-Eleven
  salesIncreasePercent?: number; // % เพิ่มขึ้นของยอดขาย
  sevenRewardType?: "cutting" | "sales_bonus"; // ประเภทรางวัล: ตัดจ่าย หรือ รางวัลเพิ่มจากยอดขาย
  // สำหรับผลการประเมินอื่นๆ
  qssiScore?: number; // QSSI = 100 คะแนน
  serviceScore?: number; // หมวดบริการ = 100 คะแนน
  hasComplaint?: boolean; // ไม่มีข้อร้องเรียน
}

interface DiligenceBonusHistory {
  empCode: string;
  month: string;
  consecutiveMonths: number; // เดือนติดต่อกันที่ได้รับ
  amount: number;
  status: "eligible" | "reduced" | "disqualified"; // eligible = ได้ตามปกติ, reduced = ลดจาก 500→300, disqualified = ไม่ได้รับ
}

interface DiligenceBonusCalculation {
  empCode: string;
  empName: string;
  dept: string;
  month: string;
  isEligible: boolean;
  consecutiveMonths: number;
  amount: number;
  status: "eligible" | "reduced" | "disqualified";
  violations: {
    hasAbsence: boolean;
    hasLeave: boolean;
    hasLate: boolean;
    workedLessThanMonth: boolean;
    exceededLeaveLimit: boolean;
  };
  details: string;
}

const monthFormatter = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "long",
});

// แผนกที่ได้รับเบี้ยขยัน
const eligibleDepts: Record<EligibleDept, string[]> = {
  "เซเว่น": ["เซเว่น", "7-Eleven"],
  "OTOP": ["OTOP"],
  "หน้าลาน": ["ปั๊มน้ำมัน", "ปั๊ม", "หน้าลาน"],
  "Amazon": ["Amazon"],
};

// อัตราเบี้ยขยัน
const diligenceBonusRates = {
  1: 300, // ครั้งที่ 1
  2: 400, // ครั้งที่ 2
  3: 500, // ครั้งที่ 3 หรือเดือนถัดๆไป
};

// ========== Functions ==========

// ตรวจสอบว่าพนักงานอยู่ในแผนกที่ได้รับเบี้ยขยันหรือไม่
const isEligibleDept = (dept: string, category: string): boolean => {
  const deptLower = dept.toLowerCase();
  const categoryLower = (category || "").toLowerCase();

  return Object.values(eligibleDepts).some(deptList =>
    deptList.some(eligibleDept =>
      deptLower.includes(eligibleDept.toLowerCase()) ||
      categoryLower.includes(eligibleDept.toLowerCase())
    )
  );
};

// คำนวณเบี้ยขยัน
const calculateDiligenceBonus = (
  empCode: string,
  month: string,
  history: DiligenceBonusHistory[]
): DiligenceBonusCalculation => {
  const employee = employees.find(e => e.code === empCode);
  if (!employee) {
    return {
      empCode,
      empName: "",
      dept: "",
      month,
      isEligible: false,
      consecutiveMonths: 0,
      amount: 0,
      status: "disqualified",
      violations: {
        hasAbsence: false,
        hasLeave: false,
        hasLate: false,
        workedLessThanMonth: false,
        exceededLeaveLimit: false,
      },
      details: "ไม่พบข้อมูลพนักงาน",
    };
  }

  // ตรวจสอบแผนก
  if (!isEligibleDept(employee.dept, employee.category || "")) {
    return {
      empCode,
      empName: employee.name,
      dept: employee.dept,
      month,
      isEligible: false,
      consecutiveMonths: 0,
      amount: 0,
      status: "disqualified",
      violations: {
        hasAbsence: false,
        hasLeave: false,
        hasLate: false,
        workedLessThanMonth: false,
        exceededLeaveLimit: false,
      },
      details: "แผนกไม่ได้รับเบี้ยขยัน",
    };
  }

  // ดึงข้อมูล attendance ของเดือนนั้น
  const monthLogs = attendanceLogs.filter(
    log => log.empCode === empCode && log.date.startsWith(month)
  );

  // ตรวจสอบเงื่อนไข
  const hasAbsence = monthLogs.some(log => log.status === "ขาดงาน");
  const hasLeave = monthLogs.some(log => log.status === "ลา");
  const hasLate = monthLogs.some(log =>
    log.status.includes("สาย") || (log.lateMinutes && log.lateMinutes > 0)
  );

  // ตรวจสอบว่าทำงาน 1 เดือนขึ้นไป (ตรวจสอบจากวันที่เริ่มงาน)
  // Mock: สมมติว่าทำงานแล้ว 1 เดือนขึ้นไป
  const workedLessThanMonth = false; // ในระบบจริงจะตรวจสอบจากวันที่เริ่มงาน

  // ตรวจสอบว่าหยุดเกินสิทธิ์ (ตรวจสอบจาก leaves)
  const monthLeaves = leaves.filter(
    l => l.empCode === empCode &&
      l.fromDate.startsWith(month) &&
      l.status === "อนุมัติแล้ว"
  );
  const totalLeaveDays = monthLeaves.reduce((sum, l) => sum + l.days, 0);
  const exceededLeaveLimit = totalLeaveDays > 0; // ในระบบจริงจะตรวจสอบสิทธิ์การลา

  // หาเดือนติดต่อกันที่ได้รับเบี้ยขยัน
  const sortedHistory = [...history]
    .filter(h => h.empCode === empCode && h.status === "eligible")
    .sort((a, b) => b.month.localeCompare(a.month));

  let consecutiveMonths = 0;
  const currentMonth = month;

  for (const record of sortedHistory) {
    const recordDate = new Date(record.month + "-01");
    const currentDate = new Date(currentMonth + "-01");

    // ตรวจสอบว่าเป็นเดือนก่อนหน้าหรือไม่
    const monthsDiff = (currentDate.getFullYear() - recordDate.getFullYear()) * 12 +
      (currentDate.getMonth() - recordDate.getMonth());

    if (monthsDiff === 1) {
      consecutiveMonths = record.consecutiveMonths + 1;
      break;
    } else if (monthsDiff > 1) {
      break; // ไม่ติดต่อกัน
    }
  }

  if (consecutiveMonths === 0) {
    consecutiveMonths = 1; // ครั้งแรก
  }

  // ตรวจสอบว่ามีการทำผิดเงื่อนไขหรือไม่
  const hasViolation = hasAbsence || hasLeave || hasLate || workedLessThanMonth || exceededLeaveLimit;

  // ตรวจสอบประวัติเดือนก่อนหน้า
  const lastMonth = new Date(month + "-01");
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthRecord = history.find(
    h => h.empCode === empCode && h.month === lastMonthStr
  );

  let status: "eligible" | "reduced" | "disqualified" = "eligible";
  let amount = 0;

  if (hasViolation) {
    // ถ้าเคยได้รับ 500 บาท และทำผิด → ลดเป็น 300
    if (lastMonthRecord && lastMonthRecord.amount === 500) {
      status = "reduced";
      amount = 300;
    } else if (lastMonthRecord && lastMonthRecord.status === "reduced") {
      // ถ้าเคยลดแล้ว และทำผิดอีก → ไม่ได้รับ
      status = "disqualified";
      amount = 0;
    } else {
      // ทำผิดครั้งแรก → ไม่ได้รับ
      status = "disqualified";
      amount = 0;
    }
  } else {
    // ไม่มีข้อผิดพลาด → คำนวณตามเดือนติดต่อกัน
    status = "eligible";
    if (consecutiveMonths === 1) {
      amount = diligenceBonusRates[1];
    } else if (consecutiveMonths === 2) {
      amount = diligenceBonusRates[2];
    } else {
      amount = diligenceBonusRates[3];
    }
  }

  const violationDetails: string[] = [];
  if (hasAbsence) violationDetails.push("ขาดงาน");
  if (hasLeave) violationDetails.push("ลา");
  if (hasLate) violationDetails.push("เข้างานสาย");
  if (workedLessThanMonth) violationDetails.push("ทำงานน้อยกว่า 1 เดือน");
  if (exceededLeaveLimit) violationDetails.push("หยุดเกินสิทธิ์");

  const details = hasViolation
    ? `ไม่ได้รับเบี้ยขยัน: ${violationDetails.join(", ")}`
    : `ได้รับเบี้ยขยันครั้งที่ ${consecutiveMonths} (${amount} บาท)`;

  return {
    empCode,
    empName: employee.name,
    dept: employee.dept,
    month,
    isEligible: !hasViolation,
    consecutiveMonths,
    amount,
    status,
    violations: {
      hasAbsence,
      hasLeave,
      hasLate,
      workedLessThanMonth,
      exceededLeaveLimit,
    },
    details,
  };
};

// Mock data for reward history
const mockRewardHistory: RewardRecord[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    dept: "ปั๊มน้ำมัน",
    category: "ปั๊ม",
    rewardType: "เบี้ยขยัน",
    month: "2025-10",
    amount: 500,
    details: "ได้รับเบี้ยขยันครั้งที่ 3 (500 บาท)",
    calculatedBy: "system",
  },
  {
    id: 2,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    dept: "ปั๊มน้ำมัน",
    category: "ปั๊ม",
    rewardType: "เบี้ยขยัน",
    month: "2025-10",
    amount: 300,
    details: "ได้รับเบี้ยขยันครั้งที่ 1 (300 บาท)",
    calculatedBy: "system",
  },
  {
    id: 3,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    dept: "เซเว่น",
    category: "เซเว่น",
    rewardType: "รางวัล Audit",
    month: "2025-10",
    amount: 1500,
    details: "Audit ตัดจ่าย 7-Eleven: ไม่ขาดเกิน 0.4%",
    calculatedBy: "manual",
    auditCategory: "7-Eleven",
    auditScore: 95,
    auditRemarks: "สินค้าไม่ขาดเกิน ยอดขายจริง 100,000 บาท",
    paidBy: "Audit",
  },
  {
    id: 4,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    dept: "ปั๊มน้ำมัน",
    category: "ปั๊ม",
    rewardType: "รางวัล Audit",
    month: "2025-10",
    amount: 300,
    details: "Audit PTT: ตรวจได้ 100 คะแนนครั้งแรก",
    calculatedBy: "manual",
    auditCategory: "PTT",
    auditScore: 100,
    auditRemarks: "ผ่านการตรวจ Audit PTT",
    paidBy: "Audit",
  },
  {
    id: 5,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    dept: "ปั๊มน้ำมัน",
    category: "ปั๊ม",
    rewardType: "ค่าเรทน้ำมัน",
    month: "2025-10",
    amount: 200,
    details: "ประหยัดน้ำมัน: 1 ลิตร = 3.6 กิโลเมตร (ตามเป้าหมาย)",
    calculatedBy: "system",
  },
];

export default function OutstandingEmployees() {
  const [viewMode, setViewMode] = useState<"diligence" | "audit" | "fuel" | "history">("diligence");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [rewardHistory, setRewardHistory] = useState<RewardRecord[]>(mockRewardHistory);
  const [isAddAuditModalOpen, setIsAddAuditModalOpen] = useState(false);
  const [isAddFuelModalOpen, setIsAddFuelModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const [auditForm, setAuditForm] = useState({
    empCode: "",
    month: selectedMonth,
    auditCategory: "7-Eleven" as "7-Eleven" | "Amazon" | "OTOP" | "PTT",
    amount: "",
    auditScore: "",
    auditRemarks: "",
    notes: "",
  });

  const [fuelForm, setFuelForm] = useState({
    empCode: "",
    month: selectedMonth,
    amount: "200",
    fuelEfficiency: "", // กิโลเมตรต่อลิตร
    targetEfficiency: "3.6",
    notes: "",
  });

  // คำนวณเบี้ยขยันสำหรับเดือนที่เลือก
  const diligenceCalculations = useMemo(() => {
    // กรองพนักงานตามแผนกที่เลือก (ถ้าเลือก "all" แสดงทุกแผนก)
    let filteredEmployees = employees;
    if (selectedDept !== "all") {
      filteredEmployees = employees.filter(emp =>
        emp.dept === selectedDept || emp.category === selectedDept
      );
    }

    // กรองตาม search query
    if (searchQuery) {
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.dept.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // สำหรับเบี้ยขยัน ยังคงกรองเฉพาะแผนกที่ได้รับเบี้ยขยัน
    const eligibleEmployees = filteredEmployees.filter(emp =>
      isEligibleDept(emp.dept, emp.category || "")
    );

    // Mock history (ในระบบจริงจะดึงจากฐานข้อมูล)
    const mockHistory: DiligenceBonusHistory[] = rewardHistory
      .filter(r => r.rewardType === "เบี้ยขยัน")
      .map(r => ({
        empCode: r.empCode,
        month: r.month,
        consecutiveMonths: r.amount === 300 ? 1 : r.amount === 400 ? 2 : 3,
        amount: r.amount,
        status: r.amount > 0 ? "eligible" : "disqualified",
      }));

    return eligibleEmployees.map(emp => {
      const calculation = calculateDiligenceBonus(emp.code, selectedMonth, mockHistory);
      return calculation;
    }).filter(calc => calc.amount > 0 || calc.violations.hasAbsence || calc.violations.hasLeave || calc.violations.hasLate);
  }, [selectedMonth, rewardHistory, searchQuery, selectedDept]);

  // กรองประวัติรางวัล
  const filteredHistory = useMemo(() => {
    let filtered = rewardHistory;

    // กรองตาม viewMode
    if (viewMode === "diligence") {
      filtered = filtered.filter(r => r.rewardType === "เบี้ยขยัน");
    } else if (viewMode === "audit") {
      filtered = filtered.filter(r => r.rewardType === "รางวัล Audit");
    } else if (viewMode === "fuel") {
      filtered = filtered.filter(r => r.rewardType === "ค่าเรทน้ำมัน");
    }

    // กรองตามแผนก
    if (selectedDept !== "all") {
      filtered = filtered.filter(r =>
        r.dept === selectedDept || r.category === selectedDept
      );
    }

    // กรองตาม search query
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.details.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // กรองตามวันที่
    if (dateFilter.startDate) {
      filtered = filtered.filter(r => r.month >= dateFilter.startDate);
    }
    if (dateFilter.endDate) {
      filtered = filtered.filter(r => r.month <= dateFilter.endDate);
    }

    return filtered.sort((a, b) => b.month.localeCompare(a.month));
  }, [rewardHistory, viewMode, selectedDept, searchQuery, dateFilter]);

  // สรุปสถิติ
  const stats = useMemo(() => {
    const currentMonthRewards = rewardHistory.filter(r => r.month === selectedMonth);
    return {
      totalAmount: currentMonthRewards.reduce((sum, r) => sum + r.amount, 0),
      diligenceCount: currentMonthRewards.filter(r => r.rewardType === "เบี้ยขยัน").length,
      auditCount: currentMonthRewards.filter(r => r.rewardType === "รางวัล Audit").length,
      fuelCount: currentMonthRewards.filter(r => r.rewardType === "ค่าเรทน้ำมัน").length,
    };
  }, [rewardHistory, selectedMonth]);

  // บันทึกรางวัล Audit
  const handleSaveAuditReward = () => {
    if (!auditForm.empCode || !auditForm.amount) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const employee = employees.find(e => e.code === auditForm.empCode);
    if (!employee) {
      alert("ไม่พบข้อมูลพนักงาน");
      return;
    }

    const newReward: RewardRecord = {
      id: Math.max(...rewardHistory.map(r => r.id), 0) + 1,
      empCode: employee.code,
      empName: employee.name,
      dept: employee.dept,
      category: employee.category || "",
      rewardType: "รางวัล Audit",
      month: auditForm.month,
      amount: parseFloat(auditForm.amount),
      details: `Audit ${auditForm.auditCategory}: ${auditForm.auditRemarks || "ผ่านการตรวจ Audit"}`,
      calculatedBy: "manual",
      auditCategory: auditForm.auditCategory,
      auditScore: auditForm.auditScore ? parseFloat(auditForm.auditScore) : undefined,
      auditRemarks: auditForm.auditRemarks || undefined,
      paidBy: "Audit",
      notes: auditForm.notes || undefined,
    };

    setRewardHistory([...rewardHistory, newReward]);
    setIsAddAuditModalOpen(false);
    setAuditForm({
      empCode: "",
      month: selectedMonth,
      auditCategory: "7-Eleven",
      amount: "",
      auditScore: "",
      auditRemarks: "",
      notes: "",
    });
    alert("บันทึกรางวัล Audit สำเร็จ!");
  };

  // บันทึกรางวัลค่าเรทน้ำมัน
  const handleSaveFuelReward = () => {
    if (!fuelForm.empCode || !fuelForm.amount) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const employee = employees.find(e => e.code === fuelForm.empCode);
    if (!employee) {
      alert("ไม่พบข้อมูลพนักงาน");
      return;
    }

    const newReward: RewardRecord = {
      id: Math.max(...rewardHistory.map(r => r.id), 0) + 1,
      empCode: employee.code,
      empName: employee.name,
      dept: employee.dept,
      category: employee.category || "",
      rewardType: "ค่าเรทน้ำมัน",
      month: fuelForm.month,
      amount: parseFloat(fuelForm.amount),
      details: `ประหยัดน้ำมัน: 1 ลิตร = ${fuelForm.fuelEfficiency || fuelForm.targetEfficiency} กิโลเมตร (ตามเป้าหมาย)`,
      calculatedBy: "system",
      notes: fuelForm.notes || undefined,
    };

    setRewardHistory([...rewardHistory, newReward]);
    setIsAddFuelModalOpen(false);
    setFuelForm({
      empCode: "",
      month: selectedMonth,
      amount: "200",
      fuelEfficiency: "",
      targetEfficiency: "3.6",
      notes: "",
    });
    alert("บันทึกรางวัลค่าเรทน้ำมันสำเร็จ!");
  };

  // บันทึกเบี้ยขยัน (จากระบบคำนวณ)
  const handleSaveDiligenceBonus = (calculation: DiligenceBonusCalculation) => {
    if (calculation.amount === 0) {
      alert("พนักงานคนนี้ไม่ได้รับเบี้ยขยันในเดือนนี้");
      return;
    }

    const existing = rewardHistory.find(
      r => r.empCode === calculation.empCode &&
        r.month === calculation.month &&
        r.rewardType === "เบี้ยขยัน"
    );

    if (existing) {
      alert("บันทึกเบี้ยขยันสำหรับพนักงานคนนี้ในเดือนนี้แล้ว");
      return;
    }

    const newReward: RewardRecord = {
      id: Math.max(...rewardHistory.map(r => r.id), 0) + 1,
      empCode: calculation.empCode,
      empName: calculation.empName,
      dept: calculation.dept,
      category: "",
      rewardType: "เบี้ยขยัน",
      month: calculation.month,
      amount: calculation.amount,
      details: calculation.details,
      calculatedBy: "system",
    };

    setRewardHistory([...rewardHistory, newReward]);
    alert(`บันทึกเบี้ยขยันสำเร็จ! ${calculation.empName} ได้รับ ${calculation.amount} บาท`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-app font-display flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            รางวัลพนักงาน
          </h1>
          <p className="text-muted mt-2">
            ระบบจัดการรางวัลพนักงาน: เบี้ยขยัน, รางวัล Audit, ค่าเรทน้ำมัน
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="month"
            aria-label="เลือกเดือน"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-soft border border-app rounded-xl text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-soft hover:bg-app/10 text-app rounded-xl transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            กรองข้อมูล
          </button>
          <button className="px-4 py-2 bg-soft hover:bg-app/10 text-app rounded-xl transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            ส่งออก (Excel)
          </button>
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted">ยอดรวมรางวัล</p>
              <p className="text-lg font-bold text-app">{stats.totalAmount.toLocaleString()} บาท</p>
              <p className="text-xs text-muted mt-1">{monthFormatter.format(new Date(selectedMonth + "-01"))}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-soft border border-app rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-muted">เบี้ยขยัน</p>
              <p className="text-lg font-bold text-app">{stats.diligenceCount} คน</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-soft border border-app rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Medal className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted">รางวัล Audit</p>
              <p className="text-lg font-bold text-app">{stats.auditCount} คน</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-soft border border-app rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Fuel className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-muted">ค่าเรทน้ำมัน</p>
              <p className="text-lg font-bold text-app">{stats.fuelCount} คน</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-soft border border-app rounded-xl p-4 space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-app flex items-center gap-2">
              <Filter className="w-5 h-5" />
              กรองข้อมูล
            </h3>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDept("all");
                setDateFilter({ startDate: "", endDate: "" });
              }}
              className="text-sm text-muted hover:text-app"
            >
              ล้างการกรอง
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัส, แผนก..."
                aria-label="ค้นหา"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={selectedDept}
                aria-label="เลือกแผนก"
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              >
                <option value="all">ทุกแผนก</option>
                {Array.from(new Set(employees.map(e => e.dept))).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="month"
                placeholder="วันที่เริ่มต้น"
                aria-label="วันที่เริ่มต้น"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>

            {/* End Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="month"
                placeholder="วันที่สิ้นสุด"
                aria-label="วันที่สิ้นสุด"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-soft border border-app rounded-lg text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedDept !== "all" || dateFilter.startDate || dateFilter.endDate) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-app">
              <span className="text-xs text-muted">การกรองที่ใช้งาน:</span>
              {searchQuery && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                  ค้นหา: {searchQuery}
                </span>
              )}
              {selectedDept !== "all" && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                  แผนก: {selectedDept}
                </span>
              )}
              {dateFilter.startDate && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                  ตั้งแต่: {monthFormatter.format(new Date(dateFilter.startDate + "-01"))}
                </span>
              )}
              {dateFilter.endDate && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                  ถึง: {monthFormatter.format(new Date(dateFilter.endDate + "-01"))}
                </span>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-app">
        <button
          onClick={() => setViewMode("diligence")}
          className={`px-4 py-2 rounded-t-xl transition-colors ${viewMode === "diligence"
            ? "bg-ptt-blue text-app border-t-2 border-l-2 border-r-2 border-ptt-blue"
            : "bg-soft hover:bg-app/10 text-app"
            }`}
        >
          <Star className="w-4 h-4 inline mr-2" />
          เบี้ยขยัน
        </button>
        <button
          onClick={() => setViewMode("audit")}
          className={`px-4 py-2 rounded-t-xl transition-colors ${viewMode === "audit"
            ? "bg-ptt-blue text-app border-t-2 border-l-2 border-r-2 border-ptt-blue"
            : "bg-soft hover:bg-app/10 text-app"
            }`}
        >
          <Medal className="w-4 h-4 inline mr-2" />
          รางวัล Audit
        </button>
        <button
          onClick={() => setViewMode("fuel")}
          className={`px-4 py-2 rounded-t-xl transition-colors ${viewMode === "fuel"
            ? "bg-ptt-blue text-app border-t-2 border-l-2 border-r-2 border-ptt-blue"
            : "bg-soft hover:bg-app/10 text-app"
            }`}
        >
          <Fuel className="w-4 h-4 inline mr-2" />
          ค่าเรทน้ำมัน
        </button>
        <button
          onClick={() => setViewMode("history")}
          className={`px-4 py-2 rounded-t-xl transition-colors ${viewMode === "history"
            ? "bg-ptt-blue text-app border-t-2 border-l-2 border-r-2 border-ptt-blue"
            : "bg-soft hover:bg-app/10 text-app"
            }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          ประวัติทั้งหมด
        </button>
      </div>

      {/* เบี้ยขยัน */}
      {viewMode === "diligence" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl shadow-xl p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-app font-display flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                เบี้ยขยัน (คำนวณอัตโนมัติ)
              </h2>
              <p className="text-xs text-muted mt-1">
                แผนกที่ได้รับ: 7-Eleven, OTOP, หน้าลาน(น้ำมัน), Amazon
              </p>
              <p className="text-xs text-muted">
                เงื่อนไข: ไม่ขาด, ไม่ลา, ไม่เข้างานสาย, ทำงาน 1 เดือนขึ้นไป, หยุดไม่เกินสิทธิ์
              </p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-app mb-2">อัตราเบี้ยขยัน:</p>
                <ul className="text-xs text-muted space-y-1">
                  <li>• ครั้งที่ 1: 300 บาท</li>
                  <li>• ครั้งที่ 2: 400 บาท</li>
                  <li>• ครั้งที่ 3 หรือเดือนถัดๆไป: 500 บาท</li>
                </ul>
                <p className="text-xs text-yellow-400 mt-2">
                  ⚠️ หากทำผิดเงื่อนไข: จาก 500 → 300 บาท, ถ้าทำผิดอีก → ไม่ได้รับ (เริ่มใหม่)
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-soft border-b-2 border-app">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">รหัส</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">ชื่อ-สกุล</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">แผนก</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">เดือนติดต่อกัน</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">จำนวนเงิน</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">สถานะ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">รายละเอียด</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {diligenceCalculations.map((calc) => (
                  <tr key={calc.empCode} className="hover:bg-soft/50">
                    <td className="px-4 py-3 text-sm text-ptt-cyan font-medium">{calc.empCode}</td>
                    <td className="px-4 py-3 text-sm text-app font-medium">{calc.empName}</td>
                    <td className="px-4 py-3 text-sm text-app">{calc.dept}</td>
                    <td className="px-4 py-3 text-center text-sm text-app">
                      {calc.consecutiveMonths} เดือน
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-app">
                      {calc.amount > 0 ? (
                        <span className="text-green-400">{calc.amount.toLocaleString()} บาท</span>
                      ) : (
                        <span className="text-red-400">0 บาท</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {calc.status === "eligible" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                          <CheckCircle className="w-3 h-3" />
                          ได้รับ
                        </span>
                      )}
                      {calc.status === "reduced" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          <AlertCircle className="w-3 h-3" />
                          ลด
                        </span>
                      )}
                      {calc.status === "disqualified" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                          <X className="w-3 h-3" />
                          ไม่ได้รับ
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted max-w-xs">
                      <div className="truncate" title={calc.details}>
                        {calc.details}
                      </div>
                      {Object.values(calc.violations).some(v => v) && (
                        <div className="text-xs text-red-400 mt-1">
                          {calc.violations.hasAbsence && "ขาดงาน "}
                          {calc.violations.hasLeave && "ลา "}
                          {calc.violations.hasLate && "สาย "}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {calc.amount > 0 && (
                        <button
                          onClick={() => handleSaveDiligenceBonus(calc)}
                          className="px-3 py-1.5 bg-ptt-cyan hover:bg-ptt-cyan/80 text-app rounded-lg text-xs font-medium transition-colors"
                        >
                          <Save className="w-3 h-3 inline mr-1" />
                          บันทึก
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* รางวัล Audit */}
      {viewMode === "audit" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl shadow-xl p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-app font-display flex items-center gap-2">
                <Medal className="w-5 h-5 text-blue-400" />
                รางวัล Audit
              </h2>
              <p className="text-xs text-muted mt-1">
                Audit ตัดจ่าย 7-Eleven, Amazon, OTOP, PTT (หน้าลาน, แม่บ้าน, Office)
              </p>
            </div>
            <button
              onClick={() => setIsAddAuditModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-ptt-cyan hover:bg-ptt-cyan/80 text-app rounded-xl font-semibold"
            >
              <Plus className="w-4 h-4" />
              เพิ่มรางวัล Audit
            </button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Package className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-app mb-2">รายละเอียดรางวัล Audit:</p>
                <div className="text-xs text-muted space-y-3">
                  <div>
                    <p className="font-semibold text-app mb-1">1. เงินรางวัลประกวดปั๊ม ปตท.</p>
                    <p className="ml-2 mb-1">(สำหรับส่วนงานหน้าร้าน – บัญชี – แม่บ้าน)</p>
                    <ul className="ml-4 space-y-1 list-disc">
                      <li>ได้ 98–99 คะแนน : เงินรางวัล 200 บาท</li>
                      <li>ได้ 100 คะแนน:
                        <ul className="ml-4 mt-1 space-y-0.5 list-disc">
                          <li>ครั้งที่ 1 : 300 บาท</li>
                          <li>ครั้งที่ 2 : 400 บาท</li>
                          <li>ครั้งที่ 3 : 500 บาท</li>
                        </ul>
                      </li>
                      <li className="text-yellow-400 mt-1">เงื่อนไข: ต้องไม่มีข้อร้องเรียนจาก 1365</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-app mb-1">2. เงินรางวัลร้านคาเฟ่ อเมซอน</p>
                    <p className="ml-2 mb-1">(ผลการตรวจจากทีม Audit)</p>
                    <ul className="ml-4 space-y-1 list-disc">
                      <li>ครั้งที่ 1 : 500 บาท</li>
                      <li>ครั้งที่ 2 : 500 บาท</li>
                      <li>ครั้งที่ 3 : 1,000 บาท</li>
                      <li>หลังจากครั้งที่ 3 เป็นต้นไป : ยืนรางวัล 1,000 บาททุกครั้ง</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-app mb-1">3. เงินรางวัลจากการตรวจ Audit เซเว่น (7-Eleven)</p>
                    <p className="ml-2 mb-1">รวมถึง รางวัลตัดจ่ายเซเว่น</p>
                    <div className="ml-4 space-y-2">
                      <div>
                        <p className="font-medium text-app mb-1">3.1 รางวัลตัดจ่ายประจำเดือน:</p>
                        <ul className="ml-4 space-y-0.5 list-disc">
                          <li>ยอดขายเพิ่มขึ้น 10% ขึ้นไป จากเดือนเดียวกันของปีก่อน → ได้รับรางวัลตัดจ่าย 100%</li>
                          <li>ยอดขายเพิ่มขึ้น ไม่ถึง 10% → ได้รับรางวัลตัดจ่าย 50%</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-app mb-1">3.2 รางวัลเพิ่มจากยอดขายสูงกว่าเป้าของเซเว่น:</p>
                        <ul className="ml-4 space-y-0.5 list-disc">
                          <li>เพิ่มขึ้น 5%–9.99% : รางวัลเพิ่ม 3,000 บาท</li>
                          <li>เพิ่มขึ้น 10%–14.99% : รางวัลเพิ่ม 6,000 บาท</li>
                          <li>เพิ่มขึ้น 15%–19.99% : รางวัลเพิ่ม 9,000 บาท</li>
                          <li>เพิ่มขึ้น 20% ขึ้นไป : รางวัลเพิ่ม 12,000 บาท</li>
                        </ul>
                      </div>
                      <p className="ml-4 text-yellow-400 mt-1">การแบ่งเงินรางวัล: ผู้จัดการ – ผู้ช่วยผู้จัดการ – ผู้ช่วยฝึกหัด – พนักงาน → แบ่งรางวัลเท่า ๆ กันทุกตำแหน่ง</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-app/20">
                    <p className="font-semibold text-app mb-1">ผลการประเมินอื่น ๆ:</p>
                    <ul className="ml-4 space-y-0.5 list-disc">
                      <li>QSSI = 100 คะแนน</li>
                      <li>หมวดบริการ = 100 คะแนน</li>
                      <li>ไม่มีข้อร้องเรียน</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-soft border-b-2 border-app">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">รหัส</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">ชื่อ-สกุล</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">แผนก</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">ประเภท Audit</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">คะแนน</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">จำนวนเงิน</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">รายละเอียด</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">เดือน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filteredHistory.map((reward) => (
                  <tr key={reward.id} className="hover:bg-soft/50">
                    <td className="px-4 py-3 text-sm text-ptt-cyan font-medium">{reward.empCode}</td>
                    <td className="px-4 py-3 text-sm text-app font-medium">{reward.empName}</td>
                    <td className="px-4 py-3 text-sm text-app">{reward.dept}</td>
                    <td className="px-4 py-3 text-center text-sm text-app">
                      {reward.auditCategory || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-app">
                      {reward.auditScore ? `${reward.auditScore} คะแนน` : "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-green-400">
                      {reward.amount.toLocaleString()} บาท
                    </td>
                    <td className="px-4 py-3 text-sm text-muted max-w-xs">
                      <div className="truncate" title={reward.details}>
                        {reward.details}
                      </div>
                      {reward.auditRemarks && (
                        <div className="text-xs text-muted mt-1">{reward.auditRemarks}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-app">
                      {monthFormatter.format(new Date(reward.month + "-01"))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ค่าเรทน้ำมัน */}
      {viewMode === "fuel" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl shadow-xl p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-app font-display flex items-center gap-2">
                <Fuel className="w-5 h-5 text-orange-400" />
                ค่าเรทน้ำมัน
              </h2>
              <p className="text-xs text-muted mt-1">
                รางวัลการประหยัดน้ำมัน: 1 ลิตร = 3.6 กิโลเมตร (ตามเป้าหมาย) = 200 บาท
              </p>
            </div>
            <button
              onClick={() => setIsAddFuelModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-ptt-cyan hover:bg-ptt-cyan/80 text-app rounded-xl font-semibold"
            >
              <Plus className="w-4 h-4" />
              เพิ่มรางวัลค่าเรทน้ำมัน
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-soft border-b-2 border-app">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">รหัส</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">ชื่อ-สกุล</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">แผนก</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">ประสิทธิภาพ</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">จำนวนเงิน</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">รายละเอียด</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">เดือน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filteredHistory.map((reward) => (
                  <tr key={reward.id} className="hover:bg-soft/50">
                    <td className="px-4 py-3 text-sm text-ptt-cyan font-medium">{reward.empCode}</td>
                    <td className="px-4 py-3 text-sm text-app font-medium">{reward.empName}</td>
                    <td className="px-4 py-3 text-sm text-app">{reward.dept}</td>
                    <td className="px-4 py-3 text-center text-sm text-app">
                      {reward.details.includes("กิโลเมตร")
                        ? reward.details.match(/1 ลิตร = ([\d.]+) กิโลเมตร/)?.[1] + " km/L"
                        : "3.6 km/L"}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-green-400">
                      {reward.amount.toLocaleString()} บาท
                    </td>
                    <td className="px-4 py-3 text-sm text-muted max-w-xs">
                      <div className="truncate" title={reward.details}>
                        {reward.details}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-app">
                      {monthFormatter.format(new Date(reward.month + "-01"))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ประวัติทั้งหมด */}
      {viewMode === "history" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-soft border border-app rounded-2xl shadow-xl p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-app font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-ptt-cyan" />
              ประวัติรางวัลทั้งหมด
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-soft border-b-2 border-app">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">เดือน</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">รหัส</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">ชื่อ-สกุล</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">แผนก</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">ประเภทรางวัล</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-app">จำนวนเงิน</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-app">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filteredHistory.map((reward) => (
                  <tr key={reward.id} className="hover:bg-soft/50">
                    <td className="px-4 py-3 text-sm text-app">
                      {monthFormatter.format(new Date(reward.month + "-01"))}
                    </td>
                    <td className="px-4 py-3 text-sm text-ptt-cyan font-medium">{reward.empCode}</td>
                    <td className="px-4 py-3 text-sm text-app font-medium">{reward.empName}</td>
                    <td className="px-4 py-3 text-sm text-app">{reward.dept}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${reward.rewardType === "เบี้ยขยัน"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : reward.rewardType === "รางวัล Audit"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        }`}>
                        {reward.rewardType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-green-400">
                      {reward.amount.toLocaleString()} บาท
                    </td>
                    <td className="px-4 py-3 text-sm text-muted max-w-xs">
                      <div className="truncate" title={reward.details}>
                        {reward.details}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Modal เพิ่มรางวัล Audit */}
      {isAddAuditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-soft border border-app rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 px-6 py-4 border-b border-app bg-soft flex items-center justify-between">
              <h3 className="text-xl font-bold text-app">เพิ่มรางวัล Audit</h3>
              <button
                onClick={() => setIsAddAuditModalOpen(false)}
                className="text-muted hover:text-app"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="audit-empCode" className="block text-sm font-semibold text-app mb-2">เลือกพนักงาน *</label>
                <select
                  id="audit-empCode"
                  value={auditForm.empCode}
                  onChange={(e) => {
                    setAuditForm({ ...auditForm, empCode: e.target.value });
                  }}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                >
                  <option value="">เลือกพนักงาน</option>
                  {employees.filter(e => e.status === "Active").map(emp => (
                    <option key={emp.id} value={emp.code}>
                      {emp.code} - {emp.name} ({emp.dept})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="audit-month" className="block text-sm font-semibold text-app mb-2">เดือน *</label>
                <input
                  id="audit-month"
                  type="month"
                  value={auditForm.month}
                  onChange={(e) => setAuditForm({ ...auditForm, month: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                />
              </div>
              <div>
                <label htmlFor="audit-category" className="block text-sm font-semibold text-app mb-2">ประเภท Audit *</label>
                <select
                  id="audit-category"
                  value={auditForm.auditCategory}
                  onChange={(e) => setAuditForm({ ...auditForm, auditCategory: e.target.value as "7-Eleven" | "Amazon" | "OTOP" | "PTT" })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                >
                  <option value="7-Eleven">7-Eleven (รางวัลตัดจ่าย/รางวัลเพิ่มจากยอดขาย)</option>
                  <option value="Amazon">Amazon (รางวัลร้านคาเฟ่)</option>
                  <option value="OTOP">OTOP</option>
                  <option value="PTT">PTT (ประกวดปั๊ม - หน้าร้าน, บัญชี, แม่บ้าน)</option>
                </select>
              </div>
              <div>
                <label htmlFor="audit-amount" className="block text-sm font-semibold text-app mb-2">จำนวนเงิน (บาท) *</label>
                <input
                  id="audit-amount"
                  type="number"
                  value={auditForm.amount}
                  onChange={(e) => setAuditForm({ ...auditForm, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                  placeholder="เช่น 1500"
                />
              </div>
              {/* ฟิลด์เพิ่มเติมสำหรับรางวัล PTT */}
              {auditForm.auditCategory === "PTT" && (
                <>
                  <div>
                    <label htmlFor="audit-score" className="block text-sm font-semibold text-app mb-2">คะแนนที่ได้ (98-99 หรือ 100) *</label>
                    <input
                      id="audit-score"
                      type="number"
                      value={auditForm.auditScore}
                      onChange={(e) => setAuditForm({ ...auditForm, auditScore: e.target.value })}
                      className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                      placeholder="เช่น 98, 99, หรือ 100"
                      min="98"
                      max="100"
                    />
                  </div>
                  {auditForm.auditScore === "100" && (
                    <div>
                      <label htmlFor="audit-remarks-ptt" className="block text-sm font-semibold text-app mb-2">ครั้งที่ (สำหรับ 100 คะแนน) *</label>
                      <select
                        id="audit-remarks-ptt"
                        value={auditForm.auditRemarks || ""}
                        onChange={(e) => setAuditForm({ ...auditForm, auditRemarks: e.target.value })}
                        className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                      >
                        <option value="">เลือกครั้งที่</option>
                        <option value="1">ครั้งที่ 1 (300 บาท)</option>
                        <option value="2">ครั้งที่ 2 (400 บาท)</option>
                        <option value="3">ครั้งที่ 3 (500 บาท)</option>
                      </select>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="noComplaint1365"
                      className="w-4 h-4"
                    />
                    <label htmlFor="noComplaint1365" className="text-sm text-app">ไม่มีข้อร้องเรียนจาก 1365</label>
                  </div>
                </>
              )}
              {/* ฟิลด์เพิ่มเติมสำหรับรางวัล Amazon */}
              {auditForm.auditCategory === "Amazon" && (
                <div>
                  <label htmlFor="audit-remarks-amazon" className="block text-sm font-semibold text-app mb-2">ครั้งที่ *</label>
                  <select
                    id="audit-remarks-amazon"
                    value={auditForm.auditRemarks || ""}
                    onChange={(e) => setAuditForm({ ...auditForm, auditRemarks: e.target.value })}
                    className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                  >
                    <option value="">เลือกครั้งที่</option>
                    <option value="1">ครั้งที่ 1 (500 บาท)</option>
                    <option value="2">ครั้งที่ 2 (500 บาท)</option>
                    <option value="3">ครั้งที่ 3 (1,000 บาท)</option>
                    <option value="4+">หลังจากครั้งที่ 3 (ยืนรางวัล 1,000 บาท)</option>
                  </select>
                </div>
              )}
              {/* ฟิลด์เพิ่มเติมสำหรับรางวัล 7-Eleven */}
              {auditForm.auditCategory === "7-Eleven" && (
                <>
                  <div>
                    <label htmlFor="audit-remarks-711" className="block text-sm font-semibold text-app mb-2">ประเภทรางวัล *</label>
                    <select
                      id="audit-remarks-711"
                      value={auditForm.auditRemarks || ""}
                      onChange={(e) => setAuditForm({ ...auditForm, auditRemarks: e.target.value })}
                      className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                    >
                      <option value="">เลือกประเภทรางวัล</option>
                      <option value="cutting">รางวัลตัดจ่ายประจำเดือน</option>
                      <option value="sales_bonus">รางวัลเพิ่มจากยอดขายสูงกว่าเป้า</option>
                    </select>
                  </div>
                  {auditForm.auditRemarks === "sales_bonus" && (
                    <div>
                      <label htmlFor="audit-score-sales" className="block text-sm font-semibold text-app mb-2">% เพิ่มขึ้นของยอดขาย</label>
                      <input
                        id="audit-score-sales"
                        type="number"
                        step="0.01"
                        value={auditForm.auditScore}
                        onChange={(e) => setAuditForm({ ...auditForm, auditScore: e.target.value })}
                        className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                        placeholder="เช่น 10.5"
                      />
                    </div>
                  )}
                </>
              )}
              {/* ฟิลด์คะแนน Audit สำหรับประเภทอื่นๆ */}
              {auditForm.auditCategory !== "PTT" && auditForm.auditCategory !== "Amazon" && auditForm.auditCategory !== "7-Eleven" && (
                <div>
                  <label htmlFor="audit-score-other" className="block text-sm font-semibold text-app mb-2">คะแนน Audit</label>
                  <input
                    id="audit-score-other"
                    type="number"
                    value={auditForm.auditScore}
                    onChange={(e) => setAuditForm({ ...auditForm, auditScore: e.target.value })}
                    className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                    placeholder="เช่น 100"
                  />
                </div>
              )}
              <div>
                <label htmlFor="audit-details" className="block text-sm font-semibold text-app mb-2">รายละเอียด/หมายเหตุ</label>
                <textarea
                  id="audit-details"
                  value={auditForm.notes}
                  onChange={(e) => setAuditForm({ ...auditForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                  placeholder="เช่น ไม่ขาดเกิน 0.4% ของยอดขายจริง"
                />
              </div>
              <div>
                <label htmlFor="audit-notes" className="block text-sm font-semibold text-app mb-2">หมายเหตุเพิ่มเติม</label>
                <textarea
                  id="audit-notes"
                  value={auditForm.notes}
                  onChange={(e) => setAuditForm({ ...auditForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                  placeholder="(ถ้ามี)"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setIsAddAuditModalOpen(false)}
                  className="px-4 py-2 bg-soft border border-app rounded-lg text-app"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveAuditReward}
                  className="px-6 py-2 bg-ptt-cyan hover:bg-ptt-cyan/80 text-app rounded-lg font-semibold"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal เพิ่มรางวัลค่าเรทน้ำมัน */}
      {isAddFuelModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-soft border border-app rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 px-6 py-4 border-b border-app bg-soft flex items-center justify-between">
              <h3 className="text-xl font-bold text-app">เพิ่มรางวัลค่าเรทน้ำมัน</h3>
              <button
                onClick={() => setIsAddFuelModalOpen(false)}
                className="text-muted hover:text-app"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="fuel-empCode" className="block text-sm font-semibold text-app mb-2">เลือกพนักงาน *</label>
                <select
                  id="fuel-empCode"
                  value={fuelForm.empCode}
                  onChange={(e) => setFuelForm({ ...fuelForm, empCode: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                >
                  <option value="">เลือกพนักงาน</option>
                  {employees.filter(e => e.status === "Active").map(emp => (
                    <option key={emp.id} value={emp.code}>
                      {emp.code} - {emp.name} ({emp.dept})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="fuel-month" className="block text-sm font-semibold text-app mb-2">เดือน *</label>
                <input
                  id="fuel-month"
                  type="month"
                  value={fuelForm.month}
                  onChange={(e) => setFuelForm({ ...fuelForm, month: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                />
              </div>
              <div>
                <label htmlFor="fuel-efficiency" className="block text-sm font-semibold text-app mb-2">ประสิทธิภาพน้ำมัน (กิโลเมตร/ลิตร) *</label>
                <input
                  id="fuel-efficiency"
                  type="number"
                  step="0.1"
                  value={fuelForm.fuelEfficiency}
                  onChange={(e) => setFuelForm({ ...fuelForm, fuelEfficiency: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                  placeholder="เช่น 3.6"
                />
                <p className="text-xs text-muted mt-1">เป้าหมาย: {fuelForm.targetEfficiency} กิโลเมตร/ลิตร</p>
              </div>
              <div>
                <label htmlFor="fuel-amount" className="block text-sm font-semibold text-app mb-2">จำนวนเงิน (บาท) *</label>
                <input
                  id="fuel-amount"
                  type="number"
                  value={fuelForm.amount}
                  onChange={(e) => setFuelForm({ ...fuelForm, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                  placeholder="200"
                />
              </div>
              <div>
                <label htmlFor="fuel-notes" className="block text-sm font-semibold text-app mb-2">หมายเหตุ</label>
                <textarea
                  id="fuel-notes"
                  value={fuelForm.notes}
                  onChange={(e) => setFuelForm({ ...fuelForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-soft border border-app rounded-lg text-app"
                  placeholder="(ถ้ามี)"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setIsAddFuelModalOpen(false)}
                  className="px-4 py-2 bg-soft border border-app rounded-lg text-app"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveFuelReward}
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
