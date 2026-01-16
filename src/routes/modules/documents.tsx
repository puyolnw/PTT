import { RouteObject } from "react-router-dom";
import LayoutDocuments from "@/layouts/LayoutDocuments";


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

export const documentRoutes: RouteObject = {
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
};
