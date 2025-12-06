import {
  Home,
  Settings as SettingsIcon,
  X,
  ShoppingCart,
  Package,
  Fuel,
  BookOpen,
  FileText,
  Droplet,
  TestTube,
  FileCheck,
  DollarSign,
  BarChart3,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  FilePlus,
  RotateCcw,
  CreditCard,
  FileSpreadsheet,
  Truck,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

interface SidebarGasStationProps {
  onClose?: () => void;
  isMobile?: boolean;
  isExpanded?: boolean;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: any;
  items: {
    to: string;
    icon: any;
    label: string;
    end?: boolean;
  }[];
}

export default function SidebarGasStation({ onClose, isMobile = false, isExpanded = true }: SidebarGasStationProps) {
  const location = useLocation();
  const showText = isMobile || isExpanded;
  const sidebarWidth = isMobile ? 'w-64' : (isExpanded ? 'w-64' : 'w-16');

  // Menu groups
  const menuGroups: MenuGroup[] = [
    {
      id: "purchase",
      label: "การสั่งซื้อและรับน้ำมัน",
      icon: ShoppingCart,
      items: [
        { to: "/app/gas-station/station-order", icon: FilePlus, label: "สั่งน้ำมันของปั้ม" },
        { to: "/app/gas-station/orders", icon: ShoppingCart, label: "การสั่งซื้อน้ำมัน" },
        { to: "/app/gas-station/receiving", icon: Package, label: "การรับน้ำมัน" },
        { to: "/app/gas-station/payments", icon: CreditCard, label: "การชำระเงินซื้อน้ำมัน" },
      ],
    },
    {
      id: "sales",
      label: "การขาย",
      icon: Fuel,
      items: [
        { to: "/app/gas-station/sales", icon: Fuel, label: "การขายน้ำมัน" },
        { to: "/app/gas-station/wholesale-book", icon: FileCheck, label: "สมุดขายส่งขายปลีก" },
        { to: "/app/gas-station/control-sheet", icon: FileSpreadsheet, label: "Control Sheet" },
        { to: "/app/gas-station/sales-instrument-report", icon: FileText, label: "รายงานตราสารยอดขาย" },
      ],
    },
    {
      id: "books",
      label: "สมุดบัญชี",
      icon: BookOpen,
      items: [
        { to: "/app/gas-station/underground-book", icon: BookOpen, label: "สมุดใต้ดิน" },
        // { to: "/app/gas-station/underground-measurement", icon: Droplet, label: "สมุดวัดน้ำมันใต้ดิน" },
        { to: "/app/gas-station/pending-book", icon: FileText, label: "สมุดตั้งพัก" },
        { to: "/app/gas-station/balance-petrol", icon: BookOpen, label: "สมุด Balance Petrol" },
        // { to: "/app/gas-station/balance-petrol-monthly", icon: BookOpen, label: "สมุด Balance Petrol รายเดือน" },
        { to: "/app/gas-station/purchase-book", icon: FileText, label: "สมุดซื้อน้ำมัน" },
        { to: "/app/gas-station/tank-entry-book", icon: Droplet, label: "สมุดน้ำมันลงหลุม" },
        { to: "/app/gas-station/oil-transfer", icon: Truck, label: "ย้ายน้ำมัน" },
      ],
    },
  ];

  // Other items (not in groups)
  const otherItems = [
    { to: "/app/gas-station/stock", icon: Package, label: "สต็อกน้ำมัน" },
    { to: "/app/gas-station/update-stock", icon: RotateCcw, label: "อัพเดตสต็อก" },
    { to: "/app/gas-station/quality-test", icon: TestTube, label: "การทดสอบน้ำมัน" },
    { to: "/app/gas-station/deposit-slips", icon: FileCheck, label: "การจัดการใบฝากน้ำมัน" },
    { to: "/app/gas-station/station-products", icon: Package, label: "สินค้าภายในปั้ม" },
    { to: "/app/gas-station/price-adjustment", icon: DollarSign, label: "การปรับราคาน้ำมัน" },
  ];

  // Reports and Settings
  const reportItems = [
    { to: "/app/gas-station/reports", icon: BarChart3, label: "รายงานและแดชบอร์ด" },
    { to: "/app/gas-station/oil-deficit-report", icon: TrendingDown, label: "รายงานยอดขาดน้ำมัน" },
    { to: "/app/gas-station/settings", icon: SettingsIcon, label: "ตั้งค่า" },
  ];

  // State for expanded groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Auto-expand groups if current path matches any item in the group
  useEffect(() => {
    const newExpanded = new Set<string>();
    menuGroups.forEach((group) => {
      const isActive = group.items.some((item) => location.pathname === item.to);
      if (isActive) {
        newExpanded.add(group.id);
      }
    });
    if (newExpanded.size > 0) {
      setExpandedGroups(newExpanded);
    }
  }, [location.pathname]);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const isGroupActive = (group: MenuGroup) => {
    return group.items.some((item) => location.pathname === item.to);
  };

  const isItemActive = (path: string) => {
    return location.pathname === path;
  };

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
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
            <Fuel className="w-6 h-6 text-app" />
          </div>
          {showText && (
            <div className="overflow-hidden">
              <h2 className="text-lg font-semibold text-[var(--accent)] font-display whitespace-nowrap">
                ระบบปั๊มน้ำมัน
              </h2>
              <p className="text-xs text-muted font-light whitespace-nowrap">บริหารจัดการปั๊มน้ำมัน</p>
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
      <div className={`flex-1 flex flex-col space-y-1 ${showText ? 'w-full pb-6' : ''}`}>
        {/* Dashboard - Single item */}
        <NavLink
          to="/app/gas-station"
          end
          onClick={isMobile ? onClose : undefined}
          className={({ isActive }) =>
            `p-3 rounded-xl hover:panel relative group hover:scale-105 active:scale-95 outline-none focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${isActive ? "panel shadow-md" : ""
            } ${showText ? 'flex items-center gap-3 w-full' : 'justify-center'}`
          }
          style={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              )}
              <Home
                className={`w-5 h-5 flex-shrink-0 group-hover:scale-110 ${isActive ? "text-[var(--accent)]" : "text-muted group-hover:text-app"
                  }`}
                strokeWidth={1.5}
              />
              {showText && (
                <span className={`text-sm font-medium whitespace-nowrap overflow-hidden ${isActive ? "text-[var(--accent)]" : "text-app group-hover:text-app"
                  }`}>
                  Dashboard
                </span>
              )}
            </>
          )}
        </NavLink>

        {/* Menu Groups */}
        {showText && menuGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const isActive = isGroupActive(group);
          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="space-y-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full p-3 rounded-xl hover:panel relative group transition-all ${isActive ? "panel shadow-md" : ""
                  } flex items-center justify-between`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                  )}
                  <GroupIcon
                    className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[var(--accent)]" : "text-muted"
                      }`}
                    strokeWidth={1.5}
                  />
                  <span className={`text-sm font-medium whitespace-nowrap ${isActive ? "text-[var(--accent)]" : "text-app"
                    }`}>
                    {group.label}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />
                )}
              </button>

              {/* Group Items */}
              {isExpanded && (
                <div className="ml-4 space-y-1 border-l-2 border-app/30 pl-2">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const active = isItemActive(item.to);
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={isMobile ? onClose : undefined}
                        className={`p-2.5 rounded-lg hover:bg-app/50 relative group transition-all ${active ? "bg-orange-500/10" : ""
                          } flex items-center gap-3`}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-full" />
                        )}
                        <ItemIcon
                          className={`w-4 h-4 flex-shrink-0 ${active ? "text-orange-500" : "text-muted"
                            }`}
                          strokeWidth={1.5}
                        />
                        <span className={`text-sm whitespace-nowrap ${active ? "text-orange-500 font-medium" : "text-muted"
                          }`}>
                          {item.label}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Section Divider - OTHERS */}
        {showText && (
          <div className="pt-4 pb-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider px-3">OTHERS</p>
          </div>
        )}

        {/* Other Items */}
        {showText && otherItems.map((item) => {
          const ItemIcon = item.icon;
          const active = isItemActive(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={isMobile ? onClose : undefined}
              className={`p-3 rounded-xl hover:panel relative group transition-all ${active ? "panel shadow-md" : ""
                } flex items-center gap-3`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              )}
              <ItemIcon
                className={`w-5 h-5 flex-shrink-0 group-hover:scale-110 ${active ? "text-[var(--accent)]" : "text-muted group-hover:text-app"
                  }`}
                strokeWidth={1.5}
              />
              <span className={`text-sm font-medium whitespace-nowrap ${active ? "text-[var(--accent)]" : "text-app group-hover:text-app"
                }`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* Reports and Settings */}
        {showText && reportItems.map((item) => {
          const ItemIcon = item.icon;
          const active = isItemActive(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={isMobile ? onClose : undefined}
              className={`p-3 rounded-xl hover:panel relative group transition-all ${active ? "panel shadow-md" : ""
                } flex items-center gap-3`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              )}
              <ItemIcon
                className={`w-5 h-5 flex-shrink-0 group-hover:scale-110 ${active ? "text-[var(--accent)]" : "text-muted group-hover:text-app"
                  }`}
                strokeWidth={1.5}
              />
              <span className={`text-sm font-medium whitespace-nowrap ${active ? "text-[var(--accent)]" : "text-app group-hover:text-app"
                }`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* Collapsed view - show only icons */}
        {!showText && (
          <>
            {menuGroups.map((group) => {
              const GroupIcon = group.icon;
              const isActive = isGroupActive(group);
              return (
                <button
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  className={`p-3 rounded-xl hover:panel relative ${isActive ? "panel" : ""
                    } flex justify-center`}
                  title={group.label}
                >
                  <GroupIcon
                    className={`w-5 h-5 ${isActive ? "text-[var(--accent)]" : "text-muted"
                      }`}
                    strokeWidth={1.5}
                  />
                </button>
              );
            })}
            {otherItems.map((item) => {
              const ItemIcon = item.icon;
              const active = isItemActive(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={isMobile ? onClose : undefined}
                  className={`p-3 rounded-xl hover:panel relative flex justify-center ${active ? "panel" : ""
                    }`}
                  title={item.label}
                >
                  <ItemIcon
                    className={`w-5 h-5 ${active ? "text-[var(--accent)]" : "text-muted"
                      }`}
                    strokeWidth={1.5}
                  />
                </NavLink>
              );
            })}
            {reportItems.map((item) => {
              const ItemIcon = item.icon;
              const active = isItemActive(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={isMobile ? onClose : undefined}
                  className={`p-3 rounded-xl hover:panel relative flex justify-center ${active ? "panel" : ""
                    }`}
                  title={item.label}
                >
                  <ItemIcon
                    className={`w-5 h-5 ${active ? "text-[var(--accent)]" : "text-muted"
                      }`}
                    strokeWidth={1.5}
                  />
                </NavLink>
              );
            })}
          </>
        )}
      </div>
    </aside>
  );
}
