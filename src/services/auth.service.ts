import { LoginCredentials, LoginResponse } from "@/types/auth";

const API_URL = "/api";

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || response.statusText || "Login failed");
            (error as Error & { status: number }).status = response.status;
            throw error;
        }

        const data = await response.json();
        return data;
    },

    logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
    },
};
