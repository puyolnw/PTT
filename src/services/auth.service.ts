import api from "@/lib/api";
import { LoginCredentials, LoginResponse } from "@/types/auth";

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>("/auth/login", credentials);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    },
};
