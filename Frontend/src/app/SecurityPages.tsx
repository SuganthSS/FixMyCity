import React, { useState } from 'react';
import { Card, Button, Input, Label } from '../components/UI';
import { Shield, ArrowLeft, Lock, Key, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/authApi';

export const ChangePasswordForm: React.FC<{ onSuccess?: () => void; isModal?: boolean }> = ({ onSuccess, isModal = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authApi.changePassword(currentPassword, newPassword);
      if (res.success) {
        setSuccessMsg(res.message || 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        setError(res.message || 'Failed to update password.');
      }
    } catch (err: any) {
      const backendMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl font-medium">
          {successMsg}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">{t('security.currentPassword')}</Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">{t('security.newPassword')}</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">{t('security.confirmNewPassword')}</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full h-12 font-semibold rounded-xl">
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Updating...
          </span>
        ) : (
          t('security.updatePassword')
        )}
      </Button>
    </form>
  );
};

export const ChangePasswordModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-900 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{t('security.changePassword')}</h2>
          <p className="text-xs text-slate-500">{t('profile.changePassDesc')}</p>
        </div>
        <ChangePasswordForm onSuccess={onClose} isModal={true} />
      </div>
    </div>
  );
};

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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('security.changePassword')}</h1>
      </header>
      
      <Card className="p-8 space-y-6">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shadow-sm mx-auto">
          <Lock className="w-8 h-8 text-slate-900" />
        </div>
        <ChangePasswordForm />
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
