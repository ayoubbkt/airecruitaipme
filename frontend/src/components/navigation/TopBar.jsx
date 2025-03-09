import React, { useState } from 'react';
import { Bell, Search, Menu, X, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


const TopBar = ({ toggleSidebar }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left side - Hamburger and Search */}
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden md:flex items-center ml-4 bg-slate-50 rounded-lg px-3 py-2">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="bg-transparent border-none focus:outline-none text-sm ml-2 w-64"
            />
          </div>
        </div>
        
        {/* Right side - Notifications and Profile */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none relative"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
              )}
            </button>
            
            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-20">
                <div className="px-4 py-2 border-b border-slate-100">
                  <h3 className="font-medium text-slate-800">Notifications</h3>
                </div>
                
                {notifications.length === 0 ? (
                  <div className="px-4 py-3 text-center text-slate-500 text-sm">
                    Aucune notification
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div key={index} className="px-4 py-2 hover:bg-slate-50 cursor-pointer">
                      <div className="text-sm font-medium text-slate-800">{notification.title}</div>
                      <div className="text-xs text-slate-500">{notification.message}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)} 
              className="flex items-center space-x-2 p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.firstName?.charAt(0) || "U"}{user?.lastName?.charAt(0) || ""}
              </div>
              <span className="hidden md:block text-sm font-medium">{user?.firstName || "Utilisateur"}</span>
              <ChevronDown size={16} />
            </button>
            
            {/* Profile dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-800">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings/profile');
                  }} 
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                >
                  <User size={16} className="mr-2" />
                  Mon profil
                </button>
                
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }} 
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                >
                  <Settings size={16} className="mr-2" />
                  Paramètres
                </button>
                
                <div className="border-t border-slate-100 my-1"></div>
                
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;