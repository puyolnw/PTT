// Interface สำหรับบันทึกประวัติการทำงานของระบบปั๊มน้ำมัน
export interface GasStationActivity {
    id: string;
    timestamp: string; // วันที่และเวลา
    module: string; // โมดูล/หน้า เช่น "บันทึกใบเสนอราคาจากปตท.", "รับน้ำมันจาก ปตท"
    action: "create" | "update" | "delete" | "approve" | "reject" | "cancel" | "complete"; // การกระทำ
    recordId: string; // ID ของรายการที่ทำการกระทำ เช่น "SO-20241215-001"
    recordType: string; // ประเภทของรายการ เช่น "PurchaseOrder", "OilReceipt", "TankEntry"
    
    // ข้อมูลผู้ใช้
    userId: string; // ID ผู้ใช้
    userName: string; // ชื่อผู้ใช้
    
    // รายละเอียด
    description: string; // คำอธิบายการกระทำ
    details?: Record<string, any>; // รายละเอียดเพิ่มเติม (JSON)
    changes?: {
        before?: Record<string, any>; // ข้อมูลก่อนแก้ไข
        after?: Record<string, any>; // ข้อมูลหลังแก้ไข
    };
    
    // ข้อมูลระบบ
    ipAddress?: string; // IP Address
    userAgent?: string; // User Agent
    
    // สถานะ
    status: "success" | "failed" | "pending";
    errorMessage?: string; // ข้อความ error (ถ้ามี)
}

// Mock data สำหรับประวัติการทำงาน
export const mockGasStationActivities: GasStationActivity[] = [
    {
        id: "ACT-001",
        timestamp: "2024-12-15T10:30:00",
        module: "บันทึกใบเสนอราคาจากปตท.",
        action: "create",
        recordId: "QT-20241215-001",
        recordType: "Quotation",
        userId: "EMP-001",
        userName: "นายสมศักดิ์ ใจดี",
        description: "บันทึกใบเสนอราคาจากปตท. หมายเลข QT-20241215-001",
        status: "success",
    },
    {
        id: "ACT-002",
        timestamp: "2024-12-15T09:15:00",
        module: "รับน้ำมันจาก ปตท",
        action: "create",
        recordId: "REC-20241215-001",
        recordType: "OilReceipt",
        userId: "EMP-002",
        userName: "นางสาวสมหญิง รักงาน",
        description: "รับน้ำมันจาก ปตท จำนวน 32,000 ลิตร",
        status: "success",
    },
];

// Helper function: บันทึกประวัติการทำงาน
export function logActivity(activity: Omit<GasStationActivity, "id" | "timestamp">): void {
    const newActivity: GasStationActivity = {
        ...activity,
        id: `ACT-${Date.now()}`,
        timestamp: new Date().toISOString(),
    };
    
    // ใน production จะบันทึกลง database
    // ตอนนี้ใช้ mock data
    mockGasStationActivities.unshift(newActivity);
    
    console.log("Activity logged:", newActivity);
}

// Helper function: ดึงประวัติการทำงานตามโมดูล
export function getActivitiesByModule(module: string): GasStationActivity[] {
    return mockGasStationActivities.filter((activity) => activity.module === module);
}

// Helper function: ดึงประวัติการทำงานตาม recordId
export function getActivitiesByRecordId(recordId: string): GasStationActivity[] {
    return mockGasStationActivities.filter((activity) => activity.recordId === recordId);
}
