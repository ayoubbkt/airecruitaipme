import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Pages - Dashboard
import Dashboard from './pages/dashboard/Dashboard';
import CVAnalysis from './pages/cv/CVAnalysis';
import CVDetail from './pages/cv/CVDetail';
import TalentPool from './pages/talent/TalentPool';
import TalentDetail from './pages/talent/TalentDetail';
import JobListings from './pages/jobs/JobListings';
import JobDetail from './pages/jobs/JobDetail';
import JobCreate from './pages/jobs/JobCreate';
import Interviews from './pages/interviews/Interviews';
import InterviewDetail from './pages/interviews/InterviewDetail';
import Reports from './pages/reports/Reports';
import ATSIntegration from './pages/settings/ATSIntegration';
import Settings from './pages/settings/Settings';

// Auth Guard
import PrivateRoute from './components/auth/PrivateRoute';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsProvider';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>
            
            {/* Protected Dashboard Routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/cv-analysis" element={<CVAnalysis />} />
                <Route path="/cv/:id" element={<CVDetail />} />
                <Route path="/talent-pool" element={<TalentPool />} />
                <Route path="/talent/:id" element={<TalentDetail />} />
                <Route path="/jobs" element={<JobListings />} />
                <Route path="/jobs/create" element={<JobCreate />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/interviews" element={<Interviews />} />
                <Route path="/interviews/:id" element={<InterviewDetail />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/ats-integration" element={<ATSIntegration />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </Router>
        <ToastContainer position="top-right" autoClose={3000} />
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;