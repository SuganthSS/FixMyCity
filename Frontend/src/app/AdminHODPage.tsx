import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../types';
import { Card, Badge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { getFullImageUrl } from '../lib/utils';
import api from '../services/api';

export const AdminHODPage: React.FC = () => {
  const { users } = useAuth();
  const [departments, setDepartments] = useState<Record<string, string>>({});

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await api.get('/admin/users');
      const deptMap: Record<string, string> = {};
      res.data.forEach((u: any) => {
        if (u.department) deptMap[u._id || u.id] = u.department;
      });
      setDepartments(deptMap);
    } catch(e) {
      console.error('Failed to fetch user departments', e);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments, users]);

  const hodUsers = users.filter(u => u.role === UserRole.HOD);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">HOD Management</h1>
        <p className="text-zinc-500 mt-1">Overview of Department Heads and their current status.</p>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">Department Heads</h3>
          <Badge className="bg-zinc-100 text-zinc-600">{hodUsers.length} Total</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm">HOD User</th>
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Email</th>
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Department</th>
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {hodUsers.map((u) => {
                const currentDept = departments[u.id];

                return (
                  <tr key={u.id} className="hover:bg-zinc-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100 shrink-0">
                          <img src={getFullImageUrl(u.avatar)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <p className="font-bold text-zinc-900 text-sm">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      {currentDept ? (
                        <Badge className="bg-blue-50 text-blue-600 border-blue-100">{currentDept}</Badge>
                      ) : (
                        <Badge className="bg-zinc-50 text-zinc-500">Not Set</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.isBanned ? (
                        <Badge className="bg-red-50 text-red-600 border-red-100">Banned</Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100">Active</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
              {hodUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 text-sm">
                    No HOD accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
