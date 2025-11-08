import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";

export type ShopId = "seven-eleven" | "pung-ngee-chiang" | "jao-sua" | null;

export interface Shop {
  id: ShopId;
  name: string;
  path: string;
}

export const shops: Shop[] = [
  { id: "seven-eleven", name: "เซเว่น (7-Eleven)", path: "/app/shops/seven-eleven" },
  { id: "pung-ngee-chiang", name: "ปึงหงี่เชียง", path: "/app/shops/pung-ngee-chiang" },
  { id: "jao-sua", name: "เจ้าสัว", path: "/app/shops/jao-sua" },
];

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

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}

