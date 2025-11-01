import { Outlet } from "react-router-dom";
import ScrollProgress from "@/components/ScrollProgress";

export default function LayoutMain() {
  return (
    <div className="min-h-screen bg-app text-app flex">
      {/* Scroll Progress Bar */}
      <ScrollProgress />
      
      {/* Sidebar + Content Area - แต่ละ module จะจัดการเอง */}
      <Outlet />
    </div>
  );
}

