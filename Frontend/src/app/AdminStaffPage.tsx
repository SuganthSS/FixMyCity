import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserCheck, 
  UserX, 
  Shield 
} from 'lucide-react';
import { UserRole } from '../types';
import { Card, Badge, Button } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { getFullImageUrl } from '../lib/utils';
import api from '../services/api';

export const AdminStaffPage: React.FC = () => {
  const { users, updateOtherUser, fetchUsers } = useAuth();

  // Local state to hold department mappings (since AuthContext drops the department property)
  const [departments, setDepartments] = useState<Record<string, string>>({});
  const [selectedDepartments, setSelectedDepartments] = useState<Record<string, string>>({});
  const [assignStatus, setAssignStatus] = useState<Record<string, 'success' | 'error' | null>>({});

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
  }, [fetchDepartments, users]); // re-fetch if users context updates

  const handleAssignDepartment = async (userId: string) => {
    const departmentToAssign = selectedDepartments[userId];
    if (!departmentToAssign) return;
    try {
      await api.patch(`/admin/assign-department/${userId}`, { department: departmentToAssign });
      setAssignStatus(prev => ({ ...prev, [userId]: 'success' }));
      // Update local mapping for immediate feedback
      setDepartments(prev => ({ ...prev, [userId]: departmentToAssign }));
      setTimeout(() => setAssignStatus(prev => ({ ...prev, [userId]: null })), 3000);
    } catch (error) {
      console.error('Failed to assign department', error);
      setAssignStatus(prev => ({ ...prev, [userId]: 'error' }));
      setTimeout(() => setAssignStatus(prev => ({ ...prev, [userId]: null })), 3000);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Staff Management</h1>
        <p className="text-zinc-500 mt-1">Approve new staff members and manage existing team access.</p>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">Staff Members</h3>
          <Badge className="bg-zinc-100 text-zinc-600">{users.filter(u => u.role === UserRole.STAFF).length} Total</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Staff Member</th>
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Status</th>
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Joined</th>
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.filter(u => u.role === UserRole.STAFF).map((u) => {
                const isApprovedNotBanned = u.isApproved && !u.isBanned;
                const currentDept = departments[u.id];

                return (
                  <tr key={u.id} className="hover:bg-zinc-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100 shrink-0">
                          <img src={getFullImageUrl(u.avatar)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 text-sm">{u.name}</p>
                          <p className="text-xs text-zinc-500">{u.email}</p>
                          <div className="mt-1">
                            {currentDept ? (
                              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{currentDept}</span>
                            ) : (
                              <span className="bg-amber-50 text-amber-600 text-xs px-2 py-1 rounded-full">No Department</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {u.isBanned ? (
                          <Badge className="bg-red-50 text-red-600 border-red-100">Banned</Badge>
                        ) : !u.isApproved ? (
                          <Badge className="bg-orange-50 text-orange-600 border-orange-100">Pending Approval</Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100">Active</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isApprovedNotBanned && (
                          <div className="flex items-center gap-2 mr-4 border-r border-zinc-200 pr-4">
                            <select 
                              className="border border-gray-300 rounded-lg p-2 text-sm"
                              value={selectedDepartments[u.id] || currentDept || ''}
                              onChange={(e) => setSelectedDepartments(prev => ({ ...prev, [u.id]: e.target.value }))}
                            >
                              <option value="" disabled>Select Dept</option>
                              <option value="Road Issue">Road Issue</option>
                              <option value="Water Leak">Water Leak</option>
                              <option value="Streetlight Issue">Streetlight Issue</option>
                              <option value="Garbage Issue">Garbage Issue</option>
                              <option value="Drainage Issue">Drainage Issue</option>
                            </select>
                            <button 
                              onClick={() => handleAssignDepartment(u.id)}
                              className="bg-black text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-zinc-800 transition-colors"
                            >
                              Assign
                            </button>
                            {assignStatus[u.id] === 'success' && <span className="text-emerald-600 text-xs font-bold whitespace-nowrap">Assigned!</span>}
                            {assignStatus[u.id] === 'error' && <span className="text-red-600 text-xs font-bold whitespace-nowrap">Failed</span>}
                          </div>
                        )}
                        {!u.isApproved && !u.isBanned && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                            onClick={() => updateOtherUser(u.id, { isApproved: true })}
                          >
                            <UserCheck className="w-4 h-4 mr-1.5" />
                            Approve
                          </Button>
                        )}
                        {u.isBanned ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={() => updateOtherUser(u.id, { isBanned: false })}
                          >
                            <Shield className="w-4 h-4 mr-1.5 text-emerald-600" />
                            Re-enable
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 border-red-100 shrink-0"
                            onClick={() => updateOtherUser(u.id, { isBanned: true })}
                          >
                            <UserX className="w-4 h-4 mr-1.5" />
                            Disable
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
