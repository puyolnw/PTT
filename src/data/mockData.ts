// 🇹🇭 Mock Data สำหรับระบบ HR Management (PTT Theme)
// ใช้ชั่วคราว จนกว่าจะต่อ Backend

// ========== 1) EMPLOYEES (พนักงาน) ==========
export interface Employee {
  id: number;
  code: string;
  name: string;
  dept: string;
  position: string;
  status: "Active" | "Leave" | "Resigned";
  startDate: string;
  email?: string;
  phone?: string;
  avatar?: string;
  shiftId?: number; // Reference to shift
  otRate?: number; // OT Rate (บาท/ชั่วโมง)
  category?: string; // หมวดหมู่พนักงาน (ปั๊ม, เซเว่น, ปึงหงี่เชียง, ฯลฯ)
}

export const employees: Employee[] = [
  // หน้าลาน (น้ำมัน) - กลางวัน
  { id: 1, code: "EMP-0001", name: "สมชาย ใจดี", dept: "หน้าลาน (เติมน้ำมัน)", position: "หัวหน้าปั๊ม", status: "Active", startDate: "2023-06-01", email: "somchai@ptt.co.th", phone: "081-234-5678", avatar: "https://ui-avatars.com/api/?name=สมชาย+ใจดี&background=2867e0&color=fff", shiftId: 1, otRate: 250, category: "หน้าลาน (เติมน้ำมัน)" },
  { id: 2, code: "EMP-0002", name: "สมหญิง รักงาน", dept: "หน้าลาน (เติมน้ำมัน)", position: "แคชเชียร์", status: "Active", startDate: "2022-11-15", email: "somying@ptt.co.th", phone: "082-345-6789", avatar: "https://ui-avatars.com/api/?name=สมหญิง+รักงาน&background=19b7ff&color=fff", shiftId: 38, otRate: 200, category: "หน้าลาน (เติมน้ำมัน)" },
  { id: 3, code: "EMP-0003", name: "วรพล ตั้งใจ", dept: "หน้าลาน (เติมน้ำมัน)", position: "พนักงานปั๊ม", status: "Active", startDate: "2024-01-10", email: "worapol@ptt.co.th", phone: "083-456-7890", avatar: "https://ui-avatars.com/api/?name=วรพล+ตั้งใจ&background=e41f2b&color=fff", shiftId: 39, otRate: 220, category: "หน้าลาน (เติมน้ำมัน)" },
  // หน้าลาน (น้ำมัน) - กลางคืน
  { id: 13, code: "EMP-0013", name: "ประยุทธ์ กลางคืน", dept: "หน้าลาน (เติมน้ำมัน)", position: "พนักงานปั๊ม", status: "Active", startDate: "2023-05-01", email: "prayut@ptt.co.th", phone: "093-456-7890", avatar: "https://ui-avatars.com/api/?name=ประยุทธ์+กลางคืน&background=2867e0&color=fff", shiftId: 43, otRate: 230, category: "หน้าลาน (เติมน้ำมัน)" },
  { id: 14, code: "EMP-0014", name: "สุรชัย ดึก", dept: "หน้าลาน (เติมน้ำมัน)", position: "พนักงานปั๊ม", status: "Active", startDate: "2023-08-15", email: "surachai@ptt.co.th", phone: "094-567-8901", avatar: "https://ui-avatars.com/api/?name=สุรชัย+ดึก&background=19b7ff&color=fff", shiftId: 44, otRate: 240, category: "หน้าลาน (เติมน้ำมัน)" },
  // 7-Eleven
  { id: 4, code: "EMP-0004", name: "กิตติคุณ ใฝ่รู้", dept: "เซเว่น", position: "พนักงานร้าน", status: "Active", startDate: "2024-03-20", email: "kittikun@ptt.co.th", phone: "084-567-8901", avatar: "https://ui-avatars.com/api/?name=กิตติคุณ+ใฝ่รู้&background=2867e0&color=fff", shiftId: 27, otRate: 180, category: "เซเว่น" },
  { id: 15, code: "EMP-0015", name: "นันทนา เซเว่น", dept: "เซเว่น", position: "พนักงานร้าน", status: "Active", startDate: "2024-04-10", email: "nantana@ptt.co.th", phone: "095-678-9012", avatar: "https://ui-avatars.com/api/?name=นันทนา+เซเว่น&background=19b7ff&color=fff", shiftId: 28, otRate: 190, category: "เซเว่น" },
  { id: 16, code: "EMP-0016", name: "วิชัย ดึก", dept: "เซเว่น", position: "พนักงานร้าน", status: "Active", startDate: "2023-12-01", email: "wichai@ptt.co.th", phone: "096-789-0123", avatar: "https://ui-avatars.com/api/?name=วิชัย+ดึก&background=e41f2b&color=fff", shiftId: 29, otRate: 200, category: "เซเว่น" },
  // ร้านของฝาก (ปึงหงี่เซียง)
  { id: 5, code: "EMP-0005", name: "พิมพ์ชนก สมใจ", dept: "ปึงหงี่เซียง", position: "หัวหน้าร้าน", status: "Active", startDate: "2021-08-05", email: "pimchanok@ptt.co.th", phone: "085-678-9012", avatar: "https://ui-avatars.com/api/?name=พิมพ์ชนก+สมใจ&background=19b7ff&color=fff", shiftId: 16, otRate: 300, category: "ปึงหงี่เซียง" },
  { id: 17, code: "EMP-0017", name: "รัตนา ปึงหงี่", dept: "ปึงหงี่เซียง", position: "พนักงานร้าน", status: "Active", startDate: "2024-02-20", email: "rattana@ptt.co.th", phone: "097-890-1234", avatar: "https://ui-avatars.com/api/?name=รัตนา+ปึงหงี่&background=19b7ff&color=fff", shiftId: 18, otRate: 200, category: "ปึงหงี่เซียง" },
  { id: 6, code: "EMP-0006", name: "ธีรภัทร แข็งแรง", dept: "เจ้าสัว", position: "พนักงานร้าน", status: "Active", startDate: "2023-02-14", email: "teerabhat@ptt.co.th", phone: "086-789-0123", avatar: "https://ui-avatars.com/api/?name=ธีรภัทร+แข็งแรง&background=2867e0&color=fff", shiftId: 33, otRate: 190, category: "เจ้าสัว" },
  { id: 7, code: "EMP-0007", name: "ประเสริฐ ดีงาม", dept: "ร้านเจียง", position: "พนักงานร้าน", status: "Active", startDate: "2024-05-01", email: "prasert@ptt.co.th", phone: "087-890-1234", avatar: "https://ui-avatars.com/api/?name=ประเสริฐ+ดีงาม&background=e41f2b&color=fff", shiftId: 30, otRate: 200, category: "ร้านเจียง" },
  { id: 18, code: "EMP-0018", name: "สมศักดิ์ เจียง", dept: "ร้านเจียง", position: "พนักงานร้าน", status: "Active", startDate: "2024-03-15", email: "somsak@ptt.co.th", phone: "098-901-2345", avatar: "https://ui-avatars.com/api/?name=สมศักดิ์+เจียง&background=2867e0&color=fff", shiftId: 31, otRate: 195, category: "ร้านเจียง" },
  // Chester's
  { id: 8, code: "EMP-0008", name: "อัญชลี มีชัย", dept: "ร้านเชสเตอร์", position: "พนักงานร้าน", status: "Active", startDate: "2023-09-10", email: "anchalee@ptt.co.th", phone: "088-901-2345", avatar: "https://ui-avatars.com/api/?name=อัญชลี+มีชัย&background=19b7ff&color=fff", shiftId: 19, otRate: 250, category: "ร้านเชสเตอร์" },
  { id: 19, code: "EMP-0019", name: "สุภาพ เชสเตอร์", dept: "ร้านเชสเตอร์", position: "พนักงานร้าน", status: "Active", startDate: "2024-01-20", email: "supap@ptt.co.th", phone: "099-012-3456", avatar: "https://ui-avatars.com/api/?name=สุภาพ+เชสเตอร์&background=19b7ff&color=fff", shiftId: 20, otRate: 240, category: "ร้านเชสเตอร์" },
  // Amazon
  { id: 20, code: "EMP-0020", name: "อภิชัย อเมซอน", dept: "Amazon", position: "พนักงาน", status: "Active", startDate: "2024-06-01", email: "apichai@ptt.co.th", phone: "010-123-4567", avatar: "https://ui-avatars.com/api/?name=อภิชัย+อเมซอน&background=2867e0&color=fff", shiftId: 21, otRate: 220, category: "Amazon" },
  { id: 21, code: "EMP-0021", name: "วิไล อเมซอน", dept: "Amazon", position: "พนักงาน", status: "Active", startDate: "2024-07-10", email: "wilai@ptt.co.th", phone: "011-234-5678", avatar: "https://ui-avatars.com/api/?name=วิไล+อเมซอน&background=19b7ff&color=fff", shiftId: 23, otRate: 210, category: "Amazon" },
  { id: 22, code: "EMP-0022", name: "สมบูรณ์ อเมซอน", dept: "Amazon", position: "พนักงาน", status: "Active", startDate: "2024-05-15", email: "sombun@ptt.co.th", phone: "012-345-6789", avatar: "https://ui-avatars.com/api/?name=สมบูรณ์+อเมซอน&background=e41f2b&color=fff", shiftId: 25, otRate: 215, category: "Amazon" },
  // FIT AUTO (ช่าง)
  { id: 23, code: "EMP-0023", name: "ประเสริฐ ช่าง", dept: "ช่าง", position: "ช่างซ่อม", status: "Active", startDate: "2023-10-01", email: "prasert2@ptt.co.th", phone: "013-456-7890", avatar: "https://ui-avatars.com/api/?name=ประเสริฐ+ช่าง&background=2867e0&color=fff", shiftId: 7, otRate: 280, category: "ช่าง" },
  { id: 24, code: "EMP-0024", name: "สมชาย ช่าง", dept: "ช่าง", position: "ช่างซ่อม", status: "Active", startDate: "2024-01-05", email: "somchai2@ptt.co.th", phone: "014-567-8901", avatar: "https://ui-avatars.com/api/?name=สมชาย+ช่าง&background=e41f2b&color=fff", shiftId: 7, otRate: 270, category: "ช่าง" },
  // แม่บ้าน
  { id: 9, code: "EMP-0009", name: "วิภา รักษ์สุข", dept: "แม่บ้าน", position: "หัวหน้าแม่บ้าน", status: "Active", startDate: "2022-03-01", email: "wipa@ptt.co.th", phone: "089-012-3456", avatar: "https://ui-avatars.com/api/?name=วิภา+รักษ์สุข&background=19b7ff&color=fff", shiftId: 8, otRate: 180, category: "แม่บ้าน" },
  { id: 12, code: "EMP-0012", name: "กมลชนก ใสสะอาด", dept: "แม่บ้าน", position: "แม่บ้าน", status: "Active", startDate: "2023-08-10", email: "kamolchanok@ptt.co.th", phone: "092-345-6789", avatar: "https://ui-avatars.com/api/?name=กมลชนก+ใสสะอาด&background=19b7ff&color=fff", shiftId: 9, otRate: 170, category: "แม่บ้าน" },
  { id: 25, code: "EMP-0025", name: "สมศรี แม่บ้าน", dept: "แม่บ้าน", position: "แม่บ้าน", status: "Active", startDate: "2024-03-01", email: "somsri@ptt.co.th", phone: "015-678-9012", avatar: "https://ui-avatars.com/api/?name=สมศรี+แม่บ้าน&background=19b7ff&color=fff", shiftId: 10, otRate: 175, category: "แม่บ้าน" },
  // บัญชี (Office)
  { id: 26, code: "EMP-0026", name: "นิดา ออฟฟิศ", dept: "บัญชี", position: "พนักงานออฟฟิศ", status: "Active", startDate: "2022-01-10", email: "nida@ptt.co.th", phone: "016-789-0123", avatar: "https://ui-avatars.com/api/?name=นิดา+ออฟฟิศ&background=2867e0&color=fff", shiftId: 13, otRate: 250, category: "บัญชี" },
  { id: 27, code: "EMP-0027", name: "ทา ออฟฟิศ", dept: "บัญชี", position: "พนักงานออฟฟิศ", status: "Active", startDate: "2021-12-15", email: "ta@ptt.co.th", phone: "017-890-1234", avatar: "https://ui-avatars.com/api/?name=ทา+ออฟฟิศ&background=19b7ff&color=fff", shiftId: 14, otRate: 260, category: "บัญชี" },
  { id: 28, code: "EMP-0028", name: "สมเกียรติ ออฟฟิศ", dept: "บัญชี", position: "พนักงานออฟฟิศ", status: "Active", startDate: "2023-04-20", email: "somkiat2@ptt.co.th", phone: "018-901-2345", avatar: "https://ui-avatars.com/api/?name=สมเกียรติ+ออฟฟิศ&background=e41f2b&color=fff", shiftId: 15, otRate: 240, category: "บัญชี" },
  // รปภ.
  { id: 29, code: "EMP-0029", name: "ประยุทธ์ รปภ", dept: "รปภ.", position: "รปภ", status: "Active", startDate: "2023-07-01", email: "prayut2@ptt.co.th", phone: "019-012-3456", avatar: "https://ui-avatars.com/api/?name=ประยุทธ์+รปภ&background=2867e0&color=fff", shiftId: 11, otRate: 200, category: "รปภ." },
  { id: 30, code: "EMP-0030", name: "สมชาย รปภ", dept: "รปภ.", position: "รปภ", status: "Active", startDate: "2024-02-10", email: "somchai3@ptt.co.th", phone: "020-123-4567", avatar: "https://ui-avatars.com/api/?name=สมชาย+รปภ&background=e41f2b&color=fff", shiftId: 12, otRate: 210, category: "รปภ." },
  // คนสวน
  { id: 31, code: "EMP-0031", name: "ประเสริฐ คนสวน", dept: "คนสวน", position: "คนสวน", status: "Active", startDate: "2023-09-15", email: "prasert3@ptt.co.th", phone: "021-234-5678", avatar: "https://ui-avatars.com/api/?name=ประเสริฐ+คนสวน&background=2867e0&color=fff", shiftId: 36, otRate: 180, category: "คนสวน" },
  // ขับรถ
  { id: 32, code: "EMP-0032", name: "สมศักดิ์ ขับรถ", dept: "ขับรถ", position: "คนขับรถ", status: "Active", startDate: "2023-11-20", email: "somsak2@ptt.co.th", phone: "022-345-6789", avatar: "https://ui-avatars.com/api/?name=สมศักดิ์+ขับรถ&background=19b7ff&color=fff", shiftId: 37, otRate: 220, category: "ขับรถ" }
];

// ========== 2) ATTENDANCE (บันทึกเวลา) ==========
export interface AttendanceLog {
  id: number;
  empCode: string;
  empName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "ตรงเวลา" | "สาย 1 นาที" | "สาย 5 นาที" | "สาย 15 นาที" | "ขาดงาน" | "ลา";
  lateMinutes?: number;
  otHours?: number; // ชั่วโมง OT
  otAmount?: number; // เงิน OT (บาท)
}

// ========== 3) SHIFTS (กะการทำงาน) ==========
export interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  description?: string;
  shiftType?: "เช้า" | "บ่าย" | "ดึก" | "กลางวัน" | "กลางคืน"; // ประเภทกะ
  category?: string; // แผนกที่ใช้กะนี้
  shortCode?: string; // ตัวย่อกะ (เช่น ช, ว, บ, ด, T07)
}

export const shifts: Shift[] = [
  // ========== แผนกบัญชี (Office) ==========
  { id: 13, name: "07:00-16:00", startTime: "07:00", endTime: "16:00", description: "บัญชี", shiftType: "เช้า", category: "บัญชี", shortCode: "ช" },
  { id: 14, name: "08:00-17:00", startTime: "08:00", endTime: "17:00", description: "บัญชี", shiftType: "เช้า", category: "บัญชี", shortCode: "ว" },
  { id: 15, name: "09:00-18:00", startTime: "09:00", endTime: "18:00", description: "บัญชี", shiftType: "เช้า", category: "บัญชี", shortCode: "บ" },
  // ========== แผนกแม่บ้าน ==========
  { id: 8, name: "04:00-14:00", startTime: "04:00", endTime: "14:00", description: "แม่บ้าน", shiftType: "เช้า", category: "แม่บ้าน", shortCode: "ด" },
  { id: 9, name: "07:00-17:00", startTime: "07:00", endTime: "17:00", description: "แม่บ้าน", shiftType: "เช้า", category: "แม่บ้าน", shortCode: "ช" },
  { id: 10, name: "10:00-20:00", startTime: "10:00", endTime: "20:00", description: "แม่บ้าน", shiftType: "บ่าย", category: "แม่บ้าน", shortCode: "บ" },
  // ========== แผนกรปภ. ==========
  { id: 11, name: "17:00-07:00", startTime: "17:00", endTime: "07:00", description: "รปภ.", shiftType: "ดึก", category: "รปภ.", shortCode: "ว" },
  { id: 12, name: "18:00-07:00", startTime: "18:00", endTime: "07:00", description: "รปภ.", shiftType: "ดึก", category: "รปภ.", shortCode: "ว" },
  // ========== แผนกช่าง ==========
  { id: 7, name: "08:00-18:00", startTime: "08:00", endTime: "18:00", description: "ช่าง", shiftType: "เช้า", category: "ช่าง", shortCode: "ว" },
  // ========== แผนกหน้าลาน (เติมน้ำมัน) ==========
  { id: 1, name: "06:30-16:30", startTime: "06:30", endTime: "16:30", description: "หน้าลาน - แคชเชียร์กะเช้า", shiftType: "เช้า", category: "หน้าลาน (เติมน้ำมัน)", shortCode: "ช" },
  { id: 38, name: "07:00-17:00", startTime: "07:00", endTime: "17:00", description: "หน้าลาน - พนง.เติมน้ำมัน", shiftType: "เช้า", category: "หน้าลาน (เติมน้ำมัน)", shortCode: "T07" },
  { id: 2, name: "07:00-17:00", startTime: "07:00", endTime: "17:00", description: "หน้าลาน - พนง.เติมน้ำมัน", shiftType: "เช้า", category: "หน้าลาน (เติมน้ำมัน)", shortCode: "ช" },
  { id: 39, name: "08:00-19:00", startTime: "08:00", endTime: "19:00", description: "หน้าลาน - พนง.เติมน้ำมัน", shiftType: "เช้า", category: "หน้าลาน (เติมน้ำมัน)", shortCode: "ช" },
  { id: 40, name: "10:00-20:00", startTime: "10:00", endTime: "20:00", description: "หน้าลาน - พนง.เติมน้ำมัน", shiftType: "บ่าย", category: "หน้าลาน (เติมน้ำมัน)", shortCode: "บ" },
  { id: 41, name: "11:00-21:00", startTime: "11:00", endTime: "21:00", description: "หน้าลาน - พนง.เติมน้ำมัน", shiftType: "บ่าย", category: "หน้าลาน (เติมน้ำมัน)", shortCode: "บ" },
  { id: 42, name: "12:00-22:00", startTime: "12:00", endTime: "22:00", description: "หน้าลาน - พนง.เติมน้ำมัน", shiftType: "บ่าย", category: "หน้าลาน (เติมน้ำมัน)", shortCode: "บ" },
  { id: 43, name: "15:00-07:00", startTime: "15:00", endTime: "07:00", description: "หน้าลาน - แคชเชียร์กะดึก", shiftType: "ดึก", category: "หน้าลาน (เติมน้ำมัน)", shortCode: "ด" },
  { id: 44, name: "17:00-08:00", startTime: "17:00", endTime: "08:00", description: "หน้าลาน - พนง.เติมน้ำมัน", shiftType: "ดึก", category: "หน้าลาน (เติมน้ำมัน)", shortCode: "ด" },
  // ========== แผนกปึงหงี่เซียง ==========
  { id: 16, name: "07:00-17:00", startTime: "07:00", endTime: "17:00", description: "ปึงหงี่เซียง", shiftType: "เช้า", category: "ปึงหงี่เซียง", shortCode: "ช" },
  { id: 18, name: "10:00-20:00", startTime: "10:00", endTime: "20:00", description: "ปึงหงี่เซียง", shiftType: "บ่าย", category: "ปึงหงี่เซียง", shortCode: "บ" },
  // ========== แผนกโอทอป ==========
  { id: 45, name: "07:00-17:00", startTime: "07:00", endTime: "17:00", description: "โอทอป", shiftType: "เช้า", category: "โอทอป", shortCode: "ช" },
  { id: 46, name: "08:00-18:00", startTime: "08:00", endTime: "18:00", description: "โอทอป", shiftType: "เช้า", category: "โอทอป", shortCode: "ว" },
  { id: 47, name: "10:00-20:00", startTime: "10:00", endTime: "20:00", description: "โอทอป", shiftType: "บ่าย", category: "โอทอป", shortCode: "บ" },
  // ========== แผนกเซเว่น ==========
  { id: 27, name: "06:30-16:30", startTime: "06:30", endTime: "16:30", description: "เซเว่น", shiftType: "เช้า", category: "เซเว่น", shortCode: "ช" },
  { id: 48, name: "07:30-17:30", startTime: "07:30", endTime: "17:30", description: "เซเว่น - แม่บ้าน", shiftType: "เช้า", category: "เซเว่น", shortCode: "ช" },
  { id: 49, name: "08:00-18:00", startTime: "08:00", endTime: "18:00", description: "เซเว่น - ผู้จัดการ", shiftType: "เช้า", category: "เซเว่น", shortCode: "ช" },
  { id: 28, name: "12:00-22:00", startTime: "12:00", endTime: "22:00", description: "เซเว่น", shiftType: "บ่าย", category: "เซเว่น", shortCode: "บ" },
  { id: 29, name: "21:30-07:30", startTime: "21:30", endTime: "07:30", description: "เซเว่น", shiftType: "ดึก", category: "เซเว่น", shortCode: "ด" },
  // ========== แผนกอเมซอน ==========
  { id: 50, name: "05:30-15:30", startTime: "05:30", endTime: "15:30", description: "อเมซอน", shiftType: "เช้า", category: "อเมซอน", shortCode: "ด" },
  { id: 51, name: "06:30-16:30", startTime: "06:30", endTime: "16:30", description: "อเมซอน", shiftType: "เช้า", category: "อเมซอน", shortCode: "ช" },
  { id: 23, name: "07:00-17:00", startTime: "07:00", endTime: "17:00", description: "อเมซอน", shiftType: "เช้า", category: "อเมซอน", shortCode: "ช" },
  { id: 52, name: "07:30-17:30", startTime: "07:30", endTime: "17:30", description: "อเมซอน", shiftType: "เช้า", category: "อเมซอน", shortCode: "ช" },
  { id: 24, name: "08:00-18:00", startTime: "08:00", endTime: "18:00", description: "อเมซอน", shiftType: "เช้า", category: "อเมซอน", shortCode: "ช" },
  { id: 53, name: "08:30-18:30", startTime: "08:30", endTime: "18:30", description: "อเมซอน", shiftType: "เช้า", category: "อเมซอน", shortCode: "ช" },
  { id: 54, name: "09:30-19:30", startTime: "09:30", endTime: "19:30", description: "อเมซอน", shiftType: "บ่าย", category: "อเมซอน", shortCode: "บ" },
  { id: 25, name: "10:00-20:00", startTime: "10:00", endTime: "20:00", description: "อเมซอน", shiftType: "บ่าย", category: "อเมซอน", shortCode: "บ" },
  { id: 55, name: "11:00-21:00", startTime: "11:00", endTime: "21:00", description: "อเมซอน", shiftType: "บ่าย", category: "อเมซอน", shortCode: "บ" },
  // ========== กะอื่นๆ (สำหรับแผนกอื่นๆ ที่ยังใช้อยู่) ==========
  { id: 3, name: "08:00-18:00", startTime: "08:00", endTime: "18:00", description: "หน้าลาน - กลางวัน", shiftType: "เช้า", category: "ปั๊ม" },
  { id: 4, name: "16:00-07:00", startTime: "16:00", endTime: "07:00", description: "หน้าลาน - กลางคืน", shiftType: "ดึก", category: "ปั๊ม" },
  { id: 5, name: "16:30-07:30", startTime: "16:30", endTime: "07:30", description: "หน้าลาน - กลางคืน", shiftType: "ดึก", category: "ปั๊ม" },
  { id: 6, name: "17:00-08:00", startTime: "17:00", endTime: "08:00", description: "หน้าลาน - กลางคืน", shiftType: "ดึก", category: "ปั๊ม" },
  { id: 17, name: "08:00-18:00", startTime: "08:00", endTime: "18:00", description: "ร้านของฝาก", shiftType: "เช้า", category: "ปึงหงี่เชียง" },
  { id: 30, name: "07:00-17:00", startTime: "07:00", endTime: "17:00", description: "ร้านเจียง", shiftType: "เช้า", category: "ร้านเจียง" },
  { id: 31, name: "08:00-18:00", startTime: "08:00", endTime: "18:00", description: "ร้านเจียง", shiftType: "เช้า", category: "ร้านเจียง" },
  { id: 32, name: "10:00-20:00", startTime: "10:00", endTime: "20:00", description: "ร้านเจียง", shiftType: "บ่าย", category: "ร้านเจียง" },
  { id: 33, name: "07:00-17:00", startTime: "07:00", endTime: "17:00", description: "เจ้าสัว", shiftType: "เช้า", category: "เจ้าสัว" },
  { id: 34, name: "08:00-18:00", startTime: "08:00", endTime: "18:00", description: "เจ้าสัว", shiftType: "เช้า", category: "เจ้าสัว" },
  { id: 35, name: "10:00-20:00", startTime: "10:00", endTime: "20:00", description: "เจ้าสัว", shiftType: "บ่าย", category: "เจ้าสัว" },
  { id: 36, name: "08:00-18:00", startTime: "08:00", endTime: "18:00", description: "คนสวน/ขับรถ", shiftType: "เช้า", category: "คนสวน" },
  { id: 37, name: "08:00-18:00", startTime: "08:00", endTime: "18:00", description: "คนสวน/ขับรถ", shiftType: "เช้า", category: "ขับรถ" },
  { id: 19, name: "08:00-18:00", startTime: "08:00", endTime: "18:00", description: "Chester's", shiftType: "เช้า", category: "ร้านเชสเตอร์" },
  { id: 20, name: "10:30-20:30", startTime: "10:30", endTime: "20:30", description: "Chester's", shiftType: "บ่าย", category: "ร้านเชสเตอร์" },
  { id: 21, name: "05:30-15:30", startTime: "05:30", endTime: "15:30", description: "Amazon", shiftType: "เช้า", category: "Amazon" },
  { id: 22, name: "06:00-16:00", startTime: "06:00", endTime: "16:00", description: "Amazon", shiftType: "เช้า", category: "Amazon" },
  { id: 26, name: "10:30-20:30", startTime: "10:30", endTime: "20:30", description: "Amazon", shiftType: "บ่าย", category: "Amazon" }
];

// Helper function to generate attendance logs for a date range
const generateAttendanceLogs = (empCode: string, empName: string, shiftId: number, startDate: string, endDate: string): AttendanceLog[] => {
  const logs: AttendanceLog[] = [];
  const shift = shifts.find(s => s.id === shiftId);
  if (!shift) return logs;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday

    // Skip weekends (Saturday and Sunday) - ไม่สร้าง log สำหรับวันหยุด
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      current.setDate(current.getDate() + 1);
      continue;
    }

    // Random attendance status (75% on time, 10% late, 5% absent, 10% leave)
    const rand = Math.random();
    let status: AttendanceLog["status"] = "ตรงเวลา";
    let checkIn = shift.startTime;
    let checkOut = shift.endTime;
    let lateMinutes: number | undefined = undefined;

    if (rand < 0.10) {
      // Leave
      status = "ลา";
      checkIn = "-";
      checkOut = "-";
    } else if (rand < 0.15) {
      // Absent
      status = "ขาดงาน";
      checkIn = "-";
      checkOut = "-";
    } else if (rand < 0.25) {
      // Late
      const [hour, min] = shift.startTime.split(':').map(Number);
      const lateMins = Math.floor(Math.random() * 30) + 1; // 1-30 minutes late
      const newMin = min + lateMins;
      const newHour = hour + Math.floor(newMin / 60);
      checkIn = `${String(newHour % 24).padStart(2, '0')}:${String(newMin % 60).padStart(2, '0')}`;
      if (lateMins <= 1) status = "สาย 1 นาที";
      else if (lateMins <= 5) status = "สาย 5 นาที";
      else status = "สาย 15 นาที";
      lateMinutes = lateMins;
      
      // เพิ่มเวลา checkout เล็กน้อยถ้ามาสาย
      if (checkOut !== "-") {
        const [outHour, outMin] = checkOut.split(':').map(Number);
        const addMins = Math.floor(Math.random() * 15); // เพิ่ม 0-15 นาที
        const newOutMin = outMin + addMins;
        const newOutHour = outHour + Math.floor(newOutMin / 60);
        checkOut = `${String(newOutHour % 24).padStart(2, '0')}:${String(newOutMin % 60).padStart(2, '0')}`;
      }
    } else {
      // On time - เพิ่มความหลากหลายของเวลาเข้า-ออก
      const [inHour, inMin] = shift.startTime.split(':').map(Number);
      const [outHour, outMin] = shift.endTime.split(':').map(Number);
      
      // เพิ่มความหลากหลายของเวลาเข้า (อาจมาเร็วหรือช้าเล็กน้อย)
      const inVariation = Math.floor(Math.random() * 10) - 5; // -5 ถึง +5 นาที
      const newInMin = inMin + inVariation;
      const newInHour = inHour + Math.floor(newInMin / 60);
      checkIn = `${String((newInHour % 24 + 24) % 24).padStart(2, '0')}:${String((newInMin % 60 + 60) % 60).padStart(2, '0')}`;
      
      // เพิ่มความหลากหลายของเวลาออก (อาจออกเร็วหรือช้าเล็กน้อย)
      const outVariation = Math.floor(Math.random() * 20) - 10; // -10 ถึง +10 นาที
      const newOutMin = outMin + outVariation;
      const newOutHour = outHour + Math.floor(newOutMin / 60);
      checkOut = `${String((newOutHour % 24 + 24) % 24).padStart(2, '0')}:${String((newOutMin % 60 + 60) % 60).padStart(2, '0')}`;
    }

    // Handle overnight shifts
    if (shift.endTime < shift.startTime && checkOut !== "-") {
      const [outHour, outMin] = checkOut.split(':').map(Number);
      // สำหรับกะดึก ให้แสดงเวลาออกเป็นของวันถัดไป
      checkOut = `${String((outHour + 24) % 24).padStart(2, '0')}:${String(outMin).padStart(2, '0')}`;
    }

    logs.push({
      id: logs.length + 1,
      empCode,
      empName,
      date: dateStr,
      checkIn,
      checkOut,
      status,
      lateMinutes,
      otHours: checkIn !== "-" && checkOut !== "-" ? Math.max(0, Math.floor(Math.random() * 2)) : 0, // 0-2 hours OT
      otAmount: 0
    });

    current.setDate(current.getDate() + 1);
  }

  return logs;
};

export const attendanceLogs: AttendanceLog[] = [
  // November 2025 data (26 Oct - 25 Nov)
  ...generateAttendanceLogs("EMP-0001", "สมชาย ใจดี", 1, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0002", "สมหญิง รักงาน", 2, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0003", "วรพล ตั้งใจ", 3, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0004", "กิตติคุณ ใฝ่รู้", 27, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0005", "พิมพ์ชนก สมใจ", 16, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0006", "ธีรภัทร แข็งแรง", 33, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0007", "ประเสริฐ ดีงาม", 30, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0008", "อัญชลี มีชัย", 19, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0009", "วิภา รักษ์สุข", 8, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0012", "กมลชนก ใสสะอาด", 9, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0013", "ประยุทธ์ กลางคืน", 4, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0014", "สุรชัย ดึก", 5, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0015", "นันทนา เซเว่น", 28, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0016", "วิชัย ดึก", 29, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0017", "รัตนา ปึงหงี่", 17, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0018", "สมศักดิ์ เจียง", 31, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0019", "สุภาพ เชสเตอร์", 20, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0020", "อภิชัย อเมซอน", 21, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0021", "วิไล อเมซอน", 23, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0022", "สมบูรณ์ อเมซอน", 25, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0023", "ประเสริฐ ช่าง", 7, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0024", "สมชาย ช่าง", 7, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0025", "สมศรี แม่บ้าน", 10, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0026", "นิดา ออฟฟิศ", 13, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0027", "ทา ออฟฟิศ", 14, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0028", "สมเกียรติ ออฟฟิศ", 15, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0029", "ประยุทธ์ รปภ", 11, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0030", "สมชาย รปภ", 12, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0031", "ประเสริฐ คนสวน", 36, "2025-10-26", "2025-11-25"),
  ...generateAttendanceLogs("EMP-0032", "สมศักดิ์ ขับรถ", 37, "2025-10-26", "2025-11-25"),
].map((log, index) => ({ ...log, id: index + 1 }));

// ========== 4) LEAVES (การลา) ==========
export interface Leave {
  id: number;
  empCode: string;
  empName: string;
  type: "ลาพักร้อน" | "ลาป่วย" | "ลากิจ" | "ลาคลอด" | "ลางานศพ";
  fromDate: string;
  toDate: string;
  days: number;
  status: "รอผู้จัดการ" | "รอ HR" | "รอหัวหน้าสถานี" | "อนุมัติแล้ว" | "ไม่อนุมัติ";
  reason?: string;
  // การลาระหว่างวัน
  isPartialLeave?: boolean; // ลาระหว่างวันหรือไม่
  fromTime?: string; // เวลาเริ่ม (ถ้าลาระหว่างวัน)
  toTime?: string; // เวลาสิ้นสุด (ถ้าลาระหว่างวัน)
  // คนมาทำงานแทน
  replacementEmpCode?: string; // รหัสพนักงานที่มาทำงานแทน
  replacementEmpName?: string; // ชื่อพนักงานที่มาทำงานแทน
  // เอกสาร
  attachments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
  }>;
  // Workflow
  submittedDate?: string; // วันที่ยื่นลา
  managerApprovedDate?: string; // วันที่ผู้จัดการอนุมัติ
  hrApprovedDate?: string; // วันที่ HR อนุมัติ
  adminApprovedDate?: string; // วันที่หัวหน้าสถานีอนุมัติ
  managerComment?: string; // ความคิดเห็นผู้จัดการ
  hrComment?: string; // ความคิดเห็น HR
  adminComment?: string; // ความคิดเห็นหัวหน้าสถานี
  // ผลต่อการประเมิน
  exceedsLimit?: boolean; // ลาเกินกำหนดหรือไม่
  affectsEvaluation?: boolean; // มีผลต่อการประเมินเงินเดือน/การทดลองงาน
  // สร้างโดย
  createdBy?: string; // "employee" | "manager" | "hr"
  // พิมพ์ใบลา
  printedBy?: string; // HR ที่พิมพ์ใบลา
  printedDate?: string; // วันที่พิมพ์ใบลา
}

export const leaves: Leave[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    type: "ลาพักร้อน",
    fromDate: "2025-11-15",
    toDate: "2025-11-17",
    days: 3,
    status: "อนุมัติแล้ว",
    reason: "พักผ่อนกับครอบครัว"
  },
  {
    id: 2,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    type: "ลาป่วย",
    fromDate: "2025-11-05",
    toDate: "2025-11-05",
    days: 1,
    status: "อนุมัติแล้ว",
    reason: "ไข้หวัด"
  },
  {
    id: 3,
    empCode: "EMP-0006",
    empName: "ธีรภัทร แข็งแรง",
    type: "ลากิจ",
    fromDate: "2025-11-01",
    toDate: "2025-11-02",
    days: 2,
    status: "รอผู้จัดการ",
    reason: "ธุระส่วนตัว"
  },
  {
    id: 4,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    type: "ลาพักร้อน",
    fromDate: "2025-12-20",
    toDate: "2025-12-30",
    days: 11,
    status: "รอผู้จัดการ",
    reason: "เที่ยวต่างประเทศ"
  },
  {
    id: 5,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    type: "ลาป่วย",
    fromDate: "2025-11-10",
    toDate: "2025-11-12",
    days: 3,
    status: "อนุมัติแล้ว",
    reason: "อาการปวดหลัง"
  },
  {
    id: 6,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    type: "ลากิจ",
    fromDate: "2025-11-08",
    toDate: "2025-11-08",
    days: 1,
    status: "อนุมัติแล้ว",
    reason: "ไปธนาคาร"
  },
  {
    id: 7,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    type: "ลากิจ",
    fromDate: "2025-11-20",
    toDate: "2025-11-20",
    days: 1,
    status: "อนุมัติแล้ว",
    reason: "ไปทำบัตรประชาชน"
  },
  {
    id: 8,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    type: "ลาพักร้อน",
    fromDate: "2025-11-25",
    toDate: "2025-11-27",
    days: 3,
    status: "อนุมัติแล้ว",
    reason: "พักผ่อน"
  },
  {
    id: 9,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    type: "ลากิจ",
    fromDate: "2025-11-18",
    toDate: "2025-11-18",
    days: 1,
    status: "อนุมัติแล้ว",
    reason: "ไปทำใบขับขี่"
  },
  {
    id: 10,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    type: "ลาพักร้อน",
    fromDate: "2025-11-22",
    toDate: "2025-11-24",
    days: 3,
    status: "อนุมัติแล้ว",
    reason: "พักผ่อน"
  }
];

// ========== 5) PAYROLL (เงินเดือน) ==========
export interface Payroll {
  id: number;
  empCode: string;
  empName: string;
  salary: number;
  ot: number;
  bonus: number;
  deduction: number;
  net: number;
  month: string;
}

// ========== SHIFT ASSIGNMENTS (การมอบหมายกะ) ==========
export interface ShiftAssignment {
  id: number;
  empCode: string;
  empName: string;
  shiftId: number;
  shiftName: string;
  assignedDate: string; // วันที่มอบหมาย
  effectiveDate: string; // วันที่ใช้งาน
  endDate?: string; // วันที่สิ้นสุด (ถ้า null แสดงว่ายังคงใช้อยู่)
  reason?: string; // เหตุผลการมอบหมาย
  status: "Active" | "Completed" | "Cancelled"; // สถานะ
  assignedBy: string; // ผู้มอบหมาย
}

export const shiftAssignments: ShiftAssignment[] = [
  // ปั๊มน้ำมัน - กะเช้า
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    shiftId: 1,
    shiftName: "06:30-16:30",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ปั๊มน้ำมัน",
    status: "Active",
    assignedBy: "ผจก.ปั๊ม"
  },
  {
    id: 2,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    shiftId: 2,
    shiftName: "07:00-17:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ปั๊มน้ำมัน",
    status: "Active",
    assignedBy: "ผจก.ปั๊ม"
  },
  {
    id: 3,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    shiftId: 3,
    shiftName: "08:00-18:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ปั๊มน้ำมัน",
    status: "Active",
    assignedBy: "ผจก.ปั๊ม"
  },
  {
    id: 3.5,
    empCode: "EMP-0033",
    empName: "วินัย มั่นใจ",
    shiftId: 1,
    shiftName: "06:30-16:30",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ปั๊มน้ำมัน",
    status: "Active",
    assignedBy: "ผจก.ปั๊ม"
  },
  {
    id: 3.7,
    empCode: "EMP-0034",
    empName: "ชนาธิป ขยัน",
    shiftId: 2,
    shiftName: "07:00-17:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ปั๊มน้ำมัน",
    status: "Active",
    assignedBy: "ผจก.ปั๊ม"
  },
  // ปั๊มน้ำมัน - กะกลางคืน
  {
    id: 4,
    empCode: "EMP-0013",
    empName: "ประยุทธ์ กลางคืน",
    shiftId: 4,
    shiftName: "16:00-07:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ปั๊มน้ำมัน",
    status: "Active",
    assignedBy: "ผจก.ปั๊ม"
  },
  {
    id: 5,
    empCode: "EMP-0014",
    empName: "สุรชัย ดึก",
    shiftId: 5,
    shiftName: "16:30-07:30",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ปั๊มน้ำมัน",
    status: "Active",
    assignedBy: "ผจก.ปั๊ม"
  },
  {
    id: 5.5,
    empCode: "EMP-0035",
    empName: "สุนทร คืนวิหาร",
    shiftId: 4,
    shiftName: "16:00-07:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ปั๊มน้ำมัน",
    status: "Active",
    assignedBy: "ผจก.ปั๊ม"
  },
  // 7-Eleven
  {
    id: 6,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    shiftId: 27,
    shiftName: "06:30-16:30",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - เซเว่น",
    status: "Active",
    assignedBy: "หัวหน้าเซเว่น"
  },
  {
    id: 7,
    empCode: "EMP-0015",
    empName: "นันทนา เซเว่น",
    shiftId: 28,
    shiftName: "12:00-22:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - เซเว่น",
    status: "Active",
    assignedBy: "หัวหน้าเซเว่น"
  },
  {
    id: 8,
    empCode: "EMP-0016",
    empName: "วิชัย ดึก",
    shiftId: 29,
    shiftName: "21:30-07:30",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - เซเว่น",
    status: "Active",
    assignedBy: "หัวหน้าเซเว่น"
  },
  {
    id: 8.3,
    empCode: "EMP-0036",
    empName: "เอกชัย ช่างการค้า",
    shiftId: 27,
    shiftName: "06:30-16:30",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - เซเว่น",
    status: "Active",
    assignedBy: "หัวหน้าเซเว่น"
  },
  {
    id: 8.5,
    empCode: "EMP-0037",
    empName: "ศรีสวัสดิ์ เชื่อ",
    shiftId: 28,
    shiftName: "12:00-22:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - เซเว่น",
    status: "Active",
    assignedBy: "หัวหน้าเซเว่น"
  },
  // ปึงหงี่เชียง
  {
    id: 9,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    shiftId: 16,
    shiftName: "07:00-17:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ปึงหงี่เชียง",
    status: "Active",
    assignedBy: "หัวหน้าร้าน"
  },
  {
    id: 10,
    empCode: "EMP-0017",
    empName: "รัตนา ปึงหงี่",
    shiftId: 17,
    shiftName: "08:00-18:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ปึงหงี่เชียง",
    status: "Active",
    assignedBy: "หัวหน้าร้าน"
  },
  {
    id: 10.3,
    empCode: "EMP-0038",
    empName: "เสาวลักษณ์ สวรรค์",
    shiftId: 18,
    shiftName: "14:00-00:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ปึงหงี่เชียง",
    status: "Active",
    assignedBy: "หัวหน้าร้าน"
  },
  // ร้านเจียง
  {
    id: 11,
    empCode: "EMP-0007",
    empName: "ประเสริฐ ดีงาม",
    shiftId: 30,
    shiftName: "07:00-17:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ร้านเจียง",
    status: "Active",
    assignedBy: "หัวหน้าร้าน"
  },
  {
    id: 12,
    empCode: "EMP-0018",
    empName: "สมศักดิ์ เจียง",
    shiftId: 31,
    shiftName: "08:00-18:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ร้านเจียง",
    status: "Active",
    assignedBy: "หัวหน้าร้าน"
  },
  {
    id: 12.3,
    empCode: "EMP-0039",
    empName: "กอบกาญจน์ เจียง",
    shiftId: 30,
    shiftName: "07:00-17:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ร้านเจียง",
    status: "Active",
    assignedBy: "หัวหน้าร้าน"
  },
  // Chester's
  {
    id: 13,
    empCode: "EMP-0008",
    empName: "อัญชลี มีชัย",
    shiftId: 19,
    shiftName: "08:00-18:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - Chester's",
    status: "Active",
    assignedBy: "หัวหน้าร้าน"
  },
  {
    id: 14,
    empCode: "EMP-0019",
    empName: "สุภาพ เชสเตอร์",
    shiftId: 20,
    shiftName: "10:30-20:30",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - Chester's",
    status: "Active",
    assignedBy: "หัวหน้าร้าน"
  },
  {
    id: 14.3,
    empCode: "EMP-0040",
    empName: "เจษฎา ฉ่ำ",
    shiftId: 19,
    shiftName: "08:00-18:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - Chester's",
    status: "Active",
    assignedBy: "หัวหน้าร้าน"
  },
  // Amazon
  {
    id: 15,
    empCode: "EMP-0020",
    empName: "อภิชัย อเมซอน",
    shiftId: 21,
    shiftName: "05:30-15:30",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - Amazon",
    status: "Active",
    assignedBy: "หัวหน้า Amazon"
  },
  {
    id: 16,
    empCode: "EMP-0021",
    empName: "วิไล อเมซอน",
    shiftId: 23,
    shiftName: "07:00-17:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - Amazon",
    status: "Active",
    assignedBy: "หัวหน้า Amazon"
  },
  {
    id: 17,
    empCode: "EMP-0022",
    empName: "กาญจน์ อเมซอน",
    shiftId: 25,
    shiftName: "16:00-00:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - Amazon",
    status: "Active",
    assignedBy: "หัวหน้า Amazon"
  },
  {
    id: 17.3,
    empCode: "EMP-0041",
    empName: "นุชนาด ส่งสินค้า",
    shiftId: 21,
    shiftName: "05:30-15:30",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - Amazon",
    status: "Active",
    assignedBy: "หัวหน้า Amazon"
  },
  {
    id: 17.5,
    empCode: "EMP-0042",
    empName: "ศันต์ วาทสอบ",
    shiftId: 23,
    shiftName: "07:00-17:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - Amazon",
    status: "Active",
    assignedBy: "หัวหน้า Amazon"
  },
  {
    id: 17.7,
    empCode: "EMP-0043",
    empName: "วรินทร์ สินค้าพร้อม",
    shiftId: 25,
    shiftName: "16:00-00:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - Amazon",
    status: "Active",
    assignedBy: "หัวหน้า Amazon"
  },
  // ช่าง/FIT AUTO
  {
    id: 18,
    empCode: "EMP-0023",
    empName: "ประเสริฐ ช่าง",
    shiftId: 7,
    shiftName: "08:00-18:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ช่าง",
    status: "Active",
    assignedBy: "หัวหน้าช่าง"
  },
  {
    id: 19,
    empCode: "EMP-0024",
    empName: "สมชาย ช่าง",
    shiftId: 7,
    shiftName: "08:00-18:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ช่าง",
    status: "Active",
    assignedBy: "หัวหน้าช่าง"
  },
  {
    id: 19.3,
    empCode: "EMP-0044",
    empName: "อดิศร เครื่องจักร",
    shiftId: 7,
    shiftName: "08:00-18:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ช่าง",
    status: "Active",
    assignedBy: "หัวหน้าช่าง"
  },
  // แม่บ้าน
  {
    id: 20,
    empCode: "EMP-0009",
    empName: "วิภา รักษ์สุข",
    shiftId: 8,
    shiftName: "04:00-14:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - แม่บ้าน",
    status: "Active",
    assignedBy: "หัวหน้าแม่บ้าน"
  },
  {
    id: 21,
    empCode: "EMP-0012",
    empName: "กมลชนก ใสสะอาด",
    shiftId: 9,
    shiftName: "07:00-17:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - แม่บ้าน",
    status: "Active",
    assignedBy: "หัวหน้าแม่บ้าน"
  },
  {
    id: 22,
    empCode: "EMP-0025",
    empName: "สมศรี แม่บ้าน",
    shiftId: 10,
    shiftName: "10:00-20:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - แม่บ้าน",
    status: "Active",
    assignedBy: "หัวหน้าแม่บ้าน"
  },
  {
    id: 22.3,
    empCode: "EMP-0045",
    empName: "สุนิสา ตัดสินใจ",
    shiftId: 8,
    shiftName: "04:00-14:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - แม่บ้าน",
    status: "Active",
    assignedBy: "หัวหน้าแม่บ้าน"
  },
  {
    id: 22.5,
    empCode: "EMP-0046",
    empName: "อรทัย ใจบริสุทธิ์",
    shiftId: 9,
    shiftName: "07:00-17:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - แม่บ้าน",
    status: "Active",
    assignedBy: "หัวหน้าแม่บ้าน"
  },
  // Office
  {
    id: 23,
    empCode: "EMP-0026",
    empName: "นิดา ออฟฟิศ",
    shiftId: 13,
    shiftName: "07:00-16:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - Office",
    status: "Active",
    assignedBy: "ผจก.Office"
  },
  {
    id: 24,
    empCode: "EMP-0027",
    empName: "ทา ออฟฟิศ",
    shiftId: 14,
    shiftName: "08:00-17:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - Office",
    status: "Active",
    assignedBy: "ผจก.Office"
  },
  {
    id: 25,
    empCode: "EMP-0028",
    empName: "สมเกียรติ ออฟฟิศ",
    shiftId: 15,
    shiftName: "09:00-18:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - Office",
    status: "Active",
    assignedBy: "ผจก.Office"
  },
  {
    id: 25.3,
    empCode: "EMP-0047",
    empName: "ณัฐวดี ใจเย็น",
    shiftId: 13,
    shiftName: "07:00-16:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - Office",
    status: "Active",
    assignedBy: "ผจก.Office"
  },
  // รักษาความปลอดภัย
  {
    id: 26,
    empCode: "EMP-0029",
    empName: "ประยุทธ์ รปภ",
    shiftId: 11,
    shiftName: "17:00-06:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - รักษาความปลอดภัย",
    status: "Active",
    assignedBy: "หัวหน้ารปภ"
  },
  {
    id: 27,
    empCode: "EMP-0030",
    empName: "สมชาย รปภ",
    shiftId: 12,
    shiftName: "18:00-07:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - รักษาความปลอดภัย",
    status: "Active",
    assignedBy: "หัวหน้ารปภ"
  },
  {
    id: 27.3,
    empCode: "EMP-0048",
    empName: "กรณ์ ยาม",
    shiftId: 11,
    shiftName: "17:00-06:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - รักษาความปลอดภัย",
    status: "Active",
    assignedBy: "หัวหน้ารปภ"
  },
  // คนสวน
  {
    id: 28,
    empCode: "EMP-0031",
    empName: "ประเสริฐ คนสวน",
    shiftId: 36,
    shiftName: "08:00-18:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - คนสวน",
    status: "Active",
    assignedBy: "หัวหน้าคนสวน"
  },
  {
    id: 28.3,
    empCode: "EMP-0049",
    empName: "บัญชา ปลูกดี",
    shiftId: 36,
    shiftName: "08:00-18:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - คนสวน",
    status: "Active",
    assignedBy: "หัวหน้าคนสวน"
  },
  // ขับรถ
  {
    id: 29,
    empCode: "EMP-0032",
    empName: "สมศักดิ์ ขับรถ",
    shiftId: 37,
    shiftName: "08:00-18:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ขับรถ",
    status: "Active",
    assignedBy: "หัวหน้าขับรถ"
  },
  {
    id: 29.3,
    empCode: "EMP-0050",
    empName: "พิเชฏฐ์ ส่งสินค้า",
    shiftId: 37,
    shiftName: "08:00-18:00",
    assignedDate: "2025-10-20",
    effectiveDate: "2025-11-01",
    reason: "วางแผนกะล่วงหน้า - ขับรถ",
    status: "Active",
    assignedBy: "หัวหน้าขับรถ"
  }
];

export const payroll: Payroll[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    salary: 45000,
    ot: 2000,
    bonus: 3000,
    deduction: 1500,
    net: 48500,
    month: "2025-10"
  },
  {
    id: 2,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    salary: 35000,
    ot: 0,
    bonus: 2000,
    deduction: 0,
    net: 37000,
    month: "2025-10"
  },
  {
    id: 3,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    salary: 40000,
    ot: 1500,
    bonus: 2500,
    deduction: 800,
    net: 43200,
    month: "2025-10"
  },
  {
    id: 4,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    salary: 38000,
    ot: 1000,
    bonus: 1500,
    deduction: 500,
    net: 40000,
    month: "2025-10"
  },
  {
    id: 5,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    salary: 50000,
    ot: 0,
    bonus: 5000,
    deduction: 2000,
    net: 53000,
    month: "2025-10"
  }
];

// ========== 6) PERFORMANCE (ประเมินผล) ==========
export interface Evaluation {
  id: number;
  empCode: string;
  empName: string;
  round: string; // Q1, Q2, Q3, Q4
  year: number;
  score: number; // 1.0 - 5.0
  status: "ผ่าน" | "ไม่ผ่าน" | "ดีเยี่ยม";
  evaluatedBy: string;
  comment?: string;
}

export const evaluations: Evaluation[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    round: "Q3",
    year: 2025,
    score: 4.5,
    status: "ดีเยี่ยม",
    evaluatedBy: "ผจก.IT",
    comment: "ทำงานดีมาก มีความรับผิดชอบสูง"
  },
  {
    id: 2,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    round: "Q3",
    year: 2025,
    score: 3.8,
    status: "ผ่าน",
    evaluatedBy: "ผจก.HR",
    comment: "ทำงานดี ควรพัฒนาด้าน communication"
  },
  {
    id: 3,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    round: "Q3",
    year: 2025,
    score: 4.2,
    status: "ดีเยี่ยม",
    evaluatedBy: "ผจก.Account",
    comment: "ละเอียด รอบคอบ"
  },
  {
    id: 4,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    round: "Q3",
    year: 2025,
    score: 3.5,
    status: "ผ่าน",
    evaluatedBy: "ผจก.IT",
    comment: "พนักงานใหม่ มีพัฒนาการดี"
  }
];

// Performance Reviews (สำหรับ Reports Module)
export interface PerformanceReview {
  id: number;
  empCode: string;
  empName: string;
  score: number;
  rating: "Excellent" | "Good" | "Needs Improvement";
  period: string;
  reviewer: string;
}

export const performanceReviews: PerformanceReview[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    score: 92,
    rating: "Excellent",
    period: "2025-Q3",
    reviewer: "ผจก.IT"
  },
  {
    id: 2,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    score: 88,
    rating: "Good",
    period: "2025-Q3",
    reviewer: "ผจก.HR"
  },
  {
    id: 3,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    score: 95,
    rating: "Excellent",
    period: "2025-Q3",
    reviewer: "ผู้จัดการฝ่ายบัญชี"
  },
  {
    id: 4,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    score: 85,
    rating: "Good",
    period: "2025-Q3",
    reviewer: "ผจก.IT"
  },
  {
    id: 5,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    score: 90,
    rating: "Excellent",
    period: "2025-Q3",
    reviewer: "ผจก.Marketing"
  },
  {
    id: 6,
    empCode: "EMP-0006",
    empName: "ธีรภัทร แข็งแรง",
    score: 65,
    rating: "Needs Improvement",
    period: "2025-Q3",
    reviewer: "ผจก.HR"
  }
];

// ========== 7) RECRUITMENT (รับสมัครงาน) ==========
export interface Candidate {
  id: number;
  name: string;
  position: string;
  appliedDate: string;
  status: "รอตรวจสอบ" | "นัดสัมภาษณ์" | "ผ่าน" | "ไม่ผ่าน";
  email: string;
  phone: string;
  interviewDate?: string;
  score?: number;
}

export const candidates: Candidate[] = [
  {
    id: 101,
    name: "กิตติคุณ ใฝ่รู้",
    position: "Frontend Developer",
    appliedDate: "2024-02-10",
    status: "ผ่าน",
    email: "kittikun@example.com",
    phone: "084-567-8901",
    interviewDate: "2024-03-01",
    score: 85
  },
  {
    id: 102,
    name: "พิมพ์ชนก สมใจ",
    position: "Marketing Manager",
    appliedDate: "2021-07-20",
    status: "ผ่าน",
    email: "pimchanok@example.com",
    phone: "085-678-9012",
    interviewDate: "2021-08-01",
    score: 92
  },
  {
    id: 103,
    name: "อัญชลี มีชัย",
    position: "HR Officer",
    appliedDate: "2025-10-15",
    status: "นัดสัมภาษณ์",
    email: "anchalee@example.com",
    phone: "087-890-1234",
    interviewDate: "2025-11-05"
  },
  {
    id: 104,
    name: "ประเสริฐ ดีงาม",
    position: "Backend Developer",
    appliedDate: "2025-10-20",
    status: "รอตรวจสอบ",
    email: "prasert@example.com",
    phone: "088-901-2345"
  }
];

// ========== 8) TRAINING (ฝึกอบรม) ==========
export interface Course {
  id: number;
  title: string;
  description: string;
  date: string;
  duration: string; // "3 days", "2 hours"
  seats: number;
  enrolled: number;
  status: "กำลังเปิดรับ" | "ปิดรับ" | "เสร็จสิ้น";
  instructor: string;
}

export const courses: Course[] = [
  {
    id: 1,
    title: "Soft Skill for Teamwork",
    description: "การทำงานเป็นทีม และการสื่อสารที่มีประสิทธิภาพ",
    date: "2025-11-20",
    duration: "1 day",
    seats: 30,
    enrolled: 22,
    status: "กำลังเปิดรับ",
    instructor: "อ.สมศักดิ์ ใจดี"
  },
  {
    id: 2,
    title: "Python for HR Analytics",
    description: "วิเคราะห์ข้อมูล HR ด้วย Python และ Pandas",
    date: "2025-12-05",
    duration: "3 days",
    seats: 25,
    enrolled: 25,
    status: "ปิดรับ",
    instructor: "อ.วิชัย เก่งเทค"
  },
  {
    id: 3,
    title: "Leadership Development",
    description: "พัฒนาทักษะความเป็นผู้นำ",
    date: "2025-10-15",
    duration: "2 days",
    seats: 20,
    enrolled: 18,
    status: "เสร็จสิ้น",
    instructor: "อ.สุภาวดี ดีมาก"
  }
];

// ========== 9) ORGANIZATION (โครงสร้างองค์กร) ==========
export interface Department {
  id: number;
  name: string;
  head: string;
  headCode: string;
  members: string[]; // รหัสพนักงาน
  memberCount: number;
}

export const organization: Department[] = [
  {
    id: 1,
    name: "HR",
    head: "สุภาวดี ดีมาก",
    headCode: "EMP-0010",
    members: ["EMP-0002", "EMP-0006"],
    memberCount: 2
  },
  {
    id: 2,
    name: "IT",
    head: "อภิชาติ เก่งเทค",
    headCode: "EMP-0011",
    members: ["EMP-0001", "EMP-0004"],
    memberCount: 2
  },
  {
    id: 3,
    name: "Account",
    head: "วิชัย รอบคอบ",
    headCode: "EMP-0012",
    members: ["EMP-0003"],
    memberCount: 1
  },
  {
    id: 4,
    name: "Marketing",
    head: "พิมพ์ชนก สมใจ",
    headCode: "EMP-0005",
    members: [],
    memberCount: 0
  }
];

// ========== 10) ANNOUNCEMENTS (ข่าวสาร) ==========
export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  postedBy: string;
  category: "ทั่วไป" | "สำคัญ" | "ด่วน";
}

export const announcements: Announcement[] = [
  {
    id: 1,
    title: "ประกาศวันหยุดยาวปีใหม่ 2026",
    content: "บริษัทจะปิดทำการในช่วงวันที่ 31 ธ.ค. 2025 - 4 ม.ค. 2026",
    date: "2025-12-15",
    postedBy: "HR Department",
    category: "สำคัญ"
  },
  {
    id: 2,
    title: "อบรมความปลอดภัยในการทำงาน",
    content: "ขอเชิญพนักงานทุกท่านเข้าร่วมอบรมความปลอดภัย วันที่ 20 พ.ย. 2025",
    date: "2025-11-01",
    postedBy: "Safety Committee",
    category: "ทั่วไป"
  },
  {
    id: 3,
    title: "[ด่วน] แจ้งปรับระบบ Payroll ชั่วคราว",
    content: "ระบบเงินเดือนจะปิดปรับปรุงวันที่ 25-26 พ.ย. 2025 กรุณาตรวจสอบข้อมูลก่อนวันดังกล่าว",
    date: "2025-11-18",
    postedBy: "IT Department",
    category: "ด่วน"
  }
];

// ========== 11) REPORTS DATA (สำหรับแดชบอร์ดรายงาน) ==========
export interface ReportSummary {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  lateThisMonth: number;
  averageAttendance: number; // %
  totalPayroll: number;
  pendingLeaves: number;
  newHires: number;
}

export const reportSummary: ReportSummary = {
  totalEmployees: 6,
  activeEmployees: 5,
  onLeave: 1,
  lateThisMonth: 2,
  averageAttendance: 95.5,
  totalPayroll: 221700,
  pendingLeaves: 2,
  newHires: 1
};

// Chart Data Examples
export const attendanceChartData = [
  { month: "ก.ค.", onTime: 145, late: 5, absent: 2 },
  { month: "ส.ค.", onTime: 148, late: 3, absent: 1 },
  { month: "ก.ย.", onTime: 142, late: 8, absent: 2 },
  { month: "ต.ค.", onTime: 150, late: 2, absent: 0 }
];

export const departmentData = [
  { name: "IT", value: 2 },
  { name: "HR", value: 2 },
  { name: "Account", value: 1 },
  { name: "Marketing", value: 1 }
];

// ========== 12) FUND: DONATIONS (การบริจาค) ==========
export interface Donation {
  id: number;
  donorName: string;
  donorType: "Individual" | "Company";
  amount: number;
  date: string;
  purpose: string;
  receiptNo?: string;
  status: "Confirmed" | "Pending";
}

export const donations: Donation[] = [
  {
    id: 1,
    donorName: "บริษัท เอ.บี.ซี. จำกัด",
    donorType: "Company",
    amount: 500000,
    date: "2025-01-15",
    purpose: "สนับสนุนทุนการศึกษา",
    receiptNo: "DON-2025-0001",
    status: "Confirmed"
  },
  {
    id: 2,
    donorName: "คุณสมชาย ใจดี",
    donorType: "Individual",
    amount: 10000,
    date: "2025-01-20",
    purpose: "สนับสนุนกิจกรรมพนักงาน",
    receiptNo: "DON-2025-0002",
    status: "Confirmed"
  },
  {
    id: 3,
    donorName: "บริษัท ดี.อี.เอฟ. จำกัด",
    donorType: "Company",
    amount: 250000,
    date: "2025-01-25",
    purpose: "สนับสนุนสวัสดิการพนักงาน",
    receiptNo: "DON-2025-0003",
    status: "Pending"
  },
  {
    id: 4,
    donorName: "คุณวิภา รักษ์สุข",
    donorType: "Individual",
    amount: 5000,
    date: "2025-02-01",
    purpose: "บริจาคทั่วไป",
    receiptNo: "DON-2025-0004",
    status: "Confirmed"
  }
];

// ========== 13) FUND: EXPENDITURES (การเบิกจ่าย) ==========
export interface Expenditure {
  id: number;
  requestBy: string;
  dept: string;
  amount: number;
  date: string;
  purpose: string;
  status: "Approved" | "Pending" | "Rejected";
  approvedBy?: string;
}

export const expenditures: Expenditure[] = [
  {
    id: 1,
    requestBy: "สมหญิง รักงาน",
    dept: "HR",
    amount: 50000,
    date: "2025-01-18",
    purpose: "จัดงานปีใหม่พนักงาน",
    status: "Approved",
    approvedBy: "ผู้จัดการ HR"
  },
  {
    id: 2,
    requestBy: "พิมพ์ชนก สมใจ",
    dept: "Marketing",
    amount: 80000,
    date: "2025-01-22",
    purpose: "จัดงานสัมมนาพนักงาน",
    status: "Pending"
  },
  {
    id: 3,
    requestBy: "วรพล ตั้งใจ",
    dept: "Account",
    amount: 30000,
    date: "2025-01-28",
    purpose: "ซื้ออุปกรณ์สำนักงาน",
    status: "Approved",
    approvedBy: "ผู้จัดการฝ่ายบัญชี"
  }
];

// ========== 14) FUND: APPROVALS (คำขออนุมัติ) ==========
export interface FundApproval {
  id: number;
  requestBy: string;
  dept: string;
  amount: number;
  requestDate: string;
  purpose: string;
  status: "Pending" | "Approved" | "Rejected";
}

export const fundApprovals: FundApproval[] = [
  {
    id: 1,
    requestBy: "กิตติคุณ ใฝ่รู้",
    dept: "IT",
    amount: 120000,
    requestDate: "2025-02-05",
    purpose: "ซื้อ Software License",
    status: "Pending"
  },
  {
    id: 2,
    requestBy: "พิมพ์ชนก สมใจ",
    dept: "Marketing",
    amount: 80000,
    requestDate: "2025-01-22",
    purpose: "จัดงานสัมมนาพนักงาน",
    status: "Pending"
  }
];

// ========== 15) FUND: SUMMARY (สรุปยอดกองทุน) ==========
export const fundSummary = {
  totalBalance: 2500000,
  totalDonations: 765000,
  totalExpenditures: 160000,
  pendingApprovals: 2
};

// ========== 16) EMPLOYEE HISTORY (ประวัติการทำงาน) ==========
// ประวัติการขึ้น-ลดเงินเดือน
export interface SalaryHistory {
  id: number;
  empCode: string;
  empName: string;
  date: string;
  type: "ขึ้นเงินเดือน" | "ลดเงินเดือน" | "ปรับเงินเดือน";
  oldSalary: number;
  newSalary: number;
  changeAmount: number;
  reason: string;
  note: string; // หมายเหตุ
  approvedBy: string;
}

export const salaryHistory: SalaryHistory[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    date: "2024-06-01",
    type: "ขึ้นเงินเดือน",
    oldSalary: 40000,
    newSalary: 45000,
    changeAmount: 5000,
    reason: "ครบรอบ 1 ปี และผลงานดีเยี่ยม",
    note: "ขึ้นเงินเดือนตามนโยบายประจำปี พร้อมปรับ OT Rate เป็น 250 บาท/ชั่วโมง",
    approvedBy: "ผจก.IT"
  },
  {
    id: 2,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    date: "2023-12-01",
    type: "ขึ้นเงินเดือน",
    oldSalary: 35000,
    newSalary: 40000,
    changeAmount: 5000,
    reason: "เลื่อนตำแหน่งเป็น Senior Developer",
    note: "ขึ้นเงินเดือนพร้อมกับการเลื่อนตำแหน่ง",
    approvedBy: "ผจก.IT"
  },
  {
    id: 3,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    date: "2023-06-01",
    type: "ปรับเงินเดือน",
    oldSalary: 30000,
    newSalary: 35000,
    changeAmount: 5000,
    reason: "เริ่มงานตำแหน่ง Developer",
    note: "เงินเดือนเริ่มต้นตามตำแหน่ง",
    approvedBy: "ผจก.IT"
  },
  {
    id: 4,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    date: "2023-11-15",
    type: "ขึ้นเงินเดือน",
    oldSalary: 30000,
    newSalary: 35000,
    changeAmount: 5000,
    reason: "ครบรอบ 1 ปี",
    note: "ขึ้นเงินเดือนตามมาตรฐานการประเมินผลงานประจำปี",
    approvedBy: "ผจก.HR"
  },
  {
    id: 5,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    date: "2022-11-15",
    type: "ปรับเงินเดือน",
    oldSalary: 28000,
    newSalary: 30000,
    changeAmount: 2000,
    reason: "เริ่มงานตำแหน่ง HR Officer",
    note: "เงินเดือนเริ่มต้นตามตำแหน่ง",
    approvedBy: "ผจก.HR"
  },
  {
    id: 6,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    date: "2024-07-01",
    type: "ขึ้นเงินเดือน",
    oldSalary: 35000,
    newSalary: 40000,
    changeAmount: 5000,
    reason: "เลื่อนตำแหน่งเป็น Senior Accountant",
    note: "ขึ้นเงินเดือนพร้อมกับการเลื่อนตำแหน่ง เนื่องจากผลงานดีเยี่ยม",
    approvedBy: "ผู้จัดการฝ่ายบัญชี"
  },
  {
    id: 7,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    date: "2024-01-10",
    type: "ปรับเงินเดือน",
    oldSalary: 32000,
    newSalary: 35000,
    changeAmount: 3000,
    reason: "เริ่มงานตำแหน่ง Accountant",
    note: "เงินเดือนเริ่มต้นตามตำแหน่ง",
    approvedBy: "ผู้จัดการฝ่ายบัญชี"
  },
  {
    id: 8,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    date: "2024-09-01",
    type: "ขึ้นเงินเดือน",
    oldSalary: 35000,
    newSalary: 38000,
    changeAmount: 3000,
    reason: "ครบรอบ 6 เดือน และผลงานดี",
    note: "ขึ้นเงินเดือนตามผลการประเมิน",
    approvedBy: "ผจก.IT"
  },
  {
    id: 9,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    date: "2024-03-20",
    type: "ปรับเงินเดือน",
    oldSalary: 30000,
    newSalary: 35000,
    changeAmount: 5000,
    reason: "โยกย้ายตำแหน่งเป็น Frontend Developer",
    note: "ปรับเงินเดือนตามตำแหน่งใหม่",
    approvedBy: "ผจก.IT"
  },
  {
    id: 10,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    date: "2023-08-05",
    type: "ขึ้นเงินเดือน",
    oldSalary: 45000,
    newSalary: 50000,
    changeAmount: 5000,
    reason: "ครบรอบ 2 ปี และผลงานโดดเด่น",
    note: "ขึ้นเงินเดือนตามผลการประเมินประจำปี และผลงานที่โดดเด่นในโครงการต่างๆ",
    approvedBy: "ผู้จัดการฝ่ายการตลาด"
  },
  {
    id: 11,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    date: "2022-08-05",
    type: "ขึ้นเงินเดือน",
    oldSalary: 40000,
    newSalary: 45000,
    changeAmount: 5000,
    reason: "ครบรอบ 1 ปี",
    note: "ขึ้นเงินเดือนตามมาตรฐานการประเมินผลงานประจำปี",
    approvedBy: "ผู้จัดการฝ่ายการตลาด"
  },
  {
    id: 12,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    date: "2021-08-05",
    type: "ปรับเงินเดือน",
    oldSalary: 35000,
    newSalary: 40000,
    changeAmount: 5000,
    reason: "เริ่มงานตำแหน่ง Marketing Manager",
    note: "เงินเดือนเริ่มต้นตามตำแหน่ง",
    approvedBy: "ผู้จัดการฝ่ายการตลาด"
  }
];

// ประวัติทันบนหรือการลงโทษ
export interface RewardPenaltyHistory {
  id: number;
  empCode: string;
  empName: string;
  date: string;
  type: "ทันบน" | "ลงโทษ";
  category: string; // เช่น "ทันบนผลงาน", "ทันบนความดี", "ตักเตือน", "ใบเหลือง", "ใบแดง"
  title: string;
  description: string;
  note: string; // หมายเหตุ
  issuedBy: string;
  amount?: number; // จำนวนเงิน (สำหรับทันบน)
}

export const rewardPenaltyHistory: RewardPenaltyHistory[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    date: "2024-09-15",
    type: "ทันบน",
    category: "ทันบนผลงาน",
    title: "ทันบนผลงานดีเยี่ยม Q3 2024",
    description: "ทำงานดีเยี่ยม มีความรับผิดชอบสูง และช่วยทีมแก้ปัญหาได้อย่างรวดเร็ว",
    note: "ได้รับรางวัลพนักงานดีเด่นประจำไตรมาส และเงินรางวัล 5,000 บาท",
    issuedBy: "ผจก.IT",
    amount: 5000
  },
  {
    id: 2,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    date: "2024-03-20",
    type: "ทันบน",
    category: "ทันบนความดี",
    title: "ทันบนช่วยเหลือเพื่อนร่วมงาน",
    description: "ช่วยสอนและแนะนำเพื่อนร่วมงานใหม่ให้เข้าใจระบบได้อย่างรวดเร็ว",
    note: "แสดงให้เห็นถึงจิตใจที่ดีและความพร้อมในการช่วยเหลือทีม",
    issuedBy: "หัวหน้าทีม IT",
    amount: 2000
  },
  {
    id: 3,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    date: "2024-12-10",
    type: "ทันบน",
    category: "ทันบนผลงาน",
    title: "ทันบนโครงการสำเร็จลุล่วง",
    description: "นำทีมพัฒนาโครงการสำคัญให้สำเร็จลุล่วงก่อนกำหนดเวลา",
    note: "แสดงให้เห็นถึงความสามารถในการเป็นผู้นำและจัดการโครงการ",
    issuedBy: "ผจก.IT",
    amount: 3000
  },
  {
    id: 4,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    date: "2024-10-05",
    type: "ทันบน",
    category: "ทันบนความดี",
    title: "ทันบนการช่วยเหลือทีม",
    description: "ช่วยจัดกิจกรรมและดูแลสวัสดิการพนักงานได้เป็นอย่างดี",
    note: "แสดงให้เห็นถึงความเอาใจใส่และความรับผิดชอบ",
    issuedBy: "ผจก.HR",
    amount: 2000
  },
  {
    id: 5,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    date: "2023-12-20",
    type: "ทันบน",
    category: "ทันบนผลงาน",
    title: "ทันบนการทำงานดีเยี่ยม",
    description: "ทำงานได้อย่างมีประสิทธิภาพและมีความรับผิดชอบสูง",
    note: "ได้รับรางวัลพนักงานดีเด่นประจำปี",
    issuedBy: "ผจก.HR",
    amount: 5000
  },
  {
    id: 6,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    date: "2024-08-10",
    type: "ทันบน",
    category: "ทันบนผลงาน",
    title: "ทันบนความละเอียดรอบคอบ",
    description: "ตรวจสอบเอกสารทางการเงินได้อย่างละเอียดและพบข้อผิดพลาดที่สำคัญ",
    note: "ช่วยป้องกันความเสียหายทางการเงินได้เป็นจำนวนมาก",
    issuedBy: "ผู้จัดการฝ่ายบัญชี",
    amount: 3000
  },
  {
    id: 7,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    date: "2024-11-15",
    type: "ทันบน",
    category: "ทันบนผลงาน",
    title: "ทันบนการทำงานเป็นทีม",
    description: "ทำงานร่วมกับทีมได้อย่างดีและช่วยแก้ปัญหาที่ซับซ้อน",
    note: "แสดงให้เห็นถึงความสามารถในการทำงานเป็นทีม",
    issuedBy: "ผู้จัดการฝ่ายบัญชี",
    amount: 2000
  },
  {
    id: 8,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    date: "2024-05-15",
    type: "ลงโทษ",
    category: "ตักเตือน",
    title: "ตักเตือนเรื่องการมาสาย",
    description: "มาสายบ่อยครั้งในช่วงเดือนเมษายน-พฤษภาคม 2024",
    note: "ตักเตือนครั้งแรก กรุณาปรับปรุงการตรงต่อเวลา หากยังมีพฤติกรรมเดิมจะพิจารณาใบเหลือง",
    issuedBy: "หัวหน้าทีม IT"
  },
  {
    id: 9,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    date: "2024-10-20",
    type: "ทันบน",
    category: "ทันบนผลงาน",
    title: "ทันบนการพัฒนาตนเอง",
    description: "พัฒนาทักษะการเขียนโปรแกรมได้อย่างรวดเร็วและมีผลงานดีขึ้น",
    note: "แสดงให้เห็นถึงความมุ่งมั่นในการพัฒนาตนเอง",
    issuedBy: "หัวหน้าทีม IT",
    amount: 1500
  },
  {
    id: 10,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    date: "2024-11-01",
    type: "ทันบน",
    category: "ทันบนผลงาน",
    title: "ทันบนโครงการสำเร็จ",
    description: "นำทีมทำโครงการการตลาดให้สำเร็จและได้ผลตอบรับที่ดี",
    note: "แสดงให้เห็นถึงความสามารถในการเป็นผู้นำและจัดการโครงการ",
    issuedBy: "ผู้จัดการฝ่ายการตลาด",
    amount: 5000
  },
  {
    id: 11,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    date: "2023-12-15",
    type: "ทันบน",
    category: "ทันบนผลงาน",
    title: "ทันบนผลงานดีเยี่ยม",
    description: "ทำงานได้อย่างมีประสิทธิภาพและมีผลงานโดดเด่น",
    note: "ได้รับรางวัลพนักงานดีเด่นประจำปี",
    issuedBy: "ผู้จัดการฝ่ายการตลาด",
    amount: 5000
  },
  {
    id: 12,
    empCode: "EMP-0006",
    empName: "ธีรภัทร แข็งแรง",
    date: "2024-06-20",
    type: "ลงโทษ",
    category: "ใบเหลือง",
    title: "ใบเหลืองเรื่องการขาดงาน",
    description: "ขาดงานโดยไม่แจ้งล่วงหน้า 3 ครั้งในเดือนมิถุนายน",
    note: "ใบเหลืองครั้งที่ 1 หากยังมีพฤติกรรมเดิมจะพิจารณาใบแดงและอาจมีการพิจารณาเลิกจ้าง",
    issuedBy: "ผจก.HR"
  },
  {
    id: 13,
    empCode: "EMP-0006",
    empName: "ธีรภัทร แข็งแรง",
    date: "2024-04-10",
    type: "ลงโทษ",
    category: "ตักเตือน",
    title: "ตักเตือนเรื่องการมาสาย",
    description: "มาสายบ่อยครั้งในช่วงเดือนมีนาคม-เมษายน 2024",
    note: "ตักเตือนครั้งแรก กรุณาปรับปรุงการตรงต่อเวลา",
    issuedBy: "ผจก.HR"
  }
];

// ประวัติการโยก-ย้ายตำแหน่ง
export interface PositionTransferHistory {
  id: number;
  empCode: string;
  empName: string;
  date: string;
  type: "โยกย้าย" | "เลื่อนตำแหน่ง" | "ลดตำแหน่ง" | "เปลี่ยนแผนก";
  oldDept: string;
  newDept: string;
  oldPosition: string;
  newPosition: string;
  reason: string;
  note: string; // หมายเหตุ
  approvedBy: string;
}

export const positionTransferHistory: PositionTransferHistory[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    date: "2023-12-01",
    type: "เลื่อนตำแหน่ง",
    oldDept: "ปั๊มน้ำมัน",
    newDept: "ปั๊มน้ำมัน",
    oldPosition: "พนักงานปั๊ม",
    newPosition: "หัวหน้าปั๊ม",
    reason: "ผลงานดีเยี่ยมและมีทักษะการเป็นผู้นำ",
    note: "เลื่อนตำแหน่งตามผลการประเมินประจำปี และได้รับมอบหมายให้ดูแลทีมพนักงานปั๊ม",
    approvedBy: "ผู้จัดการปั๊ม"
  },
  {
    id: 2,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    date: "2023-06-01",
    type: "เปลี่ยนแผนก",
    oldDept: "เซเว่น",
    newDept: "ปั๊มน้ำมัน",
    oldPosition: "พนักงานร้าน",
    newPosition: "พนักงานปั๊ม",
    reason: "เปลี่ยนแผนกตามความสนใจและทักษะ",
    note: "โยกย้ายจากร้านเซเว่นมาทำงานในปั๊มน้ำมัน เนื่องจากมีความสนใจด้านการบริการน้ำมัน",
    approvedBy: "ผู้จัดการปั๊ม"
  },
  {
    id: 3,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    date: "2023-05-01",
    type: "เปลี่ยนแผนก",
    oldDept: "ปั๊มน้ำมัน",
    newDept: "ปั๊มน้ำมัน",
    oldPosition: "พนักงานปั๊ม",
    newPosition: "แคชเชียร์",
    reason: "เปลี่ยนตำแหน่งตามความสนใจและทักษะ",
    note: "เปลี่ยนจากพนักงานปั๊มมาเป็นแคชเชียร์ เนื่องจากมีความสนใจด้านการเงินและการบริการลูกค้า",
    approvedBy: "ผู้จัดการปั๊ม"
  },
  {
    id: 4,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    date: "2022-11-15",
    type: "เปลี่ยนแผนก",
    oldDept: "ยิ้ม",
    newDept: "ปั๊มน้ำมัน",
    oldPosition: "พนักงานร้าน",
    newPosition: "พนักงานปั๊ม",
    reason: "เปลี่ยนแผนกเพื่อพัฒนาทักษะ",
    note: "โยกย้ายจากร้านยิ้มมาทำงานในปั๊มน้ำมัน เพื่อพัฒนาทักษะด้านการบริการ",
    approvedBy: "ผู้จัดการปั๊ม"
  },
  {
    id: 5,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    date: "2024-07-01",
    type: "เลื่อนตำแหน่ง",
    oldDept: "ปั๊มน้ำมัน",
    newDept: "ปั๊มน้ำมัน",
    oldPosition: "พนักงานปั๊ม",
    newPosition: "พนักงานปั๊ม",
    reason: "ผลงานดีเยี่ยมและมีความเชี่ยวชาญสูง",
    note: "ได้รับมอบหมายให้ดูแลงานเพิ่มเติมและเพิ่มความรับผิดชอบ",
    approvedBy: "ผู้จัดการปั๊ม"
  },
  {
    id: 6,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    date: "2024-03-20",
    type: "โยกย้าย",
    oldDept: "ปึงหงี่เชียง",
    newDept: "เซเว่น",
    oldPosition: "พนักงานร้าน",
    newPosition: "พนักงานร้าน",
    reason: "เปลี่ยนแผนกตามความสนใจ",
    note: "โยกย้ายจากร้านปึงหงี่เชียงมาทำงานในร้านเซเว่น เนื่องจากต้องการพัฒนาทักษะด้านการบริการ",
    approvedBy: "หัวหน้าร้านเซเว่น"
  },
  {
    id: 7,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    date: "2024-01-15",
    type: "เปลี่ยนแผนก",
    oldDept: "เจ้าสัว",
    newDept: "ปึงหงี่เชียง",
    oldPosition: "พนักงานร้าน",
    newPosition: "พนักงานร้าน",
    reason: "เปลี่ยนแผนกเพื่อพัฒนาทักษะ",
    note: "โยกย้ายจากร้านเจ้าสัวมาทำงานในร้านปึงหงี่เชียง เพื่อพัฒนาทักษะด้านการขาย",
    approvedBy: "หัวหน้าร้านปึงหงี่เชียง"
  },
  {
    id: 8,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    date: "2022-03-01",
    type: "เลื่อนตำแหน่ง",
    oldDept: "ปึงหงี่เชียง",
    newDept: "ปึงหงี่เชียง",
    oldPosition: "พนักงานร้าน",
    newPosition: "หัวหน้าร้าน",
    reason: "ผลงานดีเยี่ยมและมีทักษะการเป็นผู้นำ",
    note: "เลื่อนตำแหน่งตามผลการประเมินประจำปี และได้รับมอบหมายให้ดูแลทีมร้านปึงหงี่เชียง",
    approvedBy: "ผู้จัดการร้าน"
  },
  {
    id: 9,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    date: "2021-08-05",
    type: "เปลี่ยนแผนก",
    oldDept: "ร้านเจียง",
    newDept: "ปึงหงี่เชียง",
    oldPosition: "พนักงานร้าน",
    newPosition: "พนักงานร้าน",
    reason: "เปลี่ยนแผนกตามความสนใจ",
    note: "โยกย้ายจากร้านเจียงมาทำงานในร้านปึงหงี่เชียง เนื่องจากมีความสนใจด้านการขายสินค้าประเภทนี้",
    approvedBy: "หัวหน้าร้านปึงหงี่เชียง"
  },
  {
    id: 10,
    empCode: "EMP-0006",
    empName: "ธีรภัทร แข็งแรง",
    date: "2024-01-15",
    type: "เปลี่ยนแผนก",
    oldDept: "ร้านเชสเตอร์",
    newDept: "เจ้าสัว",
    oldPosition: "พนักงานร้าน",
    newPosition: "พนักงานร้าน",
    reason: "เปลี่ยนแผนกตามความสนใจ",
    note: "โยกย้ายจากร้านเชสเตอร์มาทำงานในร้านเจ้าสัว เนื่องจากมีความสนใจด้านการขายสินค้าประเภทนี้",
    approvedBy: "หัวหน้าร้านเจ้าสัว"
  },
  {
    id: 11,
    empCode: "EMP-0006",
    empName: "ธีรภัทร แข็งแรง",
    date: "2023-02-14",
    type: "เปลี่ยนแผนก",
    oldDept: "ปั๊มน้ำมัน",
    newDept: "ร้านเชสเตอร์",
    oldPosition: "พนักงานปั๊ม",
    newPosition: "พนักงานร้าน",
    reason: "เปลี่ยนแผนกเพื่อพัฒนาทักษะ",
    note: "โยกย้ายจากปั๊มน้ำมันมาทำงานในร้านเชสเตอร์ เพื่อพัฒนาทักษะด้านการบริการอาหาร",
    approvedBy: "หัวหน้าร้านเชสเตอร์"
  },
  {
    id: 12,
    empCode: "EMP-0007",
    empName: "ประเสริฐ ดีงาม",
    date: "2024-05-01",
    type: "เปลี่ยนแผนก",
    oldDept: "ปั๊มน้ำมัน",
    newDept: "ร้านเจียง",
    oldPosition: "พนักงานปั๊ม",
    newPosition: "พนักงานร้าน",
    reason: "เปลี่ยนแผนกตามความสนใจ",
    note: "โยกย้ายจากปั๊มน้ำมันมาทำงานในร้านเจียง เนื่องจากมีความสนใจด้านการขายสินค้า",
    approvedBy: "หัวหน้าร้านเจียง"
  },
  {
    id: 13,
    empCode: "EMP-0008",
    empName: "อัญชลี มีชัย",
    date: "2023-09-10",
    type: "เลื่อนตำแหน่ง",
    oldDept: "ร้านเชสเตอร์",
    newDept: "ร้านเชสเตอร์",
    oldPosition: "พนักงานร้าน",
    newPosition: "พนักงานร้าน",
    reason: "ผลงานดีเยี่ยมและมีความรับผิดชอบสูง",
    note: "ได้รับมอบหมายให้ดูแลงานเพิ่มเติมและเพิ่มความรับผิดชอบ",
    approvedBy: "หัวหน้าร้านเชสเตอร์"
  },
  {
    id: 14,
    empCode: "EMP-0008",
    empName: "อัญชลี มีชัย",
    date: "2022-06-01",
    type: "เปลี่ยนแผนก",
    oldDept: "ยิ้ม",
    newDept: "ร้านเชสเตอร์",
    oldPosition: "พนักงานร้าน",
    newPosition: "พนักงานร้าน",
    reason: "เปลี่ยนแผนกตามความสนใจ",
    note: "โยกย้ายจากร้านยิ้มมาทำงานในร้านเชสเตอร์ เนื่องจากมีความสนใจด้านการบริการอาหาร",
    approvedBy: "หัวหน้าร้านเชสเตอร์"
  },
  {
    id: 15,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    date: "2024-09-01",
    type: "เลื่อนตำแหน่ง",
    oldDept: "ปั๊มน้ำมัน",
    newDept: "ปั๊มน้ำมัน",
    oldPosition: "หัวหน้าปั๊ม",
    newPosition: "หัวหน้าปั๊ม",
    reason: "ผลงานดีเยี่ยมและมีทักษะการเป็นผู้นำทีม",
    note: "ได้รับมอบหมายให้ดูแลงานเพิ่มเติมและเพิ่มความรับผิดชอบในการจัดการปั๊ม",
    approvedBy: "ผู้จัดการปั๊ม"
  },
  {
    id: 16,
    empCode: "EMP-0009",
    empName: "วิภา รักษ์สุข",
    date: "2023-08-01",
    type: "เลื่อนตำแหน่ง",
    oldDept: "แม่บ้าน",
    newDept: "แม่บ้าน",
    oldPosition: "แม่บ้าน",
    newPosition: "หัวหน้าแม่บ้าน",
    reason: "ผลงานดีเยี่ยมและมีทักษะการเป็นผู้นำ",
    note: "เลื่อนตำแหน่งตามผลการประเมินประจำปี และได้รับมอบหมายให้ดูแลทีมแม่บ้าน",
    approvedBy: "ผู้จัดการปั๊ม"
  },
  {
    id: 17,
    empCode: "EMP-0011",
    empName: "นภัสวรรณ สวยงาม",
    date: "2023-11-20",
    type: "เปลี่ยนแผนก",
    oldDept: "ปั๊มน้ำมัน",
    newDept: "ยิ้ม",
    oldPosition: "พนักงานปั๊ม",
    newPosition: "พนักงานร้าน",
    reason: "เปลี่ยนแผนกตามความสนใจ",
    note: "โยกย้ายจากปั๊มน้ำมันมาทำงานในร้านยิ้ม เนื่องจากมีความสนใจด้านการขายสินค้า",
    approvedBy: "หัวหน้าร้านยิ้ม"
  }
];

// ประวัติการทำงาน (Work History)
export interface WorkHistory {
  id: number;
  empCode: string;
  empName: string;
  startDate: string;
  endDate?: string; // ถ้าเป็น null แสดงว่ายังทำงานอยู่
  dept: string;
  position: string;
  status: "Active" | "Completed" | "Transferred";
  description?: string;
}

export const workHistory: WorkHistory[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    startDate: "2023-06-01",
    endDate: "2023-11-30",
    dept: "ปั๊มน้ำมัน",
    position: "พนักงานปั๊ม",
    status: "Transferred",
    description: "เริ่มงานในตำแหน่งพนักงานปั๊ม"
  },
  {
    id: 2,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    startDate: "2023-12-01",
    dept: "ปั๊มน้ำมัน",
    position: "หัวหน้าปั๊ม",
    status: "Active",
    description: "เลื่อนตำแหน่งเป็นหัวหน้าปั๊มในเดือนธันวาคม 2023"
  },
  {
    id: 3,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    startDate: "2022-11-15",
    endDate: "2023-04-30",
    dept: "ยิ้ม",
    position: "พนักงานร้าน",
    status: "Transferred",
    description: "เริ่มงานในตำแหน่งพนักงานร้านยิ้ม"
  },
  {
    id: 4,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    startDate: "2023-05-01",
    dept: "ปั๊มน้ำมัน",
    position: "แคชเชียร์",
    status: "Active",
    description: "โยกย้ายจากร้านยิ้มมาทำงานในปั๊มน้ำมันเป็นแคชเชียร์"
  },
  {
    id: 5,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    startDate: "2024-01-10",
    dept: "ปั๊มน้ำมัน",
    position: "พนักงานปั๊ม",
    status: "Active",
    description: "เริ่มงานในตำแหน่งพนักงานปั๊ม"
  },
  {
    id: 6,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    startDate: "2024-01-15",
    endDate: "2024-03-19",
    dept: "เจ้าสัว",
    position: "พนักงานร้าน",
    status: "Transferred",
    description: "เริ่มงานในตำแหน่งพนักงานร้านเจ้าสัว"
  },
  {
    id: 7,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    startDate: "2024-03-20",
    dept: "เซเว่น",
    position: "พนักงานร้าน",
    status: "Active",
    description: "โยกย้ายจากร้านเจ้าสัวมาทำงานในร้านเซเว่น"
  },
  {
    id: 8,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    startDate: "2021-08-05",
    endDate: "2022-02-28",
    dept: "ร้านเจียง",
    position: "พนักงานร้าน",
    status: "Transferred",
    description: "เริ่มงานในตำแหน่งพนักงานร้านเจียง"
  },
  {
    id: 9,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    startDate: "2022-03-01",
    dept: "ปึงหงี่เชียง",
    position: "หัวหน้าร้าน",
    status: "Active",
    description: "เลื่อนตำแหน่งเป็นหัวหน้าร้านปึงหงี่เชียง"
  },
  {
    id: 10,
    empCode: "EMP-0006",
    empName: "ธีรภัทร แข็งแรง",
    startDate: "2023-02-14",
    endDate: "2024-01-14",
    dept: "ร้านเชสเตอร์",
    position: "พนักงานร้าน",
    status: "Transferred",
    description: "เริ่มงานในตำแหน่งพนักงานร้านเชสเตอร์"
  },
  {
    id: 11,
    empCode: "EMP-0006",
    empName: "ธีรภัทร แข็งแรง",
    startDate: "2024-01-15",
    dept: "เจ้าสัว",
    position: "พนักงานร้าน",
    status: "Active",
    description: "โยกย้ายจากร้านเชสเตอร์มาทำงานในร้านเจ้าสัว"
  },
  {
    id: 12,
    empCode: "EMP-0007",
    empName: "ประเสริฐ ดีงาม",
    startDate: "2024-05-01",
    dept: "ร้านเจียง",
    position: "พนักงานร้าน",
    status: "Active",
    description: "เริ่มงานในตำแหน่งพนักงานร้านเจียง"
  },
  {
    id: 13,
    empCode: "EMP-0008",
    empName: "อัญชลี มีชัย",
    startDate: "2022-06-01",
    endDate: "2023-09-09",
    dept: "ยิ้ม",
    position: "พนักงานร้าน",
    status: "Transferred",
    description: "เริ่มงานในตำแหน่งพนักงานร้านยิ้ม"
  },
  {
    id: 14,
    empCode: "EMP-0008",
    empName: "อัญชลี มีชัย",
    startDate: "2023-09-10",
    dept: "ร้านเชสเตอร์",
    position: "พนักงานร้าน",
    status: "Active",
    description: "โยกย้ายจากร้านยิ้มมาทำงานในร้านเชสเตอร์"
  },
  {
    id: 15,
    empCode: "EMP-0009",
    empName: "วิภา รักษ์สุข",
    startDate: "2022-03-01",
    endDate: "2023-07-31",
    dept: "แม่บ้าน",
    position: "แม่บ้าน",
    status: "Transferred",
    description: "เริ่มงานในตำแหน่งแม่บ้าน"
  },
  {
    id: 16,
    empCode: "EMP-0009",
    empName: "วิภา รักษ์สุข",
    startDate: "2023-08-01",
    dept: "แม่บ้าน",
    position: "หัวหน้าแม่บ้าน",
    status: "Active",
    description: "เลื่อนตำแหน่งเป็นหัวหน้าแม่บ้าน"
  },
  {
    id: 17,
    empCode: "EMP-0010",
    empName: "สมเกียรติ ใจดี",
    startDate: "2024-02-15",
    dept: "ปั๊มน้ำมัน",
    position: "พนักงานปั๊ม",
    status: "Active",
    description: "เริ่มงานในตำแหน่งพนักงานปั๊ม"
  },
  {
    id: 18,
    empCode: "EMP-0011",
    empName: "นภัสวรรณ สวยงาม",
    startDate: "2023-11-20",
    dept: "ยิ้ม",
    position: "พนักงานร้าน",
    status: "Active",
    description: "เริ่มงานในตำแหน่งพนักงานร้านยิ้ม"
  },
  {
    id: 19,
    empCode: "EMP-0012",
    empName: "กมลชนก ใสสะอาด",
    startDate: "2023-08-10",
    dept: "แม่บ้าน",
    position: "แม่บ้าน",
    status: "Active",
    description: "เริ่มงานในตำแหน่งแม่บ้าน"
  }
];

// ========== 17) SOCIAL SECURITY (ประกันสังคม) ==========
export interface SocialSecurity {
  id: number;
  empCode: string;
  empName: string;
  ssoNumber: string; // เลขประกันสังคม
  registrationDate: string; // วันที่ขึ้นทะเบียน
  section: "33" | "39" | "40"; // มาตรา
  status: "Active" | "Inactive" | "Suspended"; // สถานะ
  salaryBase: number; // ฐานเงินเดือนสำหรับคำนวณเงินสมทบ
  employeeContribution: number; // เงินสมทบฝ่ายลูกจ้าง (5% สูงสุด 750 บาท)
  employerContribution: number; // เงินสมทบฝ่ายนายจ้าง (5% สูงสุด 750 บาท)
  totalContribution: number; // รวมเงินสมทบ
}

export const socialSecurity: SocialSecurity[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    ssoNumber: "1234567890123",
    registrationDate: "2023-06-01",
    section: "33",
    status: "Active",
    salaryBase: 45000,
    employeeContribution: 750, // 5% ของ 45000 = 2250 แต่สูงสุด 750
    employerContribution: 750,
    totalContribution: 1500
  },
  {
    id: 2,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    ssoNumber: "2345678901234",
    registrationDate: "2022-11-15",
    section: "33",
    status: "Active",
    salaryBase: 35000,
    employeeContribution: 750, // 5% ของ 35000 = 1750 แต่สูงสุด 750
    employerContribution: 750,
    totalContribution: 1500
  },
  {
    id: 3,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    ssoNumber: "3456789012345",
    registrationDate: "2024-01-10",
    section: "33",
    status: "Active",
    salaryBase: 40000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500
  },
  {
    id: 4,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    ssoNumber: "4567890123456",
    registrationDate: "2024-03-20",
    section: "33",
    status: "Active",
    salaryBase: 38000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500
  },
  {
    id: 5,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    ssoNumber: "5678901234567",
    registrationDate: "2021-08-05",
    section: "33",
    status: "Active",
    salaryBase: 50000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500
  },
  {
    id: 6,
    empCode: "EMP-0006",
    empName: "ธีรภัทร แข็งแรง",
    ssoNumber: "6789012345678",
    registrationDate: "2023-02-14",
    section: "39",
    status: "Active",
    salaryBase: 0, // มาตรา 39 ไม่มีฐานเงินเดือน
    employeeContribution: 432, // มาตรา 39 จ่าย 432 บาท/เดือน
    employerContribution: 0,
    totalContribution: 432
  },
  {
    id: 7,
    empCode: "EMP-0007",
    empName: "ประเสริฐ ดีงาม",
    ssoNumber: "7890123456789",
    registrationDate: "2024-05-01",
    section: "33",
    status: "Active",
    salaryBase: 38000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500
  },
  {
    id: 8,
    empCode: "EMP-0008",
    empName: "อัญชลี มีชัย",
    ssoNumber: "8901234567890",
    registrationDate: "2023-09-10",
    section: "33",
    status: "Active",
    salaryBase: 40000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500
  },
  {
    id: 9,
    empCode: "EMP-0009",
    empName: "วิภา รักษ์สุข",
    ssoNumber: "9012345678901",
    registrationDate: "2022-03-01",
    section: "33",
    status: "Active",
    salaryBase: 35000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500
  },
  {
    id: 10,
    empCode: "EMP-0010",
    empName: "สมเกียรติ ใจดี",
    ssoNumber: "0123456789012",
    registrationDate: "2024-02-15",
    section: "33",
    status: "Active",
    salaryBase: 38000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500
  },
  {
    id: 11,
    empCode: "EMP-0011",
    empName: "นภัสวรรณ สวยงาม",
    ssoNumber: "1234509876543",
    registrationDate: "2023-11-20",
    section: "33",
    status: "Active",
    salaryBase: 35000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500
  },
  {
    id: 12,
    empCode: "EMP-0012",
    empName: "กมลชนก ใสสะอาด",
    ssoNumber: "2345610987654",
    registrationDate: "2023-08-10",
    section: "33",
    status: "Active",
    salaryBase: 32000,
    employeeContribution: 750, // 5% ของ 32000 = 1600 แต่สูงสุด 750
    employerContribution: 750,
    totalContribution: 1500
  }
];

// ประวัติการจ่ายเงินสมทบประกันสังคมรายเดือน
export interface SocialSecurityContribution {
  id: number;
  empCode: string;
  empName: string;
  month: string; // YYYY-MM
  salaryBase: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  paymentDate: string; // วันที่จ่าย
  status: "Paid" | "Pending" | "Overdue"; // สถานะการจ่าย
}

export const socialSecurityContributions: SocialSecurityContribution[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    month: "2025-10",
    salaryBase: 45000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500,
    paymentDate: "2025-10-15",
    status: "Paid"
  },
  {
    id: 2,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    month: "2025-10",
    salaryBase: 35000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500,
    paymentDate: "2025-10-15",
    status: "Paid"
  },
  {
    id: 3,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    month: "2025-10",
    salaryBase: 40000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500,
    paymentDate: "2025-10-15",
    status: "Paid"
  },
  {
    id: 4,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    month: "2025-10",
    salaryBase: 38000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500,
    paymentDate: "2025-10-15",
    status: "Paid"
  },
  {
    id: 5,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    month: "2025-10",
    salaryBase: 50000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500,
    paymentDate: "2025-10-15",
    status: "Paid"
  },
  {
    id: 6,
    empCode: "EMP-0006",
    empName: "ธีรภัทร แข็งแรง",
    month: "2025-10",
    salaryBase: 0,
    employeeContribution: 432,
    employerContribution: 0,
    totalContribution: 432,
    paymentDate: "2025-10-15",
    status: "Paid"
  },
  {
    id: 7,
    empCode: "EMP-0007",
    empName: "ประเสริฐ ดีงาม",
    month: "2025-10",
    salaryBase: 38000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500,
    paymentDate: "2025-10-15",
    status: "Paid"
  },
  {
    id: 8,
    empCode: "EMP-0008",
    empName: "อัญชลี มีชัย",
    month: "2025-10",
    salaryBase: 40000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500,
    paymentDate: "2025-10-15",
    status: "Paid"
  },
  {
    id: 9,
    empCode: "EMP-0009",
    empName: "วิภา รักษ์สุข",
    month: "2025-10",
    salaryBase: 35000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500,
    paymentDate: "2025-10-15",
    status: "Paid"
  },
  {
    id: 10,
    empCode: "EMP-0010",
    empName: "สมเกียรติ ใจดี",
    month: "2025-10",
    salaryBase: 38000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500,
    paymentDate: "2025-10-15",
    status: "Paid"
  },
  {
    id: 11,
    empCode: "EMP-0011",
    empName: "นภัสวรรณ สวยงาม",
    month: "2025-10",
    salaryBase: 35000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500,
    paymentDate: "2025-10-15",
    status: "Paid"
  },
  {
    id: 12,
    empCode: "EMP-0012",
    empName: "กมลชนก ใสสะอาด",
    month: "2025-10",
    salaryBase: 32000,
    employeeContribution: 750,
    employerContribution: 750,
    totalContribution: 1500,
    paymentDate: "2025-10-15",
    status: "Paid"
  }
];

// ========== 18) SAVINGS FUND (กองทุนสัจจะออมทรัพย์) ==========
// สมาชิกกองทุน
export interface FundMember {
  id: number;
  empCode: string;
  empName: string;
  joinDate: string; // วันที่สมัครสมาชิก
  monthlySavings: number; // เงินสัจจะต่อเดือน (บาท)
  totalSavings: number; // เงินสัจจะสะสมรวม
  status: "Active" | "Inactive" | "Withdrawn"; // สถานะสมาชิก
  position: string; // ตำแหน่ง (สำหรับกำหนดอัตราเงินสัจจะ)
}

// ประวัติการหักเงินสัจจะ
export interface SavingsDeduction {
  id: number;
  empCode: string;
  empName: string;
  month: string; // YYYY-MM
  amount: number; // จำนวนเงินที่หัก
  deductionDate: string; // วันที่หัก
  status: "Deducted" | "Pending" | "Failed"; // สถานะการหัก
}

// ประเภทการกู้
export type LoanType = "สามัญ" | "ฉุกเฉิน" | "ที่อยู่อาศัย";

// คำขอกู้
export interface LoanRequest {
  id: number;
  empCode: string;
  empName: string;
  loanType: LoanType;
  requestedAmount: number; // จำนวนเงินที่ขอ
  approvedAmount?: number; // จำนวนเงินที่อนุมัติ
  purpose: string; // วัตถุประสงค์
  requestDate: string; // วันที่ยื่นคำขอ
  approvalDate?: string; // วันที่อนุมัติ
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  approvedBy?: string; // ผู้อนุมัติ
  rejectionReason?: string; // เหตุผลที่ไม่อนุมัติ
  guarantors: string[]; // รหัสพนักงานผู้ค้ำประกัน
  documents: string[]; // รายการเอกสารที่แนบ
  emergencyProof?: string; // เอกสารพิสูจน์กรณีฉุกเฉิน
}

// สัญญากู้
export interface Loan {
  id: number;
  loanRequestId: number; // อ้างอิงคำขอกู้
  empCode: string;
  empName: string;
  loanType: LoanType;
  principalAmount: number; // เงินต้น
  interestRate: number; // อัตราดอกเบี้ยต่อปี (%)
  totalMonths: number; // จำนวนงวด
  monthlyPayment: number; // ค่างวดต่อเดือน
  remainingBalance: number; // ยอดคงเหลือ
  startDate: string; // วันที่เริ่มกู้
  endDate?: string; // วันที่ครบกำหนด
  status: "Active" | "Completed" | "Overdue" | "Defaulted";
  paymentHistory: LoanPayment[]; // ประวัติการชำระ
  overdueCount: number; // จำนวนครั้งที่ผิดนัด
}

// การชำระเงินกู้
export interface LoanPayment {
  id: number;
  loanId: number;
  paymentDate: string; // วันที่ชำระ
  month: string; // YYYY-MM
  principal: number; // เงินต้น
  interest: number; // ดอกเบี้ย
  total: number; // รวม
  status: "Paid" | "Pending" | "Overdue";
  deductionDate?: string; // วันที่หักจากเงินเดือน
}

// การถอนเงินสัจจะ
export interface SavingsWithdrawal {
  id: number;
  empCode: string;
  empName: string;
  withdrawalDate: string;
  amount: number;
  reason: "ลาออก" | "เกษียณ" | "เสียชีวิต" | "ครบ 5 ปี" | "อื่นๆ";
  reasonDetail?: string;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  approvedBy?: string;
  hasOutstandingLoan: boolean; // มีหนี้ค้างชำระหรือไม่
  isGuarantor: boolean; // กำลังค้ำประกันผู้อื่นหรือไม่
}

// Mock Data
export const fundMembers: FundMember[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    joinDate: "2023-06-01",
    monthlySavings: 500, // ตามระดับตำแหน่ง
    totalSavings: 15000, // สะสม 30 เดือน
    status: "Active",
    position: "หัวหน้าปั๊ม"
  },
  {
    id: 2,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    joinDate: "2022-11-15",
    monthlySavings: 300,
    totalSavings: 12000,
    status: "Active",
    position: "แคชเชียร์"
  },
  {
    id: 3,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    joinDate: "2024-01-10",
    monthlySavings: 300,
    totalSavings: 3000,
    status: "Active",
    position: "พนักงานปั๊ม"
  },
  {
    id: 4,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    joinDate: "2024-03-20",
    monthlySavings: 300,
    totalSavings: 2400,
    status: "Active",
    position: "พนักงานร้าน"
  },
  {
    id: 5,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    joinDate: "2021-08-05",
    monthlySavings: 500,
    totalSavings: 25000,
    status: "Active",
    position: "หัวหน้าร้าน"
  }
];

export const savingsDeductions: SavingsDeduction[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    month: "2025-10",
    amount: 500,
    deductionDate: "2025-10-31",
    status: "Deducted"
  },
  {
    id: 2,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    month: "2025-10",
    amount: 300,
    deductionDate: "2025-10-31",
    status: "Deducted"
  },
  {
    id: 3,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    month: "2025-10",
    amount: 300,
    deductionDate: "2025-10-31",
    status: "Deducted"
  }
];

export const loanRequests: LoanRequest[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    loanType: "สามัญ",
    requestedAmount: 300000, // 20 เท่าของเงินสัจจะสะสม (15000 * 20)
    purpose: "ซื้อรถยนต์",
    requestDate: "2025-10-15",
    status: "Pending",
    guarantors: ["EMP-0002", "EMP-0005"],
    documents: ["บัตรประชาชน", "สลิปเงินเดือน 3 เดือน", "สมุดบัญชีธนาคาร", "สัญญาค้ำประกัน"]
  },
  {
    id: 2,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    loanType: "ฉุกเฉิน",
    requestedAmount: 30000,
    purpose: "ค่ารักษาพยาบาล",
    requestDate: "2025-10-20",
    status: "Approved",
    approvedAmount: 30000,
    approvalDate: "2025-10-22",
    approvedBy: "ประธานกองทุน",
    guarantors: ["EMP-0001"],
    documents: ["บัตรประชาชน", "ใบรับรองแพทย์", "สลิปเงินเดือน"],
    emergencyProof: "ใบรับรองแพทย์"
  },
  {
    id: 3,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    loanType: "ที่อยู่อาศัย",
    requestedAmount: 500000,
    purpose: "ซื้อที่อยู่อาศัย",
    requestDate: "2025-09-01",
    status: "Approved",
    approvedAmount: 500000,
    approvalDate: "2025-09-05",
    approvedBy: "ประธานกองทุน",
    guarantors: ["EMP-0001", "EMP-0002", "EMP-0003"],
    documents: ["บัตรประชาชน", "สลิปเงินเดือน 3 เดือน", "เอกสารซื้อบ้าน", "สัญญาค้ำประกัน"]
  }
];

export const loans: Loan[] = [
  {
    id: 1,
    loanRequestId: 2,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    loanType: "ฉุกเฉิน",
    principalAmount: 30000,
    interestRate: 0, // ปลอดดอกเบี้ย
    totalMonths: 6,
    monthlyPayment: 5000,
    remainingBalance: 20000,
    startDate: "2025-10-25",
    endDate: "2026-04-25",
    status: "Active",
    paymentHistory: [
      {
        id: 1,
        loanId: 1,
        paymentDate: "2025-10-31",
        month: "2025-10",
        principal: 5000,
        interest: 0,
        total: 5000,
        status: "Paid",
        deductionDate: "2025-10-31"
      }
    ],
    overdueCount: 0
  },
  {
    id: 2,
    loanRequestId: 3,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    loanType: "ที่อยู่อาศัย",
    principalAmount: 500000,
    interestRate: 1, // 1% ต่อปี
    totalMonths: 180, // 15 ปี
    monthlyPayment: 2860, // คำนวณจาก PMT
    remainingBalance: 497140,
    startDate: "2025-09-10",
    endDate: "2040-09-10",
    status: "Active",
    paymentHistory: [
      {
        id: 2,
        loanId: 2,
        paymentDate: "2025-09-30",
        month: "2025-09",
        principal: 2433,
        interest: 427,
        total: 2860,
        status: "Paid",
        deductionDate: "2025-09-30"
      },
      {
        id: 3,
        loanId: 2,
        paymentDate: "2025-10-31",
        month: "2025-10",
        principal: 2445,
        interest: 415,
        total: 2860,
        status: "Paid",
        deductionDate: "2025-10-31"
      }
    ],
    overdueCount: 0
  }
];

export const savingsWithdrawals: SavingsWithdrawal[] = [
  {
    id: 1,
    empCode: "EMP-0006",
    empName: "ธีรภัทร แข็งแรง",
    withdrawalDate: "2025-10-01",
    amount: 8000,
    reason: "ลาออก",
    status: "Approved",
    approvedBy: "ประธานกองทุน",
    hasOutstandingLoan: false,
    isGuarantor: false
  }
];

// การฝากเงินสัจจะเพิ่มเติม (นอกเหนือจากการหักเงินเดือนอัตโนมัติ)
export interface SavingsDeposit {
  id: number;
  empCode: string;
  empName: string;
  depositDate: string; // วันที่ฝาก
  amount: number; // จำนวนเงินที่ฝาก
  depositMethod: "เงินสด" | "โอนเงิน" | "เช็ค"; // วิธีการฝาก
  receiptNumber?: string; // เลขที่ใบเสร็จ
  notes?: string; // หมายเหตุ
  status: "Completed" | "Pending" | "Cancelled"; // สถานะ
  recordedBy: string; // ผู้บันทึก
}

export const savingsDeposits: SavingsDeposit[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    depositDate: "2025-10-05",
    amount: 5000,
    depositMethod: "โอนเงิน",
    receiptNumber: "DEP-2025-001",
    status: "Completed",
    recordedBy: "เหรัญญิก"
  },
  {
    id: 2,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    depositDate: "2025-10-10",
    amount: 3000,
    depositMethod: "เงินสด",
    receiptNumber: "DEP-2025-002",
    status: "Completed",
    recordedBy: "เหรัญญิก"
  },
  {
    id: 3,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    depositDate: "2025-10-15",
    amount: 10000,
    depositMethod: "เช็ค",
    receiptNumber: "DEP-2025-003",
    status: "Pending",
    recordedBy: "เหรัญญิก",
    notes: "รอเช็คเคลียร์"
  }
];

// ========== 19) FUND COMMITTEE (กรรมการกองทุน) ==========
export interface FundCommittee {
  id: number;
  empCode: string;
  empName: string;
  position: "ประธานกองทุน" | "กรรมการ" | "เหรัญญิก" | "เลขานุการ";
  startDate: string;
  endDate?: string;
  status: "Active" | "Inactive";
  responsibilities: string[]; // หน้าที่หลัก
}

export const fundCommittee: FundCommittee[] = [
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    position: "ประธานกองทุน",
    startDate: "2023-01-01",
    status: "Active",
    responsibilities: ["อนุมัติวงเงินกู้สูง", "เป็นประธานในที่ประชุม", "อนุมัติการถอนเงิน"]
  },
  {
    id: 2,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    position: "เหรัญญิก",
    startDate: "2023-01-01",
    status: "Active",
    responsibilities: ["ดูแลบัญชี", "รับ-จ่ายเงิน", "ตรวจสอบยอดเงิน"]
  },
  {
    id: 3,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    position: "เลขานุการ",
    startDate: "2023-01-01",
    status: "Active",
    responsibilities: ["จัดเก็บเอกสาร", "รายงานสรุป", "ประชุมเดือนละ 1 ครั้ง"]
  },
  {
    id: 4,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    position: "กรรมการ",
    startDate: "2023-01-01",
    status: "Active",
    responsibilities: ["ตรวจสอบคำขอ", "ประชุมเดือนละ 1 ครั้ง"]
  },
  {
    id: 5,
    empCode: "EMP-0004",
    empName: "กิตติคุณ ใฝ่รู้",
    position: "กรรมการ",
    startDate: "2024-03-01",
    status: "Active",
    responsibilities: ["ตรวจสอบคำขอ", "ประชุมเดือนละ 1 ครั้ง"]
  }
];

// ========== 20) LOAN PENALTIES (บทลงโทษผู้ผิดนัด) ==========
export interface LoanPenalty {
  id: number;
  loanId: number;
  empCode: string;
  empName: string;
  penaltyDate: string;
  overdueCount: number; // ครั้งที่ผิดนัด (1, 2, 3+)
  action: "แจ้งเตือน" | "ห้ามกู้ใหม่ 6 เดือน" | "ตัดเงินสัจจะชำระหนี้" | "แจ้งผู้บริหาร";
  actionDate: string;
  actionBy: string;
  amount?: number; // จำนวนเงินที่ตัด (ถ้ามี)
  status: "Active" | "Resolved";
  notes?: string;
}

export const loanPenalties: LoanPenalty[] = [
  {
    id: 1,
    loanId: 1,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    penaltyDate: "2025-09-15",
    overdueCount: 1,
    action: "แจ้งเตือน",
    actionDate: "2025-09-15",
    actionBy: "เหรัญญิก",
    status: "Resolved",
    notes: "แจ้งเตือนเป็นลายลักษณ์อักษร"
  }
];

// ========== 21) MONTHLY REPORTS (รายงานประจำเดือน) ==========
export interface MonthlyReport {
  id: number;
  month: string; // YYYY-MM
  reportDate: string; // วันที่ส่งรายงาน
  totalSavings: number; // ยอดเงินสัจจะรวม
  totalLoansOutstanding: number; // ยอดเงินกู้คงเหลือ
  overdueLoans: number; // จำนวนกู้ที่ผิดนัด
  overdueMembers: string[]; // รายชื่อผู้ค้างชำระ
  newMembers: number; // สมาชิกใหม่
  newLoans: number; // กู้ใหม่
  totalDeductions: number; // หักเงินสัจจะรวม
  totalLoanPayments: number; // ชำระเงินกู้รวม
  status: "Draft" | "Submitted";
  submittedBy?: string;
}

export const monthlyReports: MonthlyReport[] = [
  {
    id: 1,
    month: "2025-10",
    reportDate: "2025-11-05",
    totalSavings: 55000,
    totalLoansOutstanding: 527140,
    overdueLoans: 0,
    overdueMembers: [],
    newMembers: 0,
    newLoans: 1,
    totalDeductions: 1700,
    totalLoanPayments: 7860,
    status: "Submitted",
    submittedBy: "เลขานุการ"
  }
];

// ========== 22) DOCUMENT MANAGEMENT SYSTEM (ระบบงานเอกสาร) ==========
// หมวดหมู่เอกสาร
export interface DocumentCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export const documentCategories: DocumentCategory[] = [
  { id: 1, name: "ใบอนุญาต", description: "ใบอนุญาตต่างๆ เช่น ใบอนุญาตปั๊มน้ำมัน", color: "blue" },
  { id: 2, name: "สัญญา", description: "สัญญาเช่า สัญญาจ้าง สัญญากู้ยืม", color: "green" },
  { id: 3, name: "ทะเบียนรถ", description: "เอกสารทะเบียนรถยนต์", color: "purple" },
  { id: 4, name: "เอกสาร HR", description: "สัญญาจ้าง ใบลา เอกสารพนักงาน", color: "orange" },
  { id: 5, name: "ใบแจ้งหนี้", description: "ใบแจ้งหนี้ ใบกำกับภาษี", color: "red" },
  { id: 6, name: "เอกสารราชการ", description: "เอกสารจากหน่วยงานราชการ", color: "yellow" },
  { id: 7, name: "อื่นๆ", description: "เอกสารอื่นๆ", color: "gray" }
];

// เอกสาร
export interface Document {
  id: number;
  documentNumber: string; // เลขที่เอกสาร
  title: string; // ชื่อเอกสาร
  categoryId: number; // หมวดหมู่
  description?: string; // คำอธิบาย
  fileUrl: string; // URL ไฟล์
  fileName: string; // ชื่อไฟล์
  fileType: "PDF" | "JPG" | "PNG" | "DOC" | "DOCX" | "XLS" | "XLSX" | "OTHER"; // ประเภทไฟล์
  fileSize: number; // ขนาดไฟล์ (bytes)
  version: number; // เวอร์ชัน
  status: "Active" | "Archived" | "Draft" | "Pending"; // สถานะ
  securityLevel: "Public" | "Internal" | "Confidential"; // ระดับความลับ
  expiryDate?: string; // วันหมดอายุ
  renewalCost?: number; // ค่าต่ออายุ
  createdBy: string; // ผู้สร้าง
  createdAt: string; // วันที่สร้าง
  updatedBy?: string; // ผู้แก้ไขล่าสุด
  updatedAt?: string; // วันที่แก้ไขล่าสุด
  approvedBy?: string; // ผู้อนุมัติ
  approvedAt?: string; // วันที่อนุมัติ
  linkedTransactionId?: number; // เชื่อมโยงกับธุรกรรม (M6)
  linkedModule?: "HR" | "Fund" | "Accounting"; // เชื่อมโยงกับโมดูล
  tags?: string[]; // Tags
  metadata?: Record<string, unknown>; // ข้อมูลเพิ่มเติม (เช่น เลขที่บิล, ยอดรวม)
}

export const documents: Document[] = [
  {
    id: 1,
    documentNumber: "DOC-2025-001",
    title: "ใบอนุญาตปั๊มน้ำมันสาขา 1",
    categoryId: 1,
    description: "ใบอนุญาตประกอบกิจการปั๊มน้ำมัน",
    fileUrl: "/documents/license-branch1.pdf",
    fileName: "license-branch1.pdf",
    fileType: "PDF",
    fileSize: 2048576,
    version: 1,
    status: "Active",
    securityLevel: "Confidential",
    expiryDate: "2026-12-31",
    renewalCost: 50000,
    createdBy: "EMP-0001",
    createdAt: "2025-01-15",
    approvedBy: "ผู้บริหาร",
    approvedAt: "2025-01-20",
    tags: ["ใบอนุญาต", "ปั๊มน้ำมัน", "สาขา 1"]
  },
  {
    id: 2,
    documentNumber: "DOC-2025-002",
    title: "สัญญาเช่าร้าน 7-Eleven",
    categoryId: 2,
    description: "สัญญาเช่าพื้นที่ร้าน 7-Eleven ในปั๊มสาขา 1",
    fileUrl: "/documents/contract-7eleven.pdf",
    fileName: "contract-7eleven.pdf",
    fileType: "PDF",
    fileSize: 1536000,
    version: 1,
    status: "Active",
    securityLevel: "Internal",
    expiryDate: "2026-06-30",
    renewalCost: 120000,
    createdBy: "EMP-0002",
    createdAt: "2025-02-01",
    approvedBy: "ผู้จัดการสาขา",
    approvedAt: "2025-02-05",
    linkedModule: "Accounting",
    tags: ["สัญญาเช่า", "7-Eleven"]
  },
  {
    id: 3,
    documentNumber: "DOC-2025-003",
    title: "ทะเบียนรถยนต์บริษัท",
    categoryId: 3,
    description: "ทะเบียนรถยนต์สำหรับใช้ในธุรกิจ",
    fileUrl: "/documents/car-registration.pdf",
    fileName: "car-registration.pdf",
    fileType: "PDF",
    fileSize: 512000,
    version: 1,
    status: "Active",
    securityLevel: "Internal",
    expiryDate: "2026-03-15",
    renewalCost: 500,
    createdBy: "EMP-0003",
    createdAt: "2025-03-10",
    tags: ["ทะเบียนรถ", "ยานพาหนะ"]
  },
  {
    id: 4,
    documentNumber: "DOC-2025-004",
    title: "สัญญาจ้างพนักงาน",
    categoryId: 4,
    description: "สัญญาจ้างงานพนักงานประจำ",
    fileUrl: "/documents/employment-contract.pdf",
    fileName: "employment-contract.pdf",
    fileType: "PDF",
    fileSize: 1024000,
    version: 2,
    status: "Active",
    securityLevel: "Confidential",
    createdBy: "EMP-0001",
    createdAt: "2025-04-01",
    updatedBy: "EMP-0001",
    updatedAt: "2025-04-15",
    linkedModule: "HR",
    tags: ["สัญญาจ้าง", "HR"]
  },
  {
    id: 5,
    documentNumber: "DOC-2025-005",
    title: "ใบแจ้งหนี้ค่าไฟฟ้า",
    categoryId: 5,
    description: "ใบแจ้งหนี้ค่าไฟฟ้าเดือนตุลาคม",
    fileUrl: "/documents/invoice-electricity-oct.pdf",
    fileName: "invoice-electricity-oct.pdf",
    fileType: "PDF",
    fileSize: 256000,
    version: 1,
    status: "Active",
    securityLevel: "Internal",
    createdBy: "EMP-0002",
    createdAt: "2025-10-15",
    linkedModule: "Accounting",
    metadata: {
      billNumber: "INV-2025-001",
      totalAmount: 15000,
      dueDate: "2025-11-15"
    },
    tags: ["ใบแจ้งหนี้", "ค่าไฟฟ้า"]
  },
  {
    id: 6,
    documentNumber: "DOC-2025-006",
    title: "ใบอนุญาตปั๊มน้ำมันสาขา 2",
    categoryId: 1,
    description: "ใบอนุญาตประกอบกิจการปั๊มน้ำมันสาขา 2",
    fileUrl: "/documents/license-branch2.pdf",
    fileName: "license-branch2.pdf",
    fileType: "PDF",
    fileSize: 2048576,
    version: 1,
    status: "Active",
    securityLevel: "Confidential",
    expiryDate: "2025-12-15", // ใกล้หมดอายุ (30+ วัน)
    renewalCost: 50000,
    createdBy: "EMP-0001",
    createdAt: "2025-01-20",
    approvedBy: "ผู้บริหาร",
    approvedAt: "2025-01-25",
    tags: ["ใบอนุญาต", "ปั๊มน้ำมัน", "สาขา 2"]
  },
  {
    id: 7,
    documentNumber: "DOC-2025-007",
    title: "สัญญาเช่าร้าน Daiso",
    categoryId: 2,
    description: "สัญญาเช่าพื้นที่ร้าน Daiso ในปั๊มสาขา 1",
    fileUrl: "/documents/contract-daiso.pdf",
    fileName: "contract-daiso.pdf",
    fileType: "PDF",
    fileSize: 1536000,
    version: 1,
    status: "Active",
    securityLevel: "Internal",
    expiryDate: "2025-12-05", // ใกล้หมดอายุ (20+ วัน)
    renewalCost: 80000,
    createdBy: "EMP-0002",
    createdAt: "2025-02-10",
    approvedBy: "ผู้จัดการสาขา",
    approvedAt: "2025-02-15",
    linkedModule: "Accounting",
    tags: ["สัญญาเช่า", "Daiso"]
  },
  {
    id: 8,
    documentNumber: "DOC-2025-008",
    title: "ใบอนุญาตขายสุรา",
    categoryId: 1,
    description: "ใบอนุญาตขายสุราในร้านสะดวกซื้อ",
    fileUrl: "/documents/alcohol-license.pdf",
    fileName: "alcohol-license.pdf",
    fileType: "PDF",
    fileSize: 1024000,
    version: 1,
    status: "Active",
    securityLevel: "Confidential",
    expiryDate: "2025-11-25", // ใกล้หมดอายุ (10+ วัน)
    renewalCost: 30000,
    createdBy: "EMP-0001",
    createdAt: "2025-03-01",
    approvedBy: "ผู้บริหาร",
    approvedAt: "2025-03-05",
    tags: ["ใบอนุญาต", "สุรา"]
  },
  {
    id: 9,
    documentNumber: "DOC-2025-009",
    title: "สัญญาเช่าพื้นที่ร้านกาแฟ",
    categoryId: 2,
    description: "สัญญาเช่าพื้นที่ร้านกาแฟในปั๊มสาขา 2",
    fileUrl: "/documents/contract-coffee.pdf",
    fileName: "contract-coffee.pdf",
    fileType: "PDF",
    fileSize: 1536000,
    version: 1,
    status: "Active",
    securityLevel: "Internal",
    expiryDate: "2025-11-20", // ใกล้หมดอายุ (5+ วัน)
    renewalCost: 100000,
    createdBy: "EMP-0002",
    createdAt: "2025-04-01",
    approvedBy: "ผู้จัดการสาขา",
    approvedAt: "2025-04-05",
    linkedModule: "Accounting",
    tags: ["สัญญาเช่า", "ร้านกาแฟ"]
  },
  {
    id: 10,
    documentNumber: "DOC-2025-010",
    title: "ใบอนุญาตขายบุหรี่",
    categoryId: 1,
    description: "ใบอนุญาตขายบุหรี่ในร้านสะดวกซื้อ",
    fileUrl: "/documents/tobacco-license.pdf",
    fileName: "tobacco-license.pdf",
    fileType: "PDF",
    fileSize: 1024000,
    version: 1,
    status: "Active",
    securityLevel: "Confidential",
    expiryDate: "2025-11-18", // ใกล้หมดอายุ (3+ วัน)
    renewalCost: 25000,
    createdBy: "EMP-0001",
    createdAt: "2025-05-01",
    approvedBy: "ผู้บริหาร",
    approvedAt: "2025-05-05",
    tags: ["ใบอนุญาต", "บุหรี่"]
  },
  {
    id: 11,
    documentNumber: "DOC-2025-011",
    title: "ทะเบียนรถบรรทุก",
    categoryId: 3,
    description: "ทะเบียนรถบรรทุกสำหรับขนส่งสินค้า",
    fileUrl: "/documents/truck-registration.pdf",
    fileName: "truck-registration.pdf",
    fileType: "PDF",
    fileSize: 512000,
    version: 1,
    status: "Active",
    securityLevel: "Internal",
    expiryDate: "2025-11-15", // ใกล้หมดอายุ (วันนี้หรือใกล้)
    renewalCost: 500,
    createdBy: "EMP-0003",
    createdAt: "2025-06-01",
    tags: ["ทะเบียนรถ", "รถบรรทุก"]
  }
];

// ประวัติการเปลี่ยนแปลง (Audit Trail)
export interface DocumentAuditLog {
  id: number;
  documentId: number;
  action: "Created" | "Updated" | "Deleted" | "Viewed" | "Downloaded" | "Approved" | "Rejected";
  userId: string;
  userName: string;
  timestamp: string;
  details?: string; // รายละเอียดเพิ่มเติม
  ipAddress?: string;
  userAgent?: string;
}

export const documentAuditLogs: DocumentAuditLog[] = [
  {
    id: 1,
    documentId: 1,
    action: "Created",
    userId: "EMP-0001",
    userName: "สมชาย ใจดี",
    timestamp: "2025-01-15T10:30:00",
    details: "อัปโหลดเอกสารใหม่"
  },
  {
    id: 2,
    documentId: 1,
    action: "Approved",
    userId: "ADMIN-001",
    userName: "ผู้บริหาร",
    timestamp: "2025-01-20T14:00:00",
    details: "อนุมัติเอกสาร"
  },
  {
    id: 3,
    documentId: 1,
    action: "Viewed",
    userId: "EMP-0002",
    userName: "สมหญิง รักงาน",
    timestamp: "2025-10-01T09:15:00",
    details: "เปิดดูเอกสาร"
  },
  {
    id: 4,
    documentId: 4,
    action: "Updated",
    userId: "EMP-0001",
    userName: "สมชาย ใจดี",
    timestamp: "2025-04-15T11:20:00",
    details: "อัปเดตเวอร์ชัน 2"
  }
];

// เวอร์ชันเอกสาร
export interface DocumentVersion {
  id: number;
  documentId: number;
  version: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdBy: string;
  createdAt: string;
  changeNote?: string; // หมายเหตุการเปลี่ยนแปลง
}

export const documentVersions: DocumentVersion[] = [
  {
    id: 1,
    documentId: 4,
    version: 1,
    fileUrl: "/documents/employment-contract-v1.pdf",
    fileName: "employment-contract-v1.pdf",
    fileSize: 1024000,
    createdBy: "EMP-0001",
    createdAt: "2025-04-01"
  },
  {
    id: 2,
    documentId: 4,
    version: 2,
    fileUrl: "/documents/employment-contract-v2.pdf",
    fileName: "employment-contract-v2.pdf",
    fileSize: 1024000,
    createdBy: "EMP-0001",
    createdAt: "2025-04-15",
    changeNote: "อัปเดตเงื่อนไขสัญญา"
  }
];

// การอนุมัติเอกสาร (Workflow)
export interface DocumentApproval {
  id: number;
  documentId: number;
  step: number; // ขั้นตอนที่
  approverId: string; // ผู้อนุมัติ
  approverName: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  comment?: string; // ความคิดเห็น
  signedAt?: string; // วันที่ลงลายเซ็น
  eSignature?: string; // ลายเซ็นอิเล็กทรอนิกส์
  createdAt: string;
}

export const documentApprovals: DocumentApproval[] = [
  {
    id: 1,
    documentId: 2,
    step: 1,
    approverId: "EMP-0001",
    approverName: "ผู้จัดการสาขา",
    status: "Approved",
    comment: "อนุมัติ",
    signedAt: "2025-02-05T10:00:00",
    createdAt: "2025-02-01T09:00:00"
  },
  {
    id: 2,
    documentId: 2,
    step: 2,
    approverId: "ADMIN-001",
    approverName: "ผู้บริหาร",
    status: "Pending",
    createdAt: "2025-02-05T10:05:00"
  }
];

// การแจ้งเตือนเอกสาร
export interface DocumentNotification {
  id: number;
  documentId: number;
  type: "Expiring" | "Expired" | "Approval" | "Update";
  message: string;
  daysUntilExpiry?: number; // จำนวนวันก่อนหมดอายุ
  sentAt: string;
  sentTo: string; // ผู้รับการแจ้งเตือน
  status: "Sent" | "Read" | "Dismissed";
}

export const documentNotifications: DocumentNotification[] = [
  {
    id: 1,
    documentId: 6,
    type: "Expiring",
    message: "ใบอนุญาตปั๊มน้ำมันสาขา 2 จะหมดอายุใน 30 วัน",
    daysUntilExpiry: 30,
    sentAt: "2025-11-15T08:00:00",
    sentTo: "EMP-0001",
    status: "Sent"
  },
  {
    id: 2,
    documentId: 2,
    type: "Expiring",
    message: "สัญญาเช่าร้าน 7-Eleven จะหมดอายุใน 15 วัน",
    daysUntilExpiry: 15,
    sentAt: "2025-11-20T08:00:00",
    sentTo: "EMP-0002",
    status: "Read"
  }
];

// ========== WELFARE RECORDS (สวัสดิการพนักงาน) ==========
export interface WelfareRecord {
  id: number;
  type: string;
  empCode: string;
  empName: string;
  category: string;
  item?: string;
  amount?: number;
  date: string;
  status: "รออนุมัติ" | "อนุมัติ" | "ปฏิเสธ";
  notes?: string;
}

export const welfareRecords: WelfareRecord[] = [
  // การเบิก (benefits)
  { id: 1, type: "benefits", empCode: "EMP-0001", empName: "สมชาย ใจดี", category: "ปั๊ม", item: "ชุดฟอร์ม", date: "2025-01-15", status: "อนุมัติ", notes: "เบิกชุดฟอร์มสำหรับพนักงานปั๊ม" },
  { id: 2, type: "benefits", empCode: "EMP-0002", empName: "สมหญิง รักงาน", category: "ปั๊ม", item: "เสื้อกันหนาว", date: "2025-01-20", status: "อนุมัติ" },
  { id: 3, type: "benefits", empCode: "EMP-0003", empName: "วรพล ตั้งใจ", category: "ปั๊ม", item: "รองเท้า", date: "2025-01-25", status: "อนุมัติ" },
  { id: 4, type: "benefits", empCode: "EMP-0004", empName: "กิตติคุณ ใฝ่รู้", category: "เซเว่น", item: "ชุดฟอร์ม", date: "2025-02-01", status: "อนุมัติ" },
  { id: 5, type: "benefits", empCode: "EMP-0005", empName: "พิมพ์ชนก สมใจ", category: "ปึงหงี่เชียง", item: "เสื้อกันหนาว", date: "2025-02-05", status: "อนุมัติ" },
  { id: 6, type: "benefits", empCode: "EMP-0009", empName: "วิภา รักษ์สุข", category: "แม่บ้าน", item: "รองเท้า", date: "2025-02-10", status: "อนุมัติ" },

  // BONUS รายปี (bonus)
  { id: 7, type: "bonus", empCode: "EMP-0001", empName: "สมชาย ใจดี", category: "ปั๊ม", amount: 50000, date: "2025-01-31", status: "อนุมัติ", notes: "รางวัลพนักงานดีเด่นประจำปี 2024" },
  { id: 8, type: "bonus", empCode: "EMP-0005", empName: "พิมพ์ชนก สมใจ", category: "ปึงหงี่เชียง", amount: 45000, date: "2025-01-31", status: "อนุมัติ", notes: "รางวัลพนักงานดีเด่นประจำปี 2024" },
  { id: 9, type: "bonus", empCode: "EMP-0009", empName: "วิภา รักษ์สุข", category: "แม่บ้าน", amount: 40000, date: "2025-01-31", status: "อนุมัติ", notes: "รางวัลพนักงานดีเด่นประจำปี 2024" },
  { id: 10, type: "bonus", empCode: "EMP-0026", empName: "นิดา ออฟฟิศ", category: "Office", amount: 48000, date: "2025-01-31", status: "อนุมัติ", notes: "รางวัลพนักงานดีเด่นประจำปี 2024" },
  { id: 11, type: "bonus", empCode: "EMP-0023", empName: "ประเสริฐ ช่าง", category: "ช่าง", amount: 42000, date: "2025-01-31", status: "อนุมัติ", notes: "รางวัลพนักงานดีเด่นประจำปี 2024" },

  // หอพัก (dormitory)
  { id: 12, type: "dormitory", empCode: "EMP-0013", empName: "ประยุทธ์ กลางคืน", category: "ปั๊ม", date: "2025-01-01", status: "อนุมัติ", notes: "พักฟรี หอพัก A ห้อง 201" },
  { id: 13, type: "dormitory", empCode: "EMP-0014", empName: "สุรชัย ดึก", category: "ปั๊ม", date: "2025-01-01", status: "อนุมัติ", notes: "พักฟรี หอพัก A ห้อง 202" },
  { id: 14, type: "dormitory", empCode: "EMP-0016", empName: "วิชัย ดึก", category: "เซเว่น", date: "2025-01-01", status: "อนุมัติ", notes: "พักฟรี หอพัก B ห้อง 301" },
  { id: 15, type: "dormitory", empCode: "EMP-0020", empName: "อภิชัย อเมซอน", category: "Amazon", date: "2025-01-15", status: "อนุมัติ", notes: "ขอใช้หอพัก" },
  { id: 16, type: "dormitory", empCode: "EMP-0023", empName: "ประเสริฐ ช่าง", category: "ช่าง", date: "2025-01-01", status: "อนุมัติ", notes: "พักฟรี หอพัก C ห้อง 401" },

  // ค่าน้ำมัน (fuel)
  { id: 17, type: "fuel", empCode: "EMP-0032", empName: "สมศักดิ์ ขับรถ", category: "ขับรถ", item: "ค่าน้ำมัน", amount: 1500, date: "2025-01-10", status: "อนุมัติ", notes: "เบิกค่าน้ำมันสำหรับงานขับรถ" },
  { id: 18, type: "fuel", empCode: "EMP-0032", empName: "สมศักดิ์ ขับรถ", category: "ขับรถ", item: "ค่าน้ำมัน", amount: 1800, date: "2025-01-20", status: "อนุมัติ", notes: "เบิกค่าน้ำมันสำหรับงานขับรถ" },
  { id: 19, type: "fuel", empCode: "EMP-0023", empName: "ประเสริฐ ช่าง", category: "ช่าง", item: "ค่าน้ำมัน", amount: 1200, date: "2025-02-01", status: "อนุมัติ", notes: "เบิกค่าน้ำมันสำหรับงานซ่อมนอกสถานที่" },
  { id: 20, type: "fuel", empCode: "EMP-0024", empName: "สมชาย ช่าง", category: "ช่าง", item: "ค่าน้ำมัน", amount: 1000, date: "2025-02-05", status: "อนุมัติ" },

  // ทัศนศึกษาพาสุข (trip)
  { id: 21, type: "trip", empCode: "EMP-0001", empName: "สมชาย ใจดี", category: "ปั๊ม", date: "2025-03-15", status: "อนุมัติ", notes: "ทัศนศึกษาในประเทศ - เชียงใหม่" },
  { id: 22, type: "trip", empCode: "EMP-0005", empName: "พิมพ์ชนก สมใจ", category: "ปึงหงี่เชียง", date: "2025-03-15", status: "อนุมัติ", notes: "ทัศนศึกษาในประเทศ - เชียงใหม่" },
  { id: 23, type: "trip", empCode: "EMP-0009", empName: "วิภา รักษ์สุข", category: "แม่บ้าน", date: "2025-03-15", status: "อนุมัติ", notes: "ทัศนศึกษาในประเทศ - เชียงใหม่" },
  { id: 24, type: "trip", empCode: "EMP-0026", empName: "นิดา ออฟฟิศ", category: "Office", date: "2025-06-01", status: "อนุมัติ", notes: "ทัศนศึกษาต่างประเทศ - ญี่ปุ่น" },
  { id: 25, type: "trip", empCode: "EMP-0027", empName: "ทา ออฟฟิศ", category: "Office", date: "2025-06-01", status: "อนุมัติ", notes: "ทัศนศึกษาต่างประเทศ - ญี่ปุ่น" },

  // เยี่ยมไข้/คลอด/งานศพ (condolence)
  { id: 26, type: "condolence", empCode: "EMP-0002", empName: "สมหญิง รักงาน", category: "ปั๊ม", amount: 2000, date: "2025-01-12", status: "อนุมัติ", notes: "เยี่ยมไข้ - ครอบครัว" },
  { id: 27, type: "condolence", empCode: "EMP-0003", empName: "วรพล ตั้งใจ", category: "ปั๊ม", amount: 3000, date: "2025-01-18", status: "อนุมัติ", notes: "งานศพ - บิดา" },
  { id: 28, type: "condolence", empCode: "EMP-0004", empName: "กิตติคุณ ใฝ่รู้", category: "เซเว่น", amount: 2000, date: "2025-02-08", status: "อนุมัติ", notes: "คลอดบุตร" },
  { id: 29, type: "condolence", empCode: "EMP-0015", empName: "นันทนา เซเว่น", category: "เซเว่น", amount: 2500, date: "2025-02-15", status: "อนุมัติ", notes: "เยี่ยมไข้ - ครอบครัว" },
  { id: 30, type: "condolence", empCode: "EMP-0029", empName: "ประยุทธ์ รปภ", category: "รักษาความปลอดภัย", amount: 2000, date: "2025-02-20", status: "อนุมัติ", notes: "งานศพ - มารดา" },

  // ทุนการศึกษาบุตร (scholarship)
  { id: 31, type: "scholarship", empCode: "EMP-0001", empName: "สมชาย ใจดี", category: "ปั๊ม", amount: 15000, date: "2025-01-05", status: "อนุมัติ", notes: "ทุนการศึกษาบุตร - ระดับประถมศึกษา" },
  { id: 32, type: "scholarship", empCode: "EMP-0005", empName: "พิมพ์ชนก สมใจ", category: "ปึงหงี่เชียง", amount: 20000, date: "2025-01-05", status: "อนุมัติ", notes: "ทุนการศึกษาบุตร - ระดับมัธยมศึกษา" },
  { id: 33, type: "scholarship", empCode: "EMP-0009", empName: "วิภา รักษ์สุข", category: "แม่บ้าน", amount: 25000, date: "2025-01-05", status: "อนุมัติ", notes: "ทุนการศึกษาบุตร - ระดับอุดมศึกษา" },
  { id: 34, type: "scholarship", empCode: "EMP-0026", empName: "นิดา ออฟฟิศ", category: "Office", amount: 18000, date: "2025-01-05", status: "อนุมัติ", notes: "ทุนการศึกษาบุตร - ระดับมัธยมศึกษา" },
  { id: 35, type: "scholarship", empCode: "EMP-0023", empName: "ประเสริฐ ช่าง", category: "ช่าง", amount: 22000, date: "2025-07-01", status: "อนุมัติ", notes: "ทุนการศึกษาบุตร - ระดับอุดมศึกษา" },

  // ประกันชีวิตหัวหน้างาน (insurance)
  { id: 36, type: "insurance", empCode: "EMP-0001", empName: "สมชาย ใจดี", category: "ปั๊ม", amount: 100000, date: "2025-01-01", status: "อนุมัติ", notes: "ประกันชีวิตระดับหัวหน้างาน - ทุนประกันภัย 100,000 บาท" },
  { id: 37, type: "insurance", empCode: "EMP-0005", empName: "พิมพ์ชนก สมใจ", category: "ปึงหงี่เชียง", amount: 100000, date: "2025-01-01", status: "อนุมัติ", notes: "ประกันชีวิตระดับหัวหน้างาน - ทุนประกันภัย 100,000 บาท" },
  { id: 38, type: "insurance", empCode: "EMP-0026", empName: "นิดา ออฟฟิศ", category: "บัญชี", amount: 100000, date: "2025-01-01", status: "อนุมัติ", notes: "ประกันชีวิตระดับหัวหน้างาน - ทุนประกันภัย 100,000 บาท" },
  { id: 39, type: "insurance", empCode: "EMP-0023", empName: "ประเสริฐ ช่าง", category: "ช่าง", amount: 100000, date: "2025-01-01", status: "อนุมัติ", notes: "ประกันชีวิตระดับหัวหน้างาน - ทุนประกันภัย 100,000 บาท" }
];

// ========== WARNINGS (ทันบน - การเตือนจากนายจ้าง) ==========
// ประเภทการเตือน: 4 ระดับตามลำดับความรุนแรง
// 1. แบบไม่เป็นลายลักษณ์อักษร (เตือนด้วยการพูดคุย) - 3 ครั้ง
// 2. แบบเป็นลายลักษณ์อักษร (เตือนด้วยเอกสาร) - 3 ครั้ง  
// 3. พักงาน (กรณีร้ายแรง)
// 4. ไล่ออกจากงาน (กรณีร้ายแรงที่สุด)

export interface WarningRecord {
  id: number;
  empCode: string;
  empName: string;
  empCategory: string; // หมวดหมู่พนักงาน
  warningType: "พูดคุย" | "เอกสาร" | "พักงาน" | "ไล่ออก";
  warningLevel: number; // ระดับที่เท่าไหร่ (1-4)
  reason: string; // เหตุการณ์/เหตุผลการเตือน เช่น "การร้องเรียนจากลูกค้า", "ทำงานไม่ถูกต้อง"
  eventType?: string; // ประเภทเหตุการณ์ เช่น "การร้องเรียนเฉพาะบุคคล", "การร้องเรียนทั่วไป", "มาสาย", "ขาดงาน"
  description: string; // รายละเอียดการเตือน
  date: string; // วันที่ออกการเตือน
  issuedBy: string; // ชื่อผู้ออกการเตือน (หัวหน้า)
  status: "ระหว่างดำเนินการ" | "เสร็จสิ้น" | "ยกเลิก";
  notes?: string;
  clearedDate?: string; // วันที่ล้างทัณฑ์บน (1 ปี เริ่มนับใหม่)
  isCleared?: boolean; // สถานะการล้างทัณฑ์บน
}

export const warningRecords: WarningRecord[] = [
  // EMP-0001 - สมชาย ใจดี
  {
    id: 1,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    empCategory: "ปั๊ม",
    warningType: "พูดคุย",
    warningLevel: 1,
    reason: "การร้องเรียนจากลูกค้า",
    description: "ลูกค้ารายงานว่าพนักงานมีการบริการไม่ดี - พูดจาหลวน ไม่แย้มยิ้ม",
    date: "2024-08-15",
    issuedBy: "หัวหน้าปั๊ม",
    status: "เสร็จสิ้น",
    notes: "ได้รับการเตือนและปรับปรุงตัวเองแล้ว"
  },
  {
    id: 2,
    empCode: "EMP-0001",
    empName: "สมชาย ใจดี",
    empCategory: "ปั๊ม",
    warningType: "พูดคุย",
    warningLevel: 2,
    reason: "มาสาย",
    description: "เข้างานสาย 20 นาที โดยไม่แจ้งให้ทราบก่อนหน้า",
    date: "2024-09-20",
    issuedBy: "หัวหน้าปั๊ม",
    status: "เสร็จสิ้น"
  },

  // EMP-0002 - สมหญิง รักงาน
  {
    id: 3,
    empCode: "EMP-0002",
    empName: "สมหญิง รักงาน",
    empCategory: "ปั๊ม",
    warningType: "พูดคุย",
    warningLevel: 1,
    reason: "ขาดงาน",
    description: "ขาดงานโดยไม่แจ้งให้ทราบ - ปรากฏการณ์ครั้งแรก",
    date: "2024-07-10",
    issuedBy: "หัวหน้าปั๊ม",
    status: "เสร็จสิ้น",
    notes: "เหตุผลเป็นการเจ็บป่วย มีการลา แต่ขาดการแจ้งก่อนหน้า"
  },

  // EMP-0003 - วรพล ตั้งใจ
  {
    id: 4,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    empCategory: "ปั๊ม",
    warningType: "เอกสาร",
    warningLevel: 2,
    reason: "ทำงานไม่ตรงตามมาตรฐาน",
    description: "ไม่ปฏิบัติตามกระบวนการการบริการตามขั้นตอนที่กำหนด - สาเหตุจากการประมาท",
    date: "2024-10-01",
    issuedBy: "หัวหน้าปั๊ม",
    status: "เสร็จสิ้น",
    notes: "ปรับปรุงวิธีการทำงาน"
  },
  {
    id: 5,
    empCode: "EMP-0003",
    empName: "วรพล ตั้งใจ",
    empCategory: "ปั๊ม",
    warningType: "พูดคุย",
    warningLevel: 1,
    reason: "พูดจาไม่สุภาพ",
    description: "พูดจากับลูกค้าด้วยน้ำเสียง ไม่สุภาพ เกิดความไม่พอใจต่อลูกค้า",
    date: "2024-11-05",
    issuedBy: "หัวหน้าปั๊ม",
    status: "เสร็จสิ้น"
  },

  // EMP-0005 - พิมพ์ชนก สมใจ
  {
    id: 6,
    empCode: "EMP-0005",
    empName: "พิมพ์ชนก สมใจ",
    empCategory: "ปึงหงี่เชียง",
    warningType: "พูดคุย",
    warningLevel: 1,
    reason: "การร้องเรียนจากลูกค้า",
    description: "ลูกค้ารายงานคำบ่นเรื่องเสื้อผ้าไม่สะอาด ดูหยาบชา",
    date: "2024-06-12",
    issuedBy: "หัวหน้าร้านปึงหงี่เชียง",
    status: "เสร็จสิ้น",
    notes: "ปรับปรุงเครื่องแต่งกายและสุขภาพอนามัยส่วนบุคคล"
  },

  // EMP-0008 - อัญชลี มีชัย
  {
    id: 7,
    empCode: "EMP-0008",
    empName: "อัญชลี มีชัย",
    empCategory: "ร้านเชสเตอร์",
    warningType: "เอกสาร",
    warningLevel: 1,
    reason: "ขาดงาน",
    description: "ขาดงาน 2 วันติดต่อกันโดยแจ้งล่วงหน้าผ่านแอปเท่านั้น - ไม่ติดต่อโทรศัพท์",
    date: "2024-09-10",
    issuedBy: "หัวหน้าร้านเชสเตอร์",
    status: "เสร็จสิ้น",
    notes: "ตีความเข้าใจเกี่ยวกับวิธีการขอลา"
  },
  {
    id: 8,
    empCode: "EMP-0008",
    empName: "อัญชลี มีชัย",
    empCategory: "ร้านเชสเตอร์",
    warningType: "เอกสาร",
    warningLevel: 2,
    reason: "มาสาย",
    description: "มาสายในการเข้างาน 5 วันในรอบเดือน - โดยไม่มีเหตุผลที่สมควร",
    date: "2024-10-15",
    issuedBy: "หัวหน้าร้านเชสเตอร์",
    status: "เสร็จสิ้น"
  },
  {
    id: 9,
    empCode: "EMP-0008",
    empName: "อัญชลี มีชัย",
    empCategory: "ร้านเชสเตอร์",
    warningType: "เอกสาร",
    warningLevel: 3,
    reason: "ไม่ปฏิบัติตามสั่งการของหัวหน้า",
    description: "ปฏิเสธการทำงานที่หัวหน้าสั่งโดยไม่มีเหตุผลที่เหมาะสม",
    date: "2024-11-10",
    issuedBy: "หัวหน้าร้านเชสเตอร์",
    status: "ระหว่างดำเนินการ",
    notes: "สัญญาณเตือนสำคัญ - ต้องติดตามอย่างใกล้ชิด"
  },

  // EMP-0009 - วิภา รักษ์สุข
  {
    id: 10,
    empCode: "EMP-0009",
    empName: "วิภา รักษ์สุข",
    empCategory: "แม่บ้าน",
    warningType: "พูดคุย",
    warningLevel: 1,
    reason: "ทำงานไม่ประณีต",
    description: "สถานที่ทำงานไม่สะอาด - พื้นมีเศษอาหาร เก้าอี้ไม่เรียบร้อย",
    date: "2024-08-20",
    issuedBy: "หัวหน้าแม่บ้าน",
    status: "เสร็จสิ้น",
    notes: "ปรับปรุงมาตรฐานการทำความสะอาด"
  },

  // EMP-0013 - ประยุทธ์ กลางคืน
  {
    id: 11,
    empCode: "EMP-0013",
    empName: "ประยุทธ์ กลางคืน",
    empCategory: "ปั๊ม",
    warningType: "พูดคุย",
    warningLevel: 1,
    reason: "มาสาย",
    description: "เข้างานสาย 15 นาที ในวันจันทร์ - วันแรกของการเข้างาน",
    date: "2024-11-03",
    issuedBy: "หัวหน้าปั๊ม",
    status: "เสร็จสิ้น"
  },

  // EMP-0020 - อภิชัย อเมซอน
  {
    id: 12,
    empCode: "EMP-0020",
    empName: "อภิชัย อเมซอน",
    empCategory: "Amazon",
    warningType: "เอกสาร",
    warningLevel: 1,
    reason: "การร้องเรียนจากลูกค้า",
    description: "ลูกค้าร่องเรียนเรื่องการบริการไม่สิ้นสุด - ไม่ตอบสายโทรศัพท์",
    date: "2024-09-25",
    issuedBy: "หัวหน้า Amazon",
    status: "เสร็จสิ้น",
    notes: "ปรับปรุงการติดต่อสื่อสาร"
  },

  // EMP-0023 - ประเสริฐ ช่าง
  {
    id: 13,
    empCode: "EMP-0023",
    empName: "ประเสริฐ ช่าง",
    empCategory: "ช่าง",
    warningType: "พูดคุย",
    warningLevel: 1,
    reason: "การสูญเสียเครื่องมือ",
    description: "สูญหายเครื่องมือซ่อมของบริษัท มูลค่า 2,500 บาท",
    date: "2024-08-10",
    issuedBy: "หัวหน้าช่าง",
    status: "เสร็จสิ้น",
    notes: "หัก เงินเดือน 2,500 บาท เพื่อชดเชย"
  },
  {
    id: 14,
    empCode: "EMP-0023",
    empName: "ประเสริฐ ช่าง",
    empCategory: "ช่าง",
    warningType: "พูดคุย",
    warningLevel: 2,
    reason: "การเนิน",
    description: "เนิน (ไม่ส่งงาน) ต่อเนื่อง 3 วัน ทำให้ลูกค้ารอบริการล่าช้า",
    date: "2024-10-05",
    issuedBy: "หัวหน้าช่าง",
    status: "เสร็จสิ้น"
  },

  // EMP-0026 - นิดา ออฟฟิศ
  {
    id: 15,
    empCode: "EMP-0026",
    empName: "นิดา ออฟฟิศ",
    empCategory: "Office",
    warningType: "พูดคุย",
    warningLevel: 1,
    reason: "ขาดงาน",
    description: "ขาดงาน 1 วัน โดยแจ้งล่วงหน้าน้อยกว่า 2 ชั่วโมง",
    date: "2024-07-18",
    issuedBy: "หัวหน้าOffice",
    status: "เสร็จสิ้น"
  },

  // EMP-0032 - สมศักดิ์ ขับรถ
  {
    id: 16,
    empCode: "EMP-0032",
    empName: "สมศักดิ์ ขับรถ",
    empCategory: "ขับรถ",
    warningType: "เอกสาร",
    warningLevel: 1,
    reason: "ฝ่าฝืนกฎจราจร",
    description: "ถูกจับเพราะขับรถเกินความเร็ว - ได้รับบัตรเดินทาง",
    date: "2024-09-30",
    issuedBy: "หัวหน้าขับรถ",
    status: "เสร็จสิ้น",
    notes: "ฝ่ายบริษัทชดเชยค่าปรับแล้ว"
  }
];

