import { RouteObject } from "react-router-dom";
import LayoutShops from "@/layouts/LayoutShops";


import ShopsDashboard from "@/pages/shops/Dashboard";
import PungNgeeChiangDashboard from "@/pages/shops/pung-ngee-chiang/Dashboard";
import PungNgeeChiangStock from "@/pages/shops/pung-ngee-chiang/Stock";
import PungNgeeChiangSales from "@/pages/shops/pung-ngee-chiang/Sales";
import PungNgeeChiangPurchases from "@/pages/shops/pung-ngee-chiang/Purchases";
import PungNgeeChiangReports from "@/pages/shops/pung-ngee-chiang/Reports";
import PungNgeeChiangSettings from "@/pages/shops/pung-ngee-chiang/Settings";
import SevenElevenDashboard from "@/pages/shops/seven-eleven/Dashboard";
import SevenElevenSales from "@/pages/shops/seven-eleven/Sales";
import SevenElevenPurchases from "@/pages/shops/seven-eleven/Purchases";
import SevenElevenReports from "@/pages/shops/seven-eleven/Reports";
import SevenElevenSettings from "@/pages/shops/seven-eleven/Settings";
import JiangDashboard from "@/pages/shops/jiang/Dashboard";
import JiangStock from "@/pages/shops/jiang/Stock";
import JiangSales from "@/pages/shops/jiang/Sales";
import JiangPurchases from "@/pages/shops/jiang/Purchases";
import JiangReports from "@/pages/shops/jiang/Reports";
import JiangSettings from "@/pages/shops/jiang/Settings";
import JiangOCRScan from "@/pages/shops/jiang/OCRScan";
import JiangPurchasePlanning from "@/pages/shops/jiang/PurchasePlanning";
import JaoSuaDashboard from "@/pages/shops/jao-sua/Dashboard";
import JaoSuaStock from "@/pages/shops/jao-sua/Stock";
import JaoSuaSales from "@/pages/shops/jao-sua/Sales";
import JaoSuaPurchases from "@/pages/shops/jao-sua/Purchases";
import JaoSuaReports from "@/pages/shops/jao-sua/Reports";
import JaoSuaSettings from "@/pages/shops/jao-sua/Settings";
import JaoSuaOCRScan from "@/pages/shops/jao-sua/OCRScan";
import JaoSuaPromotions from "@/pages/shops/jao-sua/Promotions";
import JaoSuaProductReturns from "@/pages/shops/jao-sua/ProductReturns";
import JaoSuaPurchasePlanning from "@/pages/shops/jao-sua/PurchasePlanning";
import FitAutoDashboard from "@/pages/shops/fit-auto/Dashboard";
import FitAutoStock from "@/pages/shops/fit-auto/Stock";
import FitAutoSales from "@/pages/shops/fit-auto/Sales";
import FitAutoPurchases from "@/pages/shops/fit-auto/Purchases";
import FitAutoReports from "@/pages/shops/fit-auto/Reports";
import FitAutoSettings from "@/pages/shops/fit-auto/Settings";
import ChesterDashboard from "@/pages/shops/chester/Dashboard";
import ChesterStock from "@/pages/shops/chester/Stock";
import ChesterSales from "@/pages/shops/chester/Sales";
import ChesterPurchases from "@/pages/shops/chester/Purchases";
import ChesterReports from "@/pages/shops/chester/Reports";
import ChesterSettings from "@/pages/shops/chester/Settings";
import DaisoDashboard from "@/pages/shops/daiso/Dashboard";
import DaisoStock from "@/pages/shops/daiso/Stock";
import DaisoSales from "@/pages/shops/daiso/Sales";
import DaisoPurchases from "@/pages/shops/daiso/Purchases";
import DaisoReports from "@/pages/shops/daiso/Reports";
import DaisoSettings from "@/pages/shops/daiso/Settings";
import QuickDashboard from "@/pages/shops/quick/Dashboard";
import QuickStock from "@/pages/shops/quick/Stock";
import QuickSales from "@/pages/shops/quick/Sales";
import QuickPurchases from "@/pages/shops/quick/Purchases";
import QuickReports from "@/pages/shops/quick/Reports";
import QuickSettings from "@/pages/shops/quick/Settings";
import EVMotorbikeDashboard from "@/pages/shops/ev-motorbike/Dashboard";
import EVMotorbikeStock from "@/pages/shops/ev-motorbike/Stock";
import EVMotorbikeSales from "@/pages/shops/ev-motorbike/Sales";
import EVMotorbikePurchases from "@/pages/shops/ev-motorbike/Purchases";
import EVMotorbikeReports from "@/pages/shops/ev-motorbike/Reports";
import EVMotorbikeSettings from "@/pages/shops/ev-motorbike/Settings";
import OtopDashboard from "@/pages/shops/otop/Dashboard";
import OtopStock from "@/pages/shops/otop/Stock";
import OtopSales from "@/pages/shops/otop/Sales";
import OtopPurchases from "@/pages/shops/otop/Purchases";
import OtopReports from "@/pages/shops/otop/Reports";
import OtopSettings from "@/pages/shops/otop/Settings";

export const shopRoutes: RouteObject = {
    path: "shops",
    element: <LayoutShops />,
    children: [
        {
            index: true,
            element: <ShopsDashboard />,
        },
        {
            path: "pung-ngee-chiang",
            element: <PungNgeeChiangDashboard />,
        },
        {
            path: "pung-ngee-chiang/stock",
            element: <PungNgeeChiangStock />,
        },
        {
            path: "pung-ngee-chiang/sales",
            element: <PungNgeeChiangSales />,
        },
        {
            path: "pung-ngee-chiang/purchases",
            element: <PungNgeeChiangPurchases />,
        },
        {
            path: "pung-ngee-chiang/reports",
            element: <PungNgeeChiangReports />,
        },
        {
            path: "pung-ngee-chiang/settings",
            element: <PungNgeeChiangSettings />,
        },
        {
            path: "seven-eleven",
            element: <SevenElevenDashboard />,
        },
        {
            path: "seven-eleven/sales",
            element: <SevenElevenSales />,
        },
        {
            path: "seven-eleven/purchases",
            element: <SevenElevenPurchases />,
        },
        {
            path: "seven-eleven/reports",
            element: <SevenElevenReports />,
        },
        {
            path: "seven-eleven/settings",
            element: <SevenElevenSettings />,
        },
        {
            path: "jiang",
            element: <JiangDashboard />,
        },
        {
            path: "jiang/stock",
            element: <JiangStock />,
        },
        {
            path: "jiang/sales",
            element: <JiangSales />,
        },
        {
            path: "jiang/purchases",
            element: <JiangPurchases />,
        },
        {
            path: "jiang/reports",
            element: <JiangReports />,
        },
        {
            path: "jiang/ocr-scan",
            element: <JiangOCRScan />,
        },
        {
            path: "jiang/purchase-planning",
            element: <JiangPurchasePlanning />,
        },
        {
            path: "jiang/settings",
            element: <JiangSettings />,
        },
        {
            path: "jao-sua",
            element: <JaoSuaDashboard />,
        },
        {
            path: "jao-sua/stock",
            element: <JaoSuaStock />,
        },
        {
            path: "jao-sua/sales",
            element: <JaoSuaSales />,
        },
        {
            path: "jao-sua/purchases",
            element: <JaoSuaPurchases />,
        },
        {
            path: "jao-sua/reports",
            element: <JaoSuaReports />,
        },
        {
            path: "jao-sua/ocr-scan",
            element: <JaoSuaOCRScan />,
        },
        {
            path: "jao-sua/promotions",
            element: <JaoSuaPromotions />,
        },
        {
            path: "jao-sua/product-returns",
            element: <JaoSuaProductReturns />,
        },
        {
            path: "jao-sua/purchase-planning",
            element: <JaoSuaPurchasePlanning />,
        },
        {
            path: "jao-sua/settings",
            element: <JaoSuaSettings />,
        },
        {
            path: "fit-auto",
            element: <FitAutoDashboard />,
        },
        {
            path: "fit-auto/stock",
            element: <FitAutoStock />,
        },
        {
            path: "fit-auto/sales",
            element: <FitAutoSales />,
        },
        {
            path: "fit-auto/purchases",
            element: <FitAutoPurchases />,
        },
        {
            path: "fit-auto/reports",
            element: <FitAutoReports />,
        },
        {
            path: "fit-auto/settings",
            element: <FitAutoSettings />,
        },
        {
            path: "chester",
            element: <ChesterDashboard />,
        },
        {
            path: "chester/stock",
            element: <ChesterStock />,
        },
        {
            path: "chester/sales",
            element: <ChesterSales />,
        },
        {
            path: "chester/purchases",
            element: <ChesterPurchases />,
        },
        {
            path: "chester/reports",
            element: <ChesterReports />,
        },
        {
            path: "chester/settings",
            element: <ChesterSettings />,
        },
        {
            path: "daiso",
            element: <DaisoDashboard />,
        },
        {
            path: "daiso/stock",
            element: <DaisoStock />,
        },
        {
            path: "daiso/sales",
            element: <DaisoSales />,
        },
        {
            path: "daiso/purchases",
            element: <DaisoPurchases />,
        },
        {
            path: "daiso/reports",
            element: <DaisoReports />,
        },
        {
            path: "daiso/settings",
            element: <DaisoSettings />,
        },
        {
            path: "quick",
            element: <QuickDashboard />,
        },
        {
            path: "quick/stock",
            element: <QuickStock />,
        },
        {
            path: "quick/sales",
            element: <QuickSales />,
        },
        {
            path: "quick/purchases",
            element: <QuickPurchases />,
        },
        {
            path: "quick/reports",
            element: <QuickReports />,
        },
        {
            path: "quick/settings",
            element: <QuickSettings />,
        },
        {
            path: "otop",
            element: <OtopDashboard />,
        },
        {
            path: "otop/stock",
            element: <OtopStock />,
        },
        {
            path: "otop/sales",
            element: <OtopSales />,
        },
        {
            path: "otop/purchases",
            element: <OtopPurchases />,
        },
        {
            path: "otop/reports",
            element: <OtopReports />,
        },
        {
            path: "otop/settings",
            element: <OtopSettings />,
        },
        {
            path: "ev-motorbike",
            element: <EVMotorbikeDashboard />,
        },
        {
            path: "ev-motorbike/stock",
            element: <EVMotorbikeStock />,
        },
        {
            path: "ev-motorbike/sales",
            element: <EVMotorbikeSales />,
        },
        {
            path: "ev-motorbike/purchases",
            element: <EVMotorbikePurchases />,
        },
        {
            path: "ev-motorbike/reports",
            element: <EVMotorbikeReports />,
        },
        {
            path: "ev-motorbike/settings",
            element: <EVMotorbikeSettings />,
        },
    ],
};
