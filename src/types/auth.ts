export type UserRole = 'superadmin' | 'admin' | 'manager' | 'accounting' | 'hr' | 'employee' | 'guest';

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole | string;
    userPermissions?: string[];
}

export interface LoginCredentials {
    username?: string;
    password?: string;
    [key: string]: unknown;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
    requestId: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
