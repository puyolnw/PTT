import { motion } from "framer-motion";
import { useState } from "react";
import { Droplet, BookOpen, Calendar, Filter } from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

type TankEntry = {
  date: string;
  fullDate: Date; // วันที่แบบเต็มสำหรับการกรอง
  tankCode: string; // เช่น "34 HSD", "83 E 20", "18 63H95"
  quantity: number; // จำนวนลิตร
  price1: number; // ราคาต่อลิตร (คอลัมน์ที่ 3)
  price2: number; // ราคาต่อลิตร (คอลัมน์ที่ 4) บางตัวมี .90
  totalAmount: number; // ยอดรวม
  pumpCode: string; // รหัสหัวจ่าย เช่น "P18", "P26"
  description: string; // คำอธิบาย เช่น "E สินสา", "B หนอง"
};

// ฟังก์ชันสร้างวันที่ในรูปแบบ ด/ป/ว (เช่น 15/12/67)
const formatDateThai = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = (date.getFullYear() + 543) % 100; // แปลงเป็น พ.ศ. และเอา 2 หลักสุดท้าย
  return `${day}/${month}/${year}`;
};

// สร้างวันที่เริ่มต้น (วันนี้)
const today = new Date();
const generateDateForDay = (daysAgo: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return formatDateThai(date);
};

const getFullDateForDay = (daysAgo: number): Date => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date;
};

// Mock data เลียนแบบสมุดจริง - 6 วัน (วันนี้ + 5 วันก่อนหน้า)
const mockTankEntries: TankEntry[] = [
  // วันนี้ (วันที่ 0)
  {
    date: generateDateForDay(0),
    fullDate: getFullDateForDay(0),
    tankCode: "34 HSD",
    quantity: 8500,
    price1: 33.49,
    price2: 33.89,
    totalAmount: 3800,
    pumpCode: "P18",
    description: "E สินสา",
  },
  {
    date: generateDateForDay(0),
    fullDate: getFullDateForDay(0),
    tankCode: "83 E 20",
    quantity: 7200,
    price1: 34.79,
    price2: 33.59,
    totalAmount: 7500,
    pumpCode: "P26",
    description: "B หนอง",
  },
  {
    date: generateDateForDay(0),
    fullDate: getFullDateForDay(0),
    tankCode: "18 63H95",
    quantity: 4500,
    price1: 36.90,
    price2: 36.00,
    totalAmount: 2000,
    pumpCode: "P59",
    description: "B 5",
  },
  {
    date: generateDateForDay(0),
    fullDate: getFullDateForDay(0),
    tankCode: "59 69H91",
    quantity: 2200,
    price1: 36.53,
    price2: 35.63,
    totalAmount: 10200,
    pumpCode: "P67",
    description: "B สมาคม",
  },
  {
    date: generateDateForDay(0),
    fullDate: getFullDateForDay(0),
    tankCode: "34 HSD",
    quantity: 12000,
    price1: 33.49,
    price2: 33.89,
    totalAmount: 6800,
    pumpCode: "P18",
    description: "E สินสา",
  },
  // วันที่ 1 (เมื่อวาน)
  {
    date: generateDateForDay(1),
    fullDate: getFullDateForDay(1),
    tankCode: "34 HSD",
    quantity: 8000,
    price1: 33.49,
    price2: 33.89,
    totalAmount: 3600,
    pumpCode: "P18",
    description: "E สินสา",
  },
  {
    date: generateDateForDay(1),
    fullDate: getFullDateForDay(1),
    tankCode: "83 E 20",
    quantity: 7000,
    price1: 34.79,
    price2: 33.59,
    totalAmount: 7200,
    pumpCode: "P26",
    description: "B หนอง",
  },
  {
    date: generateDateForDay(1),
    fullDate: getFullDateForDay(1),
    tankCode: "18 63H95",
    quantity: 4000,
    price1: 36.90,
    price2: 36.00,
    totalAmount: 1800,
    pumpCode: "P59",
    description: "B 5",
  },
  {
    date: generateDateForDay(1),
    fullDate: getFullDateForDay(1),
    tankCode: "59 69H91",
    quantity: 2000,
    price1: 36.53,
    price2: 35.63,
    totalAmount: 9900,
    pumpCode: "P67",
    description: "B สมาคม",
  },
  {
    date: generateDateForDay(1),
    fullDate: getFullDateForDay(1),
    tankCode: "34 HSD",
    quantity: 11000,
    price1: 33.49,
    price2: 33.89,
    totalAmount: 6300,
    pumpCode: "P18",
    description: "E สินสา",
  },
  {
    date: generateDateForDay(1),
    fullDate: getFullDateForDay(1),
    tankCode: "83 E 20",
    quantity: 1000,
    price1: 34.79,
    price2: 33.59,
    totalAmount: 900,
    pumpCode: "P26",
    description: "B หนอง",
  },
  // วันที่ 2
  {
    date: generateDateForDay(2),
    fullDate: getFullDateForDay(2),
    tankCode: "34 HSD",
    quantity: 9000,
    price1: 33.49,
    price2: 33.89,
    totalAmount: 4000,
    pumpCode: "P18",
    description: "E สินสา",
  },
  {
    date: generateDateForDay(2),
    fullDate: getFullDateForDay(2),
    tankCode: "83 E 20",
    quantity: 6500,
    price1: 34.79,
    price2: 33.59,
    totalAmount: 6800,
    pumpCode: "P26",
    description: "B หนอง",
  },
  {
    date: generateDateForDay(2),
    fullDate: getFullDateForDay(2),
    tankCode: "18 63H95",
    quantity: 3800,
    price1: 36.90,
    price2: 36.00,
    totalAmount: 1700,
    pumpCode: "P59",
    description: "B 5",
  },
  {
    date: generateDateForDay(2),
    fullDate: getFullDateForDay(2),
    tankCode: "59 69H91",
    quantity: 2500,
    price1: 36.53,
    price2: 35.63,
    totalAmount: 10500,
    pumpCode: "P67",
    description: "B สมาคม",
  },
  {
    date: generateDateForDay(2),
    fullDate: getFullDateForDay(2),
    tankCode: "34 HSD",
    quantity: 10500,
    price1: 33.49,
    price2: 33.89,
    totalAmount: 6000,
    pumpCode: "P18",
    description: "E สินสา",
  },
  // วันที่ 3
  {
    date: generateDateForDay(3),
    fullDate: getFullDateForDay(3),
    tankCode: "34 HSD",
    quantity: 7500,
    price1: 33.49,
    price2: 33.89,
    totalAmount: 3400,
    pumpCode: "P18",
    description: "E สินสา",
  },
  {
    date: generateDateForDay(3),
    fullDate: getFullDateForDay(3),
    tankCode: "83 E 20",
    quantity: 6800,
    price1: 34.79,
    price2: 33.59,
    totalAmount: 7000,
    pumpCode: "P26",
    description: "B หนอง",
  },
  {
    date: generateDateForDay(3),
    fullDate: getFullDateForDay(3),
    tankCode: "18 63H95",
    quantity: 4200,
    price1: 36.90,
    price2: 36.00,
    totalAmount: 1900,
    pumpCode: "P59",
    description: "B 5",
  },
  {
    date: generateDateForDay(3),
    fullDate: getFullDateForDay(3),
    tankCode: "59 69H91",
    quantity: 1800,
    price1: 36.53,
    price2: 35.63,
    totalAmount: 9500,
    pumpCode: "P67",
    description: "B สมาคม",
  },
  {
    date: generateDateForDay(3),
    fullDate: getFullDateForDay(3),
    tankCode: "34 HSD",
    quantity: 11500,
    price1: 33.49,
    price2: 33.89,
    totalAmount: 6500,
    pumpCode: "P18",
    description: "E สินสา",
  },
  {
    date: generateDateForDay(3),
    fullDate: getFullDateForDay(3),
    tankCode: "83 E 20",
    quantity: 1200,
    price1: 34.79,
    price2: 33.59,
    totalAmount: 1000,
    pumpCode: "P26",
    description: "B หนอง",
  },
  // วันที่ 4
  {
    date: generateDateForDay(4),
    fullDate: getFullDateForDay(4),
    tankCode: "34 HSD",
    quantity: 8200,
    price1: 33.49,
    price2: 33.89,
    totalAmount: 3700,
    pumpCode: "P18",
    description: "E สินสา",
  },
  {
    date: generateDateForDay(4),
    fullDate: getFullDateForDay(4),
    tankCode: "83 E 20",
    quantity: 7100,
    price1: 34.79,
    price2: 33.59,
    totalAmount: 7300,
    pumpCode: "P26",
    description: "B หนอง",
  },
  {
    date: generateDateForDay(4),
    fullDate: getFullDateForDay(4),
    tankCode: "18 63H95",
    quantity: 4100,
    price1: 36.90,
    price2: 36.00,
    totalAmount: 1850,
    pumpCode: "P59",
    description: "B 5",
  },
  {
    date: generateDateForDay(4),
    fullDate: getFullDateForDay(4),
    tankCode: "59 69H91",
    quantity: 2100,
    price1: 36.53,
    price2: 35.63,
    totalAmount: 9800,
    pumpCode: "P67",
    description: "B สมาคม",
  },
  {
    date: generateDateForDay(4),
    fullDate: getFullDateForDay(4),
    tankCode: "34 HSD",
    quantity: 10800,
    price1: 33.49,
    price2: 33.89,
    totalAmount: 6200,
    pumpCode: "P18",
    description: "E สินสา",
  },
  // วันที่ 5
  {
    date: generateDateForDay(5),
    fullDate: getFullDateForDay(5),
    tankCode: "34 HSD",
    quantity: 8800,
    price1: 33.49,
    price2: 33.89,
    totalAmount: 3900,
    pumpCode: "P18",
    description: "E สินสา",
  },
  {
    date: generateDateForDay(5),
    fullDate: getFullDateForDay(5),
    tankCode: "83 E 20",
    quantity: 6900,
    price1: 34.79,
    price2: 33.59,
    totalAmount: 7100,
    pumpCode: "P26",
    description: "B หนอง",
  },
  {
    date: generateDateForDay(5),
    fullDate: getFullDateForDay(5),
    tankCode: "18 63H95",
    quantity: 3900,
    price1: 36.90,
    price2: 36.00,
    totalAmount: 1750,
    pumpCode: "P59",
    description: "B 5",
  },
  {
    date: generateDateForDay(5),
    fullDate: getFullDateForDay(5),
    tankCode: "59 69H91",
    quantity: 2300,
    price1: 36.53,
    price2: 35.63,
    totalAmount: 10100,
    pumpCode: "P67",
    description: "B สมาคม",
  },
  {
    date: generateDateForDay(5),
    fullDate: getFullDateForDay(5),
    tankCode: "34 HSD",
    quantity: 11200,
    price1: 33.49,
    price2: 33.89,
    totalAmount: 6400,
    pumpCode: "P18",
    description: "E สินสา",
  },
  {
    date: generateDateForDay(5),
    fullDate: getFullDateForDay(5),
    tankCode: "83 E 20",
    quantity: 1100,
    price1: 34.79,
    price2: 33.59,
    totalAmount: 950,
    pumpCode: "P26",
    description: "B หนอง",
  },
];

export default function TankEntryBook() {
  const totalQuantity = mockTankEntries.reduce((sum, e) => sum + e.quantity, 0);
  const totalAmount = mockTankEntries.reduce((sum, e) => sum + e.totalAmount, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-teal-500" />
          สมุดน้ำมันลงหลุม
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          บันทึกรายการน้ำมันที่ลงหลุมใต้ดิน แยกตามรหัสหลุม ประเภทน้ำมัน และหัวจ่าย
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Droplet className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">รวมจำนวนลิตร</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {integerFormatter.format(totalQuantity)} ลิตร
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Droplet className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">รวมยอดเงิน</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {numberFormatter.format(totalAmount)} บาท
            </p>
          </div>
        </motion.div>
      </div>

      {/* Tank Entry Book Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              สมุดน้ำมันลงหลุม (รูปแบบสมุดบันทึก)
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              บันทึกรายการน้ำมันที่ลงหลุม แยกตามรหัสหลุม/ประเภทน้ำมัน จำนวนลิตร ราคา และหัวจ่าย
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
                <th className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                  ด/ป/ว / รหัสหลุม
                </th>
                <th className="py-3 px-3 text-right font-semibold text-gray-600 dark:text-gray-300">
                  จำนวน (ลิตร)
                </th>
                <th className="py-3 px-3 text-right font-semibold text-gray-600 dark:text-gray-300">
                  ราคา 1
                </th>
                <th className="py-3 px-3 text-right font-semibold text-gray-600 dark:text-gray-300">
                  ราคา 2
                </th>
                <th className="py-3 px-3 text-right font-semibold text-gray-600 dark:text-gray-300">
                  ยอดรวม
                </th>
                <th className="py-3 px-3 text-center font-semibold text-gray-600 dark:text-gray-300 border-l border-gray-200 dark:border-gray-700">
                  หัวจ่าย / คำอธิบาย
                </th>
              </tr>
            </thead>
            <tbody>
              {mockTankEntries.map((entry, index) => {
                // ตรวจสอบว่าเป็นวันใหม่หรือไม่ (date เปลี่ยนจากแถวก่อนหน้า)
                const isNewDay = index === 0 || mockTankEntries[index - 1].date !== entry.date;

                return (
                  <motion.tr
                    key={`${entry.date}-${entry.tankCode}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/40 ${isNewDay ? "border-t-2 border-gray-300 dark:border-gray-600" : ""
                      }`}
                  >
                    {/* ด/ป/ว / รหัสหลุม */}
                    <td className="py-2 px-3 text-left font-semibold text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{entry.date}</span>
                        <span>{entry.tankCode}</span>
                      </div>
                    </td>
                    {/* จำนวน (ลิตร) */}
                    <td className="py-2 px-3 text-right text-gray-800 dark:text-gray-100">
                      {integerFormatter.format(entry.quantity)}
                    </td>
                    {/* ราคา 1 */}
                    <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-200">
                      {numberFormatter.format(entry.price1)}
                    </td>
                    {/* ราคา 2 */}
                    <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-200">
                      {numberFormatter.format(entry.price2)}
                      {entry.price2 % 1 === 0.9 && <span className="text-gray-500">.90</span>}
                    </td>
                    {/* ยอดรวม */}
                    <td className="py-2 px-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                      {integerFormatter.format(entry.totalAmount)}
                    </td>
                    {/* หัวจ่าย / คำอธิบาย */}
                    <td className="py-2 px-3 text-left text-gray-700 dark:text-gray-200 border-l border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col">
                        <span className="font-semibold">{entry.pumpCode}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{entry.description}</span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
            {/* Footer Summary */}
            <tfoot>
              <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60">
                <td className="py-2 px-3 text-left font-bold text-gray-800 dark:text-white border-r border-gray-200 dark:border-gray-700">
                  รวม
                </td>
                <td className="py-2 px-3 text-right font-bold text-gray-800 dark:text-white">
                  {integerFormatter.format(totalQuantity)}
                </td>
                <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400" colSpan={2}>
                  -
                </td>
                <td className="py-2 px-3 text-right font-bold text-gray-800 dark:text-white">
                  {integerFormatter.format(totalAmount)}
                </td>
                <td className="py-2 px-3 text-left text-gray-600 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700">
                  -
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
