import { useMemo, useRef, useState } from "react";
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
  Download,
  FileText,
  ClipboardList,
  Edit3,
  Plus,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { employees, attendanceLogs } from "@/data/mockData";

interface PumpChampion {
  id: number;
  empCode: string;
  empName: string;
  dept: string;
  position: string;
  avatar?: string;
  month: string;
  departmentHighlight: string[];
  auditNote: string;
  attendanceRate: number;
  punctualityRate: number;
  auditScore: number;
  totalScore: number;
}

interface AuditAward {
  id: number;
  empCode: string;
  empName: string;
  dept: string;
  categoryKey: string;
  categoryLabel: string;
  month: string;
  auditScore: number;
  pttScore: number;
  totalScore: number;
  remarks: string;
  avatar?: string;
}

interface NewAuditFormState {
  month: string;
  categoryKey: string;
  empCode: string;
  empName: string;
  dept: string;
  auditScore: string;
  pttScore: string;
  remarks: string;
}

interface ChampionRewardFormState {
  rewardName: string;
  amount: string;
  note: string;
}

const monthFormatter = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "long",
});

const pumpChampionMonths = ["2025-11", "2025-10", "2025-09", "2025-08", "2025-07", "2025-06"];

const awardCategories = [
  {
    key: "housekeeping",
    label: "พนักงานแม่บ้าน",
    matcher: (emp: (typeof employees)[number]) =>
      emp.dept === "แม่บ้าน" || emp.category === "แม่บ้าน",
  },
  {
    key: "frontline",
    label: "พนักงานหน้าลาน",
    matcher: (emp: (typeof employees)[number]) =>
      emp.dept === "ปั๊มน้ำมัน" || emp.category === "ปั๊ม",
  },
  {
    key: "office",
    label: "พนักงานใน Office",
    matcher: (emp: (typeof employees)[number]) =>
      emp.dept === "Office" || emp.category === "Office",
  },
];

const calculateAttendanceStats = (empCode: string, month: string) => {
  const logs = attendanceLogs.filter(
    (log) => log.empCode === empCode && log.date.startsWith(month)
  );
  const totalDays = logs.length;
  const onTime = logs.filter((log) => log.status === "ตรงเวลา").length;
  const attendanceRate = totalDays > 0 ? Math.min(100, (totalDays / 26) * 100) : 0;
  const punctualityRate = totalDays > 0 ? (onTime / totalDays) * 100 : 0;
  return {
    attendanceRate: Math.round(attendanceRate),
    punctualityRate: Math.round(punctualityRate),
  };
};

const generatePumpChampions = (): PumpChampion[] => {
  const pumpEmployees = employees.filter(
    (emp) => emp.dept === "ปั๊มน้ำมัน" || emp.category === "ปั๊ม" || emp.dept === "แม่บ้าน"
  );
  if (pumpEmployees.length === 0) return [];

  const champions: PumpChampion[] = [];

  pumpChampionMonths.forEach((month, monthIdx) => {
    const sampleSize = Math.min(4, pumpEmployees.length);
    for (let i = 0; i < sampleSize; i++) {
      const emp = pumpEmployees[(monthIdx * sampleSize + i) % pumpEmployees.length];
      const { attendanceRate, punctualityRate } = calculateAttendanceStats(emp.code, month);
      const auditScore = 80 + ((emp.id + monthIdx * 5 + i * 3) % 20);
      const totalScore = Math.round(attendanceRate * 0.3 + punctualityRate * 0.3 + auditScore * 0.4);

      champions.push({
        id: Number(`${emp.id}${monthIdx}${i}`),
        empCode: emp.code,
        empName: emp.name,
        dept: emp.dept,
        position: emp.position,
        avatar: emp.avatar,
        month,
        departmentHighlight: [
          emp.dept,
          emp.category ? `หมวด ${emp.category}` : "บริษัทย่อย PTT",
        ],
        auditNote: "ผ่านการประเมินจากคณะกรรมการพิเศษฝ่ายปั๊ม",
        attendanceRate,
        punctualityRate,
        auditScore,
        totalScore,
      });
    }
  });

  return champions;
};

const generateAuditAwards = (): AuditAward[] => {
  const months = ["2025-11", "2025-10", "2025-09", "2025-08"];

  return months.flatMap((month, monthIndex) =>
    awardCategories.map((category, catIndex) => {
      const pool = employees.filter(category.matcher);
      const fallback = employees.filter((emp) => emp.status === "Active");
      const candidatePool = pool.length > 0 ? pool : fallback;
      const emp = candidatePool[(monthIndex + catIndex * 2) % candidatePool.length];

      const auditScore = 80 + ((emp.id + monthIndex * 5 + catIndex * 3) % 20);
      const pttScore = 80 + ((emp.id + monthIndex * 4 + catIndex * 5) % 20);
      const totalScore = Math.round(auditScore * 0.6 + pttScore * 0.4);

      return {
        id: emp.id * 100 + monthIndex * 10 + catIndex,
        empCode: emp.code,
        empName: emp.name,
        dept: emp.dept,
        categoryKey: category.key,
        categoryLabel: category.label,
        month,
        auditScore,
        pttScore,
        totalScore,
        remarks:
          category.key === "frontline"
            ? "ให้บริการลูกค้าได้มาตรฐานและรักษาความปลอดภัย"
            : category.key === "housekeeping"
            ? "ดูแลความสะอาดและความเป็นระเบียบเรียบร้อยของปั๊ม"
            : "ดูแลงานเอกสารและระบบสนับสนุนรวดเร็วมีประสิทธิภาพ",
        avatar: emp.avatar,
      };
    })
  );
};

const pumpChampions = generatePumpChampions();
const auditAwards = generateAuditAwards();

export default function OutstandingEmployees() {
  const navigate = useNavigate();
  const auditSectionRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<"pump" | "audit">("pump");

  const [awardMonthFilter, setAwardMonthFilter] = useState("");
  const [awardCategoryFilter, setAwardCategoryFilter] = useState("");
  const [awardSearchQuery, setAwardSearchQuery] = useState("");
  const [activeChampionReward, setActiveChampionReward] = useState<string | null>(null);
  const [championRewards, setChampionRewards] = useState<
    Record<string, ChampionRewardFormState>
  >({});

  const awardMonths = useMemo(
    () => Array.from(new Set(auditAwards.map((award) => award.month))),
    []
  );

  const filteredAwards = useMemo(() => {
    return auditAwards.filter((award) => {
      if (awardMonthFilter && award.month !== awardMonthFilter) return false;
      if (awardCategoryFilter && award.categoryKey !== awardCategoryFilter) return false;
      if (awardSearchQuery) {
        const query = awardSearchQuery.toLowerCase();
        return (
          award.empName.toLowerCase().includes(query) ||
          award.empCode.toLowerCase().includes(query) ||
          award.dept.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [awardMonthFilter, awardCategoryFilter, awardSearchQuery]);

  const awardHistory = useMemo(
    () =>
      [...auditAwards]
        .sort((a, b) => (a.month > b.month ? -1 : 1))
        .slice(0, 6),
    []
  );

  const defaultNewAudit: NewAuditFormState = {
    month: pumpChampionMonths[0],
    categoryKey: awardCategories[0].key,
    empCode: "",
    empName: "",
    dept: "",
    auditScore: "",
    pttScore: "",
    remarks: "",
  };
  const [_newAudit, _setNewAudit] = useState<NewAuditFormState>(defaultNewAudit);

  const handleChampionRewardChange = (
    empCode: string,
    field: keyof ChampionRewardFormState,
    value: string
  ) => {
    setChampionRewards((prev) => ({
      ...prev,
      [empCode]: {
        rewardName: prev[empCode]?.rewardName || "",
        amount: prev[empCode]?.amount || "",
        note: prev[empCode]?.note || "",
        [field]: value,
      },
    }));
  };

  const handleChampionRewardSave = (champion: PumpChampion) => {
    const entry = championRewards[champion.empCode];

    if (!entry?.rewardName || !entry.amount) {
      alert("กรุณากรอกรายละเอียดรางวัลและจำนวนเงิน");
      return;
    }

    const amountNumber = Number(entry.amount);
    if (Number.isNaN(amountNumber)) {
      alert("จำนวนเงินต้องเป็นตัวเลข");
      return;
    }

    const summary = [
      `พนักงาน: ${champion.empName} (${champion.empCode})`,
      `เดือน: ${monthFormatter.format(new Date(champion.month + "-01"))}`,
      `รางวัล: ${entry.rewardName}`,
      `จำนวนเงิน: ${amountNumber.toLocaleString("th-TH")} บาท`,
      entry.note ? `หมายเหตุ: ${entry.note}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    alert(`บันทึกรางวัลพิเศษสำเร็จ\n\n${summary}\n\n(ข้อมูลยังไม่ถูกเพิ่มจริง เป็น mock)`);
    setActiveChampionReward(null);
  };

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
          <p className="text-muted mt-2">
            สรุปพนักงานดีเด่นจากทุกแผนกในปั๊ม พร้อมรางวัลประจำเดือนจากการประเมินของทีม Audit และ PTT
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setViewMode("audit")}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
              viewMode === "audit" ? "bg-ptt-blue text-app" : "bg-soft hover:bg-app/10 text-app"
            }`}
          >
            <Medal className="w-4 h-4" />
            ไปยังรางวัล Audit & PTT
          </button>
          <button
            onClick={() => setViewMode("pump")}
            className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
              viewMode === "pump" ? "bg-ptt-blue text-app" : "bg-soft hover:bg-app/10 text-app"
            }`}
          >
            <Trophy className="w-4 h-4" />
            ดูพนักงานดีเด่นปั๊ม
          </button>
          <button className="px-4 py-2 bg-soft hover:bg-app/10 text-app rounded-xl transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" />
            ส่งออก (PDF)
          </button>
          <button className="px-4 py-2 bg-soft hover:bg-app/10 text-app rounded-xl transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            ส่งออก (Excel)
          </button>
        </div>
      </motion.div>

      {/* Pump Champions */}
      {viewMode === "pump" && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2zl shadow-xl p-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-app font-display flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            พนักงานดีเด่นจากทุกแผนกในปั๊ม
          </h2>
          <p className="text-xs text-muted">ข้อมูลเก็บเป็นประวัติอ้างอิง</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pumpChampions.map((champion, index) => (
            <motion.div
              key={champion.empCode + champion.month}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-soft border border-app rounded-2xl p-5 hover:shadow-xl transition-all cursor-pointer"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("button[data-reward-button]")) {
                  return;
                }
                navigate(`/app/hr/employees/${champion.id}`);
              }}
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ptt-blue to-ptt-cyan p-1">
                    <div className="w-full h-full rounded-full bg-soft overflow-hidden">
                      {champion.avatar ? (
                        <img
                          src={champion.avatar}
                          alt={champion.empName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ptt-blue to-ptt-cyan text-app text-lg font-bold">
                          {champion.empName.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2">
                      <Crown className="w-6 h-6 text-yellow-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-app font-display">{champion.empName}</h3>
                      <p className="text-sm text-muted">
                        {champion.empCode} • {champion.position}
                      </p>
                      <p className="text-xs text-muted">{champion.dept}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-xl font-bold text-app">{champion.totalScore}</span>
                      </div>
                      <p className="text-xs text-muted">คะแนนรวม</p>
                      <button
                        type="button"
                        data-reward-button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveChampionReward((prev) =>
                            prev === champion.empCode ? null : champion.empCode
                          );
                        }}
                        className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-ptt-blue/10 text-ptt-blue text-xs font-semibold hover:bg-ptt-blue/20 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        บันทึกรางวัล
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        การมาทำงาน
                      </span>
                      <span className="text-app font-medium">{champion.attendanceRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        ตรงเวลา
                      </span>
                      <span className="text-app font-medium">{champion.punctualityRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Audit
                      </span>
                      <span className="text-app font-medium">{champion.auditScore} คะแนน</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        เดือน
                      </span>
                      <span className="text-app font-medium">
                        {monthFormatter.format(new Date(champion.month + "-01"))}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {champion.departmentHighlight.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-ptt-blue/20 text-ptt-cyan rounded text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {activeChampionReward === champion.empCode && (
                <div
                  className="mt-4 p-4 border border-dashed border-ptt-blue/40 rounded-2xl bg-ptt-blue/5 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-sm font-semibold text-app flex items-center gap-2">
                    <Award className="w-4 h-4 text-ptt-blue" />
                    บันทึกรางวัลพิเศษ
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="md:col-span-1">
                      <label className="text-xs text-muted mb-1 block">ชื่อรางวัล/เหตุผล</label>
                      <input
                        type="text"
                        value={championRewards[champion.empCode]?.rewardName || ""}
                        onChange={(e) =>
                          handleChampionRewardChange(champion.empCode, "rewardName", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-soft border border-app rounded-lg focus:outline-none focus:ring-2 focus:ring-ptt-blue/60"
                        placeholder="เช่น รางวัลยอดขายสูงสุด"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted mb-1 block">จำนวนเงิน (บาท)</label>
                      <input
                        type="number"
                        value={championRewards[champion.empCode]?.amount || ""}
                        onChange={(e) =>
                          handleChampionRewardChange(champion.empCode, "amount", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-soft border border-app rounded-lg focus:outline-none focus:ring-2 focus:ring-ptt-blue/60"
                        placeholder="เช่น 1,500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted mb-1 block">หมายเหตุเพิ่มเติม</label>
                      <input
                        type="text"
                        value={championRewards[champion.empCode]?.note || ""}
                        onChange={(e) =>
                          handleChampionRewardChange(champion.empCode, "note", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-soft border border-app rounded-lg focus:outline-none focus:ring-2 focus:ring-ptt-blue/60"
                        placeholder="(ถ้ามี)"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 text-xs font-semibold text-muted hover:text-app transition"
                      onClick={() => setActiveChampionReward(null)}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-ptt-cyan text-app rounded-xl text-sm font-semibold hover:bg-ptt-cyan/80 transition"
                      onClick={() => handleChampionRewardSave(champion)}
                    >
                      <Save className="w-4 h-4" />
                      บันทึกรางวัลนี้
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
      )}





      {/* Monthly Audit Awards */}
      {viewMode === "audit" && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl shadow-xl overflow-hidden"
        ref={auditSectionRef}
      >
        <div className="px-6 py-4 border-b border-app flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-app font-display flex items-center gap-2">
                <Medal className="w-5 h-5 text-ptt-cyan" />
                รางวัลประจำเดือน (ทีม Audit & PTT)
              </h3>
              <p className="text-xs text-muted">
                พิจารณาจากผลงานจริงและคะแนนประเมินของทีม Audit ร่วมกับคะแนนกลางของ ปตท.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัส หรือแผนก"
                value={awardSearchQuery}
                onChange={(e) => setAwardSearchQuery(e.target.value)}
                className="px-4 py-2 bg-soft border border-app rounded-xl text-app text-sm focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              />
              <select
                value={awardMonthFilter}
                onChange={(e) => setAwardMonthFilter(e.target.value)}
                className="px-4 py-2 bg-soft border border-app rounded-xl text-app text-sm focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              >
                <option value="">ทุกเดือน</option>
                {awardMonths.map((month) => (
                  <option key={month} value={month}>
                    {monthFormatter.format(new Date(month + "-01"))}
                  </option>
                ))}
              </select>
              <select
                value={awardCategoryFilter}
                onChange={(e) => setAwardCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-soft border border-app rounded-xl text-app text-sm focus:outline-none focus:ring-2 focus:ring-ptt-blue"
              >
                <option value="">ทุกประเภท</option>
                {awardCategories.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>



        <div className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredAwards.map((award, index) => (
              <motion.div
                key={`${award.empCode}-${award.month}-${award.categoryKey}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-soft border border-app rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-ptt-blue/20 to-ptt-cyan/20">
                      <Medal className="w-5 h-5 text-ptt-blue" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-app">{award.empName}</p>
                      <p className="text-xs text-muted">{award.empCode}</p>
                      <p className="text-xs text-muted">
                        {monthFormatter.format(new Date(award.month + "-01"))}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-muted">รวม</p>
                    <p className="text-2xl font-bold text-app">{award.totalScore}</p>
                    <p className="text-[10px] text-muted">คะแนน</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mt-4">
                  <div className="bg-ptt-blue/5 rounded-xl px-3 py-2">
                    <p className="text-[10px] uppercase text-muted">Audit Team</p>
                    <p className="text-lg font-semibold text-green-500">{award.auditScore}</p>
                  </div>
                  <div className="bg-ptt-cyan/5 rounded-xl px-3 py-2">
                    <p className="text-[10px] uppercase text-muted">PTT Score</p>
                    <p className="text-lg font-semibold text-blue-500">{award.pttScore}</p>
                  </div>
                  <div className="bg-soft/70 rounded-xl px-3 py-2 col-span-2 sm:col-span-2">
                    <p className="text-[10px] uppercase text-muted">แผนก</p>
                    <p className="text-sm font-medium text-app">{award.dept}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-ptt-blue/15 text-ptt-blue">
                    {award.categoryLabel}
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-app/10 text-app">
                    {monthFormatter.format(new Date(award.month + "-01"))}
                  </span>
                </div>

                {award.remarks && (
                  <div className="mt-4 flex items-start gap-2 text-xs text-muted bg-soft/70 border border-dashed border-app rounded-xl px-3 py-2">
                    <ClipboardList className="w-4 h-4 flex-shrink-0 text-ptt-cyan" />
                    <p>{award.remarks}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          {filteredAwards.length === 0 && (
            <div className="px-6 py-8 text-center text-muted border border-dashed border-app rounded-2xl">
              ไม่พบข้อมูลรางวัลตามเงื่อนไขที่เลือก
            </div>
          )}
        </div>
      </motion.div>
      )}

      {/* Award History */}
      {viewMode === "audit" && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-soft border border-app rounded-2xl shadow-xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-app font-display flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-orange-400" />
            ประวัติการมอบรางวัล
          </h3>
          <p className="text-xs text-muted">เก็บบันทึกรายการล่าสุด 6 รายการ</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {awardHistory.map((award) => (
            <div
              key={`history-${award.empCode}-${award.month}`}
              className="bg-soft/60 border border-app rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="p-2 bg-ptt-cyan/20 rounded-lg">
                <Calendar className="w-5 h-5 text-ptt-cyan" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-app">{award.empName}</p>
                <p className="text-xs text-muted">
                  {award.categoryLabel} • {award.dept}
                </p>
                <p className="text-xs text-muted">
                  {monthFormatter.format(new Date(award.month + "-01"))}
                </p>
              </div>
              <div className="text-right text-sm font-semibold text-app">
                {award.totalScore} คะแนน
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      )}
    </div>
  );
}
