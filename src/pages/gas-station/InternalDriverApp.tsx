import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGasStation } from "@/contexts/GasStationContext";
import type { DriverJob as DriverJobType, FuelingRecord } from "@/types/gasStation";
import {
    Truck,
    MapPin,
    Camera,
    CheckCircle,
    Navigation,
    Droplet,
    Building2,
    ChevronRight,
    ArrowLeft,
    X,
    GripVertical,
    FileText,
    Check,
    Gauge,
    Save,
} from "lucide-react";
import DriverBottomNav from "@/components/DriverBottomNav";

type Step = "start-trip" | "pickup-confirm" | "route-planning" | "delivery" | "fueling" | "arrive-depot" | "completed";

export default function InternalDriverApp() {
    const { allDriverJobs, updateDriverJob, addFuelingRecord } = useGasStation();
    const [selectedJob, setSelectedJob] = useState<DriverJobType | null>(null);
    const [currentStep, setCurrentStep] = useState<Step>("start-trip");
    const [currentDeliveryIndex, setCurrentDeliveryIndex] = useState(0);
    const [routeOrder, setRouteOrder] = useState<number[]>([]); 

    // Form states
    const [startOdometer, setStartOdometer] = useState("");
    const [startOdometerPhoto, setStartOdometerPhoto] = useState("");
    const [startFuel, setStartFuel] = useState("");

    const [pickupPhotos, setPickupPhotos] = useState<string[]>([]);
    const [pickupOdometer, setPickupOdometer] = useState("");
    const [pickupNotes, setPickupNotes] = useState("");

    const [deliveryPhotos, setDeliveryPhotos] = useState<string[]>([]);
    const [deliveryOdometer, setDeliveryOdometer] = useState("");
    const [deliveryNotes, setDeliveryNotes] = useState("");

    // Fueling states
    const [fuelAmount, setFuelAmount] = useState("");
    const [fuelCost, setFuelCost] = useState("");
    const [fuelStation, setFuelCostStation] = useState("");
    const [fuelPhoto, setFuelPhoto] = useState("");

    const [depotOdometer, setDepotOdometer] = useState("");
    const [depotOdometerPhoto, setDepotOdometerPhoto] = useState("");
    const [depotFuel, setDepotFuel] = useState("");
    const [depotNotes, setDepotNotes] = useState("");

    const [isArrivedAtBranch, setIsArrivedAtBranch] = useState(false);

    // Filter only internal jobs
    const filteredJobs = useMemo(() => {
        return allDriverJobs
            .filter(job => job.orderType === "internal" && job.status !== "ส่งเสร็จ")
            .sort((a, b) => {
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeB - timeA;
            })
            .slice(0, 1);
    }, [allDriverJobs]);

    const handleSelectJob = (job: DriverJobType) => {
        setSelectedJob(job);
        if (!job.routeOrder || job.routeOrder.length === 0) {
            setRouteOrder(job.destinationBranches.map((b) => b.branchId));
        } else {
            setRouteOrder(job.routeOrder);
        }

        // Initialize from existing data
        if (job.startTrip) {
            setStartOdometer(job.startTrip.startOdometer.toString());
            setStartFuel(job.startTrip.startFuel?.toString() || "");
        }

        // Determine step
        if (job.status === "รอเริ่ม") {
            setCurrentStep("start-trip");
        } else if (job.status === "ออกเดินทางแล้ว") {
            setCurrentStep("pickup-confirm");
        } else if (job.status === "รับน้ำมันแล้ว") {
            setCurrentStep("route-planning");
        } else if (job.status === "จัดเรียงเส้นทางแล้ว" || job.status === "กำลังส่ง") {
            setCurrentStep("delivery");
            const orderedBranches = getOrderedBranches(job);
            const firstPendingIndex = orderedBranches.findIndex((b) => b.status !== "ส่งแล้ว");
            setCurrentDeliveryIndex(firstPendingIndex >= 0 ? firstPendingIndex : 0);
        }
        resetFormStates();
    };

    const resetFormStates = () => {
        setStartOdometer("");
        setStartOdometerPhoto("");
        setStartFuel("");
        setPickupPhotos([]);
        setPickupOdometer("");
        setPickupNotes("");
        setDeliveryPhotos([]);
        setDeliveryOdometer("");
        setDeliveryNotes("");
        setFuelAmount("");
        setFuelCost("");
        setFuelCostStation("");
        setFuelPhoto("");
        setDepotOdometer("");
        setDepotOdometerPhoto("");
        setDepotFuel("");
        setDepotNotes("");
        setIsArrivedAtBranch(false);
    };

    const getOrderedBranches = (job: DriverJobType) => {
        if (!job.routeOrder || job.routeOrder.length === 0) return job.destinationBranches;
        return job.routeOrder.map((id) => job.destinationBranches.find((b) => b.branchId === id)!).filter(Boolean);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setPhotos: React.Dispatch<React.SetStateAction<string[]>>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotos((prev) => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleGoBack = () => {
        if (!selectedJob) return;
        if (currentStep === "pickup-confirm") setCurrentStep("start-trip");
        else if (currentStep === "route-planning") setCurrentStep("pickup-confirm");
        else if (currentStep === "delivery") setCurrentStep("route-planning");
        else if (currentStep === "fueling") setCurrentStep("delivery");
        else if (currentStep === "arrive-depot") setCurrentStep("fueling");
    };

    const handleStartTrip = () => {
        if (!selectedJob || !startOdometer) return alert("กรุณากรอกเลขไมล์เริ่มต้น");
        const updatedJob = {
            ...selectedJob,
            status: "ออกเดินทางแล้ว" as const,
            startTrip: {
                startedAt: new Date().toISOString(),
                startOdometer: parseFloat(startOdometer),
                startOdometerPhoto: startOdometerPhoto || undefined,
                startFuel: startFuel ? parseFloat(startFuel) : undefined,
            },
        };
        updateDriverJob(selectedJob.id, updatedJob);
        setSelectedJob(updatedJob);
        setCurrentStep("pickup-confirm");
    };

    const handleConfirmPickup = () => {
        if (!selectedJob || !pickupOdometer) return alert("กรุณากรอกเลขไมล์");
        const updatedJob = {
            ...selectedJob,
            status: "รับน้ำมันแล้ว" as const,
            pickupConfirmation: {
                confirmedAt: new Date().toISOString(),
                photos: pickupPhotos,
                odometerReading: parseFloat(pickupOdometer),
                notes: pickupNotes || undefined,
            },
        };
        updateDriverJob(selectedJob.id, updatedJob);
        setSelectedJob(updatedJob);
        setCurrentStep("route-planning");
    };

    const handleConfirmRoute = () => {
        if (!selectedJob) return;
        const updatedJob = { ...selectedJob, status: "จัดเรียงเส้นทางแล้ว" as const, routeOrder };
        updateDriverJob(selectedJob.id, updatedJob);
        setSelectedJob(updatedJob);
        setCurrentStep("delivery");
        setCurrentDeliveryIndex(0);
    };

    const handleConfirmArrival = () => {
        if (!selectedJob) return;
        const ordered = getOrderedBranches(selectedJob);
        const current = ordered[currentDeliveryIndex];
        const updatedJob = {
            ...selectedJob,
            destinationBranches: selectedJob.destinationBranches.map(b => 
                b.branchId === current.branchId ? { ...b, arrivalConfirmation: { confirmedAt: new Date().toISOString() } } : b
            ),
        };
        updateDriverJob(selectedJob.id, updatedJob);
        setSelectedJob(updatedJob);
        setIsArrivedAtBranch(true);
    };

    const handleConfirmDelivery = () => {
        if (!selectedJob || !deliveryOdometer || deliveryPhotos.length === 0) 
            return alert("กรุณากรอกข้อมูลให้ครบถ้วนและถ่ายรูปหลักฐาน");

        const ordered = getOrderedBranches(selectedJob);
        const current = ordered[currentDeliveryIndex];

        const updatedBranches = selectedJob.destinationBranches.map((b) =>
            b.branchId === current.branchId ? {
                ...b,
                status: "ส่งแล้ว" as const,
                deliveryConfirmation: {
                    confirmedAt: new Date().toISOString(),
                    photos: deliveryPhotos,
                    odometerReading: parseFloat(deliveryOdometer),
                    notes: deliveryNotes || undefined,
                },
            } : b
        );

        const allDelivered = updatedBranches.every((b) => b.status === "ส่งแล้ว");
        const updatedJob = {
            ...selectedJob,
            destinationBranches: updatedBranches,
            status: allDelivered ? ("ส่งเสร็จ" as const) : ("กำลังส่ง" as const),
        };

        updateDriverJob(selectedJob.id, updatedJob);
        setSelectedJob(updatedJob);

        if (allDelivered) {
            setCurrentStep("fueling");
        } else {
            const nextIdx = getOrderedBranches(updatedJob).findIndex(b => b.status !== "ส่งแล้ว");
            setCurrentDeliveryIndex(nextIdx >= 0 ? nextIdx : 0);
            setIsArrivedAtBranch(false);
            setDeliveryPhotos([]);
            setDeliveryOdometer("");
        }
    };

    const handleSaveFueling = () => {
        if (!selectedJob) return;
        if (!fuelAmount) return alert("กรุณากรอกจำนวนลิตร");

        const fuelingRecord: FuelingRecord = {
            id: `FUEL-${Date.now()}`,
            transportNo: selectedJob.transportNo,
            fuelingDate: new Date().toISOString().split("T")[0],
            fuelingTime: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
            quantity: parseFloat(fuelAmount),
            amount: fuelCost ? parseFloat(fuelCost) : 0,
            stationName: fuelStation,
            photoUrl: fuelPhoto,
            odometerReading: parseFloat(deliveryOdometer) || 0,
            oilType: "Diesel", // Default or you could add a state for this
            recordedBy: "Driver",
            recordedAt: new Date().toISOString(),
        };

        addFuelingRecord(selectedJob.id, fuelingRecord);
        alert("บันทึกการเติมน้ำมันเรียบร้อย");
        setFuelAmount("");
        setFuelCost("");
        setFuelCostStation("");
        setFuelPhoto("");
    };

    const handleEndTrip = () => {
        if (!selectedJob || !depotOdometer) return alert("กรุณากรอกเลขไมล์");
        const updatedJob = {
            ...selectedJob,
            status: "ส่งเสร็จ" as const,
            depotArrival: {
                arrivedAt: new Date().toISOString(),
                endOdometer: parseFloat(depotOdometer),
                endOdometerPhoto: depotOdometerPhoto || undefined,
                endFuel: depotFuel ? parseFloat(depotFuel) : undefined,
                notes: depotNotes || undefined,
            },
        };
        updateDriverJob(selectedJob.id, updatedJob);
        setSelectedJob(updatedJob);
        setCurrentStep("completed");
    };

    const steps = [
        { id: "start-trip", label: "เริ่มไมล์ต้นทาง", icon: Gauge },
        { id: "pickup-confirm", label: "รับของต้นทาง", icon: Droplet },
        { id: "route-planning", label: "จัดเส้นทาง", icon: Navigation },
        { id: "delivery", label: "ส่งน้ำมัน", icon: Building2 },
        { id: "fueling", label: "เติมน้ำมันรถ", icon: Gauge },
        { id: "arrive-depot", label: "จบงาน", icon: CheckCircle },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    if (!selectedJob) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 font-sans">
                <div className="p-5 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-[1.25rem] flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm border border-purple-200 dark:border-purple-800">
                            <Truck className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">แอปคนขับ</h1>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">ระบบจัดการงานส่งน้ำมันภายใน</p>
                        </div>
                    </div>

                    {filteredJobs.length === 0 ? (
                        <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-10 h-10 text-gray-200" />
                            </div>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">ไม่มีงานส่งน้ำมันภายในค้างอยู่</p>
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <div key={job.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                                
                                <div className="flex justify-between mb-6 relative z-10">
                                    <div>
                                        <p className="text-purple-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">รอบส่งปัจจุบัน</p>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">{job.transportNo}</h3>
                                    </div>
                                    <span className="px-4 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-wider h-fit border border-purple-100 dark:border-purple-800">
                                        {job.status}
                                    </span>
                                </div>

                                <div className="space-y-6 mb-8 relative pl-4 z-10">
                                    <div className="absolute left-[15px] top-2 bottom-6 w-[2px] bg-gradient-to-b from-purple-500/20 via-purple-500/10 to-transparent" />
                                    
                                    <div className="flex gap-5 relative">
                                        <div className="w-8 h-8 rounded-full bg-purple-600 border-4 border-white dark:border-gray-800 shadow-lg shadow-purple-600/20 z-10 flex items-center justify-center">
                                            <MapPin className="w-3 h-3 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">จากสาขา</p>
                                            <p className="font-black text-gray-900 dark:text-white text-base tracking-tight">{job.sourceBranchName}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-5 relative">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 border-4 border-white dark:border-gray-800 shadow-lg shadow-emerald-500/20 z-10 flex items-center justify-center">
                                            <Navigation className="w-3 h-3 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">ไปส่ง {job.destinationBranches.length} สาขา</p>
                                            <p className="font-black text-gray-900 dark:text-white text-base tracking-tight truncate max-w-[200px]">{job.destinationBranches.map(b => b.branchName).join(", ")}</p>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => handleSelectJob(job)} className="w-full py-5 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center gap-3 relative z-10 group">
                                    เริ่มงานขนส่งภายใน 
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <DriverBottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 font-sans">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <button onClick={() => setSelectedJob(null)} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 font-bold text-sm transition-colors">
                    <ArrowLeft className="w-5 h-5" /> กลับ
                </button>
                <span className="font-black text-purple-600 tracking-tighter text-lg">{selectedJob.transportNo}</span>
                <div className="w-12" />
            </div>

            <div className="p-6 space-y-8">
                {/* Modern Stepper Header */}
                <div className="w-full overflow-x-auto no-scrollbar py-2 -mx-6 px-6">
                    <div className="flex items-start justify-between min-w-[650px] relative">
                        {/* Progress Line Background */}
                        <div className="absolute top-[22px] left-0 right-0 h-[2px] bg-gray-100 dark:bg-gray-800 -z-0" />
                        
                        {/* Active Progress Line */}
                        <div 
                            className="absolute top-[22px] left-0 h-[2px] bg-purple-600 transition-all duration-500 ease-in-out" 
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        />

                        {steps.map((s, idx) => {
                            const isCompleted = currentStepIndex > idx;
                            const isCurrent = currentStepIndex === idx;
                            const StepIcon = s.icon;
                            
                            return (
                                <div key={s.id} className="flex flex-col items-center relative z-10 w-24">
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                                        isCompleted 
                                            ? "bg-purple-600 border-white dark:border-gray-900 shadow-lg shadow-purple-600/30" 
                                            : isCurrent
                                                ? "bg-purple-600 border-white dark:border-gray-900 shadow-xl shadow-purple-600/40 scale-110"
                                                : "bg-[#F1F5F9] dark:bg-gray-800 border-white dark:border-gray-900"
                                    }`}>
                                        {isCompleted ? (
                                            <Check className="w-5 h-5 text-white" strokeWidth={4} />
                                        ) : (
                                            <StepIcon className={`w-5 h-5 ${isCurrent ? "text-white" : "text-gray-400"}`} />
                                        )}
                                    </div>
                                    <span className={`text-[9px] mt-3 font-black uppercase tracking-[0.15em] text-center leading-tight transition-colors duration-300 max-w-[80px] ${
                                        isCurrent || isCompleted ? "text-purple-600" : "text-gray-400"
                                    }`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {currentStep === "start-trip" && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">เริ่มไมล์ต้นทาง</h2>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">Step 1</span>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">เลขไมล์ปัจจุบัน (กม.)</label>
                                    <div className="relative">
                                        <input type="number" value={startOdometer} onChange={e => setStartOdometer(e.target.value)} className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500/30 focus:bg-white dark:focus:bg-gray-800 rounded-3xl font-black text-lg outline-none transition-all shadow-inner" placeholder="0" />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300 uppercase tracking-widest">KM</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">น้ำมันเริ่มต้น (ลิตร)</label>
                                    <div className="relative">
                                        <input type="number" value={startFuel} onChange={e => setStartFuel(e.target.value)} className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500/30 focus:bg-white dark:focus:bg-gray-800 rounded-3xl font-black text-lg outline-none transition-all shadow-inner" placeholder="0" />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300 uppercase tracking-widest">LTR</div>
                                    </div>
                                </div>
                                <button onClick={handleStartTrip} className="w-full py-5 bg-purple-600 text-white rounded-3xl font-black text-sm shadow-xl shadow-purple-600/20 active:scale-[0.98] transition-all mt-4 uppercase tracking-widest">ออกเดินทางจากสาขา</button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "pickup-confirm" && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                    รับน้ำมันจาก <span className="text-purple-600">{selectedJob.sourceBranchName}</span>
                                </h2>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-full shrink-0 border border-gray-100 dark:border-gray-700">Step 2</span>
                            </div>
                            <div className="space-y-6">
                                <div className="p-6 bg-purple-50/50 dark:bg-purple-900/10 rounded-[2rem] border border-purple-100 dark:border-purple-800/30">
                                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mb-4">รายการน้ำมันที่ต้องรับ:</p>
                                    <div className="space-y-3">
                                        {selectedJob.compartments.map(c => (
                                            <div key={c.id} className="flex justify-between items-center bg-white/80 dark:bg-gray-800/80 p-4 rounded-2xl shadow-sm border border-purple-50 dark:border-purple-900/20">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-[10px] font-black uppercase">CH{c.compartmentNumber}</div>
                                                    <span className="text-sm font-black text-gray-700 dark:text-gray-300">{c.oilType}</span>
                                                </div>
                                                <span className="font-black text-purple-600 text-sm tracking-tight">{c.quantity?.toLocaleString()} <span className="text-[9px] text-gray-400 uppercase ml-1">Liters</span></span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">เลขไมล์หลังรับน้ำมัน</label>
                                    <input type="number" value={pickupOdometer} onChange={e => setPickupOdometer(e.target.value)} className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500/30 focus:bg-white dark:focus:bg-gray-800 rounded-3xl font-black text-lg outline-none transition-all shadow-inner" placeholder="0" />
                                </div>
                                <div className="flex flex-col gap-3 pt-2">
                                    <button onClick={handleConfirmPickup} className="w-full py-5 bg-purple-600 text-white rounded-3xl font-black text-sm shadow-xl shadow-purple-600/20 transition-all uppercase tracking-widest">ยืนยันรับน้ำมันเรียบร้อย</button>
                                    <button onClick={handleGoBack} className="w-full py-3 text-gray-400 hover:text-gray-600 font-black text-[10px] uppercase tracking-[0.2em] transition-colors">ย้อนกลับ</button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "route-planning" && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">จัดลำดับการส่ง</h2>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">Step 3</span>
                            </div>
                            <div className="space-y-3 mb-8">
                                {routeOrder.map((id, idx) => {
                                    const b = selectedJob.destinationBranches.find(x => x.branchId === id);
                                    if (!b) return null;
                                    return (
                                        <div key={id} className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-900/30 transition-all flex items-center gap-5 group">
                                            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-purple-600/20">{idx + 1}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-gray-900 dark:text-white text-base tracking-tight truncate">{b.branchName}</p>
                                                <p className="text-[9px] text-gray-400 font-black uppercase truncate tracking-widest">{b.address}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <GripVertical className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={handleConfirmRoute} className="w-full py-5 bg-purple-600 text-white rounded-3xl font-black text-sm shadow-xl shadow-purple-600/20 transition-all uppercase tracking-widest">บันทึกเส้นทางและเริ่มส่ง</button>
                        </motion.div>
                    )}

                    {currentStep === "delivery" && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                            {!isArrivedAtBranch && !getOrderedBranches(selectedJob)[currentDeliveryIndex].arrivalConfirmation ? (
                                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] text-center border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent" />
                                    <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10">
                                        <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-10" />
                                        <MapPin className="w-12 h-12 text-purple-600" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2 tracking-tighter relative z-10">ถึง <span className="text-purple-600">{getOrderedBranches(selectedJob)[currentDeliveryIndex].branchName}</span> แล้ว?</h3>
                                    <p className="text-xs font-bold text-gray-400 mb-10 uppercase tracking-[0.2em] relative z-10">กรุณายืนยันเมื่อรถถึงหน้าปั๊มปลายทาง</p>
                                    <button onClick={handleConfirmArrival} className="w-full py-5 bg-purple-600 text-white rounded-3xl font-black text-sm shadow-xl shadow-purple-600/20 transition-all active:scale-[0.98] uppercase tracking-widest relative z-10">ยืนยันว่าถึงแล้ว</button>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">ยืนยันการส่งน้ำมัน</h2>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full border border-purple-100 dark:border-purple-800">Branch {currentDeliveryIndex + 1} / {selectedJob.destinationBranches.length}</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100/50 dark:border-emerald-800/30 mb-8">
                                        <div className="flex items-center gap-4 mb-1">
                                            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-emerald-600 shadow-sm">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <p className="font-black text-emerald-600 text-lg tracking-tight">{getOrderedBranches(selectedJob)[currentDeliveryIndex].branchName}</p>
                                        </div>
                                        <p className="text-[9px] font-bold text-emerald-600/60 uppercase ml-14 tracking-[0.15em]">{getOrderedBranches(selectedJob)[currentDeliveryIndex].address}</p>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">ถ่ายรูปหลักฐานการลงน้ำมัน</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {deliveryPhotos.map((p, i) => (
                                                    <div key={i} className="aspect-[4/3] rounded-[1.5rem] overflow-hidden relative border-2 border-gray-100 dark:border-gray-800 shadow-sm group">
                                                        <img src={p} className="w-full h-full object-cover" />
                                                        <button onClick={() => setDeliveryPhotos(deliveryPhotos.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"><X className="w-3 h-3" strokeWidth={3} /></button>
                                                    </div>
                                                ))}
                                                <label className="aspect-[4/3] rounded-[1.5rem] border-2 border-dashed border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-all hover:border-purple-300">
                                                    <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-300">
                                                        <Camera className="w-6 h-6" />
                                                    </div>
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">เพิ่มรูป</span>
                                                    <input type="file" accept="image/*" multiple onChange={e => handlePhotoUpload(e, setDeliveryPhotos)} className="hidden" />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">เลขไมล์หลังส่ง</label>
                                            <div className="relative">
                                                <input type="number" value={deliveryOdometer} onChange={e => setDeliveryOdometer(e.target.value)} className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500/30 focus:bg-white dark:focus:bg-gray-800 rounded-3xl font-black text-lg outline-none transition-all shadow-inner" placeholder="0" />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">KM</div>
                                            </div>
                                        </div>
                                        <button onClick={handleConfirmDelivery} className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-sm shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all uppercase tracking-widest">ยืนยันการส่งน้ำมันสาขานี้</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {currentStep === "fueling" && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">บันทึกการเติมน้ำมันรถ</h2>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">Step 5</span>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">จำนวนลิตร</label>
                                        <input type="number" value={fuelAmount} onChange={e => setFuelAmount(e.target.value)} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500/30 rounded-2xl font-black text-lg outline-none transition-all shadow-inner" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">จำนวนเงิน (บาท)</label>
                                        <input type="number" value={fuelCost} onChange={e => setFuelCost(e.target.value)} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500/30 rounded-2xl font-black text-lg outline-none transition-all shadow-inner" placeholder="0.00" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">ปั๊มที่เติม</label>
                                    <input type="text" value={fuelStation} onChange={e => setFuelCostStation(e.target.value)} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500/30 rounded-2xl font-black text-sm outline-none transition-all shadow-inner" placeholder="ระบุชื่อปั๊มหรือสถานที่" />
                                </div>
                                
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">รูปถ่ายบิล/ใบเสร็จ</label>
                                    {fuelPhoto ? (
                                        <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-gray-100 dark:border-gray-800">
                                            <img src={fuelPhoto} className="w-full h-full object-cover" />
                                            <button onClick={() => setFuelPhoto("")} className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 shadow-lg"><X className="w-4 h-4" /></button>
                                        </div>
                                    ) : (
                                        <label className="aspect-video rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                                            <Camera className="w-10 h-10 text-gray-300" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ถ่ายรูปใบเสร็จ</span>
                                            <input type="file" accept="image/*" onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setFuelPhoto(reader.result as string);
                                                    reader.readAsDataURL(file);
                                                }
                                            }} className="hidden" />
                                        </label>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    <button onClick={handleSaveFueling} className="w-full py-5 bg-purple-600 text-white rounded-3xl font-black text-sm shadow-xl shadow-purple-600/20 transition-all uppercase tracking-widest flex items-center justify-center gap-3">
                                        <Save className="w-5 h-5" /> บันทึกการเติมน้ำมัน
                                    </button>
                                    <button onClick={() => setCurrentStep("arrive-depot")} className="w-full py-5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-3xl font-black text-sm transition-all uppercase tracking-widest">ข้ามไปขั้นตอนจบงาน</button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "arrive-depot" && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">จบงานขนส่ง</h2>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">Final Step</span>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">เลขไมล์ปลายทาง (กม.)</label>
                                    <input type="number" value={depotOdometer} onChange={e => setDepotOdometer(e.target.value)} className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500/30 focus:bg-white dark:focus:bg-gray-800 rounded-3xl font-black text-lg outline-none transition-all shadow-inner" placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">น้ำมันคงเหลือ (ลิตร)</label>
                                    <input type="number" value={depotFuel} onChange={e => setDepotFuel(e.target.value)} className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500/30 focus:bg-white dark:focus:bg-gray-800 rounded-3xl font-black text-lg outline-none transition-all shadow-inner" placeholder="0" />
                                </div>
                                <button onClick={handleEndTrip} className="w-full py-5 bg-purple-600 text-white rounded-3xl font-black text-sm shadow-xl shadow-purple-600/20 transition-all mt-4 uppercase tracking-widest">ปิดรอบและส่งงาน</button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "completed" && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-[3rem] p-12 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] text-center border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
                            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10">
                                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-10" />
                                <CheckCircle className="w-12 h-12 text-emerald-600" />
                            </div>
                            <h2 className="text-3xl font-black mb-3 tracking-tighter relative z-10">ภาระกิจสำเร็จ!</h2>
                            <p className="text-sm font-bold text-gray-400 mb-10 leading-relaxed uppercase tracking-widest relative z-10">คุณทำภาระกิจส่งน้ำมันภายในสำเร็จแล้ว<br/>ขอบคุณสำหรับการทำงาน</p>
                            <button onClick={() => setSelectedJob(null)} className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-3xl font-black text-sm shadow-xl shadow-gray-900/10 active:scale-[0.98] transition-all uppercase tracking-widest relative z-10">
                                กลับไปรับงานใหม่
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <DriverBottomNav />
        </div>
    );
}
