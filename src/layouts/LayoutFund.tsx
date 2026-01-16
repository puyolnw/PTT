import AppLayout from "./components/AppLayout";
import SidebarFund from "@/components/sidebar/SidebarFund";

export default function LayoutFund() {
  return <AppLayout SidebarComponent={SidebarFund} />;
}
