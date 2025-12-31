import { createContext, useContext, useState, ReactNode } from "react";

export interface AuthUser {
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    login: (user: AuthUser) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        const savedUser = localStorage.getItem("ptt_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (userData: AuthUser) => {
        setUser(userData);
        localStorage.setItem("ptt_user", JSON.stringify(userData));
        localStorage.setItem("auth_token", "mock-token-12345");
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("ptt_user");
        localStorage.removeItem("auth_token");
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
