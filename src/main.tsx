import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "@/index.css";
import LayoutAuth from "@/layouts/LayoutAuth";
import LayoutMain from "@/layouts/LayoutMain";
import LayoutHR from "@/layouts/LayoutHR";
import LayoutFund from "@/layouts/LayoutFund";
import LayoutReports from "@/layouts/LayoutReports";

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

// ========== Reports Pages ==========
import ReportsOverview from "@/pages/reports/Overview";
import HRStats from "@/pages/reports/HRStats";
import FundStats from "@/pages/reports/FundStats";
import PerformanceReport from "@/pages/reports/PerformanceReport";
import AttendanceReport from "@/pages/reports/AttendanceReport";
import Export from "@/pages/reports/Export";

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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
