import BaseSidebar from "./sidebar/BaseSidebar";
import { deliverySidebarConfig } from "./sidebar/configs/deliverySidebarConfig";
import { SidebarProps } from "./sidebar/types";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";

export default function SidebarDelivery(props: SidebarProps) {
  const { user } = useAuth();
  const { selectedBranches } = useBranch();
  const userRole = user?.role || "guest";

  return (
    <BaseSidebar
      config={deliverySidebarConfig}
      userRole={userRole}
      selectedBranches={selectedBranches}
      {...props}
    />
  );
}


