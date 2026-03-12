import React from 'react';
import { Card } from '../components/UI';
import { useComplaints } from '../context/ComplaintContext';
import { ComplaintsMapView } from '../components/ComplaintsMapView';

export const StaffMapPage: React.FC = () => {
  const { complaints } = useComplaints();

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Map View</h1>
        <p className="text-zinc-500 mt-1">Showing all active complaints with location data. Resolved and rejected complaints are excluded.</p>
      </header>
      <Card className="p-6">
        <ComplaintsMapView complaints={complaints} showCitizenInfo={false} />
      </Card>
    </div>
  );
};
