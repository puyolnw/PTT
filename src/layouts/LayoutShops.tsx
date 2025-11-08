import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SidebarShops from "@/components/SidebarShops";
import NavbarShop from "@/components/NavbarShop";
import { ShopProvider } from "@/contexts/ShopContext";

export default function LayoutShops() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Prevent body scroll when mobile menu is open
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

  // Handle ESC key to close mobile menu
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

  return (
    <ShopProvider>
      {/* Desktop Sidebar - Full Height with Animation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.16, 1, 0.3, 1]
        }}
        className="hidden md:flex"
      >
        <SidebarShops />
      </motion.div>

      {/* Mobile Sidebar Drawer - Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Dark Scrim/Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={closeMobileMenu}
            aria-hidden="true"
            style={{ 
              transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />

          {/* Mobile Drawer */}
          <div
            className="fixed left-0 top-0 bottom-0 z-50 md:hidden animate-slide-in-left shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
            style={{
              willChange: 'transform'
            }}
          >
            <SidebarShops onClose={closeMobileMenu} isMobile={true} />
          </div>
        </>
      )}

      {/* Right Side: Navbar + Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar with Shop Dropdown */}
        <NavbarShop onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        {/* Main Content Area */}
        <main className="flex-1 px-4 py-4 md:px-8 md:py-8 bg-app overflow-auto">
          <Outlet />
        </main>
      </div>
    </ShopProvider>
  );
}
