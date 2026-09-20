import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  MapPin, 
  Send, 
  X, 
  Info,
  ChevronDown,
  Plus
} from 'lucide-react';
import { ComplaintCategory, CATEGORY_TAXONOMY, Severity } from '../types';
import { Button, Input, Label, Card } from '../components/UI';
import { complaintApi } from '../services/complaintApi';

export const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(ComplaintCategory.ROAD_ISSUE);
  const [subCategory, setSubCategory] = useState<string>(
    CATEGORY_TAXONOMY[ComplaintCategory.ROAD_ISSUE]?.[0] || 'General'
  );
  const [severity, setSeverity] = useState<string>('MODERATE');
  const [location, setLocation] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('severity', severity);
      formData.append('location', location);

      images.forEach((file) => {
        formData.append('images', file);
      });

      await complaintApi.createComplaint(formData);
      navigate('/my-complaints');
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Report an Issue</h1>
        <p className="text-zinc-500 mt-1">Provide details about the civic problem you've encountered.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl">
          {error}
        </div>
      )}

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <div className="relative">
                  <select 
                    id="category"
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20"
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    {Object.values(ComplaintCategory).map(cat => (
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
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                  >
                    {(CATEGORY_TAXONOMY[category] || ['General']).map(subCat => (
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
                    className="w-full h-10 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                  >
                    {Object.values(Severity).map(sev => (
                      <option key={sev} value={sev}>{sev}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
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
                Multiple photos (up to 5) help us assess the issue thoroughly.
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
