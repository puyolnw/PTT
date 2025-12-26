import { useState, useMemo } from "react";
import { 
  Truck, 
  MapPin, 
  Droplet, 
  DollarSign, 
  Camera, 
  Save, 
  History, 
  ChevronRight,
  Gauge,
  Calendar,
  Clock,
  AlertCircle
} from "lucide-react";
import { useGasStation } from "@/contexts/GasStationContext";
import type { FuelingRecord, OilType } from "@/types/gasStation";
import ChartCard from "@/components/ChartCard";

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
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  
  // Form State
  const [stationName, setStationName] = useState("");
  const [oilType, setOilType] = useState<OilType>("Diesel");
  const [quantity, setQuantity] = useState<number | "">("");
  const [amount, setAmount] = useState<number | "">("");
  const [odometer, setOdometer] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  // Active trips (not finished)
  const activeJobs = useMemo(() => 
    driverJobs.filter(j => j.status !== "ส่งเสร็จ"), 
    [driverJobs]
  );

  const selectedJob = useMemo(() => 
    driverJobs.find(j => j.id === selectedJobId), 
    [driverJobs, selectedJobId]
  );

  const handlePhotoUpload = () => {
    // Mock photo upload
    setPhoto("https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=400&q=80");
  };

  const handleSave = () => {
    if (!selectedJobId) return alert("กรุณาเลือกรอบส่งน้ำมัน");
    if (!stationName) return alert("กรุณากรอกชื่อปั๊ม");
    if (!quantity || quantity <= 0) return alert("กรุณากรอกจำนวนลิตร");
    if (!amount || amount <= 0) return alert("กรุณากรอกจำนวนเงิน");
    if (!odometer || odometer <= 0) return alert("กรุณากรอกเลขไมล์");

    const newRecord: FuelingRecord = {
      id: `FR-${Date.now()}`,
      transportNo: selectedJob?.transportNo || "",
      fuelingDate: new Date().toISOString().split("T")[0],
      fuelingTime: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      stationName,
      oilType,
      quantity: Number(quantity),
      amount: Number(amount),
      odometerReading: Number(odometer),
      photoUrl: photo || undefined,
      notes,
      recordedBy: selectedJob?.driverName || "คนขับรถ",
      recordedAt: new Date().toISOString(),
    };

    addFuelingRecord(selectedJobId, newRecord);
    
    // Reset form
    setStationName("");
    setQuantity("");
    setAmount("");
    setOdometer("");
    setNotes("");
    setPhoto(null);
    
    alert("บันทึกการเติมน้ำมันสำเร็จ");
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      <div className="px-4">
        <h1 className="text-2xl font-bold text-app font-display">บันทึกเติมน้ำมัน (คนขับ)</h1>
        <p className="text-muted text-sm mt-1">กรุณากรอกข้อมูลการเติมน้ำมันรถระหว่างทาง</p>
      </div>

      <div className="px-4 space-y-4">
        {/* Step 1: Select Trip */}
        <section className="space-y-2">
          <label className="text-sm font-medium text-app flex items-center gap-2">
            <Truck className="w-4 h-4 text-ptt-blue" />
            เลือกรอบส่งน้ำมัน
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
          >
            <option value="">-- เลือกรอบที่กำลังดำเนินการ --</option>
            {activeJobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.transportNo} ({job.status})
              </option>
            ))}
          </select>
          {selectedJob && (
            <div className="p-3 rounded-xl bg-ptt-blue/10 border border-ptt-blue/20 text-xs text-ptt-blue/80">
              จดบันทึกสำหรับ: {selectedJob.truckPlateNumber} • {selectedJob.driverName}
            </div>
          )}
        </section>

        {/* Step 2: Fueling Details */}
        <ChartCard title="ข้อมูลการเติมน้ำมัน" icon={Droplet}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted">ชื่อปั๊มที่เติม</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  placeholder="เช่น ปตท. สาขาสระบุรี"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-app text-app placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-muted">ชนิดน้ำมัน</label>
                <select
                  value={oilType}
                  onChange={(e) => setOilType(e.target.value as OilType)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                >
                  {OIL_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted">เลขไมล์ตอนเติม</label>
                <div className="relative">
                  <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(Number(e.target.value) || "")}
                    placeholder="เลขไมล์"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-app text-app placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-muted">จำนวนลิตร</label>
                <div className="relative">
                  <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value) || "")}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-app text-app placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted">จำนวนเงิน (บาท)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || "")}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-app text-app placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted">หลักฐานการเติม (รูปใบเสร็จ)</label>
              {photo ? (
                <div className="relative rounded-2xl overflow-hidden border border-app group">
                  <img src={photo} alt="Receipt" className="w-full h-40 object-cover" />
                  <button 
                    onClick={() => setPhoto(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <AlertCircle className="w-4 h-4 rotate-45" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handlePhotoUpload}
                  className="w-full h-32 border-2 border-dashed border-app rounded-2xl flex flex-col items-center justify-center gap-2 text-muted hover:border-ptt-blue/40 hover:text-ptt-blue transition-all"
                >
                  <Camera className="w-8 h-8" />
                  <span className="text-sm">กดเพื่อถ่ายภาะใบเสร็จ</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted">หมายเหตุ (ถ้ามี)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ระบุรายละเอียดเพิ่มเติม..."
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-app text-app placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ptt-blue/30 min-h-[80px]"
              />
            </div>
          </div>
        </ChartCard>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-ptt-blue to-ptt-cyan text-white py-4 rounded-2xl font-bold shadow-lg shadow-ptt-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          บันทึกข้อมูลการเติมน้ำมัน
        </button>

        {/* Recent History for this Trip */}
        {selectedJob && (selectedJob.fuelingRecords?.length ?? 0) > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-semibold text-app flex items-center gap-2 px-1">
              <History className="w-4 h-4 text-ptt-blue" />
              ประวัติการเติมน้ำมันรอบนี้
            </h3>
            <div className="space-y-3">
              {selectedJob.fuelingRecords?.map((record) => (
                <div key={record.id} className="p-4 rounded-2xl border border-app bg-white/5 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-app font-medium">{record.stationName}</div>
                    <div className="text-xs text-muted flex items-center gap-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {record.fuelingDate}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {record.fuelingTime}</span>
                    </div>
                    <div className="text-sm text-ptt-blue font-semibold mt-1">
                      {record.oilType} • {record.quantity.toLocaleString()} ลิตร • {record.amount.toLocaleString()} ฿
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted/30" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
