import {
    ShoppingCart, Fuel, FileText, Droplet,
    FileCheck, FileSpreadsheet, Truck, Monitor, PackageCheck
} from "lucide-react";
import { SidebarConfig } from "../types";

export const gasStationSidebarConfig: SidebarConfig = {
    moduleName: "M8: ระบบปั๊มน้ำมัน",
    moduleDescription: "บริหารจัดการปั๊มน้ำมัน",
    moduleIcon: Fuel,
    groups: [
        {
            id: "purchase",
            label: "การสั่งซื้อและรับน้ำมัน",
            icon: ShoppingCart,
            items: [
                { to: "/app/gas-station/orders", icon: ShoppingCart, label: "ใบสั่งซื้อจากปตท." },
                { to: "/app/gas-station/branch-oil-receipt", icon: PackageCheck, label: "รับน้ำมัน" },
                { to: "/app/gas-station/internal-oil-order", icon: ShoppingCart, label: "สั่งซื้อน้ำมันภายในปั๊ม" },
                { to: "/app/gas-station/internal-oil-order-management", icon: ShoppingCart, label: "รายการสั่งซื้อน้ำมันภายในปั๊ม", branchIds: ["1"] },
                { to: "/app/gas-station/internal-transport", icon: Truck, label: "ระบบขนส่งภายในปั๊ม" },
                { to: "/app/gas-station/inter-branch-transfer", icon: FileText, label: "ข้อมูลการส่งน้ำมันระหว่างปั๊ม" },
                { to: "/app/gas-station/record-tank-entry", icon: Droplet, label: "บันทึกน้ำมันลงหลุม" },
            ],
            roles: ["admin", "manager", "gas-station"]
        },
        {
            id: "fleet",
            label: "การจัดการรถ",
            icon: Truck,
            items: [
                { to: "/app/gas-station/truck-dashboard", icon: Monitor, label: "Dashboard สถานะรถ" },
                { to: "/app/gas-station/truck-orders", icon: FileText, label: "ระบบส่งน้ำมัน(รับ)" },
                { to: "/app/gas-station/truck-sales", icon: Truck, label: "ขายน้ำมันที่เหลือบนรถ" },
                { to: "/app/gas-station/truck-profiles", icon: Truck, label: "โปรไฟล์รถส่งน้ำมัน" },
                { to: "/app/gas-station/trailer-profiles", icon: Droplet, label: "โปรไฟล์หางรถน้ำมัน" },
            ],
            roles: ["admin", "manager", "gas-station"]
        },
        {
            id: "sales",
            label: "การขาย",
            icon: Fuel,
            items: [
                { to: "/app/gas-station/sales", icon: Fuel, label: "การขายน้ำมัน" },
                { to: "/app/gas-station/wholesale-book", icon: FileCheck, label: "สมุดขายส่งขายปลีก" },
                { to: "/app/gas-station/control-sheet", icon: FileSpreadsheet, label: "Control Sheet" },
                { to: "/app/gas-station/sales-instrument-report", icon: FileText, label: "รายงานตราสารยอดขาย" },
            ],
            roles: ["admin", "manager", "gas-station", "cashier"]
        }
    ]
};
