import { motion } from "framer-motion";
import { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Search,
  Printer,
  User,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

type SalesInstrumentType = {
  id: number;
  type: string;
  transactionCount: number;
  amount: number;
};

// Mock data ตามรูปภาพ
const mockSalesInstruments: SalesInstrumentType[] = [
  { id: 1, type: "เงินสด", transactionCount: 627, amount: 275755.53 },
  { id: 2, type: "Master", transactionCount: 11, amount: 10076.15 },
  { id: 3, type: "VISA", transactionCount: 12, amount: 10897.49 },
  { id: 4, type: "KBANK-CARD", transactionCount: 3, amount: 2870.15 },
  { id: 5, type: "PTT Privilege", transactionCount: 2, amount: 1484.72 },
  { id: 6, type: "Energy Card", transactionCount: 17, amount: 11553.1 },
  { id: 7, type: "Synergy Card", transactionCount: 2, amount: 3430.0 },
  { id: 8, type: "Fleet Card", transactionCount: 12, amount: 16594.5 },
  { id: 9, type: "ลูกค้าเงินเชื่อ", transactionCount: 8, amount: 12707.2 },
  { id: 10, type: "Top up Card ttb", transactionCount: 1, amount: 360.0 },
  { id: 11, type: "Fill&Go+", transactionCount: 1, amount: 1900.0 },
  { id: 12, type: "BBL Fleet Card", transactionCount: 2, amount: 2000.0 },
  { id: 13, type: "Visa Local Card", transactionCount: 5, amount: 2334.13 },
  { id: 14, type: "QR| KPLUS", transactionCount: 70, amount: 31756.56 },
  { id: 15, type: "QR| PROMPTPAY", transactionCount: 169, amount: 86371.07 },
  { id: 16, type: "คูปองของสถานี", transactionCount: 1, amount: 100.0 },
];

// ฟังก์ชันสร้างวันที่ไทย
const getCurrentThaiDate = () => {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear() + 543; // แปลงเป็น พ.ศ.
  return `${day}/${month}/${year}`;
};

const getCurrentDateTime = () => {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear() + 543;
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export default function SalesInstrumentReport() {
  const [startDate, setStartDate] = useState(getCurrentThaiDate());
  const [endDate, setEndDate] = useState(getCurrentThaiDate());
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInstruments = mockSalesInstruments.filter((item) =>
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = mockSalesInstruments.reduce((sum, item) => sum + item.amount, 0);
  const totalTransactions = mockSalesInstruments.reduce((sum, item) => sum + item.transactionCount, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // ในอนาคตจะ export เป็น Excel หรือ PDF
    alert("กำลังส่งออกข้อมูล...");
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
          <FileText className="w-8 h-8 text-indigo-500" />
          รายงานตราสารยอดขาย
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          รายงานสรุปยอดขายแยกตามประเภทตราสาร (วิธีการชำระเงิน) ตามวันที่ที่เลือก
        </p>
      </motion.div>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">เริ่มต้น</label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="ด/ป/ว"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">จนถึง</label>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="ด/ป/ว"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">ค้นหา</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาประเภทตราสาร..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-gray-800 dark:text-white text-sm"
              />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm">พิมพ์</span>
            </button>
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">ส่งออก</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Report Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden print:shadow-none"
      >
        {/* Report Header - เหมือนเอกสารจริง */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 print:border-b-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">รายงานตราสารยอดขาย</h2>
            </div>
            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
              <p>Export.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">รหัสสาขา</p>
              <p className="font-semibold text-gray-800 dark:text-white">101612</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">ชื่อสาขา</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                ห้างหุ้นส่วนสามัญนิติบุคคล อิสาณบริการ
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">เริ่มต้น</p>
              <p className="font-semibold text-gray-800 dark:text-white">{startDate}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">จนถึง</p>
              <p className="font-semibold text-gray-800 dark:text-white">{endDate}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>จัดทำโดย: นิดศรา ค่าใสสุข</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>วันเวลาที่พิมพ์: {getCurrentDateTime()}</span>
            </div>
          </div>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60">
                <th className="text-center py-4 px-4 font-bold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                  ลำดับ
                </th>
                <th className="text-left py-4 px-4 font-bold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                  ประเภทตราสาร
                </th>
                <th className="text-right py-4 px-4 font-bold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                  จำนวนฉบับ
                </th>
                <th className="text-right py-4 px-4 font-bold text-gray-700 dark:text-gray-300">
                  จำนวนเงิน
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInstruments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    ไม่พบข้อมูลที่ตรงกับเงื่อนไขค้นหา
                  </td>
                </tr>
              ) : (
                filteredInstruments.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="text-center py-3 px-4 text-gray-800 dark:text-white border-r border-gray-200 dark:border-gray-700">
                      {item.id}
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-white font-medium border-r border-gray-200 dark:border-gray-700">
                      {item.type}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-800 dark:text-white border-r border-gray-200 dark:border-gray-700">
                      {numberFormatter.format(item.transactionCount)}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-800 dark:text-white font-semibold">
                      {numberFormatter.format(item.amount)}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
            {/* Footer Total */}
            <tfoot>
              <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/60">
                <td colSpan={2} className="py-4 px-4 text-right font-bold text-gray-800 dark:text-white">
                  รวม
                </td>
                <td className="py-4 px-4 text-right font-bold text-gray-800 dark:text-white border-r border-gray-200 dark:border-gray-700">
                  {numberFormatter.format(totalTransactions)}
                </td>
                <td className="py-4 px-4 text-right font-bold text-lg text-gray-800 dark:text-white">
                  {numberFormatter.format(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary Cards */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">จำนวนรายการทั้งหมด</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {numberFormatter.format(totalTransactions)} รายการ
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ยอดรวมทั้งหมด</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {currencyFormatter.format(totalAmount)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

