import AppLayout from "./components/AppLayout";
import SidebarAccounting from "@/components/sidebar/SidebarAccounting";

export default function LayoutAccounting() {
  return (
    <AppLayout
      SidebarComponent={SidebarAccounting}
      requiredRoles={["finance", "admin", "accountant"]}
    />
  );
}
