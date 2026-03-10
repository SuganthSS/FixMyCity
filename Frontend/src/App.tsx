import React from 'react';
import { 
  Routes, 
  Route, 
  Navigate, 
  useLocation 
} from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { UserRole } from './types';
import { Sidebar, Navbar } from './components/Layout';
import { LoginPage, RegisterPage } from './pages/Auth';
import { CitizenDashboard } from './app/CitizenDashboard';
import { ReportIssuePage } from './app/ReportIssue';
import { MyComplaintsPage } from './app/MyComplaints';
import { ComplaintDetailsPage } from './app/ComplaintDetails';
import { AdminDashboard } from './app/AdminDashboard';
import { StaffDashboard } from './app/StaffDashboard';
import { AdminComplaintsPage } from './app/AdminComplaints';
import { ProfilePage } from './app/Profile';
import { HelpPage } from './app/HelpPage';
import { MessageCenter } from './app/MessageCenter';
import { MapPage } from './app/MapPage';
import { MaintenancePage } from './app/MaintenancePage';
import { SupportPage } from './app/SupportPage';
import { ChangePasswordPage, TwoFactorAuthPage } from './app/SecurityPages';
import { AnalyticsPage } from './app/AnalyticsPage';
import { LandingPage } from './app/LandingPage';
import { ComplaintProvider } from './context/ComplaintContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: UserRole }> = ({ children, role }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === UserRole.ADMIN ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.role === UserRole.ADMIN ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ComplaintProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Citizen Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute role={UserRole.CITIZEN}>
            <Layout><CitizenDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/report" element={
          <ProtectedRoute role={UserRole.CITIZEN}>
            <Layout><ReportIssuePage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-complaints" element={
          <ProtectedRoute role={UserRole.CITIZEN}>
            <Layout><MyComplaintsPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/complaints/:id" element={
          <ProtectedRoute>
            <Layout><ComplaintDetailsPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><ProfilePage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/help" element={
          <ProtectedRoute>
            <Layout><HelpPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Layout><MessageCenter /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/map" element={
          <ProtectedRoute>
            <Layout><MapPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/maintenance" element={
          <ProtectedRoute>
            <Layout><MaintenancePage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute>
            <Layout><SupportPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/change-password" element={
          <ProtectedRoute>
            <Layout><ChangePasswordPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/two-factor-auth" element={
          <ProtectedRoute>
            <Layout><TwoFactorAuthPage /></Layout>
          </ProtectedRoute>
        } />

        {/* Staff Routes */}
        <Route path="/staff/dashboard" element={
          <ProtectedRoute role={UserRole.STAFF}>
            <Layout><StaffDashboard /></Layout>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role={UserRole.ADMIN}>
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/complaints" element={
          <ProtectedRoute role={UserRole.ADMIN}>
            <Layout><AdminComplaintsPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute role={UserRole.ADMIN}>
            <Layout><AnalyticsPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute role={UserRole.ADMIN}>
            <Layout><div className="p-8 text-center text-zinc-500">User management coming soon...</div></Layout>
          </ProtectedRoute>
        } />

        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
      </Routes>
    </ComplaintProvider>
  );
}
