import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const RoleBasedRedirect = () => {
    const { user } = useAuth();
    const role = user?.role || "employee";

    if (role === "superadmin") return <Navigate to="/app/hr" replace />;
    if (role === "admin") return <Navigate to="/app/hr" replace />;
    if (role === "hr") return <Navigate to="/app/hr" replace />;
    if (role === "finance") return <Navigate to="/app/accounting" replace />;
    if (role === "accountant") return <Navigate to="/app/accounting" replace />;
    if (role === "manager") return <Navigate to="/app/hr" replace />;
    if (role === "gas-station") return <Navigate to="/app/gas-station" replace />;
    if (role === "shop") return <Navigate to="/app/shops" replace />;
    if (role === "property") return <Navigate to="/app/rental" replace />;

    // Default fallback
    return <Navigate to="/app/documents" replace />;
};
