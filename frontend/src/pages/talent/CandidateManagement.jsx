import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, X, Plus, Upload, Star, Calendar 
,Filter
  ,
  ChevronUp,
  Users,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  MapPin,
  Building2

} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCandidates, createCandidate, jobService 
  ,companyService,cvService

} from '../../services/api.js';
import { useAuth } from '../../contexts/AuthContext'; // Import AuthContext
import axios from 'axios';
import { toast } from 'react-toastify';
 

const AddCandidateModal = ({ isOpen, onClose, companyId, onCandidateAdded }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobId: '',
    comment: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (isOpen && companyId) {
      const fetchJobs = async () => {
        try {
          setLoadingJobs(true);
          const activeJobs = await jobService.getJobs(companyId, { status: 'PUBLISHED' });
          setJobs(activeJobs || []);
        } catch (error) {
          toast.error("Erreur lors du chargement des offres d'emploi.");
        } finally {
          setLoadingJobs(false);
        }
      };
      fetchJobs();
    }
  }, [isOpen, companyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("Nom du fichier :", file);
    setResumeFile(file);
    console.log("resumeFile",resumeFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submissionData = new FormData();
    submissionData.append('firstName', formData.firstName);
    submissionData.append('lastName', formData.lastName);
    submissionData.append('email', formData.email);
    submissionData.append('phone', formData.phone);
    submissionData.append('job', formData.jobId); // Change jobId to job
    if (formData.comment) {
      submissionData.append('comment', formData.comment);
    }
    if (resumeFile) {
      submissionData.append('resume', resumeFile);
    }

    console.log('FormData:', Array.from(submissionData.entries()));

    try {
      await createCandidate(companyId, submissionData);
      toast.success('Candidat ajouté avec succès !');
      onCandidateAdded(); // Rafraîchir la liste des candidats
      onClose(); // Fermer le modal
      // Reset form
      setFormData({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        phone: '', 
        jobId: '', 
        comment: '' 
      });
      setResumeFile(null);
    } catch (error) {
      console.error("Erreur lors de l'ajout du candidat", error);
      console.error("Détails des erreurs de l'API:", error.response?.data);          
      toast.error("Erreur lors de l'ajout du candidat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Ajouter un Candidat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="firstName" 
                value={formData.firstName}
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName}
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone}
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>

          {/* Upload CV */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">CV</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Téléverser un fichier</span>
                    <input id="file-upload" name="resume" type="file" className="sr-only" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">ou glissez-déposez</p>
                </div>
                {resumeFile ? (
                  <p className="text-sm text-green-600 mt-2 font-medium">{resumeFile.name}</p>
                ) : (
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, RTF, TXT (max 5MB)</p>
                )}
              </div>
            </div>
          </div>

          {/* Sélection du job */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associer à une offre <span className="text-red-500">*</span>
            </label>
            <select 
              name="jobId" 
              value={formData.jobId}
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required
            >
              <option value="">Sélectionner une offre</option>
              {loadingJobs ? (
                <option>Chargement...</option>
              ) : (
                jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))
              )
            }
            </select>
          </div>

          {/* Commentaire optionnel */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire optionnel sur le candidat
            </label>
            <textarea 
              name="comment" 
              value={formData.comment}
              rows="3" 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ajouter des notes sur ce candidat..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" /> 
              {isSubmitting ? 'Ajout en cours...' : 'Ajouter le Candidat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CandidateManagement = () => {


  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    leads: false,
    applicants: false,
    inProgress: false,
    hired: false,
    disqualified: false
  });
  const navigate = useNavigate();
  const { companyId } = useAuth(); // Récupérer companyId depuis AuthContext

  const [jobs, setJobs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
const [selectedJobs, setSelectedJobs] = useState([]);  
const [selectedLocations, setSelectedLocations] = useState([]);
const [selectedDepartments, setSelectedDepartments] = useState([]);
 const [selectedHiringPhases, setSelectedHiringPhases] = useState([]);
  
 
  const [sortField, setSortField] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvanceDropdown, setShowAdvanceDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('updatedAt');
   

const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  const toggleHiringPhase = (phase) => {
    setSelectedHiringPhases(prev => 
      prev.includes(phase) 
        ? prev.filter(p => p !== phase)
        : [...prev, phase]
    );
  };

  const toggleJob = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(j => j !== jobId)
        : [...prev, jobId]
    );
  };

  const toggleLocation = (locationId) => {
    setSelectedLocations(prev => 
      prev.includes(locationId) 
        ? prev.filter(l => l !== locationId)
        : [...prev, locationId]
    );
  };

  const addCandidate = async (formData) => {
    try {
      await createCandidate(companyId, formData);
      await fetchCandidates();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du candidat:', error);
      throw error;
    }
  };

  const handleStageChange = async (candidateId, newStage) => {
  try {
    await cvService.updateCandidateStage(companyId, candidateId, newStage);
    await fetchCandidates(); // Recharger les candidats
  } catch (error) {
    console.error('Erreur lors du changement de stage:', error);
  }
};

  const toggleDepartment = (departmentId) => {
    setSelectedDepartments(prev => 
      prev.includes(departmentId) 
        ? prev.filter(d => d !== departmentId)
        : [...prev, departmentId]
    );
  };


  const fetchCandidates = async () => {
    setLoading(true);
    try {
      if (!companyId) {
        console.error("No companyId found in AuthContext");
        return;
      }
      const data = await getCandidates(companyId);
      setCandidates(data);
      const datajob = await jobService.getJobs(companyId);
      setJobs(datajob);
      const datalocation = await companyService.getCompanyLocations(companyId);
      setLocations(datalocation);
      const datadepart = await companyService.getDepartments(companyId);
      setDepartments(datadepart);
    } catch (error) {
      console.error("Erreur lors de la récupération des candidats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    const handleClickOutside = (event) => {
    if (showAdvanceDropdown && !event.target.closest('.relative')) {
      setShowAdvanceDropdown(null);
    }
  };
  
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
     

  }, [companyId, isModalOpen,showAdvanceDropdown]);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Added just now";
  };

  const getStageColor = (stage) => {
    const colors = {
      'Leads': 'bg-gray-100 text-gray-800',
      'NEW': 'bg-blue-100 text-blue-800',
      'SCREENING': 'bg-orange-100 text-orange-800',
      'INTERVIEW': 'bg-purple-100 text-purple-800',
      'OFFER': 'bg-yellow-100 text-yellow-800',
      'HIRED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const handleCandidateClick = (candidateId) => {
    navigate(`/candidates/${candidateId}`);
  };

  // Calculer les counts pour les filtres
  const filterCounts = {
    leads: candidates.filter(c => !c.applications[0]?.status || c.applications[0]?.status === 'NEW').length,
    applicants: candidates.filter(c => c.applications[0]?.status === 'NEW').length,
    inProgress: candidates.filter(c => ['SCREENING', 'INTERVIEW'].includes(c.applications[0]?.status)).length,
    hired: candidates.filter(c => c.applications[0]?.status === 'HIRED').length,
    disqualified: candidates.filter(c => c.applications[0]?.status === 'REJECTED').length
  };

// ...autres hooks...

const filteredCandidates = candidates.filter(candidate => {
  // Recherche
  const matchesSearch = `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase());

  // Phase
  const status = candidate.applications[0]?.status || 'NEW';
    const phaseMap = {
      leads: !status || status === 'NEW',
      applicants: status === 'NEW',
      inProgress: ['SCREENING', 'INTERVIEW'].includes(status),
      hired: status === 'HIRED',
      disqualified: status === 'REJECTED'
    };
  
  const matchesPhase = Object.entries(selectedFilters)
  .filter(([_, val]) => val)
  .length === 0 // si rien de coché, on affiche tout
  || Object.entries(selectedFilters).some(([key, val]) => val && phaseMap[key]);

  // Job
  const matchesJob = selectedJobs.length === 0 || candidate.applications.some(app => selectedJobs.includes(app.jobId));
  // Locations
  const matchesLocation = selectedLocations.length === 0 || candidate.applications.some(app => selectedLocations.includes(app.job?.locationId));
  // Departments
  const matchesDepartment = selectedDepartments.length === 0 || candidate.applications.some(app => selectedDepartments.includes(app.job?.departmentId));

  return matchesSearch && matchesPhase && matchesJob && matchesLocation && matchesDepartment;
});

const [currentPage, setCurrentPage] = useState(1);
const candidatesPerPage = 10;
const sortedCandidates = [...filteredCandidates].sort((a, b) => {
  if (sortField === 'updatedAt') {
    return sortOrder === 'desc'
      ? new Date(b.updatedAt) - new Date(a.updatedAt)
      : new Date(a.updatedAt) - new Date(b.updatedAt);
  }
  return 0;
});

 

const paginatedCandidates = sortedCandidates.slice(
  (currentPage - 1) * candidatesPerPage,
  currentPage * candidatesPerPage
);

const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Candidats</h1>
            <div className="flex items-center space-x-4">
              {/* Boutons de tri séparés */}

              <div className="flex items-center bg-white border rounded-lg">
           
              <button
                onClick={() => handleSortChange('updatedAt')}
                className={` px-4 py-2 text-sm text-slate-600 border-r' ${
                  sortBy === 'updatedAt' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Updated date
                {sortBy === 'updatedAt' && (
                  sortOrder === 'desc' ? <ChevronDown className="w-4 h-4 ml-1 inline" /> : <ChevronUp className="w-4 h-4 ml-1 inline" />
                )}
              </button>
              
              <button
                onClick={() => handleSortChange('name')}
                className={`px-4 py-2 text-sm text-slate-600 ${
                  sortBy === 'name' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Descending
                {sortBy === 'name' && (
                  sortOrder === 'desc' ? <ChevronDown className="w-4 h-4 ml-1 inline" /> : <ChevronUp className="w-4 h-4 ml-1 inline" />
                )}
              </button>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" /> Add Candidate
              </button>
            </div>
          </div>
          
          {/* Barre de recherche */}
          <div className="mt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar des filtres */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
              
              {/* Hiring Phase */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Hiring Phase</h3>
                  </div>
                  {selectedHiringPhases.length > 0 && (
                    <button
                      onClick={() => setSelectedHiringPhases([])}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {[
                    { key: 'leads', label: 'Leads', count: filterCounts.leads, icon: <Users className="w-4 h-4" /> },
                    { key: 'applicants', label: 'New Applicants', count: filterCounts.applicants, icon: <UserCheck className="w-4 h-4" /> },
                    { key: 'inProgress', label: 'In-Progress', count: filterCounts.inProgress, icon: <Clock className="w-4 h-4" /> },
                    { key: 'hired', label: 'Hired', count: filterCounts.hired, icon: <CheckCircle className="w-4 h-4" /> },
                    { key: 'disqualified', label: 'Disqualified', count: filterCounts.disqualified, icon: <XCircle className="w-4 h-4" /> }
                  ].map(phase => (
                    <div 
                      key={phase.key} 
                      onClick={() => toggleHiringPhase(phase.key)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedHiringPhases.includes(phase.key) 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={selectedHiringPhases.includes(phase.key)}
                          readOnly
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                        />
                        <div className="flex items-center gap-2">
                          {phase.icon}
                          <span className="text-sm font-medium text-gray-700">{phase.label}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                        {phase.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jobs */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Jobs</h3>
                  </div>
                  {selectedJobs.length > 0 && (
                    <button 
                      onClick={() => setSelectedJobs([])} 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {jobs.length === 0 ? (
                    <span className="text-xs text-gray-400">No jobs available</span>
                  ) : (
                    jobs.map(job => (
                      <div
                        key={job.id}
                        onClick={() => toggleJob(job.id)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                          selectedJobs.includes(job.id) 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedJobs.includes(job.id)}
                            readOnly
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{job.title}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Locations */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Office Locations</h3>
                  </div>
                  {selectedLocations.length > 0 && (
                    <button 
                      onClick={() => setSelectedLocations([])} 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {locations.length === 0 ? (
                    <span className="text-xs text-gray-400">No locations</span>
                  ) : (
                    locations.map(location => (
                      <div
                        key={location.id}
                        onClick={() => toggleLocation(location.id)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                          selectedLocations.includes(location.id) 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedLocations.includes(location.id)}
                            readOnly
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{location.name}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Departments */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Departments</h3>
                  </div>
                  {selectedDepartments.length > 0 && (
                    <button 
                      onClick={() => setSelectedDepartments([])} 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {departments.length === 0 ? (
                    <span className="text-xs text-gray-400">No departments</span>
                  ) : (
                    departments.map(dep => (
                      <div
                        key={dep.id}
                        onClick={() => toggleDepartment(dep.id)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                          selectedDepartments.includes(dep.id) 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedDepartments.includes(dep.id)}
                            readOnly
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{dep.name}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Chargement...</p>
                  </div>
                ) : filteredCandidates.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="mx-auto bg-blue-50 rounded-full h-24 w-24 flex items-center justify-center mb-4">
                      <Search className="h-12 w-12 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun candidat trouvé</h3>
                    <p className="text-gray-500 mb-6">Aucun candidat ne correspond à vos critères de recherche.</p>
                    <button 
                      onClick={() => setIsModalOpen(true)} 
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center mx-auto hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" /> Ajouter un Candidat
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
  {paginatedCandidates.map(candidate => (
    <div 
      key={candidate.id} 
      onClick={() => handleCandidateClick(candidate.id)} 
      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <span className="text-orange-600 font-semibold text-sm">
            {getInitials(candidate.firstName, candidate.lastName)}
          </span>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">
            {candidate.firstName} {candidate.lastName}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Briefcase className="w-4 h-4" />
            <span>data scientist</span>
            <span className="mx-2">•</span>
            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium">
              {candidate.applications && candidate.applications[0] ? candidate.applications[0].status : 'Leads'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-red-500 hover:text-red-700">
          <X className="w-4 h-4" />
          <span className="text-sm ml-1">Disqualify</span>
        </button>
       <div className="relative">
  <button 
    onClick={(e) => {
      e.stopPropagation();
      setShowAdvanceDropdown(showAdvanceDropdown === candidate.id ? null : candidate.id);
    }}
    className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600 flex items-center gap-1"
  >
    Advance
    <ChevronDown className="w-4 h-4" />
  </button>
  
  {showAdvanceDropdown === candidate.id && (
    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-3">
        <p className="text-sm font-medium text-gray-700 mb-3">Move to:</p>
        <div className="space-y-2">
          {[
            { icon: '👥', label: 'Leads', value: 'leads' },
            { icon: '📋', label: 'Applicants', value: 'applicants' },
            { icon: '👤', label: 'Short List', value: 'shortlist' },
            { icon: '📞', label: 'Screening Call', value: 'screening' },
            { icon: '💼', label: 'Interview', value: 'interview' },
            { icon: '👤', label: 'Final review', value: 'final' },
            { icon: '💰', label: 'Offer', value: 'offer' },
            { icon: '✅', label: 'Hired', value: 'hired' },
            { icon: '❌', label: 'Disqualified', value: 'disqualified' },
            { icon: '📁', label: 'Archived', value: 'archived' }
          ].map((stage) => (
            <button
              key={stage.value}
              onClick={(e) => {
                e.stopPropagation();
                handleStageChange(candidate.id, stage.value);
                setShowAdvanceDropdown(null);
              }}
              className="flex items-center gap-3 w-full p-2 text-left hover:bg-gray-50 rounded text-sm text-gray-700"
            >
              <span>{stage.icon}</span>
              <span>{stage.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )}
</div>
        <span className="text-sm text-gray-500">
          <Clock className="w-4 h-4 inline mr-1" />
          Added {timeSince(candidate.updatedAt || candidate.createdAt)}
        </span>
      </div>
    </div>
  ))}
</div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-6 space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'ajout de candidat */}
      <AddCandidateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={addCandidate}
      />
    </div>
  );
};

export default CandidateManagement;