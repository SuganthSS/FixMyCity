import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../services/authApi';
import { adminApi } from '../services/adminApi';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; role?: UserRole }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  updateOtherUser: (userId: string, data: Partial<User>) => void;
  isAuthenticated: boolean;
  fetchUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: map backend user object to frontend User type
const mapUser = (backendUser: any): User => ({
  id: backendUser._id || backendUser.id,
  name: backendUser.name,
  email: backendUser.email,
  role: backendUser.role as UserRole,
  avatar: backendUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendUser.email}`,
  createdAt: backendUser.createdAt || new Date().toISOString(),
  isApproved: backendUser.isApproved,
  isBanned: backendUser.isBanned,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Restore session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('fixmycity_user');
    const savedToken = localStorage.getItem('fixmycity_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch all users (admin only)
  const fetchUsers = useCallback(async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data.map(mapUser));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  // Load users when an admin is logged in
  useEffect(() => {
    if (user && user.role === UserRole.ADMIN) {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);

      const mappedUser = mapUser(data);
      localStorage.setItem('fixmycity_token', data.token);
      localStorage.setItem('fixmycity_user', JSON.stringify(mappedUser));
      setUser(mappedUser);
      return { success: true, role: mappedUser.role };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      // Prevent admin registration from frontend
      if (role === UserRole.ADMIN) {
        return { success: false, message: 'Admin accounts cannot be registered here.' };
      }

      const data = await authApi.register(name, email, password, role);

      if (role === UserRole.STAFF) {
        // Staff needs approval — don't auto-login
        return { success: true, message: 'Your staff account is pending admin approval.' };
      }

      // Auto-login citizen
      const mappedUser = mapUser(data);
      localStorage.setItem('fixmycity_token', data.token);
      localStorage.setItem('fixmycity_user', JSON.stringify(mappedUser));
      setUser(mappedUser);
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setUsers([]);
    localStorage.removeItem('fixmycity_user');
    localStorage.removeItem('fixmycity_token');
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('fixmycity_user', JSON.stringify(updatedUser));
  };

  const updateOtherUser = async (userId: string, data: Partial<User>) => {
    try {
      // Determine which admin API to call based on the data being changed
      if (data.isApproved === true) {
        await adminApi.approveStaff(userId);
      }
      if (data.isBanned === true) {
        await adminApi.banUser(userId);
      }
      if (data.isBanned === false) {
        await adminApi.unbanUser(userId);
      }

      // Refresh user list after update
      await fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, users, login, register, logout, updateUser, updateOtherUser, isAuthenticated: !!user, fetchUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
