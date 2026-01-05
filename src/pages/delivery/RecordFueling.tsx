import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  MapPin,
  Camera,
  History,
  Calendar,
  Fuel,
  X,
  Plus,
  ArrowLeft,
  FileText,
  Search
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import type { FuelingRecord, OilType, DriverJob } from "@/types/gasStation";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";

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
  const { driverJobs, addFuelingRecord, branches } = useGasStation();
  const { selectedBranches } = useBranch();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter active jobs (not completed)
  const activeJobs = useMemo(() =>
    driverJobs.filter(j => j.status !== "ส่งเสร็จ"),
    [driverJobs]
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
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 px-1"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 text-white">
          <Fuel className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">บันทึกเติมน้ำมัน</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">สำหรับคนขับรถขนส่งน้ำมัน</p>
        </div>

        <div className="ml-auto flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
          </span>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!selectedJobId ? (
          <TripListTable key="list" jobs={activeJobs} onSelect={setSelectedJobId} />
        ) : (
          <FuelingDetailView
            key="detail"
            job={selectedJob!}
            onBack={handleBack}
            onAddRecord={(record) => {
              if (selectedJobId) {
                addFuelingRecord(selectedJobId, record);
                setShowAddModal(false);
              }
            }}
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Components ---

function TripListTable({ jobs, onSelect }: { jobs: DriverJob[], onSelect: (id: string) => void }) {
  const [search, setSearch] = useState("");

  const filteredJobs = jobs.filter(j =>
    j.transportNo.toLowerCase().includes(search.toLowerCase()) ||
    j.truckPlateNumber.includes(search) ||
    j.driverName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Search & Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาเลขขนส่ง, ทะเบียนรถ, คนขับ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">เลขที่ขนส่ง / วันที่</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">รถ / คนขับ</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">เส้นทาง</th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    ไม่พบรายการขนส่ง
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 dark:text-white">{job.transportNo}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(job.transportDate).toLocaleDateString('th-TH')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{job.truckPlateNumber}</div>
                      <div className="text-xs text-gray-500">{job.driverName || "-"}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-500" />
                          {job.sourceBranchName}
                        </div>
                        <div className="text-xs text-gray-500 pl-4">
                          to {job.destinationBranches.length} locations
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusTag variant={getStatusVariant(job.status)}>{job.status}</StatusTag>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => onSelect(job.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 font-medium text-sm transition-colors"
                      >
                        <Fuel className="w-4 h-4" />
                        บันทึกเติมน้ำมัน
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function FuelingDetailView({
  job,
  onBack,
  onAddRecord,
  showAddModal,
  setShowAddModal
}: {
  job: DriverJob,
  onBack: () => void,
  onAddRecord: (r: FuelingRecord) => void,
  showAddModal: boolean,
  setShowAddModal: (v: boolean) => void
}) {
  const records = job.fuelingRecords || [];
  const totalLiters = records.reduce((sum, r) => sum + r.quantity, 0);
  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Top Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            {job.transportNo}
            <StatusTag variant={getStatusVariant(job.status)} className="text-sm">{job.status}</StatusTag>
          </h2>
          <div className="text-sm text-gray-500 flex items-center gap-3">
            <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {job.truckPlateNumber}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.sourceBranchName}</span>
          </div>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold"
          >
            <Plus className="w-5 h-5" />
            เพิ่มรายการเติมน้ำมัน
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="md:hidden p-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">จำนวนครั้งที่เติม</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{records.length} <span className="text-xs font-normal text-muted">ครั้ง</span></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">รวมปริมาณ</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalLiters.toLocaleString()} <span className="text-xs font-normal text-muted">ลิตร</span></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm col-span-2 md:col-span-2">
          <div className="text-sm text-gray-500 mb-1">รวมเป็นเงิน</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">฿{totalAmount.toLocaleString()}</div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            ประวัติการเติมน้ำมัน
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-left">
              <tr>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">วันที่ / เวลา</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">ปั๊มน้ำมัน</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">ประเภท / เลขไมล์</th>
                <th className="py-4 px-6 text-right text-xs font-semibold text-gray-500 uppercase">ปริมาณ / ราคา</th>
                <th className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase">หลักฐาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    ยังไม่มีข้อมูลการเติมน้ำมัน
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900 dark:text-white">{r.fuelingDate}</div>
                      <div className="text-xs text-gray-500">{r.fuelingTime}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">{r.stationName}</div>
                      {r.notes && <div className="text-xs text-gray-400 truncate max-w-[150px]">{r.notes}</div>}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900 dark:text-white">{r.oilType}</div>
                      <div className="text-xs text-gray-500">เลขไมล์: {r.odometerReading.toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{r.amount.toLocaleString()} ฿</div>
                      <div className="text-xs text-gray-500">{r.quantity.toLocaleString()} ลิตร</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {r.photoUrl ? (
                        <a href={r.photoUrl} target="_blank" rel="noreferrer" className="inline-block p-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </a>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddFuelingModal onClose={() => setShowAddModal(false)} onSave={onAddRecord} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AddFuelingModal({ onClose, onSave }: { onClose: () => void, onSave: (r: FuelingRecord) => void }) {
  const [stationName, setStationName] = useState("");
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
        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
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
            {/* Added Notes Field */}
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
