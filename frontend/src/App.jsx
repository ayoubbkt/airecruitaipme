import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import CVAnalysis from './pages/cv/CVAnalysis.jsx';
import CVDetail from './pages/cv/CVDetail.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import PrivateRoute from './components/auth/PrivateRoute.jsx';
import { UsersProvider } from './contexts/UserContext.jsx';

// Placeholder components for new routes
const Candidates = () => <div>Candidates Page</div>;
const Jobs = () => <div>Jobs Page</div>;
const Interviews = () => <div>Interviews Page</div>;
const Reports = () => <div>Reports Page</div>;
const Settings = () => <div>Settings Page</div>;

function App() {
  return (
    <UsersProvider>
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cv-analysis" element={<CVAnalysis />} />
              <Route path="/cv/:id" element={<CVDetail />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/interviews" element={<Interviews />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </UsersProvider>
  );
}

export default App;