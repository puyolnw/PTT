import BaseSidebar from "./sidebar/BaseSidebar";
import { gasStationSidebarConfig } from "./sidebar/configs/gasStationConfig";
import { SidebarProps } from "./sidebar/types";
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
