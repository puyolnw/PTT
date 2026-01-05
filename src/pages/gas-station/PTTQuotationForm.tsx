import { motion } from "framer-motion";
import { useState } from "react";
import {
    Save,
    Truck,
    FileText,
    ShoppingCart,
} from "lucide-react";
import { mockApprovedOrders } from "@/data/gasStationOrders";
import { mockTrucks, mockTrailers } from "@/data/truckData";
import { employees } from "@/data/mockData";
import { logActivity } from "@/types/gasStationActivity";

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
});

export interface PTTQuotationData {
    purchaseOrderNo: string;
    pttQuotationNo: string;
    pttQuotationDate: string;
    pttQuotationAmount: number;
    pttQuotationAttachment?: string;
    scheduledPickupDate?: string;
    scheduledPickupTime?: string;
    truckId: string;
    trailerId: string;
    driverId: string;
}

interface PTTQuotationFormProps {
    existingQuotations?: Array<{
        purchaseOrderNo: string;
        truckId: string;
        trailerId: string;
        driverId: string;
    }>;
    onClose: () => void;
    onSave: (data: PTTQuotationData) => void;
}

export default function PTTQuotationForm({ existingQuotations = [], onClose, onSave }: PTTQuotationFormProps) {
    const [formData, setFormData] = useState<Partial<PTTQuotationData>>({
        purchaseOrderNo: "",
        pttQuotationNo: "",
        pttQuotationDate: new Date().toISOString().split("T")[0],
        pttQuotationAmount: 0,
        scheduledPickupDate: "",
        scheduledPickupTime: "",
        truckId: "",
        trailerId: "",
        driverId: "",
    });

    // Get selected PO details
    const selectedPO = mockApprovedOrders.find(
        (order) => order.orderNo === formData.purchaseOrderNo
    );

    // Get selected truck/trailer/driver
    // Get selected truck/trailer/driver
    const selectedTruck = mockTrucks.find((t) => t.id === formData.truckId);
    const selectedTrailer = mockTrailers.find((t) => t.id === formData.trailerId);
    const selectedDriver = employees.find((e) => e.id.toString() === formData.driverId);

    const handleSubmit = () => {
        // Validation
        if (!formData.purchaseOrderNo) {
            alert("กรุณาเลือกใบสั่งซื้อ");
            return;
        }
        if (!formData.pttQuotationNo) {
            alert("กรุณากรอกเลขที่ใบเสนอราคา ปตท.");
            return;
        }
        if (!formData.pttQuotationDate) {
            alert("กรุณาเลือกวันที่ใบเสนอราคา");
            return;
        }
        if (!formData.pttQuotationAmount || formData.pttQuotationAmount <= 0) {
            alert("กรุณากรอกมูลค่ารวม");
            return;
        }
        if (!formData.truckId) {
            alert("กรุณาเลือกหัวรถ");
            return;
        }
        if (!formData.trailerId) {
            alert("กรุณาเลือกหางรถ");
            return;
        }
        if (!formData.driverId) {
            alert("กรุณาเลือกคนขับ");
            return;
        }

        // บันทึกประวัติการทำงาน
        logActivity({
            module: "บันทึกใบเสนอราคาจากปตท.",
            action: "create",
            recordId: formData.pttQuotationNo || `QT-${Date.now()}`,
            recordType: "PTTQuotation",
            userId: "EMP-001", // TODO: ดึงจาก session
            userName: "นายสมศักดิ์ ใจดี", // TODO: ดึงจาก session
            description: `บันทึกใบเสนอราคาจากปตท. หมายเลข ${formData.pttQuotationNo} สำหรับใบสั่งซื้อ ${formData.purchaseOrderNo}`,
            details: {
                purchaseOrderNo: formData.purchaseOrderNo,
                pttQuotationNo: formData.pttQuotationNo,
                pttQuotationDate: formData.pttQuotationDate,
                pttQuotationAmount: formData.pttQuotationAmount,
                truckId: formData.truckId,
                trailerId: formData.trailerId,
                driverId: formData.driverId,
            },
            status: "success",
        });

        onSave(formData as PTTQuotationData);
    };

    // Auto-fill truck/trailer/driver when PO is selected
    const handlePOChange = (poNumber: string) => {
        const existingQuotation = existingQuotations.find(q => q.purchaseOrderNo === poNumber);

        if (existingQuotation) {
            // Auto-fill from existing quotation
            setFormData({
                ...formData,
                purchaseOrderNo: poNumber,
                truckId: existingQuotation.truckId,
                trailerId: existingQuotation.trailerId,
                driverId: existingQuotation.driverId,
            });
        } else {
            // Just set PO, keep other fields empty
            setFormData({
                ...formData,
                purchaseOrderNo: poNumber,
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Step 1: Select Purchase Order */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-500" />
                    1. เลือกใบสั่งซื้อ (PO)
                </h4>
                <label htmlFor="po-selection" className="sr-only">เลือกใบสั่งซื้อ (PO)</label>
                <select
                    id="po-selection"
                    value={formData.purchaseOrderNo}
                    onChange={(e) => handlePOChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                    <option value="">-- เลือกใบสั่งซื้อ --</option>
                    {mockApprovedOrders.map((order) => (
                        <option key={order.orderNo} value={order.orderNo}>
                            {order.orderNo} - {order.supplierOrderNo} ({currencyFormatter.format(order.totalAmount)})
                        </option>
                    ))}
                </select>

                {/* Display PO Details (Read-only) */}
                {selectedPO && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800"
                    >
                        <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">ข้อมูลใบสั่งซื้อ</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">เลขที่ PO:</span>
                                <span className="ml-2 font-semibold text-gray-900 dark:text-white">{selectedPO.orderNo}</span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">เลขที่ออเดอร์ ปตท.:</span>
                                <span className="ml-2 font-semibold text-gray-900 dark:text-white">{selectedPO.supplierOrderNo}</span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">วันที่สั่ง:</span>
                                <span className="ml-2 font-semibold text-gray-900 dark:text-white">{selectedPO.orderDate}</span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400">วันที่ต้องการรับ:</span>
                                <span className="ml-2 font-semibold text-gray-900 dark:text-white">{selectedPO.deliveryDate}</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="text-gray-600 dark:text-gray-400">รายการน้ำมัน:</span>
                                <div className="mt-2 space-y-1">
                                    {selectedPO.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-xs bg-white/60 dark:bg-gray-800/60 p-2 rounded">
                                            <span className="font-medium">{item.oilType}</span>
                                            <span>{numberFormatter.format(item.quantity)} ลิตร</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <span className="text-gray-600 dark:text-gray-400">ยอดรวม:</span>
                                <span className="ml-2 font-bold text-lg text-blue-600 dark:text-blue-400">
                                    {currencyFormatter.format(selectedPO.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Step 2: PTT Quotation Details */}
            {selectedPO && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
                >
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-500" />
                        2. ข้อมูลใบเสนอราคาจาก ปตท.
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* เลขที่ใบเสนอราคา */}
                        <div>
                            <label htmlFor="ptt-quotation-no" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                เลขที่ใบเสนอราคา ปตท. <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="ptt-quotation-no"
                                value={formData.pttQuotationNo}
                                onChange={(e) => setFormData({ ...formData, pttQuotationNo: e.target.value })}
                                placeholder="เช่น QT-2024-001"
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {/* วันที่ใบเสนอราคา */}
                        <div>
                            <label htmlFor="ptt-quotation-date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                วันที่ใบเสนอราคา <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="ptt-quotation-date"
                                value={formData.pttQuotationDate}
                                onChange={(e) => setFormData({ ...formData, pttQuotationDate: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {/* มูลค่ารวม */}
                        <div>
                            <label htmlFor="ptt-quotation-amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                มูลค่ารวม (บาท) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="ptt-quotation-amount"
                                value={formData.pttQuotationAmount || ""}
                                onChange={(e) => setFormData({ ...formData, pttQuotationAmount: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {/* วันที่นัดรับ */}
                        <div>
                            <label htmlFor="scheduled-pickup-date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                วันที่นัดรับน้ำมัน
                            </label>
                            <input
                                type="date"
                                id="scheduled-pickup-date"
                                value={formData.scheduledPickupDate}
                                onChange={(e) => setFormData({ ...formData, scheduledPickupDate: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {/* เวลานัดรับ */}
                        <div>
                            <label htmlFor="scheduled-pickup-time" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                เวลานัดรับ
                            </label>
                            <input
                                type="time"
                                id="scheduled-pickup-time"
                                value={formData.scheduledPickupTime}
                                onChange={(e) => setFormData({ ...formData, scheduledPickupTime: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Step 3: Select Truck, Trailer, Driver */}
            {selectedPO && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm"
                >
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-emerald-500" />
                        3. เลือกรถและคนขับ
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* เลือกหัวรถ */}
                        <div>
                            <label htmlFor="truck-id-form" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                เลือกหัวรถ <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="truck-id-form"
                                value={formData.truckId}
                                onChange={(e) => setFormData({ ...formData, truckId: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">-- เลือกหัวรถ --</option>
                                {mockTrucks.map((truck) => (
                                    <option key={truck.id} value={truck.id}>
                                        {truck.plateNumber} - {truck.brand} {truck.model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* เลือกหางรถ */}
                        <div>
                            <label htmlFor="trailer-id-form" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                เลือกหางรถ <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="trailer-id-form"
                                value={formData.trailerId}
                                onChange={(e) => setFormData({ ...formData, trailerId: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="">-- เลือกหางรถ --</option>
                                {mockTrailers.map((trailer) => (
                                    <option key={trailer.id} value={trailer.id}>
                                        {trailer.plateNumber} - {numberFormatter.format(trailer.capacity)} ลิตร
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* เลือกคนขับ */}
                        <div>
                            <label htmlFor="driver-id-form" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                เลือกคนขับ <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="driver-id-form"
                                value={formData.driverId}
                                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">-- เลือกคนขับ --</option>
                                {employees.filter((e) => e.status === "Active").map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} ({emp.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Display Selected Info */}
                    {(selectedTruck || selectedTrailer || selectedDriver) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                {selectedTruck && (
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">รถ:</span>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedTruck.plateNumber}
                                            <span className="text-gray-500 ml-1">• {selectedTruck.brand} {selectedTruck.model}</span>
                                        </p>
                                    </div>
                                )}
                                {selectedTrailer && (
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">หาง:</span>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedTrailer.plateNumber}
                                            <span className="text-gray-500 ml-1">• {numberFormatter.format(selectedTrailer.capacity)} ลิตร</span>
                                        </p>
                                    </div>
                                )}
                                {selectedDriver && (
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">คนขับ:</span>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {selectedDriver.name}
                                            <span className="text-gray-500 ml-1">• {selectedDriver.code}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-all duration-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                    ยกเลิก
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!selectedPO}
                    className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    <Save className="w-4 h-4" />
                    บันทึกใบเสนอราคา
                </button>
            </div>
        </div>
    );
}
