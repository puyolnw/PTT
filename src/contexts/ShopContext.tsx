import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { Shop, shops } from "@/data/shops";

interface ShopContextType {
  currentShop: Shop | null;
  setCurrentShop: (shop: Shop | null) => void;
  shops: Shop[];
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);

  // Detect shop from URL path
  useEffect(() => {
    const shop = shops.find(s => location.pathname.startsWith(s.path));
    if (shop) {
      setCurrentShop(shop);
    } else if (location.pathname === "/app/shops") {
      // On main dashboard, no shop selected
      setCurrentShop(null);
    }
  }, [location.pathname]);

  return (
    <ShopContext.Provider value={{ currentShop, setCurrentShop, shops }}>
      {children}
    </ShopContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}

