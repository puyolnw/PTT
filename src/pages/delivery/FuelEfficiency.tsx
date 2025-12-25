import { useEffect, useMemo, useState } from "react";
import { BarChart3, Gauge, Save, AlertTriangle } from "lucide-react";
import ChartCard from "@/components/ChartCard";
import StatusTag from "@/components/StatusTag";
import { DeliveryTrip, loadTrips, saveTrips } from "@/pages/delivery/_storage";
import { validateEndOdometer } from "@/utils/odometerValidation";

export default function FuelEfficiency() {
  const [trips, setTrips] = useState<DeliveryTrip[]>([]);
  const [tripId, setTripId] = useState("");
  const [fueledLiters, setFueledLiters] = useState<number>(0);

  useEffect(() => {
    setTrips(loadTrips());
  }, []);

  const selected = useMemo(() => trips.find((t) => t.id === tripId), [trips, tripId]);

  const calc = useMemo(() => {
    if (!selected?.startOdometer || !selected?.endOdometer) return null;
    if (!fueledLiters || fueledLiters <= 0) return null;
    const km = selected.endOdometer - selected.startOdometer;
    return { km, kmPerLiter: km / fueledLiters };
  }, [selected, fueledLiters]);

  const saveFuel = () => {
    if (!selected) return;
    if (!selected.startOdometer || !selected.endOdometer) return alert("กรุณามีเลขไมล์เริ่มต้น/สิ้นสุดก่อน (ไปที่แอปคนขับ)");
    const endCheck = validateEndOdometer(selected.endOdometer, selected.startOdometer);
    if (!endCheck.valid) return alert(endCheck.error);
    if (!fueledLiters || fueledLiters <= 0) return alert("กรุณากรอกจำนวนลิตรที่เติมเข้ารถ");

    const updated = trips.map((t) => (t.id === tripId ? { ...t, fueledLiters } : t));
    setTrips(updated);
    saveTrips(updated);
    alert("บันทึกข้อมูล Fueling สำเร็จ");
  };

  const anomalies = useMemo(() => {
    return trips
      .filter((t) => t.startOdometer && t.endOdometer && t.endOdometer <= t.startOdometer)
      .map((t) => t.id);
  }, [trips]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-app font-display">ประสิทธิภาพเชื้อเพลิง (Fuel Efficiency)</h1>
        <p className="text-muted mt-1">
          สูตรตามเอกสาร: (เลขไมล์สิ้นสุด - เลขไมล์เริ่มต้น) / จำนวนน้ำมันที่เติมเข้ารถ = อัตราสิ้นเปลือง (กม./ลิตร)
        </p>
      </div>

      <ChartCard title="เลือก Trip และบันทึกการเติมน้ำมันรถ" icon={Gauge}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <select
              value={tripId}
              onChange={(e) => {
                setTripId(e.target.value);
                const t = trips.find((x) => x.id === e.target.value);
                setFueledLiters(typeof t?.fueledLiters === "number" ? t!.fueledLiters! : 0);
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
                  <div className="text-app font-medium truncate">คนขับ: {selected.driverName}</div>
                  <div className="text-sm text-muted truncate">
                    ไมล์: {(selected.startOdometer || 0).toLocaleString()} → {(selected.endOdometer || 0).toLocaleString()}
                  </div>
                </div>
                <StatusTag variant="primary">{selected.status}</StatusTag>
              </div>
            ) : (
              <div className="text-muted">เลือก Trip ก่อน</div>
            )}

            <label className="space-y-1">
              <div className="text-sm text-muted">ลิตรที่เติมเข้ารถ (Fleet Fueling)</div>
              <input
                type="number"
                min={0}
                value={fueledLiters}
                onChange={(e) => setFueledLiters(Number(e.target.value || 0))}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
              />
            </label>

            <button
              onClick={saveFuel}
              disabled={!selected}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl transition ${
                selected ? "bg-ptt-blue text-white hover:brightness-110" : "bg-white/5 text-muted border border-app cursor-not-allowed"
              }`}
            >
              <Save className="w-4 h-4" />
              บันทึกข้อมูลการเติมน้ำมันรถ
            </button>
          </div>

          <div className="space-y-3">
            <ChartCard title="ผลคำนวณ" icon={BarChart3}>
              {calc ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted">ระยะทาง</div>
                  <div className="text-3xl font-bold text-app font-display">{calc.km.toLocaleString()} กม.</div>
                  <div className="text-sm text-muted mt-3">อัตราสิ้นเปลือง</div>
                  <div className="text-3xl font-bold text-app font-display">
                    {calc.kmPerLiter.toFixed(2)} กม./ลิตร
                  </div>
                </div>
              ) : (
                <div className="text-muted">กรอกข้อมูลให้ครบ (ไมล์เริ่ม/จบ + ลิตรที่เติม) เพื่อแสดงผล</div>
              )}
            </ChartCard>

            {anomalies.length > 0 && (
              <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10">
                <div className="text-app font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  พบ Trip เลขไมล์ผิดปกติ
                </div>
                <div className="text-xs text-muted mt-1">
                  {anomalies.slice(0, 6).join(", ")}
                  {anomalies.length > 6 ? "…" : ""}
                </div>
              </div>
            )}
          </div>
        </div>
      </ChartCard>
    </div>
  );
}


