import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    Building,
    MapPin,
    Users,
    CreditCard,
    LayoutGrid
} from 'lucide-react';

const CompanySettings = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname.includes(path);
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="w-60 bg-white border-r border-slate-200 p-4">
                <h2 className="text-lg font-medium text-slate-800 mb-6">Préférences d'Entreprise</h2>

                <div className="border rounded-lg overflow-hidden bg-white mb-4">
                    <div className="p-3 border-b border-slate-100">
                        <h3 className="text-sm font-medium text-slate-700">Entreprise</h3>
                    </div>

                    <div className="flex flex-col">
                        <Link
                            to="/settings/company/profile"
                            className={`flex items-center gap-2 p-3 ${isActive('/profile') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-700'} text-left`}
                        >
                            <Building className="w-4 h-4" />
                            <span className="text-sm">Profil de l'entreprise</span>
                        </Link>

                        <Link
                            to="/settings/company/locations"
                            className={`flex items-center gap-2 p-3 ${isActive('/locations') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-700'} text-left`}
                        >
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">Emplacements</span>
                        </Link>

                        <Link
                            to="/settings/company/departments"
                            className={`flex items-center gap-2 p-3 ${isActive('/departments') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-700'} text-left`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="text-sm">Départements</span>
                        </Link>

                        <Link
                            to="/settings/company/members"
                            className={`flex items-center gap-2 p-3 ${isActive('/members') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-700'} text-left`}
                        >
                            <Users className="w-4 h-4" />
                            <span className="text-sm">Membres</span>
                        </Link>

                        <Link
                            to="/settings/company/subscription"
                            className={`flex items-center gap-2 p-3 ${isActive('/subscription') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-700'} text-left`}
                        >
                            <CreditCard className="w-4 h-4" />
                            <span className="text-sm">Abonnement</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main content area - will render child routes */}
            <div className="flex-1 p-4">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Préférences d'Entreprise</h1>
                <Outlet />
            </div>
        </div>
    );
};

export default CompanySettings;