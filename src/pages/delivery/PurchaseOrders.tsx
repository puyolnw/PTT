import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Upload, Truck } from "lucide-react";
import ChartCard from "@/components/ChartCard";
import StatusTag, { getStatusVariant } from "@/components/StatusTag";
import { DeliveryPurchaseOrder, loadPurchaseOrders, savePurchaseOrders, uid } from "@/pages/delivery/_storage";
import { useNavigate } from "react-router-dom";

const defaultProducts = [
  { product: "ดีเซล", liters: 0 },
  { product: "เบนซิน", liters: 0 },
];

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [list, setList] = useState<DeliveryPurchaseOrder[]>([]);
  const [approveNo, setApproveNo] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [status, setStatus] = useState<DeliveryPurchaseOrder["status"]>("จ่ายเงินแล้ว");
  const [items, setItems] = useState(defaultProducts);
  const [invoicePdfName, setInvoicePdfName] = useState<string | undefined>();
  const [receiptPdfName, setReceiptPdfName] = useState<string | undefined>();

  useEffect(() => {
    setList(loadPurchaseOrders());
  }, []);

  const totals = useMemo(() => {
    return items.reduce((sum, i) => sum + (Number.isFinite(i.liters) ? i.liters : 0), 0);
  }, [items]);

  const createPO = () => {
    const cleanApprove = approveNo.trim();
    const cleanInvoice = invoiceNo.trim();
    if (!cleanApprove || !cleanInvoice) {
      alert("กรุณากรอก Approve No. และ Invoice No.");
      return;
    }
    const cleanItems = items
      .map((i) => ({ ...i, liters: Number(i.liters || 0) }))
      .filter((i) => i.product.trim() && i.liters > 0);
    if (cleanItems.length === 0) {
      alert("กรุณาระบุชนิดน้ำมันและจำนวนลิตรอย่างน้อย 1 รายการ");
      return;
    }

    const next: DeliveryPurchaseOrder = {
      id: uid("po"),
      createdAt: new Date().toISOString(),
      approveNo: cleanApprove,
      invoiceNo: cleanInvoice,
      status,
      items: cleanItems,
      invoicePdfName,
      receiptPdfName,
    };

    const updated = [next, ...list];
    setList(updated);
    savePurchaseOrders(updated);

    setApproveNo("");
    setInvoiceNo("");
    setStatus("จ่ายเงินแล้ว");
    setItems(defaultProducts);
    setInvoicePdfName(undefined);
    setReceiptPdfName(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-app font-display">ใบสั่งซื้อ/เอกสาร (PO)</h1>
          <p className="text-muted mt-1">
            ตามเอกสาร: เก็บ Approve No. + Invoice No. แยกกัน และแนบไฟล์ e-Tax (Invoice/Receipt) ได้
          </p>
        </div>
      </div>

      <ChartCard title="สร้างใบสั่งซื้อจาก ปตท. (บันทึกฐานข้อมูลตั้งต้น)" icon={FileText}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1">
                <div className="text-sm text-muted">เลขที่ใบอนุมัติขาย (Approve No.)</div>
                <input
                  value={approveNo}
                  onChange={(e) => setApproveNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                  placeholder="เช่น 1234567890"
                />
              </label>
              <label className="space-y-1">
                <div className="text-sm text-muted">เลขที่ใบกำกับภาษี (Invoice No.)</div>
                <input
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                  placeholder="เช่น INV-PTT-xxxx"
                />
              </label>
            </div>

            <label className="space-y-1">
              <div className="text-sm text-muted">สถานะ</div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DeliveryPurchaseOrder["status"])}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
              >
                <option value="จ่ายเงินแล้ว">จ่ายเงินแล้ว</option>
                <option value="รอรับของ">รอรับของ</option>
                <option value="รับแล้ว">รับแล้ว</option>
                <option value="รอตรวจสอบ">รอตรวจสอบ</option>
              </select>
            </label>

            <div className="space-y-2">
              <div className="text-sm text-muted">ชนิดน้ำมัน / จำนวนลิตร</div>
              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2">
                    <input
                      value={it.product}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = { ...next[idx], product: e.target.value };
                        setItems(next);
                      }}
                      className="col-span-7 px-3 py-2 rounded-xl bg-white/5 border border-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                      placeholder="เช่น ดีเซล"
                    />
                    <input
                      value={it.liters}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = { ...next[idx], liters: Number(e.target.value || 0) };
                        setItems(next);
                      }}
                      type="number"
                      min={0}
                      className="col-span-5 px-3 py-2 rounded-xl bg-white/5 border border-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                      placeholder="ลิตร"
                    />
                  </div>
                ))}
              </div>

              <button
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-app hover:border-ptt-blue/30 transition"
                onClick={() => setItems([...items, { product: "", liters: 0 }])}
              >
                <Plus className="w-4 h-4" />
                เพิ่มชนิดน้ำมัน
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-muted">แนบไฟล์ PDF (ตามเอกสาร Action Items)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="p-4 rounded-2xl border border-app bg-white/5 hover:border-ptt-blue/30 transition cursor-pointer">
                <div className="flex items-center gap-2 text-app font-medium">
                  <Upload className="w-4 h-4" />
                  แนบ Invoice (e-Tax)
                </div>
                <div className="text-xs text-muted mt-1">PDF เท่านั้น</div>
                <input
                  className="hidden"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setInvoicePdfName(e.target.files?.[0]?.name)}
                />
                <div className="text-sm text-app mt-2 truncate">
                  {invoicePdfName ? invoicePdfName : "ยังไม่ได้เลือกไฟล์"}
                </div>
              </label>

              <label className="p-4 rounded-2xl border border-app bg-white/5 hover:border-ptt-blue/30 transition cursor-pointer">
                <div className="flex items-center gap-2 text-app font-medium">
                  <Upload className="w-4 h-4" />
                  แนบ Receipt
                </div>
                <div className="text-xs text-muted mt-1">PDF เท่านั้น</div>
                <input
                  className="hidden"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setReceiptPdfName(e.target.files?.[0]?.name)}
                />
                <div className="text-sm text-app mt-2 truncate">
                  {receiptPdfName ? receiptPdfName : "ยังไม่ได้เลือกไฟล์"}
                </div>
              </label>
            </div>

            <div className="p-4 rounded-2xl border border-app bg-white/5">
              <div className="text-sm text-muted">สรุปยอดรวม</div>
              <div className="text-3xl font-bold text-app font-display mt-1">{totals.toLocaleString()} ลิตร</div>
            </div>

            <button
              onClick={createPO}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-ptt-blue text-white hover:brightness-110 active:scale-[0.99] transition"
            >
              <Plus className="w-4 h-4" />
              บันทึกใบสั่งซื้อ
            </button>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="รายการใบสั่งซื้อ (PO) ล่าสุด" subtitle="ใช้เป็นต้นทางในการสร้างเที่ยวขนส่ง" icon={FileText}>
        {list.length === 0 ? (
          <div className="text-muted">ยังไม่มีข้อมูล PO</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-muted">
                <tr className="border-b border-app">
                  <th className="text-left py-3 pr-4">Approve No.</th>
                  <th className="text-left py-3 pr-4">Invoice No.</th>
                  <th className="text-left py-3 pr-4">น้ำมัน</th>
                  <th className="text-left py-3 pr-4">ไฟล์แนบ</th>
                  <th className="text-left py-3 pr-4">สถานะ</th>
                  <th className="text-right py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((po) => (
                  <tr key={po.id} className="border-b border-app/60 hover:bg-white/5">
                    <td className="py-3 pr-4 text-app whitespace-nowrap">{po.approveNo}</td>
                    <td className="py-3 pr-4 text-app whitespace-nowrap">{po.invoiceNo}</td>
                    <td className="py-3 pr-4 text-app">
                      {po.items.map((i) => `${i.product} ${i.liters.toLocaleString()}L`).join(", ")}
                    </td>
                    <td className="py-3 pr-4 text-app">
                      <div className="space-y-1">
                        <div className="text-xs text-muted truncate">
                          Invoice: {po.invoicePdfName ? po.invoicePdfName : "-"}
                        </div>
                        <div className="text-xs text-muted truncate">
                          Receipt: {po.receiptPdfName ? po.receiptPdfName : "-"}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusTag variant={getStatusVariant(po.status)}>{po.status}</StatusTag>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => navigate(`/app/delivery/manage-trips`)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-app hover:border-ptt-blue/30 transition"
                      >
                        <Truck className="w-4 h-4" />
                        ไปจัดการรอบจัดส่ง
                      </button>
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


