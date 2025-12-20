import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type {
  Branch,
  LegalEntity,
  OrderSummaryItem,
  PurchaseOrder,
  Quotation,
  DeliveryNote,
  Receipt,
  TransportDelivery,
  DriverJob,
  OilReceipt,
  TankEntryRecord,
  RunningNumber,
} from "@/types/gasStation";
import type { TruckProfile, Trailer } from "@/pages/gas-station/TruckProfiles";
import { branches, legalEntities, mockOrderSummary, mockApprovedOrders } from "@/data/gasStationOrders";
import { mockOilReceipts } from "@/data/gasStationReceipts";
import { mockTrucks, mockTrailers } from "@/pages/gas-station/TruckProfiles";

interface GasStationContextType {
  // Data
  branches: Branch[];
  legalEntities: LegalEntity[];
  orders: OrderSummaryItem[];
  purchaseOrders: PurchaseOrder[];
  quotations: Quotation[];
  deliveryNotes: DeliveryNote[];
  receipts: Receipt[];
  transportDeliveries: TransportDelivery[];
  driverJobs: DriverJob[];
  oilReceipts: OilReceipt[];
  tankEntries: TankEntryRecord[];
  trucks: TruckProfile[];
  trailers: Trailer[];
  runningNumbers: Map<string, RunningNumber>;

  // Actions - Orders
  addOrder: (order: OrderSummaryItem) => void;
  updateOrder: (orderId: string, updates: Partial<OrderSummaryItem>) => void;
  approveOrder: (orderId: string, approvedBy: string) => void;

  // Actions - Purchase Orders
  createPurchaseOrder: (order: PurchaseOrder) => void;
  updatePurchaseOrder: (orderNo: string, updates: Partial<PurchaseOrder>) => void;

  // Actions - Quotations
  createQuotation: (quotation: Quotation) => void;
  updateQuotation: (quotationId: string, updates: Partial<Quotation>) => void;
  confirmQuotation: (quotationId: string, confirmedBy: string) => void;

  // Actions - Delivery Notes
  createDeliveryNote: (deliveryNote: DeliveryNote) => void;
  updateDeliveryNote: (deliveryNoteId: string, updates: Partial<DeliveryNote>) => void;
  deleteDeliveryNote: (deliveryNoteId: string) => void;
  signDeliveryNote: (deliveryNoteId: string, signature: string, isReceiver: boolean) => void;

  // Actions - Receipts
  createReceipt: (receipt: Receipt) => void;
  updateReceipt: (receiptId: string, updates: Partial<Receipt>) => void;
  deleteReceipt: (receiptId: string) => void;
  issueReceipt: (receiptId: string) => void;

  // Actions - Transport Delivery
  createTransportDelivery: (transport: TransportDelivery) => void;
  updateTransportDelivery: (transportId: string, updates: Partial<TransportDelivery>) => void;
  startTransport: (transportId: string, startOdometer: number) => void;
  completeTransport: (transportId: string, endOdometer: number) => void;

  // Actions - Driver Jobs
  createDriverJob: (job: DriverJob) => void;
  updateDriverJob: (jobId: string, updates: Partial<DriverJob>) => void;
  updateDriverJobStatus: (jobId: string, status: DriverJob["status"]) => void;

  // Actions - Oil Receipts
  createOilReceipt: (receipt: OilReceipt) => void;
  updateOilReceipt: (receiptId: string, updates: Partial<OilReceipt>) => void;
  deleteOilReceipt: (receiptId: string) => void;

  // Actions - Tank Entries
  createTankEntry: (entry: TankEntryRecord) => void;
  updateTankEntry: (entryId: string, updates: Partial<TankEntryRecord>) => void;

  // Actions - Running Numbers
  getNextRunningNumber: (documentType: RunningNumber["documentType"]) => string;
  incrementRunningNumber: (documentType: RunningNumber["documentType"]) => void;

  // Getters
  getOrderByNo: (orderNo: string) => PurchaseOrder | undefined;
  getTransportByNo: (transportNo: string) => TransportDelivery | undefined;
  getDriverJobByTransportNo: (transportNo: string) => DriverJob | undefined;
  getDeliveryNoteByNo: (deliveryNoteNo: string) => DeliveryNote | undefined;
  getQuotationByNo: (quotationNo: string) => Quotation | undefined;
  getReceiptByNo: (receiptNo: string) => Receipt | undefined;
  getOilReceiptByNo: (receiptNo: string) => OilReceipt | undefined;
  getBranchById: (branchId: number) => Branch | undefined;
  getTruckById: (truckId: string) => TruckProfile | undefined;
  getTrailerById: (trailerId: string) => Trailer | undefined;
}

const GasStationContext = createContext<GasStationContextType | undefined>(undefined);

export function GasStationProvider({ children }: { children: ReactNode }) {
  // State
  const [ordersState, setOrdersState] = useState<OrderSummaryItem[]>(
    mockOrderSummary.map((order) => ({
      ...order,
      oilType: order.oilType as OrderSummaryItem["oilType"],
    }))
  );
  const [purchaseOrdersState, setPurchaseOrdersState] = useState<PurchaseOrder[]>(
    mockApprovedOrders.map((order) => ({
      ...order,
      items: order.items.map((item, idx) => ({
        id: `item-${idx}`,
        oilType: item.oilType as PurchaseOrder["items"][0]["oilType"],
        quantity: item.quantity,
        pricePerLiter: item.pricePerLiter,
        totalAmount: item.totalAmount,
      })),
      branches: order.branches.map((branch) => ({
        ...branch,
        items: branch.items.map((item, idx) => ({
          id: `item-${idx}`,
          oilType: item.oilType as PurchaseOrder["items"][0]["oilType"],
          quantity: item.quantity,
          pricePerLiter: item.pricePerLiter,
          totalAmount: item.totalAmount,
        })),
      })),
    }))
  );
  const [quotationsState, setQuotationsState] = useState<Quotation[]>([]);
  // Mock data for Delivery Notes
  const mockDeliveryNotes: DeliveryNote[] = [
    {
      id: "DN-001",
      deliveryNoteNo: "DN-20241215-001",
      deliveryDate: new Date().toISOString().split("T")[0],
      purchaseOrderNo: "SO-20241215-001", // เชื่อมกับ Purchase Order
      fromBranchId: 1,
      fromBranchName: "ปั๊มไฮโซ",
      toBranchId: 1, // ส่งให้ปั๊มไฮโซเอง (สำหรับ BranchOilReceipt)
      toBranchName: "ปั๊มไฮโซ",
      items: [
        { id: "item-1", oilType: "Premium Diesel", quantity: 32000, pricePerLiter: 32.5, totalAmount: 1040000 },
        { id: "item-2", oilType: "Premium Gasohol 95", quantity: 28000, pricePerLiter: 35.0, totalAmount: 980000 },
      ],
      totalAmount: 2020000,
      truckPlateNumber: "กก 1111",
      driverName: "สมศักดิ์ ขับรถ",
      status: "delivered",
      receiverName: "ปั๊มไฮโซ",
      signedBy: "ผู้รับ",
      signedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: "ผู้จัดการคลัง",
    },
    {
      id: "DN-002",
      deliveryNoteNo: "DN-20241215-002",
      deliveryDate: new Date().toISOString().split("T")[0],
      purchaseOrderNo: "SO-20241215-001", // เชื่อมกับ Purchase Order เดียวกัน
      fromBranchId: 1,
      fromBranchName: "ปั๊มไฮโซ",
      toBranchId: 2,
      toBranchName: "ดินดำ",
      items: [
        { id: "item-1", oilType: "Premium Diesel", quantity: 22000, pricePerLiter: 32.5, totalAmount: 715000 },
        { id: "item-2", oilType: "Gasohol 95", quantity: 15000, pricePerLiter: 35.0, totalAmount: 525000 },
      ],
      totalAmount: 1240000,
      truckPlateNumber: "กก 1111",
      trailerPlateNumber: "กข 1234",
      driverName: "สมชาย ใจดี",
      status: "delivered",
      signedBy: "ผู้รับ: วิชัย รักงาน",
      signedAt: new Date().toISOString(),
      receiverName: "วิชัย รักงาน",
      receiverSignedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      createdBy: "ผู้จัดการคลัง",
    },
    {
      id: "DN-003",
      deliveryNoteNo: "DN-20241214-003",
      deliveryDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      purchaseOrderNo: "SO-20241215-002",
      fromBranchId: 1,
      fromBranchName: "ปั๊มไฮโซ",
      toBranchId: 3,
      toBranchName: "หนองจิก",
      items: [
        { id: "item-1", oilType: "Diesel", quantity: 20000, pricePerLiter: 30.0, totalAmount: 600000 },
      ],
      totalAmount: 600000,
      truckPlateNumber: "กก 2222",
      trailerPlateNumber: "กข 5678",
      driverName: "วิชัย รักงาน",
      status: "sent",
      senderSignature: "ผู้ส่ง: วิชัย รักงาน",
      senderSignedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      createdBy: "ผู้จัดการคลัง",
    },
  ];
  const [deliveryNotesState, setDeliveryNotesState] = useState<DeliveryNote[]>(mockDeliveryNotes);
  
  // Mock data for Receipts
  const mockReceipts: Receipt[] = [
    {
      id: "REC-001",
      receiptNo: "1/1",
      receiptDate: new Date().toISOString().split("T")[0],
      documentType: "ใบเสร็จรับเงิน",
      customerName: "ดินดำ",
      customerAddress: "456 ถนนพหลโยธิน กรุงเทพมหานคร 10400",
      customerTaxId: "0105536000001",
      items: [
        { id: "item-1", oilType: "Premium Diesel", quantity: 22000, pricePerLiter: 32.5, totalAmount: 715000 },
        { id: "item-2", oilType: "Gasohol 95", quantity: 15000, pricePerLiter: 35.0, totalAmount: 525000 },
      ],
      vatAmount: 81121.5,
      totalAmount: 1240000,
      grandTotal: 1240000,
      deliveryNoteNo: "1/1",
      status: "issued",
      receiverName: "วิชัย รักงาน",
      createdAt: new Date().toISOString(),
      createdBy: "ผู้จัดการคลัง",
    },
    {
      id: "REC-002",
      receiptNo: "2/1",
      receiptDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      documentType: "ใบเสร็จรับเงิน",
      customerName: "หนองจิก",
      customerAddress: "789 ถนนรัชดาภิเษก กรุงเทพมหานคร 10320",
      customerTaxId: "0105536000002",
      items: [
        { id: "item-1", oilType: "Diesel", quantity: 20000, pricePerLiter: 30.0, totalAmount: 600000 },
      ],
      vatAmount: 39252.34,
      totalAmount: 600000,
      grandTotal: 600000,
      deliveryNoteNo: "2/1",
      status: "issued",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      createdBy: "ผู้จัดการคลัง",
    },
  ];
  const [receiptsState, setReceiptsState] = useState<Receipt[]>(mockReceipts);
  const [transportDeliveriesState, setTransportDeliveriesState] = useState<TransportDelivery[]>([]);
  const [driverJobsState, setDriverJobsState] = useState<DriverJob[]>([]);
  const [oilReceiptsState, setOilReceiptsState] = useState<OilReceipt[]>(
    mockOilReceipts.map((receipt) => ({
      id: receipt.id,
      receiptNo: receipt.receiptNo,
      deliveryNoteNo: receipt.deliveryNoteNo,
      purchaseOrderNo: receipt.purchaseOrderNo,
      receiveDate: receipt.receiveDate,
      receiveTime: receipt.receiveTime,
      truckLicensePlate: receipt.truckLicensePlate,
      driverName: receipt.driverName,
      driverLicense: receipt.driverLicense,
      qualityTest: receipt.qualityTest,
      items: receipt.items.map((item) => ({
        oilType: item.oilType as OilReceipt["items"][0]["oilType"],
        tankNumber: item.tankNumber,
        quantityOrdered: item.quantityOrdered,
        beforeDip: item.beforeDip,
        afterDip: item.afterDip,
        quantityReceived: item.quantityReceived,
        differenceLiter: item.differenceLiter,
        differenceAmount: item.differenceAmount,
        pricePerLiter: item.pricePerLiter,
        gainLossReason: item.gainLossReason,
      })),
      totalAmount: receipt.items.reduce((sum, item) => sum + (item.quantityReceived * item.pricePerLiter), 0),
      status: receipt.status,
      notes: receipt.notes,
      createdAt: receipt.createdAt,
      createdBy: receipt.receivedBy || "ระบบ",
    }))
  );
  const [tankEntriesState, setTankEntriesState] = useState<TankEntryRecord[]>([]);
  const [runningNumbersState, setRunningNumbersState] = useState<Map<string, RunningNumber>>(
    new Map([
      ["quotation", { id: "rn-quotation", documentType: "quotation", prefix: "QT", year: 2024, currentNumber: 1, lastUpdated: new Date().toISOString() }],
      ["delivery-note", { id: "rn-delivery-note", documentType: "delivery-note", prefix: "DN", year: 2024, currentNumber: 1, lastUpdated: new Date().toISOString() }],
      ["receipt", { id: "rn-receipt", documentType: "receipt", prefix: "RCP", year: 2024, currentNumber: 1, lastUpdated: new Date().toISOString() }],
    ])
  );

  // Running Number Helpers
  const getNextRunningNumber = useCallback((documentType: RunningNumber["documentType"]): string => {
    const runningNumber = runningNumbersState.get(documentType);
    if (!runningNumber) {
      return "1";
    }
    return `${runningNumber.currentNumber}`;
  }, [runningNumbersState]);

  const incrementRunningNumber = useCallback((documentType: RunningNumber["documentType"]) => {
    setRunningNumbersState((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(documentType);
      if (!current) return prev;

      const newNumber = current.currentNumber + 1;

      newMap.set(documentType, {
        ...current,
        currentNumber: newNumber,
        lastUpdated: new Date().toISOString(),
      });

      return newMap;
    });
  }, []);

  // Orders
  const addOrder = useCallback((order: OrderSummaryItem) => {
    setOrdersState((prev) => [...prev, order]);
  }, []);

  const updateOrder = useCallback((orderId: string, updates: Partial<OrderSummaryItem>) => {
    setOrdersState((prev) =>
      prev.map((order) => {
        if (`${order.branchId}-${order.oilType}` === orderId) {
          return { ...order, ...updates };
        }
        return order;
      })
    );
  }, []);

  const approveOrder = useCallback((orderId: string, approvedBy: string) => {
    updateOrder(orderId, {
      status: "อนุมัติแล้ว",
      approvedBy,
      approvedAt: new Date().toISOString(),
    });
  }, [updateOrder]);

  // Purchase Orders
  const createPurchaseOrder = useCallback((order: PurchaseOrder) => {
    setPurchaseOrdersState((prev) => [...prev, order]);
  }, []);

  const updatePurchaseOrder = useCallback((orderNo: string, updates: Partial<PurchaseOrder>) => {
    setPurchaseOrdersState((prev) =>
      prev.map((order) => (order.orderNo === orderNo ? { ...order, ...updates } : order))
    );
  }, []);

  // Quotations
  const createQuotation = useCallback((quotation: Quotation) => {
    setQuotationsState((prev) => [...prev, quotation]);
    incrementRunningNumber("quotation");
  }, [incrementRunningNumber]);

  const updateQuotation = useCallback((quotationId: string, updates: Partial<Quotation>) => {
    setQuotationsState((prev) =>
      prev.map((q) => (q.id === quotationId ? { ...q, ...updates } : q))
    );
  }, []);

  const confirmQuotation = useCallback((quotationId: string, confirmedBy: string) => {
    updateQuotation(quotationId, {
      status: "confirmed",
      confirmedBy,
      confirmedAt: new Date().toISOString(),
    });
  }, [updateQuotation]);

  // Delivery Notes
  const createDeliveryNote = useCallback((deliveryNote: DeliveryNote) => {
    setDeliveryNotesState((prev) => [...prev, deliveryNote]);
    incrementRunningNumber("delivery-note");
  }, [incrementRunningNumber]);

  const updateDeliveryNote = useCallback((deliveryNoteId: string, updates: Partial<DeliveryNote>) => {
    setDeliveryNotesState((prev) =>
      prev.map((dn) => (dn.id === deliveryNoteId ? { ...dn, ...updates, updatedAt: new Date().toISOString() } : dn))
    );
  }, []);

  const deleteDeliveryNote = useCallback((deliveryNoteId: string) => {
    setDeliveryNotesState((prev) => prev.filter((dn) => dn.id !== deliveryNoteId));
  }, []);

  const signDeliveryNote = useCallback(
    (deliveryNoteId: string, signature: string, isReceiver: boolean) => {
      const now = new Date().toISOString();
      if (isReceiver) {
        updateDeliveryNote(deliveryNoteId, {
          signedBy: signature,
          signedAt: now,
          receiverName: signature,
          status: "delivered",
        });
      } else {
        updateDeliveryNote(deliveryNoteId, {
          status: "sent",
        });
      }
    },
    [updateDeliveryNote]
  );

  // Receipts
  const createReceipt = useCallback((receipt: Receipt) => {
    setReceiptsState((prev) => [...prev, receipt]);
    incrementRunningNumber("receipt");
  }, [incrementRunningNumber]);

  const updateReceipt = useCallback((receiptId: string, updates: Partial<Receipt>) => {
    setReceiptsState((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, ...updates } : r))
    );
  }, []);

  const deleteReceipt = useCallback((receiptId: string) => {
    setReceiptsState((prev) => prev.filter((r) => r.id !== receiptId));
  }, []);

  const issueReceipt = useCallback((receiptId: string) => {
    updateReceipt(receiptId, {
      status: "issued",
    });
  }, [updateReceipt]);

  // Transport Delivery
  const createTransportDelivery = useCallback((transport: TransportDelivery) => {
    setTransportDeliveriesState((prev) => [...prev, transport]);
  }, []);

  const updateTransportDelivery = useCallback(
    (transportId: string, updates: Partial<TransportDelivery>) => {
      setTransportDeliveriesState((prev) =>
        prev.map((t) => (t.id === transportId ? { ...t, ...updates } : t))
      );
    },
    []
  );

  const startTransport = useCallback((transportId: string, startOdometer: number) => {
    updateTransportDelivery(transportId, {
      status: "กำลังขนส่ง",
      startOdometer,
      startTime: new Date().toISOString(),
    });
  }, [updateTransportDelivery]);

  const completeTransport = useCallback((transportId: string, endOdometer: number) => {
    const transport = transportDeliveriesState.find((t) => t.id === transportId);
    if (transport) {
      const totalDistance = transport.startOdometer
        ? endOdometer - transport.startOdometer
        : 0;
      updateTransportDelivery(transportId, {
        status: "ขนส่งสำเร็จ",
        endOdometer,
        totalDistance,
        endTime: new Date().toISOString(),
      });
    }
  }, [transportDeliveriesState, updateTransportDelivery]);

  // Driver Jobs
  const createDriverJob = useCallback((job: DriverJob) => {
    setDriverJobsState((prev) => [...prev, job]);
  }, []);

  const updateDriverJob = useCallback((jobId: string, updates: Partial<DriverJob>) => {
    setDriverJobsState((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, ...updates } : job))
    );
  }, []);

  const updateDriverJobStatus = useCallback(
    (jobId: string, status: DriverJob["status"]) => {
      updateDriverJob(jobId, { status });
    },
    [updateDriverJob]
  );

  // Oil Receipts
  const createOilReceipt = useCallback((receipt: OilReceipt) => {
    setOilReceiptsState((prev) => [...prev, receipt]);
  }, []);

  const updateOilReceipt = useCallback((receiptId: string, updates: Partial<OilReceipt>) => {
    setOilReceiptsState((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
    );
  }, []);

  const deleteOilReceipt = useCallback((receiptId: string) => {
    setOilReceiptsState((prev) => prev.filter((r) => r.id !== receiptId));
  }, []);

  // Tank Entries
  const createTankEntry = useCallback((entry: TankEntryRecord) => {
    setTankEntriesState((prev) => [...prev, entry]);
  }, []);

  const updateTankEntry = useCallback((entryId: string, updates: Partial<TankEntryRecord>) => {
    setTankEntriesState((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, ...updates } : entry))
    );
  }, []);

  // Getters
  const getOrderByNo = useCallback(
    (orderNo: string) => purchaseOrdersState.find((o) => o.orderNo === orderNo),
    [purchaseOrdersState]
  );

  const getTransportByNo = useCallback(
    (transportNo: string) =>
      transportDeliveriesState.find((t) => t.transportNo === transportNo),
    [transportDeliveriesState]
  );

  const getDriverJobByTransportNo = useCallback(
    (transportNo: string) => driverJobsState.find((j) => j.transportNo === transportNo),
    [driverJobsState]
  );

  const getDeliveryNoteByNo = useCallback(
    (deliveryNoteNo: string) =>
      deliveryNotesState.find((dn) => dn.deliveryNoteNo === deliveryNoteNo),
    [deliveryNotesState]
  );

  const getQuotationByNo = useCallback(
    (quotationNo: string) => quotationsState.find((q) => q.quotationNo === quotationNo),
    [quotationsState]
  );

  const getReceiptByNo = useCallback(
    (receiptNo: string) => receiptsState.find((r) => r.receiptNo === receiptNo),
    [receiptsState]
  );

  const getOilReceiptByNo = useCallback(
    (receiptNo: string) => oilReceiptsState.find((r) => r.receiptNo === receiptNo),
    [oilReceiptsState]
  );

  const getBranchById = useCallback(
    (branchId: number) => branches.find((b) => b.id === branchId),
    []
  );

  const getTruckById = useCallback(
    (truckId: string) => mockTrucks.find((t) => t.id === truckId),
    []
  );

  const getTrailerById = useCallback(
    (trailerId: string) => mockTrailers.find((t) => t.id === trailerId),
    []
  );

  const value: GasStationContextType = {
    // Data
    branches,
    legalEntities,
    orders: ordersState,
    purchaseOrders: purchaseOrdersState,
    quotations: quotationsState,
    deliveryNotes: deliveryNotesState,
    receipts: receiptsState,
    transportDeliveries: transportDeliveriesState,
    driverJobs: driverJobsState,
    oilReceipts: oilReceiptsState,
    tankEntries: tankEntriesState,
    trucks: mockTrucks,
    trailers: mockTrailers,
    runningNumbers: runningNumbersState,

    // Actions
    addOrder,
    updateOrder,
    approveOrder,
    createPurchaseOrder,
    updatePurchaseOrder,
    createQuotation,
    updateQuotation,
    confirmQuotation,
    createDeliveryNote,
    updateDeliveryNote,
    deleteDeliveryNote,
    signDeliveryNote,
    createReceipt,
    updateReceipt,
    deleteReceipt,
    issueReceipt,
    createTransportDelivery,
    updateTransportDelivery,
    startTransport,
    completeTransport,
    createDriverJob,
    updateDriverJob,
    updateDriverJobStatus,
    createOilReceipt,
    updateOilReceipt,
    deleteOilReceipt,
    createTankEntry,
    updateTankEntry,
    getNextRunningNumber,
    incrementRunningNumber,

    // Getters
    getOrderByNo,
    getTransportByNo,
    getDriverJobByTransportNo,
    getDeliveryNoteByNo,
    getQuotationByNo,
    getReceiptByNo,
    getOilReceiptByNo,
    getBranchById,
    getTruckById,
    getTrailerById,
  };

  return <GasStationContext.Provider value={value}>{children}</GasStationContext.Provider>;
}

export function useGasStation() {
  const context = useContext(GasStationContext);
  if (context === undefined) {
    throw new Error("useGasStation must be used within a GasStationProvider");
  }
  return context;
}
