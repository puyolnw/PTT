import { useState, useMemo } from "react";
import { 
  Navigation,
  Search,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Fuel,
  ChevronRight,
  X,
  User,
  Phone,
  Droplet,
  Download,
  Check,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGasStation } from "@/contexts/GasStationContext";
import { DriverJob } from "@/types/gasStation";

// --- Helper Components from DriverDashboard ---
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

const JobTimeline = ({ job }: { job: DriverJob }) => {
    const timelineItems = useMemo(() => {
        if (!job) return [];
        interface TimelineItem {
            id: string;
            title: string;
            timestamp: string;
            dateTime?: string;
            status: string;
            icon: string;
            sequence?: number;
        }
        const items: TimelineItem[] = [];
        
        const isJobFinished = job.status === "ส่งเสร็จ";
        
        const formatTime = (isoString?: string, fallbackText: string = "ยังไม่ถึง") => {
            if (isoString) {
                return new Date(isoString).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' }) + " น.";
            }
            if (isJobFinished) return "เสร็จสิ้น";
            return fallbackText;
        };

        // 1. Job Received
        items.push({
            id: "step-1-received",
            title: "ได้รับงาน",
            timestamp: formatTime(job.createdAt, "08:00 น."),
            dateTime: job.createdAt,
            status: "completed",
            icon: "check"
        });

        // 2. Start Trip
        const isStarted = !!job.startTrip || isJobFinished;
        items.push({
            id: "step-2-start",
            title: `ออกจากปั๊มต้นทาง (${job.sourceBranchName})`,
            timestamp: isStarted ? formatTime(job.startTrip?.startedAt) : "ยังไม่เริ่ม",
            dateTime: job.startTrip?.startedAt,
            status: isStarted ? "completed" : "active",
            icon: "truck"
        });

        // 3. Arrive Depot
        const isArrivedDepot = !!job.warehouseConfirmation || isJobFinished;
        items.push({
            id: "step-3-warehouse",
            title: `ถึงคลังน้ำมัน`, 
            timestamp: isArrivedDepot ? formatTime(job.warehouseConfirmation?.confirmedAt) : "รอดำเนินการ",
            dateTime: job.warehouseConfirmation?.confirmedAt,
            status: isArrivedDepot ? "completed" : (isStarted ? "active" : "pending"),
            icon: "map-pin"
        });

        // 4. Pickup Oil
        const isPickedUp = !!job.pickupConfirmation || isJobFinished;
        items.push({
            id: "step-4-pickup",
            title: "รับน้ำมัน",
            timestamp: isPickedUp ? formatTime(job.pickupConfirmation?.confirmedAt) : "รอดำเนินการ",
            dateTime: job.pickupConfirmation?.confirmedAt,
            status: isPickedUp ? "completed" : (isArrivedDepot ? "active" : "pending"),
            icon: "droplet"
        });

        // 5. Destinations
        const branches = [...job.destinationBranches];
        if (job.routeOrder && job.routeOrder.length > 0) {
            branches.sort((a, b) => {
                const indexA = job.routeOrder!.indexOf(a.branchId);
                const indexB = job.routeOrder!.indexOf(b.branchId);
                return indexA - indexB;
            });
        }

        let firstNextPendingAdded = false;
        branches.forEach((branch) => {
            const isDelivered = branch.status === "ส่งแล้ว" || isJobFinished;
            const isArrivedBranch = !!branch.arrivalConfirmation || isDelivered;

            // Arrival
            let arrivalStatus = "pending";
             if (isArrivedBranch) arrivalStatus = "completed";
             else if (isPickedUp && !firstNextPendingAdded) { arrivalStatus = "active"; firstNextPendingAdded = true; }

            items.push({
                id: `step-branch-${branch.branchId}-arrive`,
                title: `ถึงปั๊ม (${branch.branchName})`,
                timestamp: arrivalStatus === "completed" ? formatTime(branch.arrivalConfirmation?.confirmedAt || (isDelivered ? branch.deliveryConfirmation?.confirmedAt : undefined)) : (arrivalStatus === "active" ? "กำลังเดินทาง" : "รอดำเนินการ"),
                dateTime: branch.arrivalConfirmation?.confirmedAt,
                status: arrivalStatus,
                icon: "map-pin",
                sequence: items.length
            });

             // Unload
            let unloadStatus = "pending";
            if (isDelivered) unloadStatus = "completed";
            else if (arrivalStatus === "completed" && !firstNextPendingAdded) { unloadStatus = "active"; firstNextPendingAdded = true; }

            items.push({
                id: `step-branch-${branch.branchId}-unload`,
                title: `ลงน้ำมัน (${branch.branchName})`,
                timestamp: isDelivered ? formatTime(branch.deliveryConfirmation?.confirmedAt) : "รอดำเนินการ",
                dateTime: branch.deliveryConfirmation?.confirmedAt,
                status: unloadStatus,
                icon: "download",
                sequence: items.length
            });
        });

        // 6. Finish
        const isFinished = isJobFinished && (!!job.depotArrival || !!job.endOdometer);
        const allDelivered = job.destinationBranches.every(b => b.status === "ส่งแล้ว" || isJobFinished);
        items.push({
            id: "step-end",
            title: "กลับถึงปั๊ม (จบงาน)",
            timestamp: isFinished ? formatTime(job.depotArrival?.arrivedAt) : "รอดำเนินการ",
            status: isFinished ? "completed" : (allDelivered ? "active" : "pending"),
            icon: "check-circle",
            sequence: items.length
        });

        return items;

    }, [job]);

    return (
        <div className="relative pl-2 space-y-6">
            {timelineItems.map((item, index) => {
                const isLast = index === timelineItems.length - 1;
                return (
                    <div key={item.id} className="relative flex gap-4">
                        {!isLast && (
                            <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 border-l-2 border-dashed border-gray-200 dark:border-gray-700" />
                        )}
                        <div className="relative z-10 shrink-0">
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${
                                item.status === "completed" ? "bg-green-500 text-white" : 
                                item.status === "active" ? "bg-blue-500 text-white animate-pulse" : 
                                "bg-gray-100 text-gray-400 dark:bg-gray-700"
                            }`}>
                                <StepIcon name={item.icon} className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        <div className={`${item.status === "active" ? "pt-0 -mt-1" : "pt-0.5"}`}>
                            <h4 className={`font-bold text-sm ${
                                item.status === "active" ? "text-blue-600 dark:text-blue-400" :
                                item.status === "completed" ? "text-gray-900 dark:text-white" :
                                "text-gray-400 dark:text-gray-500"
                            }`}>
                                {item.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.timestamp}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default function TransportTracking() {
  const { driverJobs } = useGasStation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<DriverJob | null>(null);

  // Stats
  const stats = useMemo(() => {
    return {
      total: driverJobs.length,
      active: driverJobs.filter(j => ["ออกเดินทางแล้ว", "รับน้ำมันแล้ว", "กำลังส่ง", "จัดเรียงเส้นทางแล้ว"].includes(j.status)).length,
      completed: driverJobs.filter(j => j.status === "ส่งเสร็จ").length,
      pending: driverJobs.filter(j => j.status === "รอเริ่ม").length // Fixed status check
    };
  }, [driverJobs]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return driverJobs.filter(job => 
      job.transportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.truckPlateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.internalOrderNo && job.internalOrderNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.purchaseOrderNo && job.purchaseOrderNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [driverJobs, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ส่งเสร็จ": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "กำลังส่ง": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "รับน้ำมันแล้ว": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "รอเริ่ม": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen font-sans pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                <Navigation className="w-8 h-8 text-white" />
            </div>
            ติดตามสถานะคนขับ
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 ml-[80px]">
            แดชบอร์ดสำหรับผู้ดูแลระบบ (Admin) เพื่อติดตามการขนส่งทั้งหมด
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                    <Truck className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-500">งานทั้งหมด</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                    <Navigation className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-500">กำลังวิ่งงาน</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-500">ส่งเสร็จแล้ว</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-500">รอดำเนินการ</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาตามคนขับ, ทะเบียนรถ, หรือเลขที่ใบงาน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white placeholder-gray-400"
        />
      </div>

      {/* Jobs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">เลขที่เที่ยวรถ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">วันที่</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">พนักงานขับรถ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ทะเบียนรถ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              <AnimatePresence>
                {filteredJobs.map((job) => (
                  <motion.tr
                    key={job.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                         <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500">
                            <Truck className="w-4 h-4" />
                         </div>
                         {job.transportNo}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-300">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString("th-TH") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">
                           {job.driverName ? job.driverName.charAt(0) : "U"}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">{job.driverName || "ไม่ระบุคนขับ"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {job.truckPlateNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(job.status)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            job.status === "ส่งเสร็จ" ? "bg-green-500" :
                            ["กำลังส่ง", "ออกเดินทางแล้ว"].includes(job.status) ? "bg-blue-500" :
                            "bg-gray-400"
                        }`} />
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg text-sm font-bold transition-all inline-flex items-center gap-1"
                      >
                         รายละเอียด 
                         <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {filteredJobs.length === 0 && (
          <div className="text-center py-20 text-gray-400">
              <Truck className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>ไม่พบรายการที่ค้นหา</p>
          </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
                >
                    {/* Modal Header */}
                    <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0 sticky top-0 z-10">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                    <Truck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        {selectedJob.transportNo}
                                        <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(selectedJob.status)}`}>
                                            {selectedJob.status}
                                        </span>
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                                        สร้างเมื่อ: {selectedJob.createdAt ? new Date(selectedJob.createdAt).toLocaleDateString("th-TH", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"} น.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedJob(null)}
                            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="flex flex-col md:flex-row h-full overflow-hidden">
                        {/* Sidebar: Driver & Vehicle Info */}
                        <div className="md:w-1/3 bg-gray-50 dark:bg-gray-900/50 p-6 overflow-y-auto border-r border-gray-100 dark:border-gray-700 space-y-6">
                             {/* Driver Card */}
                             <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">ข้อมูลคนขับ</h3>
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-3">
                                        <User className="w-10 h-10" />
                                    </div>
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">{selectedJob.driverName || "ไม่ระบุชื่อ"}</h4>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">พนักงานขับรถขนส่ง</p>
                                    
                                    <div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 flex items-center justify-center gap-2 text-blue-700 dark:text-blue-400 cursor-pointer hover:bg-blue-100 transition-colors">
                                        <Phone className="w-4 h-4" />
                                        <span className="font-bold text-sm">089-123-4567</span>
                                    </div>
                                </div>
                             </div>

                             {/* Order Info */}
                             {(selectedJob.orderType === "external" || selectedJob.orderType === "internal" || selectedJob.warehouseConfirmation?.depotDocumentNo) && (
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">ข้อมูลเอกสาร</h3>
                                    <div className="space-y-3">
                                        {selectedJob.purchaseOrderNo && (
                                            <div className="flex justify-between items-start text-sm">
                                                <span className="text-gray-500 whitespace-nowrap">เลขที่ใบสั่งซื้อ (PO)</span>
                                                <span className="font-bold text-gray-900 dark:text-white text-right break-words max-w-[150px]">
                                                    {selectedJob.purchaseOrderNo}
                                                </span>
                                            </div>
                                        )}
                                        {selectedJob.internalOrderNo && (
                                            <div className="flex justify-between items-start text-sm">
                                                <span className="text-gray-500 whitespace-nowrap">เลขที่สั่งซื้อภายใน (IO)</span>
                                                <span className="font-bold text-blue-600 dark:text-blue-400 text-right break-words max-w-[150px]">
                                                    {selectedJob.internalOrderNo}
                                                </span>
                                            </div>
                                        )}
                                        {selectedJob.warehouseConfirmation?.depotDocumentNo && (
                                            <div className="flex justify-between items-start text-sm">
                                                <span className="text-gray-500 whitespace-nowrap">เลขที่ใบกำกับภาษี</span>
                                                <span className="font-bold text-green-600 dark:text-green-400 text-right break-words max-w-[150px]">
                                                    {selectedJob.warehouseConfirmation.depotDocumentNo}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                             )}

                             {/* Vehicle Info */}
                             <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">ข้อมูลยานพาหนะ</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Truck className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">ทะเบียนรถ</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{selectedJob.truckPlateNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedJob.trailerPlateNumber && (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold border border-gray-400 rounded text-[10px]">T</div>
                                                <div>
                                                    <p className="text-xs text-gray-500">ทะเบียนหาง</p>
                                                    <p className="font-bold text-gray-900 dark:text-white">{selectedJob.trailerPlateNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                             </div>

                             {/* Load Summary */}
                             <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider">สรุปการจัดส่ง</h3>
                                <div className="space-y-2">
                                     <div className="flex justify-between text-sm">
                                         <span className="text-gray-500">จำนวนสาขาที่ส่ง</span>
                                         <span className="font-bold text-gray-900 dark:text-white">{selectedJob.destinationBranches.length} สาขา</span>
                                     </div>
                                     <div className="flex justify-between text-sm">
                                         <span className="text-gray-500">ปริมาณรวม</span>
                                         <span className="font-bold text-gray-900 dark:text-white">
                                             {selectedJob.destinationBranches.reduce((acc, curr) => acc + curr.quantity, 0).toLocaleString()} ลิตร
                                         </span>
                                     </div>
                                </div>
                             </div>
                        </div>

                        {/* Main Content: Timeline */}
                        <div className="md:w-2/3 p-8 overflow-y-auto bg-white dark:bg-gray-800">
                             <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600" /> 
                                    Timeline การเดินทาง
                                </h3>
                                <p className="text-sm text-gray-500 pl-7">ติดตามสถานะการจัดส่งตามเวลาจริง</p>
                             </div>
                             
                             <div className="pl-4">
                                <JobTimeline job={selectedJob} />
                             </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
