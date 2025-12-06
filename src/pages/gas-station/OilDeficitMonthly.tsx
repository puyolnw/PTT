import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Droplet,
  Calendar,
  Download,
  ChevronDown,
  Building2,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

// ประเภทสาขา
type BranchType = "HISO" | "Dindam" | "NongChik" | "Taksila" | "Bypass";

// ชนิดน้ำมัน
type OilType = "HSP" | "95" | "E20" | "B7" | "91";

// ข้อมูลรายวันของน้ำมันขาดเกิน
type DailyDeficitRow = {
  date: number; // ว/ด/ป (วันที่)
  oilType: OilType;
  receive: number; // รับ (ลิตร) - ปริมาณน้ำมันที่รับเข้ามาเพิ่ม
  down: number; // ลง (ลิตร) - ปริมาณน้ำมันที่ลงถังเก็บ
  pay: number; // จ่าย (ลิตร) - ปริมาณน้ำมันที่ขายไป หรือจ่ายออก
  balance: number; // คงเหลือ (ลิตร) - ยอดคงเหลือทางบัญชี (คำนวณจาก: ยอดยกมา + รับ - จ่าย)
  measuredByMachine: number; // วัดได้/วัดโดย (เครื่อง) - ปริมาณน้ำมันที่วัดได้จริงจากระบบเครื่องวัดอัตโนมัติ (ATG)
  differenceMachine: number; // ส่วนต่าง (เครื่อง) - ผลต่างระหว่าง "ยอดคงเหลือทางบัญชี" เทียบกับ "วัดเครื่อง"
  measuredByHand: number; // วัดได้/วัดโดย (มือ) - ปริมาณน้ำมันที่วัดได้จริงจากการใช้ไม้วัดระดับ (Dipstick)
  differenceHand: number; // ส่วนต่าง (มือ) - ผลต่างระหว่าง "ยอดคงเหลือทางบัญชี" เทียบกับ "วัดมือ"
  notes: string; // หมายเหตุ / %หาย - แสดงตัวเลขเปอร์เซ็นต์ หรือค่าความคลาดเคลื่อน (Variance)
  previousBalance: number; // ยอดยกมา (สำหรับคำนวณคงเหลือ)
};

type MonthlySummary = {
  month: string;
  year: number;
  branch: BranchType;
  rows: DailyDeficitRow[];
  totalReceive: number;
  totalDown: number;
  totalPay: number;
  totalBalance: number;
  totalMeasuredByMachine: number;
  totalDifferenceMachine: number;
  totalMeasuredByHand: number;
  totalDifferenceHand: number;
};

// ชื่อเดือนภาษาไทย
const thaiMonths = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

// ฟังก์ชันแปลงปี พ.ศ. เป็น ค.ศ.
const getBuddhistYear = (date: Date): number => {
  return date.getFullYear() + 543;
};

// ชื่อภาษาไทยของแต่ละชนิดน้ำมัน
const getOilTypeLabel = (oilType: OilType): string => {
  const labels: Record<OilType, string> = {
    "HSP": "HSP (ดีเซล)",
    "95": "95",
    "E20": "E20",
    "B7": "B7",
    "91": "91",
  };
  return labels[oilType];
};

const getBranchLabel = (branch: BranchType): string => {
  const labels: Record<BranchType, string> = {
    HISO: "ไฮโซ",
    Dindam: "ดินดำ",
    NongChik: "หนองจิก",
    Taksila: "ตักสิลา",
    Bypass: "บายพาส",
  };
  return labels[branch];
};

const getBranchColorClasses = (branch: BranchType): { border: string; bg: string; icon: string } => {
  const colors: Record<BranchType, { border: string; bg: string; icon: string }> = {
    HISO: { border: "border-blue-500", bg: "bg-gradient-to-r from-blue-500 to-blue-600", icon: "text-blue-500" },
    Dindam: { border: "border-purple-500", bg: "bg-gradient-to-r from-purple-500 to-purple-600", icon: "text-purple-500" },
    NongChik: { border: "border-orange-500", bg: "bg-gradient-to-r from-orange-500 to-orange-600", icon: "text-orange-500" },
    Taksila: { border: "border-emerald-500", bg: "bg-gradient-to-r from-emerald-500 to-emerald-600", icon: "text-emerald-500" },
    Bypass: { border: "border-red-500", bg: "bg-gradient-to-r from-red-500 to-red-600", icon: "text-red-500" },
  };
  return colors[branch];
};

// Mock data - เก็บข้อมูลเป็น key-value โดยใช้ "year-month-branch" เป็น key
// สร้างข้อมูล mock up ที่แน่นอนและครบถ้วน
const generateMockData = (): Record<string, MonthlySummary> => {
  const data: Record<string, MonthlySummary> = {};
  const branches: BranchType[] = ["HISO", "Dindam", "NongChik", "Taksila", "Bypass"];
  const oilTypes: OilType[] = ["HSP", "95", "E20", "B7", "91"];

  // ใช้ seed เพื่อให้ข้อมูลสม่ำเสมอ
  let seed = 12345;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // สร้างข้อมูลสำหรับปี 2565 ถึง 2570
  for (let year = 2565; year <= 2570; year++) {
    branches.forEach((branch) => {
      for (let month = 0; month < 12; month++) {
        const key = `${year}-${month}-${branch}`;
        const rows: DailyDeficitRow[] = [];
        let previousBalance = 50000; // ยอดยกมาเริ่มต้น

        // สร้างข้อมูลรายวัน (10 วันแรกของเดือน)
        for (let day = 1; day <= 10; day++) {
          const oilType = oilTypes[day % oilTypes.length];
          const receive = Math.floor(random() * 50000) + 10000;
          const down = Math.floor(receive * (0.95 + random() * 0.05)); // ลงถังเก็บประมาณ 95-100% ของที่รับ
          const pay = Math.floor(random() * 40000) + 20000;
          const balance = previousBalance + receive - pay; // คงเหลือ = ยอดยกมา + รับ - จ่าย
          
          // วัดได้จากเครื่อง (ATG) - อาจมีความคลาดเคลื่อนเล็กน้อย
          const measuredByMachine = balance + (random() * 200 - 100);
          const differenceMachine = measuredByMachine - balance;
          
          // วัดได้จากมือ (Dipstick) - อาจมีความคลาดเคลื่อนมากกว่าเครื่อง
          const measuredByHand = balance + (random() * 300 - 150);
          const differenceHand = measuredByHand - balance;
          
          // คำนวณ %หาย (Variance)
          const variancePercent = balance > 0 ? ((differenceMachine / balance) * 100) : 0;
          const notes = variancePercent !== 0 
            ? `${variancePercent > 0 ? '+' : ''}${variancePercent.toFixed(2)}%`
            : "0%";

          rows.push({
            date: day,
            oilType,
            receive,
            down,
            pay,
            balance: Math.round(balance * 100) / 100,
            measuredByMachine: Math.round(measuredByMachine * 100) / 100,
            differenceMachine: Math.round(differenceMachine * 100) / 100,
            measuredByHand: Math.round(measuredByHand * 100) / 100,
            differenceHand: Math.round(differenceHand * 100) / 100,
            notes,
            previousBalance,
          });

          // อัพเดตยอดยกมาสำหรับวันถัดไป
          previousBalance = balance;
        }

        const totalReceive = rows.reduce((sum, r) => sum + r.receive, 0);
        const totalDown = rows.reduce((sum, r) => sum + r.down, 0);
        const totalPay = rows.reduce((sum, r) => sum + r.pay, 0);
        const totalBalance = rows[rows.length - 1]?.balance || 0;
        const totalMeasuredByMachine = rows.reduce((sum, r) => sum + r.measuredByMachine, 0);
        const totalDifferenceMachine = rows.reduce((sum, r) => sum + r.differenceMachine, 0);
        const totalMeasuredByHand = rows.reduce((sum, r) => sum + r.measuredByHand, 0);
        const totalDifferenceHand = rows.reduce((sum, r) => sum + r.differenceHand, 0);

        data[key] = {
          month: thaiMonths[month],
          year,
          branch,
          rows,
          totalReceive,
          totalDown,
          totalPay,
          totalBalance,
          totalMeasuredByMachine,
          totalDifferenceMachine,
          totalMeasuredByHand,
          totalDifferenceHand,
        };
      }
    });
  }

  return data;
};

export default function OilDeficitMonthly() {
  // ใช้เวลาปัจจุบันเป็นค่าเริ่มต้น
  const now = useMemo(() => new Date(), []);
  const currentBuddhistYear = getBuddhistYear(now);
  const currentMonth = now.getMonth();

  const [selectedYear, setSelectedYear] = useState(currentBuddhistYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedBranch, setSelectedBranch] = useState<BranchType>("HISO");
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  // สร้างข้อมูล mock up เมื่อ component mount
  const mockMonthlyDataMap = useMemo(() => generateMockData(), []);

  // สร้างรายการปี (5 ปีย้อนหลัง ถึง 2 ปีข้างหน้า)
  const availableYears = useMemo(() => {
    const years: number[] = [];
    for (let i = currentBuddhistYear - 5; i <= currentBuddhistYear + 2; i++) {
      years.push(i);
    }
    return years;
  }, [currentBuddhistYear]);

  // ดึงข้อมูลตามเดือน ปี และสาขาที่เลือก
  const dataKey = `${selectedYear}-${selectedMonth}-${selectedBranch}`;
  const currentData = mockMonthlyDataMap[dataKey] || {
    month: thaiMonths[selectedMonth],
    year: selectedYear,
    branch: selectedBranch,
    rows: [],
    totalReceive: 0,
    totalDown: 0,
    totalPay: 0,
    totalBalance: 0,
    totalMeasuredByMachine: 0,
    totalDifferenceMachine: 0,
    totalMeasuredByHand: 0,
    totalDifferenceHand: 0,
  };

  const getDifferenceColor = (value: number) => {
    if (value > 0) return "text-emerald-600 dark:text-emerald-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const branchColors = getBranchColorClasses(selectedBranch);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-500" />
          สมุดน้ำมันขาดเกินรายเดือน
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          รายงานสรุปยอดน้ำมันขาด/เกินประจำเดือน แยกตามสาขาและประเภทน้ำมัน
        </p>
      </motion.div>

      {/* Month, Year & Branch Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">เลือกเดือน ปี และสาขา:</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Year Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowMonthDropdown(false);
                  setShowBranchDropdown(false);
                }}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 min-w-[120px] justify-between"
              >
                <span>{selectedYear}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showYearDropdown ? "rotate-180" : ""}`} />
              </button>
              {showYearDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowYearDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto min-w-[120px]">
                    {availableYears.map((year) => (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedYear(year);
                          setShowYearDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          selectedYear === year
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Month Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMonthDropdown(!showMonthDropdown);
                  setShowYearDropdown(false);
                  setShowBranchDropdown(false);
                }}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 min-w-[150px] justify-between"
              >
                <span>{thaiMonths[selectedMonth]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showMonthDropdown ? "rotate-180" : ""}`} />
              </button>
              {showMonthDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMonthDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto min-w-[150px]">
                    {thaiMonths.map((month, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedMonth(index);
                          setShowMonthDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          selectedMonth === index
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Branch Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowBranchDropdown(!showBranchDropdown);
                  setShowYearDropdown(false);
                  setShowMonthDropdown(false);
                }}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 min-w-[150px] justify-between"
              >
                <span>{getBranchLabel(selectedBranch)}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showBranchDropdown ? "rotate-180" : ""}`} />
              </button>
              {showBranchDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowBranchDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto min-w-[150px]">
                    {(["HISO", "Dindam", "NongChik", "Taksila", "Bypass"] as BranchType[]).map((branch) => (
                      <button
                        key={branch}
                        onClick={() => {
                          setSelectedBranch(branch);
                          setShowBranchDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          selectedBranch === branch
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {getBranchLabel(branch)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => alert("ส่งออกข้อมูลเป็น Excel (ฟังก์ชันนี้จะเชื่อมต่อกับระบบจริง)")}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">ส่งออก</span>
          </button>
        </div>
      </motion.div>

      {/* Monthly Summary Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        {/* Month, Year & Branch Header */}
        <div className={`${branchColors.bg} p-6 text-white`}>
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">
                {getBranchLabel(selectedBranch)} - ประจำเดือน {currentData.month} {currentData.year}
              </h2>
              <p className="text-sm opacity-90">
                รายงานน้ำมันขาด/เกินรายเดือน
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60">
                <th className="text-center py-3 px-3 font-bold text-gray-700 dark:text-gray-300 border-r-2 border-gray-400 dark:border-gray-500">
                  ว/ด/ป
                </th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 dark:text-gray-300 border-r-2 border-gray-400 dark:border-gray-500">
                  ชนิด
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300 border-r-2 border-gray-400 dark:border-gray-500">
                  รับ
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300 border-r-2 border-gray-400 dark:border-gray-500">
                  ลง (ลิตร)
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300 border-r-2 border-gray-400 dark:border-gray-500">
                  จ่าย
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300 border-r-2 border-gray-400 dark:border-gray-500">
                  คงเหลือ
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300 border-r-2 border-gray-400 dark:border-gray-500">
                  วัดได้/วัดโดย (เครื่อง)
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300 border-r-2 border-gray-400 dark:border-gray-500">
                  ส่วนต่าง (เครื่อง)
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300 border-r-2 border-gray-400 dark:border-gray-500">
                  วัดได้/วัดโดย (มือ)
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300 border-r-2 border-gray-400 dark:border-gray-500">
                  ส่วนต่าง (มือ)
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300">
                  หมายเหตุ / %หาย
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center">
                    <Droplet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">ไม่พบข้อมูลสำหรับเดือนที่เลือก</p>
                  </td>
                </tr>
              ) : (
                currentData.rows.map((row, index) => (
                  <motion.tr
                    key={`${row.date}-${row.oilType}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="text-center py-3 px-3 text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                      {row.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                      {getOilTypeLabel(row.oilType)}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                      {row.receive > 0 ? numberFormatter.format(row.receive) : "-"}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                      {row.down > 0 ? numberFormatter.format(row.down) : "-"}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                      {numberFormatter.format(row.pay)}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                      {numberFormatter.format(row.balance)}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                      {numberFormatter.format(row.measuredByMachine)}
                    </td>
                    <td className={`text-right py-3 px-4 font-semibold border-r-2 border-gray-400 dark:border-gray-500 ${getDifferenceColor(
                      row.differenceMachine
                    )}`}>
                      {row.differenceMachine > 0 ? "+" : ""}
                      {numberFormatter.format(row.differenceMachine)}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                      {numberFormatter.format(row.measuredByHand)}
                    </td>
                    <td className={`text-right py-3 px-4 font-semibold border-r-2 border-gray-400 dark:border-gray-500 ${getDifferenceColor(
                      row.differenceHand
                    )}`}>
                      {row.differenceHand > 0 ? "+" : ""}
                      {numberFormatter.format(row.differenceHand)}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-800 dark:text-white">
                      <span className={`font-semibold ${
                        row.notes.includes('-') ? 'text-red-600 dark:text-red-400' : 
                        row.notes.includes('+') ? 'text-emerald-600 dark:text-emerald-400' : 
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {row.notes}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
            {/* Footer Summary */}
            {currentData.rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-red-500 dark:border-red-400 bg-gray-50 dark:bg-gray-900/60">
                  <td colSpan={2} className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                    รวม
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                    {numberFormatter.format(currentData.totalReceive)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                    {numberFormatter.format(currentData.totalDown)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                    {numberFormatter.format(currentData.totalPay)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                    {numberFormatter.format(currentData.totalBalance)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                    {numberFormatter.format(currentData.totalMeasuredByMachine)}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold border-r-2 border-gray-400 dark:border-gray-500 ${getDifferenceColor(
                    currentData.totalDifferenceMachine
                  )}`}>
                    {currentData.totalDifferenceMachine > 0 ? "+" : ""}
                    {numberFormatter.format(currentData.totalDifferenceMachine)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                    {numberFormatter.format(currentData.totalMeasuredByHand)}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold border-r-2 border-gray-400 dark:border-gray-500 ${getDifferenceColor(
                    currentData.totalDifferenceHand
                  )}`}>
                    {currentData.totalDifferenceHand > 0 ? "+" : ""}
                    {numberFormatter.format(currentData.totalDifferenceHand)}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                    -
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">รับรวม</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {numberFormatter.format(currentData.totalReceive)} ลิตร
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">ลงรวม</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {numberFormatter.format(currentData.totalDown)} ลิตร
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">จ่ายรวม</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {numberFormatter.format(currentData.totalPay)} ลิตร
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 ${
            currentData.totalDifferenceMachine < 0 ? "border-l-4 border-red-500" : "border-l-4 border-emerald-500"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">ส่วนต่าง (เครื่อง) รวม</p>
              <p className={`text-lg font-bold ${getDifferenceColor(currentData.totalDifferenceMachine)}`}>
                {currentData.totalDifferenceMachine > 0 ? "+" : ""}
                {numberFormatter.format(currentData.totalDifferenceMachine)} ลิตร
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

