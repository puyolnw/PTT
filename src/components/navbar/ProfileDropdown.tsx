import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { logout } from "@/lib/auth";
import ThemeSelector from "./ThemeSelector";
import { UserProfile } from "./types";

interface ProfileDropdownProps {
    user: UserProfile;
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");
    const ref = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate("/");
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2867e0&color=fff`;

    return (
        <div className="relative flex-shrink-0" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 hover:bg-soft rounded-lg transition-all hover:scale-105 active:scale-95"
                title="โปรไฟล์"
            >
                <img
                    src={avatar}
                    alt="Profile"
                    className="w-7 h-7 rounded-full ring-2 ring-ptt-blue/20 flex-shrink-0"
                />
                <ChevronDown
                    className={`w-3 h-3 text-muted transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-[var(--bg)] border border-app rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-app bg-soft/50">
                        <div className="flex items-center gap-3">
                            <img
                                src={avatar}
                                alt="Profile"
                                className="w-12 h-12 rounded-full ring-2 ring-ptt-blue/20"
                            />
                            <div>
                                <p className="text-sm font-semibold text-app">{user.name}</p>
                                <p className="text-xs text-muted">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="py-2">
                        <ThemeSelector theme={theme} onThemeChange={handleThemeChange} />

                        <div className="border-t border-app my-2" />

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate("/app/settings");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-soft transition-colors text-app"
                        >
                            <Settings className="w-4 h-4" strokeWidth={2} />
                            <span className="text-sm">ตั้งค่า</span>
                        </button>
                        <button
                            onClick={() => {
                                setIsOpen(false);
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
    );
}
