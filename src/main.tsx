import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "@/index.css";
import LayoutAuth from "@/layouts/LayoutAuth";
import LayoutMain from "@/layouts/LayoutMain";
import LayoutHR from "@/layouts/LayoutHR";
import LayoutFund from "@/layouts/LayoutFund";
import LayoutDocuments from "@/layouts/LayoutDocuments";
import LayoutReports from "@/layouts/LayoutReports";
import LayoutShops from "@/layouts/LayoutShops";
import LayoutGasStation from "@/layouts/LayoutGasStation";
import LayoutRental from "@/layouts/LayoutRental";
import LayoutAccounting from "@/layouts/LayoutAccounting";

// ========== HR Pages ==========
import HRDashboard from "@/pages/hr/Dashboard";
import Employees from "@/pages/hr/Employees";
import EmployeeNew from "@/pages/hr/EmployeeNew";
import EmployeeDetail from "@/pages/hr/EmployeeDetail";
import Attendance from "@/pages/hr/Attendance";
import Shifts from "@/pages/hr/Shifts";
import Leaves from "@/pages/hr/Leaves";
import Payroll from "@/pages/hr/Payroll";
import SocialSecurity from "@/pages/hr/SocialSecurity";
import Performance from "@/pages/hr/Performance";
import Recruitment from "@/pages/hr/Recruitment";
import CandidateDetail from "@/pages/hr/CandidateDetail";
import Training from "@/pages/hr/Training";
import Organization from "@/pages/hr/Organization";
import Announcements from "@/pages/hr/Announcements";
import HRReports from "@/pages/hr/Reports";
import HRSettings from "@/pages/hr/Settings";
import OutstandingEmployees from "@/pages/hr/OutstandingEmployees";

// ========== Fund Pages ==========
import FundDashboard from "@/pages/fund/Dashboard";
import Members from "@/pages/fund/Members";
import Loans from "@/pages/fund/Loans";
import LoanRequests from "@/pages/fund/LoanRequests";
import Savings from "@/pages/fund/Savings";
import Committee from "@/pages/fund/Committee";
import Penalties from "@/pages/fund/Penalties";
import Donations from "@/pages/fund/Donations";
import Expenditures from "@/pages/fund/Expenditures";
import Approvals from "@/pages/fund/Approvals";
import FundReports from "@/pages/fund/FundReports";

// ========== Documents Pages ==========
import DocumentsDashboard from "@/pages/documents/Dashboard";
import AllDocuments from "@/pages/documents/AllDocuments";
import Categories from "@/pages/documents/Categories";
import DocumentApprovals from "@/pages/documents/Approvals";
import Expiring from "@/pages/documents/Expiring";
import DocumentAuditTrail from "@/pages/documents/AuditTrail";
import DocumentVersions from "@/pages/documents/Versions";
import Permissions from "@/pages/documents/Permissions";
import Templates from "@/pages/documents/Templates";
import DocumentSettings from "@/pages/documents/Settings";
import DocumentsReports from "@/pages/documents/Reports";

// ========== Reports Pages ==========
import ReportsOverview from "@/pages/reports/Overview";
import HRStats from "@/pages/reports/HRStats";
import FundStats from "@/pages/reports/FundStats";
import PerformanceReport from "@/pages/reports/PerformanceReport";
import AttendanceReport from "@/pages/reports/AttendanceReport";
import Export from "@/pages/reports/Export";

// ========== Shops Pages ==========
import ShopsDashboard from "@/pages/shops/Dashboard";
import PungNgeeChiangDashboard from "@/pages/shops/pung-ngee-chiang/Dashboard";
import PungNgeeChiangStock from "@/pages/shops/pung-ngee-chiang/Stock";
import PungNgeeChiangSales from "@/pages/shops/pung-ngee-chiang/Sales";
import PungNgeeChiangPurchases from "@/pages/shops/pung-ngee-chiang/Purchases";
import PungNgeeChiangReports from "@/pages/shops/pung-ngee-chiang/Reports";
import PungNgeeChiangSettings from "@/pages/shops/pung-ngee-chiang/Settings";
import SevenElevenDashboard from "@/pages/shops/seven-eleven/Dashboard";
import SevenElevenStock from "@/pages/shops/seven-eleven/Stock";
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
import JaoSuaDashboard from "@/pages/shops/jao-sua/Dashboard";
import JaoSuaStock from "@/pages/shops/jao-sua/Stock";
import JaoSuaSales from "@/pages/shops/jao-sua/Sales";
import JaoSuaPurchases from "@/pages/shops/jao-sua/Purchases";
import JaoSuaReports from "@/pages/shops/jao-sua/Reports";
import JaoSuaSettings from "@/pages/shops/jao-sua/Settings";
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
import GasStationDashboard from "@/pages/gas-station/Dashboard";
import GasStationPurchases from "@/pages/gas-station/Purchases";
import GasStationSales from "@/pages/gas-station/Sales";
import GasStationCoupons from "@/pages/gas-station/Coupons";
import GasStationStock from "@/pages/gas-station/Stock";
import GasStationBalance from "@/pages/gas-station/Balance";
import GasStationReports from "@/pages/gas-station/Reports";
import GasStationSettings from "@/pages/gas-station/Settings";
import RentalDashboard from "@/pages/rental/Dashboard";
import RentalContracts from "@/pages/rental/Contracts";
import RentalInvoices from "@/pages/rental/Invoices";
import RentalPayments from "@/pages/rental/Payments";
import RentalExternalRent from "@/pages/rental/ExternalRent";
import RentalReports from "@/pages/rental/Reports";
import RentalSettings from "@/pages/rental/Settings";

// ========== Accounting Pages (M6) ==========
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

import { isAuthenticated } from "@/lib/auth";

// Protected Route Component
const Protected = ({ children }: { children: React.ReactNode }) =>
  isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;

// Router Configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutAuth />,
  },
  {
    path: "/app",
    element: (
      <Protected>
        <LayoutMain />
      </Protected>
    ),
    children: [
      // ========== DEFAULT: Redirect to HR ==========
      {
        index: true,
        element: <Navigate to="/app/hr" replace />,
      },
      
      // ========== HR MODULE ==========
      {
        path: "hr",
        element: <LayoutHR />,
        children: [
          {
            index: true,
            element: <HRDashboard />,
          },
          {
            path: "employees",
            element: <Employees />,
          },
          {
            path: "employees/new",
            element: <EmployeeNew />,
          },
          {
            path: "employees/:id",
            element: <EmployeeDetail />,
          },
          {
            path: "attendance",
            element: <Attendance />,
          },
          {
            path: "attendance/shifts",
            element: <Shifts />,
          },
          {
            path: "leaves",
            element: <Leaves />,
          },
          {
            path: "payroll",
            element: <Payroll />,
          },
          {
            path: "social-security",
            element: <SocialSecurity />,
          },
          {
            path: "performance",
            element: <Performance />,
          },
          {
            path: "recruitment",
            element: <Recruitment />,
          },
          {
            path: "recruitment/:candidateId",
            element: <CandidateDetail />,
          },
          {
            path: "training",
            element: <Training />,
          },
          {
            path: "organization",
            element: <Organization />,
          },
          {
            path: "announcements",
            element: <Announcements />,
          },
          {
            path: "outstanding-employees",
            element: <OutstandingEmployees />,
          },
          {
            path: "reports",
            element: <HRReports />,
          },
          {
            path: "settings",
            element: <HRSettings />,
          },
        ],
      },
      
      // ========== FUND MODULE ==========
      {
        path: "fund",
        element: <LayoutFund />,
        children: [
          {
            index: true,
            element: <FundDashboard />,
          },
          {
            path: "members",
            element: <Members />,
          },
          {
            path: "loans",
            element: <Loans />,
          },
          {
            path: "loan-requests",
            element: <LoanRequests />,
          },
          {
            path: "savings",
            element: <Savings />,
          },
          {
            path: "committee",
            element: <Committee />,
          },
          {
            path: "penalties",
            element: <Penalties />,
          },
          {
            path: "donations",
            element: <Donations />,
          },
          {
            path: "expenditures",
            element: <Expenditures />,
          },
          {
            path: "approvals",
            element: <Approvals />,
          },
          {
            path: "reports",
            element: <FundReports />,
          },
        ],
      },
      
      // ========== DOCUMENTS MODULE ==========
      {
        path: "documents",
        element: <LayoutDocuments />,
        children: [
          {
            index: true,
            element: <DocumentsDashboard />,
          },
          {
            path: "all",
            element: <AllDocuments />,
          },
          {
            path: "categories",
            element: <Categories />,
          },
          {
            path: "approvals",
            element: <DocumentApprovals />,
          },
          {
            path: "expiring",
            element: <Expiring />,
          },
          {
            path: "audit-trail",
            element: <DocumentAuditTrail />,
          },
          {
            path: "versions",
            element: <DocumentVersions />,
          },
          {
            path: "permissions",
            element: <Permissions />,
          },
          {
            path: "templates",
            element: <Templates />,
          },
          {
            path: "settings",
            element: <DocumentSettings />,
          },
          {
            path: "reports",
            element: <DocumentsReports />,
          },
        ],
      },
      
      // ========== REPORTS MODULE ==========
      {
        path: "reports",
        element: <LayoutReports />,
        children: [
          {
            index: true,
            element: <ReportsOverview />,
          },
          {
            path: "hr",
            element: <HRStats />,
          },
          {
            path: "fund",
            element: <FundStats />,
          },
          {
            path: "performance",
            element: <PerformanceReport />,
          },
          {
            path: "attendance",
            element: <AttendanceReport />,
          },
          {
            path: "export",
            element: <Export />,
          },
        ],
      },
      
      // ========== SHOPS MODULE ==========
      {
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
            path: "seven-eleven/stock",
            element: <SevenElevenStock />,
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
      },
      
      // ========== GAS STATION MODULE (M1) ==========
      {
        path: "gas-station",
        element: <LayoutGasStation />,
        children: [
          {
            index: true,
            element: <GasStationDashboard />,
          },
          {
            path: "purchases",
            element: <GasStationPurchases />,
          },
          {
            path: "sales",
            element: <GasStationSales />,
          },
          {
            path: "coupons",
            element: <GasStationCoupons />,
          },
          {
            path: "stock",
            element: <GasStationStock />,
          },
          {
            path: "balance",
            element: <GasStationBalance />,
          },
          {
            path: "reports",
            element: <GasStationReports />,
          },
          {
            path: "settings",
            element: <GasStationSettings />,
          },
        ],
      },
      
      // ========== RENTAL MODULE (M2) ==========
      {
        path: "rental",
        element: <LayoutRental />,
        children: [
          {
            index: true,
            element: <RentalDashboard />,
          },
          {
            path: "contracts",
            element: <RentalContracts />,
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
            path: "external-rent",
            element: <RentalExternalRent />,
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
      },
      
      // ========== ACCOUNTING MODULE (M6) ==========
      {
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
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
