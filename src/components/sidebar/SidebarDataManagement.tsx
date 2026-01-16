import { Users, Building2, Briefcase, Shield, Settings } from "lucide-react";
import BaseSidebar from "./BaseSidebar";
import { SidebarConfig } from "./types";

interface SidebarDataManagementProps {
    isExpanded?: boolean;
    onClose?: () => void;
    isMobile?: boolean;
}

export default function SidebarDataManagement({
    isExpanded = true,
    onClose,
    isMobile = false,
}: SidebarDataManagementProps) {
    const config: SidebarConfig = {
        moduleName: "จัดการข้อมูล",
        moduleDescription: "Data Management",
        moduleIcon: Settings,
        items: [
            {
                to: "/app/data-management/users",
                label: "บัญชีผู้ใช้",
                icon: Users,
            },
            {
                to: "/app/data-management/branches",
                label: "สาขา",
                icon: Building2,
            },
            {
                to: "/app/data-management/departments",
                label: "แผนก",
                icon: Briefcase,
            },
            {
                to: "/app/data-management/permissions",
                label: "สิทธิ์",
                icon: Shield,
            },
        ],
    };

    return (
        <BaseSidebar
            config={config}
            isExpanded={isExpanded}
            onClose={onClose}
            isMobile={isMobile}
        />
    );
}
