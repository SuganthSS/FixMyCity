import React from 'react';
import { Card } from '../components/UI';
import { MessageSquare, Inbox } from 'lucide-react';

export const MessageCenter: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Message Center</h1>
        <p className="text-zinc-500 mt-1">Communicate with city departments regarding your reports.</p>
      </header>

      <Card className="p-20 flex flex-col items-center justify-center text-center bg-zinc-50/50 border-dashed border-2">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
          <Inbox className="w-10 h-10 text-zinc-300" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900">No messages yet</h3>
        <p className="text-zinc-500 mt-2 max-w-xs mx-auto">
          Your conversations with administrators and department heads will appear here.
        </p>
      </Card>
    </div>
  );
};
