import { 
  Home, 
  Settings as SettingsIcon, 
  X,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useShop } from "@/contexts/ShopContext";

interface SidebarShopsProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export default function SidebarShops({ onClose, isMobile = false }: SidebarShopsProps) {
  const { currentShop } = useShop();

  // Menu items based on selected shop
  const getMenuItems = () => {
    if (!currentShop) {
      // Main dashboard - show shop selection
      return [
        { to: "/app/shops", icon: Home, label: "Dashboard", end: true },
      ];
    }

    // Shop-specific menu items
    const basePath = currentShop.path;
    return [
      { to: basePath, icon: Home, label: "Dashboard", end: true },
      { to: `${basePath}/stock`, icon: Package, label: "สต็อกสินค้า", end: false },
      { to: `${basePath}/sales`, icon: DollarSign, label: "ยอดขาย", end: false },
      { to: `${basePath}/purchases`, icon: ShoppingCart, label: "การซื้อสินค้าเข้า", end: false },
      { to: `${basePath}/reports`, icon: BarChart3, label: "รายงาน", end: false },
      { to: `${basePath}/settings`, icon: SettingsIcon, label: "ตั้งค่า", end: false },
    ];
  };

  const items = getMenuItems();

  return (
    <aside 
      className={`
        ${isMobile ? 'w-64' : 'w-16'} 
        bg-[var(--bg)]
        flex flex-col 
        ${isMobile ? 'items-start px-4' : 'items-center'} 
        py-4 
        border-r border-app
        h-full
        ${isMobile ? 'overflow-y-auto scrollbar-hide' : ''}
      `}
    >
      {/* Header - Logo/Brand + Close button (mobile) */}
      <div className={`mb-6 ${isMobile ? 'w-full flex items-center justify-between' : 'p-2'}`}>
        <div className={`flex items-center gap-3 ${isMobile ? 'flex-1' : ''}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-ptt-blue to-ptt-cyan rounded-xl flex items-center justify-center shadow-lg shadow-ptt-blue/20">
            <Store className="w-6 h-6 text-app" />
          </div>
          {isMobile && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--accent)] font-display">
                {currentShop ? currentShop.name : "ร้านค้าในพื้นที่เช่า"}
              </h2>
              <p className="text-xs text-muted font-light">ระบบจัดการ</p>
            </div>
          )}
        </div>
        
        {/* Close button - Mobile only */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:panel rounded-lg transition-all hover:scale-110 active:scale-95 hover:rotate-90"
            aria-label="ปิดเมนู"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className={`flex-1 flex flex-col space-y-2 ${isMobile ? 'w-full pb-6' : ''}`}>
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
              } ${isMobile ? 'flex items-center gap-3 w-full' : ''}`
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
                  className={`w-5 h-5 group-hover:scale-110 ${
                    isActive ? "text-[var(--accent)]" : "text-muted group-hover:text-app"
                  }`}
                  strokeWidth={1.5}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                />

                {/* Label - Mobile only */}
                {isMobile && (
                  <span 
                    className={`text-sm font-medium ${
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

