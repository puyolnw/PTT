import { RouteObject } from "react-router-dom";
import LayoutGasStation from "@/layouts/LayoutGasStation";


import GasStationDashboard from "@/pages/gas-station/Dashboard";
import StationOrder from "@/pages/gas-station/StationOrder";
import Orders from "@/pages/gas-station/Orders";
import OrderManagement from "@/pages/gas-station/OrderManagement";
import Payments from "@/pages/gas-station/Payments";
import Sales from "@/pages/gas-station/Sales";
import UndergroundBook from "@/pages/gas-station/UndergroundBook";
import UndergroundMeasurement from "@/pages/gas-station/UndergroundMeasurement";
import PendingBook from "@/pages/gas-station/PendingBook";
import BalancePetrol from "@/pages/gas-station/BalancePetrol";
import BalancePetrolMonthly from "@/pages/gas-station/BalancePetrolMonthly";
import PurchaseBook from "@/pages/gas-station/PurchaseBook";
import WholesaleBook from "@/pages/gas-station/WholesaleBook";
import ControlSheet from "@/pages/gas-station/ControlSheet";
import TankEntryBook from "@/pages/gas-station/TankEntryBook";
import RecordTankEntry from "@/pages/gas-station/RecordTankEntry";
import OilTransfer from "@/pages/gas-station/OilTransfer";
import QualityTest from "@/pages/gas-station/QualityTest";
import DepositSlips from "@/pages/gas-station/DepositSlips";
import Lubricants from "@/pages/gas-station/Lubricants";
import Gas from "@/pages/gas-station/Gas";
import ReceiveFromBranch from "@/pages/gas-station/ReceiveFromBranch";
import EngineOil from "@/pages/gas-station/EngineOil";
import StationProducts from "@/pages/gas-station/StationProducts";
import POS from "@/pages/gas-station/POS";
import PriceAdjustment from "@/pages/gas-station/PriceAdjustment";
import Reports from "@/pages/gas-station/Reports";
import GasStationSettings from "@/pages/gas-station/Settings";
import Stock from "@/pages/gas-station/Stock";
import UpdateStock from "@/pages/gas-station/UpdateStock";
import StockUpdateHistory from "@/pages/gas-station/StockUpdateHistory";
import ProductSalesHistory from "@/pages/gas-station/ProductSalesHistory";
import SalesInstrumentReport from "@/pages/gas-station/SalesInstrumentReport";
import OilDeficitReport from "@/pages/gas-station/OilDeficitReport";
import OilDeficitMonthly from "@/pages/gas-station/OilDeficitMonthly";
import TruckSales from "@/pages/gas-station/TruckSales";
import TruckProfiles from "@/pages/gas-station/TruckProfiles";
import TruckDashboard from "@/pages/gas-station/TruckDashboard";
import TruckProfileDetail from "@/pages/gas-station/TruckProfileDetail";
import TrailerProfiles from "@/pages/gas-station/TrailerProfiles";
import TrailerProfileDetail from "@/pages/gas-station/TrailerProfileDetail";
import TruckOrders from "@/pages/gas-station/TruckOrders";
import TransportDelivery from "@/pages/gas-station/TransportDelivery";
import LubricantsDashboard from "@/pages/gas-station/LubricantsDashboard";
import AccountingExport from "@/pages/gas-station/AccountingExport";
import POGeneration from "@/pages/gas-station/POGeneration";
import DriverApp from "@/pages/gas-station/DriverApp";
import Quotation from "@/pages/gas-station/Quotation";
import DeliveryNote from "@/pages/gas-station/DeliveryNote";
import Receipt from "@/pages/gas-station/Receipt";
import OilReceipt from "@/pages/gas-station/OilReceipt";
import BranchOilReceipt from "@/pages/gas-station/BranchOilReceipt";
import InternalOilOrder from "@/pages/gas-station/InternalOilOrder";
import InternalOilOrderManagement from "@/pages/gas-station/InternalOilOrderManagement";
import InternalTransport from "@/pages/gas-station/InternalTransport";
import ReceiveOil from "@/pages/gas-station/ReceiveOil";
import InterBranchTransfer from "@/pages/gas-station/InterBranchTransfer";

export const gasStationRoutes: RouteObject = {
    path: "gas-station",
    element: <LayoutGasStation />,
    children: [
        {
            index: true,
            element: <GasStationDashboard />,
        },
        {
            path: "station-order",
            element: <StationOrder />,
        },
        {
            path: "orders",
            element: <Orders />,
        },
        {
            path: "order-management",
            element: <OrderManagement />,
        },

        {
            path: "receive-from-branch",
            element: <ReceiveFromBranch />,
        },
        {
            path: "truck-sales",
            element: <TruckSales />,
        },
        {
            path: "truck-profiles",
            element: <TruckProfiles />,
        },
        {
            path: "truck-profiles/:id",
            element: <TruckProfileDetail />,
        },
        {
            path: "trailer-profiles",
            element: <TrailerProfiles />,
        },
        {
            path: "trailer-profiles/:id",
            element: <TrailerProfileDetail />,
        },
        {
            path: "truck-orders",
            element: <TruckOrders />,
        },
        {
            path: "truck-dashboard",
            element: <TruckDashboard />,
        },
        {
            path: "transport-delivery",
            element: <TransportDelivery />,
        },
        {
            path: "driver-app",
            element: <DriverApp />,
        },
        {
            path: "quotation",
            element: <Quotation />,
        },
        {
            path: "delivery-note",
            element: <DeliveryNote />,
        },
        {
            path: "receipt",
            element: <Receipt />,
        },
        {
            path: "oil-receipt",
            element: <OilReceipt />,
        },
        {
            path: "branch-oil-receipt",
            element: <BranchOilReceipt />,
        },
        {
            path: "internal-oil-order",
            element: <InternalOilOrder />,
        },
        {
            path: "internal-oil-order-management",
            element: <InternalOilOrderManagement />,
        },
        {
            path: "internal-transport",
            element: <InternalTransport />,
        },
        {
            path: "receive-oil",
            element: <ReceiveOil />,
        },
        {
            path: "inter-branch-transfer",
            element: <InterBranchTransfer />,
        },
        {
            path: "lubricants-dashboard",
            element: <LubricantsDashboard />,
        },
        {
            path: "accounting-export",
            element: <AccountingExport />,
        },
        {
            path: "po-generation",
            element: <POGeneration />,
        },
        {
            path: "payments",
            element: <Payments />,
        },
        {
            path: "sales",
            element: <Sales />,
        },
        {
            path: "underground-book",
            element: <UndergroundBook />,
        },
        {
            path: "underground-measurement",
            element: <UndergroundMeasurement />,
        },
        {
            path: "pending-book",
            element: <PendingBook />,
        },
        {
            path: "balance-petrol",
            element: <BalancePetrol />,
        },
        {
            path: "balance-petrol-monthly",
            element: <BalancePetrolMonthly />,
        },
        {
            path: "purchase-book",
            element: <PurchaseBook />,
        },
        {
            path: "wholesale-book",
            element: <WholesaleBook />,
        },
        {
            path: "control-sheet",
            element: <ControlSheet />,
        },
        {
            path: "tank-entry-book",
            element: <TankEntryBook />,
        },
        {
            path: "record-tank-entry",
            element: <RecordTankEntry />,
        },
        {
            path: "oil-transfer",
            element: <OilTransfer />,
        },
        {
            path: "oil-deficit-monthly",
            element: <OilDeficitMonthly />,
        },
        {
            path: "quality-test",
            element: <QualityTest />,
        },
        {
            path: "deposit-slips",
            element: <DepositSlips />,
        },
        {
            path: "lubricants",
            element: <Lubricants />,
        },
        {
            path: "gas",
            element: <Gas />,
        },
        {
            path: "engine-oil",
            element: <EngineOil />,
        },
        {
            path: "station-products",
            element: <StationProducts />,
        },
        {
            path: "pos",
            element: <POS />,
        },
        {
            path: "price-adjustment",
            element: <PriceAdjustment />,
        },
        {
            path: "stock",
            element: <Stock />,
        },
        {
            path: "update-stock",
            element: <UpdateStock />,
        },
        {
            path: "stock-update-history",
            element: <StockUpdateHistory />,
        },
        {
            path: "product-sales-history",
            element: <ProductSalesHistory />,
        },
        {
            path: "reports",
            element: <Reports />,
        },
        {
            path: "sales-instrument-report",
            element: <SalesInstrumentReport />,
        },
        {
            path: "oil-deficit-report",
            element: <OilDeficitReport />,
        },
        {
            path: "settings",
            element: <GasStationSettings />,
        },
    ],
};
