import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Filter,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// ประเภทการแสดงผล
type ViewMode = "day" | "month" | "half-year" | "year";

// ข้อมูลรายงาน
interface ReportData {
  date: string; // YYYY-MM-DD หรือ YYYY-MM หรือ YYYY
  salesHISO: number; // ขาย ไฮโซ (เงิน)
  salesDindam: number; // น้ำมัน ดินดำ (เงิน)
  nongChik: number; // หนองจิก (เงิน)
  taksila: number; // ตักสิลา (เงิน)
  bypass: number; // บายพาส (เงิน)
  surplusHISO: number; // ยอด ไฮโซ (ลิตร)
  surplusDindam: number; // ยอด น้ำมัน ดินดำ (ลิตร)
  deficitNongChik: number; // ขาด หนองจิก (ลิตร)
  deficitTaksila: number; // ขาด ตักสิลา (ลิตร)
  deficitBypass: number; // ขาด บายพาส (ลิตร)
}

// Mock data - ข้อมูลรายเดือนปี 2567
const generateMonthlyData2567 = (): ReportData[] => {
  const months = [
    { month: 1, salesHISO: 424516.95, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 831.15, surplusDindam: 0, deficitNongChik: 1659.10, deficitTaksila: 0, deficitBypass: 0 },
    { month: 2, salesHISO: 445230.50, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 892.30, surplusDindam: 0, deficitNongChik: 1784.60, deficitTaksila: 0, deficitBypass: 0 },
    { month: 3, salesHISO: 432150.25, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 764.45, surplusDindam: 0, deficitNongChik: 1528.90, deficitTaksila: 0, deficitBypass: 0 },
    { month: 4, salesHISO: 456780.80, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 913.56, surplusDindam: 0, deficitNongChik: 1827.12, deficitTaksila: 0, deficitBypass: 0 },
    { month: 5, salesHISO: 438920.40, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 877.84, surplusDindam: 0, deficitNongChik: 1755.68, deficitTaksila: 0, deficitBypass: 0 },
    { month: 6, salesHISO: 438693.35, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 877.39, surplusDindam: 0, deficitNongChik: 1754.78, deficitTaksila: 0, deficitBypass: 0 },
    { month: 7, salesHISO: 442150.20, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 884.30, surplusDindam: 0, deficitNongChik: 1768.60, deficitTaksila: 0, deficitBypass: 0 },
    { month: 8, salesHISO: 448920.60, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 897.84, surplusDindam: 0, deficitNongChik: 1795.68, deficitTaksila: 0, deficitBypass: 0 },
    { month: 9, salesHISO: 435680.30, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 871.36, surplusDindam: 0, deficitNongChik: 1742.72, deficitTaksila: 0, deficitBypass: 0 },
    { month: 10, salesHISO: 452340.75, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 904.68, surplusDindam: 0, deficitNongChik: 1809.36, deficitTaksila: 0, deficitBypass: 0 },
    { month: 11, salesHISO: 446780.50, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 893.56, surplusDindam: 0, deficitNongChik: 1787.12, deficitTaksila: 0, deficitBypass: 0 },
    { month: 12, salesHISO: 460230.25, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 920.46, surplusDindam: 0, deficitNongChik: 1840.92, deficitTaksila: 0, deficitBypass: 0 },
  ];

  return months.map(m => ({
    date: `2567-${String(m.month).padStart(2, '0')}`,
    salesHISO: m.salesHISO,
    salesDindam: m.salesDindam,
    nongChik: m.nongChik,
    taksila: m.taksila,
    bypass: m.bypass,
    surplusHISO: m.surplusHISO,
    surplusDindam: m.surplusDindam,
    deficitNongChik: m.deficitNongChik,
    deficitTaksila: m.deficitTaksila,
    deficitBypass: m.deficitBypass,
  }));
};

// Mock data - ข้อมูลรายเดือนปี 2566
const generateMonthlyData2566 = (): ReportData[] => {
  const months = [
    { month: 1, salesHISO: 554964.01, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 0, surplusDindam: 0, deficitNongChik: 0, deficitTaksila: 0, deficitBypass: 0 },
    { month: 2, salesHISO: 512340.50, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 0, surplusDindam: 0, deficitNongChik: 0, deficitTaksila: 0, deficitBypass: 0 },
    { month: 3, salesHISO: 528150.25, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 0, surplusDindam: 0, deficitNongChik: 0, deficitTaksila: 0, deficitBypass: 0 },
    { month: 4, salesHISO: 545680.80, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 0, surplusDindam: 0, deficitNongChik: 0, deficitTaksila: 0, deficitBypass: 0 },
    { month: 5, salesHISO: 538920.40, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 0, surplusDindam: 0, deficitNongChik: 0, deficitTaksila: 0, deficitBypass: 0 },
    { month: 6, salesHISO: 499616.83, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 0, surplusDindam: 0, deficitNongChik: 0, deficitTaksila: 0, deficitBypass: 0 },
    { month: 7, salesHISO: 512340.50, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 0, surplusDindam: 0, deficitNongChik: 0, deficitTaksila: 0, deficitBypass: 0 },
    { month: 8, salesHISO: 528150.25, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 0, surplusDindam: 0, deficitNongChik: 0, deficitTaksila: 0, deficitBypass: 0 },
    { month: 9, salesHISO: 515680.80, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 0, surplusDindam: 0, deficitNongChik: 0, deficitTaksila: 0, deficitBypass: 0 },
    { month: 10, salesHISO: 538920.40, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 0, surplusDindam: 0, deficitNongChik: 0, deficitTaksila: 0, deficitBypass: 0 },
    { month: 11, salesHISO: 512340.50, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 0, surplusDindam: 0, deficitNongChik: 0, deficitTaksila: 0, deficitBypass: 0 },
    { month: 12, salesHISO: 528150.25, salesDindam: 0, nongChik: 0, taksila: 0, bypass: 0, surplusHISO: 0, surplusDindam: 0, deficitNongChik: 0, deficitTaksila: 0, deficitBypass: 0 },
  ];

  return months.map(m => ({
    date: `2566-${String(m.month).padStart(2, '0')}`,
    salesHISO: m.salesHISO,
    salesDindam: m.salesDindam,
    nongChik: m.nongChik,
    taksila: m.taksila,
    bypass: m.bypass,
    surplusHISO: m.surplusHISO,
    surplusDindam: m.surplusDindam,
    deficitNongChik: m.deficitNongChik,
    deficitTaksila: m.deficitTaksila,
    deficitBypass: m.deficitBypass,
  }));
};

const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

// แปลงปี ค.ศ. เป็น พ.ศ.
const getBuddhistYear = (christianYear: number): number => {
  return christianYear + 543;
};

export default function OilDeficitReport() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedYear, setSelectedYear] = useState<number>(2567);
  const [selectedMonth] = useState<number>(() => {
    const now = new Date();
    return now.getMonth() + 1;
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [selectedHalfYear, setSelectedHalfYear] = useState<"1" | "2">("1");

  // Mock data
  const monthlyData2566 = generateMonthlyData2566();
  const monthlyData2567 = generateMonthlyData2567();

  // คำนวณข้อมูลตาม viewMode
  const processedData = useMemo(() => {
    if (viewMode === "day") {
      // ข้อมูลรายวัน - สร้าง mock data สำหรับวันที่เลือก
      const date = new Date(selectedDate);
      const month = date.getMonth() + 1;
      const year = getBuddhistYear(date.getFullYear());
      const monthlyData = year === 2567 ? monthlyData2567 : monthlyData2566;
      const monthData = monthlyData.find(d => d.date === `${year}-${String(month).padStart(2, '0')}`);
      
      if (!monthData) return [];
      
      // สร้างข้อมูลรายวัน (30 วัน)
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const factor = 1 / daysInMonth; // แบ่งข้อมูลรายเดือนเป็นรายวัน
        return {
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          salesHISO: monthData.salesHISO * factor,
          salesDindam: monthData.salesDindam * factor,
          nongChik: monthData.nongChik * factor,
          taksila: monthData.taksila * factor,
          bypass: monthData.bypass * factor,
          surplusHISO: monthData.surplusHISO * factor,
          surplusDindam: monthData.surplusDindam * factor,
          deficitNongChik: monthData.deficitNongChik * factor,
          deficitTaksila: monthData.deficitTaksila * factor,
          deficitBypass: monthData.deficitBypass * factor,
        };
      });
    } else if (viewMode === "month") {
      // ข้อมูลรายเดือน
      if (selectedYear === 2567) {
        return monthlyData2567;
      } else if (selectedYear === 2566) {
        return monthlyData2566;
      }
      return [];
    } else if (viewMode === "half-year") {
      // ข้อมูลครึ่งปี
      const monthlyData = selectedYear === 2567 ? monthlyData2567 : monthlyData2566;
      const months = selectedHalfYear === "1" 
        ? monthlyData.slice(0, 6) 
        : monthlyData.slice(6, 12);
      
      // รวมข้อมูลครึ่งปี
      return [{
        date: `${selectedYear}-H${selectedHalfYear}`,
        salesHISO: months.reduce((sum, m) => sum + m.salesHISO, 0),
        salesDindam: months.reduce((sum, m) => sum + m.salesDindam, 0),
        nongChik: months.reduce((sum, m) => sum + m.nongChik, 0),
        taksila: months.reduce((sum, m) => sum + m.taksila, 0),
        bypass: months.reduce((sum, m) => sum + m.bypass, 0),
        surplusHISO: months.reduce((sum, m) => sum + m.surplusHISO, 0),
        surplusDindam: months.reduce((sum, m) => sum + m.surplusDindam, 0),
        deficitNongChik: months.reduce((sum, m) => sum + m.deficitNongChik, 0),
        deficitTaksila: months.reduce((sum, m) => sum + m.deficitTaksila, 0),
        deficitBypass: months.reduce((sum, m) => sum + m.deficitBypass, 0),
      }];
    } else {
      // ข้อมูลรายปี
      const monthlyData = selectedYear === 2567 ? monthlyData2567 : monthlyData2566;
      return [{
        date: `${selectedYear}`,
        salesHISO: monthlyData.reduce((sum, m) => sum + m.salesHISO, 0),
        salesDindam: monthlyData.reduce((sum, m) => sum + m.salesDindam, 0),
        nongChik: monthlyData.reduce((sum, m) => sum + m.nongChik, 0),
        taksila: monthlyData.reduce((sum, m) => sum + m.taksila, 0),
        bypass: monthlyData.reduce((sum, m) => sum + m.bypass, 0),
        surplusHISO: monthlyData.reduce((sum, m) => sum + m.surplusHISO, 0),
        surplusDindam: monthlyData.reduce((sum, m) => sum + m.surplusDindam, 0),
        deficitNongChik: monthlyData.reduce((sum, m) => sum + m.deficitNongChik, 0),
        deficitTaksila: monthlyData.reduce((sum, m) => sum + m.deficitTaksila, 0),
        deficitBypass: monthlyData.reduce((sum, m) => sum + m.deficitBypass, 0),
      }];
    }
  }, [viewMode, selectedYear, selectedMonth, selectedDate, selectedHalfYear, monthlyData2566, monthlyData2567]);

  // คำนวณยอดรวม (reserved for future use)
  // const totals = useMemo(() => {
  //   return processedData.reduce((acc, data) => ({
  //     salesHISO: acc.salesHISO + data.salesHISO,
  //     salesDindam: acc.salesDindam + data.salesDindam,
  //     nongChik: acc.nongChik + data.nongChik,
  //     taksila: acc.taksila + data.taksila,
  //     bypass: acc.bypass + data.bypass,
  //     surplusHISO: acc.surplusHISO + data.surplusHISO,
  //     surplusDindam: acc.surplusDindam + data.surplusDindam,
  //     deficitNongChik: acc.deficitNongChik + data.deficitNongChik,
  //     deficitTaksila: acc.deficitTaksila + data.deficitTaksila,
  //     deficitBypass: acc.deficitBypass + data.deficitBypass,
  //   }), {
  //     salesHISO: 0,
  //     salesDindam: 0,
  //     nongChik: 0,
  //     taksila: 0,
  //     bypass: 0,
  //     surplusHISO: 0,
  //     surplusDindam: 0,
  //     deficitNongChik: 0,
  //     deficitTaksila: 0,
  //     deficitBypass: 0,
  //   });
  // }, [processedData]);

  // สร้างคอลัมน์สำหรับแสดงผล
  const getColumns = () => {
    if (viewMode === "day") {
      const daysInMonth = processedData.length;
      return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    } else if (viewMode === "month") {
      return thaiMonths;
    } else if (viewMode === "half-year") {
      return ["รวมครึ่งปี"];
    } else {
      return ["รวมทั้งปี"];
    }
  };

  // แสดงข้อมูลในแต่ละคอลัมน์ (reserved for future use)
  // const getCellValue = (data: ReportData, columnIndex: number, field: keyof ReportData): number => {
  //   if (viewMode === "day") {
  //     return data[field] as number;
  //   } else if (viewMode === "month") {
  //     const monthIndex = parseInt(data.date.split('-')[1]) - 1;
  //     if (monthIndex === columnIndex) {
  //       return data[field] as number;
  //     }
  //     return 0;
  //   } else {
  //     return data[field] as number;
  //   }
  // };

  // Export to Excel
  const handleExport = () => {
    // Mock export function
    alert("ส่งออกข้อมูลเป็น Excel (ฟังก์ชันนี้จะเชื่อมต่อกับระบบจริง)");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 font-display">
          รายงานยอดขาดน้ำมัน
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          รายงานน้ำมันประจำปี - แสดงข้อมูลการขายและยอดขาด/เกิน
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-wrap gap-4 items-end"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">รูปแบบการแสดง:</label>
        </div>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as ViewMode)}
          className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
        >
          <option value="day">รายวัน</option>
          <option value="month">รายเดือน</option>
          <option value="half-year">ครึ่งปี</option>
          <option value="year">รายปี</option>
        </select>

        {viewMode === "day" && (
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">เลือกวันที่</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
            />
          </div>
        )}

        {viewMode === "month" && (
          <>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">เลือกปี</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
              >
                <option value={2567}>2567</option>
                <option value={2566}>2566</option>
              </select>
            </div>
          </>
        )}

        {viewMode === "half-year" && (
          <>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">เลือกปี</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
              >
                <option value={2567}>2567</option>
                <option value={2566}>2566</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">ครึ่งปี</label>
              <select
                value={selectedHalfYear}
                onChange={(e) => setSelectedHalfYear(e.target.value as "1" | "2")}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
              >
                <option value="1">ครึ่งปีแรก (ม.ค. - มิ.ย.)</option>
                <option value="2">ครึ่งปีหลัง (ก.ค. - ธ.ค.)</option>
              </select>
            </div>
          </>
        )}

        {viewMode === "year" && (
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">เลือกปี</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
            >
              <option value={2567}>2567</option>
              <option value={2566}>2566</option>
            </select>
          </div>
        )}

        <div className="flex-1"></div>
        <button
          onClick={handleExport}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          ส่งออก Excel
        </button>
      </motion.div>

      {/* Report Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {viewMode === "month" ? "รายงานน้ำมันประจำปี 2567" : `รายงานน้ำมันประจำปี ${selectedYear}`}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 sticky left-0 z-10">
                  รายการ
                </th>
                {getColumns().map((col, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 min-w-[120px]"
                  >
                    {typeof col === "number" ? `วันที่ ${col}` : col}
                  </th>
                ))}
                {viewMode === "month" && (
                  <>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/30 min-w-[120px]">
                      รวมครึ่งปี
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/30 min-w-[120px]">
                      รวมครึ่งปี
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/30 min-w-[120px]">
                      รวมทั้งปี
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* Section: ปี 2566 - ข้อมูลการขาย */}
              <tr className="bg-gray-100 dark:bg-gray-900/50">
                <td colSpan={getColumns().length + (viewMode === "month" ? 3 : 0) + 1} className="px-4 py-2 text-sm font-bold text-gray-800 dark:text-white">
                  ปี 2566
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  ขาย ไฮโซ
                </td>
                {getColumns().map((_col, idx) => {
                  const monthData = monthlyData2566[idx];
                  return (
                    <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                      {monthData ? currencyFormatter.format(monthData.salesHISO) : "-"}
                    </td>
                  );
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2566.slice(0, 6).reduce((sum, m) => sum + m.salesHISO, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2566.slice(6, 12).reduce((sum, m) => sum + m.salesHISO, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {currencyFormatter.format(monthlyData2566.reduce((sum, m) => sum + m.salesHISO, 0))}
                    </td>
                  </>
                )}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  น้ำมัน ดินดำ
                </td>
                {getColumns().map((_col, idx) => {
                  const monthData = monthlyData2566[idx];
                  return (
                    <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                      {monthData ? currencyFormatter.format(monthData.salesDindam) : "-"}
                    </td>
                  );
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2566.slice(0, 6).reduce((sum, m) => sum + m.salesDindam, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2566.slice(6, 12).reduce((sum, m) => sum + m.salesDindam, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {currencyFormatter.format(monthlyData2566.reduce((sum, m) => sum + m.salesDindam, 0))}
                    </td>
                  </>
                )}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  หนองจิก
                </td>
                {getColumns().map((_col, idx) => {
                  const monthData = monthlyData2566[idx];
                  return (
                    <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                      {monthData ? currencyFormatter.format(monthData.nongChik) : "-"}
                    </td>
                  );
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2566.slice(0, 6).reduce((sum, m) => sum + m.nongChik, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2566.slice(6, 12).reduce((sum, m) => sum + m.nongChik, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {currencyFormatter.format(monthlyData2566.reduce((sum, m) => sum + m.nongChik, 0))}
                    </td>
                  </>
                )}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  ตักสิลา
                </td>
                {getColumns().map((_col, idx) => {
                  const monthData = monthlyData2566[idx];
                  return (
                    <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                      {monthData ? currencyFormatter.format(monthData.taksila) : "-"}
                    </td>
                  );
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2566.slice(0, 6).reduce((sum, m) => sum + m.taksila, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2566.slice(6, 12).reduce((sum, m) => sum + m.taksila, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {currencyFormatter.format(monthlyData2566.reduce((sum, m) => sum + m.taksila, 0))}
                    </td>
                  </>
                )}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  บายพาส
                </td>
                {getColumns().map((_col, idx) => {
                  const monthData = monthlyData2566[idx];
                  return (
                    <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                      {monthData ? currencyFormatter.format(monthData.bypass) : "-"}
                    </td>
                  );
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2566.slice(0, 6).reduce((sum, m) => sum + m.bypass, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2566.slice(6, 12).reduce((sum, m) => sum + m.bypass, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {currencyFormatter.format(monthlyData2566.reduce((sum, m) => sum + m.bypass, 0))}
                    </td>
                  </>
                )}
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900/30">
                <td className="px-4 py-3 text-sm font-bold text-gray-800 dark:text-white sticky left-0 bg-gray-50 dark:bg-gray-900/30 z-10">
                  รวม (ปี 2566)
                </td>
                {getColumns().map((_col, idx) => {
                  const monthData = monthlyData2566[idx];
                  const total = monthData ? monthData.salesHISO + monthData.salesDindam + monthData.nongChik + monthData.taksila + monthData.bypass : 0;
                  return (
                    <td key={idx} className="px-4 py-3 text-sm text-right font-bold text-gray-800 dark:text-white">
                      {total > 0 ? currencyFormatter.format(total) : "-"}
                    </td>
                  );
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(
                        monthlyData2566.slice(0, 6).reduce((sum, m) => sum + m.salesHISO + m.salesDindam + m.nongChik + m.taksila + m.bypass, 0)
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(
                        monthlyData2566.slice(6, 12).reduce((sum, m) => sum + m.salesHISO + m.salesDindam + m.nongChik + m.taksila + m.bypass, 0)
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {currencyFormatter.format(
                        monthlyData2566.reduce((sum, m) => sum + m.salesHISO + m.salesDindam + m.nongChik + m.taksila + m.bypass, 0)
                      )}
                    </td>
                  </>
                )}
              </tr>

              {/* Section: ปี 2567 - ข้อมูลการขาย */}
              <tr className="bg-gray-100 dark:bg-gray-900/50">
                <td colSpan={getColumns().length + (viewMode === "month" ? 3 : 0) + 1} className="px-4 py-2 text-sm font-bold text-gray-800 dark:text-white">
                  ปี 2567
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  ขาย ไฮโซ
                </td>
                {getColumns().map((_col, idx) => {
                  if (viewMode === "day") {
                    const dayData = processedData[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {dayData ? currencyFormatter.format(dayData.salesHISO) : "-"}
                      </td>
                    );
                  } else if (viewMode === "month") {
                    const monthData = monthlyData2567[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {monthData ? currencyFormatter.format(monthData.salesHISO) : "-"}
                      </td>
                    );
                  } else {
                    const data = processedData[0];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {data ? currencyFormatter.format(data.salesHISO) : "-"}
                      </td>
                    );
                  }
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2567.slice(0, 6).reduce((sum, m) => sum + m.salesHISO, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2567.slice(6, 12).reduce((sum, m) => sum + m.salesHISO, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {currencyFormatter.format(monthlyData2567.reduce((sum, m) => sum + m.salesHISO, 0))}
                    </td>
                  </>
                )}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  น้ำมัน ดินดำ
                </td>
                {getColumns().map((_col, idx) => {
                  if (viewMode === "day") {
                    const dayData = processedData[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {dayData ? currencyFormatter.format(dayData.salesDindam) : "-"}
                      </td>
                    );
                  } else if (viewMode === "month") {
                    const monthData = monthlyData2567[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {monthData ? currencyFormatter.format(monthData.salesDindam) : "-"}
                      </td>
                    );
                  } else {
                    const data = processedData[0];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {data ? currencyFormatter.format(data.salesDindam) : "-"}
                      </td>
                    );
                  }
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2567.slice(0, 6).reduce((sum, m) => sum + m.salesDindam, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2567.slice(6, 12).reduce((sum, m) => sum + m.salesDindam, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {currencyFormatter.format(monthlyData2567.reduce((sum, m) => sum + m.salesDindam, 0))}
                    </td>
                  </>
                )}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  หนองจิก
                </td>
                {getColumns().map((_col, idx) => {
                  if (viewMode === "day") {
                    const dayData = processedData[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {dayData ? currencyFormatter.format(dayData.nongChik) : "-"}
                      </td>
                    );
                  } else if (viewMode === "month") {
                    const monthData = monthlyData2567[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {monthData ? currencyFormatter.format(monthData.nongChik) : "-"}
                      </td>
                    );
                  } else {
                    const data = processedData[0];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {data ? currencyFormatter.format(data.nongChik) : "-"}
                      </td>
                    );
                  }
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2567.slice(0, 6).reduce((sum, m) => sum + m.nongChik, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2567.slice(6, 12).reduce((sum, m) => sum + m.nongChik, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {currencyFormatter.format(monthlyData2567.reduce((sum, m) => sum + m.nongChik, 0))}
                    </td>
                  </>
                )}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  ตักสิลา
                </td>
                {getColumns().map((_col, idx) => {
                  if (viewMode === "day") {
                    const dayData = processedData[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {dayData ? currencyFormatter.format(dayData.taksila) : "-"}
                      </td>
                    );
                  } else if (viewMode === "month") {
                    const monthData = monthlyData2567[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {monthData ? currencyFormatter.format(monthData.taksila) : "-"}
                      </td>
                    );
                  } else {
                    const data = processedData[0];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {data ? currencyFormatter.format(data.taksila) : "-"}
                      </td>
                    );
                  }
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2567.slice(0, 6).reduce((sum, m) => sum + m.taksila, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2567.slice(6, 12).reduce((sum, m) => sum + m.taksila, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {currencyFormatter.format(monthlyData2567.reduce((sum, m) => sum + m.taksila, 0))}
                    </td>
                  </>
                )}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  บายพาส
                </td>
                {getColumns().map((_col, idx) => {
                  if (viewMode === "day") {
                    const dayData = processedData[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {dayData ? currencyFormatter.format(dayData.bypass) : "-"}
                      </td>
                    );
                  } else if (viewMode === "month") {
                    const monthData = monthlyData2567[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {monthData ? currencyFormatter.format(monthData.bypass) : "-"}
                      </td>
                    );
                  } else {
                    const data = processedData[0];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                        {data ? currencyFormatter.format(data.bypass) : "-"}
                      </td>
                    );
                  }
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2567.slice(0, 6).reduce((sum, m) => sum + m.bypass, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(monthlyData2567.slice(6, 12).reduce((sum, m) => sum + m.bypass, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {currencyFormatter.format(monthlyData2567.reduce((sum, m) => sum + m.bypass, 0))}
                    </td>
                  </>
                )}
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900/30">
                <td className="px-4 py-3 text-sm font-bold text-gray-800 dark:text-white sticky left-0 bg-gray-50 dark:bg-gray-900/30 z-10">
                  รวม (ปี 2567)
                </td>
                {getColumns().map((_col, idx) => {
                  if (viewMode === "day") {
                    const dayData = processedData[idx];
                    const total = dayData ? dayData.salesHISO + dayData.salesDindam + dayData.nongChik + dayData.taksila + dayData.bypass : 0;
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right font-bold text-gray-800 dark:text-white">
                        {total > 0 ? currencyFormatter.format(total) : "-"}
                      </td>
                    );
                  } else if (viewMode === "month") {
                    const monthData = monthlyData2567[idx];
                    const total = monthData ? monthData.salesHISO + monthData.salesDindam + monthData.nongChik + monthData.taksila + monthData.bypass : 0;
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right font-bold text-gray-800 dark:text-white">
                        {total > 0 ? currencyFormatter.format(total) : "-"}
                      </td>
                    );
                  } else {
                    const data = processedData[0];
                    const total = data ? data.salesHISO + data.salesDindam + data.nongChik + data.taksila + data.bypass : 0;
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right font-bold text-gray-800 dark:text-white">
                        {total > 0 ? currencyFormatter.format(total) : "-"}
                      </td>
                    );
                  }
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(
                        monthlyData2567.slice(0, 6).reduce((sum, m) => sum + m.salesHISO + m.salesDindam + m.nongChik + m.taksila + m.bypass, 0)
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {currencyFormatter.format(
                        monthlyData2567.slice(6, 12).reduce((sum, m) => sum + m.salesHISO + m.salesDindam + m.nongChik + m.taksila + m.bypass, 0)
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {currencyFormatter.format(
                        monthlyData2567.reduce((sum, m) => sum + m.salesHISO + m.salesDindam + m.nongChik + m.taksila + m.bypass, 0)
                      )}
                    </td>
                  </>
                )}
              </tr>

              {/* Section: ยอดขาด/เกิน (ลิตร) - ปี 2567 */}
              <tr className="bg-yellow-50 dark:bg-yellow-900/20">
                <td colSpan={getColumns().length + (viewMode === "month" ? 3 : 0) + 1} className="px-4 py-2 text-sm font-bold text-gray-800 dark:text-white">
                  ยอด (ลิตร)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  ยอด ไฮโซ
                </td>
                {getColumns().map((_col, idx) => {
                  if (viewMode === "day") {
                    const dayData = processedData[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                        {dayData ? numberFormatter.format(dayData.surplusHISO) : "-"}
                      </td>
                    );
                  } else if (viewMode === "month") {
                    const monthData = monthlyData2567[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                        {monthData ? numberFormatter.format(monthData.surplusHISO) : "-"}
                      </td>
                    );
                  } else {
                    const data = processedData[0];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                        {data ? numberFormatter.format(data.surplusHISO) : "-"}
                      </td>
                    );
                  }
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {numberFormatter.format(monthlyData2567.slice(0, 6).reduce((sum, m) => sum + m.surplusHISO, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {numberFormatter.format(monthlyData2567.slice(6, 12).reduce((sum, m) => sum + m.surplusHISO, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {numberFormatter.format(monthlyData2567.reduce((sum, m) => sum + m.surplusHISO, 0))}
                    </td>
                  </>
                )}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  ยอด น้ำมัน ดินดำ
                </td>
                {getColumns().map((_col, idx) => {
                  if (viewMode === "day") {
                    const dayData = processedData[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                        {dayData ? numberFormatter.format(dayData.surplusDindam) : "-"}
                      </td>
                    );
                  } else if (viewMode === "month") {
                    const monthData = monthlyData2567[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                        {monthData ? numberFormatter.format(monthData.surplusDindam) : "-"}
                      </td>
                    );
                  } else {
                    const data = processedData[0];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                        {data ? numberFormatter.format(data.surplusDindam) : "-"}
                      </td>
                    );
                  }
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {numberFormatter.format(monthlyData2567.slice(0, 6).reduce((sum, m) => sum + m.surplusDindam, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {numberFormatter.format(monthlyData2567.slice(6, 12).reduce((sum, m) => sum + m.surplusDindam, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {numberFormatter.format(monthlyData2567.reduce((sum, m) => sum + m.surplusDindam, 0))}
                    </td>
                  </>
                )}
              </tr>

              {/* Section: ขาด (ลิตร) */}
              <tr className="bg-red-50 dark:bg-red-900/20">
                <td colSpan={getColumns().length + (viewMode === "month" ? 3 : 0) + 1} className="px-4 py-2 text-sm font-bold text-gray-800 dark:text-white">
                  ขาด (ลิตร)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  ขาด หนองจิก
                </td>
                {getColumns().map((_col, idx) => {
                  if (viewMode === "day") {
                    const dayData = processedData[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                        {dayData ? numberFormatter.format(dayData.deficitNongChik) : "-"}
                      </td>
                    );
                  } else if (viewMode === "month") {
                    const monthData = monthlyData2567[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                        {monthData ? numberFormatter.format(monthData.deficitNongChik) : "-"}
                      </td>
                    );
                  } else {
                    const data = processedData[0];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                        {data ? numberFormatter.format(data.deficitNongChik) : "-"}
                      </td>
                    );
                  }
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {numberFormatter.format(monthlyData2567.slice(0, 6).reduce((sum, m) => sum + m.deficitNongChik, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {numberFormatter.format(monthlyData2567.slice(6, 12).reduce((sum, m) => sum + m.deficitNongChik, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {numberFormatter.format(monthlyData2567.reduce((sum, m) => sum + m.deficitNongChik, 0))}
                    </td>
                  </>
                )}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  ขาด ตักสิลา
                </td>
                {getColumns().map((_col, idx) => {
                  if (viewMode === "day") {
                    const dayData = processedData[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                        {dayData ? numberFormatter.format(dayData.deficitTaksila) : "-"}
                      </td>
                    );
                  } else if (viewMode === "month") {
                    const monthData = monthlyData2567[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                        {monthData ? numberFormatter.format(monthData.deficitTaksila) : "-"}
                      </td>
                    );
                  } else {
                    const data = processedData[0];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                        {data ? numberFormatter.format(data.deficitTaksila) : "-"}
                      </td>
                    );
                  }
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {numberFormatter.format(monthlyData2567.slice(0, 6).reduce((sum, m) => sum + m.deficitTaksila, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {numberFormatter.format(monthlyData2567.slice(6, 12).reduce((sum, m) => sum + m.deficitTaksila, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {numberFormatter.format(monthlyData2567.reduce((sum, m) => sum + m.deficitTaksila, 0))}
                    </td>
                  </>
                )}
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                  ขาด บายพาส
                </td>
                {getColumns().map((_col, idx) => {
                  if (viewMode === "day") {
                    const dayData = processedData[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                        {dayData ? numberFormatter.format(dayData.deficitBypass) : "-"}
                      </td>
                    );
                  } else if (viewMode === "month") {
                    const monthData = monthlyData2567[idx];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                        {monthData ? numberFormatter.format(monthData.deficitBypass) : "-"}
                      </td>
                    );
                  } else {
                    const data = processedData[0];
                    return (
                      <td key={idx} className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                        {data ? numberFormatter.format(data.deficitBypass) : "-"}
                      </td>
                    );
                  }
                })}
                {viewMode === "month" && (
                  <>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {numberFormatter.format(monthlyData2567.slice(0, 6).reduce((sum, m) => sum + m.deficitBypass, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                      {numberFormatter.format(monthlyData2567.slice(6, 12).reduce((sum, m) => sum + m.deficitBypass, 0))}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                      {numberFormatter.format(monthlyData2567.reduce((sum, m) => sum + m.deficitBypass, 0))}
                    </td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

