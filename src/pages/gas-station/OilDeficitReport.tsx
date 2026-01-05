import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Filter,
  Building2,
  Droplet,
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

// ประเภทสาขา
type BranchType = "HISO" | "Dindam" | "NongChik" | "Taksila" | "Bypass";

// ชนิดน้ำมัน
type OilType =
  | "Premium Diesel"
  | "Premium Gasohol 95"
  | "Diesel"
  | "E85"
  | "E20"
  | "Gasohol 91"
  | "Gasohol 95";

// ข้อมูลจำนวนลิตรที่ขายแยกตามชนิดน้ำมัน
interface OilQuantity {
  oilType: OilType;
  quantity: number; // จำนวนลิตร
  sales: number; // ยอดขาย (เงิน)
}

// ข้อมูลรายงานรายเดือนของแต่ละสาขา
interface BranchMonthlyData {
  id: string;
  branch: BranchType;
  year: number;
  month: number;
  sales: number; // ยอดขายรวม (เงิน)
  quantitySold: number; // จำนวนลิตรรวมที่ขายไป
  oilQuantities: OilQuantity[]; // จำนวนลิตรแยกตามชนิดน้ำมัน
}

const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

// ราคาต่อลิตรของแต่ละชนิดน้ำมัน (บาท)
const oilPrices: Record<OilType, number> = {
  "Premium Diesel": 33.49,
  "Premium Gasohol 95": 41.49,
  "Diesel": 32.49,
  "E85": 28.99,
  "E20": 35.99,
  "Gasohol 91": 38.99,
  "Gasohol 95": 40.99,
};

// ชื่อภาษาไทยของแต่ละชนิดน้ำมัน
const getOilTypeLabel = (oilType: OilType): string => {
  const labels = new Map<OilType, string>([
    ["Premium Diesel", "ดีเซลพรีเมียม"],
    ["Premium Gasohol 95", "แก๊สโซฮอล์ 95 พรีเมียม"],
    ["Diesel", "ดีเซล"],
    ["E85", "E85"],
    ["E20", "E20"],
    ["Gasohol 91", "แก๊สโซฮอล์ 91"],
    ["Gasohol 95", "แก๊สโซฮอล์ 95"],
  ]);
  return labels.get(oilType) || "";
};

// Mock data - สร้างข้อมูลรายเดือนของแต่ละสาขา
const generateBranchData = (): BranchMonthlyData[] => {
  const branches: BranchType[] = ["HISO", "Dindam", "NongChik", "Taksila", "Bypass"];
  const oilTypes: OilType[] = [
    "Premium Diesel",
    "Premium Gasohol 95",
    "Diesel",
    "E85",
    "E20",
    "Gasohol 91",
    "Gasohol 95",
  ];
  const data: BranchMonthlyData[] = [];

  // สัดส่วนการขายของแต่ละชนิดน้ำมัน (เปอร์เซ็นต์)
  const oilDistribution = new Map<OilType, number>([
    ["Premium Diesel", 25],
    ["Premium Gasohol 95", 20],
    ["Diesel", 30],
    ["E85", 5],
    ["E20", 8],
    ["Gasohol 91", 7],
    ["Gasohol 95", 5],
  ]);

  const oilPricesMap = new Map(Object.entries(oilPrices));

  // ข้อมูลปี 2567
  branches.forEach((branch, branchIdx) => {
    for (let month = 1; month <= 12; month++) {
      const baseSales = 400000 + (branchIdx * 50000) + (month * 2000);
      const oilQuantities: OilQuantity[] = [];
      let totalQuantity = 0;

      // สร้างข้อมูลแยกตามชนิดน้ำมัน
      oilTypes.forEach((oilType) => {
        const percentage = oilDistribution.get(oilType) || 0;
        const oilSales = Math.round((baseSales * percentage) / 100);
        const price = oilPricesMap.get(oilType) || 0;
        const quantity = Math.round(oilSales / price);

        oilQuantities.push({
          oilType,
          quantity,
          sales: oilSales,
        });

        totalQuantity += quantity;
      });

      data.push({
        id: `${branch}-2567-${String(month).padStart(2, '0')}`,
        branch,
        year: 2567,
        month,
        sales: baseSales,
        quantitySold: totalQuantity,
        oilQuantities,
      });
    }
  });

  // ข้อมูลปี 2566
  branches.forEach((branch, branchIdx) => {
    for (let month = 1; month <= 12; month++) {
      const baseSales = 500000 + (branchIdx * 60000) + (month * 2500);
      const oilQuantities: OilQuantity[] = [];
      let totalQuantity = 0;

      // สร้างข้อมูลแยกตามชนิดน้ำมัน
      oilTypes.forEach((oilType) => {
        const percentage = oilDistribution.get(oilType) || 0;
        const oilSales = Math.round((baseSales * percentage) / 100);
        const price = oilPricesMap.get(oilType) || 0;
        const quantity = Math.round(oilSales / price);

        oilQuantities.push({
          oilType,
          quantity,
          sales: oilSales,
        });

        totalQuantity += quantity;
      });

      data.push({
        id: `${branch}-2566-${String(month).padStart(2, '0')}`,
        branch,
        year: 2566,
        month,
        sales: baseSales,
        quantitySold: totalQuantity,
        oilQuantities,
      });
    }
  });

  return data;
};

const getBranchLabel = (branch: BranchType): string => {
  const labels = new Map<BranchType, string>([
    ["HISO", "ไฮโซ"],
    ["Dindam", "ดินดำ"],
    ["NongChik", "หนองจิก"],
    ["Taksila", "ตักสิลา"],
    ["Bypass", "บายพาส"],
  ]);
  return labels.get(branch) || "";
};

const getBranchColorClasses = (branch: BranchType): { border: string; bg: string; icon: string } => {
  const colors = new Map<BranchType, { border: string; bg: string; icon: string }>([
    ["HISO", { border: "border-blue-500", bg: "bg-gradient-to-r from-blue-500 to-blue-600", icon: "text-blue-500" }],
    ["Dindam", { border: "border-purple-500", bg: "bg-gradient-to-r from-purple-500 to-purple-600", icon: "text-purple-500" }],
    ["NongChik", { border: "border-orange-500", bg: "bg-gradient-to-r from-orange-500 to-orange-600", icon: "text-orange-500" }],
    ["Taksila", { border: "border-emerald-500", bg: "bg-gradient-to-r from-emerald-500 to-emerald-600", icon: "text-emerald-500" }],
    ["Bypass", { border: "border-red-500", bg: "bg-gradient-to-r from-red-500 to-red-600", icon: "text-red-500" }],
  ]);
  return colors.get(branch) || { border: "", bg: "", icon: "" };
};

export default function OilDeficitReport() {
  const [selectedYear, setSelectedYear] = useState<number>(2567);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<BranchType | "all">("all");
  const branchData = useMemo(() => generateBranchData(), []);

  // กรองข้อมูล
  const filteredData = useMemo(() => {
    let filtered = branchData;

    // กรองตามปี
    filtered = filtered.filter(d => d.year === selectedYear);

    // กรองตามเดือน
    if (selectedMonth !== "all") {
      filtered = filtered.filter(d => d.month === parseInt(selectedMonth));
    }

    // กรองตามสาขา
    if (selectedBranch !== "all") {
      filtered = filtered.filter(d => d.branch === selectedBranch);
    }

    return filtered;
  }, [branchData, selectedYear, selectedMonth, selectedBranch]);

  // จัดกลุ่มข้อมูลตามสาขา
  const groupedByBranch = useMemo(() => {
    const grouped = new Map<BranchType, BranchMonthlyData[]>(
      (["HISO", "Dindam", "NongChik", "Taksila", "Bypass"] as BranchType[]).map(b => [b, []])
    );

    filteredData.forEach(data => {
      const list = grouped.get(data.branch);
      if (list) list.push(data);
    });

    // เรียงตามเดือน
    Array.from(grouped.keys()).forEach(branch => {
      const list = grouped.get(branch);
      if (list) list.sort((a, b) => a.month - b.month);
    });

    return grouped;
  }, [filteredData]);


  // คำนวณสรุปข้อมูล
  const summary = useMemo(() => {
    const summaryData = new Map<BranchType, { totalSales: number; totalQuantitySold: number; count: number }>(
      (["HISO", "Dindam", "NongChik", "Taksila", "Bypass"] as BranchType[]).map(b => [
        b, { totalSales: 0, totalQuantitySold: 0, count: 0 }
      ])
    );

    filteredData.forEach(data => {
      const stats = summaryData.get(data.branch);
      if (stats) {
        stats.totalSales += data.sales;
        stats.totalQuantitySold += data.quantitySold;
        stats.count += 1;
      }
    });

    return summaryData;
  }, [filteredData]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
          <Droplet className="w-8 h-8 text-blue-500" />
          รายงานยอดขาดน้ำมัน
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          รายงานน้ำมันประจำปี - แสดงข้อมูลการขายและยอดขาด/เกิน แยกตามสาขา
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {(["HISO", "Dindam", "NongChik", "Taksila", "Bypass"] as BranchType[]).map((branch) => {
          const branchColors = getBranchColorClasses(branch);
          const data = summary.get(branch) || { totalSales: 0, totalQuantitySold: 0, count: 0 };
          return (
            <motion.div
              key={branch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border-l-4 ${branchColors.border}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800 dark:text-white">{getBranchLabel(branch)}</h3>
                <Building2 className={`w-5 h-5 ${branchColors.icon}`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">ยอดขาย</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                    {currencyFormatter.format(data.totalSales)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">จำนวนลิตรที่ขาย</span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {numberFormatter.format(data.totalQuantitySold)} ลิตร
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">จำนวนรายการ</span>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{data.count} เดือน</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-wrap gap-4 items-end"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">กรองข้อมูล:</span>
        </div>

        <div>
          <label htmlFor="filter-year" className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">เลือกปี</label>
          <select
            id="filter-year"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(Number(e.target.value));
              setSelectedMonth("all");
            }}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
          >
            <option value={2567}>2567</option>
            <option value={2566}>2566</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-month" className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">เลือกเดือน</label>
          <select
            id="filter-month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
          >
            <option value="all">ทุกเดือน</option>
            {thaiMonths.map((month, index) => (
              <option key={index} value={String(index + 1)}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-branch" className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">กรองตามสาขา</label>
          <select
            id="filter-branch"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value as BranchType | "all")}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
          >
            <option value="all">ทุกสาขา</option>
            <option value="HISO">ไฮโซ</option>
            <option value="Dindam">ดินดำ</option>
            <option value="NongChik">หนองจิก</option>
            <option value="Taksila">ตักสิลา</option>
            <option value="Bypass">บายพาส</option>
          </select>
        </div>

        <div className="flex-1"></div>
        <button
          onClick={() => alert("ส่งออกข้อมูลเป็น Excel (ฟังก์ชันนี้จะเชื่อมต่อกับระบบจริง)")}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          ส่งออก Excel
        </button>
      </motion.div>

      {/* Branch Reports */}
      <div className="space-y-6">
        {(["HISO", "Dindam", "NongChik", "Taksila", "Bypass"] as BranchType[])
          .filter(branch => selectedBranch === "all" || selectedBranch === branch)
          .map((branch, branchIndex) => {
            const branchDataList = groupedByBranch.get(branch) || [];
            const branchColors = getBranchColorClasses(branch);
            const branchLabel = getBranchLabel(branch);

            if (branchDataList.length === 0) return null;

            return (
              <motion.div
                key={branch}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: branchIndex * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              >
                {/* Branch Header */}
                <div className={`${branchColors.bg} p-6 text-white`}>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8" />
                    <div>
                      <h2 className="text-2xl font-bold">{branchLabel}</h2>
                      <p className="text-sm opacity-90">
                        รายงานประจำปี {selectedYear}
                        {selectedMonth !== "all" && ` - ${thaiMonths[parseInt(selectedMonth) - 1]}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Branch Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                          เดือน
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                          ยอดขาย (บาท)
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                          จำนวนลิตรรวม
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                          รายละเอียดตามชนิดน้ำมัน
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {branchDataList.map((data, index) => (
                        <motion.tr
                          key={data.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: branchIndex * 0.1 + index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-white">
                            {thaiMonths[data.month - 1]}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-gray-800 dark:text-white">
                            {currencyFormatter.format(data.sales)}
                          </td>
                          <td className="px-6 py-4 text-sm text-right">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {numberFormatter.format(data.quantitySold)} ลิตร
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              {data.oilQuantities.map((oil, oilIdx) => (
                                <div
                                  key={oilIdx}
                                  className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg"
                                >
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {getOilTypeLabel(oil.oilType)}
                                  </span>
                                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    {numberFormatter.format(oil.quantity)} ลิตร
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                      {/* Summary Row */}
                      <tr className="bg-gray-50 dark:bg-gray-900/50 border-t-2 border-gray-300 dark:border-gray-600">
                        <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-white">
                          รวม
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-gray-800 dark:text-white">
                          {currencyFormatter.format(summary.get(branch)?.totalSales || 0)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {numberFormatter.format(summary.get(branch)?.totalQuantitySold || 0)} ลิตร
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {(() => {
                              // คำนวณรวมตามชนิดน้ำมัน
                              const oilTotals: Record<OilType, { quantity: number; sales: number }> = {
                                "Premium Diesel": { quantity: 0, sales: 0 },
                                "Premium Gasohol 95": { quantity: 0, sales: 0 },
                                "Diesel": { quantity: 0, sales: 0 },
                                "E85": { quantity: 0, sales: 0 },
                                "E20": { quantity: 0, sales: 0 },
                                "Gasohol 91": { quantity: 0, sales: 0 },
                                "Gasohol 95": { quantity: 0, sales: 0 },
                              };

                              branchDataList.forEach((data) => {
                                data.oilQuantities.forEach((oil) => {
                                  const totals = oilTotals[oil.oilType];
                                  if (totals) {
                                    totals.quantity += oil.quantity;
                                    totals.sales += oil.sales;
                                  }
                                });
                              });

                              return Object.entries(oilTotals).map(([oilType, totals]) => (
                                <div
                                  key={oilType}
                                  className="flex items-center justify-between text-xs bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800"
                                >
                                  <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                    {getOilTypeLabel(oilType as OilType)}
                                  </span>
                                  <span className="font-bold text-blue-600 dark:text-blue-400">
                                    {numberFormatter.format(totals.quantity)} ลิตร
                                  </span>
                                </div>
                              ));
                            })()}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
