import { NavLink } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getModulesForRole } from "./constants";
import BranchFilter from "./BranchFilter";
import ProfileDropdown from "./ProfileDropdown";
import { useBranch } from "@/contexts/BranchContext";

interface NavbarProps {
    onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const { user } = useAuth();
    // Use BranchContext
    const { selectedBranches, setSelectedBranches } = useBranch();

    const currentUser = user || {
        name: "PTT User",
        email: "user@ptt.com",
        role: "employee"
    };

    const visibleModules = getModulesForRole(currentUser.role);

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

            <nav className="flex gap-1 md:gap-2 justify-center">
                {visibleModules.map((mod) => (
                    <NavLink
                        key={mod.path}
                        to={mod.path}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive
                                ? "bg-[var(--primary)] text-white font-medium shadow-md hover:shadow-lg hover:brightness-110 active:scale-95"
                                : "text-muted hover:bg-soft hover:text-app hover:scale-105 active:scale-95"
                            }`
                        }
                        style={{
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <mod.icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                        <span className="hidden md:inline whitespace-nowrap">{mod.name}</span>
                    </NavLink>
                ))}
            </nav>

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
