import React from 'react';
import { Card, Button, Badge } from '../components/UI';
import { Calendar, ArrowLeft, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MaintenancePage: React.FC = () => {
  const maintenanceItems = [
    { id: 1, title: 'Road Resurfacing', location: 'Oak Avenue', date: '2024-03-15', status: 'Upcoming' },
    { id: 2, title: 'Streetlight Replacement', location: 'Pine Street', date: '2024-03-18', status: 'Scheduled' },
    { id: 3, title: 'Water Main Inspection', location: 'Maple Drive', date: '2024-03-20', status: 'Planned' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Scheduled Maintenance</h1>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maintenanceItems.map((item) => (
          <Card key={item.id} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <Badge>{item.status}</Badge>
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">{item.title}</h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-zinc-500 font-medium">
                <MapPin className="w-4 h-4" />
                {item.location}
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500 font-medium">
                <Clock className="w-4 h-4" />
                {new Date(item.date).toLocaleDateString()}
              </div>
            </div>
            <Button variant="outline" className="w-full">View Details</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
