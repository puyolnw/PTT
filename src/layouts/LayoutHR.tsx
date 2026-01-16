import AppLayout from "./components/AppLayout";
import SidebarHR from "@/components/sidebar/SidebarHR";

export default function LayoutHR() {
  return (
    <AppLayout
      SidebarComponent={SidebarHR}
      requiredRoles={["hr", "admin", "manager"]}
    />
  );
}
