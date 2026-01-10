import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Truck, Droplet, LayoutDashboard, ChevronUp, X, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DriverBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<"transport" | "fueling" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (paths: string[]) => paths.includes(location.pathname);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (menu: "transport" | "fueling") => {
    if (openMenu === menu) {
      setOpenMenu(null);
    } else {
      setOpenMenu(menu);
    }
  };

  const menuVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.95 }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden" ref={menuRef}>
      {/* Sub Menu Popover */}
      <AnimatePresence>
        {openMenu && (
          <div className="px-4 pb-4">
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={menuVariants}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center px-6">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {openMenu === "transport" ? "เลือกประเภทการขนส่ง" : "เลือกประเภทการเติมน้ำมัน"}
                </span>
                <button onClick={() => setOpenMenu(null)} className="p-1 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-2 space-y-1">
                {openMenu === "transport" ? (
                  <>
                    <button
                      onClick={() => { navigate("/app/delivery/internal-driver-app"); setOpenMenu(null); }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-[1.5rem] transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">ภายในสาขา</p>
                        <p className="text-[10px] text-gray-400 font-medium tracking-tight">ขนส่งน้ำมันระหว่างปั๊มภายในเครือ</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { navigate("/app/delivery/driver-app"); setOpenMenu(null); }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-[1.5rem] transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">คลัง ปตท. (PTT)</p>
                        <p className="text-[10px] text-gray-400 font-medium tracking-tight">รับน้ำมันจากคลัง ปตท. เข้าสู่สาขา</p>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { navigate("/app/delivery/internal-record-fueling"); setOpenMenu(null); }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-[1.5rem] transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Droplet className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">เที่ยววิ่งภายใน</p>
                        <p className="text-[10px] text-gray-400 font-medium tracking-tight">บันทึกการเติมน้ำมันรถขนส่งภายใน</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { navigate("/app/delivery/record-fueling"); setOpenMenu(null); }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-[1.5rem] transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Droplet className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">เที่ยววิ่ง PTT</p>
                        <p className="text-[10px] text-gray-400 font-medium tracking-tight">บันทึกการเติมน้ำมันรถเที่ยววิ่ง ปตท.</p>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Bottom Bar */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] px-2">
        <div className="flex justify-around items-center h-20 max-w-md mx-auto">
          <button
            onClick={() => handleMenuClick("transport")}
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1.5 transition-all relative ${
              isActive(["/app/delivery/driver-app", "/app/delivery/internal-driver-app"]) || openMenu === "transport"
                ? "text-blue-600" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all ${openMenu === "transport" ? "bg-blue-50 dark:bg-blue-900/20 scale-110" : ""}`}>
              <Truck className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">จัดการงานขนส่ง</span>
            {openMenu === "transport" && <ChevronUp className="w-3 h-3 absolute -top-1" />}
          </button>

          <button
            onClick={() => handleMenuClick("fueling")}
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1.5 transition-all relative ${
              isActive(["/app/delivery/record-fueling", "/app/delivery/internal-record-fueling"]) || openMenu === "fueling"
                ? "text-blue-600" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all ${openMenu === "fueling" ? "bg-blue-50 dark:bg-blue-900/20 scale-110" : ""}`}>
              <Droplet className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">บันทึกเติมน้ำมัน</span>
            {openMenu === "fueling" && <ChevronUp className="w-3 h-3 absolute -top-1" />}
          </button>

          <button
            onClick={() => { navigate("/app/delivery/driver-dashboard"); setOpenMenu(null); }}
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1.5 transition-all ${
              isActive(["/app/delivery/driver-dashboard"]) ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all ${isActive(["/app/delivery/driver-dashboard"]) ? "bg-blue-50 dark:bg-blue-900/20 scale-110" : ""}`}>
              <LayoutDashboard className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">แดชบอร์ด</span>
          </button>
        </div>
        {/* Safe Area for iPhone Home Indicator */}
        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
