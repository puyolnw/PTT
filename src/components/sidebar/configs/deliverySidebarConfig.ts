import {
    Home,
    Truck,
    Gauge,
    LayoutDashboard,
    User,
    FileText,
    ShoppingCart,
    ClipboardList,
    Droplet,
    Monitor,
    DollarSign,
    Building2,
    Navigation,
    ClipboardCheck,
    CreditCard
} from "lucide-react";
import { SidebarConfig } from "../types";

const managerRoles = ["admin", "manager", "gas-station"];
const driverRoles = ["employee"];

export const deliverySidebarConfig: SidebarConfig = {
    moduleName: "ระบบ Delivery",
    moduleDescription: "สั่งซื้อ-ขนส่ง-กระจาย-ติดตาม",
    moduleIcon: Truck,
    groups: [
        {
            id: "overview",
            label: "ภาพรวม",
            items: [
                { to: "/app/delivery", icon: Home, label: "Dashboard", end: true },
            ],
            roles: managerRoles
        },
        {
            id: "orders",
            label: "การจัดการสั่งซื้อ",
            items: [
                { to: "", icon: null, label: "การจัดการ (ส่วนกลาง)", isHeader: true },
                { to: "/app/delivery/purchase-orders", icon: FileText, label: "สร้างใบสั่งซื้อ (PTT)" },
                // { to: "/app/delivery/depot-oil-order-management", icon: ClipboardList, label: "จัดการคำสั่งซื้อคลัง (ไฮโซ)", branchIds: ["1"] },
                { to: "/app/delivery/internal-oil-order-management", icon: ClipboardList, label: "จัดการคำสั่งซื้อภายใน (ไฮโซ)", branchIds: ["1"] },
                
                { to: "", icon: null, label: "ภายในสาขา", isHeader: true },
                { to: "/app/delivery/request-oil", icon: ShoppingCart, label: "สั่งซื้อน้ำมันจากสาขาภายใน" },
                
                { to: "", icon: null, label: "คลัง ปตท.", isHeader: true },
                { to: "/app/delivery/request-depot-oil", icon: ShoppingCart, label: "รายการน้ำมันที่ส่วนกลางสั่งให้" },
            ],
            roles: managerRoles
        },
                    {
                        id: "receive-oil",
                        label: "การจัดการรับน้ำมัน",
                        items: [
                            { to: "", icon: null, label: "ภายใน", isHeader: true },
                            { to: "/app/delivery/internal-oil-receipt", icon: ClipboardCheck, label: "รับน้ำมัน (ภายในปั๊ม)" },
                            { to: "/app/delivery/record-tank-entry", icon: Droplet, label: "บันทึกน้ำมันลงหลุม" },
                            { to: "", icon: null, label: "คลัง ปตท.", isHeader: true },
                { to: "/app/delivery/depot-oil-receipt", icon: ClipboardCheck, label: "รับน้ำมันจากคลัง (ปตท.)" },
            ],
            roles: managerRoles
        },
        {
            id: "sales-and-stock",
            label: "สต็อกและการขายน้ำมัน",
            items: [
                { to: "", icon: null, label: "การขายน้ำมัน", isHeader: true },
                { to: "/app/delivery/hiso-pump-sales", icon: DollarSign, label: "ขายน้ำมัน (ไฮโซ)", branchIds: ["1"] },
                { to: "/app/delivery/internal-pump-sales", icon: DollarSign, label: "ขายน้ำมันภายในปั๊ม" },
                { to: "/app/delivery/external-sector-sales", icon: Building2, label: "ขายน้ำมัน (ภาครัฐ/เอกชน)", branchIds: ["1"] },
                
                { to: "", icon: null, label: "จัดการสต็อก/การเงิน", isHeader: true },
                { to: "/app/delivery/record-suction-oil", icon: ClipboardList, label: "บันทึกการดูดน้ำมัน" },
                { to: "/app/delivery/internal-payment", icon: CreditCard, label: "ชำระค่าน้ำมัน (ภายใน)" },
            ],
            roles: managerRoles
        },
        {
            id: "transport",
            label: "การจัดการขนส่ง",
            items: [
                { to: "", icon: null, label: "งานขนส่ง", isHeader: true },
                { to: "/app/delivery/manage-trips", icon: Monitor, label: "จัดการรอบจัดส่ง (PTT)" },
                { to: "/app/delivery/internal-transport", icon: Truck, label: "รายการขนส่งภายในปั๊ม" },
                { to: "/app/delivery/transport-tracking", icon: Navigation, label: "ติดตามสถานะการขนส่ง" },
                
                { to: "", icon: null, label: "ข้อมูลยานพาหนะ", isHeader: true },
                { to: "/app/delivery/truck-profiles", icon: Truck, label: "โปรไฟล์รถส่งน้ำมัน" },
                { to: "/app/delivery/trailer-profiles", icon: Droplet, label: "โปรไฟล์หางรถน้ำมัน" },
                { to: "/app/delivery/truck-orders", icon: FileText, label: "ประวัติการส่งน้ำมัน (รับ)" },
            ],
            roles: managerRoles
        },
        {
            id: "driver-section",
            label: "ส่วนของพนักงานขับรถ",
            items: [
                { to: "/app/delivery/driver-dashboard", icon: LayoutDashboard, label: "แดชบอร์ดคนขับ" },
                { to: "", icon: null, label: "แอปพลิเคชันคนขับ", isHeader: true },
                { to: "/app/delivery/driver-app", icon: User, label: "คนขับ (รับจาก PTT)" },
                { to: "/app/delivery/internal-driver-app", icon: Truck, label: "คนขับ (ส่งภายใน)" },
                
                { to: "", icon: null, label: "บันทึกเติมน้ำมัน", isHeader: true },
                { to: "/app/delivery/record-fueling", icon: Gauge, label: "เติมน้ำมัน (เที่ยววิ่ง PTT)" },
                { to: "/app/delivery/internal-record-fueling", icon: Gauge, label: "เติมน้ำมัน (เที่ยววิ่งภายใน)" },
            ],
            roles: [...driverRoles, ...managerRoles]
        },
    ]
};
