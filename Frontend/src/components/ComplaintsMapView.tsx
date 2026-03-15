import React, { useEffect } from 'react';
import { MapPin, Info, ArrowUpRight, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Complaint, ComplaintStatus } from '../types';
import { Badge } from './UI';

// Status Color Mapping
const statusColorMap: Record<string, string> = {
  SUBMITTED: '#F59E0B',
  UNDER_REVIEW: '#3B82F6',
  IN_PROGRESS: '#8B5CF6',
  RESOLVED: '#10B981',
  REJECTED: '#EF4444',
};

// Create a custom colored marker icon based on status
const getStatusIcon = (status: string) => {
  const color = statusColorMap[status] || '#94A3B8';
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full opacity-20 animate-ping" style="background-color: ${color}"></div>
        <div class="relative w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center" style="background-color: ${color}">
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

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
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <MapPin className="w-6 h-6 text-[#2563EB]" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 mb-1">No Active Complaints on Map</h3>
        <p className="text-sm text-zinc-500 max-w-sm">
          There are no active complaints with location data to display. Resolved and rejected complaints are excluded.
        </p>
      </div>
    );
  }

  const INDIA_BOUNDS: L.LatLngBoundsExpression = [[5.5, 66.0], [38.5, 99.0]];

  return (
    <div className="h-[500px] rounded-2xl border-4 border-white shadow-premium relative z-0 group">
      <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-50 transition-opacity duration-700 pointer-events-none opacity-0 group-[.loading]:opacity-100">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <MapContainer
        bounds={INDIA_BOUNDS}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        minZoom={5}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
        className="rounded-2xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          noWrap={true}
          bounds={INDIA_BOUNDS}
        />
        <FitBounds positions={positions} />
        <MapResizer />

        {activeComplaints.map((complaint) => (
          <Marker
            key={complaint.id}
            position={[complaint.latitude!, complaint.longitude!]}
            icon={getStatusIcon(complaint.status)}
          >
            <Popup maxWidth={360} minWidth={280}>
              <div className="p-5 font-sans">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={complaint.status}>{complaint.status.replace('_', ' ')}</Badge>
                  <Badge variant={complaint.priority}>{complaint.priority}</Badge>
                </div>
                
                <h4 className="text-base font-bold text-slate-900 mb-2 leading-tight">
                  {complaint.title}
                </h4>
                
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                  {complaint.description}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{complaint.location || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Created {new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>Category: <span className="text-slate-600 ml-1">{complaint.category}</span></span>
                  </div>
                </div>
                
                <div className="mt-5">
                   <Link to={`/complaints/${complaint.id}`} className="block">
                      <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                        View Details
                      </button>
                   </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Legend */}
      <div className="absolute bottom-6 right-6 z-[400] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-premium border border-white/50 space-y-3">
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
          <Info className="w-3 h-3 text-blue-600" />
          Status Legend
        </h5>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(statusColorMap).map(([status, color]) => (
            <div key={status} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
