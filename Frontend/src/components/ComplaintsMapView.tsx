import React, { useEffect } from 'react';
import { MapPin, Info, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Complaint, ComplaintStatus } from '../types';
import { useTranslation } from 'react-i18next';
import { Badge } from './UI';

// Status Color Mapping
const statusColorMap: Record<string, string> = {
  SUBMITTED: '#F59E0B',
  UNDER_REVIEW: '#3B82F6',
  IN_PROGRESS: '#8B5CF6',
  RESOLVED: '#10B981',
  REJECTED: '#EF4444',
};

const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];
const CHENNAI_BOUNDS: [[number, number], [number, number]] = [[12.7, 79.8], [13.4, 80.7]];

// Functional component to handle programmatic map updates
const MapViewHandler: React.FC<{
  bounds?: [[number, number], [number, number]];
  center?: [number, number];
}> = ({ bounds, center }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      const leafletBounds = L.latLngBounds(bounds[0], bounds[1]);
      // Use fitBounds to zoom into the 25km area
      map.fitBounds(leafletBounds, { padding: [20, 20] });
      // Restrict panning to this area
      map.setMaxBounds(leafletBounds);
      // Prevent zooming out beyond the 25km area
      map.setMinZoom(12);
    } else {
      // Restore defaults for Chennai view
      const leafletChennaiBounds = L.latLngBounds(CHENNAI_BOUNDS[0], CHENNAI_BOUNDS[1]);
      map.setMaxBounds(leafletChennaiBounds);
      map.setMinZoom(10);
      if (center) {
        map.setView(center, 15);
      } else {
        map.setView(CHENNAI_CENTER, 12);
      }
    }
  }, [map, bounds, center]);

  return null;
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

// User location "blue dot" icon
const getUserLocationIcon = () => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-10 h-10 rounded-full bg-[#000000] opacity-20 animate-pulse"></div>
        <div class="relative w-5 h-5 bg-[#000000] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Auto-fit bounds to all markers (only if no manual bounds/center provided)
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
  showCitizenInfo?: boolean;
  center?: [number, number];
  zoom?: number;
  bounds?: [[number, number], [number, number]];
}

export const ComplaintsMapView: React.FC<ComplaintsMapViewProps> = ({
  complaints,
  center,
  bounds,
}) => {
  const { t } = useTranslation();

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

  const INDIA_BOUNDS: L.LatLngBoundsExpression = [[5.5, 66.0], [38.5, 99.0]];

  return (
    <div className="h-[600px] rounded-2xl border-4 border-white shadow-premium relative z-0 group">
      <MapContainer
        center={center || CHENNAI_CENTER}
        zoom={center ? 15 : 12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        minZoom={10}
        maxBounds={CHENNAI_BOUNDS}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
        className="rounded-2xl"
      >
        <MapViewHandler bounds={bounds} center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          noWrap={true}
        />
        {!center && !bounds && <FitBounds positions={positions} />}
        <MapResizer />

        {/* User Location Marker */}
        {center && (
          <Marker position={center} icon={getUserLocationIcon()} zIndexOffset={1000}>
            <Popup>{t('mapView.userLocation')}</Popup>
          </Marker>
        )}

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
                    <MapPin className="w-3.5 h-3.5 text-[#000000]" />
                    <span>{complaint.location || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-[#000000]" />
                    <span>{t('mapView.createdOn', { date: new Date(complaint.createdAt).toLocaleDateString() })}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5 text-[#000000]" />
                    <span>{t('mapView.categoryLabel')} <span className="text-slate-600 ml-1">{complaint.category}</span></span>
                  </div>
                </div>
                
                <div className="mt-5">
                   <Link to={`/complaints/${complaint.id}`} className="block">
                      <button className="w-full py-2.5 bg-[#000000] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#1F2937] transition-colors shadow-lg shadow-black/10">
                        {t('mapView.viewDetails')}
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
          <Info className="w-3 h-3 text-[#000000]" />
          {t('mapView.statusLegend')}
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
