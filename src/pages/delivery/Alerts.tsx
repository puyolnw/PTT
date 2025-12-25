import { useMemo } from "react";
import { AlertTriangle, Truck, FileText } from "lucide-react";
import ChartCard from "@/components/ChartCard";
import StatusTag from "@/components/StatusTag";
import { loadPurchaseOrders, loadTrips } from "@/pages/delivery/_storage";

export default function DeliveryAlerts() {
  const trips = useMemo(() => loadTrips(), []);
  const pos = useMemo(() => loadPurchaseOrders(), []);

  const odometerIssues = trips.filter((t) => {
    if (!t.startOdometer || !t.endOdometer) return false;
    return t.endOdometer <= t.startOdometer;
  });

  const missingInvoicePhoto = trips.filter((t) => t.status !== "สร้างออเดอร์แล้ว" && !t.invoicePhotoName);

  const poPending = pos.filter((p) => p.status === "รอรับของ" || p.status === "รอตรวจสอบ");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-app font-display">แจ้งเตือน/ผิดปกติ</h1>
        <p className="text-muted mt-1">
          ตามเอกสาร: แจ้งเตือนเลขไมล์ผิดปกติ และตรวจงานที่ข้อมูลไม่ครบ (เช่น ไม่มีรูปแนบ) เพื่อป้องกันความคลาดเคลื่อน
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="เลขไมล์ผิดปกติ" subtitle="ไมล์สิ้นสุด ≤ ไมล์เริ่มต้น" icon={AlertTriangle}>
          {odometerIssues.length === 0 ? (
            <div className="text-muted">ไม่พบ</div>
          ) : (
            <div className="space-y-3">
              {odometerIssues.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl border border-app bg-white/5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-app font-medium truncate">{t.id}</div>
                    <div className="text-sm text-muted truncate">
                      {t.startOdometer?.toLocaleString()} → {t.endOdometer?.toLocaleString()}
                    </div>
                  </div>
                  <StatusTag variant="danger">ตรวจสอบด่วน</StatusTag>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Trip ขาดรูปใบ Invoice" subtitle="หลังเริ่มงานควรมีรูปใบ Invoice จากคลัง" icon={Truck}>
          {missingInvoicePhoto.length === 0 ? (
            <div className="text-muted">ไม่พบ</div>
          ) : (
            <div className="space-y-3">
              {missingInvoicePhoto.map((t) => (
                <div key={t.id} className="p-4 rounded-2xl border border-app bg-white/5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-app font-medium truncate">{t.id}</div>
                    <div className="text-sm text-muted truncate">สถานะ: {t.status}</div>
                  </div>
                  <StatusTag variant="warning">รอแนบรูป</StatusTag>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard title="PO ที่ยังรอรับ/รอตรวจสอบ" subtitle="เช็คสถานะการดำเนินงานจากส่วนกลาง" icon={FileText}>
        {poPending.length === 0 ? (
          <div className="text-muted">ไม่พบ</div>
        ) : (
          <div className="space-y-3">
            {poPending.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl border border-app bg-white/5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-app font-medium truncate">
                    {p.approveNo} / {p.invoiceNo}
                  </div>
                  <div className="text-sm text-muted truncate">
                    {p.items.map((i) => `${i.product} ${i.liters.toLocaleString()}L`).join(", ")}
                  </div>
                </div>
                <StatusTag variant="warning">{p.status}</StatusTag>
              </div>
            ))}
          </div>
        )}
      </ChartCard>
    </div>
  );
}


