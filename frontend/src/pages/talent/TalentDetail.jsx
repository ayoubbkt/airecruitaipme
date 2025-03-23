import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Download, Share2, Mail, Phone, Calendar, Briefcase, MapPin, Clock, Award, CheckCircle, Star, ArrowRight, Book, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TalentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [jobs, setJobs] = useState([]);
  const [activities, setActivities] = useState([]);


  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        setLoading(true);
        
        // Fetch candidate details and related data
        const [candidateRes, jobsRes, activitiesRes] = await Promise.all([
          axios.get(`/api/candidates/${id}`),
          axios.get('/api/jobs', { params: { status: 'ACTIVE' } }),
          axios.get(`/api/candidates/${id}/activities`)
        ]);
        
        setCandidate(candidateRes.data);
        setJobs(jobsRes.data);
        setActivities(activitiesRes.data);
      } catch (error) {
        console.error('Error fetching candidate data:', error);
        toast.error('Erreur lors du chargement des détails du candidat');
        navigate('/talent-pool');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidateData();
  }, [id, navigate]);
  
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    
    try {
      await axios.put(`/api/candidates/${id}/status`, { status: newStatus });
      setCandidate(prev => ({ ...prev, status: newStatus }));
      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Error updating candidate status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Candidat non trouvé</h2>
        <p className="text-slate-600 mb-6">Le candidat que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link to="/talent-pool" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Retour à la base de talents
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <button 
            className="p-2 rounded-full hover:bg-slate-100 mr-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Profil du candidat</h1>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-medium">
              {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-slate-800">{candidate.firstName} {candidate.lastName}</h1>
              <p className="text-lg text-slate-600">{candidate.title}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                {candidate.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-slate-500 mr-1" />
                    <span className="text-sm text-slate-600">{candidate.email}</span>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-slate-500 mr-1" />
                    <span className="text-sm text-slate-600">{candidate.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <div className="relative w-full sm:w-auto">
              <select
                className="w-full sm:w-48 p-2.5 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={candidate.status}
                onChange={handleStatusChange}
              >
                <option value="NEW">Nouveau</option>
                <option value="CONTACTED">Contacté</option>
                <option value="INTERVIEWING">En entretien</option>
                <option value="OFFER_SENT">Offre envoyée</option>
                <option value="HIRED">Embauché</option>
                <option value="REJECTED">Rejeté</option>
              </select>
              <ChevronLeft className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-slate-500" size={16} />
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition font-medium flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Contacter
              </button>
              <button className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Entretien
              </button>
              <button className="p-2.5 border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2">
          {/* Tabs Navigation */}
          <div className="bg-white rounded-t-xl shadow-sm">
            <div className="flex border-b border-slate-200">
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Profil
              </button>
              <button 
                onClick={() => setActiveTab('cv')} 
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'cv'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                CV
              </button>
              <button 
                onClick={() => setActiveTab('activities')} 
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'activities'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Activités
              </button>
              <button 
                onClick={() => setActiveTab('notes')} 
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'notes'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Notes
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="bg-white rounded-b-xl shadow-sm mb-6 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* About */}
                <div>
                  <h3 className="text-md font-semibold text-slate-800 mb-3">À propos</h3>
                  <p className="text-slate-600">{candidate.summary || 'Aucun résumé disponible pour ce candidat.'}</p>
                </div>
                
                {/* Skills */}
                <div>
                  <h3 className="text-md font-semibold text-slate-800 mb-3">Compétences</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills && candidate.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                        {skill}
                      </span>
                    ))}
                    {(!candidate.skills || candidate.skills.length === 0) && (
                      <p className="text-slate-500">Aucune compétence listée</p>
                    )}
                  </div>
                </div>
                
                {/* Experience */}
                <div>
                  <h3 className="text-md font-semibold text-slate-800 mb-3">Expérience professionnelle</h3>
                  {candidate.experience && candidate.experience.length > 0 ? (
                    <div className="space-y-4">
                      {candidate.experience.map((exp, index) => (
                        <div key={index} className="flex">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                              <Briefcase className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-md font-medium text-slate-800">{exp.title}</h4>
                            <p className="text-sm text-slate-600">{exp.company}</p>
                            <div className="flex items-center mt-1 mb-2">
                              <span className="text-xs text-slate-500">{exp.startDate} - {exp.endDate || 'Présent'}</span>
                              {exp.location && (
                                <>
                                  <span className="mx-2 text-slate-300">•</span>
                                  <div className="flex items-center">
                                    <MapPin className="w-3 h-3 text-slate-400 mr-1" />
                                    <span className="text-xs text-slate-500">{exp.location}</span>
                                  </div>
                                </>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{exp.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">Aucune expérience professionnelle disponible</p>
                  )}
                </div>
                
                {/* Education */}
                <div>
                  <h3 className="text-md font-semibold text-slate-800 mb-3">Formation</h3>
                  {candidate.education && candidate.education.length > 0 ? (
                    <div className="space-y-4">
                      {candidate.education.map((edu, index) => (
                        <div key={index} className="flex">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                              <Book className="w-5 h-5 text-indigo-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-md font-medium text-slate-800">{edu.degree}</h4>
                            <p className="text-sm text-slate-600">{edu.institution}</p>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-slate-500">{edu.startYear} - {edu.endYear || 'Présent'}</span>
                              {edu.location && (
                                <>
                                  <span className="mx-2 text-slate-300">•</span>
                                  <div className="flex items-center">
                                    <MapPin className="w-3 h-3 text-slate-400 mr-1" />
                                    <span className="text-xs text-slate-500">{edu.location}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">Aucune formation disponible</p>
                  )}
                </div>
              </div>
            )}
            
            {/* CV Tab */}
            {activeTab === 'cv' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-semibold text-slate-800">CV original</h3>
                  <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-slate-500 mb-3">Aperçu du CV</p>
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition font-medium">
                      Voir le CV complet
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <div>
                <h3 className="text-md font-semibold text-slate-800 mb-4">Historique d'activités</h3>
                
                {activities && activities.length > 0 ? (
                  <div className="relative space-y-6">
                    {/* Line connecting timeline items */}
                    <div className="absolute top-0 left-4 bottom-0 w-0.5 bg-slate-200"></div>
                    
                    {activities.map((activity, index) => (
                      <div key={index} className="relative pl-10">
                        <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center z-10">
                          {activity.type === 'STATUS_CHANGE' && <Tag className="w-4 h-4 text-blue-600" />}
                          {activity.type === 'INTERVIEW' && <Calendar className="w-4 h-4 text-blue-600" />}
                          {activity.type === 'NOTE' && <Star className="w-4 h-4 text-blue-600" />}
                          {activity.type === 'EMAIL' && <Mail className="w-4 h-4 text-blue-600" />}
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-sm font-medium text-slate-800">{activity.title}</h4>
                              <p className="text-xs text-slate-500">{new Date(activity.timestamp).toLocaleString()}</p>
                            </div>
                            {activity.author && (
                              <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-medium mr-1">
                                  {activity.author.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-xs text-slate-500">{activity.author}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-lg">
                    <Clock className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                    <p className="text-slate-500">Aucune activité enregistrée pour ce candidat</p>
                  </div>
                )}
              </div>
            )}
            
           {/* Notes Tab */}
           {activeTab === 'notes' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-semibold text-slate-800">Notes</h3>
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Ajouter une note</button>
                </div>
                
                {candidate.notes && candidate.notes.length > 0 ? (
                  <div className="space-y-4">
                    {candidate.notes.map((note, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                              {note.authorInitials}
                            </div>
                            <div className="ml-2">
                              <p className="text-sm font-medium text-slate-800">{note.authorName}</p>
                              <p className="text-xs text-slate-500">{new Date(note.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {note.type}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <p className="text-slate-500">Aucune note pour ce candidat</p>
                    <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                      Ajouter la première note
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Right column */}
        <div className="space-y-6">
          {/* Candidate metadata */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-md font-semibold text-slate-800 mb-4">Informations</h3>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mt-0.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-slate-500">Date d'ajout</p>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(candidate.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mt-0.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-slate-500">Expérience</p>
                  <p className="text-sm font-medium text-slate-800">
                    {candidate.yearsOfExperience || 'N/A'} ans
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mt-0.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-slate-500">Localisation</p>
                  <p className="text-sm font-medium text-slate-800">
                    {candidate.location || 'Non spécifiée'}
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mt-0.5">
                  <Award className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-slate-500">Score IA</p>
                  <p className="text-sm font-medium text-slate-800">
                    {candidate.score || 'N/A'}%
                  </p>
                </div>
              </li>
            </ul>
            
            {/* Source info */}
            {candidate.source && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mt-0.5">
                    <Share2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-slate-500">Source</p>
                    <p className="text-sm font-medium text-slate-800">
                      {candidate.source}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Job match */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-md font-semibold text-slate-800 mb-4">Correspondance aux postes</h3>
            
            {jobs && jobs.length > 0 ? (
              <div className="space-y-3">
                {jobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-slate-800">{job.title}</h4>
                      <div className="flex items-center mt-1">
                        <MapPin className="w-3 h-3 text-slate-400 mr-1" />
                        <span className="text-xs text-slate-500">{job.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-medium">
                        {candidate.jobMatches && candidate.jobMatches[job.id] ? 
                          `${candidate.jobMatches[job.id]}%` : '?'}
                      </div>
                      <button className="ml-3 text-slate-400 hover:text-blue-600">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {jobs.length > 3 && (
                  <Link to="/jobs" className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-2">
                    Voir tous les postes ({jobs.length})
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-lg">
                <p className="text-slate-500 text-sm">Aucun poste disponible</p>
              </div>
            )}
          </div>
          
          {/* Similar candidates */}
          {candidate.similarCandidates && candidate.similarCandidates.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-md font-semibold text-slate-800 mb-4">Candidats similaires</h3>
              
              <div className="space-y-3">
                {candidate.similarCandidates.map((similar) => (
                  <Link key={similar.id} to={`/talent/${similar.id}`} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      {similar.firstName.charAt(0)}{similar.lastName.charAt(0)}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-slate-800">{similar.firstName} {similar.lastName}</h4>
                      <p className="text-xs text-slate-500">{similar.title}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mr-2">
                        {similar.similarity}% similar
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalentDetail;