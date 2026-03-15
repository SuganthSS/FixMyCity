import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFullImageUrl } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { Card, Button, Input, Label } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Shield, Calendar, Camera, Save, X } from 'lucide-react';

import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  if (!user) return null;

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      updateUser({ avatar: imageUrl });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{t('profile.title')}</h1>
          <p className="text-zinc-500 mt-1">{t('profile.subtitle')}</p>
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-2" /> {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> {t('common.save')}
            </Button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-8 flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <img 
              src={getFullImageUrl(user.avatar)} 
              alt={user.name} 
              className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl object-cover"
              referrerPolicy="no-referrer"
            />
            <label className="absolute bottom-0 right-0 p-2 bg-[#2563EB] text-white rounded-xl shadow-lg cursor-pointer hover:scale-110 transition-all">
              <Camera className="w-4 h-4" />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">{user.name}</h2>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
          <div className="pt-4 w-full">
            {!isEditing && (
              <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>{t('profile.edit')}</Button>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3 h-3" /> {t('common.fullName')}
              </label>
              {isEditing ? (
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p className="text-sm font-semibold text-zinc-900">{user.name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3 h-3" /> {t('common.email')}
              </label>
              {isEditing ? (
                <Input 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              ) : (
                <p className="text-sm font-semibold text-zinc-900">{user.email}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-3 h-3" /> {t('profile.role')}
              </label>
              <p className="text-sm font-semibold text-zinc-900 capitalize">{user.role.toLowerCase()}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3 h-3" /> {t('profile.accountCreated')}
              </label>
              <p className="text-sm font-semibold text-zinc-900">
                {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100">
            <h3 className="text-sm font-bold text-zinc-900 mb-4">{t('profile.security')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-zinc-900">{t('profile.changePass')}</p>
                  <p className="text-xs text-zinc-500">{t('profile.changePassDesc')}</p>
                </div>
                <Link to="/change-password">
                  <Button variant="outline" size="sm">{t('common.update')}</Button>
                </Link>
              </div>
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-zinc-900">{t('profile.twoFactor')}</p>
                  <p className="text-xs text-zinc-500">{t('profile.twoFactorDesc')}</p>
                </div>
                <Link to="/two-factor-auth">
                  <Button variant="outline" size="sm">{t('profile.enable')}</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
