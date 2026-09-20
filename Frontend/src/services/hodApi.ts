import api from './api';

export const hodApi = {
    getComplaints: async () => {
        const { data } = await api.get('/hod/complaints');
        return data;
    },

    assignComplaint: async (complaintId: string, staffId: string, note?: string) => {
        const { data } = await api.patch(`/hod/complaints/${complaintId}/assign`, { staffId, note });
        return data;
    },

    transferDepartment: async (complaintId: string, targetDepartment: string, reason?: string) => {
        const { data } = await api.patch(`/hod/complaints/${complaintId}/transfer-department`, { targetDepartment, reason });
        return data;
    },

    getStaff: async () => {
        const { data } = await api.get('/hod/staff');
        return data;
    },

    getStaffWorkload: async () => {
        const { data } = await api.get('/hod/staff/workload');
        return data;
    },

    getStats: async () => {
        const { data } = await api.get('/hod/stats');
        return data;
    },
};
