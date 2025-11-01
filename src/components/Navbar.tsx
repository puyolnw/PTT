import { NavLink, useNavigate } from "react-router-dom";
import { Users, PiggyBank, BarChart3, Bell, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";

const modules = [
  { name: "ระบบพนักงาน", path: "/app/hr", icon: Users },
  { name: "ระบบกองทุน", path: "/app/fund", icon: PiggyBank },
  { name: "รายงานและสถิติ", path: "/app/reports", icon: BarChart3 },
];

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between h-14 px-4 md:px-6 bg-[var(--bg)] border-b border-app">
      {/* Left Spacer - สำหรับดันให้ nav อยู่ตรงกลาง */}
      <div className="flex-1"></div>

      {/* Center: Module Navigation */}
      <nav className="flex gap-1 md:gap-2">
        {modules.map((mod) => (
          <NavLink
            key={mod.path}
            to={mod.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                isActive
                  ? "bg-[var(--primary)] text-white font-medium shadow-md hover:shadow-lg hover:brightness-110 active:scale-95"
                  : "text-muted hover:bg-soft hover:text-app hover:scale-105 active:scale-95"
              }`
            }
          >
            <mod.icon className="w-4 h-4" strokeWidth={2} />
            <span className="hidden md:inline">{mod.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex-1 flex items-center justify-end gap-1 md:gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification */}
        <button
          className="relative p-2 hover:bg-soft rounded-lg transition-all hover:scale-110 active:scale-95"
          title="การแจ้งเตือน"
        >
          <Bell className="w-4 h-4 text-muted" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-ptt-red rounded-full animate-pulse"></span>
        </button>

        {/* Profile */}
        <img
          src="https://ui-avatars.com/api/?name=PTT+User&background=2867e0&color=fff"
          alt="Profile"
          className="w-7 h-7 rounded-full ring-2 ring-ptt-blue/20 hover:ring-ptt-blue/40 hover:scale-110 transition-all cursor-pointer active:scale-95"
        />

        {/* Logout - Hidden on mobile */}
        <button
          onClick={handleLogout}
          className="hidden sm:flex items-center gap-1 px-2 py-1.5 hover:bg-soft rounded-lg transition-all text-muted hover:text-ptt-red hover:scale-105 active:scale-95 text-sm"
          title="ออกจากระบบ"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden lg:inline">ออกจากระบบ</span>
        </button>
      </div>
    </header>
  );
}
