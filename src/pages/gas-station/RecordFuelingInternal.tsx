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
  Clock,
  Calendar
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

export default function RecordFuelingInternal() {
  const { allDriverJobs, addFuelingRecord } = useGasStation();
  const { selectedBranches } = useBranch();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [prefillStation, setPrefillStation] = useState<string | undefined>(undefined);

  // Filter active jobs (not completed) + Global Branch Filter + orderType === "internal"
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);
  
  const activeJobs = useMemo(() =>
    allDriverJobs.filter(j => {
      const active = j.status !== "ส่งเสร็จ";
      const isInternal = j.orderType === "internal";
      const branchMatch = selectedBranchIds.length === 0 || 
        j.destinationBranches.some(b => selectedBranchIds.includes(b.branchId));
      return active && isInternal && branchMatch;
    }),
    [allDriverJobs, selectedBranchIds]
  );

  const selectedJob = useMemo(() =>
    allDriverJobs.find(j => j.id === selectedJobId),
    [allDriverJobs, selectedJobId]
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
        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm border border-purple-200 dark:border-purple-800">
           <Fuel className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">บันทึกเติมน้ำมัน (ภายใน)</h1>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">สำหรับเที่ยววิ่งขนส่งระหว่างสาขา</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาเลขขนส่ง, ทะเบียนรถ, คนขับ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-14 pr-6 py-4.5 rounded-[1.5rem] bg-white dark:bg-gray-800 border-2 border-transparent focus:border-purple-500/30 shadow-lg shadow-purple-900/5 focus:outline-none text-sm font-bold"
        />
      </div>

      {/* Cards List */}
      <div className="space-y-5">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-700 shadow-sm">
                <Truck className="w-12 h-12 mx-auto mb-3 opacity-20 text-purple-500" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">ไม่พบรายการขนส่งภายใน</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
                <div key={job.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-purple-50 dark:border-purple-900/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                    
                    {/* Header Row */}
                    <div className="flex justify-between items-start mb-5 relative z-10">
                        <div>
                            <p className="text-purple-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">รหัสการขนส่ง</p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
                                {job.transportNo}
                            </h3>
                        </div>
                        <div className="text-right">
                             <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-purple-100 dark:border-purple-800">
                                 <Calendar className="w-3 h-3" /> {new Date(job.transportDate).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                             </div>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">ทะเบียนรถ</p>
                            <p className="font-black text-gray-800 dark:text-gray-200 text-sm tracking-tight">{job.truckPlateNumber}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">คนขับ</p>
                            <p className="font-black text-gray-800 dark:text-gray-200 text-sm tracking-tight truncate">{job.driverName || "ไม่ระบุ"}</p>
                        </div>
                    </div>

                    {/* Locations */}
                    <div className="space-y-5 relative pl-3 mb-8 z-10">
                        <div className="absolute left-[14px] top-2 bottom-6 w-[2px] bg-gradient-to-b from-purple-500/20 via-purple-500/10 to-transparent" />

                        <div className="relative flex items-start gap-4">
                            <div className="w-7 h-7 rounded-full bg-purple-600 border-4 border-white dark:border-gray-800 shadow-lg shadow-purple-600/20 z-10 flex items-center justify-center shrink-0">
                                <MapPin className="w-3 h-3 text-white" />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">ต้นทาง:</p>
                                <p className="font-black text-gray-900 dark:text-white text-sm tracking-tight">{job.sourceBranchName}</p>
                            </div>
                        </div>

                        <div className="relative flex items-start gap-4">
                            <div className="w-7 h-7 rounded-full bg-emerald-500 border-4 border-white dark:border-gray-800 shadow-lg shadow-emerald-500/20 z-10 flex items-center justify-center shrink-0">
                                <Navigation className="w-3 h-3 text-white" />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">ปลายทาง ({job.destinationBranches.length}):</p>
                                <p className="font-black text-gray-900 dark:text-white text-sm tracking-tight truncate max-w-[200px]">
                                    {job.destinationBranches.map(b => b.branchName).join(", ")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 relative z-10">
                         <button 
                            onClick={() => onSelect(job.id)}
                            className="flex-1 inline-flex items-center justify-center gap-3 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-[1.25rem] font-black text-sm shadow-xl shadow-purple-600/20 active:scale-95 transition-all uppercase tracking-widest"
                         >
                             <Plus className="w-5 h-5" />
                             บันทึกการเติมน้ำมัน
                         </button>
                    </div>
                </div>
            ))
          )}
      </div>
    </motion.div>
  );
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
      className="p-6 pb-24 space-y-8"
    >
      {/* Top Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100 dark:border-gray-700 transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <p className="text-purple-500 text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">รายละเอียดเที่ยววิ่ง</p>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
            {job.transportNo}
          </h2>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-purple-50 dark:border-purple-900/30 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">รวมปริมาณ</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">{totalLiters.toLocaleString()}</span>
            <span className="text-[10px] font-black text-gray-300 uppercase">Ltrs</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-emerald-50 dark:border-emerald-900/30 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">รวมค่าใช้จ่าย</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{totalAmount.toLocaleString()}</span>
            <span className="text-[10px] font-black text-gray-300 uppercase">THB</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">จุดเติมแนะนำ (สาขาภายใน)</p>
          <div className="grid grid-cols-1 gap-4">
              {firstDest && !hasFuelAtFirstDest && (
                  <button 
                    onClick={() => onQuickFuel(firstDest.branchName)}
                    className="flex items-center justify-between p-5 bg-purple-50/50 dark:bg-purple-900/10 border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 rounded-[2rem] transition-all group active:scale-[0.98]"
                  >
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
                              <Fuel className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                              <p className="text-[9px] text-purple-600 dark:text-purple-400 font-black uppercase tracking-widest mb-0.5">ปลายทางลำดับแรก</p>
                              <p className="font-black text-gray-900 dark:text-white text-base tracking-tight">เติมที่ {firstDest.branchName}</p>
                          </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <Plus className="w-5 h-5" />
                      </div>
                  </button>
              )}

              {!hasFuelAtBase && (
                  <button 
                    onClick={() => onQuickFuel(job.sourceBranchName)}
                    className="flex items-center justify-between p-5 bg-emerald-50/50 dark:bg-emerald-900/10 border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 rounded-[2rem] transition-all group active:scale-[0.98]"
                  >
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                              <History className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mb-0.5">ขากลับ (ปั๊มต้นทาง)</p>
                              <p className="font-black text-gray-900 dark:text-white text-base tracking-tight">เติมที่ {job.sourceBranchName}</p>
                          </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Plus className="w-5 h-5" />
                      </div>
                  </button>
              )}
          </div>
      </div>

       <div className="flex justify-between items-center mt-4 px-2">
          <h3 className="text-lg font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-purple-500" />
            ประวัติการเติม
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 active:scale-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรายการ
          </button>
      </div>

      {/* History List */}
      <div className="space-y-4">
          {records.length === 0 ? (
             <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ยังไม่มีข้อมูลการเติมน้ำมัน</p>
             </div>
          ) : (
            records.map((r) => (
               <div key={r.id} className="bg-white dark:bg-gray-800 p-5 rounded-[1.75rem] border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center group">
                   <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                           <Fuel className="w-6 h-6" />
                       </div>
                       <div>
                           <div className="font-black text-gray-900 dark:text-white text-sm tracking-tight">{r.stationName}</div>
                           <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                               <Calendar className="w-3 h-3" /> {r.fuelingDate} <Clock className="w-3 h-3 ml-1" /> {r.fuelingTime}
                           </div>
                           <div className="mt-2 flex items-center gap-2">
                               <span className="text-[9px] font-black text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-md uppercase tracking-wider">{r.oilType}</span>
                               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{r.odometerReading.toLocaleString()} km</span>
                           </div>
                       </div>
                   </div>
                   <div className="text-right">
                       <div className="font-black text-emerald-600 dark:text-emerald-400 text-base tracking-tight">{r.amount.toLocaleString()} <span className="text-[9px] uppercase font-black text-gray-300">฿</span></div>
                       <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{r.quantity.toLocaleString()} Ltrs</div>
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
      transportNo: "", 
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

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600">
                <Fuel className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase tracking-wider">
                บันทึกการเติมน้ำมัน
            </h3>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-6 no-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block">ชื่อปั๊มน้ำมัน</label>
            <input
              value={stationName}
              onChange={e => setStationName(e.target.value)}
              placeholder="ระบุชื่อปั๊ม..."
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500/30 font-bold outline-none transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block">ชนิดน้ำมัน</label>
              <select
                value={oilType}
                onChange={e => setOilType(e.target.value as OilType)}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500/30 font-bold outline-none transition-all shadow-inner appearance-none"
              >
                {OIL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block">เลขไมล์</label>
              <input
                type="number"
                value={odometer}
                onChange={e => setOdometer(Number(e.target.value) || "")}
                placeholder="0"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500/30 font-bold outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block">จำนวนลิตร</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value) || "")}
                placeholder="0.00"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500/30 font-bold outline-none transition-all shadow-inner text-purple-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block">จำนวนเงิน (บาท)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value) || "")}
                placeholder="0.00"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500/30 font-bold outline-none transition-all shadow-inner text-emerald-600"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block">หลักฐาน / หมายเหตุ</label>
            <div className="flex gap-4">
                {photo ? (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-gray-100 group">
                    <img src={photo} className="w-full h-full object-cover" />
                    <button onClick={() => setPhoto(null)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setPhoto("https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=400&q=80")}
                    className="w-24 h-24 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-1 text-gray-300 hover:border-purple-300 transition-all"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-[8px] font-black uppercase">Add Photo</span>
                  </button>
                )}
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)..."
                    className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-purple-500/30 font-bold outline-none transition-all shadow-inner resize-none h-24 text-xs"
                />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex gap-4">
          <button onClick={onClose} className="flex-1 px-6 py-4 rounded-[1.25rem] bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-400 font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all">ยกเลิก</button>
          <button onClick={handleSave} className="flex-1 px-6 py-4 rounded-[1.25rem] bg-purple-600 text-white font-black uppercase tracking-widest text-xs hover:bg-purple-700 shadow-xl shadow-purple-600/20 active:scale-95 transition-all">บันทึกข้อมูล</button>
        </div>
      </motion.div>
    </div>
  );
}
