import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Complaint, ComplaintStatus } from '../types';
import { Badge } from './UI';

// Custom orange marker icon to match the app's brand
const complaintIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Auto-fit bounds to all markers
const FitBounds: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [positions, map]);
  return null;
};

// Invalidate map size when rendered inside tabs
const MapResizer: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

interface ComplaintsMapViewProps {
  complaints: Complaint[];
  /** If true, show citizenName and citizenId in popup (Admin). If false, exclude them (Staff). */
  showCitizenInfo?: boolean;
}

const statusColorMap: Record<string, string> = {
  SUBMITTED: '#F27D26',
  UNDER_REVIEW: '#8B5CF6',
  ASSIGNED: '#3B82F6',
  IN_PROGRESS: '#3B82F6',
};

export const ComplaintsMapView: React.FC<ComplaintsMapViewProps> = ({
  complaints,
  showCitizenInfo = false,
}) => {
  // Filter: only active complaints with valid coordinates
  const activeComplaints = complaints.filter(
    (c) =>
      c.status !== ComplaintStatus.RESOLVED &&
      c.status !== ComplaintStatus.REJECTED &&
      c.latitude != null &&
      c.longitude != null
  );

  const positions: [number, number][] = activeComplaints.map((c) => [
    c.latitude!,
    c.longitude!,
  ]);

  // Default center: India center, or first marker
  const defaultCenter: [number, number] =
    positions.length > 0 ? positions[0] : [20.5937, 78.9629];

  if (activeComplaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center">
        <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-zinc-900 mb-1">No Active Complaints on Map</h3>
        <p className="text-sm text-zinc-500 max-w-sm">
          There are no active complaints with location data to display. Resolved and rejected complaints are excluded.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[500px] rounded-2xl overflow-hidden border border-zinc-200 relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        minZoom={4}
        maxBounds={[[6.0, 68.0], [36.0, 98.0]]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
          bounds={[[6.0, 68.0], [36.0, 98.0]]}
        />
        <FitBounds positions={positions} />
        <MapResizer />

        {activeComplaints.map((complaint) => (
          <Marker
            key={complaint.id}
            position={[complaint.latitude!, complaint.longitude!]}
            icon={complaintIcon}
          >
            <Popup maxWidth={320} minWidth={240}>
              <div style={{ fontFamily: 'inherit', lineHeight: 1.5 }}>
                <h4 style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '14px', color: '#18181B' }}>
                  {complaint.title}
                </h4>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#71717A' }}>
                  {complaint.description.length > 120
                    ? complaint.description.substring(0, 120) + '…'
                    : complaint.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', fontSize: '11px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#52525B' }}>Category:</span>
                  <span style={{ color: '#71717A' }}>{complaint.category}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', fontSize: '11px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#52525B' }}>Status:</span>
                  <span style={{
                    color: statusColorMap[complaint.status] || '#71717A',
                    fontWeight: 600,
                  }}>
                    {complaint.status.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', fontSize: '11px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#52525B' }}>Priority:</span>
                  <span style={{
                    color: complaint.priority === 'CRITICAL' ? '#EF4444' : complaint.priority === 'HIGH' ? '#F59E0B' : '#71717A',
                    fontWeight: 600,
                  }}>
                    {complaint.priority}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', fontSize: '11px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#52525B' }}>Department:</span>
                  <span style={{ color: '#71717A' }}>{complaint.department || 'Unassigned'}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', fontSize: '11px', marginBottom: showCitizenInfo ? '6px' : '0' }}>
                  <span style={{ fontWeight: 600, color: '#52525B' }}>Location:</span>
                  <span style={{ color: '#71717A' }}>{complaint.location || 'N/A'}</span>
                </div>
                {showCitizenInfo && (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', fontSize: '11px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: '#52525B' }}>Citizen Name:</span>
                      <span style={{ color: '#71717A' }}>{complaint.citizenName || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', fontSize: '11px' }}>
                      <span style={{ fontWeight: 600, color: '#52525B' }}>Citizen ID:</span>
                      <span style={{ color: '#71717A', fontFamily: 'monospace', fontSize: '10px' }}>{complaint.citizenId || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
