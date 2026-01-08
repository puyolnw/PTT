import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { AuthState, LoginCredentials, User } from "@/types/auth";
import { jwtDecode } from "jwt-decode";

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const decodeAndSetUser = (token: string) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const decoded: any = jwtDecode(token);

            const currentTime = Date.now() / 1000;
            if (decoded.exp && decoded.exp < currentTime) {
                throw new Error("Token expired");
            }

            const user: User = {
                id: decoded.userId || decoded.sub,
                username: decoded.username || decoded.sub,
                email: decoded.email,
                role: decoded.role,
            };

            setState({
                user,
                accessToken: token,
                isAuthenticated: true,
                isLoading: false,
            });

            return true;
        } catch (error) {
            console.error("Invalid token:", error);
            return false;
        }
    };

    useEffect(() => {
        const savedToken = localStorage.getItem("accessToken");
        if (savedToken) {
            const isValid = decodeAndSetUser(savedToken);
            if (!isValid) {
                logout();
            }
        } else {
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    const login = async (credentials: LoginCredentials) => {
        setState((prev) => ({ ...prev, isLoading: true }));
        try {
            const response = await authService.login(credentials);
            if (response.success && response.data) {
                const { accessToken, refreshToken } = response.data;

                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);

                decodeAndSetUser(accessToken);
            }
        } catch (error) {
            setState((prev) => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setState({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
