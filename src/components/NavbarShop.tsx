import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Menu, Store, LogOut, Settings, Filter, Sun, Moon, Monitor } from "lucide-react";
import { logout } from "@/lib/auth";
import { useShop } from "@/contexts/ShopContext";

const branches = [
  { id: "1", name: "สาขา 1" },
  { id: "2", name: "สาขา 2" },
  { id: "3", name: "สาขา 3" },
  { id: "4", name: "สาขา 4" },
  { id: "5", name: "สาขา 5" },
];

interface NavbarShopProps {
  onMenuClick?: () => void;
}

export default function NavbarShop({ onMenuClick }: NavbarShopProps) {
  const navigate = useNavigate();
  const { currentShop, shops, setCurrentShop } = useShop();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBranchFilterOpen, setIsBranchFilterOpen] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(branches.map(b => b.id));
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const branchRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleShopSelect = (shop: typeof shops[0]) => {
    setCurrentShop(shop);
    navigate(shop.path);
    setIsDropdownOpen(false);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    }
  };

  const toggleBranch = (branchId: string) => {
    setSelectedBranches(prev =>
      prev.includes(branchId)
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };

  const toggleAll = () => {
    setSelectedBranches(prev =>
      prev.length === branches.length ? [] : branches.map(b => b.id)
    );
  };

  const displayShop = currentShop || shops[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (branchRef.current && !branchRef.current.contains(event.target as Node)) {
        setIsBranchFilterOpen(false);
      }
    };

    if (isDropdownOpen || isProfileOpen || isBranchFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isProfileOpen, isBranchFilterOpen]);

  return (
    <header className="flex items-center h-14 px-4 md:px-6 bg-[var(--bg)] border-b border-app">
      <div className="flex-1 flex items-center">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-soft rounded-lg transition-all hover:scale-110 active:scale-95 flex-shrink-0"
            aria-label="เปิดเมนู"
            title="เปิดเมนู"
          >
            <Menu className="w-5 h-5 text-muted" />
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white font-medium shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all"
            style={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Store className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
            <span className="hidden sm:inline whitespace-nowrap">{displayShop.name}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-[var(--bg)] border border-app rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="py-2">
                {shops.map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => handleShopSelect(shop)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft transition-colors ${currentShop?.id === shop.id
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

      <div className="flex-1 flex items-center justify-end gap-2 pl-4">
        <div className="relative flex-shrink-0" ref={branchRef}>
          <button
            onClick={() => setIsBranchFilterOpen(!isBranchFilterOpen)}
            className="p-2 hover:bg-soft rounded-lg transition-all hover:scale-110 active:scale-95 relative"
            title="กรองตามสาขา"
          >
            <Filter className="w-4 h-4 text-emerald-600" />
            {selectedBranches.length > 0 && selectedBranches.length < branches.length && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary)] text-white text-xs rounded-full flex items-center justify-center">
                {selectedBranches.length}
              </span>
            )}
          </button>

          {isBranchFilterOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--bg)] border border-app rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="py-2">
                <div className="px-4 py-2 border-b border-app">
                  <p className="text-xs font-semibold text-muted">กรองตามสาขา</p>
                </div>
                <button
                  onClick={toggleAll}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft transition-colors"
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedBranches.length === branches.length
                    ? "bg-[var(--primary)] border-[var(--primary)]"
                    : "border-app"
                    }`}>
                    {selectedBranches.length === branches.length && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium text-app">ทั้งหมด</span>
                </button>
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => toggleBranch(branch.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft transition-colors"
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedBranches.includes(branch.id)
                      ? "bg-[var(--primary)] border-[var(--primary)]"
                      : "border-app"
                      }`}>
                      {selectedBranches.includes(branch.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-app">{branch.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-app" />

        <div className="relative flex-shrink-0" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 hover:bg-soft rounded-lg transition-all hover:scale-105 active:scale-95"
            title="โปรไฟล์"
          >
            <img
              src="https://ui-avatars.com/api/?name=PTT+User&background=2867e0&color=fff"
              alt="Profile"
              className="w-7 h-7 rounded-full ring-2 ring-ptt-blue/20 flex-shrink-0"
            />
            <ChevronDown
              className={`w-3 h-3 text-muted transition-transform duration-200 flex-shrink-0 ${isProfileOpen ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-[var(--bg)] border border-app rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-app bg-soft/50">
                <div className="flex items-center gap-3">
                  <img
                    src="https://ui-avatars.com/api/?name=PTT+User&background=2867e0&color=fff"
                    alt="Profile"
                    className="w-12 h-12 rounded-full ring-2 ring-ptt-blue/20"
                  />
                  <div>
                    <p className="text-sm font-semibold text-app">PTT User</p>
                    <p className="text-xs text-muted">user@ptt.com</p>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-muted mb-2">ธีม</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${theme === "light" ? "bg-[var(--primary)]/10 text-[var(--accent)]" : "hover:bg-soft text-muted"
                        }`}
                    >
                      <Sun className="w-4 h-4" />
                      <span className="text-xs">สว่าง</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${theme === "dark" ? "bg-[var(--primary)]/10 text-[var(--accent)]" : "hover:bg-soft text-muted"
                        }`}
                    >
                      <Moon className="w-4 h-4" />
                      <span className="text-xs">มืด</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange("system")}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${theme === "system" ? "bg-[var(--primary)]/10 text-[var(--accent)]" : "hover:bg-soft text-muted"
                        }`}
                    >
                      <Monitor className="w-4 h-4" />
                      <span className="text-xs">ระบบ</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-app my-2" />

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/app/settings");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft transition-colors text-app"
                >
                  <Settings className="w-4 h-4" strokeWidth={2} />
                  <span className="text-sm">ตั้งค่า</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft transition-colors text-ptt-red"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2} />
                  <span className="text-sm">ออกจากระบบ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
