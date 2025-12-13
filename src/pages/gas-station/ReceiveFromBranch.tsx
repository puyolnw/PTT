
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    Truck,
    MapPin,
    Calendar,
    FileText,
    CheckCircle,
    User,
    Droplet,
    Save,
    AlertTriangle,
    XCircle,
    Gauge,
    PackageCheck,
    FileDown
} from "lucide-react";

// Mock Data for Transports
const mockTransports = [
    {
        id: "TR-20241215-001",
        status: "in_transit",
        sourceBranch: "Head Office (Surin)",
        destinationBranch: "Branch 1 (Prasat)",
        truckPlate: "70-1234",
        trailerPlate: "70-5678",
        driverName: "Somchai Driver",
        departureTime: "2024-12-15 08:30",
        startMileage: 125000,
        deliveryNoteNo: "DN-HO-20241215-001",
        items: [
            { oilType: "Diesel B7", quantity: 12000, compartment: 1 },
            { oilType: "Gasohol 95", quantity: 8000, compartment: 2 },
            { oilType: "Gasohol 91", quantity: 4000, compartment: 3 }
        ]
    },
    {
        id: "TR-20241215-002",
        status: "in_transit",
        sourceBranch: "Head Office (Surin)",
        destinationBranch: "Branch 2 (Sangkha)",
        truckPlate: "70-2222",
        trailerPlate: "70-8888",
        driverName: "Wichai Driver",
        departureTime: "2024-12-15 09:00",
        startMileage: 98500,
        deliveryNoteNo: "DN-HO-20241215-002",
        items: [
            { oilType: "Diesel B7", quantity: 15000, compartment: 1 },
            { oilType: "Diesel B7", quantity: 5000, compartment: 2 },
            { oilType: "Gasohol 95", quantity: 10000, compartment: 3 }
        ]
    },
    {
        id: "TR-20241214-999",
        status: "completed",
        sourceBranch: "Head Office (Surin)",
        destinationBranch: "Branch 1 (Prasat)",
        truckPlate: "70-9999",
        trailerPlate: "70-0000",
        driverName: "Somsak Finished",
        departureTime: "2024-12-14 14:00",
        startMileage: 124000,
        deliveryNoteNo: "DN-HO-20241214-999",
        items: [
            { oilType: "Diesel B7", quantity: 10000, compartment: 1 }
        ]
    }
];

// Mock Tanks
const mockTanks = [
    { id: 1, name: "Tank 1 (Diesel B7)", oilType: "Diesel B7", capacity: 20000, currentLevel: 5000 },
    { id: 2, name: "Tank 2 (Gasohol 95)", oilType: "Gasohol 95", capacity: 15000, currentLevel: 3000 },
    { id: 3, name: "Tank 3 (Gasohol 91)", oilType: "Gasohol 91", capacity: 10000, currentLevel: 2000 },
];

export default function ReceiveFromBranch() {
    // State
    const [selectedTransport, setSelectedTransport] = useState<any>(null);
    const [step, setStep] = useState(1); // 1: Select Transport, 2: Verify & Details, 3: Success

    // Form Data
    const [formData, setFormData] = useState({
        endMileage: 0,
        deliveryNoteVerify: "",
        receiveDate: new Date().toISOString().split('T')[0],
        receiveTime: new Date().toTimeString().substring(0, 5),
        qualityTest: {
            apiGravity: 0,
            temperature: 0,
            waterContent: 0,
            color: "Normal",
            testResult: "pass" // pass, fail
        },
        measurements: [] as any[]
    });

    // Initialize measurements when transport is selected
    useEffect(() => {
        if (selectedTransport) {
            const initialMeasurements = selectedTransport.items.map((item: any) => ({
                ...item,
                targetTankId: mockTanks.find(t => t.oilType === item.oilType)?.id || "",
                beforeDip: 0,
                afterDip: 0,
                receivedQuantity: item.quantity // Default to ordered quantity
            }));
            setFormData(prev => ({ ...prev, measurements: initialMeasurements }));
        }
    }, [selectedTransport]);

    // Validation Logic
    const distance = selectedTransport ? formData.endMileage - selectedTransport.startMileage : 0;
    const isDeliveryNoteMatch = selectedTransport ? formData.deliveryNoteVerify === selectedTransport.deliveryNoteNo : false;

    const handleTransportSelect = (transport: any) => {
        setSelectedTransport(transport);
        setStep(2);
    };

    const handleSave = () => {
        // Logic to save data would go here
        // alert("Received successfully! Stock updated.");
        setStep(3); // Go to Success Step
    };

    const handleMockDownload = (docName: string) => {
        alert(`Downloading ${docName}...`);
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-3"
            >
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <PackageCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">รับน้ำมันจากสาขาหลัก</h1>
                    <p className="text-gray-600 dark:text-gray-400">ตรวจสอบและบันทึกการรับน้ำมันที่ส่งมาจากสำนักงานใหญ่</p>
                </div>
            </motion.div>

            {/* Step 1: Select Transport */}
            {step === 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {mockTransports.map((transport) => (
                        <div
                            key={transport.id}
                            onClick={() => transport.status === 'in_transit' && handleTransportSelect(transport)}
                            className={`rounded-xl shadow-md p-6 transition-all border-2 group relative overflow-hidden ${transport.status === 'in_transit'
                                ? "bg-white dark:bg-gray-800 cursor-pointer hover:shadow-xl hover:scale-[1.02] border-transparent hover:border-blue-500"
                                : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-90"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg ${transport.status === 'completed'
                                    ? "bg-green-50 text-green-600"
                                    : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    }`}>
                                    {transport.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${transport.status === 'completed'
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700 animate-pulse"
                                    }`}>
                                    {transport.status === 'completed' ? "รับสำเร็จ" : "กำลังขนส่ง"}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{transport.id}</h3>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{transport.sourceBranch} ➔ {transport.destinationBranch}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>{transport.driverName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{transport.departureTime}</span>
                                </div>
                            </div>

                            <div className={`mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 ${transport.status === 'completed' ? 'space-y-3' : ''}`}>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">ทะเบียนรถ</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-blue-500 transition-colors">
                                        {transport.truckPlate} / {transport.trailerPlate}
                                    </span>
                                </div>

                                {transport.status === 'completed' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMockDownload("Delivery Note");
                                            }}
                                            className="flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <FileDown className="w-3.5 h-3.5" />
                                            ใบส่งของ
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMockDownload("Receipt");
                                            }}
                                            className="flex-1 py-1.5 px-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <FileDown className="w-3.5 h-3.5" />
                                            ใบรับของ
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {mockTransports.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            ไม่มีรายการขนส่ง
                        </div>
                    )}
                </motion.div>
            )}

            {/* Step 2: Details & Confirmation */}
            {step === 2 && selectedTransport && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Transport Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        {/* Transport Detail Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-blue-500" />
                                ข้อมูลการขนส่ง
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Transport ID</label>
                                    <p className="font-semibold text-gray-800 dark:text-white">{selectedTransport.id}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider">หัวลาก</label>
                                        <p className="font-semibold text-gray-800 dark:text-white">{selectedTransport.truckPlate}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider">หางพ่วง</label>
                                        <p className="font-semibold text-gray-800 dark:text-white">{selectedTransport.trailerPlate}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">คนขับ</label>
                                    <p className="font-semibold text-gray-800 dark:text-white">{selectedTransport.driverName}</p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <label className="text-xs text-gray-500 uppercase tracking-wider">เลขใบส่งของ (ต้นทาง)</label>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                            {selectedTransport.deliveryNoteNo}
                                        </p>
                                        <button
                                            onClick={() => handleMockDownload("Delivery Note")}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                                            title="ดาวน์โหลดใบส่งของ"
                                        >
                                            <FileDown className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { setStep(1); setSelectedTransport(null); }}
                                className="mt-6 w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                เปลี่ยนรายการขนส่ง
                            </button>
                        </div>
                    </motion.div>

                    {/* Right Column: Forms */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Section 1: Verification & Mileage */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 border-b pb-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                1. ตรวจสอบและบันทึกระยะทาง
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Delivery Note Verification */}
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            ระบุเลขที่ใบส่งของ (เพื่อยืนยัน) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.deliveryNoteVerify}
                                                onChange={(e) => setFormData({ ...formData, deliveryNoteVerify: e.target.value })}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:outline-none transition-all ${formData.deliveryNoteVerify
                                                    ? (isDeliveryNoteMatch
                                                        ? "border-green-500 focus:ring-green-200 bg-green-50"
                                                        : "border-red-500 focus:ring-red-200 bg-red-50")
                                                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-200"
                                                    }`}
                                                placeholder="กรอกเลขใบส่งของในมือท่าน"
                                            />
                                            <div className="absolute left-3 top-2.5">
                                                {formData.deliveryNoteVerify ? (
                                                    isDeliveryNoteMatch ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />
                                                ) : <FileText className="w-5 h-5 text-gray-400" />}
                                            </div>
                                        </div>
                                        {formData.deliveryNoteVerify && !isDeliveryNoteMatch && (
                                            <p className="text-xs text-red-500 mt-1">เลขที่ใบส่งของไม่ตรงกับข้อมูลในระบบ</p>
                                        )}

                                        <div className="mt-2 text-right">
                                            <button
                                                onClick={() => handleMockDownload("Delivery Note PDF")}
                                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center justify-end gap-1"
                                            >
                                                <FileDown className="w-3 h-3" />
                                                ดูไฟล์ใบส่งของ
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">วันที่รับ</label>
                                            <input
                                                type="date"
                                                value={formData.receiveDate}
                                                onChange={(e) => setFormData({ ...formData, receiveDate: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">เวลาที่รับ</label>
                                            <input
                                                type="time"
                                                value={formData.receiveTime}
                                                onChange={(e) => setFormData({ ...formData, receiveTime: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Mileage Calculation */}
                                <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Gauge className="w-5 h-5 text-purple-500" />
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">บันทึกเลขไมล์</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500">เลขไมล์ต้นทาง</label>
                                            <div className="font-mono text-lg font-bold text-gray-600 dark:text-gray-400">
                                                {selectedTransport.startMileage.toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-blue-600 dark:text-blue-400 font-medium">เลขไมล์ปลายทาง (ท่าน)</label>
                                            <input
                                                type="number"
                                                value={formData.endMileage || ''}
                                                onChange={(e) => setFormData({ ...formData, endMileage: parseFloat(e.target.value) })}
                                                className="w-full px-3 py-1 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-200 bg-white"
                                                placeholder="0.0"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-300">ระยะทางรวม</span>
                                        <span className={`text-xl font-bold ${distance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                            {distance > 0 ? distance.toLocaleString() : '-'} <span className="text-sm font-normal text-gray-500">กม.</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Quality Test */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 border-b pb-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                2. ทดสอบคุณภาพน้ำมัน
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">API Gravity</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="30-45"
                                        value={formData.qualityTest.apiGravity || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, qualityTest: { ...prev.qualityTest, apiGravity: parseFloat(e.target.value) } }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">อุณหภูมิ (°C)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="25-35"
                                        value={formData.qualityTest.temperature || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, qualityTest: { ...prev.qualityTest, temperature: parseFloat(e.target.value) } }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">น้ำปนเปื้อน (%)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="0.00"
                                        value={formData.qualityTest.waterContent || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, qualityTest: { ...prev.qualityTest, waterContent: parseFloat(e.target.value) } }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">ลักษณะสี</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg"
                                        value={formData.qualityTest.color}
                                        onChange={(e) => setFormData(prev => ({ ...prev, qualityTest: { ...prev.qualityTest, color: e.target.value } }))}>
                                        <option value="Normal">ปกติ</option>
                                        <option value="Cloudy">ขุ่น</option>
                                        <option value="Discolored">สีเพี้ยน</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Tank Measurement & Allocation */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 border-b pb-2">
                                <Droplet className="w-5 h-5 text-blue-500" />
                                3. การลงน้ำมัน (Tank Allocation)
                            </h3>

                            <div className="space-y-4">
                                {formData.measurements.map((item, index) => (
                                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                                                    {item.compartment}
                                                </span>
                                                <span className="font-semibold text-gray-800 dark:text-white">
                                                    {item.oilType} ({item.quantity.toLocaleString()} ลิตร)
                                                </span>
                                            </div>
                                            <select
                                                className="bg-white border text-sm px-3 py-1 rounded-lg"
                                                value={item.targetTankId}
                                                onChange={(e) => {
                                                    const newMeasurements = [...formData.measurements];
                                                    newMeasurements[index].targetTankId = parseInt(e.target.value);
                                                    setFormData({ ...formData, measurements: newMeasurements });
                                                }}
                                            >
                                                <option value="">เลือกถังลงน้ำมัน...</option>
                                                {mockTanks.filter(t => t.oilType === item.oilType).map(tank => (
                                                    <option key={tank.id} value={tank.id}>{tank.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-xs text-gray-500">วัดก่อนลง (Before)</label>
                                                <input
                                                    type="number"
                                                    className="w-full border rounded px-2 py-1 text-sm"
                                                    value={item.beforeDip || ''}
                                                    onChange={(e) => {
                                                        const newMeasurements = [...formData.measurements];
                                                        newMeasurements[index].beforeDip = parseFloat(e.target.value);
                                                        setFormData({ ...formData, measurements: newMeasurements });
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">วัดหลังลง (After)</label>
                                                <input
                                                    type="number"
                                                    className="w-full border rounded px-2 py-1 text-sm"
                                                    value={item.afterDip || ''}
                                                    onChange={(e) => {
                                                        const newMeasurements = [...formData.measurements];
                                                        newMeasurements[index].afterDip = parseFloat(e.target.value);
                                                        setFormData({ ...formData, measurements: newMeasurements });
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">รับจริง (คำนวณ)</label>
                                                <div className="text-sm font-bold text-gray-700 py-1">
                                                    {((item.afterDip || 0) - (item.beforeDip || 0)).toLocaleString()} ลิตร
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => { setStep(1); }}
                                className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!isDeliveryNoteMatch || !distance}
                                className={`flex-1 px-6 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg transition-all ${(!isDeliveryNoteMatch || !distance)
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-[1.02]"
                                    }`}
                            >
                                <Save className="w-5 h-5" />
                                บันทึกการรับน้ำมัน
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Step 3: Success Screen */}
            {step === 3 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center space-y-6"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">บันทึกการรับน้ำมันสำเร็จ!</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            ระบบได้ทำการบันทึกข้อมูลและปรับปรุงยอดสต็อกน้ำมันเรียบร้อยแล้ว
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <button
                            onClick={() => handleMockDownload("Receipt")}
                            className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            <FileDown className="w-5 h-5" />
                            ดาวน์โหลดใบเสร็จรับเงิน
                        </button>
                    </div>

                    <button
                        onClick={() => { setStep(1); setSelectedTransport(null); }}
                        className="text-gray-500 hover:text-gray-700 underline"
                    >
                        กลับไปหน้าหลัก
                    </button>
                </motion.div>
            )}
        </div>
    );
}
