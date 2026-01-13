import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import React from "react";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  Plus,
  X,
  Info,
  Calendar,
  History,
  Droplet,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Gauge,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});


const createNozzles = (data: { [key: string]: { meter: number | null; liters: number | null } }) => {
  const nozzles: { [key: string]: { meter: number | null; liters: number | null } } = {};
  const nozzlesList = ["1A", "1B", "1C", "1D", "1E", "1F", "2A", "2B", "2C", "2D", "2E", "2F", "3A", "3B", "3C", "3D", "3E", "3F", "4A", "4B", "4C", "4D", "4E", "4F", "5A", "5B", "5C", "5D", "5E", "5F", "6A", "6B", "6C", "6D", "6E", "6F", "7A", "7B", "7C", "7D", "7E", "7F", "8A", "8B", "8C", "8D", "8E", "8F", "9A", "9B", "9C", "9D", "9E", "9F", "10A", "10B", "10C", "10D", "10E", "10F"];
  
  nozzlesList.forEach((nozzle) => {
    nozzles[nozzle] = data[nozzle] || { meter: null, liters: null };
  });
  
  return nozzles;
};

// Helper function to get current date in Thai format (D/M/YY)
const getCurrentThaiDate = (daysOffset: number = 0) => {
  const now = new Date();
  now.setDate(now.getDate() + daysOffset);
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear() + 543; // Convert AD to Buddhist year
  const yearShort = year % 100;
  return `${day}/${month}/${yearShort}`;
};

// Helper function to get current date time string
const getCurrentDateTime = (minutesOffset: number = 0) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutesOffset);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// Helper function to parse date (D/M/YY format)
const parseDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split("/").map(Number);
  return { day, month, year: year + 2500 }; // Convert Buddhist year to AD
};

// Mock data - รายละเอียดสมุดใต้ดิน (หลายเดือน/ปี)
const generateMockData = () => {
  const allData: Array<{
    id: number;
    date: string;
    month: number;
    year: number;
    receive: number | null;
    pay: number | null;
    balance: number;
    measured: number;
    difference: number | null;
    nozzles: { [key: string]: { meter: number | null; liters: number | null } };
  }> = [];

  // สร้างข้อมูลตามเดือนปัจจุบันและเดือนก่อนหน้า

  // เดือนปัจจุบัน - ข้อมูลครบทุกวัน
  const currentMonthData = [
    { id: 1, date: getCurrentThaiDate(-6), receive: null, pay: null, balance: 18251.0, measured: 18251.0, difference: null, nozzles: { "1A": { meter: 18251.0, liters: 18251.0 } } },
    { id: 2, date: getCurrentThaiDate(-6), receive: 20000.0, pay: null, balance: 38251.0, measured: 38251.0, difference: null, nozzles: {} },
    { id: 3, date: getCurrentThaiDate(-6), receive: null, pay: 15000.0, balance: 23251.0, measured: 23216.6, difference: -34.4, nozzles: { "1A": { meter: 5000.0, liters: 5000.0 }, "1B": { meter: 3000.0, liters: 3000.0 }, "1C": { meter: 2000.0, liters: 2000.0 }, "1D": { meter: 1500.0, liters: 1500.0 }, "1E": { meter: 1000.0, liters: 1000.0 }, "1F": { meter: 2500.0, liters: 2500.0 } } },
    { id: 4, date: getCurrentThaiDate(-6), receive: null, pay: 12000.0, balance: 11251.0, measured: 11191.6, difference: -59.4, nozzles: { "1A": { meter: 4000.0, liters: 4000.0 }, "1B": { meter: 2500.0, liters: 2500.0 }, "1C": { meter: 1500.0, liters: 1500.0 }, "1D": { meter: 1000.0, liters: 1000.0 }, "1E": { meter: 500.0, liters: 500.0 }, "1F": { meter: 2500.0, liters: 2500.0 } } },
    { id: 5, date: getCurrentThaiDate(-6), receive: null, pay: 5000.0, balance: 6251.0, measured: 6236.0, difference: -15.0, nozzles: { "1A": { meter: 2000.0, liters: 2000.0 }, "1B": { meter: 1000.0, liters: 1000.0 }, "1C": { meter: 500.0, liters: 500.0 }, "1D": { meter: 500.0, liters: 500.0 }, "1E": { meter: 500.0, liters: 500.0 }, "1F": { meter: 500.0, liters: 500.0 } } },
    { id: 6, date: getCurrentThaiDate(-5), receive: null, pay: 3000.0, balance: 3251.0, measured: 3251.0, difference: null, nozzles: { "1A": { meter: 1000.0, liters: 1000.0 }, "1B": { meter: 800.0, liters: 800.0 }, "1C": { meter: 500.0, liters: 500.0 }, "1D": { meter: 300.0, liters: 300.0 }, "1E": { meter: 200.0, liters: 200.0 }, "1F": { meter: 200.0, liters: 200.0 } } },
    { id: 7, date: getCurrentThaiDate(-5), receive: 15000.0, pay: null, balance: 18251.0, measured: 18251.0, difference: null, nozzles: {} },
    { id: 8, date: getCurrentThaiDate(-4), receive: null, pay: 8000.0, balance: 10251.0, measured: 10230.0, difference: -21.0, nozzles: { "1A": { meter: 2000.0, liters: 2000.0 }, "1B": { meter: 1500.0, liters: 1500.0 }, "1C": { meter: 1000.0, liters: 1000.0 }, "1D": { meter: 1000.0, liters: 1000.0 }, "1E": { meter: 1000.0, liters: 1000.0 }, "1F": { meter: 1500.0, liters: 1500.0 } } },
    { id: 9, date: getCurrentThaiDate(-4), receive: 18000.0, pay: null, balance: 28251.0, measured: 28251.0, difference: null, nozzles: {} },
    { id: 10, date: getCurrentThaiDate(-3), receive: null, pay: 10000.0, balance: 18251.0, measured: 18240.0, difference: -11.0, nozzles: { "1A": { meter: 3000.0, liters: 3000.0 }, "1B": { meter: 2000.0, liters: 2000.0 }, "1C": { meter: 1500.0, liters: 1500.0 }, "1D": { meter: 1000.0, liters: 1000.0 }, "1E": { meter: 1000.0, liters: 1000.0 }, "1F": { meter: 1500.0, liters: 1500.0 } } },
    { id: 11, date: getCurrentThaiDate(-2), receive: null, pay: 6000.0, balance: 12251.0, measured: 12245.0, difference: -6.0, nozzles: { "1A": { meter: 2000.0, liters: 2000.0 }, "1B": { meter: 1500.0, liters: 1500.0 }, "1C": { meter: 1000.0, liters: 1000.0 }, "1D": { meter: 800.0, liters: 800.0 }, "1E": { meter: 400.0, liters: 400.0 }, "1F": { meter: 300.0, liters: 300.0 } } },
    { id: 12, date: getCurrentThaiDate(-2), receive: 22000.0, pay: null, balance: 34251.0, measured: 34251.0, difference: null, nozzles: {} },
    { id: 13, date: getCurrentThaiDate(-1), receive: null, pay: 14000.0, balance: 20251.0, measured: 20235.0, difference: -16.0, nozzles: { "1A": { meter: 5000.0, liters: 5000.0 }, "1B": { meter: 3500.0, liters: 3500.0 }, "1C": { meter: 2500.0, liters: 2500.0 }, "1D": { meter: 1500.0, liters: 1500.0 }, "1E": { meter: 1000.0, liters: 1000.0 }, "1F": { meter: 1500.0, liters: 1500.0 } } },
    { id: 14, date: getCurrentThaiDate(0), receive: null, pay: 9000.0, balance: 11251.0, measured: 11240.0, difference: -11.0, nozzles: { "1A": { meter: 3000.0, liters: 3000.0 }, "1B": { meter: 2500.0, liters: 2500.0 }, "1C": { meter: 1500.0, liters: 1500.0 }, "1D": { meter: 1000.0, liters: 1000.0 }, "1E": { meter: 500.0, liters: 500.0 }, "1F": { meter: 500.0, liters: 500.0 } } },
    { id: 15, date: getCurrentThaiDate(0), receive: 25000.0, pay: null, balance: 36251.0, measured: 36251.0, difference: null, nozzles: {} },
  ];

  // เดือนก่อนหน้า - ข้อมูลครบทุกวัน
  const prevMonthData = [
    { id: 16, date: getCurrentThaiDate(-37), receive: null, pay: null, balance: 20000.0, measured: 20000.0, difference: null, nozzles: { "1A": { meter: 20000.0, liters: 20000.0 } } },
    { id: 17, date: getCurrentThaiDate(-37), receive: 25000.0, pay: null, balance: 45000.0, measured: 45000.0, difference: null, nozzles: {} },
    { id: 18, date: getCurrentThaiDate(-37), receive: null, pay: 18000.0, balance: 27000.0, measured: 26980.0, difference: -20.0, nozzles: { "1A": { meter: 6000.0, liters: 6000.0 }, "1B": { meter: 4000.0, liters: 4000.0 }, "1C": { meter: 3000.0, liters: 3000.0 }, "1D": { meter: 2000.0, liters: 2000.0 }, "1E": { meter: 1500.0, liters: 1500.0 }, "1F": { meter: 1500.0, liters: 1500.0 } } },
    { id: 19, date: getCurrentThaiDate(-36), receive: null, pay: 12000.0, balance: 15000.0, measured: 14990.0, difference: -10.0, nozzles: { "1A": { meter: 4000.0, liters: 4000.0 }, "1B": { meter: 3000.0, liters: 3000.0 }, "1C": { meter: 2000.0, liters: 2000.0 }, "1D": { meter: 1500.0, liters: 1500.0 }, "1E": { meter: 1000.0, liters: 1000.0 }, "1F": { meter: 500.0, liters: 500.0 } } },
    { id: 20, date: getCurrentThaiDate(-36), receive: 20000.0, pay: null, balance: 35000.0, measured: 35000.0, difference: null, nozzles: {} },
    { id: 21, date: getCurrentThaiDate(-35), receive: null, pay: 11000.0, balance: 24000.0, measured: 23988.0, difference: -12.0, nozzles: { "1A": { meter: 4000.0, liters: 4000.0 }, "1B": { meter: 3000.0, liters: 3000.0 }, "1C": { meter: 2000.0, liters: 2000.0 }, "1D": { meter: 1000.0, liters: 1000.0 }, "1E": { meter: 500.0, liters: 500.0 }, "1F": { meter: 500.0, liters: 500.0 } } },
    { id: 22, date: getCurrentThaiDate(-35), receive: 22000.0, pay: null, balance: 46000.0, measured: 46000.0, difference: null, nozzles: {} },
    { id: 23, date: getCurrentThaiDate(-34), receive: null, pay: 15000.0, balance: 31000.0, measured: 30985.0, difference: -15.0, nozzles: { "1A": { meter: 5000.0, liters: 5000.0 }, "1B": { meter: 4000.0, liters: 4000.0 }, "1C": { meter: 3000.0, liters: 3000.0 }, "1D": { meter: 2000.0, liters: 2000.0 }, "1E": { meter: 1000.0, liters: 1000.0 }, "1F": { meter: 0, liters: 0 } } },
    { id: 24, date: getCurrentThaiDate(-33), receive: null, pay: 13000.0, balance: 18000.0, measured: 17990.0, difference: -10.0, nozzles: { "1A": { meter: 4500.0, liters: 4500.0 }, "1B": { meter: 3500.0, liters: 3500.0 }, "1C": { meter: 2500.0, liters: 2500.0 }, "1D": { meter: 1500.0, liters: 1500.0 }, "1E": { meter: 500.0, liters: 500.0 }, "1F": { meter: 500.0, liters: 500.0 } } },
    { id: 25, date: getCurrentThaiDate(-33), receive: 28000.0, pay: null, balance: 46000.0, measured: 46000.0, difference: null, nozzles: {} },
  ];

  // เดือนก่อนหน้า 2 - ข้อมูลครบทุกวัน
  const prevMonth2Data = [
    { id: 26, date: getCurrentThaiDate(-67), receive: null, pay: null, balance: 22000.0, measured: 22000.0, difference: null, nozzles: { "1A": { meter: 22000.0, liters: 22000.0 } } },
    { id: 27, date: getCurrentThaiDate(-67), receive: 30000.0, pay: null, balance: 52000.0, measured: 52000.0, difference: null, nozzles: {} },
    { id: 28, date: getCurrentThaiDate(-67), receive: null, pay: 20000.0, balance: 32000.0, measured: 31985.0, difference: -15.0, nozzles: { "1A": { meter: 7000.0, liters: 7000.0 }, "1B": { meter: 5000.0, liters: 5000.0 }, "1C": { meter: 3000.0, liters: 3000.0 }, "1D": { meter: 2500.0, liters: 2500.0 }, "1E": { meter: 1500.0, liters: 1500.0 }, "1F": { meter: 1000.0, liters: 1000.0 } } },
    { id: 29, date: getCurrentThaiDate(-66), receive: null, pay: 15000.0, balance: 17000.0, measured: 16995.0, difference: -5.0, nozzles: { "1A": { meter: 5000.0, liters: 5000.0 }, "1B": { meter: 4000.0, liters: 4000.0 }, "1C": { meter: 3000.0, liters: 3000.0 }, "1D": { meter: 2000.0, liters: 2000.0 }, "1E": { meter: 1000.0, liters: 1000.0 }, "1F": { meter: 0, liters: 0 } } },
    { id: 30, date: getCurrentThaiDate(-66), receive: 25000.0, pay: null, balance: 42000.0, measured: 42000.0, difference: null, nozzles: {} },
    { id: 31, date: getCurrentThaiDate(-65), receive: null, pay: 18000.0, balance: 24000.0, measured: 23980.0, difference: -20.0, nozzles: { "1A": { meter: 6000.0, liters: 6000.0 }, "1B": { meter: 5000.0, liters: 5000.0 }, "1C": { meter: 4000.0, liters: 4000.0 }, "1D": { meter: 2000.0, liters: 2000.0 }, "1E": { meter: 1000.0, liters: 1000.0 }, "1F": { meter: 0, liters: 0 } } },
    { id: 32, date: getCurrentThaiDate(-64), receive: null, pay: 12000.0, balance: 12000.0, measured: 11990.0, difference: -10.0, nozzles: { "1A": { meter: 4000.0, liters: 4000.0 }, "1B": { meter: 3500.0, liters: 3500.0 }, "1C": { meter: 2500.0, liters: 2500.0 }, "1D": { meter: 1500.0, liters: 1500.0 }, "1E": { meter: 500.0, liters: 500.0 }, "1F": { meter: 0, liters: 0 } } },
    { id: 33, date: getCurrentThaiDate(-64), receive: 32000.0, pay: null, balance: 44000.0, measured: 44000.0, difference: null, nozzles: {} },
  ];

  // รวมข้อมูลทั้งหมด
  [...currentMonthData, ...prevMonthData, ...prevMonth2Data].forEach((item) => {
    const { month, year } = parseDate(item.date);
    // แปลง nozzles ให้เป็นรูปแบบที่ถูกต้อง
    const formattedNozzles: { [key: string]: { meter: number | null; liters: number | null } } = {};
    const nozzlesObj = item.nozzles as { [key: string]: { meter?: number; liters?: number } | undefined };
    Object.keys(nozzlesObj).forEach((key) => {
      const nozzle = nozzlesObj[key];
      if (nozzle) {
        formattedNozzles[key] = {
          meter: nozzle.meter ?? null,
          liters: nozzle.liters ?? null,
        };
      }
    });
    allData.push({
      ...item,
      month,
      year,
      nozzles: createNozzles(formattedNozzles),
    });
  });

  return allData;
};

const mockUndergroundBookDetail = generateMockData();

// Mock data - สรุปสถานะ
const mockUndergroundBook = [
  {
    branch: "ปั๊มไฮโซ",
    pit: "หลุม 1",
    oilType: "Premium Diesel",
    openingStock: 85000,
    received: 20000,
    sold: 15000,
    closingStock: 90000,
    gainLoss: 0,
    gainLossPercent: 0,
    status: "กรอกแล้ว",
    enteredAt: getCurrentDateTime(-5),
    enteredBy: "ผู้จัดการสาขา",
  },
  {
    branch: "ปั๊มไฮโซ",
    pit: "หลุม 2",
    oilType: "Gasohol 95",
    openingStock: 75000,
    received: 15000,
    sold: 12000,
    closingStock: 78000,
    gainLoss: 0,
    gainLossPercent: 0,
    status: "กรอกแล้ว",
    enteredAt: getCurrentDateTime(-10),
    enteredBy: "ผู้จัดการสาขา",
  },
  {
    branch: "ปั๊มไฮโซ",
    pit: "หลุม 3",
    oilType: "Diesel",
    openingStock: 60000,
    received: 18000,
    sold: 15000,
    closingStock: 63000,
    gainLoss: 0,
    gainLossPercent: 0,
    status: "รอกรอก",
    enteredAt: null,
    enteredBy: null,
  },
  {
    branch: "ดินดำ",
    pit: "หลุม 1",
    oilType: "Gasohol 95",
    openingStock: 65000,
    received: 15000,
    sold: 12000,
    closingStock: 68000,
    gainLoss: 0,
    gainLossPercent: 0,
    status: "กรอกแล้ว",
    enteredAt: getCurrentDateTime(-15),
    enteredBy: "ผู้จัดการสาขา",
  },
  {
    branch: "หนองจิก",
    pit: "หลุม 1",
    oilType: "Diesel",
    openingStock: 50000,
    received: 18000,
    sold: 15000,
    closingStock: 53000,
    gainLoss: 0,
    gainLossPercent: 0,
    status: "รอกรอก",
    enteredAt: null,
    enteredBy: null,
  },
];

// Mock user role - ใน production จะมาจาก auth context หรือ API
const getCurrentUserRole = () => {
  // Mock: ถ้าเป็น role ปั๊มไฮโซ จะ return "ปั๊มไฮโซ"
  // ใน production จะอ่านจาก localStorage หรือ auth context
  return localStorage.getItem("user_branch") || "admin"; // "admin" = เห็นทุกสาขา, "ปั๊มไฮโซ" = เห็นเฉพาะปั๊มไฮโซ
};

export default function UndergroundBook() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<{
    date: string;
  }>({
    date: "ทั้งหมด"
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'date', direction: 'desc' });
  // ใช้เดือนและปีปัจจุบัน
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear() + 543; // Buddhist year
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth); // เดือนปัจจุบัน
  const [selectedYear, setSelectedYear] = useState<number>(currentYear); // ปีปัจจุบัน
  
  // ตรวจสอบ role ของผู้ใช้
  const userBranch = getCurrentUserRole();
  const isBranchUser = userBranch !== "admin" && userBranch !== null;
  const userBranchName = isBranchUser ? userBranch : null;

  // กรองข้อมูลตาม role
  let availableData = mockUndergroundBook;
  if (isBranchUser && userBranchName) {
    // ถ้าเป็น role ปั๊มไฮโซ จะเห็นเฉพาะข้อมูลของปั๊มไฮโซ
    availableData = mockUndergroundBook.filter((item) => item.branch === userBranchName);
  }

  // กรองข้อมูลรายละเอียดตามเดือน/ปีที่เลือก
  const filteredDetailData = mockUndergroundBookDetail.filter(
    (item) => item.month === selectedMonth && item.year === selectedYear
  );

  // รวมข้อมูลที่วันที่เดียวกันและเรียงตามวันที่
  const groupedAndSortedData = React.useMemo(() => {
    // จัดกลุ่มตามวันที่
    const groupedByDate: { [key: string]: typeof filteredDetailData } = {};
    
    filteredDetailData.forEach((item) => {
      if (!groupedByDate[item.date]) {
        groupedByDate[item.date] = [];
      }
      groupedByDate[item.date].push(item);
    });

    // รวมข้อมูลในแต่ละวันที่
    const mergedData = Object.keys(groupedByDate)
      .map((date) => {
        const items = groupedByDate[date];
        // เรียงตาม id เพื่อให้ได้ลำดับที่ถูกต้อง
        items.sort((a, b) => a.id - b.id);

        // รวมข้อมูล
        let totalReceive = 0;
        let totalPay = 0;
        // ใช้ balance และ measured จากรายการสุดท้าย (ยอดสุดท้ายของวัน)
        const finalBalance = items[items.length - 1].balance;
        const finalMeasured = items[items.length - 1].measured;
        // ใช้ difference จากรายการสุดท้าย (ผลต่างสุดท้ายของวัน)
        const finalDifference = items[items.length - 1].difference;
        const mergedNozzles: { [key: string]: { meter: number; liters: number } } = {};

        items.forEach((item) => {
          if (item.receive !== null) totalReceive += item.receive;
          if (item.pay !== null) totalPay += item.pay;

          // รวม nozzles (บวกค่าทั้งหมด)
          Object.keys(item.nozzles).forEach((nozzleKey) => {
            if (!mergedNozzles[nozzleKey]) {
              mergedNozzles[nozzleKey] = { meter: 0, liters: 0 };
            }
            const nozzle = item.nozzles[nozzleKey];
            if (nozzle.meter !== null) mergedNozzles[nozzleKey].meter += nozzle.meter;
            if (nozzle.liters !== null) mergedNozzles[nozzleKey].liters += nozzle.liters;
          });
        });

        // แปลง mergedNozzles ให้เป็นรูปแบบที่ต้องการ
        const formattedNozzles: { [key: string]: { meter: number | null; liters: number | null } } = {};
        Object.keys(mergedNozzles).forEach((key) => {
          formattedNozzles[key] = {
            meter: mergedNozzles[key].meter > 0 ? mergedNozzles[key].meter : null,
            liters: mergedNozzles[key].liters > 0 ? mergedNozzles[key].liters : null,
          };
        });

        return {
          id: items[0].id,
          date: date,
          month: items[0].month,
          year: items[0].year,
          receive: totalReceive > 0 ? totalReceive : null,
          pay: totalPay > 0 ? totalPay : null,
          balance: finalBalance,
          measured: finalMeasured,
          difference: finalDifference,
          nozzles: createNozzles(formattedNozzles),
        };
      })
      .sort((a, b) => {
        // เรียงตามวันที่
        const [dayA, monthA, yearA] = a.date.split("/").map(Number);
        const [dayB, monthB, yearB] = b.date.split("/").map(Number);
        if (yearA !== yearB) return yearA - yearB;
        if (monthA !== monthB) return monthA - monthB;
        return dayA - dayB;
      });

    return mergedData;
  }, [filteredDetailData]);


  const getDifferenceColor = (diff: number) => {
    if (diff === 0) return "text-gray-600 dark:text-gray-400";
    if (diff < 0) return "text-red-600 dark:text-red-400";
    return "text-emerald-600 dark:text-emerald-400";
  };

  const handleImportData = () => {
    // In real app, this would import data from Excel or API
    console.log("Importing underground book data...");
    setShowImportModal(false);
  };

  // คำนวณ summary จากข้อมูลที่กรองแล้ว
  const completedCount = availableData.filter((item) => item.status === "กรอกแล้ว").length;
  const pendingCount = availableData.filter((item) => item.status === "รอกรอก").length;
  const overdueCount = availableData.filter((item) => item.status === "เกินเวลา").length;

  // Filter and sort logic
  const filteredAndSortedData = useMemo(() => {
    let result = [...groupedAndSortedData];

    // Search filter
    if (searchTerm) {
      result = result.filter(item => 
        item.date.includes(searchTerm) ||
        (item.receive !== null && numberFormatter.format(item.receive).includes(searchTerm)) ||
        (item.pay !== null && numberFormatter.format(item.pay).includes(searchTerm))
      );
    }

    // Date filter
    if (columnFilters.date !== "ทั้งหมด") {
      // Can add more date filtering logic here if needed
    }

    // Sort
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case 'date': {
            const [dayA, monthA, yearA] = a.date.split("/").map(Number);
            const [dayB, monthB, yearB] = b.date.split("/").map(Number);
            aValue = new Date(yearA - 543, monthA - 1, dayA).getTime();
            bValue = new Date(yearB - 543, monthB - 1, dayB).getTime();
            break;
          }
          case 'receive':
            aValue = a.receive || 0;
            bValue = b.receive || 0;
            break;
          case 'pay':
            aValue = a.pay || 0;
            bValue = b.pay || 0;
            break;
          case 'balance':
            aValue = a.balance;
            bValue = b.balance;
            break;
          case 'measured':
            aValue = a.measured;
            bValue = b.measured;
            break;
          case 'difference':
            aValue = a.difference || 0;
            bValue = b.difference || 0;
            break;
          default:
            aValue = (a as any)[sortConfig.key];
            bValue = (b as any)[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [groupedAndSortedData, searchTerm, columnFilters, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key, direction: null };
        return { key, direction: 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key || !sortConfig.direction) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-emerald-500" /> : <ChevronDown className="w-3 h-3 text-emerald-500" />;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setColumnFilters({ date: "ทั้งหมด" });
    setSortConfig({ key: 'date', direction: 'desc' });
  };

  const isAnyFilterActive = searchTerm !== "" || columnFilters.date !== "ทั้งหมด" || (sortConfig.key && sortConfig.direction);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Droplet className="w-8 h-8 text-white" />
              </div>
              สมุดน้ำมันใต้ดิน
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
              <History className="w-4 h-4" />
              {isBranchUser 
                ? `บันทึกยอดน้ำมันใต้ดิน - ${userBranchName} (16:00-17:30 น.)`
                : "บันทึกยอดน้ำมันใต้ดินทั้ง 5 สาขา (16:00-17:30 น.)"
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold transition-all active:scale-95 flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Import ข้อมูล
            </button>
            <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              กรอกยอดใต้ดิน
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">กรอกแล้ว</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{completedCount} สาขา</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รอกรอก</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{pendingCount} สาขา</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">เกินเวลา</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{overdueCount} สาขา</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาวันที่, รับ, จ่าย..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all duration-200 text-sm font-medium"
            >
              <option value={1}>มกราคม</option>
              <option value={2}>กุมภาพันธ์</option>
              <option value={3}>มีนาคม</option>
              <option value={4}>เมษายน</option>
              <option value={5}>พฤษภาคม</option>
              <option value={6}>มิถุนายน</option>
              <option value={7}>กรกฎาคม</option>
              <option value={8}>สิงหาคม</option>
              <option value={9}>กันยายน</option>
              <option value={10}>ตุลาคม</option>
              <option value={11}>พฤศจิกายน</option>
              <option value={12}>ธันวาคม</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-gray-800 dark:text-white transition-all duration-200 text-sm font-medium"
            >
              <option value={2565}>2565</option>
              <option value={2566}>2566</option>
              <option value={2567}>2567</option>
              <option value={2568}>2568</option>
              <option value={2569}>2569</option>
            </select>
          </div>
          {isAnyFilterActive && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              ล้างตัวกรอง
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shrink-0">
            <Gauge className="w-4 h-4" />
            <span className="text-sm font-bold whitespace-nowrap">
              พบ {filteredAndSortedData.length} วัน
            </span>
          </div>
        </div>
      </div>


      {/* Underground Book Detail Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <th 
                  rowSpan={2}
                  className="sticky left-0 z-10 px-6 py-4 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-r border-gray-200 dark:border-gray-700 align-middle bg-gray-50/50 dark:bg-gray-900/50 min-w-[90px]"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center justify-center gap-2">
                    ว/ด/ป
                    {getSortIcon('date')}
                  </div>
                </th>
                <th 
                  rowSpan={2}
                  className="sticky left-[90px] z-10 px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-r border-gray-200 dark:border-gray-700 align-middle bg-gray-50/50 dark:bg-gray-900/50 min-w-[100px]"
                  onClick={() => handleSort('receive')}
                >
                  <div className="flex items-center justify-end gap-2">
                    รับ
                    {getSortIcon('receive')}
                  </div>
                </th>
                <th 
                  rowSpan={2}
                  className="sticky left-[190px] z-10 px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-r border-gray-200 dark:border-gray-700 align-middle bg-gray-50/50 dark:bg-gray-900/50 min-w-[100px]"
                  onClick={() => handleSort('pay')}
                >
                  <div className="flex items-center justify-end gap-2">
                    จ่าย
                    {getSortIcon('pay')}
                  </div>
                </th>
                <th 
                  rowSpan={2}
                  className="sticky left-[290px] z-10 px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-r border-gray-200 dark:border-gray-700 align-middle bg-gray-50/50 dark:bg-gray-900/50 min-w-[120px]"
                  onClick={() => handleSort('balance')}
                >
                  <div className="flex items-center justify-end gap-2">
                    คงเหลือ
                    {getSortIcon('balance')}
                  </div>
                </th>
                <th 
                  rowSpan={2}
                  className="sticky left-[410px] z-10 px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-r border-gray-200 dark:border-gray-700 align-middle bg-gray-50/50 dark:bg-gray-900/50 min-w-[120px]"
                  onClick={() => handleSort('measured')}
                >
                  <div className="flex items-center justify-end gap-2">
                    วัดจริง
                    {getSortIcon('measured')}
                  </div>
                </th>
                <th 
                  rowSpan={2}
                  className="sticky left-[530px] z-10 px-6 py-4 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-r border-gray-200 dark:border-gray-700 align-middle bg-gray-50/50 dark:bg-gray-900/50 min-w-[120px]"
                  onClick={() => handleSort('difference')}
                >
                  <div className="flex items-center justify-end gap-2">
                    ขาด/เกิน<br/>(+/-)
                    {getSortIcon('difference')}
                  </div>
                </th>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) =>
                  ["A", "B", "C", "D", "E", "F"].map((letter) => (
                    <th
                      key={`${num}${letter}`}
                      colSpan={2}
                      className={`text-center py-2 px-1 ${
                        num === 10 && letter === "F" ? "" : "border-r border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {num}{letter}
                    </th>
                  ))
                )}
              </tr>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) =>
                  ["A", "B", "C", "D", "E", "F"].map((letter) => (
                    <React.Fragment key={`${num}${letter}`}>
                      <th
                        className={`text-center py-2 px-1 border-r border-gray-200 dark:border-gray-700`}
                      >
                        เลข<br/>มิเตอร์
                      </th>
                      <th
                        className={`text-center py-2 px-1 ${
                          num === 10 && letter === "F" ? "" : "border-r border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        จำนวน<br/>ลิตร
                      </th>
                    </React.Fragment>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                  }`}
                >
                  <td className={`sticky left-0 z-10 text-center py-2 px-3 text-gray-800 dark:text-white border-r border-gray-200 dark:border-gray-700 font-medium min-w-[90px] ${
                    index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                  }`}>{row.date}</td>
                  <td className={`sticky left-[90px] z-10 text-right py-2 px-3 text-emerald-600 dark:text-emerald-400 border-r border-gray-200 dark:border-gray-700 font-medium min-w-[100px] ${
                    index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                  }`}>{row.receive !== null ? numberFormatter.format(row.receive) : "-"}</td>
                  <td className={`sticky left-[190px] z-10 text-right py-2 px-3 text-red-600 dark:text-red-400 border-r border-gray-200 dark:border-gray-700 font-medium min-w-[100px] ${
                    index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                  }`}>{row.pay !== null ? numberFormatter.format(row.pay) : "-"}</td>
                  <td className={`sticky left-[290px] z-10 text-right py-2 px-3 text-gray-800 dark:text-white font-semibold border-r border-gray-200 dark:border-gray-700 min-w-[120px] ${
                    index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                  }`}>{numberFormatter.format(row.balance)}</td>
                  <td className={`sticky left-[410px] z-10 text-right py-2 px-3 text-gray-800 dark:text-white border-r border-gray-200 dark:border-gray-700 min-w-[120px] ${
                    index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                  }`}>{numberFormatter.format(row.measured)}</td>
                  <td className={`sticky left-[530px] z-10 text-right py-2 px-3 font-semibold border-r border-gray-200 dark:border-gray-700 min-w-[120px] ${getDifferenceColor(row.difference || 0)} ${
                    index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"
                  }`}>
                    {row.difference !== null ? (row.difference > 0 ? '+' : '') + numberFormatter.format(row.difference) : '-'}
                  </td>
                  {/* หัวจ่าย 1A-10F */}
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) =>
                    ["A", "B", "C", "D", "E", "F"].map((letter) => {
                      const nozzleKey = `${num}${letter}`;
                      const isLast = num === 10 && letter === "F";
                      return (
                        <React.Fragment key={nozzleKey}>
                          <td className={`text-right py-2 px-1 text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700`}>
                            {row.nozzles[nozzleKey]?.meter !== null ? numberFormatter.format(row.nozzles[nozzleKey].meter) : "-"}
                          </td>
                          <td className={`text-right py-2 px-1 text-gray-600 dark:text-gray-400 ${isLast ? "" : "border-r border-gray-200 dark:border-gray-700"}`}>
                            {row.nozzles[nozzleKey]?.liters !== null ? numberFormatter.format(row.nozzles[nozzleKey].liters) : "-"}
                          </td>
                        </React.Fragment>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImportModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white">
                        Import ข้อมูลสมุดใต้ดิน
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        นำเข้าข้อมูลสมุดใต้ดินจากไฟล์ Excel
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110 active:scale-95"
                    aria-label="ปิด"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        รูปแบบไฟล์ที่รองรับ
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ไฟล์ Excel (.xlsx, .xls)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ไฟล์ CSV (.csv)
                        </li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                            วิธีการ Import
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            เลือกไฟล์ Excel หรือ CSV ที่มีข้อมูลสมุดใต้ดิน ระบบจะอ่านข้อมูลและนำเข้าให้อัตโนมัติ
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm">
                      <label className="text-sm font-semibold text-gray-800 dark:text-white mb-2 block">
                        เลือกไฟล์
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          คลิกเพื่อเลือกไฟล์หรือลากไฟล์มาวางที่นี่
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          รองรับไฟล์ .xlsx, .xls, .csv
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-5 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleImportData}
                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Import ข้อมูล
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
