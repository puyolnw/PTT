import { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Calendar,
  Star,
  TrendingUp,
  Clock,
  Target,
  Trophy,
  Medal,
  Crown,
  Filter,
  Download,
  FileText,
} from "lucide-react";
import { employees, attendanceLogs, evaluations, shifts } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

// Mock data for outstanding employees
interface OutstandingEmployee {
  id: number;
  empCode: string;
  empName: string;
  dept: string;
  position: string;
  avatar?: string;
  period: string; // "2025-11" or "2025"
  type: "monthly" | "yearly";
  score: number;
  criteria: {
    attendance: number; // เปอร์เซ็นต์การมาทำงาน
    punctuality: number; // เปอร์เซ็นต์การมาทำงานตรงเวลา
    performance: number; // คะแนนประเมินผล
    customerSatisfaction?: number; // ความพึงพอใจลูกค้า (ถ้ามี)
    teamwork?: number; // การทำงานเป็นทีม
    initiative?: number; // ความคิดริเริ่ม
  };
  achievements: string[];
  reward?: {
    type: "เงินรางวัล" | "ประกาศเกียรติคุณ" | "ของรางวัล";
    amount?: number;
    description: string;
  };
}

// Generate mock outstanding employees
const generateOutstandingEmployees = (): OutstandingEmployee[] => {
  const monthly: OutstandingEmployee[] = [];
  const yearly: OutstandingEmployee[] = [];

  // Monthly outstanding employees (last 6 months)
  const months = ["2025-11", "2025-10", "2025-09", "2025-08", "2025-07", "2025-06"];
  months.forEach((month) => {
    const topEmployees = employees
      .filter((emp) => emp.status === "Active")
      .slice(0, 3)
      .map((emp, index) => {
        const attendance = attendanceLogs.filter(
          (log) => log.empCode === emp.code && log.date.startsWith(month)
        );
        const onTimeCount = attendance.filter((log) => log.status === "ตรงเวลา").length;
        const totalDays = attendance.length;
        const attendanceRate = totalDays > 0 ? (totalDays / 30) * 100 : 0;
        const punctualityRate = totalDays > 0 ? (onTimeCount / totalDays) * 100 : 0;

        const evaluation = evaluations.find((evalItem) => evalItem.empCode === emp.code);
        // Convert score (1.0-5.0) to percentage (0-100)
        const performanceScore = evaluation ? (evaluation.score / 5.0) * 100 : 85;

        const score = attendanceRate * 0.3 + punctualityRate * 0.3 + performanceScore * 0.4;

        return {
          id: emp.id,
          empCode: emp.code,
          empName: emp.name,
          dept: emp.dept,
          position: emp.position,
          avatar: emp.avatar,
          period: month,
          type: "monthly" as const,
          score: Math.round(score),
          criteria: {
            attendance: Math.round(attendanceRate),
            punctuality: Math.round(punctualityRate),
            performance: performanceScore,
            customerSatisfaction: 90 + Math.floor(Math.random() * 10),
            teamwork: 85 + Math.floor(Math.random() * 15),
            initiative: 80 + Math.floor(Math.random() * 20),
          },
          achievements: [
            "มาทำงานครบทุกวัน",
            "ไม่มีประวัติมาสาย",
            "ได้รับคำชมจากลูกค้า",
            "ช่วยงานเพื่อนร่วมงาน",
          ],
          reward: {
            type: (index === 0 ? "เงินรางวัล" : "ประกาศเกียรติคุณ") as "เงินรางวัล" | "ประกาศเกียรติคุณ" | "ของรางวัล",
            amount: index === 0 ? 5000 : undefined,
            description: index === 0 ? "เงินรางวัล 5,000 บาท" : "ประกาศเกียรติคุณ",
          },
        };
      });

    monthly.push(...topEmployees);
  });

  // Yearly outstanding employees (last 2 years)
  const years = ["2025", "2024"];
  years.forEach((year) => {
    const topEmployees = employees
      .filter((emp) => emp.status === "Active")
      .slice(0, 5)
      .map((emp, index) => {
        const attendance = attendanceLogs.filter((log) => log.empCode === emp.code && log.date.startsWith(year));
        const onTimeCount = attendance.filter((log) => log.status === "ตรงเวลา").length;
        const totalDays = attendance.length;
        const attendanceRate = totalDays > 0 ? (totalDays / 365) * 100 : 0;
        const punctualityRate = totalDays > 0 ? (onTimeCount / totalDays) * 100 : 0;

        const evaluation = evaluations.find((evalItem) => evalItem.empCode === emp.code);
        // Convert score (1.0-5.0) to percentage (0-100)
        const performanceScore = evaluation ? (evaluation.score / 5.0) * 100 : 88;

        const score = attendanceRate * 0.3 + punctualityRate * 0.3 + performanceScore * 0.4;

        return {
          id: emp.id,
          empCode: emp.code,
          empName: emp.name,
          dept: emp.dept,
          position: emp.position,
          avatar: emp.avatar,
          period: year,
          type: "yearly" as const,
          score: Math.round(score),
          criteria: {
            attendance: Math.round(attendanceRate),
            punctuality: Math.round(punctualityRate),
            performance: performanceScore,
            customerSatisfaction: 92 + Math.floor(Math.random() * 8),
            teamwork: 88 + Math.floor(Math.random() * 12),
            initiative: 85 + Math.floor(Math.random() * 15),
          },
          achievements: [
            "มาทำงานครบทุกวันตลอดทั้งปี",
            "ไม่มีประวัติมาสาย",
            "ได้รับคำชมจากลูกค้าอย่างต่อเนื่อง",
            "เป็นที่ยอมรับจากเพื่อนร่วมงาน",
            "มีผลงานโดดเด่น",
          ],
          reward: {
            type: (index === 0 ? "เงินรางวัล" : index < 3 ? "เงินรางวัล" : "ประกาศเกียรติคุณ") as "เงินรางวัล" | "ประกาศเกียรติคุณ" | "ของรางวัล",
            amount: index === 0 ? 50000 : index < 3 ? 20000 : undefined,
            description:
              index === 0
                ? "เงินรางวัล 50,000 บาท"
                : index < 3
                ? "เงินรางวัล 20,000 บาท"
                : "ประกาศเกียรติคุณ",
          },
        };
      });

    yearly.push(...topEmployees);
  });

  return [...monthly, ...yearly];
};

const outstandingEmployees = generateOutstandingEmployees();

const formatPeriod = (period: string, type: "monthly" | "yearly") => {
  if (type === "monthly") {
    const [year, month] = period.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("th-TH", { month: "long", year: "numeric" });
  } else {
    return `ปี ${period}`;
  }
};

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

export default function OutstandingEmployees() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<"all" | "monthly" | "yearly">("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState<number | "">("");

  const filteredEmployees = outstandingEmployees.filter((emp) => {
    // Filter by type and period
    let matches = false;
    if (filterType === "all") {
      matches = selectedPeriod === "" || emp.period === selectedPeriod;
    } else {
      matches = emp.type === filterType && (selectedPeriod === "" || emp.period === selectedPeriod);
    }
    
    if (!matches) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!emp.empName.toLowerCase().includes(query) && !emp.empCode.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Department filter
    if (deptFilter && emp.dept !== deptFilter) {
      return false;
    }

    // Shift filter
    if (shiftFilter !== "") {
      const employee = employees.find(e => e.code === emp.empCode);
      if (!employee || employee.shiftId !== shiftFilter) {
        return false;
      }
    }

    return true;
  });

  const availablePeriods = Array.from(
    new Set(outstandingEmployees.map((emp) => emp.period))
  ).sort((a, b) => (b > a ? 1 : -1));

  const topEmployee = filteredEmployees
    .filter((emp) => emp.type === filterType || filterType === "all")
    .sort((a, b) => b.score - a.score)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-app font-display flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            พนักงานดีเด่น
          </h1>
          <p className="text-muted mt-2">รางวัลและเกียรติยศสำหรับพนักงานที่ทำผลงานดี</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-soft hover:bg-app/10 text-app rounded-xl transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" />
            ส่งออก PDF
          </button>
          <button className="px-4 py-2 bg-soft hover:bg-app/10 text-app rounded-xl transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            ส่งออก Excel
          </button>
        </div>
      </motion.div>

      {/* Top Employee Highlight */}
      {topEmployee && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 p-1">
                <div className="w-full h-full rounded-full bg-soft overflow-hidden">
                  {topEmployee.avatar ? (
                    <img src={topEmployee.avatar} alt={topEmployee.empName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ptt-blue to-ptt-cyan text-app text-2xl font-bold">
                      {topEmployee.empName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -top-2 -right-2">
                <Crown className="w-8 h-8 text-yellow-400" fill="currentColor" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-app font-display">{topEmployee.empName}</h2>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-medium">
                  อันดับ 1
                </span>
              </div>
              <p className="text-muted mb-1">
                {topEmployee.empCode} • {topEmployee.position} • {topEmployee.dept}
              </p>
              <p className="text-sm text-muted mb-3">
                {formatPeriod(topEmployee.period, topEmployee.type)}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                  <span className="text-lg font-bold text-app">{topEmployee.score} คะแนน</span>
                </div>
                {topEmployee.reward?.amount && (
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                    {currencyFormatter.format(topEmployee.reward.amount)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-soft border border-app rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="px-6 py-4 border-b border-app bg-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-app font-display">
                รายการพนักงานดีเด่น
              </h3>
              <p className="text-xs text-muted mt-1">
                แสดง {filteredEmployees.length} รายการ
              </p>
            </div>
          </div>
          
          {/* Filter Bar - Inline */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
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
              <select
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

              <select
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

              <div className="flex gap-2">
                {(["all", "monthly", "yearly"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      setSelectedPeriod("");
                    }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      filterType === type
                        ? "bg-ptt-blue text-app"
                        : "bg-soft hover:bg-app/10 text-app border border-app"
                    }`}
                  >
                    {type === "all" && "ทั้งหมด"}
                    {type === "monthly" && "รายเดือน"}
                    {type === "yearly" && "รายปี"}
                  </button>
                ))}
              </div>

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2.5 bg-soft border border-app rounded-xl
                         text-app text-sm min-w-[150px]
                         focus:outline-none focus:ring-2 focus:ring-ptt-blue focus:border-transparent
                         transition-all cursor-pointer hover:border-app/50"
              >
                <option value="">ทุกระยะเวลา</option>
                {availablePeriods
                  .filter((period) => {
                    if (filterType === "monthly") {
                      return period.includes("-");
                    } else if (filterType === "yearly") {
                      return !period.includes("-");
                    }
                    return true;
                  })
                  .map((period) => {
                    const emp = outstandingEmployees.find((e) => e.period === period);
                    return (
                      <option key={period} value={period}>
                        {emp ? formatPeriod(period, emp.type) : period}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Outstanding Employees List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEmployees
          .sort((a, b) => b.score - a.score)
          .map((emp, index) => (
            <motion.div
              key={`${emp.id}-${emp.period}-${emp.type}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-soft border border-app rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer"
              onClick={() => navigate(`/app/hr/employees/${emp.id}`)}
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ptt-blue to-ptt-cyan p-1">
                    <div className="w-full h-full rounded-full bg-soft overflow-hidden">
                      {emp.avatar ? (
                        <img
                          src={emp.avatar}
                          alt={emp.empName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ptt-blue to-ptt-cyan text-app text-lg font-bold">
                          {emp.empName.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1">
                      {index === 0 ? (
                        <Crown className="w-6 h-6 text-yellow-400" fill="currentColor" />
                      ) : index === 1 ? (
                        <Medal className="w-6 h-6 text-gray-400" fill="currentColor" />
                      ) : (
                        <Award className="w-6 h-6 text-orange-400" fill="currentColor" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-app font-display">
                        {emp.empName}
                      </h3>
                      <p className="text-sm text-muted">
                        {emp.empCode} • {emp.position}
                      </p>
                      <p className="text-xs text-muted">{emp.dept}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                        <span className="text-xl font-bold text-app">{emp.score}</span>
                      </div>
                      <p className="text-xs text-muted">คะแนน</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        การมาทำงาน
                      </span>
                      <span className="text-app font-medium">{emp.criteria.attendance}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        ตรงเวลา
                      </span>
                      <span className="text-app font-medium">{emp.criteria.punctuality}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        ประสิทธิภาพ
                      </span>
                      <span className="text-app font-medium">{emp.criteria.performance}%</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-app">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-app">
                        {formatPeriod(emp.period, emp.type)}
                      </span>
                      {emp.reward && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            emp.reward.type === "เงินรางวัล"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {emp.reward.description}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {emp.achievements.slice(0, 2).map((achievement, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-ptt-blue/20 text-ptt-cyan rounded text-xs"
                        >
                          {achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-muted mx-auto mb-4" />
          <p className="text-muted font-light">ไม่พบข้อมูลพนักงานดีเด่น</p>
        </div>
      )}

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-soft border border-app rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted">พนักงานดีเด่นทั้งหมด</p>
              <p className="text-2xl font-bold text-app">
                {outstandingEmployees.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-soft border border-app rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted">รายเดือน</p>
              <p className="text-2xl font-bold text-app">
                {outstandingEmployees.filter((e) => e.type === "monthly").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-soft border border-app rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted">รายปี</p>
              <p className="text-2xl font-bold text-app">
                {outstandingEmployees.filter((e) => e.type === "yearly").length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

