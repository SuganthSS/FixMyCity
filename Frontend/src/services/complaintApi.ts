import api from './api';

export const complaintApi = {
    getComplaints: async () => {
        const { data } = await api.get('/complaints');
        return data;
    },

    getPublicComplaints: async () => {
        const { data } = await api.get('/complaints/public');
        return data;
    },

    getComplaintById: async (id: string) => {
        const { data } = await api.get(`/complaints/${id}`);
        return data;
    },

    createComplaint: async (formData: FormData) => {
        const { data } = await api.post('/complaints', formData);
        return data;
    },

    updateStatus: async (id: string, status: string, message?: string) => {
        const { data } = await api.patch(`/complaints/${id}/status`, { status, message });
        return data;
    },

    upvoteComplaint: async (id: string) => {
        const { data } = await api.patch(`/complaints/${id}/upvote`);
        return data;
    },

    updateDepartment: async (id: string, department: string) => {
        const { data } = await api.patch(`/complaints/${id}/department`, { department });
        return data;
    },

    updatePriority: async (id: string, priority: string) => {
        const { data } = await api.patch(`/complaints/${id}/priority`, { priority });
        return data;
    },
};
