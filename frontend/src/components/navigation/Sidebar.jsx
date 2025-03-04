import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUsers } from '../../contexts/UserContext.jsx';
import { BriefcaseBusiness, Users, Calendar, BarChart2, Settings, Brain, Menu, LogOut } from 'lucide-react';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useUsers();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: <BriefcaseBusiness className="w-5 h-5" />, text: 'Tableau de bord' },
    { path: '/cv-analysis', icon: <Brain className="w-5 h-5" />, text: 'Analyse des CV' },
    { path: '/candidates', icon: <Users className="w-5 h-5" />, text: 'Base de talents' },
    { path: '/jobs', icon: <BriefcaseBusiness className="w-5 h-5" />, text: 'Offres d\'emploi' },
    { path: '/interviews', icon: <Calendar className="w-5 h-5" />, text: 'Entretiens' },
    { path: '/reports', icon: <BarChart2 className="w-5 h-5" />, text: 'Rapports' },
    { path: '/settings', icon: <Settings className="w-5 h-5" />, text: 'Paramètres' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`bg-white shadow-md transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            RecruitPME
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full hover:bg-slate-100"
        >
          <Menu className="h-5 w-5 text-slate-400" />
        </button>
      </div>
      <div className="mt-6 px-3">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            text={item.text}
            active={location.pathname === item.path}
            collapsed={collapsed}
            path={item.path}
          />
        ))}
      </div>
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center p-2 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
              {user ? user.name.split(' ').map(n => n[0]).join('') : 'JD'}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-slate-900">
                {user ? user.name : 'Not logged in'}
              </p>
              <p className="text-xs text-slate-500">
                {user ? user.role : 'Guest'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-full hover:bg-slate-200"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, text, active = false, collapsed = false, path }) => (
  <Link to={path}>
    <div
      className={`flex items-center py-3 px-3 rounded-xl cursor-pointer mb-1 ${
        active ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <div className="w-5 h-5">{icon}</div>
      {!collapsed && <span className="ml-3 font-medium">{text}</span>}
    </div>
  </Link>
);

export default Sidebar;