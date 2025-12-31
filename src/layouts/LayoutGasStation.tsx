import AppLayout from "./components/AppLayout";
import SidebarGasStation from "@/components/SidebarGasStation";
import { GasStationProvider } from "@/contexts/GasStationContext";

export default function LayoutGasStation() {
  return (
    <AppLayout
      SidebarComponent={SidebarGasStation}
      ContentWrapper={GasStationProvider}
      requiredRoles={["gas-station", "admin", "manager", "cashier"]}
    />
  );
}
