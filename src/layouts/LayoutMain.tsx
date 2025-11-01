import { Outlet } from "react-router-dom";

export default function LayoutMain() {
  return (
    <div className="min-h-screen bg-app text-app flex">
      {/* Sidebar + Content Area - แต่ละ module จะจัดการเอง */}
      <Outlet />
    </div>
  );
}

