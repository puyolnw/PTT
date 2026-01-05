import { useMemo, useState } from "react";
import { Droplet, Search, Truck, MoreHorizontal } from "lucide-react";

import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import type { DriverJob, PurchaseOrder } from "@/types/gasStation";

type TypeFilter = "all" | "external" | "internal";
type StatusFilter = "all" | "active" | "completed";

function TypeBadge({ orderType }: { orderType: "internal" | "external" }) {
  const isExternal = orderType === "external";
  const cls = isExternal
    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {isExternal ? "รับจากคลังน้ำมัน" : "ภายในปั๊ม"}
    </span>
  );
}

function JobStatusBadge({ status }: { status: DriverJob["status"] }) {
  const cls =
    status === "ส่งเสร็จ"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : status === "กำลังส่ง"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        : status === "จัดเรียงเส้นทางแล้ว"
          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
          : status === "รับน้ำมันแล้ว"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

function BranchStatusBadge({ status }: { status: DriverJob["destinationBranches"][0]["status"] }) {
  const cls =
    status === "ส่งแล้ว"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : status === "กำลังส่ง"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
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
  const { driverJobs, purchaseOrders, branches } = useGasStation();
  const { selectedBranches } = useBranch();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

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

        const matchBranch = selectedBranchIds.length === 0 || selectedBranchIds.includes(r.branchId);
        if (!matchBranch) return false;
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
  }, [rows, search, showZero, typeFilter, statusFilter, selectedBranchIds]);

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Droplet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                น้ำมันที่เหลือบนรถ
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                แสดงตาม รถ/หาง/รอบส่ง/ใบสั่งซื้อ/ประเภท/สาขา
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm mr-4">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
              </span>
            </div>

            <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">คงเหลือรวม</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{summary.totalRemaining.toLocaleString()} ลิตร</p>
              </div>
              {statusFilter !== "completed" && (
                <div className="text-right px-4 border-l border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">รถที่มีงาน</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{summary.activeJobsCount}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา: รอบส่ง / ทะเบียนรถ / สาขา / PO / เลขอนุมัติ..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">ทุกประเภท</option>
              <option value="external">รับจากคลังน้ำมัน</option>
              <option value="internal">ภายในปั๊ม</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">ทุกสถานะรอบ</option>
              <option value="active">กำลังดำเนินการ</option>
              <option value="completed">ส่งเสร็จ</option>
            </select>

            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <input
                type="checkbox"
                checked={showZero}
                onChange={(e) => setShowZero(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-500"
              />
              แสดงคงเหลือ 0
            </label>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p>ไม่พบรายการที่ค้นหา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">รถ / หาง</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">รอบส่ง</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">บิลสั่งซื้อ</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">ประเภท</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">สาขาปลายทาง</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">ชนิดน้ำมัน</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">ปริมาณแผน (ลิตร)</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">คงเหลือ (ลิตร)</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">สถานะรอบ</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">สถานะสาขา</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {filtered.map((r) => (
                  <tr key={`${r.jobId}-${r.branchId}-${r.oilType}`} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span>{r.truckPlateNumber}</span>
                        <span className="text-gray-400">/</span>
                        <span>{r.trailerPlateNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{r.transportNo}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {r.transportDate} • {r.transportTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-[240px]">
                      {r.orderType === "external" ? (
                        <div className="space-y-0.5">
                          <div className="font-medium text-gray-900 dark:text-white">
                            PO: {r.poMeta?.orderNo || r.purchaseOrderNo || "-"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ใบอนุมัติ: {r.poMeta?.approveNo || "-"} • Contract:{" "}
                            {r.poMeta?.contractNo || "-"}
                          </div>
                          {r.poMeta?.billNo && <div className="text-xs text-gray-500 dark:text-gray-400">Bill: {r.poMeta.billNo}</div>}
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="font-medium text-gray-900 dark:text-white">ออเดอร์ภายใน: {r.internalOrderNo || "-"}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">—</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TypeBadge orderType={r.orderType} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{r.branchName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">ID: {r.branchId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{r.oilType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700 dark:text-gray-300">
                      {r.plannedQty.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={r.remainingQty > 0 ? "text-blue-600 dark:text-blue-400 font-bold" : "text-gray-400"}>
                        {r.remainingQty.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <JobStatusBadge status={r.jobStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <BranchStatusBadge status={r.branchStatus} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


