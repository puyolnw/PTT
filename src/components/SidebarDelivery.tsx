import {
  Home,
  Settings as SettingsIcon,
  X,
  FileText,
  Truck,
  BarChart3,
  AlertTriangle,
  Gauge,
  Droplet,
  DollarSign,
  ClipboardList,
  ShoppingCart,
  PackageCheck,
  User,
  Monitor,
} from "lucide-react";
import { NavLink } from "react-router-dom";

type MenuItem = { to: string; icon: typeof Home; label: string; end?: boolean };
type MenuGroup = { id: string; label: string; items: MenuItem[] };

const menuGroups: MenuGroup[] = [
  {
    id: "overview",
    label: "ภาพรวม",
    items: [{ to: "/app/delivery", icon: Home, label: "Dashboard", end: true }],
  },
  {
    id: "orders",
    label: "การสั่งซื้อและรับน้ำมัน",
    items: [
      { to: "/app/delivery/receive-oil", icon: PackageCheck, label: "บันทึกการรับน้ำมัน", end: false },
      { to: "/app/delivery/purchase-orders", icon: FileText, label: "ใบสั่งซื้อจากปตท.", end: false },
      { to: "/app/delivery/internal-oil-order", icon: ShoppingCart, label: "สั่งซื้อน้ำมันภายในปั๊ม", end: false },
      { to: "/app/delivery/record-tank-entry", icon: Droplet, label: "บันทึกน้ำมันลงหลุม", end: false },
    ],
  },
  {
    id: "transport",
    label: "ขนส่งและคนขับ",
    items: [
      { to: "/app/delivery/truck-orders", icon: FileText, label: "ระบบส่งน้ำมัน(รับ)", end: false },
      { to: "/app/delivery/manage-trips", icon: Monitor, label: "จัดการรอบจัดส่ง", end: false },
      { to: "/app/delivery/driver-app", icon: Truck, label: "แอปคนขับ", end: false },
      { to: "/app/delivery/driver-app-gasstation", icon: User, label: "แอปคนขับ (เดิม)", end: false },
      { to: "/app/delivery/truck-profiles", icon: Truck, label: "โปรไฟล์รถส่งน้ำมัน", end: false },
      { to: "/app/delivery/trailer-profiles", icon: Droplet, label: "โปรไฟล์หางรถน้ำมัน", end: false },
    ],
  },
  {
    id: "oil-sales",
    label: "น้ำมันคงเหลือ/ขาย/ดูดน้ำมัน",
    items: [
      { to: "/app/delivery/remaining-on-truck", icon: Droplet, label: "น้ำมันที่เหลือบนรถ", end: false },
      { to: "/app/delivery/internal-pump-sales", icon: DollarSign, label: "ขายน้ำมันภายในปั๊ม", end: false },
      { to: "/app/delivery/oil-sales", icon: FileText, label: "บันทึกการขายน้ำมัน", end: false },
      { to: "/app/delivery/record-suction-oil", icon: ClipboardList, label: "บันทึกการดูดน้ำมัน", end: false },
    ],
  },
  {
    id: "monitoring",
    label: "ติดตาม/วิเคราะห์",
    items: [
      { to: "/app/delivery/allocation", icon: Gauge, label: "กระจายน้ำมัน", end: false },
      { to: "/app/delivery/fuel-efficiency", icon: BarChart3, label: "ประสิทธิภาพเชื้อเพลิง", end: false },
      { to: "/app/delivery/alerts", icon: AlertTriangle, label: "แจ้งเตือน/ผิดปกติ", end: false },
    ],
  },
  {
    id: "settings",
    label: "ตั้งค่า",
    items: [{ to: "/app/delivery/settings", icon: SettingsIcon, label: "ตั้งค่า", end: false }],
  },
];

interface SidebarDeliveryProps {
  onClose?: () => void;
  isMobile?: boolean;
  isExpanded?: boolean;
}

export default function SidebarDelivery({
  onClose,
  isMobile = false,
  isExpanded = true,
}: SidebarDeliveryProps) {
  const showText = isMobile || isExpanded;
  const sidebarWidth = isMobile ? "w-64" : isExpanded ? "w-64" : "w-16";

  return (
    <aside
      className={`
        ${sidebarWidth}
        bg-[var(--bg)]
        flex flex-col
        ${showText ? "items-start px-4" : "items-center"}
        py-4
        border-r border-app
        h-full
        transition-all duration-300 ease-in-out
        ${isMobile ? "overflow-y-auto scrollbar-hide" : ""}
      `}
    >
      {/* Header */}
      <div
        className={`mb-6 ${
          showText
            ? "w-full flex items-center justify-between"
            : "w-full flex items-center justify-center"
        }`}
      >
        <div className={`flex items-center gap-3 ${showText ? "flex-1" : ""}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-ptt-blue to-ptt-cyan rounded-xl flex items-center justify-center shadow-lg shadow-ptt-blue/20 flex-shrink-0">
            <Truck className="w-6 h-6 text-app" />
          </div>
          {showText && (
            <div className="overflow-hidden">
              <h2 className="text-lg font-semibold text-[var(--accent)] font-display whitespace-nowrap">
                ระบบ Delivery
              </h2>
              <p className="text-xs text-muted font-light whitespace-nowrap">
                สั่งซื้อ-ขนส่ง-กระจาย-ติดตาม
              </p>
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
      <div className={`flex-1 flex flex-col ${showText ? "w-full pb-6" : ""}`}>
        {menuGroups.map((group, gi) => (
          <div key={group.id} className={gi === 0 ? "" : "mt-4"}>
            {showText && (
              <div className="px-1 mb-2 text-[11px] tracking-wider text-muted uppercase">
                {group.label}
              </div>
            )}
            {!showText && gi !== 0 && <div className="my-2 w-full h-px bg-app" />}

            <div className="flex flex-col space-y-2">
              {group.items.map(({ to, icon: Icon, label, end }) => (
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
                    } ${showText ? "flex items-center gap-3 w-full" : "justify-center"}`
                  }
                  style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-ptt-blue rounded-r-full shadow-[0_0_8px_rgba(40,103,224,0.6)]" />
                      )}
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 group-hover:scale-110 ${
                          isActive ? "text-[var(--accent)]" : "text-muted group-hover:text-app"
                        }`}
                        strokeWidth={1.5}
                        style={{ transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                      />
                      {showText && (
                        <span
                          className={`text-sm font-medium whitespace-nowrap overflow-hidden ${
                            isActive ? "text-[var(--accent)]" : "text-app group-hover:text-app"
                          }`}
                          style={{ transition: "color 0.2s ease" }}
                        >
                          {label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}


