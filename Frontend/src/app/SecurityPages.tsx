import React from 'react';
import { Card, Button } from '../components/UI';
import { Shield, ArrowLeft, Lock, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const ChangePasswordPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link to="/profile">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{t('security.changePassword')}</h1>
      </header>
      
      <Card className="p-8 space-y-6">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center shadow-sm mx-auto">
          <Lock className="w-8 h-8 text-[#000000]" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-900">{t('security.currentPassword')}</label>
            <input type="password" placeholder="••••••••" className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/10" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-900">{t('security.newPassword')}</label>
            <input type="password" placeholder="••••••••" className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#F27D26]/20" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-900">{t('security.confirmNewPassword')}</label>
            <input type="password" placeholder="••••••••" className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#F27D26]/20" />
          </div>
        </div>
        <Button className="w-full h-12">{t('security.updatePassword')}</Button>
      </Card>
    </div>
  );
};

export const TwoFactorAuthPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link to="/profile">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{t('security.twoFactorAuth')}</h1>
      </header>
      
      <Card className="p-8 space-y-6">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center shadow-sm mx-auto">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-zinc-900">{t('security.protectAccount')}</h3>
          <p className="text-zinc-500 text-sm">{t('security.twoFactorDesc')}</p>
        </div>
        <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Key className="w-5 h-5 text-zinc-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">{t('security.authenticatorApp')}</p>
              <p className="text-xs text-zinc-500">{t('security.authenticatorDesc')}</p>
            </div>
          </div>
          <Button variant="outline" size="sm">{t('profile.enable')}</Button>
        </div>
      </Card>
    </div>
  );
};
