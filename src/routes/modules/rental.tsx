import { RouteObject } from "react-router-dom";
import LayoutRental from "@/layouts/LayoutRental";


import RentalDashboard from "@/pages/rental/Dashboard";
import RentalLeaseDashboard from "@/pages/rental/LeaseDashboard";
import RentalContracts from "@/pages/rental/Contracts";
import RentalVariableRent from "@/pages/rental/VariableRent";
import RentalInvoices from "@/pages/rental/Invoices";
import RentalPayments from "@/pages/rental/Payments";
import RentalPaymentVouchers from "@/pages/rental/PaymentVouchers";
import RentalReceipts from "@/pages/rental/Receipts";
import RentalExternalRent from "@/pages/rental/ExternalRent";
import RentalLeaseAlerts from "@/pages/rental/LeaseAlerts";
import RentalAgingReport from "@/pages/rental/RentalAgingReport";
import RentalOCRScan from "@/pages/rental/OCRScan";
import RentalReports from "@/pages/rental/Reports";
import RentalSettings from "@/pages/rental/Settings";

export const rentalRoutes: RouteObject = {
    path: "rental",
    element: <LayoutRental />,
    children: [
        {
            index: true,
            element: <RentalDashboard />,
        },
        {
            path: "lease-dashboard",
            element: <RentalLeaseDashboard />,
        },
        {
            path: "contracts",
            element: <RentalContracts />,
        },
        {
            path: "variable-rent",
            element: <RentalVariableRent />,
        },
        {
            path: "invoices",
            element: <RentalInvoices />,
        },
        {
            path: "payments",
            element: <RentalPayments />,
        },
        {
            path: "payment-vouchers",
            element: <RentalPaymentVouchers />,
        },
        {
            path: "receipts",
            element: <RentalReceipts />,
        },
        {
            path: "external-rent",
            element: <RentalExternalRent />,
        },
        {
            path: "lease-alerts",
            element: <RentalLeaseAlerts />,
        },
        {
            path: "aging-report",
            element: <RentalAgingReport />,
        },
        {
            path: "ocr-scan",
            element: <RentalOCRScan />,
        },
        {
            path: "reports",
            element: <RentalReports />,
        },
        {
            path: "settings",
            element: <RentalSettings />,
        },
    ],
};
