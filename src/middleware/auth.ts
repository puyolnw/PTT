// src/middleware/auth.ts

import { useAuth } from "@/contexts/AuthContext";
export type { UserRole } from "@/types/auth";

export const ROLE_HIERARCHY: Record<string, number> = {
    superadmin: 5,
    admin: 4,
    manager: 3,
    accounting: 3,
    hr: 3,
    employee: 2,
    guest: 1,
};

export function useAuthState() {
    const { user, isLoading, isAuthenticated } = useAuth();

    const role = user?.role || null;

    return {
        role,
        isLoading,
        isAuthenticated,
        // Add helpers using the new role string
        isAdmin: role === "superadmin" || role === "admin",
        isManager: role === "manager",
        isAccounting: role === "accounting",
        isHR: role === "hr",
        hasRole: (checkRole: string) => {
            if (!role) return false;
            return (ROLE_HIERARCHY[role] || 0) >= (ROLE_HIERARCHY[checkRole] || 0);
        },
        // Mock permission check for now - can be expanded
        hasPermission: (_feature: string) => true,
    };
}
