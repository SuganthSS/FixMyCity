import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button } from '../components/UI';
import { MapPin, ArrowLeft, Navigation, AlertCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { complaintApi } from '../services/complaintApi';
import { ComplaintsMapView } from '../components/ComplaintsMapView';
import { Complaint } from '../types';
import { useTranslation } from 'react-i18next';
import { calculateHaversineDistance, getBoundingBox } from '../lib/utils';

export const MapPage: React.FC = () => {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [status, setStatus] = useState<'requesting' | 'granted' | 'denied' | 'error'>('requesting');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await complaintApi.getPublicComplaints();
        setComplaints(data);
      } catch (error) {
        console.error('Failed to fetch public complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();

    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setStatus('granted');
      },
      (error) => {
        console.error('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('denied');
        } else {
          setStatus('error');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const filteredComplaints = useMemo(() => {
    let result = [...complaints];
    
    if (userLocation) {
      result = result.filter(c => {
        if (!c.latitude || !c.longitude) return false;
        const dist = calculateHaversineDistance(userLocation[0], userLocation[1], c.latitude, c.longitude);
        return dist <= 25;
      });

      result.sort((a, b) => {
        const distA = calculateHaversineDistance(userLocation[0], userLocation[1], a.latitude!, a.longitude!);
        const distB = calculateHaversineDistance(userLocation[0], userLocation[1], b.latitude!, b.longitude!);
        if (Math.abs(distA - distB) > 0.1) return distA - distB;
        return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
      });
    } else {
      result.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
    }

    return result;
  }, [complaints, userLocation]);

  const mapBounds = useMemo(() => {
    if (!userLocation) return undefined;
    const [[swLat, swLng], [neLat, neLng]] = getBoundingBox(userLocation[0], userLocation[1], 25);
    return [[swLat, swLng], [neLat, neLng]] as [[number, number], [number, number]];
  }, [userLocation]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Nearby Issues</h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">Viewing all reported issues in your area.</p>
          </div>
        </div>
        
        {userLocation && (
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-xs md:text-sm font-bold animate-in fade-in slide-in-from-right-4 duration-500 w-fit">
              <MapPin className="w-3.5 h-3.5 md:w-4 h-4" />
              <span>{filteredComplaints.length} issues found</span>
           </div>
        )}
      </header>

      <div className="space-y-6">
        {status === 'requesting' && (
          <Card className="h-[400px] md:h-[600px] flex items-center justify-center bg-zinc-50 border-dashed border-2">
            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                <Navigation className="w-8 h-8 text-[#000000]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Locating You...</h3>
                <p className="text-sm text-zinc-500">Please allow location access to see issues near you.</p>
              </div>
            </div>
          </Card>
        )}

        {status === 'denied' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 text-[#374151] rounded-2xl border border-gray-200 shadow-sm">
                <Info className="w-5 h-5" />
                <p className="font-medium">Enable location to see issues near you (within 25km). Showing all issues sorted by priority.</p>
            </div>
            <Card className="overflow-hidden border-zinc-100 shadow-premium">
              <ComplaintsMapView complaints={filteredComplaints} />
            </Card>
          </div>
        )}

        {status === 'error' && (
          <Card className="h-[600px] flex items-center justify-center bg-zinc-50 border-dashed border-2">
             <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                <MapPin className="w-8 h-8 text-[#000000]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Map View</h3>
                <p className="text-zinc-500">We couldn't determine your location. Showing all public issues.</p>
              </div>
              <div className="pt-4">
                 <ComplaintsMapView complaints={filteredComplaints} />
              </div>
            </div>
          </Card>
        )}

        {status === 'granted' && (
          <Card className="overflow-hidden border-zinc-100 shadow-premium">
            <ComplaintsMapView 
              complaints={filteredComplaints} 
              center={userLocation || undefined} 
              bounds={mapBounds}
            />
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-gray-50 border-gray-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <Navigation className="w-4 h-4 text-[#000000]" />
            </div>
            <h4 className="font-bold text-zinc-900">Notice anything?</h4>
          </div>
          <p className="text-zinc-600 text-sm mb-6 flex-grow">Report any civic issue directly from the map location.</p>
          <Link to="/report">
            <Button className="w-full bg-[#000000] text-white hover:bg-[#1F2937] font-bold border-none shadow-premium py-2">
              Report an Issue
            </Button>
          </Link>
        </Card>
        
        <Card className="p-6 lg:col-span-2 border-zinc-100 bg-white">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
               <MapPin className="w-6 h-6 text-[#000000]" />
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 mb-1 leading-tight">About Nearby Issues</h4>
              <p className="text-sm text-zinc-500 leading-relaxed md:max-w-md">
                {userLocation 
                  ? "Showing only public complaints within 25km of your location, sorted by distance. Click on any marker for details."
                  : "Enable location to filter complaints by distance. Currently showing reports sorted by community impact."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
