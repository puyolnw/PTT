import { Users, PiggyBank, BarChart3, FileText, Store, Building, Calculator, Fuel, Truck } from "lucide-react";
import { Module, Branch } from "./types";

export const modules: Module[] = [
    {
        name: "ระบบพนักงาน",
        path: "/app/hr",
        icon: Users,
        roles: ["admin", "hr", "manager"] // เฉพาะ admin, hr, manager
    },
    {
        name: "ระบบกองทุน",
        path: "/app/fund",
        icon: PiggyBank,
        roles: ["admin", "finance", "manager"]
    },
    {
        name: "ระบบงานเอกสาร",
        path: "/app/documents",
        icon: FileText
        // ไม่ระบุ roles = ทุกคนเห็น
    },
    {
        name: "รายงานและสถิติ",
        path: "/app/reports",
        icon: BarChart3,
        roles: ["admin", "manager", "finance"]
    },
    {
        name: "ร้านค้าพื้นที่ปั้ม",
        path: "/app/shops",
        icon: Store,
        roles: ["admin", "manager", "shop"]
    },
    {
        name: "จัดการพื้นที่เช่า",
        path: "/app/rental",
        icon: Building,
        roles: ["admin", "manager", "property"]
    },
    {
        name: "ระบบบัญชี",
        path: "/app/accounting",
        icon: Calculator,
        roles: ["admin", "finance", "accountant"]
    },
    {
        name: "ระบบปั๊มน้ำมัน",
        path: "/app/gas-station",
        icon: Fuel,
        roles: ["admin", "manager", "gas-station"]
    },
    {
        name: "ระบบ Delivery",
        path: "/app/delivery",
        icon: Truck,
        roles: ["admin", "manager", "gas-station", "employee"]
    },
];

export const branches: Branch[] = [
    { id: "1", name: "ปั้มไฮโซ" },
    { id: "2", name: "ปั้มดินดำ" },
    { id: "3", name: "ปั้มหนองจิก" },
    { id: "4", name: "ปั้มบายพาส" },
    { id: "5", name: "ปั้มตักสิลา" },
];

/**
 * Filter modules based on user role
 */
export function getModulesForRole(userRole: string): Module[] {
    // Admin เห็นทุกอย่าง
    if (userRole === "admin") return modules;

    return modules.filter(module => {
        // ถ้าไม่ระบุ roles หมายถึงทุกคนเห็นได้
        if (!module.roles || module.roles.length === 0) {
            return true;
        }
        // ตรวจสอบว่า user role อยู่ใน allowed roles หรือไม่
        return module.roles.includes(userRole);
    });
}
