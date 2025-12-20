import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
    FileText,
    ShoppingCart,
    Truck,
    CheckCircle,
    AlertTriangle,
    Package,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
});

// Mock data - รายการที่รออนุมัติ
const mockPendingOrders = [
    {
        branchId: 1,
        branchName: "ปั๊มไฮโซ",
        oilType: "Premium Diesel",
        quantity: 32000,
        estimatedPrice: 30.5,
        legalEntityName: "บริษัท A จำกัด",
    },
    {
        branchId: 1,
        branchName: "ปั๊มไฮโซ",
        oilType: "Gasohol 95",
        quantity: 28000,
        estimatedPrice: 35.0,
        legalEntityName: "บริษัท A จำกัด",
    },
    {
        branchId: 2,
        branchName: "ดินดำ",
        oilType: "Premium Diesel",
        quantity: 22000,
        estimatedPrice: 30.5,
        legalEntityName: "บริษัท B จำกัด",
    },
    {
        branchId: 2,
        branchName: "ดินดำ",
        oilType: "Gasohol 95",
        quantity: 18000,
        estimatedPrice: 35.0,
        legalEntityName: "บริษัท B จำกัด",
    },
];

// Mock data - รถ
const mockTrucks = [
    { id: "T001", plateNumber: "กก-1234", capacity: 14000, status: "available" },
    { id: "T002", plateNumber: "ขข-5678", capacity: 14000, status: "available" },
    { id: "T003", plateNumber: "คค-9012", capacity: 10000, status: "in-use" },
];

// Mock data - หาง
const mockTrailers = [
    { id: "TR001", plateNumber: "กก-1111", capacity: 14000, compatibleWith: ["T001", "T002"] },
    { id: "TR002", plateNumber: "ขข-2222", capacity: 14000, compatibleWith: ["T001", "T002"] },
    { id: "TR003", plateNumber: "คค-3333", capacity: 10000, compatibleWith: ["T003"] },
];

// Mock data - คนขับ
const mockDrivers = [
    { id: 1, code: "D001", name: "สมชาย ใจดี", status: "available" },
    { id: 2, code: "D002", name: "สมหญิง รักดี", status: "available" },
    { id: 3, code: "D003", name: "สมศักดิ์ มั่นคง", status: "on-leave" },
];

export default function POGeneration() {
    const [selectedOrders, setSelectedOrders] = useState<typeof mockPendingOrders>([]);
    const [selectedTruck, setSelectedTruck] = useState("");
    const [selectedTrailer, setSelectedTrailer] = useState("");
    const [selectedDriver, setSelectedDriver] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const toggleOrder = (order: typeof mockPendingOrders[0]) => {
        const exists = selectedOrders.find(
            (o) => o.branchId === order.branchId && o.oilType === order.oilType
        );
        if (exists) {
            setSelectedOrders(selectedOrders.filter((o) => o !== exists));
        } else {
            setSelectedOrders([...selectedOrders, order]);
        }
    };

    const totalQuantity = selectedOrders.reduce((sum, o) => sum + o.quantity, 0);
    const totalAmount = selectedOrders.reduce((sum, o) => sum + o.quantity * o.estimatedPrice, 0);

    const truck = mockTrucks.find((t) => t.id === selectedTruck);
    const trailer = mockTrailers.find((t) => t.id === selectedTrailer);
    const driver = mockDrivers.find((d) => d.id === parseInt(selectedDriver));

    const truckCapacity = (truck?.capacity || 0) + (trailer?.capacity || 0);
    const isOverCapacity = totalQuantity > truckCapacity;
    const canGenerate = selectedOrders.length > 0 && selectedTruck && selectedTrailer && selectedDriver && !isOverCapacity;

    const handleGeneratePO = () => {
        if (!canGenerate) return;
        setShowConfirmModal(true);
    };

    const confirmGenerate = () => {
        // Generate PO number
        const poNumber = `PO-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

        alert(`✅ สร้างใบสั่งซื้อสำเร็จ!\n\nเลขที่ PO: ${poNumber}\nรถ: ${truck?.plateNumber} + ${trailer?.plateNumber}\nคนขับ: ${driver?.name}\nยอดรวม: ${numberFormatter.format(totalQuantity)} ลิตร`);

        // Reset
        setSelectedOrders([]);
        setSelectedTruck("");
        setSelectedTrailer("");
        setSelectedDriver("");
        setShowConfirmModal(false);
    };

    const compatibleTrailers = selectedTruck
        ? mockTrailers.filter((t) => t.compatibleWith.includes(selectedTruck))
        : mockTrailers;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        ออกใบสั่งซื้อ (PO)
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        รวมออเดอร์และระบุข้อมูลรถ/คนขับ เพื่อสร้างใบสั่งซื้อ
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Order Selection */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5" />
                                เลือกรายการสั่งซื้อ
                            </h2>
                            <div className="space-y-3">
                                {mockPendingOrders.map((order, index) => {
                                    const isSelected = selectedOrders.some(
                                        (o) => o.branchId === order.branchId && o.oilType === order.oilType
                                    );
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => toggleOrder(order)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Package className="w-4 h-4 text-blue-500" />
                                                        <span className="font-semibold text-gray-800 dark:text-white">
                                                            {order.branchName}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            ({order.legalEntityName})
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {order.oilType} - {numberFormatter.format(order.quantity)} ลิตร
                                                    </div>
                                                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                                                        {currencyFormatter.format(order.quantity * order.estimatedPrice)}
                                                    </div>
                                                </div>
                                                <div
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected
                                                        ? "border-blue-500 bg-blue-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                        }`}
                                                >
                                                    {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Truck & Driver Selection */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Summary */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                            <h3 className="text-lg font-bold mb-4">สรุปออเดอร์</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>รายการที่เลือก:</span>
                                    <span className="font-bold">{selectedOrders.length} รายการ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ปริมาณรวม:</span>
                                    <span className="font-bold">{numberFormatter.format(totalQuantity)} ลิตร</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ยอดรวม:</span>
                                    <span className="font-bold">{currencyFormatter.format(totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Truck Selection */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <Truck className="w-5 h-5" />
                                เลือกรถและคนขับ
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        รถหัว *
                                    </label>
                                    <select
                                        value={selectedTruck}
                                        onChange={(e) => {
                                            setSelectedTruck(e.target.value);
                                            setSelectedTrailer(""); // Reset trailer
                                        }}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
                                    >
                                        <option value="">เลือกรถหัว</option>
                                        {mockTrucks
                                            .filter((t) => t.status === "available")
                                            .map((truck) => (
                                                <option key={truck.id} value={truck.id}>
                                                    {truck.plateNumber} ({numberFormatter.format(truck.capacity)} ลิตร)
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        หาง *
                                    </label>
                                    <select
                                        value={selectedTrailer}
                                        onChange={(e) => setSelectedTrailer(e.target.value)}
                                        disabled={!selectedTruck}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white disabled:opacity-50"
                                    >
                                        <option value="">เลือกหาง</option>
                                        {compatibleTrailers.map((trailer) => (
                                            <option key={trailer.id} value={trailer.id}>
                                                {trailer.plateNumber} ({numberFormatter.format(trailer.capacity)} ลิตร)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        คนขับ *
                                    </label>
                                    <select
                                        value={selectedDriver}
                                        onChange={(e) => setSelectedDriver(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-800 dark:text-white"
                                    >
                                        <option value="">เลือกคนขับ</option>
                                        {mockDrivers
                                            .filter((d) => d.status === "available")
                                            .map((driver) => (
                                                <option key={driver.id} value={driver.id}>
                                                    {driver.name} ({driver.code})
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                {/* Capacity Check */}
                                {selectedTruck && selectedTrailer && (
                                    <div
                                        className={`p-4 rounded-xl border-2 ${isOverCapacity
                                            ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                                            : "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            {isOverCapacity ? (
                                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                            ) : (
                                                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            )}
                                            <span
                                                className={`font-semibold ${isOverCapacity
                                                    ? "text-red-900 dark:text-red-100"
                                                    : "text-emerald-900 dark:text-emerald-100"
                                                    }`}
                                            >
                                                ความจุรถ
                                            </span>
                                        </div>
                                        <div className="text-sm space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">ความจุรวม:</span>
                                                <span className="font-semibold text-gray-800 dark:text-white">
                                                    {numberFormatter.format(truckCapacity)} ลิตร
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">ปริมาณสั่ง:</span>
                                                <span className="font-semibold text-gray-800 dark:text-white">
                                                    {numberFormatter.format(totalQuantity)} ลิตร
                                                </span>
                                            </div>
                                            {isOverCapacity && (
                                                <div className="flex justify-between text-red-600 dark:text-red-400 font-semibold">
                                                    <span>เกิน:</span>
                                                    <span>{numberFormatter.format(totalQuantity - truckCapacity)} ลิตร</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGeneratePO}
                            disabled={!canGenerate}
                            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            <FileText className="w-5 h-5" />
                            ออกใบสั่งซื้อ (PO)
                        </button>
                    </motion.div>
                </div>

                {/* Confirm Modal */}
                <AnimatePresence>
                    {showConfirmModal && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowConfirmModal(false)}
                                className="fixed inset-0 bg-black/50 z-50"
                            />
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
                                >
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                        ยืนยันการออกใบสั่งซื้อ
                                    </h3>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">รายการ:</span>
                                            <span className="font-semibold text-gray-800 dark:text-white">
                                                {selectedOrders.length} รายการ
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">ปริมาณรวม:</span>
                                            <span className="font-semibold text-gray-800 dark:text-white">
                                                {numberFormatter.format(totalQuantity)} ลิตร
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">รถ:</span>
                                            <span className="font-semibold text-gray-800 dark:text-white">
                                                {truck?.plateNumber} + {trailer?.plateNumber}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">คนขับ:</span>
                                            <span className="font-semibold text-gray-800 dark:text-white">
                                                {driver?.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400">ยอดรวม:</span>
                                            <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                                {currencyFormatter.format(totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowConfirmModal(false)}
                                            className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                                        >
                                            ยกเลิก
                                        </button>
                                        <button
                                            onClick={confirmGenerate}
                                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg"
                                        >
                                            ยืนยัน
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
