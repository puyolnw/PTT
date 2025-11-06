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
    dept: "IT",
    position: "Senior Developer",
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
    dept: "HR",
    position: "HR Officer",
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
    dept: "Account",
    position: "Senior Accountant",
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
    dept: "IT",
    position: "Frontend Developer",
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
    dept: "Marketing",
    position: "Marketing Manager",
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
    dept: "HR",
    position: "Recruiter",
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
    dept: "Production",
    position: "Production Operator",
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
    dept: "Security",
    position: "Security Guard",
    status: "Active",
    startDate: "2023-09-10",
    email: "anchalee@ptt.co.th",
    phone: "088-901-2345",
    avatar: "https://ui-avatars.com/api/?name=อัญชลี+มีชัย&background=19b7ff&color=fff",
    shiftId: 3, // กะดึก
    otRate: 250, // 250 บาท/ชั่วโมง
    category: "ร้านเชสเตอร์"
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

