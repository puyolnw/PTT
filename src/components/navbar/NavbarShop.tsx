import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Menu, Store } from "lucide-react";
import { useShop } from "@/contexts/ShopContext";
import { useAuth } from "@/contexts/AuthContext";
import { branches } from "./constants";
import BranchFilter from "./BranchFilter";
import ProfileDropdown from "./ProfileDropdown";

interface NavbarShopProps {
    onMenuClick?: () => void;
}

export default function NavbarShop({ onMenuClick }: NavbarShopProps) {
    const navigate = useNavigate();
    const { currentShop, shops, setCurrentShop } = useShop();
    const { user } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedBranches, setSelectedBranches] = useState<string[]>(branches.map(b => b.id));

    const currentUser: import("./types").UserProfile = user ? {
        name: user.username || "User",
        email: user.email || "user@ptt.com",
        role: user.role as string || "employee",
        avatar: undefined
    } : {
        name: "PTT User",
        email: "user@ptt.com",
        role: "employee"
    };

    const handleShopSelect = (shop: typeof shops[0]) => {
        setCurrentShop(shop);
        navigate(shop.path);
        setIsDropdownOpen(false);
    };

    const displayShop = currentShop || shops[0];

    return (
        <header className="flex items-center h-14 px-4 md:px-6 bg-[var(--bg)] border-b border-app">
            <div className="flex-1 flex items-center pr-4">
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
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white font-medium shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all duration-300 ease-in-out"
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
                <BranchFilter
                    selectedBranches={selectedBranches}
                    onBranchesChange={setSelectedBranches}
                />

                <div className="w-px h-6 bg-app" />

                <ProfileDropdown user={currentUser} />
            </div>
        </header>
    );
}
