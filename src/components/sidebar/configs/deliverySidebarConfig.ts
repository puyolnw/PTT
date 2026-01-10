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
                { to: "", icon: null, label: "การจัดการ", isHeader: true },
                { to: "/app/delivery/purchase-orders", icon: FileText, label: "สร้างใบสั่งซื้อ(คลังปตท.)" },
                { to: "/app/delivery/depot-oil-order-management", icon: ClipboardList, label: "จัดการคำสั่งซื้อจากคลัง (สาขาไฮโซ)", branchIds: ["1"] },
                { to: "/app/delivery/internal-oil-order-management", icon: ClipboardList, label: "จัดการคำสั่งซื้อ (สาขาไฮโซ)", branchIds: ["1"] },
                { to: "", icon: null, label: "ภายใน", isHeader: true },
                { to: "/app/delivery/request-oil", icon: ShoppingCart, label: "สั่งซื้อน้ำมันจากสาขาภายใน", branchIds: [ "1", "2", "3", "4", "5"] },
                { to: "/app/delivery/internal-payment", icon: CreditCard, label: "ชำระค่าน้ำมัน" },
                { to: "", icon: null, label: "คลัง ปตท.", isHeader: true },
                { to: "/app/delivery/request-depot-oil", icon: ShoppingCart, label: "รายการสั่งซื้อน้ำมันจากส่วนกลาง", branchIds: [ "1", "2", "3", "4", "5"] },

                // { to: "/app/delivery/internal-oil-order", icon: ShoppingCart, label: "สั่งซื้อน้ำมันภายในปั๊ม" },
                // { to: "/app/delivery/branch-oil-receipt", icon: ClipboardList, label: "ใบรับน้ำมัน (Branch Receipt)" },
            ],
            roles: managerRoles
        },
        {
            id: "receive-oil",
            label: "การจัดการรับน้ำมัน",
            items: [
                { to: "", icon: null, label: "ภายใน", isHeader: true },
                { to: "/app/delivery/internal-oil-receipt", icon: ClipboardCheck, label: "รับน้ำมัน (ภายในปั๊ม)" },
                { to: "", icon: null, label: "คลัง ปตท.", isHeader: true },
                { to: "/app/delivery/depot-oil-receipt", icon: ClipboardCheck, label: "รับน้ำมันจากคลัง (ปตท.)", branchIds: ["1", "2", "3", "4", "5"] },
            ],
            roles: managerRoles
        },
        {
            id: "oil-management",
            label: "จัดการน้ำมันคงเหลือ",
            items: [
                { to: "", icon: null, label: "ภายใน", isHeader: true },
                { to: "/app/delivery/internal-pump-sales", icon: DollarSign, label: "ขายน้ำมันภาย(ในปั๊ม)" },
                { to: "/app/delivery/record-suction-oil", icon: ClipboardList, label: "บันทึกการดูดน้ำมัน" },
                { to: "", icon: null, label: "ภาครัฐ/เอกชน", isHeader: true },
                { to: "/app/delivery/external-sector-sales", icon: Building2, label: "ขายน้ำมัน (ภาครัฐ/เอกชน)", branchIds: ["1"] },
                // { to: "/app/delivery/remaining-on-truck", icon: Droplet, label: "น้ำมันที่เหลือบนรถ" },
                // { to: "/app/delivery/internal-apar", icon: Building2, label: "เจ้าหนี้ / ลูกหนี้ ภายใน" },
            ],
            roles: managerRoles
        },
        {
            id: "order-payments",
            label: "การจัดการชำระค่าซื้อน้ำมัน",
            items: [
                { to: "", icon: null, label: "ภายใน", isHeader: true },
                { to: "/app/delivery/internal-pump-sales", icon: DollarSign, label: "ขายน้ำมันภาย(ในปั๊ม)" },
                { to: "/app/delivery/internal-payment", icon: CreditCard, label: "ชำระค่าน้ำมัน (ภายใน)" },
                { to: "", icon: null, label: "ภาครัฐ/เอกชน", isHeader: true },
                { to: "/app/delivery/external-sector-sales", icon: Building2, label: "ขายน้ำมัน (ภาครัฐ/เอกชน)", branchIds: ["1"] },
                // { to: "/app/delivery/remaining-on-truck", icon: Droplet, label: "น้ำมันที่เหลือบนรถ" },
                // { to: "/app/delivery/internal-apar", icon: Building2, label: "เจ้าหนี้ / ลูกหนี้ ภายใน" },
            ],
            roles: managerRoles
        },
        {
            id: "oil-sales",
            label: "จัดการการขายน้ำมัน",
            items: [
                { to: "", icon: null, label: "ภายใน", isHeader: true },
                { to: "/app/delivery/internal-pump-sales", icon: DollarSign, label: "ขายน้ำมันภาย(ในปั๊ม)" },
                { to: "/app/delivery/internal-payment", icon: CreditCard, label: "ชำระค่าน้ำมัน (ภายใน)" },
                { to: "", icon: null, label: "ภาครัฐ/เอกชน", isHeader: true },
                { to: "/app/delivery/external-sector-sales", icon: Building2, label: "ขายน้ำมัน (ภาครัฐ/เอกชน)", branchIds: ["1"] },
                // { to: "/app/delivery/remaining-on-truck", icon: Droplet, label: "น้ำมันที่เหลือบนรถ" },
                // { to: "/app/delivery/internal-apar", icon: Building2, label: "เจ้าหนี้ / ลูกหนี้ ภายใน" },
            ],
            roles: managerRoles
        },
        {
            id: "transport",
            label: "การจัดการขนส่ง",
            items: [
                { to: "/app/delivery/manage-trips", icon: Monitor, label: "จัดการรอบจัดส่ง" },
                { to: "/app/delivery/truck-orders", icon: FileText, label: "ระบบส่งน้ำมัน (รับ)" },
                { to: "/app/delivery/transport-tracking", icon: Navigation, label: "ติดตามสถานะการขนส่ง" },
                { to: "/app/delivery/truck-profiles", icon: Truck, label: "โปรไฟล์รถส่งน้ำมัน" },
                { to: "/app/delivery/trailer-profiles", icon: Droplet, label: "โปรไฟล์หางรถน้ำมัน" },
            ],
            roles: managerRoles
        },
        {
            id: "driver-section",
            label: "ส่วนของพนักงานขับรถ",
            items: [
                { to: "/app/delivery/driver-dashboard", icon: LayoutDashboard, label: "แดชบอร์ดคนขับ" },
                { to: "/app/delivery/driver-app", icon: User, label: "แอพพลิเคชั่นคนขับ" },
                { to: "/app/delivery/record-fueling", icon: Gauge, label: "บันทึกการเติมน้ำมัน" },
            ],
            roles: driverRoles
        },
    ]
};
