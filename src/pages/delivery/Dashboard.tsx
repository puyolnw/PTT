import { useMemo } from "react";
import { Truck, FileText, AlertTriangle, Gauge, BarChart3 } from "lucide-react";
import SummaryStats from "@/components/SummaryStats";
import ChartCard from "@/components/ChartCard";
import StatusTag from "@/components/StatusTag";
import { loadPurchaseOrders, loadTrips } from "@/pages/delivery/_storage";

export default function DeliveryDashboard() {
  const { pos, trips } = useMemo(() => {
    return {
      pos: loadPurchaseOrders(),
      trips: loadTrips(),
    };
  }, []);

  const poWaiting = pos.filter((p) => p.status === "รอรับของ").length;
  const tripsInProgress = trips.filter((t) => t.status !== "ส่งมอบสำเร็จ").length;

  const odometerAlerts = trips.filter((t) => {
    if (!t.startOdometer || !t.endOdometer) return false;
    return t.endOdometer <= t.startOdometer;
  }).length;

  const stats = [
    {
      label: "PO รอรับของ",
      value: poWaiting,
      icon: FileText,
      color: "from-amber-400 to-orange-500",
    },
    {
      label: "เที่ยวขนส่งที่กำลังดำเนินการ",
      value: tripsInProgress,
      icon: Truck,
      color: "from-ptt-blue to-ptt-cyan",
    },
    {
      label: "แจ้งเตือนเลขไมล์ผิดปกติ",
      value: odometerAlerts,
      icon: AlertTriangle,
      color: "from-red-500 to-rose-500",
    },
    {
      label: "ข้อมูลประสิทธิภาพ (พร้อมคำนวณ)",
      value: trips.filter((t) => typeof t.fueledLiters === "number" && !!t.endOdometer).length,
      icon: Gauge,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const timeline = [
    "สร้างออเดอร์แล้ว",
    "รถออกเดินทาง",
    "กำลังรับน้ำมันที่คลัง",
    "กำลังมุ่งหน้าไปยังสาขา",
    "ส่งมอบสำเร็จ",
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-app font-display">ระบบ Delivery</h1>
          <p className="text-muted mt-1">
            โฟลว์ตามเอกสาร: PO/Invoice แนบไฟล์ → สร้างเที่ยวขนส่ง → กระจายปริมาณ → ติดตามสถานะ/คนขับ → รายงาน/แจ้งเตือน
          </p>
        </div>
      </div>

      <SummaryStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="สถานะเที่ยวขนส่ง (สไตล์ Tracking)"
          subtitle="สร้างออเดอร์แล้ว → รถออกเดินทาง → รับน้ำมัน → มุ่งหน้าสาขา → ส่งมอบสำเร็จ"
          icon={Truck}
        >
          <div className="space-y-3">
            {trips.length === 0 ? (
              <div className="text-muted">ยังไม่มีข้อมูลเที่ยวขนส่ง (ลองไปที่ “สร้างเที่ยวขนส่ง”)</div>
            ) : (
              trips
                .slice()
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .slice(0, 6)
                .map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-app bg-white/5">
                    <div className="min-w-0">
                      <div className="text-app font-medium truncate">Trip: {t.id.slice(0, 12)}…</div>
                      <div className="text-sm text-muted truncate">คนขับ: {t.driverName} • PO: {t.poId.slice(0, 10)}…</div>
                    </div>
                    <StatusTag variant="primary">{t.status}</StatusTag>
                  </div>
                ))
            )}
          </div>
        </ChartCard>

        <ChartCard title="เช็กลิสต์สิ่งที่ระบบรองรับตามเอกสาร" subtitle="ทำเป็นหน้า UI พร้อม LocalStorage (ยังไม่เชื่อม backend)" icon={BarChart3}>
          <div className="space-y-2 text-sm">
            {[
              "บันทึก PO: Approve No. + Invoice No. + ชนิดน้ำมัน/ลิตร",
              "แนบไฟล์ PDF: Invoice (e-Tax) และ Receipt",
              "สร้างเที่ยวขนส่ง: เลือก PO + รถหัว/หาง + คนขับ + เลขไมล์เริ่มต้น",
              "Volume Allocation: 1 เที่ยวส่งได้หลายสถานี + Check Balance",
              "Driver App: บังคับแนบรูปเลขไมล์/ใบ Invoice ตามขั้นตอน",
              "Fuel Efficiency: สูตร (ไมล์จบ-ไมล์เริ่ม)/ลิตรที่เติมรถ",
              "Alerts: แจ้งเตือนเลขไมล์ผิดปกติ/งานค้างถัง (placeholder)",
            ].map((x) => (
              <div key={x} className="flex items-start gap-2">
                <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-ptt-cyan" />
                <span className="text-app">{x}</span>
              </div>
            ))}
            <div className="pt-3">
              <div className="text-xs text-muted">
                หมายเหตุ: สถานะมาตรฐานในระบบนี้ใช้ชุดเดียวกับเอกสาร: {timeline.join(" → ")}
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}


