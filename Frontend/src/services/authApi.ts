import api from './api';

export interface LoginResponse {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
}

export interface RegisterResponse {
    _id: string;
    name: string;
    email: string;
    role: string;
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

    getProfile: async () => {
        const { data } = await api.get('/auth/profile');
        return data;
    },
};
