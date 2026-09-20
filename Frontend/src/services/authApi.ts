import api from './api';

export interface LoginResponse {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
    token: string;
}

export interface RegisterResponse {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
    token: string;
}

export const authApi = {
    login: async (email: string, password: string) => {
        const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
        return data;
    },

    register: async (name: string, email: string, password: string, role: string) => {
        const { data } = await api.post<RegisterResponse>('/auth/register', { name, email, password, role });
        return data;
    },

    googleLogin: async (token: string) => {
        const { data } = await api.post<LoginResponse>('/auth/google', { token });
        return data;
    },

    getProfile: async () => {
        const { data } = await api.get('/auth/profile');
        return data;
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        const { data } = await api.post<{ success: boolean; message: string }>('/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return data;
    },

    forgotPassword: async (email: string) => {
        const { data } = await api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
        return data;
    },

    resetPassword: async (token: string, newPassword: string) => {
        const { data } = await api.post<{ success: boolean; message: string }>(`/auth/reset-password/${token}`, { newPassword });
        return data;
    },
};
