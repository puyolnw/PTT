import AppLayout from "./components/AppLayout";
import SidebarDelivery from "@/components/SidebarDelivery";
import { GasStationProvider } from "@/contexts/GasStationContext";

export default function LayoutDelivery() {
  return (
    <AppLayout
      SidebarComponent={SidebarDelivery}
      ContentWrapper={GasStationProvider}
      requiredRoles={["admin", "manager", "gas-station"]}
    />
  );
}


