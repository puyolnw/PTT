import { useState, useEffect } from "react";

export function useSidebarLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
        const saved = localStorage.getItem("sidebarExpanded");
        return saved !== null ? JSON.parse(saved) : true;
    });

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const toggleSidebar = () => {
        setIsSidebarExpanded((prev: boolean) => {
            const newValue = !prev;
            localStorage.setItem("sidebarExpanded", JSON.stringify(newValue));
            return newValue;
        });
    };

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.classList.add("mobile-menu-open");
        } else {
            document.body.classList.remove("mobile-menu-open");
        }

        return () => {
            document.body.classList.remove("mobile-menu-open");
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const handleEscKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isMobileMenuOpen) {
                closeMobileMenu();
            }
        };

        document.addEventListener("keydown", handleEscKey);
        return () => {
            document.removeEventListener("keydown", handleEscKey);
        };
    }, [isMobileMenuOpen]);

    return {
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isSidebarExpanded,
        closeMobileMenu,
        toggleSidebar,
    };
}
