import {
    Calculator, BookOpen, FileText, Building2, Lock, BarChart3,
    Package, Scale, Clock, Users, Link2, Globe, History,
    TrendingUp, AlertTriangle, Bell, Home, Settings as SettingsIcon
} from "lucide-react";
import { SidebarConfig } from "../types";

export const accountingSidebarConfig: SidebarConfig = {
    moduleName: "M6: ระบบบัญชี",
    moduleDescription: "บัญชีกลางและการปิดงบดุล",
    moduleIcon: Calculator,
    items: [
        { to: "/app/accounting", icon: Home, label: "Dashboard", end: true },
        { to: "/app/accounting/chart-of-accounts", icon: BookOpen, label: "ผังบัญชี" },
        { to: "/app/accounting/journal-entries", icon: FileText, label: "รายการบัญชี" },
        { to: "/app/accounting/trial-balance", icon: Scale, label: "งบทดลอง", roles: ["admin", "accountant", "finance"] },
        { to: "/app/accounting/bank-reconciliation", icon: Building2, label: "กระทบยอดธนาคาร", roles: ["admin", "accountant"] },
        { to: "/app/accounting/inventory-reconciliation", icon: Package, label: "กระทบยอดสต็อก" },
        { to: "/app/accounting/tax-calculation", icon: Calculator, label: "คำนวณภาษี", roles: ["admin", "accountant", "tax"] },
        { to: "/app/accounting/tax-reports", icon: FileText, label: "รายงานภาษี", roles: ["admin", "accountant", "tax"] },
        { to: "/app/accounting/month-end-closing", icon: Lock, label: "ปิดงบดุล", roles: ["admin", "accountant"] },
        { to: "/app/accounting/financial-reports", icon: BarChart3, label: "รายงานการเงิน", roles: ["admin", "accountant", "finance", "manager"] },
        { to: "/app/accounting/aging-report", icon: Clock, label: "รายงานอายุหนี้", roles: ["admin", "accountant", "finance"] },
        { to: "/app/accounting/fixed-assets", icon: Package, label: "สินทรัพย์ถาวร" },
        { to: "/app/accounting/vendors-customers", icon: Users, label: "คู่ค้า" },
        { to: "/app/accounting/gl-mapping", icon: Link2, label: "GL Mapping", roles: ["admin", "accountant"] },
        { to: "/app/accounting/legal-entities", icon: Globe, label: "นิติบุคคล", roles: ["admin", "manager"] },
        { to: "/app/accounting/audit-trail", icon: History, label: "Audit Trail", roles: ["admin", "auditor"] },
        { to: "/app/accounting/advanced-analytics", icon: TrendingUp, label: "วิเคราะห์ขั้นสูง", roles: ["admin", "manager", "analyst"] },
        { to: "/app/accounting/risk-dashboard", icon: AlertTriangle, label: "แดชบอร์ดความเสี่ยง", roles: ["admin", "manager"] },
        { to: "/app/accounting/alerts", icon: Bell, label: "การแจ้งเตือน" },
        { to: "/app/accounting/settings", icon: SettingsIcon, label: "ตั้งค่า", roles: ["admin"] },
    ],
};
