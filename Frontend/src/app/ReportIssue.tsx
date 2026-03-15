import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  MapPin,
  Send,
  X,
  AlertCircle,
  ChevronDown,
  Locate
} from 'lucide-react';
import { ComplaintCategory, Priority } from '../types';
import { Button, Input, Label, Card } from '../components/UI';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { getFullImageUrl } from '../lib/utils';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Custom highlighted marker for selection
const SelectionIcon = L.divIcon({
  html: `<div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-bounce">
          <div class="w-2 h-2 bg-white rounded-full"></div>
         </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const INDIA_BOUNDS: L.LatLngBoundsExpression = [[5.5, 66.0], [38.5, 99.0]];

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition, setLocation }: {
  position: [number, number] | null,
  setPosition: (pos: [number, number]) => void,
  setLocation: (loc: string) => void
}) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const bounds = L.latLngBounds(INDIA_BOUNDS);
      if (bounds.contains(e.latlng)) {
        setPosition([lat, lng]);
        setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } else {
        alert("Please select a location within India.");
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={SelectionIcon} />
  );
};

const RecenterMap = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
};

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    // Small delay to ensure container size is finalized
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

export const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addComplaint } = useComplaints();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>(ComplaintCategory.ROAD_ISSUE);
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [landmark, setLandmark] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurringIssue, setRecurringIssue] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const latlng = L.latLng(latitude, longitude);
        const bounds = L.latLngBounds(INDIA_BOUNDS);
        
        if (bounds.contains(latlng)) {
          setCoords([latitude, longitude]);
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } else {
          alert(t('report.mapHint'));
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      console.log('Submitting report with state:', { title, description, category, location, coords, landmark, issueDate, recurringIssue });
      // Create new complaint object
      await addComplaint({
        title,
        description,
        category,
        location,
        latitude: coords ? coords[0] : undefined,
        longitude: coords ? coords[1] : undefined,
        priority: Priority.MEDIUM,
        landmark,
        issueDate,
        recurringIssue,
        imageUrl: image || 'https://picsum.photos/seed/civic/800/600',
        citizenId: user.id,
        citizenName: user.name
      });

      setIsSubmitting(false);
      navigate('/my-complaints');
    } catch (error) {
      console.error('Submission failed:', error);
      setIsSubmitting(false);
      // You could add a toast or error message here if the UI supports it
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{t('report.title')}</h1>
        <p className="text-zinc-500 mt-1">{t('report.desc')}</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="title">{t('report.issueTitle')}</Label>
              <Input
                id="title"
                placeholder={t('report.titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">{t('report.category')}</Label>
                <div className="relative">
                  <select
                    id="category"
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                  >
                    {Object.values(ComplaintCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location">{t('report.location')}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    id="location"
                    placeholder={t('report.mapPlaceholder')}
                    className="pl-10"
                    value={location}
                    readOnly
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="landmark">{t('report.landmark', 'Landmark')}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    id="landmark"
                    placeholder={t('report.landmarkPlaceholder', 'e.g. Near City Hospital')}
                    className="pl-10"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="issueDate">{t('report.issueDate', 'Issue Date')}</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>{t('report.recurringIssue', 'Recurring Issue?')}</Label>
                <div className="flex items-center gap-4 h-10">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recurring"
                      checked={recurringIssue === true}
                      onChange={() => setRecurringIssue(true)}
                      className="w-4 h-4 text-[#2563EB]"
                    />
                    <span className="text-sm font-medium">{t('common.yes', 'Yes')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recurring"
                      checked={recurringIssue === false}
                      onChange={() => setRecurringIssue(false)}
                      className="w-4 h-4 text-[#2563EB]"
                    />
                    <span className="text-sm font-medium">{t('common.no', 'No')}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between mb-1.5">
                <Label className="mb-0">{t('report.mapSelection')}</Label>
                <button
                  type="button"
                  onClick={getUserLocation}
                  className="text-xs font-bold text-[#2563EB] flex items-center gap-1 hover:underline"
                >
                  <Locate className="w-3 h-3" />
                  {t('report.useMyLocation')}
                </button>
              </div>
              <div className="h-[400px] rounded-2xl border-4 border-white shadow-premium z-0 relative group">
                <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-50 transition-opacity duration-700 pointer-events-none opacity-0 group-[.loading]:opacity-100">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <MapContainer 
                  bounds={INDIA_BOUNDS}
                  zoom={5} 
                  minZoom={5}
                  maxZoom={18}
                  maxBounds={INDIA_BOUNDS}
                  maxBoundsViscosity={1.0}
                  scrollWheelZoom={false} 
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-2xl"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png"
                    noWrap={true}
                    bounds={INDIA_BOUNDS}
                  />
                  <LocationMarker position={coords} setPosition={setCoords} setLocation={setLocation} />
                  <RecenterMap position={coords} />
                  <MapResizer />
                </MapContainer>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">{t('report.mapHint')}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">{t('report.description')}</Label>
              <textarea
                id="description"
                rows={5}
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                placeholder={t('report.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </Card>

          <Card className="p-6">
            <Label className="mb-4">{t('report.uploadPhoto')}</Label>
            {image ? (
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 aspect-video">
                <img src={getFullImageUrl(image)} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-50 hover:border-[#2563EB]/50 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-zinc-400" />
                  </div>
                  <p className="mb-1 text-sm text-zinc-700 font-semibold">{t('report.clickToUpload')}</p>
                  <p className="text-xs text-zinc-500">{t('report.photoRequirements')}</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}
          </Card>

          <div className="pt-4 space-y-4">
            <Button type="submit" className="w-full h-14 text-lg" isLoading={isSubmitting}>
              {t('report.submit')}
              <Send className="ml-2 w-5 h-5" />
            </Button>

            <p className="text-[11px] text-zinc-400 text-center px-4">
              {t('report.termsHint')}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-blue-50/80 border-blue-100/50 text-slate-900 border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#2563EB]" />
              {t('report.submissionTips')}
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 font-medium">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                {t('report.tips.0')}
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                {t('report.tips.1')}
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                {t('report.tips.2')}
              </li>
            </ul>
          </Card>
        </div>
      </form>
    </div>
  );
};
