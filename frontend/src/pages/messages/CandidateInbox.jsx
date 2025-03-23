import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, MessageSquare, Inbox, Briefcase, Users, Bell, HelpCircle, Settings, User } from 'lucide-react';
import { messageService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CandidateInbox = () => {
    const [selectedFilter, setSelectedFilter] = useState('your-conversations');
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                const response = await messageService.getConversations({
                    filter: selectedFilter
                });
                setConversations(response);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [selectedFilter]);

    const filteredConversations = conversations.filter(conversation => {
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();
        return (
            conversation.candidate.name.toLowerCase().includes(searchLower) ||
            (conversation.lastMessage && conversation.lastMessage.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className="flex h-screen bg-slate-50 text-slate-800">
            {/* Left Sidebar */}
            <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-6">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-8">
                    R
                </div>
                <div className="flex flex-col gap-6">
                    <button className="p-2 text-slate-400 hover:text-slate-700">
                        <Inbox size={20} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-700">
                        <Users size={20} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-700">
                        <Briefcase size={20} />
                    </button>
                    <button className="p-2 text-blue-600">
                        <MessageSquare size={20} />
                    </button>
                </div>
                <div className="mt-auto flex flex-col gap-6 mb-6">
                    <button className="p-2 text-slate-400 hover:text-slate-700">
                        <Settings size={20} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-700">
                        <HelpCircle size={20} />
                    </button>
                    <button className="w-8 h-8 bg-blue-100 rounded-full overflow-hidden flex items-center justify-center text-blue-700">
                        <User size={16} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between">
                    <h1 className="text-lg font-semibold text-slate-800">Boîte de réception des candidats</h1>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-700">
                            <Bell size={20} />
                        </button>
                        <div className="w-8 h-8 bg-blue-100 rounded-full overflow-hidden flex items-center justify-center text-blue-700">
                            <User size={16} />
                        </div>
                    </div>
                </header>

                {/* Main content */}
                <div className="flex flex-1">
                    {/* Left filters panel */}
                    <div className="w-64 border-r border-slate-200 bg-white py-4">
                        <div className="px-4 mb-4">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher des conversations..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="px-4 mb-2">
                            <h2 className="text-xs uppercase font-semibold text-slate-500">Filtres de la boîte</h2>
                        </div>

                        <div className="space-y-1 mb-4">
                            <button
                                className={`flex items-center px-4 py-2 w-full text-left ${selectedFilter === 'your-jobs' ? 'text-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                                onClick={() => setSelectedFilter('your-jobs')}
                            >
                                <Briefcase size={16} className="mr-3" />
                                <span>Vos offres d'emploi</span>
                            </button>
                            <button
                                className={`flex items-center px-4 py-2 w-full text-left ${selectedFilter === 'your-conversations' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                                onClick={() => setSelectedFilter('your-conversations')}
                            >
                                <MessageSquare size={16} className="mr-3" />
                                <span>Vos conversations</span>
                            </button>
                            <button
                                className={`flex items-center px-4 py-2 w-full text-left ${selectedFilter === 'all-conversations' ? 'text-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                                onClick={() => setSelectedFilter('all-conversations')}
                            >
                                <Inbox size={16} className="mr-3" />
                                <span>Toutes les conversations</span>
                            </button>
                        </div>
                    </div>

                    {/* Right content */}
                    <div className="flex-1 p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-800">Vos conversations</h2>
                            <p className="text-sm text-slate-500">
                                {selectedFilter === 'your-jobs' ? 'Conversations liées à vos offres d\'emploi' :
                                    selectedFilter === 'your-conversations' ? 'Conversations auxquelles vous participez' :
                                        'Toutes les conversations'}
                            </p>
                        </div>

                        <div className="flex gap-2 mb-5">
                            <div className="relative">
                                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
                                    <span>Conversations ouvertes</span>
                                    <ChevronDown size={16} />
                                </button>
                            </div>

                            <div className="relative">
                                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
                                    <span>Plus récentes</span>
                                    <ChevronDown size={16} />
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <LoadingSpinner />
                        ) : filteredConversations.length > 0 ? (
                            <div className="space-y-2">
                                {filteredConversations.map(conversation => (
                                    <div
                                        key={conversation.id}
                                        className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer"
                                    >
                                        <div className="flex items-start">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                                                {conversation.candidate.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium text-slate-800">{conversation.candidate.name}</h3>
                                                        <p className="text-sm text-slate-500">{conversation.candidate.position}</p>
                                                    </div>
                                                    <span className="text-xs text-slate-500">{conversation.lastMessageTime}</span>
                                                </div>
                                                <p className="mt-1 text-sm text-slate-600 line-clamp-1">{conversation.lastMessage}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-xl p-16 flex flex-col items-center justify-center">
                                <div className="bg-slate-100 p-6 rounded-full mb-4">
                                    <MessageSquare size={32} className="text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-700 mb-1">Aucune conversation trouvée</h3>
                                <p className="text-slate-500 text-center max-w-md mb-6">
                                    Les conversations avec les candidats apparaîtront ici dès que vous commencerez à communiquer avec eux.
                                </p>
                                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition">
                                    Contacter un candidat
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateInbox;