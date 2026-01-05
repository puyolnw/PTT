import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  Calendar,
  Filter,
  Search,
  ChevronLeft,
  ShoppingCart,
  DollarSign,
  Receipt,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

type ProductCategory = "lubricants" | "gas" | "engine-oil";

type FilterPeriod = "day" | "month" | "year";

type SalesHistoryItem = {
  id: string;
  saleDate: string; // วันที่ขาย
  saleTime: string; // เวลาขาย
  productName: string;
  category: ProductCategory;
  brand?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  soldBy: string; // พนักงานที่ขาย
  paymentMethod: "cash" | "card" | "transfer"; // วิธีชำระเงิน
};

// Mock data - ประวัติการขายสินค้า
const mockSalesHistory: SalesHistoryItem[] = [
  {
    id: "SALE-001",
    saleDate: "2024-12-15",
    saleTime: "14:30",
    productName: "น้ำมันเครื่อง 10W-40",
    category: "lubricants",
    brand: "PTT",
    quantity: 2,
    unit: "ลิตร",
    pricePerUnit: 250,
    totalAmount: 500,
    soldBy: "พนักงาน A",
    paymentMethod: "cash",
  },
  {
    id: "SALE-002",
    saleDate: "2024-12-15",
    saleTime: "14:35",
    productName: "แก๊ส LPG",
    category: "gas",
    brand: "PTT",
    quantity: 1,
    unit: "ถัง",
    pricePerUnit: 350,
    totalAmount: 350,
    soldBy: "พนักงาน A",
    paymentMethod: "card",
  },
  {
    id: "SALE-003",
    saleDate: "2024-12-15",
    saleTime: "15:00",
    productName: "น้ำมันเครื่อง 15W-40",
    category: "engine-oil",
    brand: "PTT",
    quantity: 3,
    unit: "ลิตร",
    pricePerUnit: 220,
    totalAmount: 660,
    soldBy: "พนักงาน B",
    paymentMethod: "cash",
  },
  {
    id: "SALE-004",
    saleDate: "2024-12-15",
    saleTime: "15:20",
    productName: "แก๊ส NGV",
    category: "gas",
    brand: "PTT",
    quantity: 2,
    unit: "ถัง",
    pricePerUnit: 420,
    totalAmount: 840,
    soldBy: "พนักงาน B",
    paymentMethod: "transfer",
  },
  {
    id: "SALE-005",
    saleDate: "2024-12-14",
    saleTime: "10:15",
    productName: "น้ำมันเกียร์",
    category: "lubricants",
    brand: "PTT",
    quantity: 1,
    unit: "ลิตร",
    pricePerUnit: 320,
    totalAmount: 320,
    soldBy: "พนักงาน C",
    paymentMethod: "cash",
  },
  {
    id: "SALE-006",
    saleDate: "2024-12-14",
    saleTime: "11:30",
    productName: "น้ำมันเครื่อง 5W-30",
    category: "lubricants",
    brand: "PTT",
    quantity: 4,
    unit: "ลิตร",
    pricePerUnit: 280,
    totalAmount: 1120,
    soldBy: "พนักงาน A",
    paymentMethod: "card",
  },
  {
    id: "SALE-007",
    saleDate: "2024-12-14",
    saleTime: "13:45",
    productName: "แก๊สหุงต้ม",
    category: "gas",
    brand: "PTT",
    quantity: 1,
    unit: "ถัง",
    pricePerUnit: 380,
    totalAmount: 380,
    soldBy: "พนักงาน B",
    paymentMethod: "cash",
  },
  {
    id: "SALE-008",
    saleDate: "2024-12-13",
    saleTime: "09:20",
    productName: "น้ำมันเครื่อง 20W-50",
    category: "engine-oil",
    brand: "PTT",
    quantity: 2,
    unit: "ลิตร",
    pricePerUnit: 200,
    totalAmount: 400,
    soldBy: "พนักงาน C",
    paymentMethod: "cash",
  },
  {
    id: "SALE-009",
    saleDate: "2024-12-13",
    saleTime: "16:00",
    productName: "น้ำมันเบรก",
    category: "lubricants",
    brand: "PTT",
    quantity: 1,
    unit: "ลิตร",
    pricePerUnit: 180,
    totalAmount: 180,
    soldBy: "พนักงาน A",
    paymentMethod: "card",
  },
  {
    id: "SALE-010",
    saleDate: "2024-12-12",
    saleTime: "12:30",
    productName: "แก๊ส LPG",
    category: "gas",
    brand: "PTT",
    quantity: 3,
    unit: "ถัง",
    pricePerUnit: 350,
    totalAmount: 1050,
    soldBy: "พนักงาน B",
    paymentMethod: "transfer",
  },
  {
    id: "SALE-011",
    saleDate: "2024-12-12",
    saleTime: "14:15",
    productName: "น้ำมันเครื่อง 0W-20",
    category: "engine-oil",
    brand: "PTT",
    quantity: 1,
    unit: "ลิตร",
    pricePerUnit: 300,
    totalAmount: 300,
    soldBy: "พนักงาน C",
    paymentMethod: "cash",
  },
  {
    id: "SALE-012",
    saleDate: "2024-12-11",
    saleTime: "10:00",
    productName: "น้ำมันเครื่อง 10W-40",
    category: "lubricants",
    brand: "PTT",
    quantity: 5,
    unit: "ลิตร",
    pricePerUnit: 250,
    totalAmount: 1250,
    soldBy: "พนักงาน A",
    paymentMethod: "card",
  },
];

export default function ProductSalesHistory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("day");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
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
  const filteredHistory = mockSalesHistory.filter((item) => {
    // กรองตามคำค้นหา
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.soldBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase());

    // กรองตามประเภทสินค้า
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;

    // กรองตามช่วงเวลา
    let matchesPeriod = true;
    if (filterPeriod === "day" && selectedDate) {
      matchesPeriod = item.saleDate === selectedDate;
    } else if (filterPeriod === "month" && selectedMonth && selectedYear) {
      const itemDate = new Date(item.saleDate);
      const itemMonth = String(itemDate.getMonth() + 1).padStart(2, "0");
      const itemYear = String(itemDate.getFullYear());
      matchesPeriod = itemMonth === selectedMonth && itemYear === selectedYear;
    } else if (filterPeriod === "year" && selectedYear) {
      const itemDate = new Date(item.saleDate);
      const itemYear = String(itemDate.getFullYear());
      matchesPeriod = itemYear === selectedYear;
    }

    return matchesSearch && matchesCategory && matchesPeriod;
  });

  // สรุปข้อมูล
  const summary = {
    totalSales: filteredHistory.length,
    totalQuantity: filteredHistory.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: filteredHistory.reduce((sum, item) => sum + item.totalAmount, 0),
    uniqueDates: new Set(filteredHistory.map((item) => item.saleDate)).size,
  };

  // จัดกลุ่มข้อมูลตามวันที่
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, SalesHistoryItem[]>();
    filteredHistory.forEach((item) => {
      const group = groups.get(item.saleDate) || [];
      group.push(item);
      groups.set(item.saleDate, group);
    });
    return groups;
  }, [filteredHistory]);

  const sortedDates: string[] = Array.from(groupedByDate.keys()).sort((a, b) => b.localeCompare(a));

  const getCategoryLabel = (category: ProductCategory) => {
    if (category === "lubricants") return "น้ำมันหล่อลื่น";
    if (category === "gas") return "แก๊ส";
    return "น้ำมันเครื่อง";
  };

  const getPaymentMethodLabel = (method: SalesHistoryItem["paymentMethod"]) => {
    if (method === "cash") return "เงินสด";
    if (method === "card") return "บัตรเครดิต/เดบิต";
    return "โอนเงิน";
  };

  const getPaymentMethodColor = (method: SalesHistoryItem["paymentMethod"]) => {
    if (method === "cash") return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (method === "card") return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400";
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
              <History className="w-8 h-8 text-purple-500" />
              ประวัติการขายสินค้า
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ดูประวัติการขายสินค้าภายในปั้ม: น้ำมันหล่อลื่น แก๊ส และน้ำมันเครื่อง
            </p>
          </div>
          <button
            onClick={() => navigate("/app/gas-station/station-products")}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            กลับไปหน้าสินค้า
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">จำนวนรายการขาย</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{summary.totalSales}</p>
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
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">จำนวนสินค้าที่ขาย</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{summary.totalQuantity}</p>
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
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ยอดขายรวม</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {currencyFormatter.format(summary.totalAmount)}
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
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">จำนวนวันที่ขาย</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{summary.uniqueDates} วัน</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
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
            placeholder="ค้นหาชื่อสินค้า, ยี่ห้อ, พนักงาน, รหัส..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 text-gray-800 dark:text-white transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ประเภทสินค้า */}
          <div>
            <label htmlFor="filter-category" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ประเภทสินค้า
            </label>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | "all")}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 text-gray-800 dark:text-white transition-all duration-200"
            >
              <option value="all">ทั้งหมด</option>
              <option value="lubricants">น้ำมันหล่อลื่น</option>
              <option value="gas">แก๊ส</option>
              <option value="engine-oil">น้ำมันเครื่อง</option>
            </select>
          </div>

          {/* ช่วงเวลาที่ต้องการกรอง */}
          <div>
            <label htmlFor="filter-period" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              กรองตาม
            </label>
            <select
              id="filter-period"
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
              <label htmlFor="filter-date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                เลือกวันที่
              </label>
              <input
                id="filter-date"
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
                <label htmlFor="filter-month" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  เลือกเดือน
                </label>
                <select
                  id="filter-month"
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
                <label htmlFor="filter-year-month" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  เลือกปี
                </label>
                <select
                  id="filter-year-month"
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
              <label htmlFor="filter-year-only" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                เลือกปี
              </label>
              <select
                id="filter-year-only"
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

      {/* Sales History Table */}
      {filteredHistory.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center"
        >
          <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">ไม่พบข้อมูลการขายที่ตรงกับเงื่อนไข</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date, dateIndex) => {
            const items = groupedByDate.get(date) || [];
            const dateTotal = items.reduce((sum: number, item: SalesHistoryItem) => sum + item.totalAmount, 0);
            const dateQuantity = items.reduce((sum: number, item: SalesHistoryItem) => sum + item.quantity, 0);
            const dateObj = new Date(date as string);
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
                        {items.length} รายการ • ขาย {numberFormatter.format(dateQuantity)} หน่วย • ยอดรวม{" "}
                        {currencyFormatter.format(dateTotal)}
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
                          ประเภท
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          ชื่อสินค้า
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          ยี่ห้อ
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          จำนวน
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          ราคาต่อหน่วย
                        </th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          ยอดรวม
                        </th>
                        <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          วิธีชำระเงิน
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          พนักงาน
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
                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{item.saleTime}</td>
                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                            {getCategoryLabel(item.category)}
                          </td>
                          <td className="py-4 px-6 text-sm font-semibold text-gray-800 dark:text-white">
                            {item.productName}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{item.brand || "-"}</td>
                          <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                            {numberFormatter.format(item.quantity)} {item.unit}
                          </td>
                          <td className="py-4 px-6 text-sm text-right text-gray-600 dark:text-gray-400">
                            {currencyFormatter.format(item.pricePerUnit)}
                          </td>
                          <td className="py-4 px-6 text-sm text-right font-semibold text-emerald-600 dark:text-emerald-400">
                            {currencyFormatter.format(item.totalAmount)}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border ${getPaymentMethodColor(
                                item.paymentMethod
                              )} dark:border-gray-800`}
                            >
                              {getPaymentMethodLabel(item.paymentMethod)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{item.soldBy}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700">
                        <td colSpan={4} className="py-4 px-6 text-sm font-semibold text-gray-800 dark:text-white">
                          รวมทั้งวัน
                        </td>
                        <td className="py-4 px-6 text-sm text-right font-semibold text-gray-800 dark:text-white">
                          {numberFormatter.format(dateQuantity)} หน่วย
                        </td>
                        <td colSpan={2} className="py-4 px-6 text-sm text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {currencyFormatter.format(dateTotal)}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
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

