import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Button, Input, Label, Card } from '../components/UI';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { motion } from 'motion/react';

import { Logo } from '../components/Logo';

const AuthHeader = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 py-4">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
        <Logo iconSize="w-10 h-10" textSize="text-xl" />
      </Link>
      <LanguageSwitcher />
    </div>
  </header>
);

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = await login(email, password);
    if (result.success) {
      if (result.role === UserRole.ADMIN) navigate('/admin/dashboard');
      else if (result.role === UserRole.STAFF) navigate('/staff/dashboard');
      else navigate('/dashboard');
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 pt-24">
      <AuthHeader />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          <Logo variant="vertical" iconSize="w-16 h-16" textSize="text-4xl" />
          <h1 className="text-3xl font-bold text-zinc-900 mt-6">{t('auth.welcomeBack')}</h1>
          <p className="text-zinc-500 mt-2">{t('auth.signInDesc')}</p>
        </div>

        <Card className="p-8 shadow-xl shadow-zinc-200/50 border-zinc-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <Label htmlFor="email">{t('common.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">{t('common.password')}</Label>
                <button type="button" className="text-xs font-semibold text-[#000000] hover:underline">{t('common.forgotPassword')}</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-zinc-300 text-[#000000] focus:ring-[#000000]" />
              <label htmlFor="remember" className="ml-2 text-sm text-zinc-600">{t('common.rememberMe')}</label>
            </div>

            <Button type="submit" className="w-full h-12 text-base">
              {t('common.signIn')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
        </Card>

        <p className="text-center mt-8 text-sm text-zinc-600">
          {t('common.noAccount')}{' '}
          <Link to="/register" className="font-bold text-[#000000] hover:underline">{t('common.createAccount')}</Link>
        </p>
      </motion.div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.CITIZEN);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: t('auth.passwordsNoMatch') });
      return;
    }
    const result = await register(name, email, password, role);
    if (result.success) {
      if (role === UserRole.STAFF) {
        setMessage({ type: 'success', text: result.message || 'Account created. Pending approval.' });
      } else if (role === UserRole.ADMIN) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setMessage({ type: 'error', text: result.message || 'Registration failed' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 pt-24">
      <AuthHeader />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          <Logo variant="vertical" iconSize="w-16 h-16" textSize="text-4xl" />
          <h1 className="text-3xl font-bold text-zinc-900 mt-6">{t('common.createAccount')}</h1>
          <p className="text-zinc-500 mt-2">{t('auth.createAccountDesc')}</p>
        </div>

        <Card className="p-8 shadow-xl shadow-zinc-200/50 border-zinc-100">
          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-red-50 border border-red-100 text-red-600'
              }`}>
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{message.text}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex bg-zinc-50 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setRole(UserRole.CITIZEN)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === UserRole.CITIZEN ? 'bg-white text-[#000000] shadow-sm' : 'text-zinc-500'
                  }`}
              >
                {t('common.citizen')}
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.STAFF)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === UserRole.STAFF ? 'bg-white text-[#000000] shadow-sm' : 'text-zinc-500'
                  }`}
              >
                {t('common.staff')}
              </button>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">{t('common.fullName')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t('common.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">{t('common.confirmPassword')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base">
              {t('common.createAccount')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
        </Card>

        <p className="text-center mt-8 text-sm text-zinc-600">
          {t('common.alreadyAccount')}{' '}
          <Link to="/login" className="font-bold text-[#000000] hover:underline">{t('common.login')}</Link>
        </p>
      </motion.div>
    </div>
  );
};
