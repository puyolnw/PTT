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
            label: "การสั่งซื้อและรับน้ำมัน",
            items: [
                { to: "/app/delivery/purchase-orders", icon: FileText, label: "ใบสั่งซื้อจากปตท.", branchIds: ["1"] },
                { to: "/app/delivery/internal-oil-order", icon: ShoppingCart, label: "สั่งซื้อน้ำมันภายในปั๊ม" },
                { to: "/app/delivery/branch-oil-receipt", icon: ClipboardList, label: "ใบรับน้ำมัน (Branch Receipt)" },
                { to: "/app/delivery/record-tank-entry", icon: Droplet, label: "บันทึกน้ำมันลงหลุม" },
            ],
            roles: managerRoles
        },
        {
            id: "transport",
            label: "ขนส่งและคนขับ",
            items: [
                { to: "/app/delivery/transport-tracking", icon: Navigation, label: "ติดตามสถานะการขนส่ง", branchIds: ["1"] },
                { to: "/app/delivery/truck-orders", icon: FileText, label: "ระบบส่งน้ำมัน(รับ)", branchIds: ["1"] },
                { to: "/app/delivery/manage-trips", icon: Monitor, label: "จัดการรอบจัดส่ง", branchIds: ["1"] },
                { to: "/app/delivery/truck-profiles", icon: Truck, label: "โปรไฟล์รถส่งน้ำมัน", branchIds: ["1"] },
                { to: "/app/delivery/trailer-profiles", icon: Droplet, label: "โปรไฟล์หางรถน้ำมัน", branchIds: ["1"] },
            ],
            roles: managerRoles
        },
        {
            id: "driver-section",
            label: "ระบบสำหรับพนักงานขับรถ",
            items: [
                { to: "/app/delivery/driver-dashboard", icon: LayoutDashboard, label: "DriverDashboard.tsx" },
                { to: "/app/delivery/driver-app", icon: User, label: "แอพของคนขับ" },
                { to: "/app/delivery/record-fueling", icon: Gauge, label: "บันทึกการเติมน้ำมัน" },
            ],
            roles: driverRoles
        },
        {
            id: "oil-sales",
            label: "น้ำมันคงเหลือ/ขาย/ดูดน้ำมัน",
            items: [
                { to: "/app/delivery/remaining-on-truck", icon: Droplet, label: "น้ำมันที่เหลือบนรถ" },
                { to: "/app/delivery/internal-pump-sales", icon: DollarSign, label: "ขายน้ำมันภายในปั๊ม" },
                { to: "/app/delivery/internal-apar", icon: Building2, label: "เจ้าหนี้ / ลูกหนี้ ภายใน" },
                { to: "/app/delivery/oil-sales", icon: FileText, label: "บันทึกการขายน้ำมัน" },
                { to: "/app/delivery/record-suction-oil", icon: ClipboardList, label: "บันทึกการดูดน้ำมัน" },
            ],
            roles: managerRoles
        },
    ]
};
