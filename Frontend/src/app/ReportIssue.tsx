import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  MapPin,
  Send,
  X,
  AlertCircle,
  Locate,
  ChevronDown,
  Plus,
  Info
} from 'lucide-react';
import { ComplaintCategory, CATEGORY_TAXONOMY, Severity, Priority } from '../types';
import { Button, Input, Label, Card } from '../components/UI';
import { useTranslation } from 'react-i18next';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { complaintApi } from '../services/complaintApi';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const SelectionIcon = L.divIcon({
  html: `<div class="w-8 h-8 bg-[#000000] rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-bounce">
          <div class="w-2 h-2 bg-white rounded-full"></div>
         </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const CHENNAI_BOUNDS: [[number, number], [number, number]] = [[12.7, 79.8], [13.4, 80.7]];
const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition, setLocation }: {
  position: [number, number] | null,
  setPosition: (pos: [number, number]) => void,
  setLocation: (loc: string) => void
}) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const bounds = L.latLngBounds(CHENNAI_BOUNDS[0], CHENNAI_BOUNDS[1]);
      if (bounds.contains(e.latlng)) {
        setPosition([lat, lng]);
        setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } else {
        alert("Please select a location within city limits.");
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
  const { refreshComplaints } = useComplaints();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(ComplaintCategory.ROAD_ISSUE);
  const [subCategory, setSubCategory] = useState<string>(
    CATEGORY_TAXONOMY[ComplaintCategory.ROAD_ISSUE]?.[0] || 'General'
  );
  const [severity, setSeverity] = useState<string>('MODERATE');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [landmark, setLandmark] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const subCats = CATEGORY_TAXONOMY[newCat] || ['General'];
    setSubCategory(subCats[0]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 5 - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newImages = [...images, ...filesToAdd];
    setImages(newImages);

    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file as File));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const latlng = L.latLng(latitude, longitude);
        const bounds = L.latLngBounds(CHENNAI_BOUNDS[0], CHENNAI_BOUNDS[1]);

        if (bounds.contains(latlng)) {
          setCoords([latitude, longitude]);
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } else {
          setCoords([latitude, longitude]);
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('severity', severity);
      formData.append('priority', priority);
      formData.append('location', location);
      if (landmark) formData.append('landmark', landmark);
      if (coords) {
        formData.append('latitude', coords[0].toString());
        formData.append('longitude', coords[1].toString());
      }

      images.forEach((file) => {
        formData.append('images', file);
      });

      await complaintApi.createComplaint(formData);
      await refreshComplaints();
      setIsSubmitting(false);
      navigate('/my-complaints');
    } catch (err: any) {
      console.error('Submission failed:', err);
      setError(err.response?.data?.message || 'Failed to submit report.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Report an Issue</h1>
        <p className="text-zinc-500 mt-1 text-sm md:text-base">Provide details about the civic problem you've encountered.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <Card className="p-6 space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="title">Issue Title</Label>
              <Input
                id="title"
                placeholder="e.g., Large pothole on 5th Avenue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <div className="relative">
                  <select
                    id="category"
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20 cursor-pointer"
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    {Object.values(ComplaintCategory).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subCategory">SubCategory</Label>
                <div className="relative">
                  <select
                    id="subCategory"
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20 cursor-pointer"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                  >
                    {(CATEGORY_TAXONOMY[category] || ['General']).map((subCat) => (
                      <option key={subCat} value={subCat}>{subCat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="severity">Severity</Label>
                <div className="relative">
                  <select
                    id="severity"
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20 cursor-pointer"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                  >
                    {Object.values(Severity).map((sev) => (
                      <option key={sev} value={sev}>{sev}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="location">Location / Address</Label>
                  <button
                    type="button"
                    onClick={getUserLocation}
                    className="text-xs text-[#000000] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Locate className="w-3 h-3" /> Use GPS
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    id="location"
                    placeholder="Enter address or select on map below"
                    className="pl-10"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="landmark">Landmark (Optional)</Label>
                <Input
                  id="landmark"
                  placeholder="e.g., Near City Bus Stand"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Select Location on Map</Label>
              <div className="h-56 w-full rounded-2xl overflow-hidden border border-zinc-200 relative">
                <MapContainer
                  center={coords || CHENNAI_CENTER}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                  maxBounds={CHENNAI_BOUNDS}
                  maxBoundsViscosity={1.0}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={coords} setPosition={setCoords} setLocation={setLocation} />
                  <RecenterMap position={coords} />
                  <MapResizer />
                </MapContainer>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={4}
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F27D26] focus-visible:ring-offset-2"
                placeholder="Describe the issue in detail. Mention any specific hazards or urgency."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Label>Upload Evidence (Photos up to 5)</Label>
              <span className="text-xs text-zinc-400 font-semibold">{images.length} / 5 uploaded</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {previews.map((previewUrl, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden border border-zinc-200 aspect-square group">
                  <img src={previewUrl} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-50 hover:border-[#F27D26]/50 transition-all group">
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      {images.length === 0 ? <Camera className="w-5 h-5 text-zinc-400" /> : <Plus className="w-5 h-5 text-zinc-400" />}
                    </div>
                    <p className="text-xs text-zinc-700 font-semibold">Add Photo</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6 order-1 lg:order-2">
          <Card className="p-6 bg-zinc-900 text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#F27D26]" />
              Submission Guidelines
            </h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26] mt-1.5 shrink-0" />
                Select accurate location on the Leaflet map.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26] mt-1.5 shrink-0" />
                Multiple photos (up to 5) help staff assess priority quickly.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26] mt-1.5 shrink-0" />
                Select SubCategory to ensure fast auto-assignment.
              </li>
            </ul>
          </Card>

          <Button type="submit" className="w-full h-14 text-lg" isLoading={isSubmitting}>
            Submit Report
            <Send className="ml-2 w-5 h-5" />
          </Button>

          <p className="text-[11px] text-zinc-400 text-center px-4">
            By submitting, you agree to our terms of service and confirm the information provided is accurate.
          </p>
        </div>
      </form>
    </div>
  );
};
