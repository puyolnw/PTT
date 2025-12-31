import BaseSidebar from "./sidebar/BaseSidebar";
import { accountingSidebarConfig } from "./sidebar/configs/accountingConfig";
import { SidebarProps } from "./sidebar/types";
import { useAuth } from "@/contexts/AuthContext";

export default function SidebarAccounting(props: SidebarProps) {
  const { user } = useAuth();

  // ถ้าไม่มี user (เช่นยังไม่ login หรือ error) ให้ใช้ role default เป็น employee
  const userRole = user?.role || "employee";

  return (
    <BaseSidebar
      config={accountingSidebarConfig}
      userRole={userRole}
      {...props}
    />
  );
}
