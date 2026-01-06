import { useMemo } from "react";
import { 
    Clock, 
    Users,
    Fuel,
    Truck,
    MapPin,
    Droplet,
    Download,
    Check,
    CheckCircle
} from "lucide-react";
import DriverBottomNav from "@/components/DriverBottomNav";
import { useGasStation } from "@/contexts/GasStationContext";

// Helper to render icon based on icon name
const StepIcon = ({ name, className }: { name: string, className?: string }) => {
    switch (name) {
        case "truck": return <Truck className={className} />;
        case "map-pin": return <MapPin className={className} />;
        case "droplet": return <Droplet className={className} />;
        case "download": return <Download className={className} />;
        case "check": return <Check className={className} />;
        case "check-circle": return <CheckCircle className={className} />;
        case "fuel": return <Fuel className={className} />;
        default: return <Check className={className} />;
    }
};

export default function DriverDashboard() {
    const { allDriverJobs } = useGasStation();

    // Get the active or latest job
    const currentJob = useMemo(() => {
        if (!allDriverJobs.length) return null;
        // Prioritize active jobs
        const sortedJobs = [...allDriverJobs].sort((a, b) => {
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            return timeB - timeA;
        });
        const activeJob = sortedJobs.find(job => 
            ["ออกเดินทางแล้ว", "รับน้ำมันแล้ว", "จัดเรียงเส้นทางแล้ว", "กำลังส่ง", "ส่งเสร็จ"].includes(job.status)
        );
        return activeJob || sortedJobs[0];
    }, [allDriverJobs]);

    const timelineItems = useMemo(() => {
        if (!currentJob) return [];

        const items: any[] = [];

        // Helper to format date
        const formatTime = (isoString?: string) => 
            isoString ? new Date(isoString).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' }) + " น." : "ยังไม่ถึง";

        // --- Define Base Steps ---

        // 1. ได้รับงาน (Job Received)
        items.push({
            id: "step-1-received",
            title: "ได้รับงาน",
            timestamp: currentJob.createdAt ? formatTime(currentJob.createdAt) : "08:00 น.",
            dateTime: currentJob.createdAt,
            status: "completed",
            isStart: true,
            icon: "check"
        });

        // 2. ออกจากปั๊มต้นทาง (Left Source) - Start Trip
        const isStarted = !!currentJob.startTrip;
        items.push({
            id: isStarted ? "step-2-start" : "step-2-start-pending",
            title: `ออกจากปั๊มต้นทาง (${currentJob.sourceBranchName})`,
            timestamp: isStarted ? formatTime(currentJob.startTrip?.startedAt) : "ยังไม่เริ่ม",
            dateTime: currentJob.startTrip?.startedAt,
            status: isStarted ? "completed" : "active",
            icon: "truck"
        });

        // 3. ถึงคลังน้ำมัน (Arrive Depot)
        const isArrivedDepot = !!currentJob.warehouseConfirmation;
        items.push({
            id: isArrivedDepot ? "step-3-warehouse" : "step-3-warehouse-pending",
            title: `ถึงคลังน้ำมัน`, 
            timestamp: isArrivedDepot ? formatTime(currentJob.warehouseConfirmation?.confirmedAt) : "รอดำเนินการ",
            dateTime: currentJob.warehouseConfirmation?.confirmedAt,
            status: isArrivedDepot ? "completed" : (isStarted ? "active" : "pending"),
            icon: "map-pin"
        });

        // 4. รับน้ำมัน (Pickup Oil)
        const isPickedUp = !!currentJob.pickupConfirmation;
        items.push({
            id: isPickedUp ? "step-4-pickup" : "step-4-pickup-pending",
            title: "รับน้ำมัน",
            timestamp: isPickedUp ? formatTime(currentJob.pickupConfirmation?.confirmedAt) : "รอดำเนินการ",
            dateTime: currentJob.pickupConfirmation?.confirmedAt,
            status: isPickedUp ? "completed" : (isArrivedDepot ? "active" : "pending"),
            icon: "droplet"
        });

        // 5... Destinations (Ordered)
        const branches = [...currentJob.destinationBranches];
        if (currentJob.routeOrder && currentJob.routeOrder.length > 0) {
            branches.sort((a, b) => {
                const indexA = currentJob.routeOrder!.indexOf(a.branchId);
                const indexB = currentJob.routeOrder!.indexOf(b.branchId);
                return indexA - indexB;
            });
        }

        let firstNextPendingAdded = false;

        branches.forEach((branch) => {
            const isArrivedBranch = !!branch.arrivalConfirmation;
            const isDelivered = branch.status === "ส่งแล้ว";

            // Add Arrival Step
            let arrivalStatus = "pending";
            let arrivalDateTime = branch.arrivalConfirmation?.confirmedAt;
            
            if (isArrivedBranch || isDelivered) {
                arrivalStatus = "completed";
                // Fallback to delivery time if arrival time is missing
                if (!arrivalDateTime && isDelivered) {
                    arrivalDateTime = branch.deliveryConfirmation?.confirmedAt;
                }
            } else if (isPickedUp && !firstNextPendingAdded) {
                arrivalStatus = "active";
                firstNextPendingAdded = true;
            }

            items.push({
                id: `step-branch-${branch.branchId}-arrive`,
                title: `ถึงปั๊ม (${branch.branchName})`,
                timestamp: arrivalStatus === "completed" ? formatTime(arrivalDateTime) : (arrivalStatus === "active" ? "กำลังเดินทาง" : "รอดำเนินการ"),
                dateTime: arrivalDateTime,
                status: arrivalStatus,
                icon: "map-pin",
                sequence: items.length // For stable sorting
            });

            // Add Unload Step
            let unloadStatus = "pending";
            if (isDelivered) {
                unloadStatus = "completed";
            } else if ((isArrivedBranch || arrivalStatus === "completed") && !firstNextPendingAdded) {
                unloadStatus = "active";
                firstNextPendingAdded = true;
            }

            items.push({
                id: `step-branch-${branch.branchId}-unload`,
                title: `เอาน้ำมันลงหลุม (${branch.branchName})`,
                timestamp: isDelivered ? formatTime(branch.deliveryConfirmation?.confirmedAt) : "รอดำเนินการ",
                dateTime: branch.deliveryConfirmation?.confirmedAt,
                status: unloadStatus,
                icon: "download",
                sequence: items.length
            });
        });

        // 6. Record Odometer / เสร็จสิ้น
        const isFinished = currentJob.status === "ส่งเสร็จ" && (!!currentJob.depotArrival || !!currentJob.endOdometer);
        const allDelivered = currentJob.destinationBranches.every(b => b.status === "ส่งแล้ว");

        items.push({
            id: isFinished ? "step-end-process" : "step-end-process-pending",
            title: isFinished ? "บันทึกเลขไมล์ (เสร็จสิ้น)" : "บันทึกเลขไมล์ (กลับถึงปั๊มหลัก)",
            timestamp: isFinished ? formatTime(currentJob.depotArrival?.arrivedAt) : "รอดำเนินการ",
            dateTime: currentJob.depotArrival?.arrivedAt,
            status: isFinished ? "completed" : (allDelivered ? "active" : "pending"),
            isEnd: true,
            icon: "check-circle",
            sequence: items.length
        });

        // 7. Inject Actual Fueling Records
        if (currentJob.fuelingRecords) {
            currentJob.fuelingRecords.forEach((record, idx) => {
                items.push({
                    id: `fuel-record-${idx}`,
                    title: `บันทึกเติมน้ำมัน (${record.stationName})`,
                    subtitle: `${record.quantity} ลิตร - ${record.amount} บาท`,
                    timestamp: formatTime(record.recordedAt),
                    dateTime: record.recordedAt,
                    status: "completed",
                    type: "fuel", 
                    icon: "fuel",
                    sequence: -1 // Fueling records are interjected by time
                });
            });
        }

        // --- Final Sort & Filter ---
        // 1. Separate items with dateTime (happened) and without (pending)
        // 2. Sort happened items by dateTime, then by sequence if dateTime is same
        // 3. Keep pending items in their original sequence
        
        const completedItems = items.filter(i => i.dateTime && i.status === "completed");
        const pendingAndActive = items.filter(i => !i.dateTime || i.status !== "completed");

        completedItems.sort((a, b) => {
            const timeA = new Date(a.dateTime).getTime();
            const timeB = new Date(b.dateTime).getTime();
            if (timeA !== timeB) return timeA - timeB;
            return a.sequence - b.sequence;
        });

        return [...completedItems, ...pendingAndActive];

    }, [currentJob]);

    if (!currentJob) {
       return (
         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <p className="text-gray-500">ไม่พบงานที่กำลังดำเนินการ</p>
            <DriverBottomNav />
         </div>
       );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-24">
            {/* Header */}


            <div className="p-5 space-y-6">
                {/* Page Title */}
                <div>
                     <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                             <Clock className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            แดชบอร์ดติดตามคนขับ
                        </h1>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-[52px]">
                        สถานะการขนส่งแบบเรียลไทม์
                    </p>
                </div>

                {/* Job Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-6">
                         <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                                {currentJob.transportNo}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                <span className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <Users className="w-2.5 h-2.5 text-gray-500 font-bold" />
                                </span>
                                {currentJob.driverName || "สมศักดิ์ ขับรถ"} ({currentJob.truckPlateNumber})
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                 currentJob.status === "ส่งเสร็จ" ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                             }`}>
                                {currentJob.status}
                            </span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="relative pl-2 space-y-8">
                        {timelineItems.map((item, index) => {
                            const isLast = index === timelineItems.length - 1;
                            
                            return (
                                <div key={item.id} className="relative flex gap-4">
                                    {/* Line */}
                                    {!isLast && (
                                        <div className={`absolute left-[11px] top-8 bottom-[-32px] w-0.5 ${
                                             "border-l-2 border-dashed border-gray-200 dark:border-gray-700"
                                        }`} />
                                    )}

                                    {/* Icon/Dot */}
                                    <div className="relative z-10 shrink-0">
                                        {item.type === "fuel" ? (
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                                                item.status === "completed" ? "bg-orange-500" : "bg-orange-100 dark:bg-orange-900/30"
                                            }`}>
                                                <Fuel className={`w-3.5 h-3.5 ${
                                                    item.status === "completed" ? "text-white" : "text-orange-500"
                                                }`} />
                                            </div>
                                        ) : item.status === "completed" ? (
                                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            </div>
                                        ) : item.status === "active" ? (
                                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-sm">
                                                 <div className="w-3 h-3 bg-blue-500 rounded-sm animate-pulse" /> 
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                <StepIcon name={item.icon} className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className={`${item.status === "active" ? "pt-0 -mt-1" : "pt-0.5"}`}>
                                        <h4 className={`font-bold text-base ${
                                            item.status === "active" ? "text-blue-600 dark:text-blue-400" :
                                            item.status === "completed" ? "text-gray-900 dark:text-white" :
                                            "text-gray-400 dark:text-gray-500"
                                        }`}>
                                            {item.title}
                                        </h4>
                                        {item.subtitle && (
                                            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">{item.subtitle}</p>
                                        )}
                                        <p className={`text-sm ${
                                            item.status === "active" ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                                        }`}>
                                            {item.timestamp}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <DriverBottomNav />
        </div>
    );
}
