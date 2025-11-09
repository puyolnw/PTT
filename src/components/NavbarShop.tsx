import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Menu, Store, Bell, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";
import { useShop } from "@/contexts/ShopContext";

interface NavbarShopProps {
  onMenuClick?: () => void;
  onSidebarToggle?: () => void;
}

export default function NavbarShop({ onMenuClick, onSidebarToggle }: NavbarShopProps) {
  const navigate = useNavigate();
  const { currentShop, shops, setCurrentShop } = useShop();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleShopSelect = (shop: typeof shops[0]) => {
    setCurrentShop(shop);
    navigate(shop.path);
    setIsDropdownOpen(false);
  };

  // Get display shop (current shop or default to first shop)
  const displayShop = currentShop || shops[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="flex items-center justify-between h-14 px-4 md:px-6 bg-[var(--bg)] border-b border-app">
      {/* Left: Hamburger Menu */}
      <div className="flex-1 flex items-center">
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-soft rounded-lg transition-all hover:scale-110 active:scale-95"
            aria-label="เปิดเมนู"
            title="เปิดเมนู"
          >
            <Menu className="w-5 h-5 text-muted" />
          </button>
        )}
        
        {/* Desktop Sidebar Toggle Button */}
        {onSidebarToggle && (
          <button
            onClick={onSidebarToggle}
            className="hidden md:flex p-2 hover:bg-soft rounded-lg transition-all hover:scale-110 active:scale-95"
            aria-label="เปิด/ปิดเมนู"
            title="เปิด/ปิดเมนู"
          >
            <Menu className="w-5 h-5 text-muted" />
          </button>
        )}
      </div>

      {/* Center: Shop Dropdown */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white font-medium shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all"
            style={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Store className="w-4 h-4" strokeWidth={2} />
            <span className="hidden sm:inline">{displayShop.name}</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              strokeWidth={2} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-[var(--bg)] border border-app rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="py-2">
                {shops.map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => handleShopSelect(shop)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft transition-colors ${
                      currentShop?.id === shop.id
                        ? "bg-[var(--primary)]/10 text-[var(--accent)] font-medium"
                        : "text-app"
                    }`}
                  >
                    <Store className="w-4 h-4" strokeWidth={2} />
                    <span className="text-sm">{shop.name}</span>
                    {currentShop?.id === shop.id && (
                      <span className="ml-auto text-[var(--primary)]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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

