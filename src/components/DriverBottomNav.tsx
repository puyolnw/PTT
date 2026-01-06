import { useNavigate, useLocation } from "react-router-dom";
import { Truck, Droplet, LayoutDashboard } from "lucide-react";

export default function DriverBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 lg:hidden">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <button
          onClick={() => navigate("/app/gas-station/driver-app")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            isActive("/app/gas-station/driver-app") ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Truck className="w-6 h-6" strokeWidth={isActive("/app/gas-station/driver-app") ? 2.5 : 2} />
          <span className="text-[10px] font-medium">จัดการงานขนส่ง</span>
        </button>

        <button
          onClick={() => navigate("/app/delivery/record-fueling")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            isActive("/app/delivery/record-fueling") ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="relative">
            <Droplet className="w-6 h-6" strokeWidth={isActive("/app/delivery/record-fueling") ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-medium">บันทึกเติมน้ำมัน</span>
        </button>

        <button
          onClick={() => navigate("/app/gas-station/driver-dashboard")}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            isActive("/app/gas-station/driver-dashboard") ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <LayoutDashboard className="w-6 h-6" strokeWidth={isActive("/app/gas-station/driver-dashboard") ? 2.5 : 2}/>
          <span className="text-[10px] font-medium">แดชบอร์ด</span>
        </button>
      </div>
      {/* Safe Area for iPhone Home Indicator */}
      <div className="h-safe-bottom bg-white" />
    </div>
  );
}
