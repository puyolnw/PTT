import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  MapPin,
  Camera,
  History,
  Fuel,
  X,
  Plus,
  ArrowLeft,
  Search,
  Navigation,
  Clock
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import type { FuelingRecord, OilType, DriverJob } from "@/types/gasStation";
import DriverBottomNav from "@/components/DriverBottomNav";

const OIL_TYPES: OilType[] = [
  "Premium Diesel",
  "Diesel",
  "Premium Gasohol 95",
  "Gasohol 95",
  "Gasohol 91",
  "E20",
  "E85"
];

export default function RecordFueling() {
  const { driverJobs, addFuelingRecord } = useGasStation();
  const { selectedBranches } = useBranch();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [prefillStation, setPrefillStation] = useState<string | undefined>(undefined);

  // Filter active jobs (not completed) + Global Branch Filter
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);
  
  const activeJobs = useMemo(() =>
    driverJobs.filter(j => {
      const active = j.status !== "ส่งเสร็จ";
      const branchMatch = selectedBranchIds.length === 0 || 
        j.destinationBranches.some(b => selectedBranchIds.includes(b.branchId));
      return active && branchMatch;
    }).slice(0, 1),
    [driverJobs, selectedBranchIds]
  );

  const selectedJob = useMemo(() =>
    driverJobs.find(j => j.id === selectedJobId),
    [driverJobs, selectedJobId]
  );

  const handleBack = () => {
    setSelectedJobId(null);
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-24">
      <AnimatePresence mode="wait">
        {!selectedJobId ? (
          <JobList key="list" jobs={activeJobs} onSelect={setSelectedJobId} />
        ) : (
          <FuelingDetailView
            key="detail"
            job={selectedJob!}
            onBack={handleBack}
            onAddRecord={(record) => {
              if (selectedJobId) {
                addFuelingRecord(selectedJobId, record);
                setShowAddModal(false);
                setPrefillStation(undefined);
              }
            }}
            showAddModal={showAddModal}
            setShowAddModal={(val) => {
                setShowAddModal(val);
                if (!val) setPrefillStation(undefined);
            }}
            onQuickFuel={(station) => {
                setPrefillStation(station);
                setShowAddModal(true);
            }}
            prefillStation={prefillStation}
          />
        )}
      </AnimatePresence>
      
      {!selectedJobId && <DriverBottomNav />}
    </div>
  );
}

// --- Components ---

function JobList({ jobs, onSelect }: { jobs: DriverJob[], onSelect: (id: string) => void }) {
  const [search, setSearch] = useState("");

  const filteredJobs = jobs.filter(j =>
    j.transportNo.toLowerCase().includes(search.toLowerCase()) ||
    j.truckPlateNumber.includes(search) ||
    j.driverName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-5 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
           <Fuel className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">บันทึกเติมน้ำมัน</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">สำหรับคนขับรถขนส่งน้ำมัน</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาเลขขนส่ง, ทะเบียนรถ, คนขับ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
        />
      </div>

      {/* Cards List */}
      <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
                <Truck className="w-12 h-12 mx-auto mb-2 opacity-20" />
                ไม่พบรายการขนส่ง
            </div>
          ) : (
            filteredJobs.map((job) => (
                <div key={job.id} className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                                {job.transportNo}
                            </h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <CalendarIcon /> {new Date(job.transportDate).toLocaleDateString('th-TH')}
                            </p>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{job.truckPlateNumber}</p>
                             <p className="text-xs text-gray-500">{job.driverName || "ไม่ระบุคนขับ"}</p>
                        </div>
                    </div>

                    {/* Line Separator */}
                    <div className="h-px bg-gray-100 dark:bg-gray-700 w-full mb-4" />

                    {/* Locations */}
                    <div className="space-y-6 relative pl-2 mb-6">
                        {/* Connecting Line */}
                        <div className="absolute left-[11px] top-2 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700" />

                        <div className="relative flex items-start gap-4">
                            <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white dark:border-gray-800 shadow-sm z-10 flex items-center justify-center shrink-0">
                                <MapPin className="w-3 h-3 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">ต้นทาง:</p>
                                <p className="font-bold text-gray-900 dark:text-white">{job.sourceBranchName}</p>
                            </div>
                        </div>

                        <div className="relative flex items-start gap-4">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-gray-800 shadow-sm z-10 flex items-center justify-center shrink-0">
                                <Navigation className="w-3 h-3 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">ปลายทาง:</p>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {job.destinationBranches.map(b => b.branchName).join(", ")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                         <div className="inline-flex items-center gap-1 px-4 py-2.5 bg-yellow-100 text-yellow-700 rounded-xl text-sm font-bold">
                             <Clock className="w-4 h-4" />
                             กำลังดำเนินการ
                         </div>
                         <button 
                            onClick={() => onSelect(job.id)}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                         >
                             <Plus className="w-4 h-4" />
                             บันทึกเติมน้ำมัน
                         </button>
                    </div>
                </div>
            ))
          )}
      </div>
    </motion.div>
  );
}

function CalendarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
    )
}

function FuelingDetailView({
  job,
  onBack,
  onAddRecord,
  showAddModal,
  setShowAddModal,
  onQuickFuel,
  prefillStation
}: {
  job: DriverJob,
  onBack: () => void,
  onAddRecord: (r: FuelingRecord) => void,
  showAddModal: boolean,
  setShowAddModal: (v: boolean) => void,
  onQuickFuel: (station: string) => void,
  prefillStation?: string
}) {
  const records = job.fuelingRecords || [];
  const totalLiters = records.reduce((sum, r) => sum + r.quantity, 0);
  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

  // Sort branches by routeOrder if available to identify the first destination correctly
  const sortedBranches = useMemo(() => {
    const branches = [...job.destinationBranches];
    if (job.routeOrder && job.routeOrder.length > 0) {
        branches.sort((a, b) => {
            const indexA = job.routeOrder!.indexOf(a.branchId);
            const indexB = job.routeOrder!.indexOf(b.branchId);
            return indexA - indexB;
        });
    }
    return branches;
  }, [job]);

  const firstDest = sortedBranches[0];
  const hasFuelAtFirstDest = records.some(r => r.stationName.includes(firstDest?.branchName) || (firstDest?.branchName && firstDest.branchName.includes(r.stationName)));
  const hasFuelAtBase = records.some(r => r.stationName.includes(job.sourceBranchName) || job.sourceBranchName.includes(r.stationName));


  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-5 pb-24 space-y-6"
    >
      {/* Top Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors -ml-2"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            {job.transportNo}
          </h2>
           <p className="text-xs text-gray-500">{job.truckPlateNumber}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">รวมปริมาณ (ลิตร)</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalLiters.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">รวมเป็นเงิน (บาท)</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalAmount.toLocaleString()}</div>
        </div>
      </div>

      {/* Standard Fueling Recommendations */}
      <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">จุดเติมน้ำมันแนะนำ</p>
          <div className="grid grid-cols-1 gap-3">
              {firstDest && !hasFuelAtFirstDest && (
                  <button 
                    onClick={() => onQuickFuel(firstDest.branchName)}
                    className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl group active:scale-[0.98] transition-all"
                  >
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                              <Fuel className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">จุดเติมที่ 1</p>
                              <p className="font-bold text-gray-900 dark:text-white text-sm">เติมที่ {firstDest.branchName}</p>
                          </div>
                      </div>
                      <Plus className="w-5 h-5 text-blue-600" />
                  </button>
              )}

              {!hasFuelAtBase && (
                  <button 
                    onClick={() => onQuickFuel(job.sourceBranchName)}
                    className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl group active:scale-[0.98] transition-all"
                  >
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                              <Fuel className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">ขากลับ (ปั๊มหลัก/ไฮโซ)</p>
                              <p className="font-bold text-gray-900 dark:text-white text-sm">เติมที่ {job.sourceBranchName}</p>
                          </div>
                      </div>
                      <Plus className="w-5 h-5 text-emerald-600" />
                  </button>
              )}
          </div>
      </div>


       <div className="flex justify-between items-center mt-2">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            ประวัติการเติม
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            เพิ่มรายการ
          </button>
      </div>

      {/* History List (Mobile Style) */}
      <div className="space-y-3">
          {records.length === 0 ? (
             <div className="text-center py-10 text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                ยังไม่มีข้อมูลการเติมน้ำมัน
             </div>
          ) : (
            records.map((r) => (
               <div key={r.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-start">
                   <div>
                       <div className="font-bold text-gray-900 dark:text-white text-sm">{r.stationName}</div>
                       <div className="text-xs text-gray-500 mt-0.5">{r.fuelingDate} • {r.fuelingTime}</div>
                       <div className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md inline-block">
                           {r.oilType} • {r.odometerReading.toLocaleString()} km
                       </div>
                   </div>
                   <div className="text-right">
                       <div className="font-bold text-blue-600 dark:text-blue-400">{r.amount.toLocaleString()} ฿</div>
                       <div className="text-xs text-gray-500">{r.quantity.toLocaleString()} ลิตร</div>
                   </div>
               </div>
            ))
          )}
      </div>


      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddFuelingModal 
            onClose={() => setShowAddModal(false)} 
            onSave={onAddRecord} 
            defaultStationName={prefillStation}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AddFuelingModal({ 
  onClose, 
  onSave,
  defaultStationName 
}: { 
  onClose: () => void, 
  onSave: (r: FuelingRecord) => void,
  defaultStationName?: string
}) {
  const [stationName, setStationName] = useState(defaultStationName || "");

  const [oilType, setOilType] = useState<OilType>("Diesel");
  const [quantity, setQuantity] = useState<number | "">("");
  const [amount, setAmount] = useState<number | "">("");
  const [odometer, setOdometer] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const handleSave = () => {
    if (!stationName) return alert("กรุณากรอกชื่อปั๊ม");
    if (!quantity || quantity <= 0) return alert("กรุณากรอกจำนวนลิตร");
    if (!amount || amount <= 0) return alert("กรุณากรอกจำนวนเงิน");
    if (!odometer || odometer <= 0) return alert("กรุณากรอกเลขไมล์");

    const newRecord: FuelingRecord = {
      id: `FR-${Date.now()}`,
      transportNo: "", // Assign in parent
      fuelingDate: new Date().toISOString().split("T")[0],
      fuelingTime: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      stationName,
      oilType,
      quantity: Number(quantity),
      amount: Number(amount),
      odometerReading: Number(odometer),
      photoUrl: photo || undefined,
      notes,
      recordedBy: "Driver",
      recordedAt: new Date().toISOString(),
    };
    onSave(newRecord);
  };

  const handlePhotoUpload = () => {
    setPhoto("https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=400&q=80");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Fuel className="w-5 h-5 text-blue-500" />
            บันทึกการเติมน้ำมัน
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อปั๊มน้ำมัน</label>
            <input
              value={stationName}
              onChange={e => setStationName(e.target.value)}
              placeholder="ระบุชื่อปั๊ม..."
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ชนิดน้ำมัน</label>
              <select
                value={oilType}
                onChange={e => setOilType(e.target.value as OilType)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {OIL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">เลขไมล์</label>
              <input
                type="number"
                value={odometer}
                onChange={e => setOdometer(Number(e.target.value) || "")}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">จำนวนลิตร</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value) || "")}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">จำนวนเงิน (บาท)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value) || "")}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">รูปถ่ายหลักฐาน</label>
            {photo ? (
              <div className="relative rounded-xl overflow-hidden h-40 group">
                <img src={photo} alt="Receipt" className="w-full h-full object-cover" />
                <button onClick={() => setPhoto(null)} className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handlePhotoUpload}
                className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <Camera className="w-6 h-6" />
                <span>ถ่ายรูป / อัปโหลด</span>
              </button>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">หมายเหตุ</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none h-24"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50">ยกเลิก</button>
          <button onClick={handleSave} className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20">บันทึก</button>
        </div>
      </motion.div>
    </div>
  );
}
