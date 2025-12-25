import { useMemo, useState } from "react";
import { Gauge, Plus, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import ChartCard from "@/components/ChartCard";
import StatusTag from "@/components/StatusTag";
import { loadPurchaseOrders } from "@/pages/delivery/_storage";

type AllocationRow = {
  id: string;
  station: string;
  product: string;
  liters: number;
};

export default function Allocation() {
  const pos = useMemo(() => loadPurchaseOrders(), []);
  const [poId, setPoId] = useState("");
  const [rows, setRows] = useState<AllocationRow[]>([]);

  const selectedPO = useMemo(() => pos.find((p) => p.id === poId), [pos, poId]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, station: "", product: "", liters: 0 },
    ]);
  };

  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const totalsByProduct = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const key = r.product.trim();
      if (!key) continue;
      m.set(key, (m.get(key) || 0) + Number(r.liters || 0));
    }
    return m;
  }, [rows]);

  const checkBalance = useMemo(() => {
    if (!selectedPO) return { ok: false, message: "กรุณาเลือก PO" };
    if (rows.length === 0) return { ok: false, message: "กรุณาเพิ่มปลายทางอย่างน้อย 1 แห่ง" };

    for (const item of selectedPO.items) {
      const allocated = totalsByProduct.get(item.product) || 0;
      if (allocated > item.liters) {
        return {
          ok: false,
          message: `ยอดกระจาย "${item.product}" เกินยอดที่รับจากคลัง (จัดสรร ${allocated.toLocaleString()}L > รับ ${item.liters.toLocaleString()}L)`,
        };
      }
    }

    // Also disallow allocating unknown products if PO doesn't contain them
    const poProducts = new Set(selectedPO.items.map((i) => i.product));
    for (const [prod, allocated] of totalsByProduct.entries()) {
      if (!poProducts.has(prod) && allocated > 0) {
        return { ok: false, message: `พบชนิดน้ำมัน "${prod}" ที่ไม่อยู่ใน PO (กรุณาตรวจสอบ)` };
      }
    }

    return { ok: true, message: "Check Balance ผ่าน (ยอดจัดสรรไม่เกินยอดที่รับจากคลัง)" };
  }, [selectedPO, rows.length, totalsByProduct]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-app font-display">กระจายน้ำมัน (Volume Allocation)</h1>
        <p className="text-muted mt-1">
          ตามเอกสาร: 1 เที่ยววิ่งสามารถส่งหลายสถานี และต้อง Check Balance (ยอดรวมปลายทาง ≤ ยอดรับจากคลัง)
        </p>
      </div>

      <ChartCard title="เลือก PO ที่ต้องการกระจาย" icon={Gauge}>
        <div className="space-y-3">
          <select
            value={poId}
            onChange={(e) => {
              setPoId(e.target.value);
              setRows([]);
            }}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
          >
            <option value="">-- เลือก PO --</option>
            {pos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.approveNo} / {p.invoiceNo}
              </option>
            ))}
          </select>

          {selectedPO ? (
            <div className="p-4 rounded-2xl border border-app bg-white/5">
              <div className="text-sm text-muted">ยอดรับจากคลัง (ต้นทาง)</div>
              <div className="text-app font-medium mt-1">
                {selectedPO.items.map((i) => `${i.product} ${i.liters.toLocaleString()}L`).join(" • ")}
              </div>
            </div>
          ) : (
            <div className="text-muted">เลือก PO ก่อนเพื่อเริ่มกระจาย</div>
          )}
        </div>
      </ChartCard>

      <ChartCard title="รายการจัดสรรปลายทาง" subtitle="เพิ่มได้มากกว่า 1 สถานีต่อ 1 เที่ยววิ่ง" icon={Gauge}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={addRow}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-ptt-blue text-white hover:brightness-110 transition"
              disabled={!selectedPO}
              title={!selectedPO ? "กรุณาเลือก PO ก่อน" : undefined}
            >
              <Plus className="w-4 h-4" />
              เพิ่มสถานีปลายทาง
            </button>

            <div className="flex items-center gap-2">
              {checkBalance.ok ? (
                <StatusTag variant="success" icon={<CheckCircle className="w-3.5 h-3.5" />}>
                  {checkBalance.message}
                </StatusTag>
              ) : (
                <StatusTag variant="warning" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                  {checkBalance.message}
                </StatusTag>
              )}
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="text-muted">ยังไม่มีรายการจัดสรร</div>
          ) : (
            <div className="space-y-2">
              {rows.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl border border-app bg-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <label className="md:col-span-5 space-y-1">
                      <div className="text-sm text-muted">สถานีปลายทาง</div>
                      <input
                        value={r.station}
                        onChange={(e) =>
                          setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, station: e.target.value } : x)))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                        placeholder="เช่น ปั๊ม A"
                      />
                    </label>
                    <label className="md:col-span-4 space-y-1">
                      <div className="text-sm text-muted">ชนิดน้ำมัน</div>
                      <input
                        value={r.product}
                        onChange={(e) =>
                          setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, product: e.target.value } : x)))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                        placeholder="เช่น ดีเซล"
                      />
                    </label>
                    <label className="md:col-span-2 space-y-1">
                      <div className="text-sm text-muted">ลิตร</div>
                      <input
                        type="number"
                        min={0}
                        value={r.liters}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((x) => (x.id === r.id ? { ...x, liters: Number(e.target.value || 0) } : x))
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                      />
                    </label>
                    <div className="md:col-span-1 flex md:justify-end">
                      <button
                        onClick={() => removeRow(r.id)}
                        className="p-2 rounded-xl bg-white/5 border border-app hover:border-red-500/40 transition"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-4 h-4 text-muted" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ChartCard>

      {selectedPO && (
        <ChartCard title="สรุปยอดจัดสรร (รวมตามชนิดน้ำมัน)" icon={Gauge}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedPO.items.map((i) => {
              const allocated = totalsByProduct.get(i.product) || 0;
              const remain = i.liters - allocated;
              return (
                <div key={i.product} className="p-4 rounded-2xl border border-app bg-white/5">
                  <div className="text-app font-medium">{i.product}</div>
                  <div className="text-sm text-muted mt-1">
                    รับ: {i.liters.toLocaleString()}L • จัดสรร: {allocated.toLocaleString()}L • คงเหลือ:{" "}
                    {remain.toLocaleString()}L
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      )}
    </div>
  );
}


