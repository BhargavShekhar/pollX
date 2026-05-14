import axios from "axios";
import TokenStore from "./tokenStore";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api/v1";

export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

api.interceptors.request.use((config) => {
    const token = TokenStore.getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            const originalRequest = error.config! as typeof error.config & { _retry?: boolean };

            const isAuthRoute =
                originalRequest.url?.includes("/auth/signin") ||
                originalRequest.url?.includes("/auth/signup") ||
                originalRequest.url?.includes("/auth/refresh");

            if (isAuthRoute) {
                return Promise.reject(error);
            }

            if (originalRequest._retry) {
                TokenStore.clear();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const { data } = await api.post("/auth/refresh");

                TokenStore.set(data.data);

                return api(originalRequest);
            } catch (error) {
                TokenStore.clear();
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
)