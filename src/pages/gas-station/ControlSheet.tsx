import { motion } from "framer-motion";
import { FileSpreadsheet, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2,
});

type ControlSheetEntry = {
    code: string;
    description: string;
    amount: number;
    note?: string;
};

type ControlSheetSection = {
    title: string;
    entries: ControlSheetEntry[];
};

// Mock data สำหรับ Control Sheet
const mockControlSheetData: ControlSheetSection[] = [
    {
        title: "Section 1: รายการหลัก",
        entries: [
            { code: "1.1", description: "ช.ท.น.ม.น้ำมัน", amount: 95510.94, note: "" },
            { code: "1.2", description: "ส่วนลดพนักงานทำน้ำมัน", amount: 4.19, note: "ช.ท.น.ยูเนี่ยน 8,918" },
            { code: "1.3", description: "ส่วนลด(พนักงาน)", amount: 0, note: "ช.ท.น.ส่วนลดพิเศษ 10,055" },
            { code: "1.4", description: "ส่วนลดพิเศษ", amount: 0, note: "ช.ท.น.ส่วนลด" },
            { code: "1.5", description: "ลูกหนี้", amount: 12681.10, note: "ฯลฯ" },
            { code: "1.6", description: "ยูเนี่ยน ฯ", amount: 1900, note: "ไม่มีข้อมูล" },
            { code: "1.7", description: "ไม่มีข้อมูล", amount: 0, note: "ไม่มีข้อมูล(ไม่)" },
            { code: "1.8", description: "ยูเนี่ยน ไม่มีค่าน้ำ ฯ", amount: 0, note: "ยูเนี่ยนส่วนลดพิเศษ" },
            { code: "1.9", description: "CASH/Sale", amount: 502163, note: "ส่วนลดส่วนลดพิเศษ 502.16.3 | 4.15.500" },
            { code: "1.10", description: "ไม่มีข้อมูล", amount: 0, note: "ส่วนลด" },
            { code: "1.11", description: "ยูเนี่ยน TR", amount: 0, note: "ไม่มีข้อมูล(TR/EXPENSE)" },
            { code: "1.12", description: "ไม่มีข้อมูล", amount: 0, note: "ยูเนี่ยนยูเนี่ยน(TR/EXPENSE)" },
            { code: "1.13", description: "ส่วนลดยูเนี่ยนไม่มีค่าน้ำ", amount: 0, note: "" },
        ],
    },
    {
        title: "Section 2: รายการเพิ่มเติม",
        entries: [
            { code: "2.1", description: "ไม่มีข้อมูล", amount: 911542, note: "เงิน 492,050.44" },
            { code: "2.2", description: "ไม่มีข้อมูลส่วนลดพิเศษ", amount: 0, note: "Buy-Balance(1+2) 1,650" },
            { code: "2.3", description: "ส่วนลด", amount: 1859, note: "ส่วนลด" },
            { code: "2.4", description: "ส่วนลดส่วนลดพิเศษ", amount: 0, note: "ใช้ส่วนลดพิเศษ(ไม่.)" },
            { code: "2.5", description: "เงินสดส่วนลดพิเศษ", amount: 0, note: "ใช้ส่วนลดพิเศษ(ไม่.)" },
            { code: "2.6", description: "เงินสด", amount: 0, note: "PROF 1" },
            { code: "2.7", description: "ค่าใช้จ่าย", amount: 0, note: "" },
        ],
    },
    {
        title: "Section 3: CASH และ Balance",
        entries: [
            { code: "3.1", description: "CASH/Sale เงินสดทำน้ำมัน", amount: 211552, note: "CASH-BALANCE 155,510.90" },
            { code: "3.2", description: "ค่าใช้จ่าย", amount: 99.02, note: "หนี้เงินส่วนลดพิเศษ(STLS)" },
            { code: "3.3", description: "Buy-ค่าน้ำ ซื้อน้ำมันส่วนลดพิเศษ", amount: 1951, note: "" },
            { code: "3.4", description: "ไม่มีข้อมูล", amount: 112, note: "AC" },
            { code: "3.5", description: "หนี้เงินยืม", amount: 195524.20, note: "" },
            { code: "3.6", description: "ฯลฯ", amount: 0, note: "" },
            { code: "3.7", description: "พิเศษ", amount: 0, note: "" },
        ],
    },
    {
        title: "Section 4: CASH/DEBT",
        entries: [
            { code: "4.1", description: "CASH/DEBT เงินสดทำน้ำมัน", amount: 0, note: "รับทรัพย์ไม่ไม่" },
            { code: "4.2", description: "ส่วนลดพิเศษ", amount: 0, note: "รับทรัพย์ไม่(ไม่)" },
            { code: "4.3", description: "ยูเนี่ยน DEBT", amount: 0, note: "" },
            { code: "4.4", description: "ไม่มีข้อมูล DEBT ส่วนลดทำน้ำมัน", amount: 0, note: "" },
            { code: "4.5", description: "ยูเนี่ยนไม่มีค่าน้ำ(ไม่)", amount: 0, note: "" },
        ],
    },
    {
        title: "Section 5: PAY-IN",
        entries: [
            { code: "5.1", description: "PAY-IN (รายการ)", amount: 0, note: "ส่งเงิน CASH/SALE เงินสดทำน้ำมัน" },
            { code: "5.2", description: "ไม่มีข้อมูล", amount: 0, note: "ส่งเงิน CASH/DEBT ไม่มีทรัพย์ไม่" },
            { code: "5.3", description: "ไม่มีข้อมูล", amount: 0, note: "ส่งเงินเงิน" },
            { code: "5.4", description: "ไม่มีข้อมูล", amount: 0, note: "PROF 1" },
        ],
    },
    {
        title: "Section 6: เช็คและอื่นๆ",
        entries: [
            { code: "6.1", description: "ไม่มีข้อมูล", amount: 0, note: "PROF-CHEQUE ฯ" },
            { code: "6.2", description: "ฯลฯ AC", amount: 0, note: "ส่วนลดส่วนลดทรัพย์ไม่ทรัพย์ไม่" },
            { code: "6.3", description: "ค่าใช้จ่าย", amount: 0, note: "" },
            { code: "6.4", description: "BUY CHEQUE ซื้อน้ำมันส่วนลดพิเศษ", amount: 0, note: "" },
            { code: "6.5", description: "ฯลฯ", amount: 0, note: "" },
        ],
    },
    {
        title: "Section 7: สรุป",
        entries: [
            { code: "7.1", description: "ไม่มีข้อมูล", amount: 944980, note: "ไม่มีข้อมูลส่วนลดทรัพย์(ไม่)" },
            { code: "7.2", description: "ไม่มีข้อมูลส่วนลดพิเศษ", amount: 0, note: "ไม่มีข้อมูลส่วนลดทรัพย์ไม่ทรัพย์(ไม่)" },
            { code: "7.3", description: "ไม่มีข้อมูลส่วนลดพิเศษ(ไม่)", amount: 0, note: "" },
        ],
    },
];

export default function ControlSheet() {
    const [selectedDate] = useState("1 ต.ค. 68");

    // คำนวณยอดรวม
    const totalAmount = mockControlSheetData.reduce(
        (sum, section) => sum + section.entries.reduce((s, e) => s + e.amount, 0),
        0
    );

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
                    <FileSpreadsheet className="w-8 h-8 text-indigo-500" />
                    Control Sheet
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    แบบฟอร์มควบคุมการเงินประจำวัน สำหรับบันทึกรายการเงินสด ลูกหนี้ เจ้าหนี้ และรายการอื่นๆ
                </p>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">วันที่</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">{selectedDate}</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                        <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">ยอดรวมทั้งหมด</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                            ฿{numberFormatter.format(totalAmount)}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">จำนวนรายการ</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                            {mockControlSheetData.reduce((sum, s) => sum + s.entries.length, 0)} รายการ
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Control Sheet Sections */}
            <div className="space-y-4">
                {mockControlSheetData.map((section, sectionIndex) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 + sectionIndex * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                    >
                        {/* Section Header */}
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                {section.title}
                            </h2>
                        </div>

                        {/* Section Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 w-20">
                                            รหัส
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                            รายการ
                                        </th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 w-32">
                                            จำนวนเงิน
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                            หมายเหตุ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {section.entries.map((entry, entryIndex) => (
                                        <motion.tr
                                            key={entry.code}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: entryIndex * 0.02 }}
                                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
                                        >
                                            <td className="py-3 px-4 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                                {entry.code}
                                            </td>
                                            <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                                {entry.description}
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-gray-800 dark:text-white">
                                                {entry.amount > 0 ? numberFormatter.format(entry.amount) : "-"}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400">
                                                {entry.note || "-"}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                                {/* Section Total */}
                                <tfoot>
                                    <tr className="bg-gray-50 dark:bg-gray-900/60 border-t-2 border-gray-300 dark:border-gray-600">
                                        <td colSpan={2} className="py-3 px-4 font-bold text-gray-800 dark:text-white">
                                            รวม {section.title}
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                                            {numberFormatter.format(
                                                section.entries.reduce((sum, e) => sum + e.amount, 0)
                                            )}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Grand Total */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg p-6 text-white"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm opacity-90 mb-1">ยอดรวมทั้งหมด (Grand Total)</p>
                        <p className="text-3xl font-extrabold">฿{numberFormatter.format(totalAmount)}</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <FileSpreadsheet className="w-8 h-8" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
