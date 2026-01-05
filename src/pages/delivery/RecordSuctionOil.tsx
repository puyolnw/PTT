import { useMemo, useState } from "react";
import { Droplet, Plus, Search, X } from "lucide-react";
import ChartCard from "@/components/ChartCard";
import { useGasStation } from "@/contexts/GasStationContext";
import { useBranch } from "@/contexts/BranchContext";
import type { OilType } from "@/types/gasStation";

type SuctionMode = "sell" | "clean";

type SuctionLog = {
  id: string;
  createdAt: string;
  mode: SuctionMode; // sell = ดูดขึ้นมาขาย, clean = ดูดเพื่อล้างถัง
  branchId: number;
  branchName: string;
  tankNumber?: number;
  oilType: OilType;
  quantity: number;
  notes?: string;
};

type RecoveredOilItem = {
  id: string;
  createdAt: string;
  fromBranchId: number;
  fromBranchName: string;
  tankNumber?: number;
  oilType: OilType;
  quantityAvailable: number;
  notes?: string;
};

const SUCTION_LOG_STORAGE_KEY = "ptt.delivery.suctionLogs.v1";
const RECOVERED_STORAGE_KEY = "ptt.delivery.recoveredOil.v1"; // shared with InternalPumpSales

function safeParseJson<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    return safeParseJson<T>(window.localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const numberFormatter = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });

function ModeBadge({ mode }: { mode: SuctionMode }) {
  const cls =
    mode === "sell"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {mode === "sell" ? "ดูดขึ้นมาขาย" : "ดูดเพื่อล้างถัง"}
    </span>
  );
}

export default function RecordSuctionOil() {
  const { branches, getBranchById } = useGasStation();
  const { selectedBranches } = useBranch();
  const selectedBranchIds = useMemo(() => selectedBranches.map(id => Number(id)), [selectedBranches]);

  const [logs, setLogs] = useState<SuctionLog[]>(() =>
    loadFromStorage<SuctionLog[]>(SUCTION_LOG_STORAGE_KEY, [
      {
        id: "SUC-001",
        createdAt: "2024-12-16T09:10:00+07:00",
        mode: "sell",
        branchId: 1,
        branchName: "ปั๊มไฮโซ",
        tankNumber: 5,
        oilType: "Diesel",
        quantity: 1200,
        notes: "ดูดขึ้นมาจากหลุมผิด (ตัวอย่าง)",
      },
      {
        id: "SUC-002",
        createdAt: "2024-12-16T09:40:00+07:00",
        mode: "clean",
        branchId: 2,
        branchName: "ดินดำ",
        tankNumber: 2,
        oilType: "Gasohol 95",
        quantity: 300,
        notes: "ดูดเพื่อล้างถังหลังซ่อมปั๊ม (ตัวอย่าง)",
      },
    ])
  );

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const [mode, setMode] = useState<SuctionMode>("sell");
  const [branchId, setBranchId] = useState<number>(branches[0]?.id || 1);
  const [tankNumber, setTankNumber] = useState<string>("");
  const [oilType, setOilType] = useState<OilType>("Diesel");
  const [quantity, setQuantity] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      const matchSearch = !q ||
        l.branchName.toLowerCase().includes(q) ||
        l.oilType.toLowerCase().includes(q) ||
        (l.notes || "").toLowerCase().includes(q) ||
        `${l.tankNumber || ""}`.includes(q) ||
        (l.mode === "sell" ? "ขาย" : "ล้าง").includes(q);

      const matchBranch = selectedBranchIds.length === 0 || selectedBranchIds.includes(l.branchId);

      return matchSearch && matchBranch;
    });
  }, [logs, search, selectedBranchIds]);

  const summary = useMemo(() => {
    const sellLiters = filtered.filter((x) => x.mode === "sell").reduce((s, x) => s + x.quantity, 0);
    const cleanLiters = filtered.filter((x) => x.mode === "clean").reduce((s, x) => s + x.quantity, 0);
    return { sellLiters, cleanLiters, count: filtered.length };
  }, [filtered]);

  const openAdd = () => {
    setMode("sell");
    setBranchId(branches[0]?.id || 1);
    setTankNumber("");
    setOilType("Diesel");
    setQuantity("");
    setNotes("");
    setAddOpen(true);
  };

  const saveLog = () => {
    const b = getBranchById(branchId);
    if (!b) {
      alert("ไม่พบข้อมูลสาขา");
      return;
    }
    const qty = parseFloat(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      alert("กรุณากรอกจำนวนลิตรให้ถูกต้อง");
      return;
    }

    const tankNo = tankNumber.trim() ? parseInt(tankNumber.trim(), 10) : undefined;
    const log: SuctionLog = {
      id: `SUC-${Date.now()}`,
      createdAt: new Date().toISOString(),
      mode,
      branchId: b.id,
      branchName: b.name,
      tankNumber: Number.isFinite(tankNo as number) ? tankNo : undefined,
      oilType,
      quantity: qty,
      notes: notes.trim() || undefined,
    };

    setLogs((prev) => {
      const next = [log, ...prev];
      saveToStorage(SUCTION_LOG_STORAGE_KEY, next);
      return next;
    });

    // If "ดูดขึ้นมาขาย" => add into recovered inventory for InternalPumpSales
    if (mode === "sell") {
      const recovered = loadFromStorage<RecoveredOilItem[]>(RECOVERED_STORAGE_KEY, []);
      const newItem: RecoveredOilItem = {
        id: `RCV-${Date.now()}`,
        createdAt: log.createdAt,
        fromBranchId: b.id,
        fromBranchName: b.name,
        tankNumber: log.tankNumber,
        oilType: log.oilType,
        quantityAvailable: log.quantity,
        notes: log.notes ? `ดูดขึ้นมาขาย: ${log.notes}` : "ดูดขึ้นมาขาย",
      };
      const nextRecovered = [newItem, ...recovered];
      saveToStorage(RECOVERED_STORAGE_KEY, nextRecovered);
    }

    alert(mode === "sell" ? "บันทึกการดูดขึ้นมาขายแล้ว (เพิ่มเข้าสต็อกขาย)" : "บันทึกการดูดเพื่อล้างถังแล้ว");
    setAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="min-w-0">
          <div className="text-app text-2xl font-bold font-display">บันทึกการดูดน้ำมัน</div>
          <div className="text-sm text-muted">
            มี 2 แบบ: <span className="text-app font-semibold">ดูดขึ้นมาขาย</span> (จะเพิ่มเข้าสต็อกขาย) และ{" "}
            <span className="text-app font-semibold">ดูดเพื่อล้างถัง</span> (บันทึกประวัติ)
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              สาขาที่กำลังดู: {selectedBranches.length === 0 ? "ทั้งหมด" : selectedBranches.map(id => branches.find(b => String(b.id) === id)?.name || id).join(", ")}
            </span>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-ptt-blue text-white hover:brightness-110 transition shadow-lg shadow-blue-500/20 font-bold"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรายการดูดน้ำมัน
          </button>
        </div>
      </div>

      <ChartCard
        title="รายการบันทึกการดูดน้ำมัน"
        subtitle={`ทั้งหมด: ${summary.count} • ดูดขึ้นมาขาย: ${numberFormatter.format(summary.sellLiters)} ลิตร • ดูดล้างถัง: ${numberFormatter.format(
          summary.cleanLiters
        )} ลิตร`}
        icon={Droplet}
      >
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา: สาขา / หลุม / ชนิดน้ำมัน / หมายเหตุ / ขาย / ล้าง"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-sm text-muted">ไม่พบรายการ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-app">
                  <th className="text-left py-2 pr-3 whitespace-nowrap">เวลา</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">ประเภท</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">สาขา</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">หลุม</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">ชนิดน้ำมัน</th>
                  <th className="text-right py-2 pr-3 whitespace-nowrap">จำนวน (ลิตร)</th>
                  <th className="text-left py-2 whitespace-nowrap">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-white/5 transition">
                    <td className="py-2 pr-3 whitespace-nowrap text-muted">
                      {new Date(l.createdAt).toLocaleString("th-TH")}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <ModeBadge mode={l.mode} />
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap text-app">{l.branchName}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-app">{l.tankNumber ?? "-"}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-app">{l.oilType}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-right text-app font-semibold">
                      {numberFormatter.format(l.quantity)}
                    </td>
                    <td className="py-2 text-muted min-w-[260px]">{l.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {addOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 md:p-8 overflow-y-auto"
          onClick={() => setAddOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-app bg-[var(--bg)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 p-4 md:p-6 border-b border-app">
              <div className="min-w-0">
                <div className="text-app font-bold text-lg truncate">เพิ่มรายการดูดน้ำมัน</div>
                <div className="text-xs text-muted">
                  ถ้าเลือก “ดูดขึ้นมาขาย” ระบบจะเพิ่มเข้าสต็อกขายในหน้า “ขายน้ำมันภายในปั๊ม”
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="p-2 rounded-xl border border-app hover:border-red-500/40 text-muted hover:text-app transition"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted">ประเภทการดูด</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as SuctionMode)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                  >
                    <option value="sell">ดูดขึ้นมาขาย</option>
                    <option value="clean">ดูดเพื่อล้างถัง</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted">สาขา</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(parseInt(e.target.value, 10))}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted">เลขหลุม (ถ้ามี)</label>
                  <input
                    value={tankNumber}
                    onChange={(e) => setTankNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                    placeholder="เช่น 5"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">ชนิดน้ำมัน</label>
                  <select
                    value={oilType}
                    onChange={(e) => setOilType(e.target.value as OilType)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                  >
                    <option value="Premium Diesel">Premium Diesel</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Premium Gasohol 95">Premium Gasohol 95</option>
                    <option value="Gasohol 95">Gasohol 95</option>
                    <option value="Gasohol 91">Gasohol 91</option>
                    <option value="E20">E20</option>
                    <option value="E85">E85</option>
                    <option value="Gasohol E20">Gasohol E20</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted">จำนวนลิตร</label>
                  <input
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                    placeholder="เช่น 300"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">หมายเหตุ</label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                    placeholder="เช่น ดูดล้างถัง / ดูดจากหลุมผิด"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-app hover:border-ptt-blue/40 text-app transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={saveLog}
                  className="px-4 py-2 rounded-xl bg-ptt-blue text-white hover:brightness-110 transition"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


