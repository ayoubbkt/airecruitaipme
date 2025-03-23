import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FileText, Calendar, MessageCircle, CheckSquare, Star } from 'lucide-react';

const RecruitingSettings = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname.includes(path);
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="w-60 bg-white border-r border-slate-200 p-4">
                <h2 className="text-lg font-medium text-slate-800 mb-6">Préférences de recrutement</h2>

                <div className="border rounded-lg overflow-hidden bg-white mb-4">
                    <div className="p-3 border-b border-slate-100">
                        <h3 className="text-sm font-medium text-slate-700">Templates & Workflows</h3>
                    </div>

                    <div className="flex flex-col">
                        <Link
                            to="/settings/recruiting/workflows"
                            className={`flex items-center gap-2 p-3 ${isActive('/workflows') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-700'} text-left`}
                        >
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">Workflows</span>
                        </Link>

                        <Link
                            to="/settings/recruiting/meeting-templates"
                            className={`flex items-center gap-2 p-3 ${isActive('/meeting-templates') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-700'} text-left`}
                        >
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Templates d'entretien</span>
                        </Link>

                        <Link
                            to="/settings/recruiting/message-templates"
                            className={`flex items-center gap-2 p-3 ${isActive('/message-templates') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-700'} text-left`}
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">Templates de message</span>
                        </Link>

                        <Link
                            to="/settings/recruiting/questions"
                            className={`flex items-center gap-2 p-3 ${isActive('/questions') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-700'} text-left`}
                        >
                            <CheckSquare className="w-4 h-4" />
                            <span className="text-sm">Questions</span>
                        </Link>

                        <Link
                            to="/settings/recruiting/ratingcards"
                            className={`flex items-center gap-2 p-3 ${isActive('/ratingcards') ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-700'} text-left`}
                        >
                            <Star className="w-4 h-4" />
                            <span className="text-sm">Fiches d'évaluation</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main content area - will render child routes */}
            <div className="flex-1 p-4">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Recruiting Preferences</h1>
                <Outlet />
            </div>
        </div>
    );
};

export default RecruitingSettings;