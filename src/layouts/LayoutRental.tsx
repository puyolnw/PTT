import AppLayout from "./components/AppLayout";
import SidebarRental from "@/components/sidebar/SidebarRental";

export default function LayoutRental() {
  return <AppLayout SidebarComponent={SidebarRental} />;
}
