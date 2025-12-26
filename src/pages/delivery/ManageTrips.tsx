import { useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileText, Route, Save, Search, Image as ImageIcon, Pencil, X } from "lucide-react";
import ChartCard from "@/components/ChartCard";
import { useGasStation } from "@/contexts/GasStationContext";
import type { DriverJob, PurchaseOrder } from "@/types/gasStation";

function TypeBadge({ job }: { job: DriverJob }) {
  const isExternal = job.orderType === "external";
  const cls = isExternal
    ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
    : "bg-purple-500/15 text-purple-300 border-purple-500/30";
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {isExternal ? "รับจากคลังน้ำมัน" : "ภายในปั๊ม"}
    </span>
  );
}

function StatusBadge({ status }: { status: DriverJob["status"] }) {
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

function SortableBranchRow({
  id,
  label,
  meta,
}: {
  id: number;
  label: string;
  meta?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 rounded-xl border border-app bg-white/5 flex items-center justify-between gap-3"
    >
      <div className="min-w-0">
        <div className="text-app font-semibold truncate">{label}</div>
        {meta && <div className="text-xs text-muted truncate">{meta}</div>}
      </div>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="px-3 py-2 rounded-xl border border-app hover:border-ptt-blue/40 text-muted hover:text-app transition"
        title="ลากเพื่อจัดเรียง"
      >
        <Route className="w-4 h-4" />
      </button>
    </div>
  );
}

function PhotoGrid({ photos }: { photos: string[] }) {
  if (!photos || photos.length === 0) return <div className="text-sm text-muted">ไม่มีรูป</div>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {photos.map((src, idx) => (
        <a
          key={`${src}-${idx}`}
          href={src}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl overflow-hidden border border-app bg-white/5 hover:border-ptt-blue/40 transition"
          title="คลิกเพื่อดูรูปเต็ม"
        >
          <img src={src} alt={`photo-${idx + 1}`} className="w-full h-28 object-cover" />
        </a>
      ))}
    </div>
  );
}

export default function ManageTrips() {
  const { driverJobs, updateDriverJob, purchaseOrders } = useGasStation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [modalMode, setModalMode] = useState<"view" | "edit" | null>(null);

  const poByOrderNo = useMemo(() => {
    const m = new Map<string, PurchaseOrder>();
    purchaseOrders.forEach((po) => m.set(po.orderNo, po));
    return m;
  }, [purchaseOrders]);

  const jobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return driverJobs
      .filter((j) => {
        if (!q) return true;
        return (
          j.transportNo.toLowerCase().includes(q) ||
          (j.driverName || "").toLowerCase().includes(q) ||
          (j.truckPlateNumber || "").toLowerCase().includes(q) ||
          (j.purchaseOrderNo || "").toLowerCase().includes(q) ||
          (j.internalOrderNo || "").toLowerCase().includes(q)
        );
      })
      .slice()
      .sort((a, b) => `${b.transportDate} ${b.transportTime}`.localeCompare(`${a.transportDate} ${a.transportTime}`));
  }, [driverJobs, search]);

  const activeJobs = useMemo(() => jobs.filter((j) => j.status !== "ส่งเสร็จ"), [jobs]);
  const completedJobs = useMemo(() => jobs.filter((j) => j.status === "ส่งเสร็จ"), [jobs]);

  const jobsToShow = useMemo(() => {
    if (statusFilter === "active") return activeJobs;
    if (statusFilter === "completed") return completedJobs;
    return jobs;
  }, [statusFilter, jobs, activeJobs, completedJobs]);

  const selected = useMemo(() => jobsToShow.find((j) => j.id === selectedId) || null, [jobsToShow, selectedId]);
  const poMeta = useMemo(() => {
    if (!selected?.purchaseOrderNo) return null;
    return poByOrderNo.get(selected.purchaseOrderNo) || null;
  }, [poByOrderNo, selected?.purchaseOrderNo]);

  // Route order editing
  const sensors = useSensors(useSensor(PointerSensor));
  const [routeIds, setRouteIds] = useState<number[]>([]);

  // Keep routeIds in sync when selecting a new job
  useEffect(() => {
    if (!selected) return;
    const current =
      selected.routeOrder && selected.routeOrder.length > 0
        ? selected.routeOrder
        : selected.destinationBranches.map((b) => b.branchId);
    setRouteIds(current);
  }, [selected]);

  const branchById = useMemo(() => {
    const m = new Map<number, DriverJob["destinationBranches"][0]>();
    (selected?.destinationBranches || []).forEach((b) => m.set(b.branchId, b));
    return m;
  }, [selected?.destinationBranches]);

  const orderedBranches = useMemo(() => {
    return routeIds.map((id) => branchById.get(id)).filter(Boolean) as DriverJob["destinationBranches"];
  }, [routeIds, branchById]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setRouteIds((prev) => {
      const oldIndex = prev.indexOf(active.id as number);
      const newIndex = prev.indexOf(over.id as number);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const [warehouseNo, setWarehouseNo] = useState("");
  const [depotDocumentNo, setDepotDocumentNo] = useState("");
  const [warehouseNotes, setWarehouseNotes] = useState("");

  useEffect(() => {
    if (!selected) return;
    setWarehouseNo(selected.warehouseConfirmation?.warehouseNo || "");
    setDepotDocumentNo(selected.warehouseConfirmation?.depotDocumentNo || "");
    setWarehouseNotes(selected.warehouseConfirmation?.notes || "");
  }, [selected]);

  const saveRoute = () => {
    if (!selected) return;
    updateDriverJob(selected.id, { routeOrder: routeIds });
    alert("บันทึกลำดับเส้นทางแล้ว");
  };

  const saveWarehouseDocs = () => {
    if (!selected) return;
    const existing = selected.warehouseConfirmation;
    updateDriverJob(selected.id, {
      warehouseConfirmation: {
        confirmedAt: existing?.confirmedAt || new Date().toISOString(),
        warehouseNo: warehouseNo.trim(),
        depotDocumentNo: depotDocumentNo.trim() || undefined,
        photos: existing?.photos || [],
        notes: warehouseNotes || undefined,
      },
    });
    alert("บันทึกเลขเอกสารจากคลังแล้ว");
  };

  const isReadOnly = modalMode !== "edit";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-app font-display">จัดการรอบจัดส่ง</h1>
          <p className="text-muted mt-1">พี่นิดสามารถจัดเรียงเส้นทาง และกรอกเลขเอกสารจากคลัง (อ้างอิงรูปที่คนขับถ่าย)</p>
        </div>
      </div>

      <ChartCard
        title="รายการรอบจัดส่ง"
        subtitle={`กำลังดำเนินอยู่: ${activeJobs.length} • เสร็จแล้ว: ${completedJobs.length} • กด “แก้ไข” เพื่อจัดการรอบ`}
        icon={Route}
      >
        <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเลขขนส่ง / คนขับ / PO / ทะเบียนรถ..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-app text-app placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "completed")}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
          >
            <option value="all">แสดงทั้งหมด (กำลังดำเนินอยู่ + เสร็จแล้ว)</option>
            <option value="active">เฉพาะกำลังดำเนินอยู่</option>
            <option value="completed">เฉพาะเสร็จแล้ว</option>
          </select>
        </div>

        {jobsToShow.length === 0 ? (
          <div className="text-sm text-muted">ไม่พบรายการ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-app">
                  <th className="text-left py-2 pr-2 whitespace-nowrap">เลขขนส่ง / เลขสั่งซื้อ</th>
                  <th className="text-left py-2 pr-2 whitespace-nowrap">ประเภท</th>
                  <th className="text-left py-2 pr-2 whitespace-nowrap">วันที่/เวลา</th>
                  <th className="text-left py-2 pr-2 whitespace-nowrap">คนขับ</th>
                  <th className="text-left py-2 pr-2 whitespace-nowrap">รถ</th>
                  <th className="text-left py-2 pr-2 whitespace-nowrap">สถานะ</th>
                  <th className="text-right py-2 whitespace-nowrap">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {jobsToShow.map((j) => (
                  <tr key={j.id} className="hover:bg-white/5 transition">
                    <td className="py-2 pr-2">
                      <div className="text-app font-semibold whitespace-nowrap">{j.transportNo}</div>
                      <div className="text-xs text-muted whitespace-nowrap">
                        {j.orderType === "external"
                          ? `PO: ${j.purchaseOrderNo || "-"}`
                          : `ออเดอร์ภายใน: ${j.internalOrderNo || "-"}`}
                      </div>
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap">
                      <TypeBadge job={j} />
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap text-muted">
                      {j.transportDate} {j.transportTime}
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap text-app">{j.driverName || "-"}</td>
                    <td className="py-2 pr-2 whitespace-nowrap text-muted">
                      {j.truckPlateNumber || "-"} / {j.trailerPlateNumber || "-"}
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap">
                      <StatusBadge status={j.status} />
                    </td>
                    <td className="py-2 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(j.id);
                            setModalMode("view");
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-app hover:border-ptt-blue/40 text-app transition"
                          title="ดูรายละเอียด"
                        >
                          <FileText className="w-4 h-4" />
                          ดู
                        </button>
                        {j.status !== "ส่งเสร็จ" && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(j.id);
                              setModalMode("edit");
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-ptt-blue text-white hover:brightness-110 transition"
                            title="แก้ไข"
                          >
                            <Pencil className="w-4 h-4" />
                            แก้ไข
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {modalMode && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 md:p-8 overflow-y-auto"
          onClick={() => setModalMode(null)}
        >
          <div
            className="w-full max-w-5xl rounded-2xl border border-app bg-[var(--bg)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 p-4 md:p-6 border-b border-app">
              <div className="min-w-0">
                <div className="text-app font-bold text-lg truncate">
                  {modalMode === "edit" ? "แก้ไขรอบ" : "ดูรอบ"}: {selected?.transportNo || "-"} •{" "}
                  {selected?.orderType === "external"
                    ? `PO: ${selected?.purchaseOrderNo || "-"}`
                    : `ออเดอร์ภายใน: ${selected?.internalOrderNo || "-"}`}
                </div>
                <div className="text-xs text-muted">
                  {modalMode === "edit"
                    ? "กรอกเลขเอกสารจากคลัง + ดูรูปหลักฐาน + จัดเรียงเส้นทาง"
                    : "ดูข้อมูลจากแอปคนขับ (อ่านอย่างเดียว)"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-2 rounded-xl border border-app hover:border-red-500/40 text-muted hover:text-app transition"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!selected ? (
              <div className="p-6 text-sm text-muted">ไม่พบข้อมูลรอบ</div>
            ) : (
              <div className="p-4 md:p-6 space-y-6">
                <ChartCard title={`รอบ: ${selected.transportNo}`} icon={FileText}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-app bg-white/5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-muted">ประเภท</div>
                        <TypeBadge job={selected} />
                      </div>
                      {selected.orderType === "external" ? (
                        <>
                          <div className="text-xs text-muted mt-3">PO (อ้างอิง)</div>
                          <div className="text-app font-semibold">{poMeta?.orderNo || selected.purchaseOrderNo || "-"}</div>
                          <div className="text-sm text-muted mt-1">
                            ใบอนุมัติขายเลขที่: {poMeta?.approveNo || "-"} • Contract No.: {poMeta?.contractNo || "-"}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs text-muted mt-3">ออเดอร์ภายใน</div>
                          <div className="text-app font-semibold">{selected.internalOrderNo || "-"}</div>
                          <div className="text-sm text-muted mt-1">
                            เที่ยวภายในปั๊มจะไม่มีเอกสารจากคลังน้ำมัน (PTT)
                          </div>
                        </>
                      )}
                    </div>
                    <div className="p-4 rounded-2xl border border-app bg-white/5">
                      <div className="text-xs text-muted">รถ/คนขับ</div>
                      <div className="text-app font-semibold">
                        {selected.truckPlateNumber || "-"} / {selected.trailerPlateNumber || "-"}
                      </div>
                      <div className="text-sm text-muted mt-1">คนขับ: {selected.driverName || "-"}</div>
                    </div>
                  </div>
                </ChartCard>

                {selected.orderType === "external" && (
                  <ChartCard
                    title="เลขเอกสารจากคลัง (จากรูปคนขับ)"
                    icon={FileText}
                    subtitle="พี่นิดกรอกเลขตามบิล/เอกสารจากคลัง ปตท ที่คนขับถ่ายไว้"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div>
                        <label className="text-xs text-muted">เลขที่คลัง</label>
                        <input
                          value={warehouseNo}
                          onChange={(e) => setWarehouseNo(e.target.value)}
                          disabled={isReadOnly}
                          className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                          placeholder="เช่น WH-001"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted">เลขเอกสารจากคลัง (เพิ่มเติม)</label>
                        <input
                          value={depotDocumentNo}
                          onChange={(e) => setDepotDocumentNo(e.target.value)}
                          disabled={isReadOnly}
                          className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                          placeholder="เช่น เลขบิล/เลขใบส่งของ"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="text-xs text-muted">หมายเหตุ</label>
                        <input
                          value={warehouseNotes}
                          onChange={(e) => setWarehouseNotes(e.target.value)}
                          disabled={isReadOnly}
                          className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                          placeholder="ถ้ามี"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="text-xs text-muted">
                        ยืนยันโดยคนขับ:{" "}
                        {selected.warehouseConfirmation?.confirmedAt
                          ? new Date(selected.warehouseConfirmation.confirmedAt).toLocaleString("th-TH")
                          : "-"}
                      </div>
                      {modalMode === "edit" && (
                        <button
                          type="button"
                          onClick={saveWarehouseDocs}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-ptt-blue text-white hover:brightness-110 transition"
                        >
                          <Save className="w-4 h-4" />
                          บันทึกเลขเอกสาร
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2 text-app">
                      <ImageIcon className="w-4 h-4 text-muted" />
                      <span className="text-sm font-semibold">รูปหลักฐาน (คลัง)</span>
                    </div>
                    <PhotoGrid photos={selected.warehouseConfirmation?.photos || []} />

                    <div className="mt-6 flex items-center gap-2 mb-2 text-app">
                      <ImageIcon className="w-4 h-4 text-muted" />
                      <span className="text-sm font-semibold">รูปบิลรับน้ำมัน (ขั้นตอนรับน้ำมัน)</span>
                    </div>
                    <PhotoGrid photos={selected.pickupConfirmation?.photos || []} />
                  </ChartCard>
                )}

                <ChartCard title="จัดเรียงเส้นทางการส่ง (Route Order)" icon={Route} subtitle="ลากเพื่อจัดเรียงลำดับการส่ง แล้วกดบันทึก">
                  {orderedBranches.length === 0 ? (
                    <div className="text-sm text-muted">ไม่มีปลายทาง</div>
                  ) : (
                    <div className="space-y-3">
                      {modalMode === "edit" ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                          <SortableContext items={routeIds} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                              {orderedBranches.map((b) => (
                                <SortableBranchRow
                                  key={b.branchId}
                                  id={b.branchId}
                                  label={b.branchName}
                                  meta={`${b.oilType} • ${b.quantity.toLocaleString()} ลิตร • สถานะ: ${b.status}`}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <div className="space-y-2">
                          {orderedBranches.map((b) => (
                            <div
                              key={b.branchId}
                              className="p-3 rounded-xl border border-app bg-white/5"
                            >
                              <div className="text-app font-semibold">{b.branchName}</div>
                              <div className="text-xs text-muted">
                                {b.oilType} • {b.quantity.toLocaleString()} ลิตร • สถานะ: {b.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {modalMode === "edit" && (
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={saveRoute}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-app hover:border-ptt-blue/40 text-app transition"
                      >
                        <Save className="w-4 h-4" />
                        บันทึกลำดับเส้นทาง
                      </button>
                    </div>
                  )}
                </ChartCard>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


