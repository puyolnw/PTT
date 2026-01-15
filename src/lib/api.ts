import axios from 'axios';

const api = axios.create({
    baseURL: "/api", // Relies on Vite proxy to forward to http://localhost:3000
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 (Unauthorized) - maybe redirect to login or refresh token
        if (error.response && error.response.status === 401) {
            // Optional: Trigger logout or refresh
            console.warn("Unauthorized access - 401");
        }
        return Promise.reject(error);
    }
);

export default api;
