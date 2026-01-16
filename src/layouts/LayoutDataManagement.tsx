import AppLayout from "./components/AppLayout";
import SidebarDataManagement from "@/components/sidebar/SidebarDataManagement";

export default function LayoutDataManagement() {
    return (
        <AppLayout
            SidebarComponent={SidebarDataManagement}
            requiredRoles={["admin", "superadmin"]}
        />
    );
}
