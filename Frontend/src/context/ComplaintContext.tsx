import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Complaint, ComplaintStatus, Priority, Department } from '../types';
import { complaintApi } from '../services/complaintApi';
import { useAuth } from './AuthContext';

interface ComplaintContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'status'>) => Promise<void>;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => void;
  updateComplaintDepartment: (id: string, department: Department) => void;
  updateComplaintPriority: (id: string, priority: Priority) => void;
  refreshComplaints: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

// Helper: map backend complaint to frontend Complaint type
const mapComplaint = (c: any): Complaint => ({
  id: c._id || c.id,
  title: c.title,
  description: c.description,
  category: c.category,
  status: c.status as ComplaintStatus,
  priority: c.priority as Priority,
  citizenId: c.citizenId?._id || c.citizenId || '',
  citizenName: c.citizenName || '',
  department: c.department as Department | undefined,
  location: c.location || '',
  latitude: c.latitude,
  longitude: c.longitude,
  imageUrl: c.imageUrl,
  createdAt: c.createdAt || new Date().toISOString(),
  updatedAt: c.updatedAt || new Date().toISOString(),
  timeline: (c.timeline || []).map((t: any) => ({
    status: t.status as ComplaintStatus,
    timestamp: t.updatedAt || t.timestamp || new Date().toISOString(),
    note: t.message || t.note,
  })),
});

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const refreshComplaints = useCallback(async () => {
    const token = localStorage.getItem('fixmycity_token');
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const data = await complaintApi.getComplaints();
      setComplaints(Array.isArray(data) ? data.map(mapComplaint) : []);
    } catch (err: any) {
      console.error('Failed to fetch complaints:', err);
      setError('Failed to fetch complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load complaints when authenticated status changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshComplaints();
    } else {
      setComplaints([]);
    }
  }, [isAuthenticated, refreshComplaints]);

  const addComplaint = async (newComplaintData: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'status'>) => {
    try {
      const formData = new FormData();
      formData.append('title', newComplaintData.title);
      formData.append('description', newComplaintData.description);
      formData.append('location', newComplaintData.location || '');

      formData.append('category', newComplaintData.category);
      formData.append('priority', newComplaintData.priority);
      if (newComplaintData.latitude !== undefined) {
        formData.append('latitude', newComplaintData.latitude.toString());
      }
      if (newComplaintData.longitude !== undefined) {
        formData.append('longitude', newComplaintData.longitude.toString());
      }

      // If imageUrl is a data URL (from file upload), convert to blob
      if (newComplaintData.imageUrl && newComplaintData.imageUrl.startsWith('data:')) {
        const response = await fetch(newComplaintData.imageUrl);
        const blob = await response.blob();
        formData.append('image', blob, 'complaint-image.jpg');
      }

      await complaintApi.createComplaint(formData);
      await refreshComplaints();
    } catch (error) {
      console.error('Failed to create complaint:', error);
      throw error;
    }
  };

  const updateComplaintStatus = async (id: string, status: ComplaintStatus) => {
    try {
      await complaintApi.updateStatus(id, status);
      await refreshComplaints();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const updateComplaintDepartment = async (id: string, department: Department) => {
    try {
      await complaintApi.updateDepartment(id, department);
      await refreshComplaints();
    } catch (error) {
      console.error('Failed to update department:', error);
    }
  };

  const updateComplaintPriority = async (id: string, priority: Priority) => {
    try {
      await complaintApi.updatePriority(id, priority);
      await refreshComplaints();
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  return (
    <ComplaintContext.Provider value={{
      complaints,
      addComplaint,
      updateComplaintStatus,
      updateComplaintDepartment,
      updateComplaintPriority,
      refreshComplaints,
      loading,
      error,
    }}>
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};
