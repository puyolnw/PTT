import { 
  Home, 
  Settings as SettingsIcon, 
  X,
  Users,
  Clock,
  Calendar,
  Wallet,
  Shield,
  GitBranch,
  BarChart3,
  Trophy,
  Heart,
  Timer,
  AlertTriangle,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/app/hr", icon: Home, label: "Dashboard", end: true },
  { to: "/app/hr/employees", icon: Users, label: "พนักงาน", end: false },
  { to: "/app/hr/attendance", icon: Clock, label: "บันทึกเวลา", end: false },
  // { to: "/app/hr/overtime", icon: Timer, label: "OT", end: false },
  { to: "/app/hr/leaves", icon: Calendar, label: "การลา", end: false },
  { to: "/app/hr/warnings", icon: AlertTriangle, label: "ทันบน", end: false },
  { to: "/app/hr/payroll", icon: Wallet, label: "เงินเดือน", end: false },
  { to: "/app/hr/welfare", icon: Heart, label: "สวัสดิการ", end: false },
  { to: "/app/hr/social-security", icon: Shield, label: "ประกันสังคม", end: false },
  { to: "/app/hr/outstanding-employees", icon: Trophy, label: "พนักงานดีเด่น", end: false },
  { to: "/app/hr/organization", icon: GitBranch, label: "โครงสร้าง", end: false },
  { to: "/app/hr/reports", icon: BarChart3, label: "รายงาน", end: false },
  { to: "/app/hr/settings", icon: SettingsIcon, label: "ตั้งค่า", end: false },
];

interface SidebarHRProps {
  onClose?: () => void;
  isMobile?: boolean;
  isExpanded?: boolean;
}

export default function SidebarHR({ onClose, isMobile = false, isExpanded = true }: SidebarHRProps) {
  const showText = isMobile || isExpanded;
  const sidebarWidth = isMobile ? 'w-64' : (isExpanded ? 'w-64' : 'w-16');

  return (
    <aside 
      className={`
        ${sidebarWidth} 
        bg-[var(--bg)]
        flex flex-col 
        ${showText ? 'items-start px-4' : 'items-center'} 
        py-4 
        border-r border-app
        h-full
        transition-all duration-300 ease-in-out
        ${isMobile ? 'overflow-y-auto scrollbar-hide' : ''}
      `}
    >
      {/* Header - Logo/Brand + Toggle/Close button */}
      <div className={`mb-6 ${showText ? 'w-full flex items-center justify-between' : 'w-full flex items-center justify-center'}`}>
        <div className={`flex items-center gap-3 ${showText ? 'flex-1' : ''}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-ptt-blue to-ptt-cyan rounded-xl flex items-center justify-center shadow-lg shadow-ptt-blue/20 flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6 text-app"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L4 7v10l8 5 8-5V7l-8-5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 22V12M12 12L4 7M12 12l8-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {showText && (
            <div className="overflow-hidden">
              <h2 className="text-lg font-semibold text-[var(--accent)] font-display whitespace-nowrap">M3: HR</h2>
              <p className="text-xs text-muted font-light whitespace-nowrap">ระบบจัดการทรัพยากรบุคคล</p>
            </div>
          )}
        </div>
        
        {/* Close button - Mobile only */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:panel rounded-lg transition-all hover:scale-110 active:scale-95 hover:rotate-90 flex-shrink-0"
            aria-label="ปิดเมนู"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className={`flex-1 flex flex-col space-y-2 ${showText ? 'w-full pb-6' : ''}`}>
        {items.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            aria-label={label}
            onClick={isMobile ? onClose : undefined}
            className={({ isActive }) =>
              `p-3 rounded-xl hover:panel relative group hover:scale-105 active:scale-95 outline-none focus:outline-none focus:ring-2 focus:ring-ptt-blue/30 ${
                isActive ? "panel shadow-md" : ""
              } ${showText ? 'flex items-center gap-3 w-full' : 'justify-center'}`
            }
            style={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {({ isActive }) => (
              <>
                {/* Active indicator - left glow bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-ptt-blue rounded-r-full shadow-[0_0_8px_rgba(40,103,224,0.6)]" />
                )}
                
                {/* Icon */}
                <Icon
                  className={`w-5 h-5 flex-shrink-0 group-hover:scale-110 ${
                    isActive ? "text-[var(--accent)]" : "text-muted group-hover:text-app"
                  }`}
                  strokeWidth={1.5}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                />

                {/* Label - Show when expanded or mobile */}
                {showText && (
                  <span 
                    className={`text-sm font-medium whitespace-nowrap overflow-hidden ${
                      isActive ? "text-[var(--accent)]" : "text-app group-hover:text-app"
                    }`}
                    style={{
                      transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

    </aside>
  );
}

