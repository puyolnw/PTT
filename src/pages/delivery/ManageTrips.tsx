import { useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileText, Route, Save, Search, Image as ImageIcon, Pencil, X, Truck, Calendar, MapPin, AlertCircle, Eye } from "lucide-react";
import TableActionMenu from "@/components/TableActionMenu";
import { motion, AnimatePresence } from "framer-motion";
import ChartCard from "@/components/ChartCard";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import type { DriverJob, PurchaseOrder } from "@/types/gasStation";
import StatusTag from "@/components/StatusTag";

function TypeBadge({ job }: { job: DriverJob }) {
  const isExternal = job.orderType === "external";
  // Using StatusTag logic but custom colors for Type
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isExternal
      ? "bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
      : "bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
      }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isExternal ? "bg-blue-500" : "bg-purple-500"}`} />
      {isExternal ? "รับจากคลังน้ำมัน" : "ภายในปั๊ม"}
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
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-xl border flex items-center justify-between gap-3 bg-white dark:bg-gray-800 ${isDragging ? "shadow-xl border-blue-400 dark:border-blue-500 rotate-1" : "border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
        } transition-all duration-200 group`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-gray-900 dark:text-white font-semibold truncate">{label}</div>
          {meta && <div className="text-xs text-gray-500 truncate">{meta}</div>}
        </div>
      </div>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-grab active:cursor-grabbing"
        title="ลากเพื่อจัดเรียง"
      >
        <Route className="w-5 h-5" />
      </button>
    </div>
  );
}

function PhotoGrid({ photos }: { photos: string[] }) {
  if (!photos || photos.length === 0) return (
    <div className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-gray-100 dark:border-gray-700 text-gray-400">
      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
      <span className="text-xs">ไม่มีรูปภาพ</span>
    </div>
  );
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {photos.map((src, idx) => (
        <a
          key={`${src}-${idx}`}
          href={src}
          target="_blank"
          rel="noreferrer"
          className="group block rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-all duration-300 relative aspect-video"
          title="คลิกเพื่อดูรูปเต็ม"
        >
          <img src={src} alt={`photo-${idx + 1}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Search className="w-6 h-6 text-white drop-shadow-md" />
          </div>
        </a>
      ))}
    </div>
  );
}

export default function ManageTrips() {
  const { driverJobs, updateDriverJob, purchaseOrders, branches } = useGasStation();
  const { selectedBranches } = useBranch();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);
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
        const matchSearch = (
          j.transportNo.toLowerCase().includes(q) ||
          (j.driverName || "").toLowerCase().includes(q) ||
          (j.truckPlateNumber || "").toLowerCase().includes(q) ||
          (j.purchaseOrderNo || "").toLowerCase().includes(q) ||
          (j.internalOrderNo || "").toLowerCase().includes(q)
        );

        const matchBranch = selectedBranchIds.length === 0 || 
          j.destinationBranches.some(b => selectedBranchIds.includes(b.branchId));

        return matchSearch && matchBranch;
      })
      .slice()
      .sort((a, b) => `${b.transportDate} ${b.transportTime}`.localeCompare(`${a.transportDate} ${a.transportTime}`));
  }, [driverJobs, search, selectedBranchIds]);

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

  const getStatusVariantForJob = (status: DriverJob["status"]) => {
    switch (status) {
      case "ส่งเสร็จ": return "success";
      case "รับน้ำมันแล้ว": return "info";
      case "กำลังส่ง": return "warning";
      case "จัดเรียงเส้นทางแล้ว": return "primary";
      default: return "neutral";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white font-display">
              จัดการรอบจัดส่ง (Manage Trips)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ติดตามสถานะรถขนส่ง ตรวจสอบภาพถ่าย และจัดลำดับเส้นทาง
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
          </span>
        </div>
      </motion.div>

      {/* Main List */}
      <ChartCard
        title="รายการรอบจัดส่ง (Trips)"
        subtitle={`กำลังดำเนินอยู่: ${activeJobs.length} • เสร็จแล้ว: ${completedJobs.length}`}
        icon={Route}
      >
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเลขขนส่ง / คนขับ / PO / ทะเบียนรถ..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm"
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "completed")}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm text-gray-600 dark:text-gray-300"
            >
              <option value="all">ทั้งหมด (All Trips)</option>
              <option value="active">กำลังดำเนินอยู่ (Active)</option>
              <option value="completed">เสร็จแล้ว (Completed)</option>
            </select>
          </div>
        </div>

        {jobsToShow.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted">
            <Route className="w-12 h-12 mb-3 text-gray-300" />
            <p>ไม่พบรายการที่ค้นหา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                <tr>
                  <th className="py-4 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">เลขขนส่ง / เลขสั่งซื้อ</th>
                  <th className="py-4 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ประเภท</th>
                  <th className="py-4 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">คนขับ / รถ</th>
                  <th className="py-4 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">วันที่</th>
                  <th className="py-4 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">สถานะ</th>
                  <th className="py-4 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {jobsToShow.map((j) => (
                  <tr key={j.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{j.transportNo}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3" />
                        {j.orderType === "external"
                          ? j.purchaseOrderNo || "-"
                          : j.internalOrderNo || "-"}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <TypeBadge job={j} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800 dark:text-white">{j.driverName || "-"}</div>
                          <div className="text-xs text-gray-500">{j.truckPlateNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {j.transportDate}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusTag variant={getStatusVariantForJob(j.status)}>
                        {j.status}
                      </StatusTag>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-center">
                        <TableActionMenu
                          actions={[
                            ...(j.status !== "ส่งเสร็จ" ? [{
                              label: "จัดการ",
                              icon: Pencil,
                              onClick: () => {
                                setSelectedId(j.id);
                                setModalMode("edit");
                              },
                              variant: "primary" as const
                            }] : []),
                            {
                              label: "ดูรายละเอียด",
                              icon: Eye,
                              onClick: () => {
                                setSelectedId(j.id);
                                setModalMode("view");
                              }
                            }
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {/* Modal */}
      <AnimatePresence>
        {modalMode && selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalMode(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      {modalMode === "edit" ? <Pencil className="w-5 h-5 text-blue-500" /> : <FileText className="w-5 h-5 text-gray-500" />}
                      {modalMode === "edit" ? "จัดการรอบจัดส่ง" : "รายละเอียดรอบจัดส่ง"}
                      <span className="text-lg font-normal text-gray-400">|</span>
                      <span className="text-lg text-gray-600 dark:text-gray-300 font-mono">{selected.transportNo}</span>
                    </h3>
                  </div>
                  <button onClick={() => setModalMode(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-black/20">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Info */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                        <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                          <Truck className="w-4 h-4 text-blue-500" /> ข้อมูลการขนส่ง
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <div className="text-xs text-gray-400 mb-1">สถานะ</div>
                            <StatusTag variant={getStatusVariantForJob(selected.status)}>{selected.status}</StatusTag>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">ประเภท</div>
                            <TypeBadge job={selected} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-gray-400 mb-1">ทะเบียนรถ</div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">{selected.truckPlateNumber || "-"}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 mb-1">คนขับ</div>
                              <div className="font-medium text-gray-800 dark:text-gray-200">{selected.driverName || "-"}</div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="text-xs text-gray-400 mb-2">เอกสารอ้างอิง</div>
                            {selected.orderType === "external" ? (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">PO No.</span>
                                  <span className="font-mono font-medium">{selected.purchaseOrderNo || "-"}</span>
                                </div>
                                {poMeta && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Approve No.</span>
                                    <span className="font-mono text-gray-600 dark:text-gray-400">{poMeta.approveNo || "-"}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Internal Order</span>
                                <span className="font-mono font-medium">{selected.internalOrderNo || "-"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {selected.orderType === "external" && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                          <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                            <AlertCircle className="w-4 h-4 text-orange-500" /> ข้อมูลจากคลัง (Warehouse)
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <div className="text-xs text-gray-500 mb-1 block">เลขที่คลัง (Warehouse No.)</div>
                              <input
                                value={warehouseNo}
                                onChange={(e) => setWarehouseNo(e.target.value)}
                                disabled={isReadOnly}
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                                placeholder="ยังไม่ได้ระบุ"
                              />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1 block">เลขเอกสาร (Document No.)</div>
                              <input
                                value={depotDocumentNo}
                                onChange={(e) => setDepotDocumentNo(e.target.value)}
                                disabled={isReadOnly}
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                                placeholder="เช่น เลขบิล"
                              />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1 block">หมายเหตุ</div>
                              <textarea
                                value={warehouseNotes}
                                onChange={(e) => setWarehouseNotes(e.target.value)}
                                disabled={isReadOnly}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 resize-none"
                                placeholder="-"
                              />
                            </div>

                            {modalMode === "edit" && (
                              <button
                                onClick={saveWarehouseDocs}
                                className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition active:scale-[0.98]"
                              >
                                บันทึกข้อมูลคลัง
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Route & Photos */}
                    <div className="lg:col-span-2 space-y-6">

                      {/* Photos */}
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                          <ImageIcon className="w-5 h-5 text-purple-500" /> หลักฐานรูปภาพ
                        </h4>
                        <div className="space-y-6">
                          <div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                              จากคลังสินค้า (Warehouse)
                            </div>
                            <PhotoGrid photos={selected.warehouseConfirmation?.photos || []} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                              ขณะรับน้ำมัน (Pickup)
                            </div>
                            <PhotoGrid photos={selected.pickupConfirmation?.photos || []} />
                          </div>
                        </div>
                      </div>

                      {/* Route Order */}
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Route className="w-5 h-5 text-indigo-500" /> ลำดับการส่ง (Route Order)
                          </h4>
                          {modalMode === "edit" && (
                            <button
                              onClick={saveRoute}
                              className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Save className="w-4 h-4" /> บันทึกลำดับ
                            </button>
                          )}
                        </div>

                        {orderedBranches.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            ไม่มีข้อมูลปลายทาง
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {modalMode === "edit" ? (
                              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> ลากเพื่อจัดเรียงลำดับการส่ง
                                </div>
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
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {orderedBranches.map((b, idx) => (
                                  <div key={b.branchId} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 text-sm">
                                      {idx + 1}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900 dark:text-white">{b.branchName}</div>
                                      <div className="text-sm text-gray-500">{b.oilType} • {b.quantity.toLocaleString()} ลิตร</div>
                                    </div>
                                    <div className="ml-auto">
                                      <StatusTag variant={b.status === "ส่งแล้ว" ? "success" : "neutral"}>{b.status}</StatusTag>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


