import React, { useState, useEffect } from 'react';
import { Card } from '../components/UI';
import { hodApi } from '../services/hodApi';
import { ComplaintsMapView } from '../components/ComplaintsMapView';
import { Complaint } from '../types';
import { RefreshCw } from 'lucide-react';

export const HODMapPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await hodApi.getComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to load HOD complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Department Map</h1>
          <p className="text-zinc-500 mt-1">Showing all active complaints in your department.</p>
        </div>
        <button 
          onClick={loadComplaints}
          className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>
      <Card className="p-6">
        <ComplaintsMapView 
          complaints={complaints} 
          showCitizenInfo={false} 
          center={[13.0827, 80.2707]}
          zoom={12}
        />
      </Card>
    </div>
  );
};
