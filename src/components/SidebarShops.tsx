import { 
  Home, 
  Settings as SettingsIcon, 
  X,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Camera,
  Target,
  Tag,
  RotateCcw,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useShop } from "@/contexts/ShopContext";

interface SidebarShopsProps {
  onClose?: () => void;
  isMobile?: boolean;
  isExpanded?: boolean;
}

export default function SidebarShops({ onClose, isMobile = false, isExpanded = true }: SidebarShopsProps) {
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
    const baseMenuItems = [
      { to: basePath, icon: Home, label: "Dashboard", end: true },
      { to: `${basePath}/sales`, icon: DollarSign, label: "ยอดขาย", end: false },
      { to: `${basePath}/purchases`, icon: ShoppingCart, label: "การซื้อสินค้าเข้า", end: false },
      { to: `${basePath}/reports`, icon: BarChart3, label: "รายงาน", end: false },
    ];

    // 7-Eleven ไม่มีสต็อก (ตามเอกสาร)
    if (currentShop.id !== "seven-eleven") {
      baseMenuItems.splice(1, 0, { to: `${basePath}/stock`, icon: Package, label: "สต็อกสินค้า", end: false });
    }

    // Add special features for specific shops
    if (currentShop.id === "jiang") {
      baseMenuItems.push(
        { to: `${basePath}/ocr-scan`, icon: Camera, label: "OCR สแกนบิล", end: false },
        { to: `${basePath}/purchase-planning`, icon: Target, label: "วางแผนสั่งซื้อ", end: false }
      );
    }
    
    if (currentShop.id === "jao-sua") {
      baseMenuItems.push(
        { to: `${basePath}/ocr-scan`, icon: Camera, label: "OCR สแกนบิล", end: false },
        { to: `${basePath}/purchase-planning`, icon: Target, label: "วางแผนสั่งซื้อ", end: false },
        { to: `${basePath}/promotions`, icon: Tag, label: "โปรโมชัน", end: false },
        { to: `${basePath}/product-returns`, icon: RotateCcw, label: "คืนสินค้า", end: false }
      );
    }

    baseMenuItems.push(
      { to: `${basePath}/settings`, icon: SettingsIcon, label: "ตั้งค่า", end: false }
    );

    return baseMenuItems;
  };

  const items = getMenuItems();
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
            <Store className="w-6 h-6 text-app" />
          </div>
          {showText && (
            <div className="overflow-hidden">
              <h2 className="text-lg font-semibold text-[var(--accent)] font-display whitespace-nowrap">
                {currentShop ? currentShop.name : "ร้านค้าในพื้นที่เช่า"}
              </h2>
              <p className="text-xs text-muted font-light whitespace-nowrap">ระบบจัดการ</p>
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

