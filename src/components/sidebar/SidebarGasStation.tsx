import BaseSidebar from "./BaseSidebar";
import { gasStationSidebarConfig } from "./configs/gasStationConfig";
import { SidebarProps } from "./types";
import { useAuth } from "@/contexts/AuthContext";

export default function SidebarGasStation(props: SidebarProps) {
  const { user } = useAuth();
  const userRole = user?.role || "employee";

  return (
    <BaseSidebar
      config={gasStationSidebarConfig}
      userRole={userRole}
      {...props}
    />
  );
}
