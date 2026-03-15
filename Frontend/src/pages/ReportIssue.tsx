import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  MapPin, 
  Send, 
  X, 
  Info,
  ChevronDown
} from 'lucide-react';
import { ComplaintCategory, Priority } from '../types';
import { Button, Input, Label, Card } from '../components/UI';
import { motion } from 'motion/react';
import { getFullImageUrl } from '../lib/utils';

export const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>(ComplaintCategory.ROAD_ISSUE);
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/my-complaints');
    }, 1500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Report an Issue</h1>
        <p className="text-zinc-500 mt-1">Provide details about the civic problem you've encountered.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <div className="relative">
                  <select 
                    id="category"
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20"
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
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input 
                    id="location" 
                    placeholder="Enter address or landmark" 
                    className="pl-10"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea 
                id="description"
                rows={5}
                className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F27D26] focus-visible:ring-offset-2"
                placeholder="Describe the issue in detail. Mention any specific hazards or urgency."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </Card>

          <Card className="p-6">
            <Label className="mb-4">Upload Evidence (Photo)</Label>
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
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-50 hover:border-[#F27D26]/50 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-zinc-400" />
                  </div>
                  <p className="mb-1 text-sm text-zinc-700 font-semibold">Click to upload photo</p>
                  <p className="text-xs text-zinc-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-zinc-900 text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#F27D26]" />
              Submission Tips
            </h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26] mt-1.5 shrink-0" />
                Be specific about the location to help our team find it faster.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26] mt-1.5 shrink-0" />
                Clear photos help us assess the priority and required tools.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26] mt-1.5 shrink-0" />
                Mention if the issue is causing immediate danger.
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
