import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
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
  InternalOilOrder,
  FuelingRecord,
  RunningNumber,
  SaleTx,
  InternalPumpSale,
} from "@/types/gasStation";
import type { TruckProfile, Trailer } from "@/pages/gas-station/TruckProfiles";
import { branches, legalEntities, mockOrderSummary, mockApprovedOrders } from "@/data/gasStationOrders";
import { mockOilReceipts } from "@/data/gasStationReceipts";
import { mockTrucks, mockTrailers } from "@/pages/gas-station/TruckProfiles";
import { mockDriverJobs } from "@/data/gasStationDriverJobs";
import { useBranch } from "@/contexts/BranchContext";

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
  allDriverJobs: DriverJob[];
  oilReceipts: OilReceipt[];
  internalOrders: InternalOilOrder[];
  allInternalOrders: InternalOilOrder[];
  internalPumpSales: InternalPumpSale[];
  allInternalPumpSales: InternalPumpSale[];
  tankEntries: TankEntryRecord[];
  trucks: TruckProfile[];
  trailers: Trailer[];
  saleTxs: SaleTx[];
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
  addFuelingRecord: (jobId: string, record: FuelingRecord) => void;

  // Actions - Oil Receipts
  createOilReceipt: (receipt: OilReceipt) => void;
  updateOilReceipt: (receiptId: string, updates: Partial<OilReceipt>) => void;
  deleteOilReceipt: (receiptId: string) => void;

  // Actions - Tank Entries
  createTankEntry: (entry: TankEntryRecord) => void;
  updateTankEntry: (entryId: string, updates: Partial<TankEntryRecord>) => void;

  // Actions - Internal Oil Orders
  createInternalOrder: (order: InternalOilOrder) => void;
  updateInternalOrder: (orderId: string, updates: Partial<InternalOilOrder>) => void;
  approveInternalOrder: (orderId: string, approvedBy: string, fromBranchId: number, items: InternalOilOrder["items"]) => void;
  cancelInternalOrder: (orderId: string, cancelledBy: string) => void;

  // Actions - Internal Pump Sales
  addInternalPumpSale: (sale: InternalPumpSale) => void;
  cancelInternalPumpSale: (saleId: string, cancelledBy: string) => void;
  recordInternalPayment: (saleId: string, amount: number, method: string, note?: string) => void;

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
  updateSaleTx: (txId: string, updates: Partial<SaleTx>, fullTx?: SaleTx) => void;
}

const GasStationContext = createContext<GasStationContextType | undefined>(undefined);

export function GasStationProvider({ children }: { children: ReactNode }) {
  const { selectedBranches } = useBranch();
  const selectedBranchIds = selectedBranches.map(id => Number(id));

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
      branchId: 2, // ดินดำ
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
      branchId: 3, // หนองจิก
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
  const [driverJobsState, setDriverJobsState] = useState<DriverJob[]>(mockDriverJobs);
  const [saleTxsState, setSaleTxsState] = useState<SaleTx[]>([]);

  // Initial load from delivery_mock_data.json if needed
  useEffect(() => {
    import("@/data/delivery_mock_data.json").then((data) => {
      if (data.saleTxs) {
        setSaleTxsState(data.saleTxs as SaleTx[]);
      }
    });
  }, []);
  const [oilReceiptsState, setOilReceiptsState] = useState<OilReceipt[]>(
    mockOilReceipts.map((receipt, index) => ({
      id: receipt.id,
      receiptNo: receipt.receiptNo,
      branchId: (index % 5) + 1, // กระจายไปตามสาขา 1-5
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
      ["internal-oil-order", { id: "rn-internal-oil-order", documentType: "internal-oil-order", prefix: "IO", year: 2024, currentNumber: 1, lastUpdated: new Date().toISOString() }],
      ["internal-pump-sale", { id: "rn-internal-pump-sale", documentType: "internal-pump-sale", prefix: "SL", year: 2024, currentNumber: 1, lastUpdated: new Date().toISOString() }],
    ])
  );

  const [internalOrdersState, setInternalOrdersState] = useState<InternalOilOrder[]>([
    {
      id: "IO-1",
      orderNo: "IO-20241215-001",
      orderDate: "2024-12-15",
      requestedDate: "2024-12-20",
      fromBranchId: 2,
      fromBranchName: "ดินดำ",
      items: [
        { oilType: "Premium Diesel", quantity: 5000, requestedQuantity: 5000, pricePerLiter: 0, totalAmount: 0 },
        { oilType: "Gasohol 95", quantity: 3000, requestedQuantity: 3000, pricePerLiter: 0, totalAmount: 0 },
      ],
      totalAmount: 0,
      status: "รออนุมัติ",
      requestedBy: "ผู้จัดการดินดำ",
      requestedAt: "2024-12-15T10:30:00",
    },
    {
      id: "IO-2",
      orderNo: "IO-20241216-001",
      orderDate: "2024-12-16",
      requestedDate: "2024-12-18",
      fromBranchId: 3,
      fromBranchName: "หนองจิก",
      assignedFromBranchId: 1,
      assignedFromBranchName: "ปั๊มไฮโซ",
      items: [
        { 
          oilType: "Diesel", 
          quantity: 10000, 
          requestedQuantity: 10000, 
          pricePerLiter: 30.0, 
          totalAmount: 300000,
          deliverySource: "truck",
          transportNo: "TP-20241216-001"
        },
      ],
      totalAmount: 300000,
      status: "อนุมัติแล้ว",
      requestedBy: "ผู้จัดการหนองจิก",
      requestedAt: "2024-12-16T09:15:00",
      approvedBy: "พี่นิด",
      approvedAt: "2024-12-16T14:20:00",
    },
    {
      id: "IO-SUC",
      orderNo: "IO-20241217-005",
      orderDate: "2024-12-17",
      requestedDate: "2024-12-22",
      fromBranchId: 4,
      fromBranchName: "บายพาส",
      items: [
        { 
          oilType: "Diesel", 
          quantity: 1000, 
          requestedQuantity: 1000, 
          pricePerLiter: 29.5, 
          totalAmount: 29500,
          deliverySource: "suction",
          transportNo: "SUC-20241217-001"
        },
      ],
      totalAmount: 29500,
      status: "อนุมัติแล้ว",
      requestedBy: "ผู้จัดการบายพาส",
      requestedAt: "2024-12-17T14:20:00",
      assignedFromBranchId: 1,
      assignedFromBranchName: "ปั๊มไฮโซ",
      approvedBy: "พี่นิด",
      approvedAt: "2024-12-17T15:00:00",
    },
    {
      id: "IO-3",
      orderNo: "IO-20241217-001",
      orderDate: "2024-12-17",
      requestedDate: "2024-12-17",
      fromBranchId: 5,
      fromBranchName: "บายพาส",
      assignedFromBranchId: 1,
      assignedFromBranchName: "ปั๊มไฮโซ",
      transportNo: "TP-20241215-001",
      deliveryDate: "2024-12-17",
      items: [
        { 
          oilType: "Gasohol 95", 
          quantity: 15000, 
          requestedQuantity: 15000, 
          pricePerLiter: 43.0, 
          totalAmount: 645000,
          transportNo: "TP-20241215-001",
          deliverySource: "truck"
        },
      ],
      totalAmount: 645000,
      status: "กำลังจัดส่ง",
      requestedBy: "ผู้จัดการบายพาส",
      requestedAt: "2024-12-17T08:00:00",
      approvedBy: "พี่นิด",
      approvedAt: "2024-12-17T08:30:00",
    },
    {
      id: "IO-4",
      orderNo: "IO-20241218-001",
      orderDate: "2024-12-14",
      requestedDate: "2024-12-14",
      fromBranchId: 2,
      fromBranchName: "ดินดำ",
      assignedFromBranchId: 1,
      assignedFromBranchName: "ปั๊มไฮโซ",
      transportNo: "TP-20241214-002",
      deliveryDate: "2024-12-14",
      items: [
        { 
          oilType: "Diesel", 
          quantity: 35000, 
          requestedQuantity: 35000, 
          unloadedQuantity: 30000,
          keptOnTruckQuantity: 5000,
          pricePerLiter: 30.0, 
          totalAmount: 1050000,
          transportNo: "TP-20241214-002",
          deliverySource: "truck"
        },
      ],
      totalAmount: 1050000,
      status: "ส่งแล้ว",
      requestedBy: "ผู้จัดการดินดำ",
      requestedAt: "2024-12-14T07:00:00",
      approvedBy: "พี่นิด",
      approvedAt: "2024-12-14T07:15:00",
      receivedByName: "นายนพดล ประจำปั๊ม",
      updatedAt: "2024-12-14T10:30:00",
    },
    {
      id: "IO-5",
      orderNo: "IO-20241219-001",
      orderDate: "2024-12-19",
      requestedDate: "2024-12-25",
      fromBranchId: 4,
      fromBranchName: "ตักสิลา",
      items: [
        { oilType: "E20", quantity: 5000, requestedQuantity: 5000, pricePerLiter: 0, totalAmount: 0 },
      ],
      totalAmount: 0,
      status: "ยกเลิก",
      requestedBy: "ผู้จัดการตักสิลา",
      requestedAt: "2024-12-19T11:00:00",
      notes: "ยกเลิกโดย พี่นิด เมื่อ 19/12/2024 13:00:00 เนื่องจากปั๊มต้นทางน้ำมันไม่พอ",
    },
    // Mock Data for Depot Orders (sourceType: external)
    {
      id: "DEPO-MOCK-1",
      orderNo: "DEPO-250110-001",
      orderDate: "2025-01-10",
      requestedDate: "2025-01-15",
      fromBranchId: 2,
      fromBranchName: "ดินดำ",
      sourceType: "external",
      items: [
        { oilType: "Diesel", quantity: 15000, requestedQuantity: 15000, pricePerLiter: 0, totalAmount: 0 },
        { oilType: "Gasohol 95", quantity: 5000, requestedQuantity: 5000, pricePerLiter: 0, totalAmount: 0 },
      ],
      totalAmount: 0,
      status: "รออนุมัติ",
      requestedBy: "สมชาย ดินดำ",
      requestedAt: "2025-01-10T08:30:00",
    },
    {
      id: "DEPO-MOCK-2",
      orderNo: "DEPO-250109-005",
      orderDate: "2025-01-09",
      requestedDate: "2025-01-12",
      fromBranchId: 3,
      fromBranchName: "หนองจิก",
      sourceType: "external",
      assignedFromBranchId: 1,
      assignedFromBranchName: "ปั๊มไฮโซ",
      items: [
        { oilType: "Premium Diesel", quantity: 10000, requestedQuantity: 10000, pricePerLiter: 32.5, totalAmount: 325000 },
      ],
      totalAmount: 325000,
      status: "อนุมัติแล้ว",
      requestedBy: "สมศรี หนองจิก",
      requestedAt: "2025-01-09T14:20:00",
      approvedBy: "พี่นิด",
      approvedAt: "2025-01-09T16:00:00",
    },
    {
      id: "DEPO-MOCK-3",
      orderNo: "DEPO-250108-002",
      orderDate: "2025-01-08",
      requestedDate: "2025-01-10",
      fromBranchId: 4,
      fromBranchName: "ตักสิลา",
      sourceType: "external",
      assignedFromBranchId: 1,
      assignedFromBranchName: "ปั๊มไฮโซ",
      transportNo: "TP-250110-DEP1",
      deliveryDate: "2025-01-10",
      items: [
        { 
          oilType: "Gasohol 95", 
          quantity: 12000, 
          requestedQuantity: 12000, 
          pricePerLiter: 38.0, 
          totalAmount: 456000,
          transportNo: "TP-250110-DEP1",
          deliverySource: "truck"
        },
      ],
      totalAmount: 456000,
      status: "กำลังจัดส่ง",
      requestedBy: "สมใจ ตักสิลา",
      requestedAt: "2025-01-08T10:00:00",
      approvedBy: "พี่นิด",
      approvedAt: "2025-01-08T11:30:00",
    },
    {
      id: "DEPO-MOCK-4",
      orderNo: "DEPO-250105-001",
      orderDate: "2025-01-05",
      requestedDate: "2025-01-07",
      fromBranchId: 5,
      fromBranchName: "บายพาส",
      sourceType: "external",
      assignedFromBranchId: 1,
      assignedFromBranchName: "ปั๊มไฮโซ",
      transportNo: "TP-250107-DEP2",
      deliveryDate: "2025-01-07",
      items: [
        { 
          oilType: "Diesel", 
          quantity: 20000, 
          requestedQuantity: 20000, 
          unloadedQuantity: 18000,
          keptOnTruckQuantity: 2000,
          pricePerLiter: 30.0, 
          totalAmount: 600000,
          transportNo: "TP-250107-DEP2",
          deliverySource: "truck"
        },
      ],
      totalAmount: 600000,
      status: "ส่งแล้ว",
      requestedBy: "วิชัย บายพาส",
      requestedAt: "2025-01-05T09:00:00",
      approvedBy: "พี่นิด",
      approvedAt: "2025-01-05T10:00:00",
      receivedByName: "นายกิตติ",
      updatedAt: "2025-01-07T14:30:00",
    },
    {
      id: "DEPO-MOCK-5",
      orderNo: "DEPO-250101-009",
      orderDate: "2025-01-01",
      requestedDate: "2025-01-05",
      fromBranchId: 2,
      fromBranchName: "ดินดำ",
      sourceType: "external",
      items: [
        { oilType: "E20", quantity: 8000, requestedQuantity: 8000, pricePerLiter: 0, totalAmount: 0 },
      ],
      totalAmount: 0,
      status: "ยกเลิก",
      requestedBy: "สมชาย ดินดำ",
      requestedAt: "2025-01-01T11:00:00",
      notes: "ยกเลิกเนื่องจากคลัง ปตท. แจ้งสินค้าหมดชั่วคราว",
    },
  ]);

  const [internalPumpSalesState, setInternalPumpSalesState] = useState<InternalPumpSale[]>([
    {
      id: "IPS-1",
      saleNo: "DN-MOCK-009",
      saleDate: "2025-01-03",
      saleType: "🚚 ขายน้ำมันค้างรถ",
      branchId: 2,
      branchName: "ดินดำ",
      buyerBranchId: 1,
      buyerBranchName: "ปั๊มไฮโซ",
      items: [
        { oilType: "Diesel", quantity: 2750, pricePerLiter: 30.0, totalAmount: 82500 },
      ],
      totalAmount: 82500,
      paidAmount: 82500,
      paymentRequestStatus: "none",
      paymentMethod: "เงินโอน",
      customerType: "รถบริษัท",
      recordedBy: "สมศรี ดินดำ",
      recordedAt: "2025-01-03T14:30:00",
      status: "ปกติ",
      notes: "ขายจากรถขนส่ง อ้างอิง IO-20241218-001",
      paymentHistory: [
        { date: "2025-01-03T15:00:00", amount: 82500, method: "เงินโอน", note: "ชำระค่าซื้อน้ำมันภายใน" }
      ],
      taxInvoices: [
        { invoiceNo: "INV-250103-009", date: "2025-01-03T15:00:00", amount: 82500 }
      ]
    },
    {
      id: "IPS-2",
      saleNo: "DN-MOCK-004",
      saleDate: "2024-12-20",
      saleType: "🚚 ขายน้ำมันค้างรถ",
      branchId: 2,
      branchName: "ดินดำ",
      buyerBranchId: 4,
      buyerBranchName: "ปั๊มตักสิลา",
      items: [
        { oilType: "Diesel", quantity: 3100, pricePerLiter: 30.0, totalAmount: 93000 },
      ],
      totalAmount: 93000,
      paidAmount: 93000,
      paymentRequestStatus: "none",
      paymentMethod: "เงินโอน",
      customerType: "รถบริษัท",
      recordedBy: "สมศรี ดินดำ",
      recordedAt: "2024-12-20T09:15:00",
      status: "ปกติ",
      paymentHistory: [
        { date: "2024-12-20T10:30:00", amount: 93000, method: "เงินโอน", note: "ชำระเรียบร้อย" }
      ],
      taxInvoices: [
        { invoiceNo: "INV-241220-004", date: "2024-12-20T10:30:00", amount: 93000 }
      ]
    },
    {
      id: "IPS-3",
      saleNo: "DN-MOCK-001",
      saleDate: "2024-12-15",
      saleType: "🚚 ขายน้ำมันค้างรถ",
      branchId: 2,
      branchName: "ดินดำ",
      buyerBranchId: 1,
      buyerBranchName: "ปั๊มไฮโซ",
      items: [
        { oilType: "Diesel", quantity: 2958, pricePerLiter: 30.0, totalAmount: 88750 },
      ],
      totalAmount: 88750,
      paidAmount: 0,
      paymentRequestStatus: "none",
      paymentMethod: "เครดิต",
      customerType: "รถบริษัท",
      recordedBy: "สมศรี ดินดำ",
      recordedAt: "2024-12-15T16:45:00",
      status: "ปกติ",
      paymentHistory: [],
      taxInvoices: []
    },
    {
      id: "IPS-4",
      saleNo: "DN-240502-REC01",
      saleDate: "2024-05-02",
      saleType: "💉 ขายน้ำมันจากการดูด",
      branchId: 2,
      branchName: "ดินดำ",
      buyerBranchId: 2,
      buyerBranchName: "ปั๊มดินดำ (Recycle)",
      items: [
        { oilType: "Gasohol 95", quantity: 150, pricePerLiter: 29.5, totalAmount: 4425 },
      ],
      totalAmount: 4425,
      paidAmount: 4425,
      paymentRequestStatus: "none",
      paymentMethod: "เงินสด",
      customerType: "ทั่วไป",
      recordedBy: "สมศรี ดินดำ",
      recordedAt: "2024-05-02T11:20:00",
      status: "ปกติ",
      paymentHistory: [
        { date: "2024-05-02T11:20:00", amount: 4425, method: "เงินสด", note: "รับเงินสดหน้างาน" }
      ],
      taxInvoices: [
        { invoiceNo: "INV-240502-R01", date: "2024-05-02T11:20:00", amount: 4425 }
      ]
    },
    {
      id: "IPS-5",
      saleNo: "HQ-MOCK-001",
      saleDate: "2024-12-15",
      saleType: "🚚 ขายน้ำมันค้างรถ",
      branchId: 1,
      branchName: "ปั๊มไฮโซ",
      buyerBranchId: 2,
      buyerBranchName: "ปั้มดินดำ",
      items: [
        { oilType: "Diesel", quantity: 2500, pricePerLiter: 30.0, totalAmount: 75000 },
      ],
      totalAmount: 75000,
      paidAmount: 25000,
      paymentRequestStatus: "none",
      paymentMethod: "เครดิต",
      customerType: "รถบริษัท",
      recordedBy: "ผู้จัดการปั๊มไฮโซ",
      recordedAt: "2024-12-15T10:00:00",
      status: "ปกติ",
      paymentHistory: [
        { date: "2024-12-20T14:00:00", amount: 25000, method: "เงินโอน", note: "ชำระบางส่วนรอบแรก" }
      ],
      taxInvoices: [
        { invoiceNo: "INV-241220-001", date: "2024-12-20T14:00:00", amount: 25000 }
      ]
    },
    {
      id: "IPS-6",
      saleNo: "NJ-MOCK-001",
      saleDate: "2024-12-10",
      saleType: "💉 ขายน้ำมันจากการดูด",
      branchId: 3,
      branchName: "ปั้มหนองจิก",
      buyerBranchId: 2,
      buyerBranchName: "ปั้มดินดำ",
      items: [
        { oilType: "Gasohol 95", quantity: 2000, pricePerLiter: 29.5, totalAmount: 59000 },
      ],
      totalAmount: 59000,
      paidAmount: 0,
      paymentRequestStatus: "none",
      paymentMethod: "เครดิต",
      customerType: "รถบริษัท",
      recordedBy: "ผู้จัดการหนองจิก",
      recordedAt: "2024-12-10T09:30:00",
      status: "ปกติ",
      paymentHistory: [],
      taxInvoices: []
    },
    {
      id: "IPS-7",
      saleNo: "HQ-MOCK-002",
      saleDate: "2024-11-20",
      saleType: "🚚 ขายน้ำมันค้างรถ",
      branchId: 1,
      branchName: "ปั๊มไฮโซ",
      buyerBranchId: 2,
      buyerBranchName: "ปั้มดินดำ",
      items: [
        { oilType: "Diesel", quantity: 5000, pricePerLiter: 30.0, totalAmount: 150000 },
      ],
      totalAmount: 150000,
      paidAmount: 150000,
      paymentRequestStatus: "none",
      paymentMethod: "เครดิต",
      customerType: "รถบริษัท",
      recordedBy: "ผู้จัดการปั๊มไฮโซ",
      recordedAt: "2024-11-20T10:00:00",
      status: "ปกติ",
      paymentHistory: [
        { date: "2024-11-25T09:30:00", amount: 50000, method: "เงินโอน", note: "ชำระรอบที่ 1" },
        { date: "2024-11-30T14:15:00", amount: 50000, method: "เงินโอน", note: "ชำระรอบที่ 2" },
        { date: "2024-12-05T11:00:00", amount: 50000, method: "เงินโอน", note: "ชำระรอบสุดท้าย" }
      ],
      taxInvoices: [
        { invoiceNo: "INV-241125-001", date: "2024-11-25T09:30:00", amount: 50000 },
        { invoiceNo: "INV-241130-001", date: "2024-11-30T14:15:00", amount: 50000 },
        { invoiceNo: "INV-241205-001", date: "2024-12-05T11:00:00", amount: 50000 }
      ]
    },
    // Mock Data for External Sector Sales (Government/Private) - Only for HISO (Branch 1)
    {
      id: "IPS-EXT-1",
      saleNo: "SL-EXT-20250109-001",
      saleDate: "2025-01-09",
      saleType: "📦 ขายจากคลัง",
      branchId: 1,
      branchName: "ปั๊มไฮโซ",
      customerName: "องค์การบริหารส่วนจังหวัดมหาสารคาม",
      customerType: "ภาครัฐ",
      customerTaxId: "0994000161404",
      customerAddress: "ต.แวงน่าง อ.เมือง จ.มหาสารคาม 44000",
      items: [
        { oilType: "Diesel", quantity: 5000, pricePerLiter: 32.5, totalAmount: 162500 }
      ],
      totalAmount: 162500,
      paidAmount: 0,
      paymentRequestStatus: "none",
      paymentMethod: "เครดิต",
      recordedBy: "พี่นิด",
      recordedAt: "2025-01-09T09:00:00",
      status: "ปกติ"
    },
    {
      id: "IPS-EXT-2",
      saleNo: "SL-EXT-20250109-002",
      saleDate: "2025-01-09",
      saleType: "📦 ขายจากคลัง",
      branchId: 1,
      branchName: "ปั๊มไฮโซ",
      customerName: "บริษัท รับเหมาก่อสร้าง จำกัด (มหาชน)",
      customerType: "เอกชน",
      customerTaxId: "0107537000521",
      customerAddress: "123 ถ.หลักเมือง อ.บรบือ จ.มหาสารคาม 44130",
      items: [
        { oilType: "Gasohol 95", quantity: 2000, pricePerLiter: 38.0, totalAmount: 76000 },
        { oilType: "Diesel", quantity: 1000, pricePerLiter: 32.5, totalAmount: 32500 }
      ],
      totalAmount: 108500,
      paidAmount: 108500,
      paymentRequestStatus: "none",
      paymentMethod: "เงินโอน",
      recordedBy: "พี่นิด",
      recordedAt: "2025-01-09T10:30:00",
      status: "ปกติ",
      paymentHistory: [
        { date: "2025-01-09T10:35:00", amount: 108500, method: "เงินโอน", note: "โอนชำระเต็มจำนวน" }
      ],
      taxInvoices: [
        { invoiceNo: "INV-250109-789", date: "2025-01-09T10:35:00", amount: 108500 }
      ]
    },
    {
      id: "IPS-8",
      saleNo: "BP-MOCK-001",
      saleDate: "2024-12-08",
      saleType: "💉 ขายน้ำมันจากการดูด",
      branchId: 4,
      branchName: "ปั้มบายพาส",
      buyerBranchId: 2,
      buyerBranchName: "ปั้มดินดำ",
      items: [
        { oilType: "Gasohol 91", quantity: 1500, pricePerLiter: 28.5, totalAmount: 42750 },
      ],
      totalAmount: 42750,
      paidAmount: 20000,
      paymentRequestStatus: "none",
      paymentMethod: "เครดิต",
      customerType: "รถบริษัท",
      recordedBy: "ผู้จัดการบายพาส",
      recordedAt: "2024-12-08T13:20:00",
      status: "ปกติ",
      paymentHistory: [
        { date: "2024-12-12T10:00:00", amount: 20000, method: "เงินโอน", note: "ชำระส่วนแรก" }
      ],
      taxInvoices: [
        { invoiceNo: "INV-241212-001", date: "2024-12-12T10:00:00", amount: 20000 }
      ]
    }
  ]);

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
  
  const addFuelingRecord = useCallback((jobId: string, record: FuelingRecord) => {
    setDriverJobsState((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            fuelingRecords: [...(job.fuelingRecords || []), record],
          };
        }
        return job;
      })
    );
  }, []);

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

  // Internal Oil Orders
  const createInternalOrder = useCallback((order: InternalOilOrder) => {
    setInternalOrdersState((prev) => [...prev, order]);
    incrementRunningNumber("internal-oil-order");
  }, [incrementRunningNumber]);

  const updateInternalOrder = useCallback((orderId: string, updates: Partial<InternalOilOrder>) => {
    setInternalOrdersState((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, ...updates, updatedAt: new Date().toISOString() } : order))
    );
  }, []);

  const approveInternalOrder = useCallback((orderId: string, approvedBy: string, fromBranchId: number, items: InternalOilOrder["items"]) => {
    const fromBranch = branches.find(b => b.id === fromBranchId);
    const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);
    updateInternalOrder(orderId, {
      status: "อนุมัติแล้ว",
      approvedBy,
      approvedAt: new Date().toISOString(),
      assignedFromBranchId: fromBranchId,
      assignedFromBranchName: fromBranch?.name,
      items,
      totalAmount
    });
  }, [updateInternalOrder]);

  const cancelInternalOrder = useCallback((orderId: string, cancelledBy: string) => {
    updateInternalOrder(orderId, {
      status: "ยกเลิก",
      notes: `ยกเลิกโดย ${cancelledBy} เมื่อ ${new Date().toLocaleString()}`
    });
  }, [updateInternalOrder]);

  // Internal Pump Sales
  const addInternalPumpSale = useCallback((sale: InternalPumpSale) => {
    setInternalPumpSalesState((prev) => [...prev, sale]);
    incrementRunningNumber("internal-pump-sale");
  }, [incrementRunningNumber]);

  const cancelInternalPumpSale = useCallback((saleId: string, cancelledBy: string) => {
    setInternalPumpSalesState((prev) =>
      prev.map((sale) => (sale.id === saleId ? { ...sale, status: "ยกเลิก", notes: `ยกเลิกโดย ${cancelledBy} เมื่อ ${new Date().toLocaleString()}` } : sale))
    );
  }, []);

  const recordInternalPayment = useCallback((saleId: string, amount: number, method: string, note?: string) => {
    setInternalPumpSalesState((prev) =>
      prev.map((sale) => {
        if (sale.id === saleId) {
          const now = new Date().toISOString();
          const newPaidAmount = (sale.paidAmount || 0) + amount;
          
          const newHistory = [
            ...(sale.paymentHistory || []),
            { date: now, amount, method, note }
          ];

          // Auto-generate Tax Invoice - ออกใบกำกับภาษีอัตโนมัติตามยอดเงินที่จ่าย
          const dateStr = now.replace(/[-:T]/g, "").slice(2, 8); // YYMMDD
          const invoiceNo = `INV-${dateStr}-${String(Math.floor(100 + Math.random() * 900)).padStart(3, '0')}`;
          const newInvoices = [
            ...(sale.taxInvoices || []),
            { invoiceNo, date: now, amount }
          ];

          return {
            ...sale,
            paidAmount: newPaidAmount,
            paymentHistory: newHistory,
            taxInvoices: newInvoices,
            paymentRequestStatus: newPaidAmount >= sale.totalAmount ? "approved" : sale.paymentRequestStatus
          };
        }
        return sale;
      })
    );
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

  const updateSaleTx = useCallback((txId: string, updates: Partial<SaleTx>, fullTx?: SaleTx) => {
    setSaleTxsState((prev) => {
      const exists = prev.some((tx) => tx.id === txId);
      if (exists) {
        return prev.map((tx) => (tx.id === txId ? { ...tx, ...updates } : tx));
      } else if (fullTx) {
        // If it doesn't exist, we can "promote" it to a real transaction
        return [...prev, { ...fullTx, ...updates }];
      }
      return prev;
    });
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
    runningNumbers: runningNumbersState,

    // Filtered Data based on selected branches
    orders: ordersState.filter(o => selectedBranchIds.length === 0 || selectedBranchIds.includes(o.branchId)),
    purchaseOrders: purchaseOrdersState.filter(po => 
      selectedBranchIds.length === 0 || po.branches.some(b => selectedBranchIds.includes(b.branchId))
    ),
    quotations: quotationsState.filter(q => 
      selectedBranchIds.length === 0 || q.branches.some(b => selectedBranchIds.includes(b.branchId))
    ),
    deliveryNotes: deliveryNotesState.filter(dn => 
      selectedBranchIds.length === 0 || selectedBranchIds.includes(dn.toBranchId) || selectedBranchIds.includes(dn.fromBranchId)
    ),
    receipts: receiptsState.filter(r => 
      selectedBranchIds.length === 0 || selectedBranchIds.includes(r.branchId)
    ),
    transportDeliveries: transportDeliveriesState.filter(t => 
      selectedBranchIds.length === 0 || 
      selectedBranchIds.includes(t.sourceBranchId) || 
      t.destinationBranchIds.some(bid => selectedBranchIds.includes(bid))
    ),
    driverJobs: driverJobsState.filter(j => 
      selectedBranchIds.length === 0 || 
      selectedBranchIds.includes(j.sourceBranchId) ||
      j.destinationBranches.some(b => selectedBranchIds.includes(b.branchId))
    ),
    allDriverJobs: driverJobsState,
    oilReceipts: oilReceiptsState.filter(r => 
      selectedBranchIds.length === 0 || selectedBranchIds.includes(r.branchId)
    ),
    saleTxs: saleTxsState.filter(tx => 
      selectedBranchIds.length === 0 || selectedBranchIds.includes(tx.fromBranchId) || selectedBranchIds.includes(tx.toBranchId)
    ),
    tankEntries: tankEntriesState.filter(te => 
      selectedBranchIds.length === 0 || selectedBranchIds.includes(te.branchId)
    ),
    internalOrders: internalOrdersState.filter(o => {
      if (selectedBranchIds.length === 0) return true;
      // ถ้าเลือก "ปั๊มไฮโซ" (ID 1) ให้เห็นคำสั่งซื้อทั้งหมด (เพราะปั๊มไฮโซเป็นคนจัดการคำสั่งซื้อจากปั๊มย่อยทั้งหมด)
      if (selectedBranchIds.includes(1)) return true;
      // ถ้าเลือกปั๊มย่อย ให้เห็นเฉพาะของปั๊มย่อยนั้นๆ
      return selectedBranchIds.includes(o.fromBranchId) || (o.assignedFromBranchId && selectedBranchIds.includes(o.assignedFromBranchId));
    }),
    allInternalOrders: internalOrdersState,
    internalPumpSales: internalPumpSalesState.filter(s => selectedBranchIds.length === 0 || selectedBranchIds.includes(s.branchId)),
    allInternalPumpSales: internalPumpSalesState,
    trucks: mockTrucks,
    trailers: mockTrailers,

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
    addFuelingRecord,
    createOilReceipt,
    updateOilReceipt,
    deleteOilReceipt,
    createTankEntry,
    updateTankEntry,
    createInternalOrder,
    updateInternalOrder,
    approveInternalOrder,
    cancelInternalOrder,
    addInternalPumpSale,
    cancelInternalPumpSale,
    recordInternalPayment,
    getNextRunningNumber,
    incrementRunningNumber,
    updateSaleTx,

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
