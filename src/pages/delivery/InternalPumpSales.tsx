import { useMemo, useState } from "react";
import { DollarSign, Plus, Search, X } from "lucide-react";
import ChartCard from "@/components/ChartCard";
import { useGasStation } from "@/contexts/GasStationContext";
import type { DeliveryNote, DriverJob, OilType, PurchaseOrder, Receipt } from "@/types/gasStation";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

type SaleSource = "truck-remaining" | "recovered";

type TruckRemainingRow = {
  id: string; // inventory row id
  jobId: string;
  transportNo: string;
  orderType: "internal" | "external";
  purchaseOrderNo?: string;
  internalOrderNo?: string;
  poMeta?: Pick<PurchaseOrder, "orderNo" | "approveNo" | "contractNo" | "billNo">;
  truckPlateNumber: string;
  trailerPlateNumber: string;
  fromBranchId: number;
  fromBranchName: string;
  destinationBranchId: number;
  destinationBranchName: string;
  oilType: OilType;
  remainingOnTruck: number;
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

type SaleTx = {
  id: string;
  source: SaleSource;
  createdAt: string;
  fromBranchId: number;
  fromBranchName: string;
  toBranchId: number;
  toBranchName: string;
  oilType: OilType;
  quantity: number;
  pricePerLiter: number;
  totalAmount: number;
  deliveryNoteNo: string;
  receiptNo: string;
  // source refs
  jobId?: string;
  transportNo?: string;
  purchaseOrderNo?: string;
  internalOrderNo?: string;
  destinationBranchId?: number;
  destinationBranchName?: string;
  recoveredItemId?: string;
};

const SALES_TX_STORAGE_KEY = "ptt.delivery.internalSales.v1";
const RECOVERED_STORAGE_KEY = "ptt.delivery.recoveredOil.v1";

// Mock up: แสดงตัวอย่างรายการขาย (เมื่อยังไม่มีข้อมูลขายจริง)
const MOCK_SALES: SaleTx[] = [
  {
    id: "SALE-MOCK-001",
    source: "truck-remaining",
    createdAt: "2024-12-16T10:30:00+07:00",
    fromBranchId: 1,
    fromBranchName: "ปั๊มไฮโซ",
    toBranchId: 2,
    toBranchName: "ดินดำ",
    oilType: "Diesel",
    quantity: 500,
    pricePerLiter: 32.5,
    totalAmount: 16250,
    deliveryNoteNo: "DN-MOCK-001",
    receiptNo: "RCP-MOCK-001",
    transportNo: "TP-20241216-006",
    purchaseOrderNo: "SO-20241215-003",
    destinationBranchId: 3,
    destinationBranchName: "หนองจิก",
  },
  {
    id: "SALE-MOCK-002",
    source: "recovered",
    createdAt: "2024-12-16T11:10:00+07:00",
    fromBranchId: 2,
    fromBranchName: "ดินดำ",
    toBranchId: 3,
    toBranchName: "หนองจิก",
    oilType: "Gasohol 95",
    quantity: 300,
    pricePerLiter: 40.0,
    totalAmount: 12000,
    deliveryNoteNo: "DN-MOCK-002",
    receiptNo: "RCP-MOCK-002",
    recoveredItemId: "RCV-MOCK-001",
  },
];

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

function inferOrderType(job: DriverJob): "internal" | "external" {
  return job.orderType ?? (job.purchaseOrderNo ? "external" : "internal");
}

// NOTE: Remaining-on-truck is computed per destination branch in `truckRows` (not aggregated by oil type anymore).

function calculateVAT(amount: number, vatRate: number = 7) {
  const beforeVat = amount / (1 + vatRate / 100);
  const vat = amount - beforeVat;
  return {
    beforeVat: Math.round(beforeVat * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    total: amount,
  };
}

export default function InternalPumpSales() {
  const {
    branches,
    driverJobs,
    purchaseOrders,
    createDeliveryNote,
    createReceipt,
    getNextRunningNumber,
    incrementRunningNumber,
    getBranchById,
  } = useGasStation();

  const [saleTxs, setSaleTxs] = useState<SaleTx[]>(() => loadFromStorage<SaleTx[]>(SALES_TX_STORAGE_KEY, []));
  const [recoveredItems, setRecoveredItems] = useState<RecoveredOilItem[]>(() =>
    loadFromStorage<RecoveredOilItem[]>(RECOVERED_STORAGE_KEY, [
      {
        id: "RCV-001",
        createdAt: "2024-12-16T09:30:00+07:00",
        fromBranchId: 1,
        fromBranchName: "ปั๊มไฮโซ",
        tankNumber: 5,
        oilType: "Diesel",
        quantityAvailable: 1200,
        notes: "ดูดขึ้นมาจากหลุมผิด (ตัวอย่าง)",
      },
    ])
  );

  const [search, setSearch] = useState("");

  // Sale modal
  const [saleOpen, setSaleOpen] = useState(false);
  const [saleSource, setSaleSource] = useState<SaleSource | "">("");
  const [saleTruckRow, setSaleTruckRow] = useState<TruckRemainingRow | null>(null);
  const [saleRecovered, setSaleRecovered] = useState<RecoveredOilItem | null>(null);
  const [selectedTransportNo, setSelectedTransportNo] = useState<string>("");
  const [selectedTruckInventoryId, setSelectedTruckInventoryId] = useState<string>("");
  const [saleToBranchId, setSaleToBranchId] = useState<number | "">("");
  const [saleQty, setSaleQty] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>("");

  const poByOrderNo = useMemo(() => {
    const m = new Map<string, PurchaseOrder>();
    purchaseOrders.forEach((po) => m.set(po.orderNo, po));
    return m;
  }, [purchaseOrders]);

  const soldQtyByJobBranchOil = useMemo(() => {
    const m = new Map<string, number>();
    saleTxs
      .filter((t) => t.source === "truck-remaining" && t.jobId && t.oilType && t.destinationBranchId)
      .forEach((t) => {
        const key = `${t.jobId}::${t.destinationBranchId}::${t.oilType}`;
        m.set(key, (m.get(key) || 0) + t.quantity);
      });
    return m;
  }, [saleTxs]);

  const truckRows = useMemo(() => {
    const rows: TruckRemainingRow[] = [];
    driverJobs.forEach((job) => {
      const orderType = inferOrderType(job);
      const po =
        orderType === "external" && job.purchaseOrderNo ? poByOrderNo.get(job.purchaseOrderNo) : undefined;

      // remaining per destination branch (preferred: compartments sum, fallback: destinationBranches quantity)
      const compSumByDestOil = new Map<string, number>();
      job.compartments?.forEach((c) => {
        if (!c.destinationBranchId || !c.oilType) return;
        const qty = c.quantity || 0;
        if (qty <= 0) return;
        const key = `${c.destinationBranchId}::${c.oilType}`;
        compSumByDestOil.set(key, (compSumByDestOil.get(key) || 0) + qty);
      });

      job.destinationBranches
        .filter((b) => b.status !== "ส่งแล้ว")
        .forEach((b) => {
          const key = `${b.branchId}::${b.oilType}`;
          const plannedQty = (compSumByDestOil.get(key) || 0) > 0 ? (compSumByDestOil.get(key) || 0) : b.quantity;
          const sold = soldQtyByJobBranchOil.get(`${job.id}::${b.branchId}::${b.oilType}`) || 0;
          const available = plannedQty - sold;
          if (available <= 0) return;
          rows.push({
            id: `truck::${job.id}::${b.branchId}::${b.oilType}`,
            jobId: job.id,
            transportNo: job.transportNo,
            orderType,
            purchaseOrderNo: job.purchaseOrderNo,
            internalOrderNo: job.internalOrderNo,
            poMeta: po
              ? { orderNo: po.orderNo, approveNo: po.approveNo, contractNo: po.contractNo, billNo: po.billNo }
              : undefined,
            truckPlateNumber: job.truckPlateNumber,
            trailerPlateNumber: job.trailerPlateNumber,
            fromBranchId: job.sourceBranchId,
            fromBranchName: job.sourceBranchName,
            destinationBranchId: b.branchId,
            destinationBranchName: b.branchName,
            oilType: b.oilType,
            remainingOnTruck: available,
          });
        });
    });
    return rows.sort((a, b) => a.transportNo.localeCompare(b.transportNo));
  }, [driverJobs, poByOrderNo, soldQtyByJobBranchOil]);

  type InventoryRow = {
    id: string;
    source: SaleSource;
    fromBranchId: number;
    fromBranchName: string;
    oilType: OilType;
    availableQty: number;
    // refs
    transportNo?: string;
    truckPlateNumber?: string;
    trailerPlateNumber?: string;
    orderType?: "internal" | "external";
    purchaseOrderNo?: string;
    internalOrderNo?: string;
    poMeta?: Pick<PurchaseOrder, "orderNo" | "approveNo" | "contractNo" | "billNo">;
    recoveredItemId?: string;
    tankNumber?: number;
    notes?: string;
  };

  const inventoryRows = useMemo(() => {
    const rows: InventoryRow[] = [];

    truckRows.forEach((r) => {
      rows.push({
        id: r.id,
        source: "truck-remaining",
        fromBranchId: r.fromBranchId,
        fromBranchName: r.fromBranchName,
        oilType: r.oilType,
        availableQty: r.remainingOnTruck,
        transportNo: r.transportNo,
        truckPlateNumber: r.truckPlateNumber,
        trailerPlateNumber: r.trailerPlateNumber,
        orderType: r.orderType,
        purchaseOrderNo: r.purchaseOrderNo,
        internalOrderNo: r.internalOrderNo,
        poMeta: r.poMeta,
      });
    });

    recoveredItems
      .filter((i) => i.quantityAvailable > 0)
      .forEach((i) => {
        rows.push({
          id: `recovered::${i.id}`,
          source: "recovered",
          fromBranchId: i.fromBranchId,
          fromBranchName: i.fromBranchName,
          oilType: i.oilType,
          availableQty: i.quantityAvailable,
          recoveredItemId: i.id,
          tankNumber: i.tankNumber,
          notes: i.notes,
        });
      });

    return rows.sort((a, b) => {
      if (a.source !== b.source) return a.source === "truck-remaining" ? -1 : 1;
      return a.fromBranchName.localeCompare(b.fromBranchName);
    });
  }, [truckRows, recoveredItems]);

  const availableTransportNos = useMemo(() => {
    const set = new Set<string>();
    truckRows.forEach((r) => set.add(r.transportNo));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [truckRows]);

  const truckRowsForSelectedTransport = useMemo(() => {
    if (!selectedTransportNo) return [];
    return truckRows.filter((r) => r.transportNo === selectedTransportNo);
  }, [truckRows, selectedTransportNo]);

  // NOTE: Inventory table is hidden by requirement, but inventoryRows is still used by the “เพิ่มรายการขาย” modal.

  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase();

    const base = saleTxs.length > 0 ? saleTxs : MOCK_SALES;

    if (!q) return base;
    return base.filter((t) => {
      const poText = t.purchaseOrderNo || "";
      const internalText = t.internalOrderNo || "";
      return (
        t.deliveryNoteNo.toLowerCase().includes(q) ||
        t.receiptNo.toLowerCase().includes(q) ||
        t.fromBranchName.toLowerCase().includes(q) ||
        t.toBranchName.toLowerCase().includes(q) ||
        t.oilType.toLowerCase().includes(q) ||
        `${t.quantity}`.includes(q) ||
        `${t.pricePerLiter}`.includes(q) ||
        (t.transportNo || "").toLowerCase().includes(q) ||
        poText.toLowerCase().includes(q) ||
        internalText.toLowerCase().includes(q) ||
        (t.source === "truck-remaining" ? "รถ" : "ดูด").includes(q)
      );
    });
  }, [saleTxs, search]);

  const salesSummary = useMemo(() => {
    const totalLiters = filteredSales.reduce((s, t) => s + t.quantity, 0);
    const totalAmount = filteredSales.reduce((s, t) => s + t.totalAmount, 0);
    return { count: filteredSales.length, totalLiters, totalAmount };
  }, [filteredSales]);

  const openAddSale = () => {
    setSaleSource("");
    setSelectedTransportNo("");
    setSelectedTruckInventoryId("");
    setSaleTruckRow(null);
    setSaleRecovered(null);
    setSaleToBranchId("");
    setSaleQty("");
    setSalePrice("");
    setSaleOpen(true);
  };

  const closeSale = () => {
    setSaleOpen(false);
    setSaleSource("");
    setSelectedTransportNo("");
    setSelectedTruckInventoryId("");
    setSaleTruckRow(null);
    setSaleRecovered(null);
  };

  const handleSale = () => {
    if (!saleToBranchId || !saleQty || !salePrice) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const quantity = parseFloat(saleQty);
    const price = parseFloat(salePrice);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      alert("กรุณากรอกจำนวนที่ถูกต้อง");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      alert("กรุณากรอกราคาที่ถูกต้อง");
      return;
    }

    const toBranch = getBranchById(saleToBranchId);
    if (!toBranch) {
      alert("ไม่พบข้อมูลสาขาที่เลือก");
      return;
    }

    if (!saleSource) {
      alert("กรุณาเลือกประเภทการขาย");
      return;
    }

    const sourceOilType: OilType | undefined =
      saleSource === "truck-remaining" ? saleTruckRow?.oilType : saleRecovered?.oilType;
    if (!sourceOilType) {
      alert("ไม่พบข้อมูลชนิดน้ำมัน");
      return;
    }

    const available =
      saleSource === "truck-remaining" ? saleTruckRow?.remainingOnTruck || 0 : saleRecovered?.quantityAvailable || 0;

    if (quantity > available) {
      alert(`จำนวนที่ขายเกินจำนวนที่มี (เหลืออยู่: ${numberFormatter.format(available)} ลิตร)`);
      return;
    }

    const fromBranchId =
      saleSource === "truck-remaining" ? saleTruckRow?.fromBranchId : saleRecovered?.fromBranchId;
    const fromBranchName =
      saleSource === "truck-remaining" ? saleTruckRow?.fromBranchName : saleRecovered?.fromBranchName;
    if (!fromBranchId || !fromBranchName) {
      alert("ไม่พบข้อมูลสาขาต้นทาง");
      return;
    }

    const totalAmount = quantity * price;
    const { beforeVat, vat } = calculateVAT(totalAmount, 7);

    const deliveryNoteNo = getNextRunningNumber("delivery-note");
    incrementRunningNumber("delivery-note");

    const newDeliveryNote: DeliveryNote = {
      id: `DN-${Date.now()}`,
      deliveryNoteNo,
      deliveryDate: new Date().toISOString().split("T")[0],
      fromBranchId,
      fromBranchName,
      toBranchId: toBranch.id,
      toBranchName: toBranch.name,
      items: [
        {
          id: `item-${Date.now()}`,
          oilType: sourceOilType,
          quantity,
          pricePerLiter: price,
          totalAmount,
        },
      ],
      totalAmount,
      truckPlateNumber: saleTruckRow?.truckPlateNumber,
      trailerPlateNumber: saleTruckRow?.trailerPlateNumber,
      driverName: saleTruckRow?.transportNo ? "ระบบ" : undefined,
      status: "sent",
      createdAt: new Date().toISOString(),
      createdBy: "ระบบ",
    };

    createDeliveryNote(newDeliveryNote);

    const receiptNo = getNextRunningNumber("receipt");
    incrementRunningNumber("receipt");

    const newReceipt: Receipt = {
      id: `REC-${Date.now()}`,
      receiptNo,
      receiptDate: new Date().toISOString().split("T")[0],
      deliveryNoteNo,
      customerName: toBranch.name,
      customerAddress: toBranch.address,
      customerTaxId: "",
      items: [
        {
          id: `item-${Date.now()}`,
          oilType: sourceOilType,
          quantity,
          pricePerLiter: price,
          totalAmount,
        },
      ],
      totalAmount: beforeVat,
      vatAmount: vat,
      grandTotal: totalAmount,
      documentType: "ใบเสร็จรับเงิน",
      status: "issued",
      issuedAt: new Date().toISOString(),
      issuedBy: "ระบบ",
      createdAt: new Date().toISOString(),
      createdBy: "ระบบ",
    };

    createReceipt(newReceipt);

    const tx: SaleTx = {
      id: `SALE-${Date.now()}`,
      source: saleSource,
      createdAt: new Date().toISOString(),
      fromBranchId,
      fromBranchName,
      toBranchId: toBranch.id,
      toBranchName: toBranch.name,
      oilType: sourceOilType,
      quantity,
      pricePerLiter: price,
      totalAmount,
      deliveryNoteNo,
      receiptNo,
      jobId: saleTruckRow?.jobId,
      transportNo: saleTruckRow?.transportNo,
      purchaseOrderNo: saleTruckRow?.purchaseOrderNo,
      internalOrderNo: saleTruckRow?.internalOrderNo,
      destinationBranchId: saleTruckRow?.destinationBranchId,
      destinationBranchName: saleTruckRow?.destinationBranchName,
      recoveredItemId: saleRecovered?.id,
    };

    setSaleTxs((prev) => {
      const next = [tx, ...prev];
      saveToStorage(SALES_TX_STORAGE_KEY, next);
      return next;
    });

    if (saleSource === "recovered" && saleRecovered) {
      setRecoveredItems((prev) => {
        const next = prev.map((x) =>
          x.id === saleRecovered.id ? { ...x, quantityAvailable: x.quantityAvailable - quantity } : x
        );
        saveToStorage(RECOVERED_STORAGE_KEY, next);
        return next;
      });
    }

    alert(
      `บันทึกการขายสำเร็จ!\n\nใบส่งของ: ${deliveryNoteNo}\nใบเสร็จ: ${receiptNo}\n\nสาขาที่ขาย: ${fromBranchName}\nขายให้สาขา: ${toBranch.name}\nประเภทน้ำมัน: ${sourceOilType}\nจำนวน: ${numberFormatter.format(quantity)} ลิตร\nราคาต่อลิตร: ${price.toFixed(
        2
      )} บาท\nยอดรวม: ${currencyFormatter.format(totalAmount)}`
    );

    closeSale();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="min-w-0">
          <div className="text-app text-2xl font-bold">ขายน้ำมันภายในปั๊ม</div>
          <div className="text-sm text-muted">
            ขายได้ทั้ง “น้ำมันที่เหลืออยู่บนรถ” และ “น้ำมันที่ดูดขึ้นมา” พร้อมออกใบส่งของ/ใบเสร็จ
          </div>
        </div>
        <button
          type="button"
          onClick={openAddSale}
          disabled={inventoryRows.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-ptt-blue text-white hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title={inventoryRows.length === 0 ? "ไม่มีน้ำมันพร้อมขาย" : "เพิ่มรายการขาย"}
        >
          <Plus className="w-4 h-4" />
          เพิ่มรายการขาย
        </button>
      </div>

      <ChartCard title="ค้นหา" subtitle="ค้นหาในรายการขาย + รายการที่พร้อมขาย" icon={Search}>
        <div className="relative">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา: รอบส่ง / ทะเบียนรถ / สาขา / ชนิดน้ำมัน / PO / เลขอนุมัติ / Contract / หมายเหตุ"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
          />
        </div>
      </ChartCard>

      <ChartCard
        title="รายการขาย (ที่บันทึกแล้ว)"
        subtitle={`ทั้งหมด: ${salesSummary.count} รายการ • รวม ${numberFormatter.format(salesSummary.totalLiters)} ลิตร • ยอดรวม ${currencyFormatter.format(
          salesSummary.totalAmount
        )}`}
        icon={DollarSign}
      >
        {filteredSales.length === 0 ? (
          <div className="text-sm text-muted">ยังไม่มีรายการขาย (กด “ขาย” จากรายการด้านล่างเพื่อสร้างรายการ)</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-app">
                  <th className="text-left py-2 pr-3 whitespace-nowrap">เวลา</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">แหล่ง</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">DN / RCP</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">สาขา (ขาย → รับ)</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">อ้างอิง</th>
                  <th className="text-left py-2 pr-3 whitespace-nowrap">ชนิดน้ำมัน</th>
                  <th className="text-right py-2 pr-3 whitespace-nowrap">จำนวน</th>
                  <th className="text-right py-2 pr-3 whitespace-nowrap">ราคา/ลิตร</th>
                  <th className="text-right py-2 whitespace-nowrap">ยอดรวม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filteredSales.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition">
                    <td className="py-2 pr-3 whitespace-nowrap text-muted">
                      {new Date(t.createdAt).toLocaleString("th-TH")}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                          t.source === "truck-remaining"
                            ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                            : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {t.source === "truck-remaining" ? "คงเหลือบนรถ" : "ดูดขึ้นมา"}
                      </span>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <div className="text-app font-semibold">{t.deliveryNoteNo}</div>
                      <div className="text-xs text-muted">{t.receiptNo}</div>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <div className="text-app font-semibold">{t.fromBranchName}</div>
                      <div className="text-xs text-muted">→ {t.toBranchName}</div>
                    </td>
                    <td className="py-2 pr-3 min-w-[260px]">
                      {t.transportNo && <div className="text-xs text-muted">รอบส่ง: {t.transportNo}</div>}
                      {t.purchaseOrderNo && <div className="text-xs text-muted">PO: {t.purchaseOrderNo}</div>}
                      {t.internalOrderNo && <div className="text-xs text-muted">ออเดอร์ภายใน: {t.internalOrderNo}</div>}
                      {!t.transportNo && !t.purchaseOrderNo && !t.internalOrderNo && <div className="text-xs text-muted">—</div>}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap text-app">{t.oilType}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-right text-app font-semibold">
                      {numberFormatter.format(t.quantity)}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap text-right text-app">{t.pricePerLiter.toFixed(2)}</td>
                    <td className="py-2 whitespace-nowrap text-right text-app font-semibold">
                      {currencyFormatter.format(t.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {/* Sale modal */}
      {saleOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 md:p-8 overflow-y-auto"
          onClick={closeSale}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-app bg-[var(--bg)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 p-4 md:p-6 border-b border-app">
              <div className="min-w-0">
                <div className="text-app font-bold text-lg truncate">
                  ขายน้ำมัน:{" "}
                  {saleSource === "truck-remaining"
                    ? "คงเหลือบนรถ"
                    : "ดูดขึ้นมา"}
                </div>
                <div className="text-xs text-muted">
                  ระบบจะออกใบส่งของ (DN) และใบเสร็จ (RCP) ให้อัตโนมัติ
                </div>
              </div>
              <button
                type="button"
                onClick={closeSale}
                className="p-2 rounded-xl border border-app hover:border-red-500/40 text-muted hover:text-app transition"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="text-xs text-muted">ประเภทการขาย (เลือกก่อน)</label>
                <select
                  value={saleSource}
                  onChange={(e) => {
                    const v = e.target.value as SaleSource | "";
                    setSaleSource(v);
                    setSelectedTransportNo("");
                    setSelectedTruckInventoryId("");
                    setSaleTruckRow(null);
                    setSaleRecovered(null);
                    if (v === "recovered") {
                      const first = recoveredItems.find((x) => x.quantityAvailable > 0) || null;
                      setSaleRecovered(first);
                    }
                    if (v === "truck-remaining") {
                      const firstTp = availableTransportNos[0] || "";
                      setSelectedTransportNo(firstTp);
                      const firstRow = truckRows.find((r) => r.transportNo === firstTp) || null;
                      setSelectedTruckInventoryId(firstRow?.id || "");
                      setSaleTruckRow(firstRow);
                    }
                  }}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                >
                  <option value="">-- เลือกประเภทการขาย --</option>
                  <option value="recovered">ขายน้ำมันที่ดูดขึ้นมา</option>
                  <option value="truck-remaining">ขายน้ำมันที่อยู่บนรถ</option>
                </select>
              </div>

              {saleSource === "truck-remaining" && (
                <>
                  <div>
                    <label className="text-xs text-muted">เลขที่ขนส่ง</label>
                    <select
                      value={selectedTransportNo}
                      onChange={(e) => {
                        const tp = e.target.value;
                        setSelectedTransportNo(tp);
                        const firstRow = truckRows.find((r) => r.transportNo === tp) || null;
                        setSelectedTruckInventoryId(firstRow?.id || "");
                        setSaleTruckRow(firstRow);
                      }}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                    >
                      <option value="">-- เลือกเลขที่ขนส่ง --</option>
                      {availableTransportNos.map((tp) => (
                        <option key={tp} value={tp}>
                          {tp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted">น้ำมันของสาขาไหนบ้างที่เหลืออยู่บนรถ (เลือก)</label>
                    <select
                      value={selectedTruckInventoryId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedTruckInventoryId(id);
                        const found = truckRows.find((r) => r.id === id) || null;
                        setSaleTruckRow(found);
                      }}
                      disabled={!selectedTransportNo}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30 disabled:opacity-60"
                    >
                      <option value="">-- เลือกสาขา/ชนิดน้ำมัน --</option>
                      {truckRowsForSelectedTransport.map((r) => (
                        <option key={r.id} value={r.id}>
                          {`${r.destinationBranchName} • ${r.oilType} • คงเหลือ ${numberFormatter.format(r.remainingOnTruck)} ลิตร`}
                        </option>
                      ))}
                    </select>
                    {saleTruckRow && (
                      <div className="mt-2 text-xs text-muted">
                        รถ/หาง: {saleTruckRow.truckPlateNumber} / {saleTruckRow.trailerPlateNumber} • ต้นทาง:{" "}
                        {saleTruckRow.fromBranchName}
                      </div>
                    )}
                  </div>
                </>
              )}

              {saleSource === "recovered" && (
                <div>
                  <label className="text-xs text-muted">เลือกรายการน้ำมันที่ดูดขึ้นมา</label>
                  <select
                    value={saleRecovered?.id || ""}
                    onChange={(e) => {
                      const rid = e.target.value;
                      const found = recoveredItems.find((x) => x.id === rid) || null;
                      setSaleRecovered(found);
                    }}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                  >
                    <option value="">-- เลือกรายการ --</option>
                    {recoveredItems
                      .filter((x) => x.quantityAvailable > 0)
                      .map((x) => (
                        <option key={x.id} value={x.id}>
                          {`${x.fromBranchName} • หลุม ${x.tankNumber ?? "-"} • ${x.oilType} • คงเหลือ ${numberFormatter.format(
                            x.quantityAvailable
                          )} ลิตร`}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted">สาขาที่ขาย</label>
                  <div className="mt-1 px-3 py-2 rounded-xl bg-white/5 border border-app text-app">
                    {saleSource === "truck-remaining" ? saleTruckRow?.fromBranchName : saleSource === "recovered" ? saleRecovered?.fromBranchName : "-"}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted">ขายให้สาขา</label>
                  <select
                    value={saleToBranchId}
                    onChange={(e) => setSaleToBranchId(parseInt(e.target.value, 10))}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                  >
                    <option value="">-- เลือกสาขา --</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted">ชนิดน้ำมัน</label>
                  <div className="mt-1 px-3 py-2 rounded-xl bg-white/5 border border-app text-app">
                    {saleSource === "truck-remaining" ? saleTruckRow?.oilType : saleSource === "recovered" ? saleRecovered?.oilType : "-"}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted">คงเหลือ (ลิตร)</label>
                  <div className="mt-1 px-3 py-2 rounded-xl bg-white/5 border border-app text-app font-semibold">
                    {numberFormatter.format(
                      saleSource === "truck-remaining"
                        ? saleTruckRow?.remainingOnTruck || 0
                        : saleSource === "recovered"
                          ? saleRecovered?.quantityAvailable || 0
                          : 0
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted">จำนวนที่ขาย (ลิตร)</label>
                  <input
                    value={saleQty}
                    onChange={(e) => setSaleQty(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                    placeholder="เช่น 500"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">ราคาต่อลิตร (บาท)</label>
                  <input
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-white/5 border border-app text-app focus:outline-none focus:ring-2 focus:ring-ptt-blue/30"
                    placeholder="เช่น 32.50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeSale}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-app hover:border-ptt-blue/40 text-app transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSale}
                  className="px-4 py-2 rounded-xl bg-ptt-blue text-white hover:brightness-110 transition"
                >
                  ยืนยันการขาย
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


