import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, ArrowLeft, Download, Mail, Phone, MapPin, Star, X, Check, MessageCircle, FileText, Activity } from 'lucide-react';
import { cvService } from '../../services/api';

const CandidateProfile = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCandidateDetails = async () => {
            try {
                setLoading(true);
                const response = await cvService.getCVById(id);
                setCandidate(response);
            } catch (error) {
                console.error('Error fetching candidate details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidateDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">Candidat non trouvé</h2>
                <p className="text-slate-600 mb-6">Le candidat que vous recherchez n'existe pas ou a été supprimé.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-6xl mx-auto">
            {/* Header with navigation */}
            <div className="p-4 border-b border-slate-100 flex items-center">
                <button
                    className="p-2 mr-2 rounded-full hover:bg-slate-100"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <h1 className="text-xl font-semibold text-slate-800">Profil du candidat</h1>

                <div className="ml-auto flex space-x-2">
                    <button
                        className="p-2 rounded-full hover:bg-slate-100"
                        onClick={() => window.open(`mailto:${candidate.email}`)}
                    >
                        <Mail className="w-5 h-5 text-slate-600" />
                    </button>
                    <button
                        className="p-2 rounded-full hover:bg-slate-100"
                        onClick={() => cvService.downloadCV(candidate.id)}
                    >
                        <Download className="w-5 h-5 text-slate-600" />
                    </button>
                    <button className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm rounded-md hover:from-blue-600 hover:to-indigo-700">
                        Avancer
                    </button>
                    <button className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-md hover:bg-red-200">
                        Disqualifier
                    </button>
                </div>
            </div>

            {/* Candidate General Info */}
            <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Left column - Candidates in Stage */}
                <div className="w-full md:w-1/4">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Candidats dans l'étape</h3>
                    <div className="space-y-2">
                        <div className="bg-blue-100 p-3 rounded-md">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                    {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                                </div>
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-slate-800">{candidate.firstName} {candidate.lastName}</p>
                                    <p className="text-xs text-slate-500">dans cette étape depuis 9h</p>
                                </div>
                            </div>
                        </div>

                        {/* Mock data for others in the same stage */}
                        <div className="p-3 rounded-md hover:bg-slate-50">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-semibold">
                                    MG
                                </div>
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-slate-800">Marie Giraud</p>
                                    <p className="text-xs text-slate-500">dans cette étape depuis 1h</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center column - Main Profile */}
                <div className="w-full md:w-2/4">
                    <div className="flex items-start mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-semibold">
                            {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                            <div className="flex items-center">
                                <h2 className="text-xl font-bold text-slate-800">{candidate.firstName} {candidate.lastName}</h2>
                                <button className="ml-2 p-1 rounded hover:bg-slate-100">
                                    <Edit className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                            <p className="text-slate-600">{candidate.title}</p>
                            <p className="text-sm text-slate-500 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                  Leads
                </span>
                                Ajouté il y a 9 heures
                            </p>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="border-b border-slate-200 mb-4">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                                    activeTab === 'overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Aperçu
                            </button>
                            <button
                                onClick={() => setActiveTab('resume')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                                    activeTab === 'resume'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                CV
                            </button>
                            <button
                                onClick={() => setActiveTab('messages')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                                    activeTab === 'messages'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Messages
                            </button>
                            <button
                                onClick={() => setActiveTab('files')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                                    activeTab === 'files'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Fichiers
                            </button>
                            <button
                                onClick={() => setActiveTab('ratings')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                                    activeTab === 'ratings'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Évaluations
                            </button>
                            <button
                                onClick={() => setActiveTab('activity')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                                    activeTab === 'activity'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Activité
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            {/* Experience Section */}
                            <div className="border border-slate-200 rounded-md overflow-hidden">
                                <div className="flex justify-between items-center p-4 bg-slate-50">
                                    <h3 className="font-medium text-slate-700">Expérience</h3>
                                    <button className="p-1 rounded hover:bg-slate-200">
                                        <Edit className="w-4 h-4 text-slate-500" />
                                    </button>
                                </div>
                                {candidate.experience && candidate.experience.length > 0 ? (
                                    <div className="p-4">
                                        {candidate.experience.map((exp, index) => (
                                            <div key={index} className="mb-4 last:mb-0">
                                                <div className="flex justify-between">
                                                    <h4 className="font-medium text-slate-800">{exp.title}</h4>
                                                    <span className="text-sm text-slate-500">{exp.period}</span>
                                                </div>
                                                <div className="text-sm text-slate-600">{exp.company}, {exp.location}</div>
                                                <p className="text-sm text-slate-600 mt-1">{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 flex items-center justify-center text-slate-400 text-sm">
                                        <div className="text-center p-6">
                                            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            <p>Aucune expérience n'a été ajoutée.</p>
                                            <button className="mt-2 text-blue-500 hover:text-blue-700">+ Ajouter une expérience</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Education Section */}
                            <div className="border border-slate-200 rounded-md overflow-hidden">
                                <div className="flex justify-between items-center p-4 bg-slate-50">
                                    <h3 className="font-medium text-slate-700">Formation</h3>
                                    <button className="p-1 rounded hover:bg-slate-200">
                                        <Edit className="w-4 h-4 text-slate-500" />
                                    </button>
                                </div>
                                {candidate.education && candidate.education.length > 0 ? (
                                    <div className="p-4">
                                        {candidate.education.map((edu, index) => (
                                            <div key={index} className="mb-4 last:mb-0">
                                                <div className="flex justify-between">
                                                    <h4 className="font-medium text-slate-800">{edu.degree}</h4>
                                                    <span className="text-sm text-slate-500">{edu.period}</span>
                                                </div>
                                                <div className="text-sm text-slate-600">{edu.institution}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 flex items-center justify-center text-slate-400 text-sm">
                                        <div className="text-center p-6">
                                            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            <p>Aucune formation n'a été ajoutée.</p>
                                            <button className="mt-2 text-blue-500 hover:text-blue-700">+ Ajouter une formation</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Skills Section */}
                            <div className="border border-slate-200 rounded-md overflow-hidden">
                                <div className="flex justify-between items-center p-4 bg-slate-50">
                                    <h3 className="font-medium text-slate-700">Compétences</h3>
                                    <button className="p-1 rounded hover:bg-slate-200">
                                        <Edit className="w-4 h-4 text-slate-500" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.skills && candidate.skills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {skill}
                      </span>
                                        ))}
                                        <button className="px-3 py-1 border border-dashed border-slate-300 rounded-full text-sm text-slate-500 hover:bg-slate-50">
                                            + Ajouter
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Questions/Answers Section */}
                            <div className="border border-slate-200 rounded-md overflow-hidden">
                                <div className="flex justify-between items-center p-4 bg-slate-50">
                                    <h3 className="font-medium text-slate-700">Questions / Réponses</h3>
                                </div>
                                <div className="p-6 flex items-center justify-center text-slate-400 text-sm">
                                    <div className="text-center p-6">
                                        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                        <p>Aucune question n'a été posée à ce candidat.</p>
                                        <button className="mt-2 text-blue-500 hover:text-blue-700">+ Ajouter une question</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'resume' && (
                        <div className="text-center py-12 text-slate-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p>Le CV du candidat sera affiché ici.</p>
                            <button
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                onClick={() => cvService.downloadCV(candidate.id)}
                            >
                                Télécharger le CV
                            </button>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="text-center py-12 text-slate-500">
                            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p>Les messages échangés avec le candidat seront affichés ici.</p>
                            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                Envoyer un message
                            </button>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="text-center py-12 text-slate-500">
                            <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p>L'historique d'activité du candidat sera affiché ici.</p>
                        </div>
                    )}
                </div>

                {/* Right column - Status & Details */}
                <div className="w-full md:w-1/4">
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-slate-700 mb-3">Statut</h3>
                        <div className="bg-white border border-slate-200 rounded-md p-4">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Étape</span>
                                    <span className="text-sm font-medium">Leads</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Entré dans l'étape</span>
                                    <span className="text-sm">il y a 9 heures</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Ajouté</span>
                                    <span className="text-sm">{new Date(candidate.createdAt).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Dernière mise à jour</span>
                                    <span className="text-sm">{new Date(candidate.updatedAt || candidate.createdAt).toLocaleDateString('fr-FR')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-medium text-slate-700">Coordonnées</h3>
                            <button className="p-1 rounded hover:bg-slate-100">
                                <Edit className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-md p-4">
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <Mail className="w-4 h-4 text-slate-400 mt-1 mr-2 flex-shrink-0" />
                                    <div>
                                        <span className="text-sm text-slate-500 block">Email</span>
                                        <span className="text-sm">{candidate.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Phone className="w-4 h-4 text-slate-400 mt-1 mr-2 flex-shrink-0" />
                                    <div>
                                        <span className="text-sm text-slate-500 block">Téléphone</span>
                                        <span className="text-sm">{candidate.phone || 'Non spécifié'}</span>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <MapPin className="w-4 h-4 text-slate-400 mt-1 mr-2 flex-shrink-0" />
                                    <div>
                                        <span className="text-sm text-slate-500 block">Adresse</span>
                                        <span className="text-sm">{candidate.location || 'Non spécifiée'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-slate-700 mb-3">Score IA</h3>
                        <div className="bg-white border border-slate-200 rounded-md p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        candidate.score >= 80 ? 'bg-green-100 text-green-700' :
                                            candidate.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                    }`}>
                                        {candidate.score}%
                                    </div>
                                    <span className="ml-3 text-sm font-medium">
                    {candidate.score >= 80 ? 'Excellent' :
                        candidate.score >= 60 ? 'Bon' :
                            'À améliorer'}
                  </span>
                                </div>
                                <button className="text-blue-500 text-sm hover:text-blue-700">
                                    Détails
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateProfile;