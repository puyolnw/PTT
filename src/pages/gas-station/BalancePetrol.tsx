import { motion } from "framer-motion";
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Droplet,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
});

type PumpCode =
  | "P18"
  | "P26"
  | "P34"
  | "P42"
  | "P59"
  | "P67"
  | "P75"
  | "P83"
  | "P91"
  | "P99";

type ProductCode = "D87" | "B" | "GSH95";

type BalanceRow = {
  date: string;
  receive: number;
  pay: number;
  balance: number;
  pumps: Record<PumpCode, number>;
  products: Record<ProductCode, number>;
};

const pumpCodes: PumpCode[] = [
  "P18",
  "P26",
  "P34",
  "P42",
  "P59",
  "P67",
  "P75",
  "P83",
  "P91",
  "P99",
];

const productPrices: Record<ProductCode, number> = {
  D87: 32.49,
  B: 54.0,
  GSH95: 41.49,
};

// Mock data เลียนแบบสมุดจริง (ตัวเลขสมมติ)
const mockBalanceRows: BalanceRow[] = [
  {
    date: "20/5/68",
    receive: 297430,
    pay: 442762.19,
    balance: 2393153.86,
    pumps: {
      P18: 17005.3,
      P26: 5377,
      P34: 3562.6,
      P42: 4662.2,
      P59: 0,
      P67: 0,
      P75: 4407.5,
      P83: 3623.8,
      P91: 4529.8,
      P99: 3323.9,
    },
    products: {
      D87: 29873.5,
      B: 12540.2,
      GSH95: 8740.0,
    },
  },
  {
    date: "21",
    receive: 263560,
    pay: 448747.43,
    balance: 2199821.67,
    pumps: {
      P18: 8663.3,
      P26: 15289.5,
      P34: 5315.5,
      P42: 3383.3,
      P59: 3927,
      P67: 5251.0,
      P75: 0,
      P83: 0,
      P91: 0,
      P99: 0,
    },
    products: {
      D87: 21540.0,
      B: 9520.7,
      GSH95: 6840.3,
    },
  },
  {
    date: "22",
    receive: 585540,
    pay: 412313.63,
    balance: 2157304.84,
    pumps: {
      P18: 15872.1,
      P26: 14328.3,
      P34: 5289.8,
      P42: 6202.2,
      P59: 3394.0,
      P67: 0,
      P75: 4984.3,
      P83: 4209.9,
      P91: 4685.0,
      P99: 2891.1,
    },
    products: {
      D87: 32580.4,
      B: 14290.8,
      GSH95: 9785.6,
    },
  },
];

export default function BalancePetrol() {
  const totalReceive = mockBalanceRows.reduce((sum, r) => sum + r.receive, 0);
  const totalPay = mockBalanceRows.reduce((sum, r) => sum + r.pay, 0);
  const lastBalance =
    mockBalanceRows.length > 0
      ? mockBalanceRows[mockBalanceRows.length - 1].balance
      : 0;

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
          <BookOpen className="w-8 h-8 text-blue-500" />
          สมุด Balance Petrol (หน้าลาน)
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          รูปแบบตารางเลียนแบบสมุดบัญชีควบคุมหน้าลาน ใช้บันทึก รับ-จ่าย-คงเหลือ เงินสด
          และยอดขายแยกตามหัวจ่าย (P18, P26, …) และประเภทน้ำมัน (D87, B, GSH95)
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">รับสะสม (ช่วงที่แสดง)</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {numberFormatter.format(totalReceive)} บาท
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">จ่ายสะสม (ช่วงที่แสดง)</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {numberFormatter.format(totalPay)} บาท
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Droplet className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">คงเหลือสะสมล่าสุด</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {numberFormatter.format(lastBalance)} บาท
            </p>
          </div>
        </motion.div>
      </div>

      {/* Balance Petrol Ledger Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              สมุด Balance Petrol รายวัน (รูปแบบสมุด 302–305)
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              ซ้าย: รับ–จ่าย–คงเหลือ | กลาง: ยอดขายตามจุดจ่าย (P18…P99) | ขวา: รวมตามประเภทผลิตภัณฑ์ (D87, B, GSH95)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              {/* แถวหัวข้อใหญ่ */}
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
                <th
                  rowSpan={2}
                  className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700"
                >
                  ด/ป/ว
                </th>
                <th
                  rowSpan={2}
                  className="py-3 px-3 text-right font-semibold text-gray-600 dark:text-gray-300"
                >
                  รับ
                </th>
                <th
                  rowSpan={2}
                  className="py-3 px-3 text-right font-semibold text-gray-600 dark:text-gray-300"
                >
                  จ่าย
                </th>
                <th
                  rowSpan={2}
                  className="py-3 px-3 text-right font-semibold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700"
                >
                  คงเหลือ
                </th>
                <th
                  colSpan={pumpCodes.length}
                  className="py-2 px-3 text-center font-semibold text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700"
                >
                  ยอดขายตามจุดจ่าย (P18–P99)
                </th>
                <th
                  colSpan={4}
                  className="py-2 px-3 text-center font-semibold text-gray-700 dark:text-gray-200"
                >
                  ประเภทผลิตภัณฑ์ / ราคาน้ำมันต่อลิตร / คงเหลือ
                </th>
              </tr>
              {/* แถวหัวข้อย่อย */}
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
                {pumpCodes.map((code, index) => (
                  <th
                    key={code}
                    className={`py-2 px-2 text-center font-semibold text-gray-600 dark:text-gray-300 ${
                      index === 6
                        ? "border-l border-gray-300 dark:border-gray-600"
                        : ""
                    }`}
                  >
                    {code}
                  </th>
                ))}
                {(["D87", "B", "GSH95"] as ProductCode[]).map((code) => (
                  <th
                    key={code}
                    className="py-2 px-3 text-center font-semibold text-gray-600 dark:text-gray-300"
                  >
                    {code}
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      {productPrices[code].toFixed(2)} บาท/ลิตร
                    </div>
                  </th>
                ))}
                <th className="py-2 px-3 text-center font-semibold text-gray-600 dark:text-gray-300">
                  คงเหลือ
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">บาท</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {mockBalanceRows.map((row, rowIndex) => (
                <motion.tr
                  key={row.date}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/40"
                >
                  {/* ด/ป/ว */}
                  <td className="py-2 px-3 text-left font-semibold text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                    {row.date}
                  </td>
                  {/* รับ */}
                  <td className="py-2 px-3 text-right text-gray-800 dark:text-gray-100">
                    {numberFormatter.format(row.receive)}
                  </td>
                  {/* จ่าย */}
                  <td className="py-2 px-3 text-right text-gray-800 dark:text-gray-100">
                    {numberFormatter.format(row.pay)}
                  </td>
                  {/* คงเหลือ */}
                  <td className="py-2 px-3 text-right text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                    {numberFormatter.format(row.balance)}
                  </td>
                  {/* ยอดหัวจ่าย P… */}
                  {pumpCodes.map((code, index) => {
                    const value = row.pumps[code];
                    return (
                      <td
                        key={code}
                        className={`py-2 px-2 text-right text-gray-700 dark:text-gray-200 ${
                          index === 6
                            ? "border-l border-gray-300 dark:border-gray-600"
                            : ""
                        }`}
                      >
                        {value ? numberFormatter.format(value) : ""}
                      </td>
                    );
                  })}
                  {/* รวมตามประเภทผลิตภัณฑ์ */}
                  {(["D87", "B", "GSH95"] as ProductCode[]).map((code) => (
                    <td
                      key={code}
                      className="py-2 px-3 text-right text-gray-800 dark:text-gray-100"
                    >
                      {numberFormatter.format(row.products[code])}
                    </td>
                  ))}
                  {/* คงเหลือรวม (แสดงซ้ำเหมือนคอลัมน์คงเหลือด้านซ้าย เพื่อให้เหมือนคอลัมน์สุดท้ายในสมุดจริง) */}
                  <td className="py-2 px-3 text-right text-gray-800 dark:text-gray-100">
                    {numberFormatter.format(row.balance)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
