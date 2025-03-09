import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BriefcaseBusiness, Users, Calendar, BarChart2, Settings, Brain } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    { path: '/', label: 'Tableau de bord', icon: <Home size={20} /> },
    { path: '/cv-analysis', label: 'Analyse des CV', icon: <Brain size={20} /> },
    { path: '/talent-pool', label: 'Base de talents', icon: <Users size={20} /> },
    { path: '/jobs', label: 'Offres d\'emploi', icon: <BriefcaseBusiness size={20} /> },
    { path: '/interviews', label: 'Entretiens', icon: <Calendar size={20} /> },
    { path: '/reports', label: 'Rapports', icon: <BarChart2 size={20} /> },
    { path: '/settings', label: 'Paramètres', icon: <Settings size={20} /> },
  ];
  
  return (
    <div className={`bg-white shadow-md transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RecrutPME</h1>}
        {collapsed && <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto">R</div>}
      </div>
      
      {/* Navigation Items */}
      <div className="mt-6 px-3 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center py-3 px-3 rounded-xl cursor-pointer mb-1
              ${isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}
            `}
          >
            <div className="w-5 h-5">{item.icon}</div>
            {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
            </NavLink>
        ))}
      </div>
      
      {/* User Profile */}
      {!collapsed && user && (
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center p-2 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;