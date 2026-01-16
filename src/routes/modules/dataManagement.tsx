import { RouteObject } from "react-router-dom";
import LayoutDataManagement from "@/layouts/LayoutDataManagement";

import Dashboard from "@/pages/data-management/Dashboard";
import Users from "@/pages/data-management/Users";
import Branches from "@/pages/data-management/Branches";
import Departments from "@/pages/data-management/Departments";
import Permissions from "@/pages/data-management/Permissions";

export const dataManagementRoutes: RouteObject = {
    path: "data-management",
    element: <LayoutDataManagement />,
    children: [
        {
            index: true,
            element: <Dashboard />,
        },
        {
            path: "users",
            element: <Users />,
        },
        {
            path: "branches",
            element: <Branches />,
        },
        {
            path: "departments",
            element: <Departments />,
        },
        {
            path: "permissions",
            element: <Permissions />,
        },
    ],
};
