import React, { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { AuthState, LoginCredentials, User } from "@/types/auth";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const decodeAndSetUser = (token: string) => {
        try {
            const decoded: any = jwtDecode(token);

            const currentTime = Date.now() / 1000;
            if (decoded.exp && decoded.exp < currentTime) {
                throw new Error("Token expired");
            }

            const storedUserStr = localStorage.getItem("user");
            let user: User;

            if (storedUserStr) {
                try {
                    user = JSON.parse(storedUserStr);
                } catch (e) {
                    user = {
                        id: decoded.userId || decoded.sub,
                        username: decoded.username || decoded.sub,
                        email: decoded.email,
                        role: decoded.role,
                    };
                }
            } else {
                user = {
                    id: decoded.userId || decoded.sub,
                    username: decoded.username || decoded.sub,
                    email: decoded.email,
                    role: decoded.role,
                };
            }

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
                const { accessToken, refreshToken, user } = response.data;

                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("user", JSON.stringify(user));

                decodeAndSetUser(accessToken);
            }
        } catch (error) {
            setState((prev) => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        localStorage.removeItem("user");
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
