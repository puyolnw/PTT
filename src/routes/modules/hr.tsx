import { RouteObject } from "react-router-dom";
import LayoutHR from "@/layouts/LayoutHR";


import HRDashboard from "@/pages/hr/Dashboard";
import Employees from "@/pages/hr/Employees";
import EmployeeNew from "@/pages/hr/EmployeeNew";
import EmployeeDetail from "@/pages/hr/EmployeeDetail";
import Attendance from "@/pages/hr/Attendance";
import AttendanceAbsence from "@/pages/hr/AttendanceAbsence";
import Overtime from "@/pages/hr/Overtime";
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
import Welfare from "@/pages/hr/Welfare";
import WelfareStock from "@/pages/hr/WelfareStock";
import Warnings from "@/pages/hr/Warnings";

export const hrRoutes: RouteObject = {
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
            path: "attendance-absence",
            element: <AttendanceAbsence />,
        },
        {
            path: "attendance/shifts",
            element: <Shifts />,
        },
        {
            path: "overtime",
            element: <Overtime />,
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
            path: "welfare",
            element: <Welfare />,
        },
        {
            path: "welfare-stock",
            element: <WelfareStock />,
        },
        {
            path: "warnings",
            element: <Warnings />,
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
};
