import { Sun, Moon, Monitor } from "lucide-react";

interface ThemeSelectorProps {
    theme: string;
    onThemeChange: (theme: string) => void;
}

export default function ThemeSelector({ theme, onThemeChange }: ThemeSelectorProps) {
    return (
        <div className="px-4 py-2">
            <p className="text-xs font-semibold text-muted mb-2">ธีม</p>
            <div className="grid grid-cols-3 gap-2">
                <button
                    onClick={() => onThemeChange("light")}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${theme === "light" ? "bg-[var(--primary)]/10 text-[var(--accent)]" : "hover:bg-soft text-muted"
                        }`}
                >
                    <Sun className="w-4 h-4" />
                    <span className="text-xs">สว่าง</span>
                </button>
                <button
                    onClick={() => onThemeChange("dark")}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${theme === "dark" ? "bg-[var(--primary)]/10 text-[var(--accent)]" : "hover:bg-soft text-muted"
                        }`}
                >
                    <Moon className="w-4 h-4" />
                    <span className="text-xs">มืด</span>
                </button>
                <button
                    onClick={() => onThemeChange("system")}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${theme === "system" ? "bg-[var(--primary)]/10 text-[var(--accent)]" : "hover:bg-soft text-muted"
                        }`}
                >
                    <Monitor className="w-4 h-4" />
                    <span className="text-xs">ระบบ</span>
                </button>
            </div>
        </div>
    );
}
