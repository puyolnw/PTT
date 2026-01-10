import AppLayout from "./components/AppLayout";
import SidebarDashboard from "@/components/SidebarDashboard";
import { GasStationProvider } from "@/contexts/GasStationContext";

export default function LayoutDashboard() {
  return (
    <AppLayout
      SidebarComponent={SidebarDashboard}
      ContentWrapper={GasStationProvider}
    />
  );
}
