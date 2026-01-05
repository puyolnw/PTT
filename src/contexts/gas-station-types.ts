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
import type { TruckProfile, Trailer } from "@/types/truck";

export interface GasStationContextType {
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
