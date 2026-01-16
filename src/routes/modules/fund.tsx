import { RouteObject } from "react-router-dom";
import LayoutFund from "@/layouts/LayoutFund";


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

export const fundRoutes: RouteObject = {
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
};
