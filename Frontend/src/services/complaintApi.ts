import api from './api';

export const complaintApi = {
    getComplaints: async (search?: string, complaintCode?: string) => {
        const { data } = await api.get('/complaints', { params: { search, complaintCode } });
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
        const { data } = await api.post('/complaints', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    updateStage: async (id: string, stageData: { stage: string; message?: string; completionNotes?: string; resolutionImages?: string[] } | FormData) => {
        const { data } = await api.patch(`/complaints/${id}/stage`, stageData);
        return data;
    },

    updateStatus: async (id: string, status: string, message?: string) => {
        const { data } = await api.patch(`/complaints/${id}/stage`, { stage: status, message });
        return data;
    },

    submitFeedback: async (id: string, rating: number, comment?: string) => {
        const { data } = await api.post(`/complaints/${id}/feedback`, { rating, comment });
        return data;
    },

    reopenComplaint: async (id: string, reason?: string) => {
        const { data } = await api.post(`/complaints/${id}/reopen`, { reason });
        return data;
    },

    addInternalNote: async (id: string, note: string) => {
        const { data } = await api.post(`/complaints/${id}/internal-notes`, { note });
        return data;
    },

    addComment: async (id: string, text: string) => {
        const { data } = await api.post(`/complaints/${id}/comments`, { text });
        return data;
    },

    upvoteComplaint: async (id: string) => {
        const { data } = await api.patch(`/complaints/${id}/upvote`);
        return data;
    },

    updateDepartment: async (id: string, department: string) => {
        const { data } = await api.patch(`/hod/complaints/${id}/transfer-department`, { targetDepartment: department });
        return data;
    },

    updatePriority: async (id: string, priority: string) => {
        const { data } = await api.patch(`/complaints/${id}/priority`, { priority });
        return data;
    },
};
