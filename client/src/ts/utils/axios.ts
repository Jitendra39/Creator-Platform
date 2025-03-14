import axios from "axios";
import { API_URL } from "../../config";

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage or cookies
        const token =
            localStorage.getItem("authToken") || getCookie("accessToken");

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
axiosInstance.interceptors.response.use(
    (response) => {
        // If the response contains new tokens, update them
        if (response.data.accessToken) {
            localStorage.setItem("authToken", response.data.accessToken);
        }
        if (response.data.refreshToken) {
            localStorage.setItem("refreshToken", response.data.refreshToken);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh the token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const refreshToken =
                    localStorage.getItem("refreshToken") ||
                    getCookie("refreshToken");

                if (!refreshToken) {
                    // If no refresh token, redirect to login
                    window.location.href = "/login";
                    return Promise.reject(error);
                }

                const response = await axios.post(
                    `${API_URL}/api/accounts/refresh-token`,
                    {},
                    {
                        withCredentials: true,
                        headers: {
                            "x-refresh-token": refreshToken,
                        },
                    }
                );

                // Update tokens
                if (response.data.accessToken) {
                    localStorage.setItem(
                        "authToken",
                        response.data.accessToken
                    );
                }
                if (response.data.refreshToken) {
                    localStorage.setItem(
                        "refreshToken",
                        response.data.refreshToken
                    );
                }

                // Retry the original request
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // If refresh token fails, redirect to login
                localStorage.removeItem("authToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Helper function to get cookie value
function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookiePart = parts.pop();
        return cookiePart ? cookiePart.split(";").shift() : undefined;
    }
    return undefined;
}

export default axiosInstance;
