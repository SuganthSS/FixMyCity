import React from 'react';
import { 
  UserCheck, 
  UserX, 
  Shield 
} from 'lucide-react';
import { UserRole } from '../types';
import { Card, Badge, Button } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { getFullImageUrl } from '../lib/utils';

export const AdminUsersPage: React.FC = () => {
  const { users, updateOtherUser } = useAuth();
  const roleFilter = UserRole.CITIZEN;
  const filteredUsers = users.filter(u => u.role === roleFilter);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Citizen Management</h1>
        <p className="text-zinc-500 mt-1">Manage and monitor registered citizens in the system.</p>
      </header>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">Registered Citizens</h3>
          <Badge className="bg-zinc-100 text-zinc-600">{filteredUsers.length} Total</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm">User</th>
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Status</th>
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm">Joined</th>
                <th className="px-6 py-4 font-bold text-zinc-900 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100 shrink-0">
                        <img src={getFullImageUrl(u.avatar)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 text-sm">{u.name}</p>
                        <p className="text-xs text-zinc-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {u.isBanned ? (
                        <Badge className="bg-red-50 text-red-600 border-red-100">Banned</Badge>
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
                      {u.isBanned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateOtherUser(u.id, { isBanned: false })}
                        >
                          <Shield className="w-4 h-4 mr-1.5 text-emerald-600" />
                          Re-enable
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 border-red-100"
                          onClick={() => updateOtherUser(u.id, { isBanned: true })}
                        >
                          <UserX className="w-4 h-4 mr-1.5" />
                          Disable
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
