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
  {
    id: 1,
    code: "EMP-0001",
    name: "สมชาย ใจดี",
    dept: "ปั๊มน้ำมัน",
    position: "หัวหน้าปั๊ม",
    status: "Active",
    startDate: "2023-06-01",
    email: "somchai@ptt.co.th",
    phone: "081-234-5678",
    avatar: "https://ui-avatars.com/api/?name=สมชาย+ใจดี&background=2867e0&color=fff",
    shiftId: 1, // กะเช้า
    otRate: 250, // 250 บาท/ชั่วโมง
    category: "ปั๊ม"
  },
  {
    id: 2,
    code: "EMP-0002",
    name: "สมหญิง รักงาน",
    dept: "ปั๊มน้ำมัน",
    position: "แคชเชียร์",
    status: "Active",
    startDate: "2022-11-15",
    email: "somying@ptt.co.th",
    phone: "082-345-6789",
    avatar: "https://ui-avatars.com/api/?name=สมหญิง+รักงาน&background=19b7ff&color=fff",
    shiftId: 1, // กะเช้า
    otRate: 200, // 200 บาท/ชั่วโมง
    category: "ปั๊ม"
  },
  {
    id: 3,
    code: "EMP-0003",
    name: "วรพล ตั้งใจ",
    dept: "ปั๊มน้ำมัน",
    position: "พนักงานปั๊ม",
    status: "Active",
    startDate: "2024-01-10",
    email: "worapol@ptt.co.th",
    phone: "083-456-7890",
    avatar: "https://ui-avatars.com/api/?name=วรพล+ตั้งใจ&background=e41f2b&color=fff",
    shiftId: 1, // กะเช้า
    otRate: 220, // 220 บาท/ชั่วโมง
    category: "ปั๊ม"
  },
  {
    id: 4,
    code: "EMP-0004",
    name: "กิตติคุณ ใฝ่รู้",
    dept: "เซเว่น",
    position: "พนักงานร้าน",
    status: "Active",
    startDate: "2024-03-20",
    email: "kittikun@ptt.co.th",
    phone: "084-567-8901",
    avatar: "https://ui-avatars.com/api/?name=กิตติคุณ+ใฝ่รู้&background=2867e0&color=fff",
    shiftId: 1, // กะเช้า
    otRate: 180, // 180 บาท/ชั่วโมง
    category: "เซเว่น"
  },
  {
    id: 5,
    code: "EMP-0005",
    name: "พิมพ์ชนก สมใจ",
    dept: "ปึงหงี่เชียง",
    position: "หัวหน้าร้าน",
    status: "Active",
    startDate: "2021-08-05",
    email: "pimchanok@ptt.co.th",
    phone: "085-678-9012",
    avatar: "https://ui-avatars.com/api/?name=พิมพ์ชนก+สมใจ&background=19b7ff&color=fff",
    shiftId: 1, // กะเช้า
    otRate: 300, // 300 บาท/ชั่วโมง
    category: "ปึงหงี่เชียง"
  },
  {
    id: 6,
    code: "EMP-0006",
    name: "ธีรภัทร แข็งแรง",
    dept: "เจ้าสัว",
    position: "พนักงานร้าน",
    status: "Leave",
    startDate: "2023-02-14",
    email: "teerabhat@ptt.co.th",
    phone: "086-789-0123",
    avatar: "https://ui-avatars.com/api/?name=ธีรภัทร+แข็งแรง&background=2867e0&color=fff",
    shiftId: 2, // กะบ่าย
    otRate: 190, // 190 บาท/ชั่วโมง
    category: "เจ้าสัว"
  },
  {
    id: 7,
    code: "EMP-0007",
    name: "ประเสริฐ ดีงาม",
    dept: "ร้านเจียง",
    position: "พนักงานร้าน",
    status: "Active",
    startDate: "2024-05-01",
    email: "prasert@ptt.co.th",
    phone: "087-890-1234",
    avatar: "https://ui-avatars.com/api/?name=ประเสริฐ+ดีงาม&background=e41f2b&color=fff",
    shiftId: 2, // กะบ่าย
    otRate: 200, // 200 บาท/ชั่วโมง
    category: "ร้านเจียง"
  },
  {
    id: 8,
    code: "EMP-0008",
    name: "อัญชลี มีชัย",
    dept: "ร้านเชสเตอร์",
    position: "พนักงานร้าน",
    status: "Active",
    startDate: "2023-09-10",
    email: "anchalee@ptt.co.th",
    phone: "088-901-2345",
    avatar: "https://ui-avatars.com/api/?name=อัญชลี+มีชัย&background=19b7ff&color=fff",
    shiftId: 3, // กะดึก
    otRate: 250, // 250 บาท/ชั่วโมง
    category: "ร้านเชสเตอร์"
  },
  {
    id: 9,
    code: "EMP-0009",
    name: "วิภา รักษ์สุข",
    dept: "แม่บ้าน",
    position: "หัวหน้าแม่บ้าน",
    status: "Active",
    startDate: "2022-03-01",
    email: "wipa@ptt.co.th",
    phone: "089-012-3456",
    avatar: "https://ui-avatars.com/api/?name=วิภา+รักษ์สุข&background=19b7ff&color=fff",
    shiftId: 1, // กะเช้า
    otRate: 180, // 180 บาท/ชั่วโมง
    category: "แม่บ้าน"
  },
  {
    id: 10,
    code: "EMP-0010",
    name: "สมเกียรติ ใจดี",
    dept: "ปั๊มน้ำมัน",
    position: "พนักงานปั๊ม",
    status: "Active",
    startDate: "2024-02-15",
    email: "somkiat@ptt.co.th",
    phone: "090-123-4567",
    avatar: "https://ui-avatars.com/api/?name=สมเกียรติ+ใจดี&background=2867e0&color=fff",
    shiftId: 2, // กะบ่าย
    otRate: 200, // 200 บาท/ชั่วโมง
    category: "ปั๊ม"
  },
  {
    id: 11,
    code: "EMP-0011",
    name: "นภัสวรรณ สวยงาม",
    dept: "ยิ้ม",
    position: "พนักงานร้าน",
    status: "Active",
    startDate: "2023-11-20",
    email: "napasawan@ptt.co.th",
    phone: "091-234-5678",
    avatar: "https://ui-avatars.com/api/?name=นภัสวรรณ+สวยงาม&background=19b7ff&color=fff",
    shiftId: 1, // กะเช้า
    otRate: 180, // 180 บาท/ชั่วโมง
    category: "ยิ้ม"
  },
  {
    id: 12,
    code: "EMP-0012",
    name: "กมลชนก ใสสะอาด",
    dept: "แม่บ้าน",
    position: "แม่บ้าน",
    status: "Active",
    startDate: "2023-08-10",
    email: "kamolchanok@ptt.co.th",
    phone: "092-345-6789",
    avatar: "https://ui-avatars.com/api/?name=กมลชนก+ใสสะอาด&background=19b7ff&color=fff",
    shiftId: 1, // กะเช้า
    otRate: 170, // 170 บาท/ชั่วโมง
    category: "แม่บ้าน"
  }
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

export const attendanceLogs: AttendanceLog[] = [
  { id: 1, empCode: "EMP-0001", empName: "สมชาย ใจดี", date: "2025-11-01", checkIn: "08:31", checkOut: "19:30", status: "สาย 1 นาที", lateMinutes: 1, otHours: 2.0, otAmount: 500 },
  { id: 2, empCode: "EMP-0002", empName: "สมหญิง รักงาน", date: "2025-11-01", checkIn: "08:28", checkOut: "17:00", status: "ตรงเวลา", otHours: 0, otAmount: 0 },
  { id: 3, empCode: "EMP-0003", empName: "วรพล ตั้งใจ", date: "2025-11-01", checkIn: "08:25", checkOut: "18:30", status: "ตรงเวลา", otHours: 1.5, otAmount: 330 },
  { id: 4, empCode: "EMP-0004", empName: "กิตติคุณ ใฝ่รู้", date: "2025-11-01", checkIn: "08:45", checkOut: "20:00", status: "สาย 15 นาที", lateMinutes: 15, otHours: 3.25, otAmount: 585 },
  { id: 5, empCode: "EMP-0005", empName: "พิมพ์ชนก สมใจ", date: "2025-11-01", checkIn: "08:29", checkOut: "17:01", status: "ตรงเวลา", otHours: 0, otAmount: 0 },
  { id: 6, empCode: "EMP-0006", empName: "ธีรภัทร แข็งแรง", date: "2025-11-01", checkIn: "-", checkOut: "-", status: "ลา", otHours: 0, otAmount: 0 },
  // เพิ่มข้อมูลสำหรับกะบ่ายและกะดึก
  { id: 7, empCode: "EMP-0007", empName: "ประเสริฐ ดีงาม", date: "2025-11-01", checkIn: "12:05", checkOut: "21:30", status: "สาย 5 นาที", lateMinutes: 5, otHours: 0.5, otAmount: 100 },
  { id: 8, empCode: "EMP-0008", empName: "อัญชลี มีชัย", date: "2025-11-01", checkIn: "21:00", checkOut: "06:15", status: "ตรงเวลา", otHours: 0.25, otAmount: 50 },
];

// ========== 3) SHIFTS (กะการทำงาน) ==========
export interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export const shifts: Shift[] = [
  { id: 1, name: "เช้า", startTime: "08:30", endTime: "17:30", description: "กะเช้า (ปกติ)" },
  { id: 2, name: "บ่าย", startTime: "12:00", endTime: "21:00", description: "กะบ่าย" },
  { id: 3, name: "ดึก", startTime: "21:00", endTime: "06:00", description: "กะดึก (Overnight)" }
];

// ========== 4) LEAVES (การลา) ==========
export interface Leave {
  id: number;
  empCode: string;
  empName: string;
  type: "ลาพักร้อน" | "ลาป่วย" | "ลากิจ" | "ลาคลอด";
  fromDate: string;
  toDate: string;
  days: number;
  status: "รออนุมัติ" | "อนุมัติแล้ว" | "ไม่อนุมัติ";
  reason?: string;
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
    status: "รออนุมัติ",
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
    status: "รออนุมัติ",
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

