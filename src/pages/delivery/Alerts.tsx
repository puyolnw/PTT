import { useMemo } from "react";
import { AlertTriangle, Truck, FileText } from "lucide-react";
import ChartCard from "@/components/ChartCard";
import StatusTag from "@/components/StatusTag";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import { loadPurchaseOrders, loadTrips } from "@/pages/delivery/_storage";

export default function DeliveryAlerts() {
  const { branches } = useGasStation();
  const { selectedBranches } = useBranch();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

  const allTrips = useMemo(() => loadTrips(), []);
  const allPos = useMemo(() => loadPurchaseOrders(), []);

  const trips = useMemo(() => {
    return allTrips.filter(t => selectedBranchIds.length === 0 || selectedBranchIds.includes(t.branchId));
  }, [allTrips, selectedBranchIds]);

  const pos = useMemo(() => {
    return allPos.filter(p => selectedBranchIds.length === 0 || selectedBranchIds.includes(p.branchId));
  }, [allPos, selectedBranchIds]);

  const odometerIssues = trips.filter((t) => {
    if (!t.startOdometer || !t.endOdometer) return false;
    return t.endOdometer <= t.startOdometer;
  });

  const missingInvoicePhoto = trips.filter((t) => t.status !== "สร้างออเดอร์แล้ว" && !t.invoicePhotoName);

  const poPending = pos.filter((p) => p.status === "รอรับของ" || p.status === "รอตรวจสอบ");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-app font-display">แจ้งเตือน/ผิดปกติ</h1>
          <p className="text-muted mt-1">
            ตามเอกสาร: แจ้งเตือนเลขไมล์ผิดปกติ และตรวจงานที่ข้อมูลไม่ครบ (เช่น ไม่มีรูปแนบ) เพื่อป้องกันความคลาดเคลื่อน
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
          </span>
        </div>
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


