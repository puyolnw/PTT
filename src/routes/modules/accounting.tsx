import { RouteObject } from "react-router-dom";
import LayoutAccounting from "@/layouts/LayoutAccounting";


import AccountingDashboard from "@/pages/accounting/Dashboard";
import ChartOfAccounts from "@/pages/accounting/ChartOfAccounts";
import JournalEntries from "@/pages/accounting/JournalEntries";
import TrialBalance from "@/pages/accounting/TrialBalance";
import BankReconciliation from "@/pages/accounting/BankReconciliation";
import InventoryReconciliation from "@/pages/accounting/InventoryReconciliation";
import TaxCalculation from "@/pages/accounting/TaxCalculation";
import TaxReports from "@/pages/accounting/TaxReports";
import MonthEndClosing from "@/pages/accounting/MonthEndClosing";
import FinancialReports from "@/pages/accounting/FinancialReports";
import AgingReport from "@/pages/accounting/AgingReport";
import FixedAssets from "@/pages/accounting/FixedAssets";
import VendorsCustomers from "@/pages/accounting/VendorsCustomers";
import GLMapping from "@/pages/accounting/GLMapping";
import LegalEntities from "@/pages/accounting/LegalEntities";
import AuditTrail from "@/pages/accounting/AuditTrail";
import AdvancedAnalytics from "@/pages/accounting/AdvancedAnalytics";
import RiskDashboard from "@/pages/accounting/RiskDashboard";
import Alerts from "@/pages/accounting/Alerts";
import AccountingSettings from "@/pages/accounting/Settings";

export const accountingRoutes: RouteObject = {
    path: "accounting",
    element: <LayoutAccounting />,
    children: [
        {
            index: true,
            element: <AccountingDashboard />,
        },
        {
            path: "chart-of-accounts",
            element: <ChartOfAccounts />,
        },
        {
            path: "journal-entries",
            element: <JournalEntries />,
        },
        {
            path: "trial-balance",
            element: <TrialBalance />,
        },
        {
            path: "bank-reconciliation",
            element: <BankReconciliation />,
        },
        {
            path: "inventory-reconciliation",
            element: <InventoryReconciliation />,
        },
        {
            path: "tax-calculation",
            element: <TaxCalculation />,
        },
        {
            path: "tax-reports",
            element: <TaxReports />,
        },
        {
            path: "month-end-closing",
            element: <MonthEndClosing />,
        },
        {
            path: "financial-reports",
            element: <FinancialReports />,
        },
        {
            path: "aging-report",
            element: <AgingReport />,
        },
        {
            path: "fixed-assets",
            element: <FixedAssets />,
        },
        {
            path: "vendors-customers",
            element: <VendorsCustomers />,
        },
        {
            path: "gl-mapping",
            element: <GLMapping />,
        },
        {
            path: "legal-entities",
            element: <LegalEntities />,
        },
        {
            path: "audit-trail",
            element: <AuditTrail />,
        },
        {
            path: "advanced-analytics",
            element: <AdvancedAnalytics />,
        },
        {
            path: "risk-dashboard",
            element: <RiskDashboard />,
        },
        {
            path: "alerts",
            element: <Alerts />,
        },
        {
            path: "settings",
            element: <AccountingSettings />,
        },
    ],
};
