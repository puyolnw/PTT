import AppLayout from "./components/AppLayout";
import SidebarReports from "@/components/sidebar/SidebarReports";

export default function LayoutReports() {
  return <AppLayout SidebarComponent={SidebarReports} />;
}
