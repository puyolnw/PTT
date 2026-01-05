import { motion } from "framer-motion";
import { useState } from "react";
import { Truck, Droplet, Calendar, Plus, X, ArrowRightLeft } from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
});

type TransferType = "sale" | "branch" | "internal";

type OilTransfer = {
    id: string;
    date: string;
    fullDate: Date;
    tankCode: string; // หลุมต้นทาง
    oilType: string; // ประเภทน้ำมัน
    quantity: number; // จำนวนลิตร
    transferType: TransferType; // ประเภทการย้าย
    destination: string; // ปลายทาง (สาขา/ลูกค้า)
    vehicleNumber?: string; // ทะเบียนรถ (ถ้ามี)
    driverName?: string; // ชื่อคนขับ
    remarks?: string; // หมายเหตุ
    pricePerLiter?: number; // ราคาต่อลิตร (กรณีขาย)
    totalAmount?: number; // ยอดรวม (กรณีขาย)
};

// ฟังก์ชันสร้างวันที่ในรูปแบบ ด/ป/ว (เช่น 6/12/68)
const formatDateThai = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = (date.getFullYear() + 543) % 100;
    return `${day}/${month}/${year}`;
};

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

// Mock data - รายการย้ายน้ำมัน
const mockOilTransfers: OilTransfer[] = [
    // วันนี้
    {
        id: "T001",
        date: generateDateForDay(0),
        fullDate: getFullDateForDay(0),
        tankCode: "34 HSD",
        oilType: "ดีเซล",
        quantity: 5000,
        transferType: "sale",
        destination: "บริษัท ABC จำกัด",
        vehicleNumber: "กข-1234",
        driverName: "สมชาย ใจดี",
        pricePerLiter: 33.89,
        totalAmount: 169450,
        remarks: "ส่งตามใบสั่งซื้อ #12345",
    },
    {
        id: "T002",
        date: generateDateForDay(0),
        fullDate: getFullDateForDay(0),
        tankCode: "83 E 20",
        oilType: "แก๊สโซฮอล์ E20",
        quantity: 3000,
        transferType: "branch",
        destination: "สาขาหนองคาย",
        vehicleNumber: "คค-5678",
        driverName: "สมศรี รักดี",
        remarks: "โอนย้ายสต็อก",
    },
    {
        id: "T003",
        date: generateDateForDay(0),
        fullDate: getFullDateForDay(0),
        tankCode: "18 63H95",
        oilType: "แก๊สโซฮอล์ 95",
        quantity: 2000,
        transferType: "internal",
        destination: "หลุม 59",
        remarks: "ย้ายภายในสาขา",
    },
    // เมื่อวาน
    {
        id: "T004",
        date: generateDateForDay(1),
        fullDate: getFullDateForDay(1),
        tankCode: "34 HSD",
        oilType: "ดีเซล",
        quantity: 8000,
        transferType: "sale",
        destination: "โรงงาน XYZ",
        vehicleNumber: "งง-9012",
        driverName: "สมหมาย ขยัน",
        pricePerLiter: 33.89,
        totalAmount: 271120,
        remarks: "ส่งตามสัญญา",
    },
    {
        id: "T005",
        date: generateDateForDay(1),
        fullDate: getFullDateForDay(1),
        tankCode: "83 E 20",
        oilType: "แก๊สโซฮอล์ E20",
        quantity: 4500,
        transferType: "branch",
        destination: "สาขาอุดรธานี",
        vehicleNumber: "จจ-3456",
        driverName: "สมปอง มั่นคง",
        remarks: "เติมสต็อกสาขา",
    },
    // 2 วันก่อน
    {
        id: "T006",
        date: generateDateForDay(2),
        fullDate: getFullDateForDay(2),
        tankCode: "59 69H91",
        oilType: "แก๊สโซฮอล์ 91",
        quantity: 6000,
        transferType: "sale",
        destination: "ห้างหุ้นส่วน DEF",
        vehicleNumber: "ฉฉ-7890",
        driverName: "สมบูรณ์ ซื่อสัตย์",
        pricePerLiter: 35.63,
        totalAmount: 213780,
        remarks: "ขายส่ง",
    },
    {
        id: "T007",
        date: generateDateForDay(2),
        fullDate: getFullDateForDay(2),
        tankCode: "34 HSD",
        oilType: "ดีเซล",
        quantity: 3500,
        transferType: "internal",
        destination: "หลุม 18",
        remarks: "ปรับสมดุลสต็อก",
    },
    // 3 วันก่อน
    {
        id: "T008",
        date: generateDateForDay(3),
        fullDate: getFullDateForDay(3),
        tankCode: "83 E 20",
        oilType: "แก๊สโซฮอล์ E20",
        quantity: 5500,
        transferType: "branch",
        destination: "สาขาเลย",
        vehicleNumber: "ชช-2468",
        driverName: "สมศักดิ์ ทำดี",
        remarks: "ส่งเสริมสาขาใหม่",
    },
];

const transferTypeLabels: Record<TransferType, string> = {
    sale: "ขาย",
    branch: "โอนสาขา",
    internal: "ย้ายภายใน",
};

const transferTypeColors: Record<TransferType, string> = {
    sale: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    branch: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    internal: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function OilTransfer() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedType, setSelectedType] = useState<TransferType | "all">("all");

    // กรองข้อมูลตามประเภท
    const filteredTransfers =
        selectedType === "all"
            ? mockOilTransfers
            : mockOilTransfers.filter((t) => t.transferType === selectedType);

    // คำนวณสรุป
    const totalQuantity = filteredTransfers.reduce((sum, t) => sum + t.quantity, 0);
    const totalSales = filteredTransfers
        .filter((t) => t.transferType === "sale")
        .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    const totalBranchTransfers = filteredTransfers.filter(
        (t) => t.transferType === "branch"
    ).length;

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
                    <Truck className="w-8 h-8 text-blue-500" />
                    ย้ายน้ำมัน
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    บันทึกการดึงน้ำมันจากหลุมและโยกย้ายไปขายหรือส่งให้สาขาอื่น
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
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Droplet className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">รวมปริมาณย้าย</p>
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
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Droplet className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">ยอดขายรวม</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {numberFormatter.format(totalSales)} บาท
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3"
                >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <ArrowRightLeft className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">โอนสาขา</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {totalBranchTransfers} รายการ
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Filters and Add Button */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-wrap items-center justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <select
                        id="filter-type"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value as TransferType | "all")}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="ทุกประเภท"
                    >
                        <option value="all">ทุกประเภท</option>
                        <option value="sale">ขาย</option>
                        <option value="branch">โอนสาขา</option>
                        <option value="internal">ย้ายภายใน</option>
                    </select>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    เพิ่มรายการย้าย
                </button>
            </motion.div>

            {/* Transfer List Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
            >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        รายการย้ายน้ำมัน
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        บันทึกการดึงน้ำมันจากหลุมและโยกย้ายไปยังปลายทาง
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
                                <th className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                                    วันที่
                                </th>
                                <th className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                                    หลุม/ประเภท
                                </th>
                                <th className="py-3 px-3 text-right font-semibold text-gray-600 dark:text-gray-300">
                                    จำนวน (ลิตร)
                                </th>
                                <th className="py-3 px-3 text-center font-semibold text-gray-600 dark:text-gray-300">
                                    ประเภท
                                </th>
                                <th className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                                    ปลายทาง
                                </th>
                                <th className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                                    รถ/คนขับ
                                </th>
                                <th className="py-3 px-3 text-right font-semibold text-gray-600 dark:text-gray-300">
                                    ยอดเงิน
                                </th>
                                <th className="py-3 px-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                                    หมายเหตุ
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransfers.map((transfer, index) => (
                                <motion.tr
                                    key={transfer.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/40"
                                >
                                    {/* วันที่ */}
                                    <td className="py-2 px-3 text-left text-gray-800 dark:text-gray-100">
                                        {transfer.date}
                                    </td>

                                    {/* หลุม/ประเภท */}
                                    <td className="py-2 px-3 text-left">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-800 dark:text-gray-100">
                                                {transfer.tankCode}
                                            </span>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                {transfer.oilType}
                                            </span>
                                        </div>
                                    </td>

                                    {/* จำนวน */}
                                    <td className="py-2 px-3 text-right font-semibold text-gray-800 dark:text-gray-100">
                                        {integerFormatter.format(transfer.quantity)}
                                    </td>

                                    {/* ประเภท */}
                                    <td className="py-2 px-3 text-center">
                                        <span
                                            className={`px-2 py-1 rounded-full text-[10px] font-medium ${transferTypeColors[transfer.transferType]
                                                }`}
                                        >
                                            {transferTypeLabels[transfer.transferType]}
                                        </span>
                                    </td>

                                    {/* ปลายทาง */}
                                    <td className="py-2 px-3 text-left text-gray-700 dark:text-gray-200">
                                        {transfer.destination}
                                    </td>

                                    {/* รถ/คนขับ */}
                                    <td className="py-2 px-3 text-left">
                                        {transfer.vehicleNumber ? (
                                            <div className="flex flex-col">
                                                <span className="text-gray-800 dark:text-gray-100">
                                                    {transfer.vehicleNumber}
                                                </span>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                    {transfer.driverName}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>

                                    {/* ยอดเงิน */}
                                    <td className="py-2 px-3 text-right text-gray-800 dark:text-gray-100">
                                        {transfer.totalAmount ? (
                                            <span className="font-semibold">
                                                {numberFormatter.format(transfer.totalAmount)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>

                                    {/* หมายเหตุ */}
                                    <td className="py-2 px-3 text-left text-gray-600 dark:text-gray-400 text-[10px]">
                                        {transfer.remarks || "-"}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Add Transfer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                    เพิ่มรายการย้ายน้ำมัน
                                </h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* วันที่ */}
                                    <div>
                                        <label htmlFor="add-transfer-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            วันที่
                                        </label>
                                        <input
                                            id="add-transfer-date"
                                            type="date"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* หลุมต้นทาง */}
                                    <div>
                                        <label htmlFor="add-transfer-source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            หลุมต้นทาง
                                        </label>
                                        <select id="add-transfer-source" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                            <option>34 HSD</option>
                                            <option>83 E 20</option>
                                            <option>18 63H95</option>
                                            <option>59 69H91</option>
                                        </select>
                                    </div>

                                    {/* ประเภทน้ำมัน */}
                                    <div>
                                        <label htmlFor="add-transfer-oil-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            ประเภทน้ำมัน
                                        </label>
                                        <select id="add-transfer-oil-type" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                            <option>ดีเซล</option>
                                            <option>แก๊สโซฮอล์ E20</option>
                                            <option>แก๊สโซฮอล์ 95</option>
                                            <option>แก๊สโซฮอล์ 91</option>
                                        </select>
                                    </div>

                                    {/* จำนวน */}
                                    <div>
                                        <label htmlFor="add-transfer-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            จำนวน (ลิตร)
                                        </label>
                                        <input
                                            id="add-transfer-quantity"
                                            type="number"
                                            placeholder="0"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* ประเภทการย้าย */}
                                    <div>
                                        <label htmlFor="add-transfer-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            ประเภทการย้าย
                                        </label>
                                        <select id="add-transfer-type" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                            <option value="sale">ขาย</option>
                                            <option value="branch">โอนสาขา</option>
                                            <option value="internal">ย้ายภายใน</option>
                                        </select>
                                    </div>

                                    {/* ปลายทาง */}
                                    <div>
                                        <label htmlFor="add-transfer-destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            ปลายทาง
                                        </label>
                                        <input
                                            id="add-transfer-destination"
                                            type="text"
                                            placeholder="ชื่อสาขา/ลูกค้า/หลุม"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* ทะเบียนรถ */}
                                    <div>
                                        <label htmlFor="add-transfer-vehicle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            ทะเบียนรถ (ถ้ามี)
                                        </label>
                                        <input
                                            id="add-transfer-vehicle"
                                            type="text"
                                            placeholder="กข-1234"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* ชื่อคนขับ */}
                                    <div>
                                        <label htmlFor="add-transfer-driver" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            ชื่อคนขับ (ถ้ามี)
                                        </label>
                                        <input
                                            id="add-transfer-driver"
                                            type="text"
                                            placeholder="ชื่อ-นามสกุล"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* ราคาต่อลิตร */}
                                    <div>
                                        <label htmlFor="add-transfer-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            ราคาต่อลิตร (กรณีขาย)
                                        </label>
                                        <input
                                            id="add-transfer-price"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* หมายเหตุ */}
                                    <div className="md:col-span-2">
                                        <label htmlFor="add-transfer-remarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            หมายเหตุ
                                        </label>
                                        <textarea
                                            id="add-transfer-remarks"
                                            rows={3}
                                            placeholder="รายละเอียดเพิ่มเติม..."
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                                    >
                                        บันทึก
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
