import React, { useState, useEffect, useMemo } from 'react';
import { Complaint } from '../types';
import { complaintApi } from '../services/complaintApi';
import { Card, Badge, Button } from '../components/UI';
import { MapPin, ArrowUpCircle, Clock, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { getFullImageUrl } from '../lib/utils';

// Haversine formula to calculate distance between two coordinates
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const PublicFeed: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState<Record<string, boolean>>({});
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await complaintApi.getPublicComplaints();
        setComplaints(data.map((c: any) => ({ ...c, id: c._id || c.id })));
      } catch (error) {
        console.error('Failed to fetch public complaints:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();

    // Get user's location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          setLocationDenied(true);
        }
      );
    } else {
      setLocationDenied(true);
    }
  }, []);

  const handleUpvote = async (id: string) => {
    if (!user || upvoting[id]) return;

    setUpvoting(prev => ({ ...prev, [id]: true }));

    try {
      const updatedComplaint = await complaintApi.upvoteComplaint(id);
      
      setComplaints(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, upvotes: updatedComplaint.upvotes || [] };
        }
        return c;
      }));
    } catch (error) {
      console.error('Failed to upvote:', error);
      const data = await complaintApi.getPublicComplaints();
      setComplaints(data.map((c: any) => ({ ...c, id: c._id || c.id })));
    } finally {
      setUpvoting(prev => ({ ...prev, [id]: false }));
    }
  };

  const sortedComplaints = useMemo(() => {
    return [...complaints].sort((a, b) => {
      // If we have user location and neither complaint is missing coordinates
      if (userLocation && a.latitude && a.longitude && b.latitude && b.longitude) {
        const distA = getDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
        const distB = getDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        
        // Sort by distance first (closest first)
        // Only if difference is significant (e.g., > 1km), otherwise sort by upvotes
        if (Math.abs(distA - distB) > 1) {
          return distA - distB;
        }
      }
      
      // Secondary sort (or primary if location denied): upvotes
      const upvotesA = a.upvotes?.length || 0;
      const upvotesB = b.upvotes?.length || 0;
      if (upvotesA !== upvotesB) {
        return upvotesB - upvotesA; // Highest first
      }

      // Final fallback: newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [complaints, userLocation]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{t('publicFeed.title')}</h1>
        <p className="text-zinc-500 mt-1">{t('publicFeed.subtitle')}</p>
        
        {locationDenied && (
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-3 rounded-lg border border-blue-100 max-w-md">
            <Info className="w-4 h-4 shrink-0" />
            <p>{t('publicFeed.locationHint')}</p>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedComplaints.map((complaint, i) => {
          const upvotes = complaint.upvotes || [];
          const hasUpvoted = user ? upvotes.includes(user.id) : false;
          
          return (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={getFullImageUrl(complaint.imageUrl)}
                    alt={complaint.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant={complaint.status}>{t(`common.${complaint.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase())}`)}</Badge>
                    <Badge variant={complaint.priority}>{t(`common.${complaint.priority.toLowerCase()}`)}</Badge>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="text-lg font-bold text-zinc-900 mb-2">{complaint.title}</h4>
                  <p className="text-sm text-zinc-600 mb-4 line-clamp-2">{complaint.description}</p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-2 text-[12px] text-zinc-500 font-medium">
                      <MapPin className="w-4 h-4 text-[#2563EB]" />
                      <span className="line-clamp-1">{complaint.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </div>
                      
                      <button 
                        onClick={() => handleUpvote(complaint.id)}
                        disabled={upvoting[complaint.id]}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                          hasUpvoted 
                            ? 'bg-emerald-100 text-emerald-600 shadow-sm' 
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        } ${upvoting[complaint.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <ArrowUpCircle className={`w-4 h-4 ${hasUpvoted ? 'fill-emerald-200 text-emerald-600' : ''}`} />
                        {upvotes.length}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {sortedComplaints.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            {t('publicFeed.noComplaints')}
          </div>
        )}
      </div>
    </div>
  );
};
