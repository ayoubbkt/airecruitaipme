import React, { useState, useEffect } from 'react';
import {
    ChevronDown,
    Filter,
    Star,
    Edit2,
    Download,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Eye,
    Archive,
    ExternalLink,
    MoreHorizontal,
    Search
} from 'lucide-react';
import { cvService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CandidateManagement = () => {
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: {
            leads: true,
            applicants: true,
            shortlist: true,
            archived: false
        },
        positions: {
            dataScientist: true,
            developer: true,
            designer: true
        },
        scores: {
            high: true,
            medium: true,
            low: false
        }
    });

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                setLoading(true);
                const response = await cvService.getCandidates();
                setCandidates(response);

                if (response.length > 0) {
                    setSelectedCandidate(response[0]);
                }
            } catch (error) {
                console.error('Error fetching candidates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    // Function to handle candidate selection for preview
    const handleCandidateClick = (candidate) => {
        setSelectedCandidate(candidate);
    };

    // Function to get initials from name
    const getInitials = (firstName, lastName) => {
        return firstName.charAt(0) + lastName.charAt(0);
    };

    // Function to determine score color
    const getScoreColor = (score) => {
        if (score >= 85) return 'bg-green-100 text-green-800';
        if (score >= 70) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    // Function to handle filter changes
    const handleFilterChange = (category, key) => {
        setFilters(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: !prev[category][key]
            }
        }));
    };

    // Filter candidates based on filters
    const filteredCandidates = candidates.filter(candidate => {
        // Status filter
        if (candidate.status === 'lead' && !filters.status.leads) return false;
        if (candidate.status === 'applicant' && !filters.status.applicants) return false;
        if (candidate.status === 'shortlist' && !filters.status.shortlist) return false;
        if (candidate.status === 'archived' && !filters.status.archived) return false;

        // Position filter
        const position = candidate.title.toLowerCase();
        if (position.includes('data scientist') && !filters.positions.dataScientist) return false;
        if (position.includes('developer') || position.includes('développeur') && !filters.positions.developer) return false;
        if (position.includes('design') && !filters.positions.designer) return false;

        // Score filter
        if (candidate.score >= 85 && !filters.scores.high) return false;
        if (candidate.score >= 70 && candidate.score < 85 && !filters.scores.medium) return false;
        if (candidate.score < 70 && !filters.scores.low) return false;

        return true;
    });

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md flex flex-col">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RecrutPME</h1>
                </div>

                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-slate-800">Filtres</h2>
                    <div className="mt-4 space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-slate-700 mb-2">Statut</h3>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="leads"
                                        className="h-4 w-4 text-blue-600 rounded"
                                        checked={filters.status.leads}
                                        onChange={() => handleFilterChange('status', 'leads')}
                                    />
                                    <label htmlFor="leads" className="ml-2 text-sm text-slate-600">Leads</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="applicants"
                                        className="h-4 w-4 text-blue-600 rounded"
                                        checked={filters.status.applicants}
                                        onChange={() => handleFilterChange('status', 'applicants')}
                                    />
                                    <label htmlFor="applicants" className="ml-2 text-sm text-slate-600">Candidats</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="shortlist"
                                        className="h-4 w-4 text-blue-600 rounded"
                                        checked={filters.status.shortlist}
                                        onChange={() => handleFilterChange('status', 'shortlist')}
                                    />
                                    <label htmlFor="shortlist" className="ml-2 text-sm text-slate-600">Présélectionnés</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="archived"
                                        className="h-4 w-4 text-blue-600 rounded"
                                        checked={filters.status.archived}
                                        onChange={() => handleFilterChange('status', 'archived')}
                                    />
                                    <label htmlFor="archived" className="ml-2 text-sm text-slate-600">Archivés</label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-slate-700 mb-2">Postes</h3>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="data-scientist"
                                        className="h-4 w-4 text-blue-600 rounded"
                                        checked={filters.positions.dataScientist}
                                        onChange={() => handleFilterChange('positions', 'dataScientist')}
                                    />
                                    <label htmlFor="data-scientist" className="ml-2 text-sm text-slate-600">Data Scientist</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="developer"
                                        className="h-4 w-4 text-blue-600 rounded"
                                        checked={filters.positions.developer}
                                        onChange={() => handleFilterChange('positions', 'developer')}
                                    />
                                    <label htmlFor="developer" className="ml-2 text-sm text-slate-600">Développeur</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="designer"
                                        className="h-4 w-4 text-blue-600 rounded"
                                        checked={filters.positions.designer}
                                        onChange={() => handleFilterChange('positions', 'designer')}
                                    />
                                    <label htmlFor="designer" className="ml-2 text-sm text-slate-600">Designer</label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-slate-700 mb-2">Score IA</h3>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="high-score"
                                        className="h-4 w-4 text-blue-600 rounded"
                                        checked={filters.scores.high}
                                        onChange={() => handleFilterChange('scores', 'high')}
                                    />
                                    <label htmlFor="high-score" className="ml-2 text-sm text-slate-600">Excellent (85+)</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="medium-score"
                                        className="h-4 w-4 text-blue-600 rounded"
                                        checked={filters.scores.medium}
                                        onChange={() => handleFilterChange('scores', 'medium')}
                                    />
                                    <label htmlFor="medium-score" className="ml-2 text-sm text-slate-600">Bon (70-84)</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="low-score"
                                        className="h-4 w-4 text-blue-600 rounded"
                                        checked={filters.scores.low}
                                        onChange={() => handleFilterChange('scores', 'low')}
                                    />
                                    <label htmlFor="low-score" className="ml-2 text-sm text-slate-600">Insuffisant (&lt;70)</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex">
                {/* Candidates list */}
                <div className="w-1/2 overflow-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-slate-800">Candidats</h1>
                            <div className="flex space-x-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Rechercher un candidat..."
                                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                                    />
                                    <div className="absolute left-3 top-2.5 text-slate-400">
                                        <Search className="h-5 w-5" />
                                    </div>
                                </div>
                                <button className="flex items-center px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <span className="text-sm">Filtres</span>
                                </button>
                                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700">
                                    <span className="text-sm">+ Ajouter</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            {filteredCandidates.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <p>Aucun candidat ne correspond aux critères de filtre.</p>
                                </div>
                            ) : (
                                filteredCandidates.map((candidate) => (
                                    <div
                                        key={candidate.id}
                                        className={`border-b border-slate-100 p-4 hover:bg-slate-50 cursor-pointer ${selectedCandidate?.id === candidate.id ? 'bg-blue-50' : ''}`}
                                        onClick={() => handleCandidateClick(candidate)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${candidate.id % 2 === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
                                                    {getInitials(candidate.firstName, candidate.lastName)}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="flex items-center">
                                                        <h3 className="text-sm font-medium text-slate-900">{candidate.firstName} {candidate.lastName}</h3>
                                                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getScoreColor(candidate.score)}`}>
                              {candidate.score}%
                            </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">{candidate.title}</p>
                                                    <div className="flex items-center mt-1 text-xs text-slate-400">
                                                        <div className="flex items-center mr-3">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            <span>Dans cette étape depuis {candidate.stageDays || 0} jours</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            <span>{candidate.location || 'Non spécifié'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button className="p-1 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100">
                                                    <Star className="h-4 w-4" />
                                                </button>
                                                <button className="p-1 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {candidate.skills && candidate.skills.slice(0, 3).map((skill, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {skill}
                        </span>
                                            ))}
                                            {candidate.skills && candidate.skills.length > 3 && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          +{candidate.skills.length - 3}
                        </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Candidate preview */}
                <div className="w-1/2 bg-white border-l border-slate-200 overflow-auto">
                    {selectedCandidate ? (
                        <div className="h-full">
                            <div className="p-6 border-b border-slate-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-medium ${selectedCandidate.id % 2 === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
                                            {getInitials(selectedCandidate.firstName, selectedCandidate.lastName)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="flex items-center">
                                                <h2 className="text-xl font-bold text-slate-800">{selectedCandidate.firstName} {selectedCandidate.lastName}</h2>
                                                <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(selectedCandidate.score)}`}>
                          {selectedCandidate.score}%
                        </span>
                                            </div>
                                            <p className="text-slate-600">{selectedCandidate.title}</p>
                                            <div className="flex mt-2">
                                                <div className="flex items-center mr-4 text-sm text-slate-500">
                                                    <Mail className="h-4 w-4 mr-1.5" />
                                                    <span>{selectedCandidate.email}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-slate-500">
                                                    <Phone className="h-4 w-4 mr-1.5" />
                                                    <span>{selectedCandidate.phone || 'Non spécifié'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100">
                                            <Edit2 className="h-5 w-5" />
                                        </button>
                                        <button
                                            className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100"
                                            onClick={() => cvService.downloadCV(selectedCandidate.id)}
                                        >
                                            <Download className="h-5 w-5" />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100">
                                            <Archive className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex space-x-3 mt-4">
                                    <button
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700"
                                        onClick={() => window.open(`mailto:${selectedCandidate.email}`)}
                                    >
                                        Contacter
                                    </button>
                                    <button className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50">
                                        Planifier un entretien
                                    </button>
                                    <button
                                        className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                                        onClick={() => window.open(`/cv/${selectedCandidate.id}`)}
                                    >
                                        Voir le CV
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Compétences</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCandidate.skills && selectedCandidate.skills.map((skill, idx) => (
                                            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                        {skill}
                      </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Expérience professionnelle</h3>
                                    <div className="space-y-4">
                                        {selectedCandidate.experience && selectedCandidate.experience.length > 0 ? (
                                            selectedCandidate.experience.map((exp, idx) => (
                                                <div key={idx} className="border-l-2 border-blue-200 pl-4 pb-4">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <h4 className="font-medium text-slate-800">{exp.title}</h4>
                                                            <p className="text-sm text-slate-600">{exp.company}, {exp.location}</p>
                                                        </div>
                                                        <span className="text-sm text-slate-500">{exp.period}</span>
                                                    </div>
                                                    <p className="mt-2 text-sm text-slate-600">{exp.description}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 italic">Aucune expérience professionnelle renseignée</p>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Formation</h3>
                                    <div className="space-y-4">
                                        {selectedCandidate.education && selectedCandidate.education.length > 0 ? (
                                            selectedCandidate.education.map((edu, idx) => (
                                                <div key={idx} className="border-l-2 border-indigo-200 pl-4 pb-4">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <h4 className="font-medium text-slate-800">{edu.degree}</h4>
                                                            <p className="text-sm text-slate-600">{edu.institution}</p>
                                                        </div>
                                                        <span className="text-sm text-slate-500">{edu.period}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 italic">Aucune formation renseignée</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Analyse IA</h3>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-sm text-slate-700">
                                            {selectedCandidate.score >= 85 ? (
                                                <>Ce candidat présente une <strong>excellente adéquation</strong> avec le poste. Son profil technique correspond parfaitement aux exigences et son expérience est très pertinente.</>
                                            ) : selectedCandidate.score >= 70 ? (
                                                <>Ce candidat présente une <strong>bonne adéquation</strong> avec le poste. Il possède la plupart des compétences requises et une expérience satisfaisante.</>
                                            ) : (
                                                <>Ce candidat présente une <strong>adéquation moyenne</strong> avec le poste. Certaines compétences clés sont manquantes ou son expérience est limitée dans le domaine.</>
                                            )}
                                        </p>
                                        <div className="mt-3 pt-3 border-t border-blue-100">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium text-slate-700">Score global</span>
                                                <span className="text-xs font-medium text-slate-700">{selectedCandidate.score}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full" style={{ width: `${selectedCandidate.score}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center p-8">
                                <div className="text-slate-400 mb-2">
                                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium text-slate-500">Sélectionnez un candidat pour afficher ses détails</p>
                                </div>
                                <p className="text-slate-400 mt-2">Cliquez sur un candidat dans la liste pour voir son profil complet</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default CandidateManagement;