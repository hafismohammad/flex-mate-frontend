// adminAxiosInstance.ts

import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const adminAxiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}`,
    withCredentials: true,
});

// Request Interceptor for Admin
adminAxiosInstance.interceptors.request.use(
    (config: CustomAxiosRequestConfig) => {
        const token = localStorage.getItem("admin_access_token");
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error: AxiosError) => {
        console.error('Admin request error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor for Admin
adminAxiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;
        
        if (originalRequest && error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                
                const response = await adminAxiosInstance.post<{ accessToken: string }>('/api/admin/refresh-token', {}, { withCredentials: true });
                const { accessToken } = response.data;

                localStorage.setItem("admin_access_token", accessToken);
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                return adminAxiosInstance(originalRequest);
            } catch (refreshError) {
                console.error('Error refreshing admin token:', refreshError);
                window.location.href = '/admin/login'; 
                return Promise.reject(refreshError);
            }
        }

        console.error('Admin response error:', error.response?.data);
        return Promise.reject(error);
    }
);

export default adminAxiosInstance;
