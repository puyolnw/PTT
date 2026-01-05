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
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

type OilType = "HSD" | "HSP" | "GSH91" | "E20" | "GSH95" | "E85" | "ULG";

type DailyBalanceRow = {
  date: number; // ว/ด/ป (วันที่)
  oilType: OilType;
  receive: number; // รับ (ลิตร)
  withdraw: number; // เบิกใช้ (ลิตร)
  pay: number; // จ่าย (ลิตร)
  balance: number; // คงเหลือ (ยอดยกมา + รับ - จ่าย)
  measuredBalance: number; // วัดได้จริง (ลิตร)
  difference: number; // ส่วนต่างลิตร (วัดได้จริง - คงเหลือ)
  tripNo?: string; // ใส่เที่ยว (เลขที่เที่ยวขนส่ง)
  accumulatedDifference: number; // สะสมลิตร (ยอดน้ำมันขาด/เกิน สะสม)
  pricePerLiter: number; // ราคา (บาท/ลิตร)
  moneyDifference: number; // เป็นเงินขาด/เกิน (ส่วนต่างลิตร x ราคา)
  accumulatedMoney: number; // สะสมเงิน (ยอดเงินขาด/เกิน สะสม)
};

type MonthlySummary = {
  month: string;
  year: number;
  rows: DailyBalanceRow[];
  totalReceive: number;
  totalWithdraw: number;
  totalPay: number;
  totalDifference: number;
  totalAccumulatedDifference: number;
  totalMoneyDifference: number;
  totalAccumulatedMoney: number;
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

// Mock data ตามรูปภาพ - เก็บข้อมูลเป็น key-value โดยใช้ "year-month" เป็น key
const mockMonthlyDataMap = new Map<string, MonthlySummary>([
  ["2565-0", {
    month: "มกราคม",
    year: 2565,
    rows: [
      {
        date: 1,
        oilType: "HSD",
        receive: 230700,
        withdraw: 0,
        pay: 220116.7,
        balance: 16226.3,
        measuredBalance: 16124,
        difference: 16124 - 16226.3, // วัดได้จริง - คงเหลือ
        tripNo: "T001",
        accumulatedDifference: -102.3,
        pricePerLiter: 30.49,
        moneyDifference: (16124 - 16226.3) * 30.49,
        accumulatedMoney: -3119.13,
      },
      {
        date: 2,
        oilType: "HSD",
        receive: 164700,
        withdraw: 0,
        pay: 167744.5,
        balance: 8306.5,
        measuredBalance: 7948,
        difference: 7948 - 8306.5,
        tripNo: "T002",
        accumulatedDifference: -460.8,
        pricePerLiter: 30.49,
        moneyDifference: (7948 - 8306.5) * 30.49,
        accumulatedMoney: -14049.82,
      },
      {
        date: 3,
        oilType: "HSP",
        receive: 4000,
        withdraw: 0,
        pay: 5730.5,
        balance: 6073.5,
        measuredBalance: 6093,
        difference: 6093 - 6073.5,
        tripNo: "T003",
        accumulatedDifference: 19.5,
        pricePerLiter: 36.51,
        moneyDifference: (6093 - 6073.5) * 36.51,
        accumulatedMoney: 711.95,
      },
      {
        date: 4,
        oilType: "GSH91",
        receive: 31000,
        withdraw: 0,
        pay: 27845.2,
        balance: 9944.8,
        measuredBalance: 9841,
        difference: 9841 - 9944.8,
        tripNo: "T004",
        accumulatedDifference: -103.8,
        pricePerLiter: 34.33,
        moneyDifference: (9841 - 9944.8) * 34.33,
        accumulatedMoney: -3563.45,
      },
      {
        date: 5,
        oilType: "E20",
        receive: 34500,
        withdraw: 0,
        pay: 33283,
        balance: 7696,
        measuredBalance: 7649,
        difference: 7649 - 7696,
        tripNo: "T005",
        accumulatedDifference: -47,
        pricePerLiter: 33.39,
        moneyDifference: (7649 - 7696) * 33.39,
        accumulatedMoney: -1569.33,
      },
      {
        date: 6,
        oilType: "E20",
        receive: 73500,
        withdraw: 0,
        pay: 69967.7,
        balance: 7070.3,
        measuredBalance: 6918,
        difference: 6918 - 7070.3,
        tripNo: "T006",
        accumulatedDifference: -152.3,
        pricePerLiter: 34.6,
        moneyDifference: (6918 - 7070.3) * 34.6,
        accumulatedMoney: -5269.58,
      },
      {
        date: 7,
        oilType: "GSH95",
        receive: 14000,
        withdraw: 0,
        pay: 15608.1,
        balance: 8482.9,
        measuredBalance: 8444,
        difference: 8444 - 8482.9,
        tripNo: "T007",
        accumulatedDifference: -38.9,
        pricePerLiter: 26.19,
        moneyDifference: (8444 - 8482.9) * 26.19,
        accumulatedMoney: -1018.49,
      },
      {
        date: 8,
        oilType: "E85",
        receive: 62000,
        withdraw: 0,
        pay: 53956.1,
        balance: 9799.9,
        measuredBalance: 9746,
        difference: 9746 - 9799.9,
        tripNo: "T008",
        accumulatedDifference: -53.9,
        pricePerLiter: 34.33,
        moneyDifference: (9746 - 9799.9) * 34.33,
        accumulatedMoney: -1850.39,
      },
      {
        date: 9,
        oilType: "ULG",
        receive: 8000,
        withdraw: 0,
        pay: 2669.6,
        balance: 8850.4,
        measuredBalance: 8830,
        difference: 8830 - 8850.4,
        tripNo: "T009",
        accumulatedDifference: -20.4,
        pricePerLiter: 42.01,
        moneyDifference: (8830 - 8850.4) * 42.01,
        accumulatedMoney: -857.0,
      },
      {
        date: 10,
        oilType: "E20",
        receive: 17000,
        withdraw: 0,
        pay: 16484.6,
        balance: 7940.4,
        measuredBalance: 8099,
        difference: 8099 - 7940.4,
        tripNo: "T010",
        accumulatedDifference: 558.6,
        pricePerLiter: 33.39,
        moneyDifference: (8099 - 7940.4) * 33.39,
        accumulatedMoney: 18651.65,
      },
    ],
    totalReceive: 639900,
    totalWithdraw: 0,
    totalPay: 613406,
    totalDifference: -299,
    totalAccumulatedDifference: -299,
    totalMoneyDifference: -8834.19,
    totalAccumulatedMoney: 6144.71,
  }],
  ["2565-1", {
    month: "กุมภาพันธ์",
    year: 2565,
    rows: [
      {
        date: 1,
        oilType: "HSD",
        receive: 215000,
        withdraw: 0,
        pay: 214752,
        balance: 15872,
        measuredBalance: 15859,
        difference: 15859 - 15872,
        tripNo: "T011",
        accumulatedDifference: -13,
        pricePerLiter: 29.69,
        moneyDifference: (15859 - 15872) * 29.69,
        accumulatedMoney: -385.94,
      },
      {
        date: 2,
        oilType: "HSP",
        receive: 18000,
        withdraw: 0,
        pay: 18234.5,
        balance: 7638.5,
        measuredBalance: 7521,
        difference: 7521 - 7638.5,
        tripNo: "T012",
        accumulatedDifference: -117.5,
        pricePerLiter: 36.81,
        moneyDifference: (7521 - 7638.5) * 36.81,
        accumulatedMoney: -4324.78,
      },
      {
        date: 3,
        oilType: "GSH91",
        receive: 28000,
        withdraw: 0,
        pay: 27543.2,
        balance: 10297.6,
        measuredBalance: 10185,
        difference: 10185 - 10297.6,
        tripNo: "T013",
        accumulatedDifference: -112.6,
        pricePerLiter: 34.33,
        moneyDifference: (10185 - 10297.6) * 34.33,
        accumulatedMoney: -3865.78,
      },
      {
        date: 4,
        oilType: "E20",
        receive: 32000,
        withdraw: 0,
        pay: 31567.5,
        balance: 8161.5,
        measuredBalance: 8089,
        difference: 8089 - 8161.5,
        tripNo: "T014",
        accumulatedDifference: -72.5,
        pricePerLiter: 33.39,
        moneyDifference: (8089 - 8161.5) * 33.39,
        accumulatedMoney: -2419.58,
      },
      {
        date: 5,
        oilType: "E20",
        receive: 30500,
        withdraw: 0,
        pay: 30176,
        balance: 7973,
        measuredBalance: 7869,
        difference: 7869 - 7973,
        tripNo: "T015",
        accumulatedDifference: -104,
        pricePerLiter: 35.99,
        moneyDifference: (7869 - 7973) * 35.99,
        accumulatedMoney: -3742.96,
      },
      {
        date: 6,
        oilType: "GSH95",
        receive: 15000,
        withdraw: 0,
        pay: 14892.3,
        balance: 8590.7,
        measuredBalance: 8521,
        difference: 8521 - 8590.7,
        tripNo: "T016",
        accumulatedDifference: -69.7,
        pricePerLiter: 33.39,
        moneyDifference: (8521 - 8590.7) * 33.39,
        accumulatedMoney: -2326.47,
      },
      {
        date: 7,
        oilType: "E85",
        receive: 58000,
        withdraw: 0,
        pay: 57123.4,
        balance: 9666.6,
        measuredBalance: 9612,
        difference: 9612 - 9666.6,
        tripNo: "T017",
        accumulatedDifference: -54.6,
        pricePerLiter: 34.6,
        moneyDifference: (9612 - 9666.6) * 34.6,
        accumulatedMoney: -1889.16,
      },
      {
        date: 8,
        oilType: "ULG",
        receive: 7500,
        withdraw: 0,
        pay: 7234.2,
        balance: 9116.2,
        measuredBalance: 9089,
        difference: 9089 - 9116.2,
        tripNo: "T018",
        accumulatedDifference: -27.2,
        pricePerLiter: 26.69,
        moneyDifference: (9089 - 9116.2) * 26.69,
        accumulatedMoney: -725.58,
      },
      {
        date: 9,
        oilType: "GSH91",
        receive: 25000,
        withdraw: 0,
        pay: 24876.3,
        balance: 10409.3,
        measuredBalance: 10321,
        difference: 10321 - 10409.3,
        tripNo: "T019",
        accumulatedDifference: -88.3,
        pricePerLiter: 34.33,
        moneyDifference: (10321 - 10409.3) * 34.33,
        accumulatedMoney: -3030.19,
      },
      {
        date: 10,
        oilType: "E20",
        receive: 12000,
        withdraw: 0,
        pay: 12201.4,
        balance: 7897.6,
        measuredBalance: 7910,
        difference: 7910 - 7897.6,
        tripNo: "T020",
        accumulatedDifference: 12.4,
        pricePerLiter: 35.99,
        moneyDifference: (7910 - 7897.6) * 35.99,
        accumulatedMoney: 446.28,
      },
    ],
    totalReceive: 553500,
    totalWithdraw: 0,
    totalPay: 555906.2,
    totalDifference: -299,
    totalAccumulatedDifference: -299,
    totalMoneyDifference: -16249.64,
    totalAccumulatedMoney: 4990.33,
  }],
]);

export default function BalancePetrolMonthly() {
  // ใช้เวลาปัจจุบันเป็นค่าเริ่มต้น
  const now = useMemo(() => new Date(), []);
  const currentBuddhistYear = getBuddhistYear(now);
  const currentMonth = now.getMonth();

  const [selectedYear, setSelectedYear] = useState(currentBuddhistYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // สร้างรายการปี (5 ปีย้อนหลัง ถึง 2 ปีข้างหน้า)
  const availableYears = useMemo(() => {
    const years: number[] = [];
    for (let i = currentBuddhistYear - 5; i <= currentBuddhistYear + 2; i++) {
      years.push(i);
    }
    return years;
  }, [currentBuddhistYear]);

  // ดึงข้อมูลตามเดือนและปีที่เลือก
  const dataKey = `${selectedYear}-${selectedMonth}`;
  const currentData = mockMonthlyDataMap.get(dataKey) || {
    month: thaiMonths.find((_, i) => i === selectedMonth) || "",
    year: selectedYear,
    rows: [],
    totalReceive: 0,
    totalWithdraw: 0,
    totalPay: 0,
    totalDifference: 0,
    totalAccumulatedDifference: 0,
    totalMoneyDifference: 0,
    totalAccumulatedMoney: 0,
  };

  const getGainLossColor = (value: number) => {
    if (value > 0) return "text-emerald-600 dark:text-emerald-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getDifferenceColor = (value: number) => {
    if (value > 0) return "text-emerald-600 dark:text-emerald-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

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
          รายงานสรุปยอดน้ำมันคงเหลือและการตรวจสอบน้ำมันขาด/เกิน ประจำวัน
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          สรุปรายวันการเคลื่อนไหวของน้ำมันและการตรวจสอบสต็อกน้ำมัน แยกตามประเภทน้ำมัน
        </p>
      </motion.div>

      {/* Month & Year Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">เลือกเดือนและปี:</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Year Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowMonthDropdown(false);
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
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowYearDropdown(false);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  />
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto min-w-[120px]">
                    {availableYears.map((year) => (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedYear(year);
                          setShowYearDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${selectedYear === year
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
                }}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 min-w-[150px] justify-between"
              >
                <span>{thaiMonths.find((_, i) => i === selectedMonth) || ""}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showMonthDropdown ? "rotate-180" : ""}`} />
              </button>
              {showMonthDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMonthDropdown(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowMonthDropdown(false);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  />
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto min-w-[150px]">
                    {thaiMonths.map((month, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedMonth(index);
                          setShowMonthDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${selectedMonth === index
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
          </div>

          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2">
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
        {/* Month & Year Header */}
        <div className="px-6 py-4 border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
            ประจำเดือน {currentData.month} {currentData.year}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60">
                {/* ส่วนซ้าย - ข้อมูลการเคลื่อนไหวของน้ำมัน */}
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
                  เบิกใช้
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300 border-r-2 border-gray-400 dark:border-gray-500">
                  จ่าย
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300 border-r-2 border-gray-400 dark:border-gray-500">
                  คงเหลือ
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300 border-r-2 border-gray-400 dark:border-gray-500">
                  วัดได้จริง
                </th>
                {/* ส่วนขวา - การตรวจสอบผลต่างและมูลค่า */}
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300">
                  ส่วนต่างลิตร
                </th>
                <th className="text-center py-3 px-4 font-bold text-gray-700 dark:text-gray-300">
                  ใส่เที่ยว
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300">
                  สะสมลิตร
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300">
                  ราคา
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300">
                  เป็นเงินขาด/เกิน
                </th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 dark:text-gray-300">
                  สะสมเงิน
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.rows.map((row, index) => (
                <motion.tr
                  key={`${row.date}-${row.oilType}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* ส่วนซ้าย - ข้อมูลการเคลื่อนไหวของน้ำมัน */}
                  <td className="text-center py-3 px-3 text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                    {row.date}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                    {row.oilType}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                    {row.receive > 0 ? numberFormatter.format(row.receive) : "-"}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                    {row.withdraw > 0 ? numberFormatter.format(row.withdraw) : "-"}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                    {numberFormatter.format(row.pay)}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                    {numberFormatter.format(row.balance)}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                    {integerFormatter.format(row.measuredBalance)}
                  </td>
                  {/* ส่วนขวา - การตรวจสอบผลต่างและมูลค่า */}
                  <td className={`text-right py-3 px-4 font-semibold ${getDifferenceColor(
                    row.difference
                  )}`}>
                    {row.difference > 0 ? "+" : ""}
                    {numberFormatter.format(row.difference)}
                  </td>
                  <td className="text-center py-3 px-4 text-gray-800 dark:text-white">
                    {row.tripNo || "-"}
                  </td>
                  <td className={`text-right py-3 px-4 font-semibold ${getDifferenceColor(
                    row.accumulatedDifference
                  )}`}>
                    {row.accumulatedDifference > 0 ? "+" : ""}
                    {numberFormatter.format(row.accumulatedDifference)}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-800 dark:text-white">
                    {numberFormatter.format(row.pricePerLiter)}
                  </td>
                  <td className={`text-right py-3 px-4 font-semibold ${getGainLossColor(
                    row.moneyDifference
                  )}`}>
                    {row.moneyDifference > 0 ? "+" : ""}
                    {numberFormatter.format(row.moneyDifference)}
                  </td>
                  <td className={`text-right py-3 px-4 font-semibold ${getGainLossColor(
                    row.accumulatedMoney
                  )}`}>
                    {row.accumulatedMoney > 0 ? "+" : ""}
                    {numberFormatter.format(row.accumulatedMoney)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
            {/* Footer Summary */}
            <tfoot>
              <tr className="border-t-2 border-red-500 dark:border-red-400 bg-gray-50 dark:bg-gray-900/60">
                <td colSpan={2} className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                  รวม
                </td>
                <td className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                  {numberFormatter.format(currentData.totalReceive)}
                </td>
                <td className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                  {numberFormatter.format(currentData.totalWithdraw)}
                </td>
                <td className="py-3 px-4 text-right font-bold text-gray-800 dark:text-white border-r-2 border-gray-400 dark:border-gray-500">
                  {numberFormatter.format(currentData.totalPay)}
                </td>
                <td colSpan={2} className="py-3 px-4 text-center text-gray-600 dark:text-gray-400 border-r-2 border-gray-400 dark:border-gray-500">
                  -
                </td>
                <td className={`py-3 px-4 text-right font-bold border-t-2 border-red-500 dark:border-red-400 ${getDifferenceColor(
                  currentData.totalDifference
                )}`}>
                  {currentData.totalDifference > 0 ? "+" : ""}
                  {numberFormatter.format(currentData.totalDifference)}
                </td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                  -
                </td>
                <td className={`py-3 px-4 text-right font-bold border-t-2 border-red-500 dark:border-red-400 ${getDifferenceColor(
                  currentData.totalAccumulatedDifference
                )}`}>
                  {currentData.totalAccumulatedDifference > 0 ? "+" : ""}
                  {numberFormatter.format(currentData.totalAccumulatedDifference)}
                </td>
                <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                  -
                </td>
                <td className={`py-3 px-4 text-right font-bold border-t-2 border-red-500 dark:border-red-400 ${getGainLossColor(
                  currentData.totalMoneyDifference
                )}`}>
                  {currentData.totalMoneyDifference > 0 ? "+" : ""}
                  {numberFormatter.format(currentData.totalMoneyDifference)}
                </td>
                <td className={`py-3 px-4 text-right font-bold border-t-2 border-red-500 dark:border-red-400 ${getGainLossColor(
                  currentData.totalAccumulatedMoney
                )}`}>
                  {currentData.totalAccumulatedMoney > 0 ? "+" : ""}
                  {numberFormatter.format(currentData.totalAccumulatedMoney)}
                </td>
              </tr>
            </tfoot>
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
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 ${currentData.totalDifference < 0 ? "border-l-4 border-red-500" : "border-l-4 border-emerald-500"
            }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">ส่วนต่างลิตรรวม</p>
              <p className={`text-lg font-bold ${getDifferenceColor(currentData.totalDifference)}`}>
                {currentData.totalDifference > 0 ? "+" : ""}
                {numberFormatter.format(currentData.totalDifference)} ลิตร
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 ${currentData.totalAccumulatedMoney < 0 ? "border-l-4 border-red-500" : "border-l-4 border-emerald-500"
            }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">สะสมเงินขาด/เกิน</p>
              <p className={`text-lg font-bold ${getGainLossColor(currentData.totalAccumulatedMoney)}`}>
                {currentData.totalAccumulatedMoney > 0 ? "+" : ""}
                {numberFormatter.format(currentData.totalAccumulatedMoney)} บาท
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

