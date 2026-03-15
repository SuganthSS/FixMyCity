import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import { BarChart3, PieChart as PieIcon, TrendingUp, ArrowLeft, Filter, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useComplaints } from '../context/ComplaintContext';
import { ComplaintStatus, ComplaintCategory, Department } from '../types';

const STATUS_COLORS: Record<string, string> = {
  [ComplaintStatus.SUBMITTED]: '#F59E0B',
  [ComplaintStatus.UNDER_REVIEW]: '#3B82F6',
  [ComplaintStatus.IN_PROGRESS]: '#8B5CF6',
  [ComplaintStatus.RESOLVED]: '#10B981',
  [ComplaintStatus.REJECTED]: '#EF4444',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Road Issue': '#10B981',
  'Streetlight Issue': '#3B82F6',
  'Drainage Issue': '#8B5CF6',
  'Water Leak': '#F59E0B',
};

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#A855F7'];

export const AnalyticsPage: React.FC = () => {
  const { complaints } = useComplaints();

  const categoryData = Object.values(complaints.reduce((acc: any, curr) => {
    acc[curr.category] = acc[curr.category] || { name: curr.category, value: 0 };
    acc[curr.category].value += 1;
    return acc;
  }, {}));

  const statusData = Object.values(complaints.reduce((acc: any, curr) => {
    acc[curr.status] = acc[curr.status] || { name: curr.status.replace('_', ' '), value: 0 };
    acc[curr.status].value += 1;
    return acc;
  }, {}));

  const departmentData = Object.values(complaints.reduce((acc: any, curr) => {
    const dept = curr.department || 'Unassigned';
    acc[dept] = acc[dept] || { name: dept, value: 0 };
    acc[dept].value += 1;
    return acc;
  }, {}));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/dashboard">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">System Analytics</h1>
            <p className="text-zinc-500 mt-1">Detailed breakdown of city service performance.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-zinc-900">Complaints by Category</h3>
            <BarChart3 className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="h-[300px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F4F4F5" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717A' }} width={100} />
                  <Tooltip 
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={30}>
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94A3B8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                No data available
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-zinc-900">Status Distribution</h3>
            <PieIcon className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="h-[300px] w-full">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry: any, index: number) => {
                      const statusKey = Object.keys(STATUS_COLORS).find(key => key.replace('_', ' ') === entry.name);
                      return <Cell key={`cell-${index}`} fill={statusKey ? STATUS_COLORS[statusKey] : COLORS[index % COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                No data available
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-zinc-900">Department Performance</h3>
            <TrendingUp className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="h-[300px] w-full">
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717A' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717A' }} />
                  <Tooltip 
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                    {departmentData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                No data available
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
