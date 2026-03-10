import React from 'react';
import { Card, Button } from '../components/UI';
import { MapPin, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MapPage: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Nearby Issues</h1>
      </header>
      
      <Card className="h-[600px] flex items-center justify-center bg-zinc-50 border-dashed border-2">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto">
            <MapPin className="w-8 h-8 text-[#F27D26]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900">Interactive Map</h3>
            <p className="text-zinc-500">Map view is being initialized. You will see reported issues in your vicinity here.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
