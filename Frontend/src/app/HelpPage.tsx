import React from 'react';
import { Card } from '../components/UI';
import { HelpCircle, FileText, Activity, ShieldCheck, UserCheck } from 'lucide-react';

export const HelpPage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">User Guide</h1>
        <p className="text-zinc-500 mt-1">Learn how to use FixMyCity to improve your neighborhood.</p>
      </header>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#F27D26]" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">How to report a complaint</h2>
          </div>
          <p className="text-zinc-600 text-sm leading-relaxed">
            To report a new issue, navigate to the "Report Issue" page from the sidebar. 
            Fill in the title, select a relevant category, provide the location, and write a detailed description. 
            Uploading a clear photo of the issue helps our team assess and prioritize the repair more effectively.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Complaint lifecycle explanation</h2>
          </div>
          <div className="space-y-4">
            <p className="text-zinc-600 text-sm leading-relaxed">
              Every reported issue goes through a structured process:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold text-zinc-900 text-xs block mb-1">SUBMITTED</span>
                <span className="text-[11px] text-zinc-500">Your report has been received and is waiting for initial review.</span>
              </li>
              <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold text-zinc-900 text-xs block mb-1">UNDER REVIEW</span>
                <span className="text-[11px] text-zinc-500">An administrator is verifying the details and assessing priority.</span>
              </li>
              <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold text-zinc-900 text-xs block mb-1">ASSIGNED</span>
                <span className="text-[11px] text-zinc-500">The issue has been routed to the appropriate city department.</span>
              </li>
              <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold text-zinc-900 text-xs block mb-1">IN PROGRESS</span>
                <span className="text-[11px] text-zinc-500">A repair crew has been dispatched and work is underway.</span>
              </li>
              <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold text-zinc-900 text-xs block mb-1">RESOLVED</span>
                <span className="text-[11px] text-zinc-500">The work is complete and the issue has been fixed.</span>
              </li>
              <li className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold text-zinc-900 text-xs block mb-1">REJECTED</span>
                <span className="text-[11px] text-zinc-500">The report was invalid or falls outside city jurisdiction.</span>
              </li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">How to track complaint status</h2>
          </div>
          <p className="text-zinc-600 text-sm leading-relaxed">
            You can monitor all your reports in the "My Complaints" section. 
            Each report shows a status badge and a priority level. 
            Clicking on a specific complaint will show you a detailed timeline of all actions taken by city officials.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Admin complaint workflow</h2>
          </div>
          <p className="text-zinc-600 text-sm leading-relaxed">
            Administrators use the Admin Dashboard to oversee city-wide issues. 
            They can filter reports by priority, assign them to specific departments (Road, Water, Electricity, etc.), 
            and update the status as work progresses. This ensures that every citizen report is handled by the right team.
          </p>
        </Card>
      </div>
    </div>
  );
};
