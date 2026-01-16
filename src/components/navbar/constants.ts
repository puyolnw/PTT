import { Users, PiggyBank, BarChart3, FileText, Store, Building, Calculator, Fuel, Settings } from "lucide-react";
import { Module, Branch } from "./types";

export const modules: Module[] = [
    {
        name: "พนักงาน",
        path: "/app/hr",
        icon: Users,
        roles: ["admin", "hr", "manager"] // เฉพาะ admin, hr, manager
    },
    {
        name: "กองทุน",
        path: "/app/fund",
        icon: PiggyBank,
        roles: ["admin", "finance", "manager"]
    },
    {
        name: "งานเอกสาร",
        path: "/app/documents",
        icon: FileText
        // ไม่ระบุ roles = ทุกคนเห็น
    },
    {
        name: "รายงาน",
        path: "/app/reports",
        icon: BarChart3,
        roles: ["admin", "manager", "finance"]
    },
    {
        name: "ร้านค้า",
        path: "/app/shops",
        icon: Store,
        roles: ["admin", "manager", "shop"]
    },
    {
        name: "พื้นที่เช่า",
        path: "/app/rental",
        icon: Building,
        roles: ["admin", "manager", "property"]
    },
    {
        name: "บัญชี",
        path: "/app/accounting",
        icon: Calculator,
        roles: ["admin", "finance", "accountant"]
    },
    {
        name: "ปั๊มน้ำมัน",
        path: "/app/gas-station",
        icon: Fuel,
        roles: ["admin", "manager", "gas-station"]
    },
    {
        name: "จัดการข้อมูล",
        path: "/app/data-management",
        icon: Settings,
        roles: ["admin", "superadmin"]
    },
];

export const branches: Branch[] = [
    { id: "1", name: "สาขา 1" },
    { id: "2", name: "สาขา 2" },
    { id: "3", name: "สาขา 3" },
    { id: "4", name: "สาขา 4" },
    { id: "5", name: "สาขา 5" },
];

/**
 * Filter modules based on user role
 */
export function getModulesForRole(userRole: string): Module[] {
    // Admin and Superadmin see everything
    if (userRole === "admin" || userRole === "superadmin") return modules;

    return modules.filter(module => {
        // ถ้าไม่ระบุ roles หมายถึงทุกคนเห็นได้
        if (!module.roles || module.roles.length === 0) {
            return true;
        }
        // ตรวจสอบว่า user role อยู่ใน allowed roles หรือไม่
        return module.roles.includes(userRole);
    });
}
