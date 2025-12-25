import { GasStationProvider } from "@/contexts/GasStationContext";
import Orders from "@/pages/gas-station/Orders";

/**
 * Reuse Gas Station "ใบสั่งซื้อจากปตท." UI inside Delivery module.
 * This wrapper exists because Orders.tsx depends on GasStationContext.
 */
export default function DeliveryPTTOrders() {
  return (
    <GasStationProvider>
      <Orders />
    </GasStationProvider>
  );
}


