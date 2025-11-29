import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  Calendar,
  Filter,
  Search,
  ChevronLeft,
  Droplet,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

type OilType =
  | "Premium Diesel"
  | "Premium Gasohol 95"
  | "Diesel"
  | "E85"
  | "E20"
  | "Gasohol 91"
  | "Gasohol 95";

type FilterPeriod = "day" | "month" | "year";

type StockUpdateHistoryItem = {
  id: string;
  updateDate: string; // วันที่อัพเดต
  updateTime: string; // เวลาอัพเดต
  oilType: OilType;
  previousStock: number; // สต็อกก่อนอัพเดต
  usageAmount: number; // จำนวนที่ใช้ไป
  updatedStock: number; // สต็อกหลังอัพเดต
  updatedBy: string; // ผู้อัพเดต
};

// Mock data - ประวัติการอัพเดต
const mockHistoryData: StockUpdateHistoryItem[] = [
  {
    id: "HIS-001",
    updateDate: "2024-12-15",
    updateTime: "18:30",
    oilType: "Premium Diesel",
    previousStock: 48000,
    usageAmount: 3000,
    updatedStock: 45000,
    updatedBy: "พนักงาน A",
  },
  {
    id: "HIS-002",
    updateDate: "2024-12-15",
    updateTime: "18:30",
    oilType: "Premium Gasohol 95",
    previousStock: 41000,
    usageAmount: 3000,
    updatedStock: 38000,
    updatedBy: "พนักงาน A",
  },
  {
    id: "HIS-003",
    updateDate: "2024-12-15",
    updateTime: "18:30",
    oilType: "Diesel",
    previousStock: 55000,
    usageAmount: 3000,
    updatedStock: 52000,
    updatedBy: "พนักงาน A",
  },
  {
    id: "HIS-004",
    updateDate: "2024-12-14",
    updateTime: "18:00",
    oilType: "Premium Diesel",
    previousStock: 51000,
    usageAmount: 3000,
    updatedStock: 48000,
    updatedBy: "พนักงาน B",
  },
  {
    id: "HIS-005",
    updateDate: "2024-12-14",
    updateTime: "18:00",
    oilType: "E85",
    previousStock: 18000,
    usageAmount: 3000,
    updatedStock: 15000,
    updatedBy: "พนักงาน B",
  },
  {
    id: "HIS-006",
    updateDate: "2024-12-13",
    updateTime: "18:15",
    oilType: "Gasohol 95",
    previousStock: 38000,
    usageAmount: 3000,
    updatedStock: 35000,
    updatedBy: "พนักงาน C",
  },
  {
    id: "HIS-007",
    updateDate: "2024-12-13",
    updateTime: "18:15",
    oilType: "E20",
    previousStock: 31000,
    usageAmount: 3000,
    updatedStock: 28000,
    updatedBy: "พนักงาน C",
  },
  {
    id: "HIS-008",
    updateDate: "2024-12-12",
    updateTime: "18:45",
    oilType: "Gasohol 91",
    previousStock: 25000,
    usageAmount: 3000,
    updatedStock: 22000,
    updatedBy: "พนักงาน A",
  },
  {
    id: "HIS-009",
    updateDate: "2024-12-11",
    updateTime: "19:00",
    oilType: "Premium Diesel",
    previousStock: 54000,
    usageAmount: 3000,
    updatedStock: 51000,
    updatedBy: "พนักงาน B",
  },
  {
    id: "HIS-010",
    updateDate: "2024-12-10",
    updateTime: "18:30",
    oilType: "Diesel",
    previousStock: 58000,
    usageAmount: 3000,
    updatedStock: 55000,
    updatedBy: "พนักงาน C",
  },
];

export default function StockUpdateHistory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOilType, setSelectedOilType] = useState("ทั้งหมด");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("day");

  // สำหรับกรองตามวัน
  const [selectedDate, setSelectedDate] = useState("");
  // สำหรับกรองตามเดือน
  const [selectedMonth, setSelectedMonth] = useState("");
  // สำหรับกรองตามปี
  const [selectedYear, setSelectedYear] = useState("");

  // สร้างรายการปี (3 ปีล่าสุด)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  // สร้างรายการเดือน
  const months = [
    { value: "01", label: "มกราคม" },
    { value: "02", label: "กุมภาพันธ์" },
    { value: "03", label: "มีนาคม" },
    { value: "04", label: "เมษายน" },
    { value: "05", label: "พฤษภาคม" },
    { value: "06", label: "มิถุนายน" },
    { value: "07", label: "กรกฎาคม" },
    { value: "08", label: "สิงหาคม" },
    { value: "09", label: "กันยายน" },
    { value: "10", label: "ตุลาคม" },
    { value: "11", label: "พฤศจิกายน" },
    { value: "12", label: "ธันวาคม" },
  ];

  // ฟังก์ชันกรองข้อมูล
  const filteredHistory = mockHistoryData.filter((item) => {
    // กรองตามคำค้นหา
    const matchesSearch =
      item.oilType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.updatedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    // กรองตามประเภทน้ำมัน
    const matchesOilType = selectedOilType === "ทั้งหมด" || item.oilType === selectedOilType;

    // กรองตามช่วงเวลา
    let matchesPeriod = true;
    if (filterPeriod === "day" && selectedDate) {
      matchesPeriod = item.updateDate === selectedDate;
    } else if (filterPeriod === "month" && selectedMonth && selectedYear) {
      const itemDate = new Date(item.updateDate);
      const itemMonth = String(itemDate.getMonth() + 1).padStart(2, "0");
      const itemYear = String(itemDate.getFullYear());
      matchesPeriod = itemMonth === selectedMonth && itemYear === selectedYear;
    } else if (filterPeriod === "year" && selectedYear) {
      const itemDate = new Date(item.updateDate);
      const itemYear = String(itemDate.getFullYear());
      matchesPeriod = itemYear === selectedYear;
    }

    return matchesSearch && matchesOilType && matchesPeriod;
  });

  // สรุปข้อมูล
  const summary = {
    totalRecords: filteredHistory.length,
    totalUsage: filteredHistory.reduce((sum, item) => sum + item.usageAmount, 0),
    uniqueDates: new Set(filteredHistory.map((item) => item.updateDate)).size,
  };

  // จัดกลุ่มข้อมูลตามวันที่
  const groupedByDate = filteredHistory.reduce((acc, item) => {
    if (!acc[item.updateDate]) {
      acc[item.updateDate] = [];
    }
    acc[item.updateDate].push(item);
    return acc;
  }, {} as Record<string, StockUpdateHistoryItem[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
              <History className="w-8 h-8 text-purple-500" />
              ประวัติการอัพเดตสต็อกน้ำมัน
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ดูประวัติการอัพเดตการใช้น้ำมันระหว่างวัน แยกตามวันที่และประเภทน้ำมัน
            </p>
          </div>
          <button
            onClick={() => navigate("/app/gas-station/update-stock")}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            กลับไปหน้าอัพเดตสต็อก
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">จำนวนรายการทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{summary.totalRecords}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Droplet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">จำนวนที่ใช้รวม</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {numberFormatter.format(summary.totalUsage)} ลิตร
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">จำนวนวันที่อัพเดต</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{summary.uniqueDates} วัน</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 space-y-4 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">กรองข้อมูล</h3>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาประเภทน้ำมัน, ผู้อัพเดต, รหัส..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 text-gray-800 dark:text-white transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ประเภทน้ำมัน */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ประเภทน้ำมัน
            </label>
            <select
              value={selectedOilType}
              onChange={(e) => setSelectedOilType(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 text-gray-800 dark:text-white transition-all duration-200"
            >
              <option>ทั้งหมด</option>
              <option>Premium Diesel</option>
              <option>Premium Gasohol 95</option>
              <option>Diesel</option>
              <option>E85</option>
              <option>E20</option>
              <option>Gasohol 91</option>
              <option>Gasohol 95</option>
            </select>
          </div>

          {/* ช่วงเวลาที่ต้องการกรอง */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              กรองตาม
            </label>
            <select
              value={filterPeriod}
              onChange={(e) => {
                setFilterPeriod(e.target.value as FilterPeriod);
                setSelectedDate("");
                setSelectedMonth("");
                setSelectedYear("");
              }}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 text-gray-800 dark:text-white transition-all duration-200"
            >
              <option value="day">วัน</option>
              <option value="month">เดือน</option>
              <option value="year">ปี</option>
            </select>
          </div>

          {/* ตัวกรองตามช่วงเวลาที่เลือก */}
          {filterPeriod === "day" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                เลือกวันที่
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 text-gray-800 dark:text-white"
              />
            </div>
          )}

          {filterPeriod === "month" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  เลือกเดือน
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 text-gray-800 dark:text-white transition-all duration-200"
                >
                  <option value="">เลือกเดือน</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  เลือกปี
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 text-gray-800 dark:text-white transition-all duration-200"
                >
                  <option value="">เลือกปี</option>
                  {years.map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {filterPeriod === "year" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                เลือกปี
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 text-gray-800 dark:text-white transition-all duration-200"
              >
                <option value="">เลือกปี</option>
                {years.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </motion.div>

      {/* History Table */}
      {filteredHistory.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center"
        >
          <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">ไม่พบข้อมูลการอัพเดตที่ตรงกับเงื่อนไข</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date, dateIndex) => {
            const items = groupedByDate[date];
            const dateUsage = items.reduce((sum, item) => sum + item.usageAmount, 0);
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            });

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: dateIndex * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{formattedDate}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {items.length} รายการ • ใช้ไปรวม {numberFormatter.format(dateUsage)} ลิตร
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{date}</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          เวลา
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          ประเภทน้ำมัน
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          สต็อกก่อนอัพเดต
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          จำนวนที่ใช้
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          สต็อกหลังอัพเดต
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          ผู้อัพเดต
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: dateIndex * 0.1 + index * 0.05 }}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{item.updateTime}</td>
                          <td className="py-4 px-6 text-sm font-semibold text-gray-800 dark:text-white">
                            {item.oilType}
                          </td>
                          <td className="py-4 px-6 text-sm text-right text-gray-600 dark:text-gray-400">
                            {numberFormatter.format(item.previousStock)} ลิตร
                          </td>
                          <td className="py-4 px-6 text-sm text-right font-semibold text-red-600 dark:text-red-400">
                            -{numberFormatter.format(item.usageAmount)} ลิตร
                          </td>
                          <td className="py-4 px-6 text-sm text-right font-semibold text-emerald-600 dark:text-emerald-400">
                            {numberFormatter.format(item.updatedStock)} ลิตร
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{item.updatedBy}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

