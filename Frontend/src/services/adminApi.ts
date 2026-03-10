import api from './api';

export const adminApi = {
    getUsers: async () => {
        const { data } = await api.get('/admin/users');
        return data;
    },

    approveStaff: async (id: string) => {
        const { data } = await api.patch(`/admin/approve-staff/${id}`);
        return data;
    },

    banUser: async (id: string) => {
        const { data } = await api.patch(`/admin/ban-user/${id}`);
        return data;
    },

    unbanUser: async (id: string) => {
        const { data } = await api.patch(`/admin/unban-user/${id}`);
        return data;
    },
};
