import { RouteObject } from "react-router-dom";
import LayoutReports from "@/layouts/LayoutReports";


import ReportsOverview from "@/pages/reports/Overview";
import HRStats from "@/pages/reports/HRStats";
import FundStats from "@/pages/reports/FundStats";
import PerformanceReport from "@/pages/reports/PerformanceReport";
import AttendanceReport from "@/pages/reports/AttendanceReport";
import Export from "@/pages/reports/Export";

export const reportRoutes: RouteObject = {
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
};
