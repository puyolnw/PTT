import { Outlet } from "react-router-dom";
import ScrollProgress from "@/components/ScrollProgress";

export default function LayoutMain() {
  return (
    <div className="min-h-screen bg-app text-app flex">
      <ScrollProgress />
      
      <Outlet />
    </div>
  );
}

