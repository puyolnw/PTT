import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "@/components/ErrorPage";
import LayoutAuth from "@/layouts/LayoutAuth";
import LayoutMain from "@/layouts/LayoutMain";
import Forbidden from "@/components/Forbidden";
import { RoleBasedRedirect } from "@/components/auth/RoleBasedRedirect";
import { Protected } from "@/components/auth/Protected";

import { hrRoutes } from "./modules/hr";
import { fundRoutes } from "./modules/fund";
import { documentRoutes } from "./modules/documents";
import { reportRoutes } from "./modules/reports";
import { shopRoutes } from "./modules/shops";
import { rentalRoutes } from "./modules/rental";
import { accountingRoutes } from "./modules/accounting";
import { gasStationRoutes } from "./modules/gasStation";
import { dataManagementRoutes } from "./modules/dataManagement";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutAuth />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/app",
    element: (
      <Protected>
        <LayoutMain />
      </Protected>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <RoleBasedRedirect />,
      },
      {
        path: "forbidden",
        element: <Forbidden />,
      },

      hrRoutes,

      fundRoutes,

      documentRoutes,

      reportRoutes,

      shopRoutes,

      rentalRoutes,

      accountingRoutes,

      gasStationRoutes,

      dataManagementRoutes,
    ],
  },
]);
