// import { ApprovedOrder } from "./gasStationOrders";

// Interface สำหรับการทดสอบคุณภาพน้ำมัน
export interface QualityTest {
    apiGravity: number; // ค่า API Gravity
    waterContent: number; // ปริมาณน้ำ (%)
    temperature: number; // อุณหภูมิ (°C)
    color: string; // สี
    testResult: "ผ่าน" | "ไม่ผ่าน";
    testedBy: string; // ผู้ทดสอบ
    testDateTime: string;
    notes?: string;
}

// Interface สำหรับการวัดยอดใต้ดิน
export interface DipMeasurement {
    oilType: string;
    tankNumber: number;
    quantityOrdered: number; // จำนวนที่สั่ง (ลิตร)
    beforeDip: number; // ยอดก่อนรับ (ลิตร)
    afterDip: number; // ยอดหลังรับ (ลิตร)
    quantityReceived: number; // จำนวนที่รับจริง = afterDip - beforeDip
    differenceLiter: number; // ส่วนต่าง = quantityReceived - quantityOrdered
    differenceAmount: number; // มูลค่าส่วนต่าง
    pricePerLiter: number;
    gainLossReason?: string; // เหตุผลส่วนต่าง (ถ้ามี)
}

// Interface สำหรับเอกสารแนบ
export interface Attachment {
    id: string;
    type: "delivery_note" | "tax_invoice" | "photo" | "other";
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
}

// Interface สำหรับใบรับน้ำมัน
export interface OilReceipt {
    id: string;
    receiptNo: string; // เลขที่ใบรับน้ำมัน
    purchaseOrderNo: string; // เชื่อมกับ PO
    deliveryNoteNo: string; // เลขที่ใบส่งของจาก ปตท.
    receiveDate: string;
    receiveTime: string;

    // Truck & Driver Info
    truckLicensePlate: string;
    driverName: string;
    driverLicense?: string;

    // Quality Test (Mandatory)
    qualityTest: QualityTest;

    // Measurements
    items: DipMeasurement[];

    // Documents
    attachments: Attachment[];

    // Status & Approval
    status: "draft" | "completed" | "cancelled";
    receivedBy: string;
    receivedByName: string;
    approvedBy?: string;
    approvedByName?: string;
    approvedAt?: string;
    notes?: string;

    createdAt: string;
    updatedAt: string;
}

// Helper function: คำนวณ quantity received
export function calculateQuantityReceived(beforeDip: number, afterDip: number): number {
    return afterDip - beforeDip;
}

// Helper function: คำนวณส่วนต่าง
export function calculateDifference(quantityReceived: number, quantityOrdered: number): number {
    return quantityReceived - quantityOrdered;
}

// Helper function: คำนวณมูลค่าส่วนต่าง
export function calculateDifferenceAmount(differenceLiter: number, pricePerLiter: number): number {
    return differenceLiter * pricePerLiter;
}

// Helper function: ตรวจสอบว่าส่วนต่างเกินเกณฑ์หรือไม่
export function isToleranceExceeded(
    differenceLiter: number,
    quantityOrdered: number,
    tolerancePercent: number = 0.5
): boolean {
    const percentDiff = Math.abs((differenceLiter / quantityOrdered) * 100);
    return percentDiff > tolerancePercent;
}

// Helper function: ตรวจสอบผลการทดสอบคุณภาพ
export function evaluateQualityTest(test: Omit<QualityTest, "testResult">): "ผ่าน" | "ไม่ผ่าน" {
    // เกณฑ์มาตรฐาน (ปรับได้ตามความเหมาะสม)
    const API_MIN = 30;
    const API_MAX = 45;
    const WATER_MAX = 0.05; // 0.05%
    const TEMP_MIN = 15;
    const TEMP_MAX = 35;

    if (
        test.apiGravity < API_MIN ||
        test.apiGravity > API_MAX ||
        test.waterContent > WATER_MAX ||
        test.temperature < TEMP_MIN ||
        test.temperature > TEMP_MAX
    ) {
        return "ไม่ผ่าน";
    }

    return "ผ่าน";
}

// Mock data - ใบรับน้ำมัน
export const mockOilReceipts: OilReceipt[] = [
    {
        id: "REC-001",
        receiptNo: "REC-20241214-001",
        purchaseOrderNo: "SO-20241215-001",
        deliveryNoteNo: "PTT-DN-20241214-001",
        receiveDate: "2024-12-14",
        receiveTime: "09:30",
        truckLicensePlate: "กก-1234",
        driverName: "สมชาย ใจดี",
        driverLicense: "12345678",
        qualityTest: {
            apiGravity: 35.5,
            waterContent: 0.02,
            temperature: 28,
            color: "ใส",
            testResult: "ผ่าน",
            testedBy: "EMP-001",
            testDateTime: "2024-12-14 09:15",
            notes: "คุณภาพดีตามมาตรฐาน",
        },
        items: [
            {
                oilType: "Premium Diesel",
                tankNumber: 1,
                quantityOrdered: 32000,
                beforeDip: 5000,
                afterDip: 37100,
                quantityReceived: 32100,
                differenceLiter: 100,
                differenceAmount: 3250,
                pricePerLiter: 32.5,
                gainLossReason: "ความคลาดเคลื่อนปกติจากการขนส่ง",
            },
            {
                oilType: "Premium Gasohol 95",
                tankNumber: 2,
                quantityOrdered: 28000,
                beforeDip: 3000,
                afterDip: 30950,
                quantityReceived: 27950,
                differenceLiter: -50,
                differenceAmount: -1750,
                pricePerLiter: 35.0,
                gainLossReason: "ระเหยเล็กน้อยระหว่างขนส่ง",
            },
        ],
        attachments: [
            {
                id: "ATT-001",
                type: "delivery_note",
                fileName: "delivery_note_PTT-DN-20241214-001.pdf",
                fileUrl: "/uploads/delivery_notes/PTT-DN-20241214-001.pdf",
                uploadedAt: "2024-12-14 09:20",
            },
            {
                id: "ATT-002",
                type: "tax_invoice",
                fileName: "tax_invoice_PTT-20241214-001.pdf",
                fileUrl: "/uploads/tax_invoices/PTT-20241214-001.pdf",
                uploadedAt: "2024-12-14 09:25",
            },
            {
                id: "ATT-003",
                type: "photo",
                fileName: "truck_photo_1.jpg",
                fileUrl: "/uploads/photos/truck_photo_1.jpg",
                uploadedAt: "2024-12-14 09:30",
            },
        ],
        status: "completed",
        receivedBy: "EMP-001",
        receivedByName: "นายสมศักดิ์ ใจดี",
        approvedBy: "EMP-MANAGER",
        approvedByName: "คุณนิด",
        approvedAt: "2024-12-14 10:00",
        notes: "รับน้ำมันเรียบร้อย ส่วนต่างอยู่ในเกณฑ์ที่ยอมรับได้",
        createdAt: "2024-12-14 09:30",
        updatedAt: "2024-12-14 10:00",
    },
    {
        id: "REC-002",
        receiptNo: "REC-20241214-002",
        purchaseOrderNo: "SO-20241215-002",
        deliveryNoteNo: "PTT-DN-20241214-002",
        receiveDate: "2024-12-14",
        receiveTime: "14:00",
        truckLicensePlate: "ขข-5678",
        driverName: "วิชัย รักงาน",
        qualityTest: {
            apiGravity: 36.2,
            waterContent: 0.01,
            temperature: 27,
            color: "ใส",
            testResult: "ผ่าน",
            testedBy: "EMP-002",
            testDateTime: "2024-12-14 13:45",
        },
        items: [
            {
                oilType: "Diesel",
                tankNumber: 3,
                quantityOrdered: 35000,
                beforeDip: 8000,
                afterDip: 43000,
                quantityReceived: 35000,
                differenceLiter: 0,
                differenceAmount: 0,
                pricePerLiter: 30.0,
            },
        ],
        attachments: [
            {
                id: "ATT-004",
                type: "delivery_note",
                fileName: "delivery_note_PTT-DN-20241214-002.pdf",
                fileUrl: "/uploads/delivery_notes/PTT-DN-20241214-002.pdf",
                uploadedAt: "2024-12-14 13:50",
            },
        ],
        status: "completed",
        receivedBy: "EMP-002",
        receivedByName: "นางสาวสมหญิง ขยัน",
        approvedBy: "EMP-MANAGER",
        approvedByName: "คุณนิด",
        approvedAt: "2024-12-14 14:30",
        notes: "รับน้ำมันตรงตามที่สั่ง ไม่มีส่วนต่าง",
        createdAt: "2024-12-14 14:00",
        updatedAt: "2024-12-14 14:30",
    },
    {
        id: "REC-003",
        receiptNo: "REC-20241214-003",
        purchaseOrderNo: "SO-20241215-003",
        deliveryNoteNo: "PTT-DN-20241214-003",
        receiveDate: "2024-12-14",
        receiveTime: "16:30",
        truckLicensePlate: "คค-9012",
        driverName: "ประเสริฐ ขยัน",
        qualityTest: {
            apiGravity: 34.8,
            waterContent: 0.03,
            temperature: 29,
            color: "ใส",
            testResult: "ผ่าน",
            testedBy: "EMP-001",
            testDateTime: "2024-12-14 16:15",
        },
        items: [
            {
                oilType: "Gasohol 95",
                tankNumber: 4,
                quantityOrdered: 22000,
                beforeDip: 4000,
                afterDip: 25800,
                quantityReceived: 21800,
                differenceLiter: -200,
                differenceAmount: -7000,
                pricePerLiter: 35.0,
                gainLossReason: "ระเหยระหว่างขนส่งในช่วงอากาศร้อน",
            },
        ],
        attachments: [],
        status: "draft",
        receivedBy: "EMP-001",
        receivedByName: "นายสมศักดิ์ ใจดี",
        notes: "รอแนบเอกสารและอนุมัติ",
        createdAt: "2024-12-14 16:30",
        updatedAt: "2024-12-14 16:30",
    },
];
