import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import CVAnalysis from './pages/cv/CVAnalysis.jsx';
import CVDetail from './pages/cv/CVDetail.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import PrivateRoute from './components/auth/PrivateRoute.jsx';

function App() {
  return (
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
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;