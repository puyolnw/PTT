import { useMemo, useState } from "react";
import { Droplet, Search, Truck } from "lucide-react";
import ChartCard from "@/components/ChartCard";
import { useGasStation } from "@/contexts/GasStationContext";
import type { DriverJob, PurchaseOrder } from "@/types/gasStation";

type TypeFilter = "all" | "external" | "internal";
type StatusFilter = "all" | "active" | "completed";

function TypeBadge({ orderType }: { orderType: "internal" | "external" }) {
  const isExternal = orderType === "external";
  const cls = isExternal
    ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
    : "bg-purple-500/15 text-purple-300 border-purple-500/30";
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {isExternal ? "รับจากคลังน้ำมัน" : "ภายในปั๊ม"}
    </span>
  );
}

function JobStatusBadge({ status }: { status: DriverJob["status"] }) {
  const cls =
    status === "ส่งเสร็จ"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : status === "กำลังส่ง"
        ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
        : status === "จัดเรียงเส้นทางแล้ว"
          ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
          : status === "รับน้ำมันแล้ว"
            ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
            : "bg-white/5 text-muted border-app";
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {status}
    </span>
  );
}

function BranchStatusBadge({ status }: { status: DriverJob["destinationBranches"][0]["status"] }) {
  const cls =
    status === "ส่งแล้ว"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : status === "กำลังส่ง"
        ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
        : "bg-white/5 text-muted border-app";
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {status}
    </span>
  );
}

type RemainingRow = {
  jobId: string;
  transportNo: string;
  transportDate: string;
  transportTime: string;
  jobStatus: DriverJob["status"];
  orderType: "internal" | "external";
  truckPlateNumber: string;
  trailerPlateNumber: string;
  purchaseOrderNo?: string;
  internalOrderNo?: string;
  poMeta?: Pick<PurchaseOrder, "orderNo" | "approveNo" | "contractNo" | "billNo">;
  branchId: number;
  branchName: string;
  oilType: DriverJob["destinationBranches"][0]["oilType"];
  plannedQty: number;
  remainingQty: number;
  branchStatus: DriverJob["destinationBranches"][0]["status"];
  sortTimeMs: number;
};

function toSortTimeMs(job: DriverJob) {
  const dt = `${job.transportDate}T${job.transportTime}:00`;
  const ms = new Date(dt).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

export default function RemainingOnTruck() {
  const { driverJobs, purchaseOrders } = useGasStation();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [showZero, setShowZero] = useState(false);

  const poByOrderNo = useMemo(() => {
    const m = new Map<string, PurchaseOrder>();
    purchaseOrders.forEach((po) => m.set(po.orderNo, po));
    return m;
  }, [purchaseOrders]);

  const rows = useMemo(() => {
    const all: RemainingRow[] = [];
    driverJobs.forEach((job) => {
      const orderType: "internal" | "external" =
        job.orderType ?? (job.purchaseOrderNo ? "external" : "internal");
      const po = orderType === "external" && job.purchaseOrderNo ? poByOrderNo.get(job.purchaseOrderNo) : undefined;

      const compSumByBranch = new Map<number, number>();
      job.compartments?.forEach((c) => {
        if (c.destinationBranchId !== undefined && c.quantity !== undefined) {
          compSumByBranch.set(c.destinationBranchId, (compSumByBranch.get(c.destinationBranchId) || 0) + c.quantity);
        }
      });

      const sortTimeMs = toSortTimeMs(job);
      job.destinationBranches.forEach((b) => {
        const plannedFromCompartments = compSumByBranch.get(b.branchId) || 0;
        const plannedQty = plannedFromCompartments > 0 ? plannedFromCompartments : b.quantity;
        const remainingQty = b.status === "ส่งแล้ว" ? 0 : plannedQty;

        all.push({
          jobId: job.id,
          transportNo: job.transportNo,
          transportDate: job.transportDate,
          transportTime: job.transportTime,
          jobStatus: job.status,
          orderType,
          truckPlateNumber: job.truckPlateNumber,
          trailerPlateNumber: job.trailerPlateNumber,
          purchaseOrderNo: job.purchaseOrderNo,
          internalOrderNo: job.internalOrderNo,
          poMeta: po
            ? { orderNo: po.orderNo, approveNo: po.approveNo, contractNo: po.contractNo, billNo: po.billNo }
            : undefined,
          branchId: b.branchId,
          branchName: b.branchName,
          oilType: b.oilType,
          plannedQty,
          remainingQty,
          branchStatus: b.status,
          sortTimeMs,
        });
      });
    });
    return all;
  }, [driverJobs, poByOrderNo]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => {
        if (!showZero && r.remainingQty <= 0) return false;
        if (typeFilter !== "all" && r.orderType !== typeFilter) return false;
        if (statusFilter === "active" && r.jobStatus === "ส่งเสร็จ") return false;
        if (statusFilter === "completed" && r.jobStatus !== "ส่งเสร็จ") return false;
        if (!q) return true;

        const poText = r.poMeta?.orderNo || r.purchaseOrderNo || "";
        const approveText = r.poMeta?.approveNo || "";
        const contractText = r.poMeta?.contractNo || "";
        const billText = r.poMeta?.billNo || "";
        const internalText = r.internalOrderNo || "";
        return (
          r.transportNo.toLowerCase().includes(q) ||
          r.truckPlateNumber.toLowerCase().includes(q) ||
          r.trailerPlateNumber.toLowerCase().includes(q) ||
          r.branchName.toLowerCase().includes(q) ||
          poText.toLowerCase().includes(q) ||
          approveText.toLowerCase().includes(q) ||
          contractText.toLowerCase().includes(q) ||
          billText.toLowerCase().includes(q) ||
          internalText.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Active first, then newest first
        const aActive = a.jobStatus !== "ส่งเสร็จ";
        const bActive = b.jobStatus !== "ส่งเสร็จ";
        if (aActive !== bActive) return aActive ? -1 : 1;
        return b.sortTimeMs - a.sortTimeMs;
      });
  }, [rows, search, typeFilter, statusFilter, showZero]);

  const summary = useMemo(() => {
    const activeJobs = new Set<string>();
    let totalRemaining = 0;
    filtered.forEach((r) => {
      if (r.jobStatus !== "ส่งเสร็จ") activeJobs.add(r.jobId);
      totalRemaining += r.remainingQty;
    });
    return { activeJobsCount: activeJobs.size, totalRemaining };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="min-w-0">
          <div className="text-app text-2xl font-bold">น้ำมันที่เหลือบนรถ</div>
          <div className="text-sm text-muted">
            แสดงตาม รถ/หาง/รอบส่ง/ใบสั่งซื้อ/ประเภท/สาขา • คงเหลือรวม:{" "}
            <span className="text-app font-semibold">{summary.totalRemaining.toLocaleString()} ลิตร</span>
            {statusFilter !== "completed" && (
              <>
                {" "}
                • รถที่มีงานคงเหลือ: <span className="text-app font-semibold">{summary.activeJobsCount}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <ChartCard
        title="รายการน้ำมันคงเหลือ (ต่อสาขาปลายทาง)"
        subtitle="คำนวณจากสาขาที่ยังไม่ส่งแล้ว (อิงปริมาณตามแผนในหลุมรถ/สาขา)"
        icon={Droplet}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา: รอบส่ง / ทะเบียนรถ / สาขา / PO / เลขอนุมัติ / Contract / Bill"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            >
              <option value="all">ทุกประเภท</option>
              <option value="external">รับจากคลังน้ำมัน</option>
              <option value="internal">ภายในปั๊ม</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            >
              <option value="all">ทุกสถานะรอบ</option>
              <option value="active">กำลังดำเนินการ</option>
              <option value="completed">ส่งเสร็จ</option>
            </select>

            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-app text-sm text-app select-none">
              <input
                type="checkbox"
                checked={showZero}
                onChange={(e) => setShowZero(e.target.checked)}
                className="accent-[var(--accent)]"
              />
              แสดงรายการคงเหลือ 0
            </label>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-sm text-muted">ไม่พบรายการ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-app">
                  <th className="text-left py-2 pr-3 whitespace-nowrap">รถ / หาง</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">รอบส่ง</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">บิลสั่งซื้อ</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">ประเภท</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">สาขาปลายทาง</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">ชนิดน้ำมัน</th>
                  <th className="text-right py-2 pr-3 whitespace-nowrap">ปริมาณแผน (ลิตร)</th>
                  <th className="text-right py-2 pr-3 whitespace-nowrap">คงเหลือ (ลิตร)</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">สถานะรอบ</th>
                  <th className="text-left py-2 whitespace-nowrap">สถานะสาขา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filtered.map((r) => (
                  <tr key={`${r.jobId}-${r.branchId}-${r.oilType}`} className="hover:bg-white/5 transition">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-app font-semibold">
                        <Truck className="w-4 h-4 text-muted" />
                        <span>{r.truckPlateNumber}</span>
                        <span className="text-muted">/</span>
                        <span>{r.trailerPlateNumber}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <div className="text-app font-semibold">{r.transportNo}</div>
                      <div className="text-xs text-muted">
                        {r.transportDate} • {r.transportTime}
                      </div>
                    </td>
                    <td className="py-2 pr-3 min-w-[240px]">
                      {r.orderType === "external" ? (
                        <div className="space-y-0.5">
                          <div className="text-app font-semibold">
                            PO: {r.poMeta?.orderNo || r.purchaseOrderNo || "-"}
                          </div>
                          <div className="text-xs text-muted">
                            ใบอนุมัติขายเลขที่: {r.poMeta?.approveNo || "-"} • Contract No.:{" "}
                            {r.poMeta?.contractNo || "-"}
                          </div>
                          {r.poMeta?.billNo && <div className="text-xs text-muted">Bill: {r.poMeta.billNo}</div>}
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="text-app font-semibold">ออเดอร์ภายใน: {r.internalOrderNo || "-"}</div>
                          <div className="text-xs text-muted">—</div>
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <TypeBadge orderType={r.orderType} />
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <div className="text-app font-semibold">{r.branchName}</div>
                      <div className="text-xs text-muted">ID: {r.branchId}</div>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap text-app">{r.oilType}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-right text-app">
                      {r.plannedQty.toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap text-right">
                      <span className={r.remainingQty > 0 ? "text-app font-semibold" : "text-muted"}>
                        {r.remainingQty.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <JobStatusBadge status={r.jobStatus} />
                    </td>
                    <td className="py-2 whitespace-nowrap">
                      <BranchStatusBadge status={r.branchStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>
    </div>
  );
}


