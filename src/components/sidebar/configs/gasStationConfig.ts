import {
    Fuel, FileText, Droplet,
    FileSpreadsheet,
    LayoutDashboard, BarChart3, Warehouse, Gauge,
    Receipt, CreditCard, TrendingUp, AlertCircle,
    DollarSign, Calculator, TestTube,
    FileSpreadsheet as FileSpreadsheetIcon
} from "lucide-react";
import { SidebarConfig } from "../types";

export const gasStationSidebarConfig: SidebarConfig = {
    moduleName: "M8: ระบบปั๊มน้ำมัน",
    moduleDescription: "บริหารจัดการปั๊มน้ำมัน",
    moduleIcon: Fuel,
    groups: [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
            items: [
                { to: "/app/gas-station", icon: LayoutDashboard, label: "Dashboard", end: true },
            ],
            roles: ["admin", "manager", "gas-station", "cashier"]
        },
        // {
        //     id: "orders",
        //     label: "การสั่งซื้อ",
        //     icon: ShoppingCart,
        //     items: [
        //         { to: "/app/gas-station/station-order", icon: ShoppingCart, label: "ใบสั่งซื้อจากปั๊ม" },
        //         { to: "/app/gas-station/order-management", icon: ClipboardList, label: "จัดการคำสั่งซื้อ" },
        //         { to: "/app/gas-station/internal-oil-order", icon: ShoppingCart, label: "สั่งซื้อน้ำมันภายในปั๊ม" },
        //         { to: "/app/gas-station/internal-oil-order-management", icon: ClipboardList, label: "จัดการคำสั่งซื้อน้ำมันภายในปั๊ม", branchIds: ["1"] },
        //         { to: "/app/gas-station/quotation", icon: FileText, label: "ใบเสนอราคา" },
        //         { to: "/app/gas-station/po-generation", icon: FileText, label: "สร้างใบสั่งซื้อ" },
        //         { to: "/app/gas-station/purchase-book", icon: FileText, label: "สมุดซื้อ" },
        //     ],
        //     roles: ["admin", "manager", "gas-station"]
        // },
        // {
        //     id: "receipt",
        //     label: "การรับน้ำมัน",
        //     icon: PackageCheck,
        //     items: [
        //         { to: "/app/gas-station/oil-receipt", icon: PackageCheck, label: "รับน้ำมัน" },
        //         { to: "/app/gas-station/receive-oil", icon: PackageCheck, label: "รับน้ำมันจากสาขา" },
        //         { to: "/app/gas-station/receive-from-branch", icon: Building2, label: "รับน้ำมันจากสาขาอื่น" },
        //         { to: "/app/gas-station/delivery-note", icon: FileText, label: "ใบส่งของ" },
        //         { to: "/app/gas-station/receipt", icon: Receipt, label: "ใบเสร็จ" },
        //     ],
        //     roles: ["admin", "manager", "gas-station"]
        // },
        {
            id: "stock",
            label: "สต็อก",
            icon: Warehouse,
            items: [
                { to: "/app/gas-station/stock", icon: Warehouse, label: "สต็อก" },
                { to: "/app/gas-station/update-stock", icon: TrendingUp, label: "อัปเดตสต็อก" },
                { to: "/app/gas-station/stock-update-history", icon: FileText, label: "ประวัติการอัปเดตสต็อก" },
                { to: "/app/gas-station/underground-book", icon: Droplet, label: "สมุดน้ำมันใต้ดิน" },
                { to: "/app/gas-station/underground-measurement", icon: Gauge, label: "วัดน้ำมันใต้ดิน" },
                { to: "/app/gas-station/tank-entry-book", icon: FileText, label: "สมุดบันทึกน้ำมันลงหลุม" },
                { to: "/app/gas-station/oil-transfer", icon: Droplet, label: "โอนย้ายน้ำมัน" },
                { to: "/app/gas-station/pending-book", icon: FileText, label: "สมุดตั้งพัก" },
                { to: "/app/gas-station/balance-petrol", icon: Gauge, label: "สมุด Balance Petrol" },
                { to: "/app/gas-station/balance-petrol-monthly", icon: BarChart3, label: "ยอดคงเหลือน้ำมันรายเดือน" },
                { to: "/app/gas-station/oil-deficit-report", icon: AlertCircle, label: "รายงานน้ำมันขาด" },
                { to: "/app/gas-station/oil-deficit-monthly", icon: BarChart3, label: "รายงานน้ำมันขาดรายเดือน" },
            ],
            roles: ["admin", "manager", "gas-station"]
        },
        {
            id: "sales",
            label: "การขาย",
            icon: DollarSign,
            items: [
                // { to: "/app/gas-station/sales", icon: DollarSign, label: "การขาย" },
                // { to: "/app/gas-station/pos", icon: CreditCard, label: "ระบบขายหน้าร้าน" },
                { to: "/app/gas-station/wholesale-book", icon: FileText, label: "สมุดขายส่งขายปลีก" },
                { to: "/app/gas-station/control-sheet", icon: FileSpreadsheet, label: "Control Sheet" },
                // { to: "/app/gas-station/product-sales-history", icon: FileText, label: "ประวัติการขายสินค้า" },
                { to: "/app/gas-station/sales-instrument-report", icon: FileText, label: "รายงานตราสารยอดขาย" },
            ],
            roles: ["admin", "manager", "gas-station", "cashier"]
        },
        {
            id: "products",
            label: "ผลิตภัณฑ์",
            icon: Fuel,
            items: [
                { to: "/app/gas-station/station-products", icon: Fuel, label: "สินค้าปั๊ม" },
                { to: "/app/gas-station/gas", icon: Fuel, label: "น้ำมันแก๊ส" },
                { to: "/app/gas-station/lubricants", icon: Droplet, label: "น้ำมันหล่อลื่น" },
                { to: "/app/gas-station/lubricants-dashboard", icon: LayoutDashboard, label: "แดชบอร์ดน้ำมันหล่อลื่น" },
                { to: "/app/gas-station/engine-oil", icon: Droplet, label: "น้ำมันเครื่อง" },
                { to: "/app/gas-station/price-adjustment", icon: TrendingUp, label: "ปรับราคา" },
            ],
            roles: ["admin", "manager", "gas-station"]
        },
        // {
        //     id: "transport",
        //     label: "การขนส่ง",
        //     icon: Truck,
        //     items: [
        //         { to: "/app/gas-station/internal-transport", icon: Truck, label: "ขนส่งภายในปั๊ม" },
        //         { to: "/app/gas-station/transport-delivery", icon: Navigation, label: "ขนส่งและจัดส่ง" },
        //         { to: "/app/gas-station/inter-branch-transfer", icon: Building2, label: "โอนย้ายระหว่างสาขา" },
        //     ],
        //     roles: ["admin", "manager", "gas-station"]
        // },
        // {
        //     id: "fleet",
        //     label: "การจัดการรถ",
        //     icon: Truck,
        //     items: [
        //         { to: "/app/gas-station/truck-dashboard", icon: Monitor, label: "แดชบอร์ดสถานะรถ" },
        //         { to: "/app/gas-station/truck-profiles", icon: Truck, label: "โปรไฟล์รถส่งน้ำมัน" },
        //         { to: "/app/gas-station/trailer-profiles", icon: Droplet, label: "โปรไฟล์หางรถน้ำมัน" },
        //         { to: "/app/gas-station/truck-orders", icon: FileText, label: "ประวัติการส่งน้ำมัน (รับ)" },
        //         { to: "/app/gas-station/truck-sales", icon: Truck, label: "ขายน้ำมันที่เหลือบนรถ" },
        //         { to: "/app/gas-station/internal-driver-app", icon: Users, label: "แอปคนขับ (ส่งภายใน)" },
        //         { to: "/app/gas-station/record-fueling-internal", icon: Gauge, label: "บันทึกเติมน้ำมัน (เที่ยววิ่งภายใน)" },
        //     ],
        //     roles: ["admin", "manager", "gas-station"]
        // },
        {
            id: "quality",
            label: "คุณภาพ",
            icon: TestTube,
            items: [
                { to: "/app/gas-station/quality-test", icon: TestTube, label: "ทดสอบคุณภาพ" },
            ],
            roles: ["admin", "manager", "gas-station"]
        },
        {
            id: "payments",
            label: "การชำระเงิน",
            icon: CreditCard,
            items: [
                { to: "/app/gas-station/payments", icon: CreditCard, label: "การชำระเงิน" },
                { to: "/app/gas-station/deposit-slips", icon: Receipt, label: "ใบฝากเงิน" },
            ],
            roles: ["admin", "manager", "gas-station", "cashier"]
        },
        {
            id: "accounting",
            label: "บัญชี",
            icon: Calculator,
            items: [
                { to: "/app/gas-station/accounting-export", icon: FileSpreadsheetIcon, label: "ส่งออกข้อมูลบัญชี" },
            ],
            roles: ["admin", "manager", "gas-station"]
        },
        // {
        //     id: "reports",
        //     label: "รายงาน",
        //     icon: BarChart3,
        //     items: [
        //         { to: "/app/gas-station/reports", icon: BarChart3, label: "รายงาน" },
        //     ],
        //     roles: ["admin", "manager", "gas-station"]
        // },
        // {
        //     id: "settings",
        //     label: "ตั้งค่า",
        //     icon: Settings,
        //     items: [
        //         { to: "/app/gas-station/settings", icon: Settings, label: "ตั้งค่า" },
        //     ],
        //     roles: ["admin", "manager", "gas-station"]
        // }
    ]
};
