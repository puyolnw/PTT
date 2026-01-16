import AppLayout from "./components/AppLayout";
import SidebarShops from "@/components/sidebar/SidebarShops";
import NavbarShop from "@/components/navbar/NavbarShop";
import { ShopProvider } from "@/contexts/ShopContext";

export default function LayoutShops() {
  return (
    <AppLayout
      SidebarComponent={SidebarShops}
      NavbarComponent={NavbarShop}
      LayoutWrapper={ShopProvider}
      requiredRoles={["shop", "admin", "manager"]}
    />
  );
}
