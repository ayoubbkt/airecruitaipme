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
import CandidateProfile from './pages/cv/CandidateProfile';
import TalentPool from './pages/talent/TalentPool';
import CandidateManagement from './pages/talent/CandidateManagement';
import CandidateKanbanView from './pages/talent/CandidateKanbanView';
import CandidatePipelineView from './pages/talent/CandidatePipelineView';
import CandidateDetail from './pages/talent/CandidateDetail';
import JobListings from './pages/jobs/JobListings';
import JobManagement from './pages/jobs/JobManagement';
import JobDetail from './pages/jobs/JobDetail';
import JobCreate from './pages/jobs/JobCreate';
import Interviews from './pages/interviews/Interviews';
import InterviewDetail from './pages/interviews/InterviewDetail';
import Reports from './pages/reports/Reports';
import ATSIntegration from './pages/settings/ATSIntegration';
import Settings from './pages/settings/Settings';
import CandidateInbox from './pages/messages/CandidateInbox';

import RecruitingSettings from './pages/settings/RecruitingSettings';
import RecruitingWorkflows from './pages/settings/RecruitingWorkflows';
import ComingSoon from './components/common/ComingSoon';
import MeetingTemplates from './pages/settings/MeetingTemplates';
import MessageTemplates from './pages/settings/MessageTemplates';
import RecruitingQuestions from './pages/settings/RecruitingQuestions';
import RecruitingRatingCards from './pages/settings/RecruitingRatingCards';
import CompanySettings from './pages/settings/CompanySettings';
import CompanyProfile from './pages/settings/company/CompanyProfile';
import CompanyLocations from './pages/settings/company/CompanyLocations';
import Departments from './pages/settings/company/Departments';
import CandidatesPage from './pages/talent/CandidatesPage'; // Ajoute cet import

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
                  {/* Dashboard */}
                  <Route path="/" element={<Dashboard />} />

                  {/* CV Analysis & Candidate Management */}
                  <Route path="/cv-analysis" element={<CVAnalysis />} />
                  <Route path="/cv/:id" element={<CVDetail />} />
                  

                  {/* Talent Management */}
                  <Route path="/talent-pool" element={<TalentPool />} />
                  <Route path="/candidates" element={<CandidatesPage />} />
                  <Route path="/candidates/:candidateId" element={<CandidateDetail />} />
                  <Route path="/candidates/kanban" element={<CandidateKanbanView />} />
                  <Route path="/candidates/kanban/:jobId" element={<CandidateKanbanView />} />
                  <Route path="/candidates/pipeline" element={<CandidatePipelineView />} />
                  <Route path="/candidates/pipeline/:jobId" element={<CandidatePipelineView />} />

                  {/* Job Management */}
                  <Route path="/jobs" element={<JobManagement />} />
                  <Route path="/jobs/listings" element={<JobListings />} />
                  <Route path="/jobs/create" element={<JobCreate />} />
                  <Route path="/jobs/:id" element={<JobDetail />} />

                  {/* Interviews */}
                  <Route path="/interviews" element={<Interviews />} />
                  <Route path="/interviews/:id" element={<InterviewDetail />} />

                  {/* Messages */}
                  <Route path="/inbox" element={<CandidateInbox />} />

                  {/* Reports */}
                  <Route path="/reports" element={<Reports />} />

                  {/* Settings */}
                  <Route path="/ats-integration" element={<ATSIntegration />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/company" element={<CompanySettings />}>
                    <Route path="profile" element={<CompanyProfile title="Profil de l'entreprise"  />} />
                    <Route path="locations" element={<CompanyLocations   title="Emplacements"/>} />
                    <Route path="departments" element={<Departments  title="Départements" />} />
                  </Route>
                  <Route path="/settings/recruiting" element={<RecruitingSettings />}>
                    <Route path="workflows" element={<RecruitingWorkflows />} />
                    <Route path="meeting-templates" element={<MeetingTemplates title="Meeting Templates" />} />
                    <Route path="message-templates" element={<MessageTemplates  title="Message Templates" />} />
                    <Route path="questions" element={<RecruitingQuestions title="Questions" />} />
                    <Route path="ratingcards" element={<RecruitingRatingCards title="Rating Cards" />} />
                  </Route>
                  <Route path="/settings/workflows" element={<RecruitingWorkflows />} />
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