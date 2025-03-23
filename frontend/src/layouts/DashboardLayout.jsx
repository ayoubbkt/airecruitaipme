import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import {
    Menu,
    Home,
    BriefcaseBusiness,
    Users,
    Calendar,
    BarChart2,
    Settings,
    Brain,
    LogOut,
    User,
    Bell,
    Search,
    MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleSettingsMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSettingsMenuOpen(!settingsMenuOpen);
    };

    // La fonction isActive a besoin d'être améliorée pour mieux détecter les routes actives
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        // Pour les autres routes, vérifier si le chemin commence par le chemin donné
        return location.pathname.startsWith(path);
    };

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Fermer le menu des paramètres si on clique ailleurs
    const closeSettingsMenu = () => {
        setSettingsMenuOpen(false);
    };

    return (
        <div className="flex h-screen bg-slate-50" onClick={closeSettingsMenu}>
            {/* Sidebar */}
            <div className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    {!sidebarCollapsed && <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RecrutPME</h1>}
                    {sidebarCollapsed && <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto">R</div>}
                </div>

                {/* Navigation Items */}
                <div className="mt-6 px-3 flex-1 overflow-y-auto">
                    <nav>
                        <Link
                            to="/"
                            className={`flex items-center py-3 px-3 rounded-xl cursor-pointer ${
                                isActive('/')
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <Home size={20} />
                            {!sidebarCollapsed && <span className="ml-3 font-medium">Tableau de bord</span>}
                        </Link>

                        <Link
                            to="/cv-analysis"
                            className={`flex items-center py-3 px-3 rounded-xl cursor-pointer mt-1 ${
                                isActive('/cv-analysis')
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <Brain size={20} />
                            {!sidebarCollapsed && <span className="ml-3 font-medium">Analyse des CV</span>}
                        </Link>

                        <Link
                            to="/candidates"
                            className={`flex items-center py-3 px-3 rounded-xl cursor-pointer mt-1 ${
                                isActive('/candidates') || isActive('/talent-pool')
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <Users size={20} />
                            {!sidebarCollapsed && <span className="ml-3 font-medium">Candidats</span>}
                        </Link>

                        <Link
                            to="/jobs"
                            className={`flex items-center py-3 px-3 rounded-xl cursor-pointer mt-1 ${
                                isActive('/jobs')
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <BriefcaseBusiness size={20} />
                            {!sidebarCollapsed && <span className="ml-3 font-medium">Offres d'emploi</span>}
                        </Link>

                        <Link
                            to="/interviews"
                            className={`flex items-center py-3 px-3 rounded-xl cursor-pointer mt-1 ${
                                isActive('/interviews')
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <Calendar size={20} />
                            {!sidebarCollapsed && <span className="ml-3 font-medium">Entretiens</span>}
                        </Link>

                        <Link
                            to="/inbox"
                            className={`flex items-center py-3 px-3 rounded-xl cursor-pointer mt-1 ${
                                isActive('/inbox')
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <MessageCircle size={20} />
                            {!sidebarCollapsed && <span className="ml-3 font-medium">Messagerie</span>}
                        </Link>

                        <Link
                            to="/reports"
                            className={`flex items-center py-3 px-3 rounded-xl cursor-pointer mt-1 ${
                                isActive('/reports')
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <BarChart2 size={20} />
                            {!sidebarCollapsed && <span className="ml-3 font-medium">Rapports</span>}
                        </Link>

                        {/* Settings link that opens the dropdown */}

                        {/* Settings link that opens the dropdown */}
                        <div className="relative">
                            <Link
                                to="#"
                                className={`flex items-center py-3 px-3 rounded-xl cursor-pointer mt-1 ${
                                    isActive('/settings')
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-50'
                                }`}
                                onClick={toggleSettingsMenu}
                            >
                                <Settings size={20} />
                                {!sidebarCollapsed && <span className="ml-3 font-medium">Paramètres</span>}
                            </Link>
                        </div>

                        {/* Settings dropdown menu - as a separate floating element */}
                        {settingsMenuOpen && (
                            <div
                                className="fixed inset-0 z-20"
                                onClick={closeSettingsMenu}
                            >
                                <div
                                    className="absolute left-64 top-[calc(100vh-330px)] w-60 bg-white rounded-lg shadow-md py-1 border border-slate-200"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Link
                                        to="/user-settings"
                                        className="flex items-center px-4 py-3 hover:bg-slate-50 text-slate-700"
                                        onClick={() => setSettingsMenuOpen(false)}
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center text-slate-500 mr-3">
                                            <User size={18} />
                                        </div>
                                        <span>User settings</span>
                                    </Link>

                                    <Link
                                        to="/careers-site"
                                        className="flex items-center px-4 py-3 hover:bg-slate-50 text-slate-700"
                                        onClick={() => setSettingsMenuOpen(false)}
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center text-slate-500 mr-3">
                                            <BriefcaseBusiness size={18} />
                                        </div>
                                        <span>Careers site</span>
                                    </Link>

                                    <Link
                                        to="/settings/recruiting/workflows"
                                        className="flex items-center px-4 py-3 hover:bg-slate-50 text-slate-700"
                                        onClick={() => setSettingsMenuOpen(false)}
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center text-slate-500 mr-3">
                                            <Calendar size={18} />
                                        </div>
                                        <span>Recruiting settings</span>
                                    </Link>

                                    <Link
                                        to="/settings/company/profile"
                                        className="flex items-center px-4 py-3 hover:bg-slate-50 text-slate-700"
                                        onClick={() => setSettingsMenuOpen(false)}
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center text-slate-500 mr-3">
                                            <BriefcaseBusiness size={18} />
                                        </div>
                                        <span>Company settings</span>
                                    </Link>

                                    <Link
                                        to="/ai-settings"
                                        className="flex items-center px-4 py-3 hover:bg-slate-50 text-slate-700"
                                        onClick={() => setSettingsMenuOpen(false)}
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center text-slate-500 mr-3">
                                            <Brain size={18} />
                                        </div>
                                        <span>AI settings</span>
                                    </Link>

                                    <div className="border-t border-slate-100 my-1"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center px-4 py-3 hover:bg-slate-50 text-red-600"
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center text-red-500 mr-3">
                                            <LogOut size={18} />
                                        </div>
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </nav>
                </div>

                {/* User Profile */}
                {user && (
                    <div className="p-4 border-t border-slate-100">
                        <div className="flex items-center p-2 bg-slate-50 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                            {!sidebarCollapsed && (
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                            )}
                            {!sidebarCollapsed && (
                                <button
                                    onClick={handleLogout}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                                >
                                    <LogOut size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 py-3 px-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none mr-4"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="hidden md:flex items-center bg-slate-50 rounded-lg px-3 py-2">
                            <Search size={18} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="bg-transparent border-none focus:outline-none text-sm ml-2 w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
                            <User size={20} />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;