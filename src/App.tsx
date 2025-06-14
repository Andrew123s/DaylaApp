import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import OnboardingGuard from './components/OnboardingGuard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import Profile from './pages/Profile';
import TripPlanner from './pages/TripPlanner';
import InvitePage from './pages/InvitePage';
import SupabaseTest from './pages/SupabaseTest';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import TripManagement from './pages/admin/TripManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import ContentModeration from './pages/admin/ContentModeration';
import Analytics from './pages/admin/Analytics';
import SystemSettings from './pages/admin/SystemSettings';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/invite/:inviteCode" element={<InvitePage />} />
              <Route path="/supabase-test" element={<SupabaseTest />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="trips" element={<TripManagement />} />
                <Route path="payments" element={<PaymentManagement />} />
                <Route path="content" element={<ContentModeration />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<SystemSettings />} />
              </Route>
              
              {/* User Routes */}
              <Route path="/" element={
                <AuthGuard>
                  <OnboardingGuard>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </OnboardingGuard>
                </AuthGuard>
              } />
              <Route path="/planner/:id" element={
                <AuthGuard>
                  <OnboardingGuard>
                    <Layout>
                      <TripPlanner />
                    </Layout>
                  </OnboardingGuard>
                </AuthGuard>
              } />
              <Route path="/community" element={
                <AuthGuard>
                  <OnboardingGuard>
                    <Layout>
                      <Community />
                    </Layout>
                  </OnboardingGuard>
                </AuthGuard>
              } />
              <Route path="/profile" element={
                <AuthGuard>
                  <OnboardingGuard>
                    <Layout>
                      <Profile />
                    </Layout>
                  </OnboardingGuard>
                </AuthGuard>
              } />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;