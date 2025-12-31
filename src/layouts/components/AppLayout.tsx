import { ReactNode, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import ToggleButton from "./ToggleButton";
import MobileDrawer from "./MobileDrawer";
import { useSidebarLayout } from "../hooks/useSidebarLayout";

interface AppLayoutProps {
    SidebarComponent: React.ComponentType<{
        isExpanded?: boolean;
        onClose?: () => void;
        isMobile?: boolean;
    }>;
    ContentWrapper?: React.ComponentType<{ children: ReactNode }>;
    NavbarComponent?: React.ComponentType<{ onMenuClick?: () => void }>;
    LayoutWrapper?: React.ComponentType<{ children: ReactNode }>;
    requiredRoles?: string[];
}

export default function AppLayout({ SidebarComponent, ContentWrapper, NavbarComponent, LayoutWrapper, requiredRoles }: AppLayoutProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Check permissions
    useEffect(() => {
        if (!user) return; // Protected route will handle redirect if no user

        // Admin access everything
        if (user.role === "admin") return;

        if (requiredRoles && requiredRoles.length > 0) {
            const hasPermission = requiredRoles.includes(user.role);
            if (!hasPermission) {
                console.warn(`User role ${user.role} does not have permission. Required: ${requiredRoles.join(", ")}`);
                // ไม่ Logout แต่พาไปหน้า Forbidden แทน
                navigate("/app/forbidden", { replace: true });
            }
        }
    }, [user, requiredRoles, logout, navigate]);

    const {
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isSidebarExpanded,
        closeMobileMenu,
        toggleSidebar
    } = useSidebarLayout();

    const content = <Outlet />;
    const NavbarToUse = NavbarComponent || Navbar;

    const layoutContent = (
        <>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1]
                }}
                className="hidden md:flex relative overflow-visible"
            >
                <SidebarComponent isExpanded={isSidebarExpanded} />
            </motion.div>

            <ToggleButton isExpanded={isSidebarExpanded} onToggle={toggleSidebar} />

            <MobileDrawer isOpen={isMobileMenuOpen} onClose={closeMobileMenu}>
                <SidebarComponent onClose={closeMobileMenu} isMobile={true} />
            </MobileDrawer>

            <div className="flex-1 flex flex-col overflow-hidden">
                <NavbarToUse onMenuClick={() => setIsMobileMenuOpen(true)} />

                <main className="flex-1 px-4 py-4 md:px-8 md:py-8 bg-app overflow-auto">
                    {ContentWrapper ? (
                        <ContentWrapper>{content}</ContentWrapper>
                    ) : (
                        content
                    )}
                </main>
            </div>
        </>
    );

    return LayoutWrapper ? <LayoutWrapper>{layoutContent}</LayoutWrapper> : layoutContent;
}
