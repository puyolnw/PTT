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
  X,
  User,
  Phone,
  Droplet,
  Download,
  Check,
  CheckCircle,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  History,
  FileText,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGasStation } from "@/contexts/GasStationContext";
import { DriverJob } from "@/types/gasStation";
import StatusTag from "@/components/StatusTag";
import TableActionMenu from "@/components/TableActionMenu";

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
  const [columnFilters, setColumnFilters] = useState<{
    status: string;
  }>({
    status: "ทั้งหมด"
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'createdAt', direction: 'desc' });
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

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
    let result = driverJobs.filter(job => {
      const matchesSearch =
        job.transportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.truckPlateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.internalOrderNo && job.internalOrderNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.purchaseOrderNo && job.purchaseOrderNo.toLowerCase().includes(searchTerm.toLowerCase()));

      // Column Filters
      const matchesStatus = columnFilters.status === "ทั้งหมด" || job.status === columnFilters.status;

      // Date Range Filter
      const matchesDateFrom = !filterDateFrom || (job.createdAt && new Date(job.createdAt) >= new Date(filterDateFrom));
      const matchesDateTo = !filterDateTo || (job.createdAt && new Date(job.createdAt) <= new Date(filterDateTo));

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });

    // Sorting
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case 'createdAt':
            aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            break;
          case 'transportNo':
            aValue = a.transportNo;
            bValue = b.transportNo;
            break;
          case 'driverName':
            aValue = a.driverName || "";
            bValue = b.driverName || "";
            break;
          default:
            aValue = (a as any)[sortConfig.key];
            bValue = (b as any)[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      result.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    }

    return result;
  }, [driverJobs, searchTerm, columnFilters, sortConfig, filterDateFrom, filterDateTo]);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key, direction: null };
        return { key, direction: 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key || !sortConfig.direction) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-emerald-500" /> : <ChevronDown className="w-3 h-3 text-emerald-500" />;
  };

  // ดึงค่า Unique สำหรับ Filter Dropdowns
  const filterOptions = useMemo(() => {
    return {
      status: ["ทั้งหมด", ...new Set(driverJobs.map(j => j.status))]
    };
  }, [driverJobs]);

  const HeaderWithFilter = ({ label, columnKey, filterKey, options }: { 
    label: string, 
    columnKey?: string, 
    filterKey?: keyof typeof columnFilters, 
    options?: string[] 
  }) => (
    <th className="px-6 py-4 relative group">
      <div className="flex items-center gap-2">
        <div 
          className={`flex items-center gap-1.5 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors ${sortConfig.key === columnKey ? 'text-emerald-600' : ''}`}
          onClick={() => columnKey && handleSort(columnKey)}
        >
          {label}
          {columnKey && getSortIcon(columnKey)}
        </div>
        
        {filterKey && options && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === filterKey ? null : filterKey);
              }}
              className={`p-1 rounded-md transition-all ${columnFilters[filterKey] !== "ทั้งหมด" ? "bg-emerald-500 text-white shadow-sm" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"}`}
            >
              <Filter className="w-3 h-3" />
            </button>
            
            <AnimatePresence>
              {activeDropdown === filterKey && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setActiveDropdown(null)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1 overflow-hidden"
                  >
                    {options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setColumnFilters(prev => ({ ...prev, [filterKey]: opt }));
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                          columnFilters[filterKey] === opt 
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {opt}
                        {columnFilters[filterKey] === opt && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </th>
  );

  const isAnyFilterActive = useMemo(() => {
    return columnFilters.status !== "ทั้งหมด" ||
           filterDateFrom !== "" ||
           filterDateTo !== "";
  }, [columnFilters, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setColumnFilters({
      status: "ทั้งหมด"
    });
    setSearchTerm("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Navigation className="w-8 h-8 text-white" />
              </div>
              ติดตามสถานะคนขับ
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
              <History className="w-4 h-4" />
              แดชบอร์ดสำหรับผู้ดูแลระบบ (Admin) เพื่อติดตามการขนส่งทั้งหมด
            </p>
          </div>
        </div>
      </header>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <Truck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">งานทั้งหมด</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.total} รายการ</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
              <Navigation className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">กำลังวิ่งงาน</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.active} รายการ</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ส่งเสร็จแล้ว</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.completed} รายการ</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">รอดำเนินการ</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.pending} รายการ</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาตามคนขับ, ทะเบียนรถ, หรือเลขที่ใบงาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium text-sm"
              placeholder="จากวันที่"
            />
          </div>
          <span className="text-gray-400 font-bold">-</span>
          <div className="relative flex-1 md:flex-initial">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-medium text-sm"
              placeholder="ถึงวันที่"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {isAnyFilterActive && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                <HeaderWithFilter 
                  label="เลขที่เที่ยวรถ" 
                  columnKey="transportNo" 
                />
                <HeaderWithFilter 
                  label="วันที่" 
                  columnKey="createdAt" 
                />
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('driverName')}
                >
                  <div className="flex items-center gap-2">
                    พนักงานขับรถ
                    {getSortIcon('driverName')}
                  </div>
                </th>
                <th className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3 h-3" />
                    ทะเบียนรถ
                  </div>
                </th>
                <HeaderWithFilter 
                  label="สถานะ" 
                  filterKey="status"
                  options={filterOptions.status}
                />
                <th className="px-6 py-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-20" />
                      ไม่พบรายการที่ค้นหา
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors font-medium"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {job.transportNo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString("th-TH") : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                          <User className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{job.driverName || "ไม่ระบุคนขับ"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {job.truckPlateNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusTag variant={
                        job.status === "ส่งเสร็จ" ? "success" :
                        ["กำลังส่ง", "ออกเดินทางแล้ว"].includes(job.status) ? "info" :
                        job.status === "รอเริ่ม" ? "warning" :
                        "neutral"
                      }>
                        {job.status}
                      </StatusTag>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <TableActionMenu
                          actions={[
                            {
                              label: "ดูรายละเอียด",
                              icon: Eye,
                              onClick: () => setSelectedJob(job)
                            }
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500 rounded-xl">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-emerald-800 dark:text-emerald-400">รายละเอียดการขนส่ง</h2>
                                <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold">เลขขนส่ง: {selectedJob.transportNo}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedJob(null)}
                            className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
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
