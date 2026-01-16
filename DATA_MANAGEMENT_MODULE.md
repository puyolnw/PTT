# โมดูลจัดการข้อมูล (Data Management Module)

## ภาพรวม
โมดูลจัดการข้อมูลเป็นส่วนสำหรับผู้ดูแลระบบ (Admin/Superadmin) ในการจัดการข้อมูลพื้นฐานของระบบ ประกอบด้วย 4 หน้าหลัก

## โครงสร้างโมดูล

### 1. บัญชีผู้ใช้ (Users)
**ไฟล์:** `src/pages/data-management/Users.tsx`

**ฟีเจอร์:**
- แสดงรายการผู้ใช้ทั้งหมดในระบบแบบตาราง
- ข้อมูลที่แสดง: ชื่อผู้ใช้, ชื่อจริง, อีเมล, บทบาท, สาขา, แผนก, สถานะ
- ค้นหาผู้ใช้ได้
- ปุ่ม CRUD (Create, Read, Update, Delete)
- แสดงสถานะการใช้งาน (Active/Inactive) ด้วยสีและไอคอน

**UI Design:**
- ตารางแสดงข้อมูลแบบ responsive
- สถานะแสดงด้วย badge สีเขียว (ใช้งาน) และสีแดง (ไม่ใช้งาน)
- Hover effects บนแถวตาราง
- ปุ่มแก้ไข/ลบแยกชัดเจน

---

### 2. สาขา (Branches)
**ไฟล์:** `src/pages/data-management/Branches.tsx`

**ฟีเจอร์:**
- แสดงรายการสาขาทั้งหมด
- ข้อมูลที่แสดง: รหัสสาขา, ชื่อสาขา, ที่อยู่, เบอร์โทร, ผู้จัดการ, จำนวนพนักงาน
- ค้นหาสาขาได้
- ปุ่ม CRUD
- แสดงไอคอน MapPin สำหรับสาขา

**UI Design:**
- ตารางพร้อมไอคอนระบุตำแหน่ง
- จำนวนพนักงานแสดงเป็น badge
- ที่อยู่แสดงแบบ truncate เพื่อประหยัดพื้นที่

---

### 3. แผนก (Departments)
**ไฟล์:** `src/pages/data-management/Departments.tsx`

**ฟีเจอร์:**
- แสดงรายการแผนกทั้งหมด
- ข้อมูลที่แสดง: รหัสแผนก, ชื่อแผนก, สาขา, หัวหน้าแผนก, จำนวนพนักงาน, รายละเอียด
- **ความเชื่อมโยงกับสาขา:** แผนกต้องอยู่ภายใต้สาขาหนึ่งๆ
- กรองตามสาขาได้
- ค้นหาแผนกได้
- ปุ่ม CRUD

**UI Design:**
- Dropdown สำหรับเลือกสาขา
- สาขาแสดงเป็น badge สีม่วง
- แสดงไอคอน Building2 สำหรับแผนก

---

### 4. สิทธิ์ (Permissions)
**ไฟล์:** `src/pages/data-management/Permissions.tsx`

**ฟีเจอร์:**
- แสดงบทบาท (Roles) และสิทธิ์การเข้าถึงโมดูลต่างๆ
- ข้อมูลที่แสดง: ชื่อบทบาท, รหัสบทบาท, คำอธิบาย, จำนวนผู้ใช้
- แสดงสิทธิ์การเข้าถึงโมดูลทั้ง 9 โมดูล
- ค้นหาบทบาทได้
- ปุ่ม CRUD

**UI Design:**
- Card-based layout แทนตาราง
- แสดงสิทธิ์เป็น grid ของ badges
- สีเขียว = มีสิทธิ์, สีเทา = ไม่มีสิทธิ์
- ไอคอน Check/X แสดงสถานะ

---

## โครงสร้างไฟล์

```
src/
├── components/
│   └── SidebarDataManagement.tsx       # Sidebar สำหรับโมดูล
├── layouts/
│   └── LayoutDataManagement.tsx        # Layout wrapper
├── pages/
│   └── data-management/
│       ├── Dashboard.tsx               # หน้าแรก (ภาพรวม)
│       ├── Users.tsx                   # จัดการผู้ใช้
│       ├── Branches.tsx                # จัดการสาขา
│       ├── Departments.tsx             # จัดการแผนก
│       └── Permissions.tsx             # จัดการสิทธิ์
└── routes/
    └── modules/
        └── dataManagement.tsx          # Route configuration
```

---

## Routes

```typescript
/app/data-management              → Dashboard
/app/data-management/users        → Users
/app/data-management/branches     → Branches
/app/data-management/departments  → Departments
/app/data-management/permissions  → Permissions
```

---

## สิทธิ์การเข้าถึง

โมดูลนี้จำกัดเฉพาะ:
- **admin**
- **superadmin**

กำหนดใน `src/components/navbar/constants.ts`:
```typescript
{
  name: "จัดการข้อมูล",
  path: "/app/data-management",
  icon: Settings,
  roles: ["admin", "superadmin"]
}
```

---

## Design Principles

### 1. Consistency
- ทุกหน้าใช้ layout pattern เดียวกัน
- Header พร้อม title, description และปุ่ม "เพิ่ม"
- Search bar อยู่ด้านบน
- ตารางหรือ card layout สำหรับแสดงข้อมูล

### 2. User Experience
- Hover effects บนทุก interactive elements
- Loading states (พร้อมสำหรับเชื่อม API)
- Empty states เมื่อไม่มีข้อมูล
- Responsive design

### 3. Visual Hierarchy
- ใช้สีแยกประเภทข้อมูล
- Icons ช่วยให้จำแนกข้อมูลได้ง่าย
- Badges สำหรับ status และ counts
- Spacing ที่เหมาะสม

---

## ขั้นตอนถัดไป (Next Steps)

### 1. เชื่อม Backend API
- สร้าง API endpoints สำหรับ CRUD operations
- เพิ่ม loading states
- Error handling
- Success notifications

### 2. เพิ่ม Modal Forms
- Create/Edit forms สำหรับแต่ละหน้า
- Form validation
- Confirmation dialogs สำหรับ Delete

### 3. เพิ่มฟีเจอร์
- Pagination สำหรับตาราง
- Sorting columns
- Advanced filters
- Export data (CSV/Excel)
- Bulk operations

### 4. Relationships
- เมื่อสร้าง Department ต้องเลือก Branch
- เมื่อสร้าง User ต้องเลือก Branch และ Department
- Cascade delete handling

---

## ตัวอย่างข้อมูล Mock

ทุกหน้ามี mock data สำหรับ demo:
- Users: 3 users
- Branches: 3 branches
- Departments: 4 departments (เชื่อมกับสาขา)
- Permissions: 4 roles พร้อมสิทธิ์

---

## การใช้งาน

1. Login ด้วย admin/superadmin
2. คลิกที่ "จัดการข้อมูล" ใน navbar
3. เลือกเมนูจาก sidebar:
   - บัญชีผู้ใช้
   - สาขา
   - แผนก
   - สิทธิ์

---

## Technologies Used

- **React** + **TypeScript**
- **React Router** สำหรับ routing
- **Lucide Icons** สำหรับ icons
- **Tailwind CSS** สำหรับ styling
- **Framer Motion** (ถ้ามี animations)

---

## Notes

- ทุกหน้ามี search functionality
- ทุกหน้ามี CRUD buttons (ยังไม่ได้เชื่อม logic)
- Department มีความสัมพันธ์กับ Branch
- Permission page ใช้ card layout แทนตาราง
- Dashboard แสดงภาพรวมและ quick links
