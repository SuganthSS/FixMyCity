import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
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

const handleRedirect = (navigate: ReturnType<typeof useNavigate>, role?: UserRole) => {
  if (role === UserRole.ADMIN) navigate('/admin/dashboard');
  else if (role === UserRole.STAFF) navigate('/staff/dashboard');
  else if (role === UserRole.HOD) navigate('/hod/dashboard');
  else navigate('/dashboard');
};

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        handleRedirect(navigate, result.role);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setError(null);
      const result = await loginWithGoogle(credentialResponse.credential);
      if (result.success) {
        handleRedirect(navigate, result.role);
      } else {
        setError(result.message || 'Google login failed');
      }
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
                <Link to="/forgot-password" className="text-xs font-semibold text-slate-900 hover:underline">{t('common.forgotPassword')}</Link>
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

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base">
              {isSubmitting ? 'Signing in...' : t('common.signIn')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-500">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Sign-In failed')}
              shape="rectangular"
              theme="outline"
              size="large"
            />
          </div>
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
  const { register, loginWithGoogle } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setMessage(null);
      const result = await loginWithGoogle(credentialResponse.credential);
      if (result.success) {
        handleRedirect(navigate, result.role);
      } else {
        setMessage({ type: 'error', text: result.message || 'Google sign-up failed' });
      }
    }
  };

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

          {role === UserRole.CITIZEN && (
            <>
              <div className="flex justify-center w-full mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setMessage({ type: 'error', text: 'Google Sign-In failed' })}
                  text="signup_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                />
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-zinc-500">Or continue with email</span>
                </div>
              </div>
            </>
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

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
    } catch (err) {
      console.error('Forgot password error:', err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
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
          <h1 className="text-3xl font-bold text-zinc-900 mt-6">Forgot Password</h1>
          <p className="text-zinc-500 mt-2">Enter your registered email to receive a reset link</p>
        </div>

        <Card className="p-8 shadow-xl shadow-zinc-200/50 border-zinc-100">
          {isSubmitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Check Your Inbox</h3>
              <p className="text-sm text-slate-600">
                If an account exists with that email, a reset link has been sent.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full mt-4">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
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

              <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base">
                {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center mt-8 text-sm text-zinc-600">
          Remembered your password?{' '}
          <Link to="/login" className="font-bold text-[#000000] hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await authApi.resetPassword(token, newPassword);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired password reset token.');
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-3xl font-bold text-zinc-900 mt-6">Reset Password</h1>
          <p className="text-zinc-500 mt-2">Enter your new password below</p>
        </div>

        <Card className="p-8 shadow-xl shadow-zinc-200/50 border-zinc-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Password Reset Successful!</h3>
              <p className="text-sm text-slate-600">
                Your password has been reset. Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
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
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base">
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
