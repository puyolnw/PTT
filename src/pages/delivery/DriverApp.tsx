import { useEffect, useMemo, useState } from "react";
import { Camera, CheckCircle, Truck, FileText, AlertTriangle } from "lucide-react";
import ChartCard from "@/components/ChartCard";
import StatusTag from "@/components/StatusTag";
import { DeliveryTrip, loadTrips, saveTrips } from "@/pages/delivery/_storage";
import { validateEndOdometer, validateStartOdometer } from "@/utils/odometerValidation";

export default function DriverApp() {
  const [trips, setTrips] = useState<DeliveryTrip[]>([]);
  const [tripId, setTripId] = useState("");

  const [startPhotoName, setStartPhotoName] = useState<string | undefined>();
  const [startOdo, setStartOdo] = useState<number>(0);

  const [invoicePhotoName, setInvoicePhotoName] = useState<string | undefined>();

  const [endPhotoName, setEndPhotoName] = useState<string | undefined>();
  const [endOdo, setEndOdo] = useState<number>(0);

  useEffect(() => {
    setTrips(loadTrips());
  }, []);

  const selected = useMemo(() => trips.find((t) => t.id === tripId), [trips, tripId]);
  const lastOdo = useMemo(() => {
    const ended = trips
      .filter((t) => typeof t.endOdometer === "number")
      .sort((a, b) => (b.endOdometer || 0) - (a.endOdometer || 0));
    return ended[0]?.endOdometer;
  }, [trips]);

  const updateTrip = (patch: Partial<DeliveryTrip>) => {
    const updated = trips.map((t) => (t.id === tripId ? { ...t, ...patch } : t));
    setTrips(updated);
    saveTrips(updated);
  };

  const canStart = !!selected && !!startPhotoName && Number(startOdo || 0) > 0;
  const canReceive = !!selected && !!invoicePhotoName;
  const canComplete = !!selected && !!endPhotoName && Number(endOdo || 0) > 0;

  const startTrip = () => {
    if (!selected) return;
    const odoCheck = validateStartOdometer(Number(startOdo || 0), lastOdo);
    if (!odoCheck.valid) return alert(odoCheck.error);
    updateTrip({
      status: "รถออกเดินทาง",
      startOdometer: Number(startOdo || 0),
      startOdometerPhotoName: startPhotoName,
    });
    alert("บันทึกสถานะ: รถออกเดินทาง");
  };

  const receiveAtDepot = () => {
    if (!selected) return;
    updateTrip({
      status: "กำลังรับน้ำมันที่คลัง",
      invoicePhotoName,
    });
    alert("บันทึกสถานะ: กำลังรับน้ำมันที่คลัง");
  };

  const headToStation = () => {
    if (!selected) return;
    updateTrip({ status: "กำลังมุ่งหน้าไปยังสาขา" });
    alert("บันทึกสถานะ: กำลังมุ่งหน้าไปยังสาขา");
  };

  const completeTrip = () => {
    if (!selected) return;
    const endCheck = validateEndOdometer(Number(endOdo || 0), Number(selected.startOdometer || 0));
    if (!endCheck.valid) return alert(endCheck.error);
    updateTrip({
      status: "ส่งมอบสำเร็จ",
      endOdometer: Number(endOdo || 0),
      endOdometerPhotoName: endPhotoName,
    });
    alert("บันทึกสถานะ: ส่งมอบสำเร็จ");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-app font-display">แอปคนขับ (Mobile Flow)</h1>
        <p className="text-muted mt-1">
          ตามเอกสาร: บังคับแนบรูปเลขไมล์/รูปใบ Invoice ก่อนกด “ยืนยัน” เพื่อความถูกต้องของข้อมูล (Data Integrity)
        </p>
      </div>

      <ChartCard title="เลือกเที่ยวขนส่ง" icon={Truck}>
        <div className="space-y-3">
          <select
            value={tripId}
            onChange={(e) => {
              setTripId(e.target.value);
              setStartPhotoName(undefined);
              setInvoicePhotoName(undefined);
              setEndPhotoName(undefined);
              setStartOdo(0);
              setEndOdo(0);
            }}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
          >
            <option value="">-- เลือก Trip --</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} • {t.driverName} • {t.status}
              </option>
            ))}
          </select>

          {selected ? (
            <div className="p-4 rounded-2xl border border-app bg-white/5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-app font-medium truncate">Trip: {selected.id}</div>
                <div className="text-sm text-muted truncate">
                  รถหัว: {selected.truckHeadPlate} • หาง: {selected.trailerPlate}
                </div>
              </div>
              <StatusTag variant="primary">{selected.status}</StatusTag>
            </div>
          ) : (
            <div className="text-muted">เลือก Trip เพื่อเริ่มทำรายการ</div>
          )}
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="ขั้นตอน 1: ออกเดินทาง" subtitle="บังคับถ่ายรูปเลขไมล์ + กรอกเลขไมล์เริ่มต้น" icon={Camera}>
          <div className="space-y-3">
            <label className="p-4 rounded-2xl border border-app bg-white/5 hover:border-ptt-blue/30 transition cursor-pointer">
              <div className="text-sm text-app font-medium flex items-center gap-2">
                <Camera className="w-4 h-4" />
                แนบรูปเลขไมล์เริ่มต้น
              </div>
              <input className="hidden" type="file" accept="image/*" onChange={(e) => setStartPhotoName(e.target.files?.[0]?.name)} />
              <div className="text-sm text-app mt-2 truncate">{startPhotoName ? startPhotoName : "ยังไม่ได้เลือกไฟล์"}</div>
            </label>

            <label className="space-y-1">
              <div className="text-sm text-muted">เลขไมล์เริ่มต้น</div>
              <input
                type="number"
                min={0}
                value={startOdo}
                onChange={(e) => setStartOdo(Number(e.target.value || 0))}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
              />
              <div className="text-xs text-muted">เลขไมล์ล่าสุดในระบบ (เพื่อเช็คผิดปกติ): {lastOdo ? lastOdo.toLocaleString() : "-"}</div>
            </label>

            <button
              disabled={!canStart || !selected}
              onClick={startTrip}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition ${
                canStart && selected ? "bg-ptt-blue text-white hover:brightness-110" : "bg-white/5 text-muted border border-app cursor-not-allowed"
              }`}
              title={!canStart ? "ต้องแนบรูปและกรอกเลขไมล์ก่อน" : undefined}
            >
              <CheckCircle className="w-4 h-4" />
              ออกเดินทาง
            </button>
          </div>
        </ChartCard>

        <ChartCard title="ขั้นตอน 2: รับน้ำมันที่คลัง" subtitle="บังคับถ่ายรูปใบ Invoice แล้วส่งสถานะให้ส่วนกลาง" icon={FileText}>
          <div className="space-y-3">
            <label className="p-4 rounded-2xl border border-app bg-white/5 hover:border-ptt-blue/30 transition cursor-pointer">
              <div className="text-sm text-app font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                แนบรูปใบ Invoice จากคลัง
              </div>
              <input className="hidden" type="file" accept="image/*" onChange={(e) => setInvoicePhotoName(e.target.files?.[0]?.name)} />
              <div className="text-sm text-app mt-2 truncate">{invoicePhotoName ? invoicePhotoName : "ยังไม่ได้เลือกไฟล์"}</div>
            </label>

            <button
              disabled={!canReceive || !selected}
              onClick={receiveAtDepot}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition ${
                canReceive && selected ? "bg-ptt-blue text-white hover:brightness-110" : "bg-white/5 text-muted border border-app cursor-not-allowed"
              }`}
              title={!canReceive ? "ต้องแนบรูปใบ Invoice ก่อน" : undefined}
            >
              <CheckCircle className="w-4 h-4" />
              รับน้ำมันสำเร็จ
            </button>

            <button
              disabled={!selected}
              onClick={headToStation}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition ${
                selected ? "bg-white/5 text-app border border-app hover:border-ptt-blue/30" : "bg-white/5 text-muted border border-app cursor-not-allowed"
              }`}
            >
              <Truck className="w-4 h-4" />
              มุ่งหน้าไปยังสาขา
            </button>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="ขั้นตอน 3: ส่งมอบสำเร็จ" subtitle="แนบรูปเลขไมล์ปลายทาง + เลขไมล์สิ้นสุด" icon={AlertTriangle}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="p-4 rounded-2xl border border-app bg-white/5 hover:border-ptt-blue/30 transition cursor-pointer">
              <div className="text-sm text-app font-medium flex items-center gap-2">
                <Camera className="w-4 h-4" />
                แนบรูปเลขไมล์สิ้นสุด
              </div>
              <input className="hidden" type="file" accept="image/*" onChange={(e) => setEndPhotoName(e.target.files?.[0]?.name)} />
              <div className="text-sm text-app mt-2 truncate">{endPhotoName ? endPhotoName : "ยังไม่ได้เลือกไฟล์"}</div>
            </label>

            <label className="space-y-1">
              <div className="text-sm text-muted">เลขไมล์สิ้นสุด</div>
              <input
                type="number"
                min={0}
                value={endOdo}
                onChange={(e) => setEndOdo(Number(e.target.value || 0))}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
              />
              <div className="text-xs text-muted">
                ระบบจะ validate: ไมล์สิ้นสุดต้องมากกว่าไมล์เริ่มต้น (ตามเอกสาร “แจ้งเตือนเลขไมล์ผิดปกติ”)
              </div>
            </label>
          </div>

          <div className="space-y-3">
            {selected ? (
              <div className="p-4 rounded-2xl border border-app bg-white/5">
                <div className="text-sm text-muted">เลขไมล์เริ่มต้นของ Trip นี้</div>
                <div className="text-2xl font-bold text-app font-display mt-1">
                  {(selected.startOdometer || 0).toLocaleString()} กม.
                </div>
                <div className="text-xs text-muted mt-2">
                  ถ้าเลขไมล์เริ่มต้น &lt; เลขไมล์สิ้นสุดของงานก่อนหน้า ระบบจะเตือน (ในหน้านี้ใช้ validation เดียวกัน)
                </div>
              </div>
            ) : (
              <div className="text-muted">เลือก Trip ก่อน</div>
            )}

            <button
              disabled={!canComplete || !selected}
              onClick={completeTrip}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition ${
                canComplete && selected ? "bg-ptt-blue text-white hover:brightness-110" : "bg-white/5 text-muted border border-app cursor-not-allowed"
              }`}
              title={!canComplete ? "ต้องแนบรูปและกรอกเลขไมล์ก่อน" : undefined}
            >
              <CheckCircle className="w-4 h-4" />
              ส่งมอบน้ำมันสำเร็จ
            </button>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Offline Mode (แนวคิด)" subtitle="เอกสารระบุว่าบางคลังสัญญาณไม่ดี ควร sync เมื่อกลับมาออนไลน์" icon={AlertTriangle}>
        <div className="text-sm text-app">
          ตอนนี้เป็น UI โครง: เก็บข้อมูลใน LocalStorage (เหมือน offline-first) และสามารถต่อยอดเป็น Sync service ได้
        </div>
      </ChartCard>
    </div>
  );
}


