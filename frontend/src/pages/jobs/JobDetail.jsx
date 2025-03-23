import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Edit, Trash2, UserPlus, User, MapPin, BriefcaseBusiness, Calendar } from 'lucide-react';
import { jobService } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);


  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        const data = await jobService.getJobById(id);
        setJob(data);
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast.error('Erreur lors du chargement des détails de l\'offre');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetail();
  }, [id, navigate]);
  
  const handleDelete = async () => {
    try {
      await jobService.deleteJob(id);
      toast.success('Offre supprimée avec succès');
      navigate('/jobs');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Erreur lors de la suppression de l\'offre');
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Offre non trouvée</h2>
        <p className="text-slate-600 mb-6">L'offre d'emploi que vous recherchez n'existe pas ou a été supprimée.</p>
        <Link to="/jobs" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Retour aux offres
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          className="p-2 rounded-full hover:bg-slate-100 mr-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Détails de l'offre</h1>
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{job.title}</h2>
          <div className="flex items-center mt-1">
            <MapPin className="h-4 w-4 text-slate-500 mr-1" />
            <span className="text-slate-600 mr-4">{job.location}</span>
            <BriefcaseBusiness className="h-4 w-4 text-slate-500 mr-1" />
            <span className="text-slate-600">{job.jobType}</span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link to={`/jobs/${id}/edit`} className="flex items-center px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700">
            <Edit className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Modifier</span>
          </Link>
          
          {!deleteConfirm ? (
            <button 
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Supprimer</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Confirmer
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Job Description */}
          <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
            <div className="p-6 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Description du poste</h3>
            </div>
            <div className="p-6">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br>') }}></div>
            </div>
          </div>
          
          {/* Required Skills */}
          <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
            <div className="p-6 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Compétences requises</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {job.requiredSkills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                    {skill}
                  </span>
                ))}
              </div>
              
              <h4 className="text-md font-medium text-slate-700 mt-6 mb-3">Compétences souhaitées</h4>
              <div className="flex flex-wrap gap-2">
                {job.preferredSkills.length > 0 ? (
                  job.preferredSkills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 rounded-full text-sm font-medium bg-slate-50 text-slate-700">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-500">Aucune compétence souhaitée spécifiée</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 pb-3 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Candidatures récentes</h3>
                <Link to={`/jobs/${id}/applications`} className="text-sm text-blue-600 font-medium">Voir toutes</Link>
              </div>
            </div>
            
            <div className="p-6">
              {job.recentApplications && job.recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {job.recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                          {application.candidate.firstName.charAt(0)}{application.candidate.lastName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-slate-800">{application.candidate.firstName} {application.candidate.lastName}</p>
                          <p className="text-xs text-slate-500">{application.candidate.title}</p>
                        </div>
                      </div>
                      <Link to={`/cv/${application.candidate.id}`} className="px-3 py-1 text-xs bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                        Voir profil
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Aucune candidature pour cette offre</p>
                  <Link to="/cv-analysis" className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm inline-block">
                    Analyser des CV
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Side Panel */}
        <div className="space-y-6">
          {/* Job Details */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Informations sur le poste</h3>
            </div>
            <div className="p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-slate-500">Département</dt>
                  <dd className="text-sm font-medium text-slate-800 mt-1">{job.department}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Type de contrat</dt>
                  <dd className="text-sm font-medium text-slate-800 mt-1">{job.jobType}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Expérience minimale</dt>
                  <dd className="text-sm font-medium text-slate-800 mt-1">{job.minYearsExperience} {job.minYearsExperience > 1 ? 'ans' : 'an'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Salaire</dt>
                  <dd className="text-sm font-medium text-slate-800 mt-1">{job.salaryRange || 'Non précisé'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Statut</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      job.status === 'DRAFT' ? 'bg-slate-100 text-slate-800' : 
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {job.status === 'ACTIVE' ? 'Active' : job.status === 'DRAFT' ? 'Brouillon' : 'Archivée'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Date de publication</dt>
                  <dd className="text-sm font-medium text-slate-800 mt-1">{new Date(job.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Candidates */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Statistiques</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-slate-600">Candidatures totales</p>
                    <p className="text-sm font-medium text-slate-800">{job.applicationsCount || 0}</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-slate-600">Candidats qualifiés</p>
                    <p className="text-sm font-medium text-slate-800">{job.qualifiedCandidatesCount || 0}</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${job.qualifiedCandidatesCount && job.applicationsCount ? (job.qualifiedCandidatesCount / job.applicationsCount) * 100 : 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-slate-600">Entretiens planifiés</p>
                    <p className="text-sm font-medium text-slate-800">{job.interviewsCount || 0}</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${job.interviewsCount && job.applicationsCount ? (job.interviewsCount / job.applicationsCount) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Link to="/cv-analysis" className="w-full py-2 flex items-center justify-center bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Analyser des candidats
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;