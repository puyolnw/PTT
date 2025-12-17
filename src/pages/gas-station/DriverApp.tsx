import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGasStation } from "@/contexts/GasStationContext";
import type { DriverJob as DriverJobType } from "@/types/gasStation";
import {
    Truck,
    Package,
    MapPin,
    Camera,
    CheckCircle,
    Navigation,
    Droplet,
    Building2,
    ChevronRight,
    X,
    AlertCircle,
    Play,
    Route,
    ArrowRight,
    GripVertical,
} from "lucide-react";

const numberFormatter = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
});

// Interface สำหรับงานที่ต้องทำ
interface DriverJob {
    id: string;
    transportNo: string;
    transportDate: string;
    transportTime: string;
    sourceBranchId: number;
    sourceBranchName: string;
    sourceAddress: string;
    destinationBranches: Array<{
        branchId: number;
        branchName: string;
        address: string;
        oilType: string;
        quantity: number;
        status: "รอส่ง" | "กำลังส่ง" | "ส่งแล้ว";
        deliveryConfirmation?: {
            confirmedAt: string;
            photos: string[];
            odometerReading: number;
            notes?: string;
        };
    }>;
    compartments: Array<{
        chamber: number;
        capacity: number;
        oilType: string;
        quantity: number;
        destinationBranchId: number;
        destinationBranchName: string;
    }>;
    truckPlateNumber: string;
    trailerPlateNumber: string;
    status: "รอเริ่ม" | "ออกเดินทางแล้ว" | "รับน้ำมันแล้ว" | "จัดเรียงเส้นทางแล้ว" | "กำลังส่ง" | "ส่งเสร็จ";
    routeOrder?: number[]; // ลำดับการส่ง (branchId)
    startTrip?: {
        startedAt: string;
        startOdometer: number;
        startOdometerPhoto?: string;
    };
    pickupConfirmation?: {
        confirmedAt: string;
        photos: string[];
        odometerReading: number;
        notes?: string;
    };
}

// Mock data - งานของคนขับ
const mockDriverJobs: DriverJob[] = [
    {
        id: "JOB-001",
        transportNo: "TR-20241215-001",
        transportDate: "2024-12-15",
        transportTime: "08:00",
        sourceBranchId: 1,
        sourceBranchName: "ปั๊มไฮโซ",
        sourceAddress: "100 ถนนเพชรบุรี กรุงเทพมหานคร 10400",
        destinationBranches: [
            {
                branchId: 2,
                branchName: "สาขา 2",
                address: "456 ถนนพหลโยธิน กรุงเทพมหานคร 10400",
                oilType: "Premium Diesel",
                quantity: 22000,
                status: "รอส่ง",
            },
            {
                branchId: 3,
                branchName: "สาขา 3",
                address: "789 ถนนรัชดาภิเษก กรุงเทพมหานคร 10320",
                oilType: "Diesel",
                quantity: 20000,
                status: "รอส่ง",
            },
            {
                branchId: 4,
                branchName: "สาขา 4",
                address: "123 ถนนสุขุมวิท กรุงเทพมหานคร 10110",
                oilType: "Premium Gasohol 95",
                quantity: 15000,
                status: "รอส่ง",
            },
        ],
        compartments: [
            { chamber: 1, capacity: 3000, oilType: "Premium Diesel", quantity: 3000, destinationBranchId: 2, destinationBranchName: "สาขา 2" },
            { chamber: 2, capacity: 7000, oilType: "Premium Diesel", quantity: 7000, destinationBranchId: 2, destinationBranchName: "สาขา 2" },
            { chamber: 3, capacity: 12000, oilType: "Premium Diesel", quantity: 12000, destinationBranchId: 2, destinationBranchName: "สาขา 2" },
            { chamber: 4, capacity: 20000, oilType: "Diesel", quantity: 20000, destinationBranchId: 3, destinationBranchName: "สาขา 3" },
            { chamber: 5, capacity: 15000, oilType: "Premium Gasohol 95", quantity: 15000, destinationBranchId: 4, destinationBranchName: "สาขา 4" },
        ],
        truckPlateNumber: "กก 1111",
        trailerPlateNumber: "กข 1234",
        status: "รอเริ่ม",
    },
];

type Step = "start-trip" | "pickup-oil" | "route-planning" | "delivery" | "completed";

export default function DriverApp() {
    const { driverJobs, updateDriverJob, createDriverJob } = useGasStation();
    const [selectedJob, setSelectedJob] = useState<DriverJobType | null>(null);
    const [currentStep, setCurrentStep] = useState<Step>("start-trip");
    const [currentDeliveryIndex, setCurrentDeliveryIndex] = useState(0);
    const [routeOrder, setRouteOrder] = useState<number[]>([]); // ลำดับการส่ง
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null); // สำหรับ drag and drop
    const [viewingJobDetail, setViewingJobDetail] = useState<DriverJobType | null>(null); // สำหรับดูรายละเอียดรอบส่ง

    // Form states for Step 1: Start Trip
    const [startOdometer, setStartOdometer] = useState("");
    const [startOdometerPhoto, setStartOdometerPhoto] = useState("");

    // Form states for Step 2: Pickup Oil
    const [pickupPhotos, setPickupPhotos] = useState<string[]>([]);
    const [pickupOdometer, setPickupOdometer] = useState("");
    const [pickupNotes, setPickupNotes] = useState("");

    // Form states for Step 3: Delivery
    const [deliveryPhotos, setDeliveryPhotos] = useState<string[]>([]);
    const [deliveryOdometer, setDeliveryOdometer] = useState("");
    const [deliveryNotes, setDeliveryNotes] = useState("");

    // Initialize mock data to context if empty
    useEffect(() => {
        if (driverJobs.length === 0 && mockDriverJobs.length > 0) {
            mockDriverJobs.forEach((job) => {
                createDriverJob({
                    ...job,
                    destinationBranches: job.destinationBranches.map((b) => ({
                        ...b,
                        oilType: b.oilType as DriverJobType["destinationBranches"][0]["oilType"],
                    })),
                    compartments: job.compartments.map((c) => ({
                        ...c,
                        oilType: c.oilType ? (c.oilType as DriverJobType["compartments"][0]["oilType"]) : undefined,
                    })),
                });
            });
        }
    }, [driverJobs.length, createDriverJob]);

    // Separate completed and active jobs - ใช้ข้อมูลจาก context หรือ mock data
    const allJobs = driverJobs.length > 0 ? driverJobs : mockDriverJobs;
    const completedJobs = useMemo(() => {
        return allJobs.filter((job) => job.status === "ส่งเสร็จ");
    }, [allJobs]);

    const activeJobs = useMemo(() => {
        return allJobs.filter((job) => job.status !== "ส่งเสร็จ");
    }, [allJobs]);

    const handleSelectJob = (job: DriverJobType) => {
        setSelectedJob(job);
        // Initialize route order if not set
        if (!job.routeOrder || job.routeOrder.length === 0) {
            const defaultOrder = job.destinationBranches.map((b) => b.branchId);
            setRouteOrder(defaultOrder);
        } else {
            setRouteOrder(job.routeOrder);
        }
        // Determine current step based on job status
        if (job.status === "รอเริ่ม") {
            setCurrentStep("start-trip");
        } else if (job.status === "ออกเดินทางแล้ว") {
            setCurrentStep("pickup-oil");
        } else if (job.status === "รับน้ำมันแล้ว") {
            setCurrentStep("route-planning");
        } else if (job.status === "จัดเรียงเส้นทางแล้ว") {
            setCurrentStep("delivery");
            // Find first branch that hasn't been delivered based on route order
            const orderedBranches = getOrderedBranches(job);
            const firstPendingIndex = orderedBranches.findIndex((b) => b.status !== "ส่งแล้ว");
            setCurrentDeliveryIndex(firstPendingIndex >= 0 ? firstPendingIndex : 0);
        } else if (job.status === "กำลังส่ง") {
            setCurrentStep("delivery");
            const orderedBranches = getOrderedBranches(job);
            const firstPendingIndex = orderedBranches.findIndex((b) => b.status !== "ส่งแล้ว");
            setCurrentDeliveryIndex(firstPendingIndex >= 0 ? firstPendingIndex : 0);
        }
        // Reset form states
        resetFormStates();
    };

    // Get branches in route order
    const getOrderedBranches = (job: DriverJobType) => {
        if (!job.routeOrder || job.routeOrder.length === 0) {
            return job.destinationBranches;
        }
        return job.routeOrder.map((branchId) => job.destinationBranches.find((b) => b.branchId === branchId)!).filter(Boolean);
    };

    const resetFormStates = () => {
        setStartOdometer("");
        setStartOdometerPhoto("");
        setPickupPhotos([]);
        setPickupOdometer("");
        setPickupNotes("");
        setDeliveryPhotos([]);
        setDeliveryOdometer("");
        setDeliveryNotes("");
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setPhotos: React.Dispatch<React.SetStateAction<string[]>>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotos((prev: string[]) => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleRemovePhoto = (index: number, photos: string[], setPhotos: (photos: string[]) => void) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    // Function to go back to previous step
    const handleGoBack = () => {
        if (!selectedJob) return;
        
        switch (currentStep) {
            case "pickup-oil": {
                // Go back to start-trip
                setCurrentStep("start-trip");
                // Reset job status if needed
                if (selectedJob.status === "ออกเดินทางแล้ว") {
                    const updatedJob = {
                        ...selectedJob,
                        status: "รอเริ่ม" as const,
                        startTrip: undefined,
                    };
                    setSelectedJob(updatedJob);
                }
                // Load existing data if available
                if (selectedJob.startTrip) {
                    setStartOdometer(selectedJob.startTrip.startOdometer.toString());
                    if (selectedJob.startTrip.startOdometerPhoto) {
                        setStartOdometerPhoto(selectedJob.startTrip.startOdometerPhoto);
                    }
                }
                break;
            }
            case "route-planning": {
                // Go back to pickup-oil
                setCurrentStep("pickup-oil");
                // Load existing data if available
                if (selectedJob.pickupConfirmation) {
                    setPickupPhotos(selectedJob.pickupConfirmation.photos);
                    setPickupOdometer(selectedJob.pickupConfirmation.odometerReading.toString());
                    if (selectedJob.pickupConfirmation.notes) {
                        setPickupNotes(selectedJob.pickupConfirmation.notes);
                    }
                }
                break;
            }
            case "delivery": {
                // Go back to route-planning
                setCurrentStep("route-planning");
                break;
            }
            case "completed": {
                // Go back to delivery
                setCurrentStep("delivery");
                // Find first undelivered branch
                const orderedBranches = getOrderedBranches(selectedJob);
                const firstPendingIndex = orderedBranches.findIndex((b) => b.status !== "ส่งแล้ว");
                setCurrentDeliveryIndex(firstPendingIndex >= 0 ? firstPendingIndex : 0);
                break;
            }
            default:
                break;
        }
    };

    // Step 1: Start Trip
    const handleStartTrip = () => {
        if (!selectedJob) return;
        if (!startOdometer) {
            alert("กรุณากรอกเลขไมล์เริ่มต้น");
            return;
        }

        const updatedJob = {
            ...selectedJob,
            status: "ออกเดินทางแล้ว" as const,
            startTrip: {
                startedAt: new Date().toISOString(),
                startOdometer: parseFloat(startOdometer),
                startOdometerPhoto: startOdometerPhoto || undefined,
            },
        };

        // อัปเดตใน context
        updateDriverJob(selectedJob.id, {
            ...updatedJob,
            destinationBranches: updatedJob.destinationBranches.map((b) => ({
                ...b,
                oilType: b.oilType as DriverJobType["destinationBranches"][0]["oilType"],
            })),
            compartments: updatedJob.compartments?.map((c) => ({
                ...c,
                oilType: c.oilType ? (c.oilType as DriverJobType["compartments"][0]["oilType"]) : undefined,
            })),
        });
        setSelectedJob(updatedJob);
        setCurrentStep("pickup-oil");
        resetFormStates();
    };

    // Step 2: Pickup Oil
    const handleConfirmPickup = () => {
        if (!selectedJob) return;
        if (pickupPhotos.length === 0) {
            alert("กรุณาถ่ายรูปหลักฐานการรับน้ำมันอย่างน้อย 1 รูป");
            return;
        }
        if (!pickupOdometer) {
            alert("กรุณากรอกเลขไมล์");
            return;
        }

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

        // อัปเดตใน context
        updateDriverJob(selectedJob.id, {
            ...updatedJob,
            destinationBranches: updatedJob.destinationBranches.map((b) => ({
                ...b,
                oilType: b.oilType as DriverJobType["destinationBranches"][0]["oilType"],
            })),
            compartments: updatedJob.compartments?.map((c) => ({
                ...c,
                oilType: c.oilType ? (c.oilType as DriverJobType["compartments"][0]["oilType"]) : undefined,
            })),
        });
        setSelectedJob(updatedJob);
        setCurrentStep("route-planning");
        resetFormStates();
    };

    // Step 3: Route Planning
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newOrder = [...routeOrder];
        const draggedItem = newOrder[draggedIndex];
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(index, 0, draggedItem);
        setRouteOrder(newOrder);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleRemoveBranch = (branchId: number) => {
        if (window.confirm("คุณต้องการลบปั๊มนี้ออกจากเส้นทางการส่งหรือไม่?")) {
            const newOrder = routeOrder.filter((id) => id !== branchId);
            setRouteOrder(newOrder);
        }
    };

    const handleConfirmRoutePlanning = () => {
        if (!selectedJob) return;
        const updatedJob = {
            ...selectedJob,
            status: "จัดเรียงเส้นทางแล้ว" as const,
            routeOrder: routeOrder,
        };
        // อัปเดตใน context
        updateDriverJob(selectedJob.id, {
            ...updatedJob,
            destinationBranches: updatedJob.destinationBranches.map((b) => ({
                ...b,
                oilType: b.oilType as DriverJobType["destinationBranches"][0]["oilType"],
            })),
            compartments: updatedJob.compartments?.map((c) => ({
                ...c,
                oilType: c.oilType ? (c.oilType as DriverJobType["compartments"][0]["oilType"]) : undefined,
            })),
        });
        setSelectedJob(updatedJob);
        setCurrentStep("delivery");
        setCurrentDeliveryIndex(0);
    };

    // Step 4: Delivery
    const handleConfirmDelivery = () => {
        if (!selectedJob) return;
        if (deliveryPhotos.length === 0) {
            alert("กรุณาถ่ายรูปหลักฐานการส่งน้ำมันอย่างน้อย 1 รูป");
            return;
        }
        if (!deliveryOdometer) {
            alert("กรุณากรอกเลขไมล์");
            return;
        }

        const orderedBranches = getOrderedBranches(selectedJob);
        const currentBranch = orderedBranches[currentDeliveryIndex];
        
        // Update the branch in the original array
        const updatedBranches = selectedJob.destinationBranches.map((b) =>
            b.branchId === currentBranch.branchId
                ? {
                      ...b,
                      status: "ส่งแล้ว" as const,
                      deliveryConfirmation: {
                          confirmedAt: new Date().toISOString(),
                          photos: deliveryPhotos,
                          odometerReading: parseFloat(deliveryOdometer),
                          notes: deliveryNotes || undefined,
                      },
                  }
                : b
        );

        // Check if all branches are delivered
        const allDelivered = updatedBranches.every((b) => b.status === "ส่งแล้ว");
        const newStatus = allDelivered ? ("ส่งเสร็จ" as const) : ("กำลังส่ง" as const);

        const updatedJob = {
            ...selectedJob,
            destinationBranches: updatedBranches,
            status: newStatus,
        };

        // อัปเดตใน context
        updateDriverJob(selectedJob.id, {
            ...updatedJob,
            destinationBranches: updatedJob.destinationBranches.map((b) => ({
                ...b,
                oilType: b.oilType as DriverJobType["destinationBranches"][0]["oilType"],
            })),
            compartments: updatedJob.compartments?.map((c) => ({
                ...c,
                oilType: c.oilType ? (c.oilType as DriverJobType["compartments"][0]["oilType"]) : undefined,
            })),
        });
        setSelectedJob(updatedJob);

        if (allDelivered) {
            setCurrentStep("completed");
        } else {
            // Move to next branch based on route order
            const orderedBranches = getOrderedBranches(updatedJob);
            const nextIndex = orderedBranches.findIndex((b) => b.status !== "ส่งแล้ว");
            if (nextIndex >= 0) {
                setCurrentDeliveryIndex(nextIndex);
                resetFormStates();
            }
        }
    };

    const getSteps = () => {
        if (!selectedJob) return [];
        const steps = [
            { id: "start-trip", label: "ออกเดินทาง", completed: selectedJob.status !== "รอเริ่ม" },
            { id: "pickup-oil", label: "รับน้ำมัน", completed: selectedJob.status !== "รอเริ่ม" && selectedJob.status !== "ออกเดินทางแล้ว" },
            { id: "route-planning", label: "จัดเรียงเส้นทาง", completed: selectedJob.status !== "รอเริ่ม" && selectedJob.status !== "ออกเดินทางแล้ว" && selectedJob.status !== "รับน้ำมันแล้ว" },
            { id: "delivery", label: "ส่งน้ำมัน", completed: false },
            { id: "completed", label: "เสร็จสิ้น", completed: selectedJob.status === "ส่งเสร็จ" },
        ];
        return steps;
    };

    const getCurrentStepIndex = () => {
        const steps = getSteps();
        return steps.findIndex((s) => s.id === currentStep);
    };

    // Job Detail View
    if (viewingJobDetail) {
        const job = viewingJobDetail;
        const deliveredBranches = job.destinationBranches.filter((b) => b.status === "ส่งแล้ว");
        const undeliveredBranches = job.destinationBranches.filter((b) => b.status !== "ส่งแล้ว");

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <Truck className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                                รายละเอียดรอบส่ง
                            </h1>
                            <button
                                onClick={() => setViewingJobDetail(null)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                กลับ
                            </button>
                        </div>

                        {/* Job Info */}
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">{job.transportNo}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">วันที่</p>
                                    <p className="font-semibold text-gray-800 dark:text-white">
                                        {new Date(job.transportDate).toLocaleDateString("th-TH", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}{" "}
                                        เวลา {job.transportTime}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">รถ</p>
                                    <p className="font-semibold text-gray-800 dark:text-white">
                                        {job.truckPlateNumber} / {job.trailerPlateNumber}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">ต้นทาง</p>
                                    <p className="font-semibold text-gray-800 dark:text-white">{job.sourceBranchName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">ปลายทาง</p>
                                    <p className="font-semibold text-gray-800 dark:text-white">
                                        {job.destinationBranches.length} สาขา
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Delivered Branches */}
                        {deliveredBranches.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    ปั๊มที่ส่งแล้ว ({deliveredBranches.length} ปั๊ม)
                                </h3>
                                <div className="space-y-3">
                                    {deliveredBranches.map((branch) => (
                                        <div
                                            key={branch.branchId}
                                            className="p-4 border-2 border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/10"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    <span className="font-semibold text-gray-800 dark:text-white">
                                                        {branch.branchName}
                                                    </span>
                                                </div>
                                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                                                    ✓ ส่งแล้ว
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{branch.address}</p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Droplet className="h-4 w-4 text-blue-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">{branch.oilType}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-4 w-4 text-green-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {numberFormatter.format(branch.quantity)} ลิตร
                                                    </span>
                                                </div>
                                            </div>
                                            {branch.deliveryConfirmation && (
                                                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        ส่งเมื่อ:{" "}
                                                        {new Date(branch.deliveryConfirmation.confirmedAt).toLocaleString("th-TH")}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        เลขไมล์: {numberFormatter.format(branch.deliveryConfirmation.odometerReading)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Undelivered Branches */}
                        {undeliveredBranches.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                                    ปั๊มที่ยังไม่ส่ง ({undeliveredBranches.length} ปั๊ม)
                                </h3>
                                <div className="space-y-3">
                                    {undeliveredBranches.map((branch) => (
                                        <div
                                            key={branch.branchId}
                                            className="p-4 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/10"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                                    <span className="font-semibold text-gray-800 dark:text-white">
                                                        {branch.branchName}
                                                    </span>
                                                </div>
                                                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">
                                                    ยังไม่ส่ง
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{branch.address}</p>
                                            <div className="flex items-center gap-4 text-sm mb-3">
                                                <div className="flex items-center gap-1">
                                                    <Droplet className="h-4 w-4 text-blue-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">{branch.oilType}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-4 w-4 text-green-500" />
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {numberFormatter.format(branch.quantity)} ลิตร
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setViewingJobDetail(null);
                                                    handleSelectJob(job);
                                                }}
                                                className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
                                            >
                                                กลับไปส่งปั๊มนี้
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!selectedJob) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                            <Truck className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                            เลือกงาน
                        </h1>

                        {/* Active Jobs */}
                        {activeJobs.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                    งานที่ยังไม่เสร็จ ({activeJobs.length})
                                </h2>
                                <div className="space-y-4">
                                    {activeJobs.map((job) => {
                                        // Calculate delivered and undelivered branches
                                        const deliveredBranches = job.destinationBranches.filter((b) => b.status === "ส่งแล้ว");
                                        const undeliveredBranches = job.destinationBranches.filter((b) => b.status !== "ส่งแล้ว");
                                        const hasUndelivered = undeliveredBranches.length > 0;

                                        return (
                                    <motion.div
                                        key={job.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => handleSelectJob(job as DriverJobType)}
                                        className="p-5 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors bg-white dark:bg-gray-800"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                                    {job.transportNo}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                    {new Date(job.transportDate).toLocaleDateString("th-TH", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}{" "}
                                                    เวลา {job.transportTime}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {job.sourceBranchName}
                                                        </span>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-gray-400" />
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {job.destinationBranches.length} สาขา
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                                        </div>

                                        {/* Status Summary */}
                                        <div className="flex items-center gap-4 text-xs mb-3">
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    ส่งแล้ว: {deliveredBranches.length}
                                                </span>
                                            </div>
                                            {hasUndelivered && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                    <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                                                        ยังไม่ส่ง: {undeliveredBranches.length}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Undelivered Branches List */}
                                        {hasUndelivered && (
                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                                                        ⚠️ ปั๊มที่ยังไม่ส่ง:
                                                    </p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setViewingJobDetail(job as DriverJobType);
                                                        }}
                                                        className="text-xs px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
                                                    >
                                                        ดูรายละเอียด
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {undeliveredBranches.map((branch) => (
                                                        <span
                                                            key={branch.branchId}
                                                            className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium"
                                                        >
                                                            {branch.branchName}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                    )}

                    {/* Completed Jobs */}
                    {completedJobs.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                งานที่เสร็จแล้ว ({completedJobs.length})
                            </h2>
                            <div className="space-y-4">
                                {completedJobs.map((job) => {
                                    const deliveredBranches = job.destinationBranches.filter((b) => b.status === "ส่งแล้ว");
                                    const undeliveredBranches = job.destinationBranches.filter((b) => b.status !== "ส่งแล้ว");
                                    const hasUndelivered = undeliveredBranches.length > 0;

                                    return (
                                        <motion.div
                                            key={job.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => setViewingJobDetail(job as DriverJobType)}
                                            className="p-5 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-400 cursor-pointer transition-colors bg-white dark:bg-gray-800"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                                            {job.transportNo}
                                                        </h3>
                                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                                                            เสร็จแล้ว
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                        {new Date(job.transportDate).toLocaleDateString("th-TH", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}{" "}
                                                        เวลา {job.transportTime}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-gray-400" />
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {job.sourceBranchName}
                                                            </span>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-gray-400" />
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {job.destinationBranches.length} สาขา
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
                                            </div>

                                            {/* Status Summary */}
                                            <div className="flex items-center gap-4 text-xs mb-3">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        ส่งแล้ว: {deliveredBranches.length}
                                                    </span>
                                                </div>
                                                {hasUndelivered && (
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                        <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                                                            ยังไม่ส่ง: {undeliveredBranches.length}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Undelivered Branches List */}
                                            {hasUndelivered && (
                                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                    <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                                                        ⚠️ ปั๊มที่ยังไม่ส่ง:
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {undeliveredBranches.map((branch) => (
                                                            <span
                                                                key={branch.branchId}
                                                                className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium"
                                                            >
                                                                {branch.branchName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        );
    }

    const steps = getSteps();
    const currentStepIndex = getCurrentStepIndex();
    const orderedBranches = selectedJob ? getOrderedBranches(selectedJob) : [];

    const completedDeliveredBranches = selectedJob ? selectedJob.destinationBranches.filter((b) => b.status === "ส่งแล้ว") : [];
    const completedUndeliveredBranches = selectedJob ? selectedJob.destinationBranches.filter((b) => b.status !== "ส่งแล้ว") : [];
    const completedHasUndelivered = completedUndeliveredBranches.length > 0;

    const currentBranch = currentStep === "delivery" && orderedBranches.length > 0 ? orderedBranches[currentDeliveryIndex] : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                                {selectedJob.transportNo}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedJob.truckPlateNumber} / {selectedJob.trailerPlateNumber}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedJob(null);
                                resetFormStates();
                            }}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            เปลี่ยนงาน
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                                            step.completed
                                                ? "bg-green-500 text-white"
                                                : index === currentStepIndex
                                                ? "bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-800"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                        }`}
                                    >
                                        {step.completed ? (
                                            <CheckCircle className="h-6 w-6" />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    <p
                                        className={`text-xs mt-2 text-center font-medium ${
                                            index === currentStepIndex
                                                ? "text-blue-600 dark:text-blue-400"
                                                : step.completed
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-gray-500 dark:text-gray-400"
                                        }`}
                                    >
                                        {step.label}
                                    </p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 ${
                                            step.completed ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    {/* Step 1: Start Trip */}
                    {currentStep === "start-trip" && (
                        <motion.div
                            key="start-trip"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                                    ขั้นตอนที่ 1: ออกเดินทาง
                                </h2>

                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-center gap-3 mb-3">
                                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <p className="font-semibold text-blue-800 dark:text-blue-300">
                                                ต้นทาง: {selectedJob.sourceBranchName}
                                            </p>
                                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                                {selectedJob.sourceAddress}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <div>
                                            <p className="font-semibold text-green-800 dark:text-green-300">
                                                ปลายทาง: {selectedJob.destinationBranches.length} สาขา
                                            </p>
                                            <p className="text-sm text-green-700 dark:text-green-400">
                                                {selectedJob.destinationBranches.map((b) => b.branchName).join(", ")}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        📏 เลขไมล์เริ่มต้น *
                                    </label>
                                    <input
                                        type="number"
                                        value={startOdometer}
                                        onChange={(e) => setStartOdometer(e.target.value)}
                                        placeholder="กรอกเลขไมล์"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        📷 ถ่ายรูปไมล์เริ่มต้น (ถ้ามี)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {startOdometerPhoto ? (
                                            <div className="relative group">
                                                <img
                                                    src={startOdometerPhoto}
                                                    alt="ไมล์เริ่มต้น"
                                                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                                />
                                                <button
                                                    onClick={() => setStartOdometerPhoto("")}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer">
                                                <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                                                    <Camera className="h-8 w-8 text-gray-400" />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">เพิ่มรูป</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setStartOdometerPhoto(reader.result as string);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleStartTrip}
                                        className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Play className="h-6 w-6" />
                                        ออกเดินทาง
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Pickup Oil */}
                    {currentStep === "pickup-oil" && (
                        <motion.div
                            key="pickup-oil"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <button
                                        onClick={handleGoBack}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                                    >
                                        <ChevronRight className="h-5 w-5 rotate-180" />
                                        กลับ
                                    </button>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                        ขั้นตอนที่ 2: รับน้ำมัน
                                    </h2>
                                    <div className="w-24"></div>
                                </div>

                                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                                                ⚠️ ระวัง! 1 หลุม ใส่ได้ 1 ชนิดน้ำมันเท่านั้น
                                            </p>
                                            <p className="text-xs text-yellow-700 dark:text-yellow-400">
                                                กรุณาตรวจสอบให้แน่ใจว่าลงน้ำมันถูกช่องตามแผน
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Loading Plan */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        แผนการลงน้ำมัน:
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedJob.compartments.map((compartment) => (
                                            <div
                                                key={compartment.chamber}
                                                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                        <span className="font-bold text-blue-600 dark:text-blue-400">
                                                            {compartment.chamber}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                                            {compartment.oilType}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {compartment.quantity ? numberFormatter.format(compartment.quantity) : "-"} ลิตร → {compartment.destinationBranchName || "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        📷 ถ่ายรูปหลักฐานการรับน้ำมัน * (อย่างน้อย 1 รูป)
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                        {pickupPhotos.map((photo, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={photo}
                                                    alt={`หลักฐาน ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                                />
                                                <button
                                                    onClick={() => handleRemovePhoto(index, pickupPhotos, setPickupPhotos)}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {pickupPhotos.length < 6 && (
                                            <label className="cursor-pointer">
                                                <div className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                                                    <Camera className="h-8 w-8 text-gray-400" />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">เพิ่มรูป</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={(e) => handlePhotoUpload(e, setPickupPhotos)}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        📏 เลขไมล์หลังรับน้ำมัน *
                                    </label>
                                    <input
                                        type="number"
                                        value={pickupOdometer}
                                        onChange={(e) => setPickupOdometer(e.target.value)}
                                        placeholder="กรอกเลขไมล์"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        📝 หมายเหตุ (ถ้ามี)
                                    </label>
                                    <textarea
                                        value={pickupNotes}
                                        onChange={(e) => setPickupNotes(e.target.value)}
                                        placeholder="กรอกหมายเหตุเพิ่มเติม..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <button
                                    onClick={handleConfirmPickup}
                                    className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="h-6 w-6" />
                                    ยืนยันการรับน้ำมัน
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Route Planning */}
                    {currentStep === "route-planning" && (
                        <motion.div
                            key="route-planning"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <button
                                        onClick={handleGoBack}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                                    >
                                        <ChevronRight className="h-5 w-5 rotate-180" />
                                        กลับ
                                    </button>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                        ขั้นตอนที่ 3: จัดเรียงเส้นทางการส่งน้ำมัน
                                    </h2>
                                    <div className="w-24"></div>
                                </div>

                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Route className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                                จัดเรียงลำดับการส่งปั๊ม
                                            </p>
                                            <p className="text-xs text-blue-700 dark:text-blue-400">
                                                ลากสลับลำดับได้โดยกดค้างที่ไอคอน <GripVertical className="inline h-3 w-3" /> และลากไปตำแหน่งที่ต้องการ หรือกดปุ่มลบเพื่อยกเลิกการส่งปั๊มนั้น
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {routeOrder.length === 0 ? (
                                    <div className="mb-6 p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600 dark:text-gray-400 font-semibold">
                                            ไม่มีปั๊มที่ต้องส่ง
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                            กรุณาเพิ่มปั๊มที่ต้องการส่ง
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 mb-6">
                                        {routeOrder.map((branchId, index) => {
                                            const branch = selectedJob.destinationBranches.find((b) => b.branchId === branchId);
                                            if (!branch) return null;

                                            return (
                                                <div
                                                    key={branchId}
                                                    draggable
                                                    onDragStart={() => handleDragStart(index)}
                                                    onDragOver={(e) => handleDragOver(e, index)}
                                                    onDragEnd={handleDragEnd}
                                                    className={`p-4 border-2 rounded-lg transition-all cursor-move ${
                                                        draggedIndex === index
                                                            ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 opacity-50"
                                                            : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-blue-500 dark:hover:border-blue-400"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
                                                            <GripVertical className="h-6 w-6 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                                    {index + 1}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                                <p className="font-semibold text-gray-800 dark:text-white">
                                                                    {branch.branchName}
                                                                </p>
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {branch.address}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <div className="flex items-center gap-1">
                                                                    <Droplet className="h-3 w-3 text-blue-500" />
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {branch.oilType}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Package className="h-3 w-3 text-green-500" />
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {numberFormatter.format(branch.quantity)} ลิตร
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveBranch(branchId)}
                                                            className="flex-shrink-0 p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                            title="ลบปั๊มนี้ออกจากเส้นทาง"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Navigation className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                                            เส้นทางการส่ง: {routeOrder.map((branchId) => {
                                                const branch = selectedJob.destinationBranches.find((b) => b.branchId === branchId);
                                                return branch?.branchName;
                                            }).join(" → ")}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmRoutePlanning}
                                    disabled={routeOrder.length === 0}
                                    className={`w-full px-6 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
                                        routeOrder.length === 0
                                            ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                            : "bg-purple-600 hover:bg-purple-700 text-white"
                                    }`}
                                >
                                    <CheckCircle className="h-6 w-6" />
                                    ยืนยันเส้นทางและเริ่มส่ง
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Delivery */}
                    {currentStep === "delivery" && currentBranch && (
                        <motion.div
                            key={`delivery-${currentDeliveryIndex}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <button
                                        onClick={handleGoBack}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                                    >
                                        <ChevronRight className="h-5 w-5 rotate-180" />
                                        กลับ
                                    </button>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                        ขั้นตอนที่ 4: ส่งน้ำมัน
                                    </h2>
                                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold">
                                        ปั๊มที่ {currentDeliveryIndex + 1} / {orderedBranches.length}
                                    </span>
                                </div>

                                {/* Progress */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">ความคืบหน้า</span>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                            {orderedBranches.filter((b) => b.status === "ส่งแล้ว").length} / {orderedBranches.length}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${(orderedBranches.filter((b) => b.status === "ส่งแล้ว").length / orderedBranches.length) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Branch Info */}
                                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        <div>
                                            <p className="font-semibold text-green-800 dark:text-green-300 text-lg">
                                                {currentBranch.branchName}
                                            </p>
                                            <p className="text-sm text-green-700 dark:text-green-400">
                                                {currentBranch.address}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Droplet className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {currentBranch.oilType} - {numberFormatter.format(currentBranch.quantity)} ลิตร
                                        </span>
                                    </div>
                                </div>

                                {/* Delivery Form */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        📷 ถ่ายรูปหลักฐานการส่งน้ำมัน * (อย่างน้อย 1 รูป)
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                        {deliveryPhotos.map((photo, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={photo}
                                                    alt={`หลักฐาน ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                                                />
                                                <button
                                                    onClick={() => handleRemovePhoto(index, deliveryPhotos, setDeliveryPhotos)}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {deliveryPhotos.length < 6 && (
                                            <label className="cursor-pointer">
                                                <div className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-green-500 dark:hover:border-green-400 transition-colors">
                                                    <Camera className="h-8 w-8 text-gray-400" />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">เพิ่มรูป</span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={(e) => handlePhotoUpload(e, setDeliveryPhotos)}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        📏 เลขไมล์หลังส่ง *
                                    </label>
                                    <input
                                        type="number"
                                        value={deliveryOdometer}
                                        onChange={(e) => setDeliveryOdometer(e.target.value)}
                                        placeholder="กรอกเลขไมล์"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        📝 หมายเหตุ (ถ้ามี)
                                    </label>
                                    <textarea
                                        value={deliveryNotes}
                                        onChange={(e) => setDeliveryNotes(e.target.value)}
                                        placeholder="กรอกหมายเหตุเพิ่มเติม..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <button
                                    onClick={handleConfirmDelivery}
                                    className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="h-6 w-6" />
                                    {currentDeliveryIndex === orderedBranches.length - 1
                                        ? "ส่งเสร็จสิ้น"
                                        : "ยืนยันการส่งและไปปั๊มถัดไป"}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 5: Completed */}
                    {currentStep === "completed" && (
                        <motion.div
                            key="completed"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-start mb-6">
                                    <button
                                        onClick={handleGoBack}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                                    >
                                        <ChevronRight className="h-5 w-5 rotate-180" />
                                        กลับ
                                    </button>
                                </div>
                                {/* Get delivered and undelivered branches */}
                                <div className="text-center mb-6">
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                        {completedHasUndelivered ? "✅ ส่งน้ำมันเสร็จแล้ว" : "🎉 เสร็จสิ้นภาระกิจ!"}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {completedHasUndelivered
                                            ? `ส่งน้ำมันไป ${completedDeliveredBranches.length} ปั๊มเรียบร้อยแล้ว`
                                            : "ส่งน้ำมันครบทุกปั๊มเรียบร้อยแล้ว"}
                                    </p>
                                </div>

                                {/* Delivered Branches */}
                                {completedDeliveredBranches.length > 0 && (
                                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                                        <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3">
                                            ✓ ปั๊มที่ส่งแล้ว ({completedDeliveredBranches.length} ปั๊ม):
                                        </p>
                                        <div className="space-y-2">
                                            {completedDeliveredBranches.map((branch, index) => (
                                                <div
                                                    key={branch.branchId}
                                                    className="flex items-center justify-between text-sm"
                                                >
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {index + 1}. {branch.branchName}
                                                    </span>
                                                    <span className="text-green-600 dark:text-green-400 font-semibold">
                                                        ✓ ส่งแล้ว
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Undelivered Branches */}
                                {completedHasUndelivered && (
                                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <div className="flex items-start gap-3 mb-3">
                                            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                                                    ⚠️ ปั๊มที่ยังไม่ส่ง ({completedUndeliveredBranches.length} ปั๊ม):
                                                </p>
                                                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                                                    ปั๊มเหล่านี้ถูกลบออกจากเส้นทางหรือยังไม่ได้ส่ง
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {completedUndeliveredBranches.map((branch) => (
                                                <div
                                                    key={branch.branchId}
                                                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-800"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                                            <span className="font-semibold text-gray-800 dark:text-white">
                                                                {branch.branchName}
                                                            </span>
                                                        </div>
                                                        <span className="text-yellow-600 dark:text-yellow-400 font-semibold text-xs">
                                                            ยังไม่ส่ง
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                        {branch.address}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <div className="flex items-center gap-1">
                                                            <Droplet className="h-3 w-3 text-blue-500" />
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {branch.oilType}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Package className="h-3 w-3 text-green-500" />
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                {numberFormatter.format(branch.quantity)} ลิตร
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    {completedHasUndelivered && (
                                        <button
                                            onClick={() => {
                                                // Add undelivered branches back to route order
                                                const undeliveredIds = completedUndeliveredBranches.map((b) => b.branchId);
                                                const newRouteOrder = [...routeOrder, ...undeliveredIds];
                                                setRouteOrder(newRouteOrder);
                                                const updatedJob = {
                                                    ...selectedJob,
                                                    routeOrder: newRouteOrder,
                                                    status: "กำลังส่ง" as const,
                                                };
                                                setSelectedJob(updatedJob);
                                                setCurrentStep("delivery");
                                                setCurrentDeliveryIndex(routeOrder.length);
                                                resetFormStates();
                                            }}
                                            className="flex-1 px-6 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Route className="h-6 w-6" />
                                            กลับไปส่งปั๊มที่เหลือ
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            // Mark job as completed
                                            const updatedJob = {
                                                ...selectedJob,
                                                status: "ส่งเสร็จ" as const,
                                            };
                                            setSelectedJob(updatedJob);
                                            // Go back to job list
                                            setSelectedJob(null);
                                            resetFormStates();
                                        }}
                                        className={`px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors ${
                                            completedHasUndelivered ? "flex-1" : "w-full"
                                        }`}
                                    >
                                        {completedHasUndelivered ? "เสร็จสิ้นเลย" : "กลับไปเลือกงานใหม่"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
