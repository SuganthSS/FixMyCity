import React from 'react';
import { Card, Button } from '../components/UI';
import { MessageSquare, ArrowLeft, Send, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SupportPage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Customer Support</h1>
      </header>
      
      <Card className="h-[600px] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center gap-4 bg-zinc-50">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <User className="w-6 h-6 text-[#2563EB]" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900">Support Agent</h3>
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              Online
            </p>
          </div>
        </div>
        
        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-white">
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-100 text-sm text-zinc-800">
              Hello! How can I help you today with your city service requests?
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-zinc-100">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-1 bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <Button size="icon" className="rounded-xl">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
