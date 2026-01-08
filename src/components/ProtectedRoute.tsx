import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_HIERARCHY } from "@/middleware/auth";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
}

export default function ProtectedRoute({
    children,
    requiredRoles = [],
}: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/" replace />;
    }

    if (requiredRoles.length > 0) {
        const userRoleValue = ROLE_HIERARCHY[user.role as string] || 0;
        const hasAccess = requiredRoles.some(requiredRole => {
            const requiredRoleValue = ROLE_HIERARCHY[requiredRole] || 0;
            return userRoleValue >= requiredRoleValue;
        });

        if (!hasAccess) {
            return <Navigate to="/forbidden" replace />;
        }
    }

    return <>{children}</>;
}
