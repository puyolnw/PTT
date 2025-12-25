import type { ReactNode } from "react";
import { GasStationProvider } from "@/contexts/GasStationContext";

export default function GasStationWrap({ children }: { children: ReactNode }) {
  return (
    <GasStationProvider>
      {/* Some gas-station pages render their own full-screen container; this keeps them working inside Delivery */}
      {children}
    </GasStationProvider>
  );
}


