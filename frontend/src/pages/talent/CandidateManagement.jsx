import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, X, Plus, Upload, Star, Calendar } from 'lucide-react';
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
  
 
  const [sortField, setSortField] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [openAdvanceDropdown, setOpenAdvanceDropdown] = useState(null);





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
     

  }, [companyId, isModalOpen]);

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Candidats</h1>
            <div className="flex items-center space-x-4">
              <button
  className={`flex items-center text-gray-600 hover:text-gray-900 transition-colors ${sortField === 'updatedAt' ? 'font-bold underline' : ''}`}
  onClick={() => setSortField('updatedAt')}
>
  Updated date
  {sortField === 'updatedAt' && (
    sortOrder === 'desc'
      ? <i className="fa-solid fa-arrow-down ml-1"></i>
      : <i className="fa-solid fa-arrow-up ml-1"></i>
  )}
</button>
<button
  className={`flex items-center text-gray-600 hover:text-gray-900 transition-colors ${sortOrder === 'desc' ? 'font-bold underline' : ''}`}
  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
>
  {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
  {sortOrder === 'desc'
    ? <i className="fa-solid fa-arrow-down ml-1"></i>
    : <i className="fa-solid fa-arrow-up ml-1"></i>
  }
</button>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5 mr-2" /> Ajouter un Candidat
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filtres */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-8">
              <div className="mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Rechercher des candidats..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        />
      </div>
    </div>
              {/* Hiring Phase */}
              
<div>
  
<div className="flex justify-between items-center mb-4">
  <div className="flex items-center gap-2">
    <span className="text-lg"><i className="fa-solid fa-table-cells-large"></i></span>
    <h3 className="font-semibold text-gray-900">Hiring Phase</h3>
  </div>
  {Object.values(selectedFilters).some(v => !v) && (
    <button
      onClick={() => setSelectedFilters({
        leads: true,
        applicants: true,
        inProgress: true,
        hired: true,
        disqualified: true
      })}
      className="text-sm text-blue-600 hover:text-blue-700"
    >
      Clear
    </button>
  )}
</div>
  <div className="space-y-3">
    {[
      { key: 'leads', label: 'Leads', count: filterCounts.leads, icon: <i className="fa-regular fa-user"></i> },
      { key: 'applicants', label: 'New Applicants', count: filterCounts.applicants, icon: <i className="fa-regular fa-user-plus"></i> },
      { key: 'inProgress', label: 'In-Progress', count: filterCounts.inProgress, icon: <i className="fa-regular fa-spinner"></i> },
      { key: 'hired', label: 'Hired', count: filterCounts.hired, icon: <i className="fa-regular fa-check"></i> },
      { key: 'disqualified', label: 'Disqualified', count: filterCounts.disqualified, icon: <i className="fa-regular fa-xmark"></i> }
    ].map(phase => (
      <div key={phase.key} className="flex items-center justify-between">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            checked={selectedFilters[phase.key]}
            onChange={(e) => setSelectedFilters(prev => ({
              ...prev,
              [phase.key]: e.target.checked
            }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
          />
          <span className="ml-3 text-sm text-gray-700 flex items-center gap-1">{phase.icon}{phase.label}</span>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {phase.count}
        </span>
      </div>
    ))}
  </div>
</div>
              {/* Jobs */}
              <div>
   
<div className="flex justify-between items-center mb-2">
  <div className="flex items-center gap-2">
    <span className="text-lg"><i className="fa-solid fa-briefcase"></i></span>
    <h3 className="font-semibold text-gray-900">Jobs</h3>
  </div>
  {selectedJobs.length > 0 && (
    <button onClick={() => setSelectedJobs([])} className="text-sm text-blue-600 hover:text-blue-700">Clear</button>
  )}
</div>
<div className="space-y-2">
  {jobs.map(job => (
    <div
      key={job.id}
      className={`flex items-center gap-2 text-sm px-2 py-1 rounded cursor-pointer ${selectedJobs.includes(job.id) ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-blue-50'}`}
      onClick={() => {
        setSelectedJobs(selectedJobs.includes(job.id)
          ? selectedJobs.filter(j => j !== job.id)
          : [...selectedJobs, job.id]);
      }}
    >
      <input
        type="checkbox"
        checked={selectedJobs.includes(job.id)}
        readOnly
      />
      {job.title}
    </div>
  ))}
</div>
</div>
              {/* Office Locations */}
              <div>
  <div className="flex justify-between items-center mb-2">
    <div className="flex items-center gap-2">
      <span className="text-lg"><i className="fa-solid fa-building"></i></span>
      <h3 className="font-semibold text-gray-900">Office Locations</h3>
    </div>
    {selectedLocations.length > 0 && (
      <button onClick={() => setSelectedLocations([])} className="text-sm text-blue-600 hover:text-blue-700">Clear</button>
    )}
  </div>
  <div className="space-y-2">
    {locations.length === 0 ? (
      <span className="text-xs text-gray-400">No locations</span>
    ) : (
      locations.map(loc => (
        <div
          key={loc.id}
          className={`flex items-center gap-2 text-sm px-2 py-1 rounded cursor-pointer ${selectedLocations.includes(loc.id) ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-blue-50'}`}
          onClick={() => {
            setSelectedLocations(selectedLocations.includes(loc.id)
              ? selectedLocations.filter(l => l !== loc.id)
              : [...selectedLocations, loc.id]);
          }}
        >
          <input
            type="checkbox"
            checked={selectedLocations.includes(loc.id)}
            readOnly
          />
          {loc.city}, {loc.country}
        </div>
      ))
    )}
  </div>
</div>

{/* Departments */}
<div>
  <div className="flex justify-between items-center mb-2">
    <div className="flex items-center gap-2">
      <span className="text-lg"><i className="fa-solid fa-layer-group"></i></span>
      <h3 className="font-semibold text-gray-900">Departments</h3>
    </div>
    {selectedDepartments.length > 0 && (
      <button onClick={() => setSelectedDepartments([])} className="text-sm text-blue-600 hover:text-blue-700">Clear</button>
    )}
  </div>
  <div className="space-y-2 max-h-32 overflow-y-auto">
    {departments.length === 0 ? (
      <span className="text-xs text-gray-400">No departments</span>
    ) : (
      departments.map(dep => (
        <div
          key={dep.id}
          className={`flex items-center gap-2 text-sm px-2 py-1 rounded cursor-pointer ${selectedDepartments.includes(dep.id) ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-blue-50'}`}
          onClick={() => {
            setSelectedDepartments(selectedDepartments.includes(dep.id)
              ? selectedDepartments.filter(d => d !== dep.id)
              : [...selectedDepartments, dep.id]);
          }}
        >
          <input
            type="checkbox"
            checked={selectedDepartments.includes(dep.id)}
            readOnly
          />
          {dep.name}
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
               

              {/* Liste des candidats */}
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
                        className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                {getInitials(candidate.firstName, candidate.lastName)}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {candidate.firstName} {candidate.lastName}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {candidate.applications[0]?.jobTitle || 'No Job'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {timeSince(candidate.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStageColor(candidate.applications[0]?.status || 'NEW')}`}>
                              {candidate.applications[0]?.status || 'Leads'}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Disqualify:', candidate.id);
                                }}
                                className="text-gray-500 hover:text-red-600 text-sm transition-colors"
                              >
                                Disqualify
                              </button>
                              <div className="relative">
  <button
    onClick={e => {
      e.stopPropagation();
      setOpenAdvanceDropdown(openAdvanceDropdown === candidate.id ? null : candidate.id);
    }}
    className="border border-blue-600 text-blue-600 px-4 py-1 rounded-lg text-sm hover:bg-blue-50 transition-colors"
  >
    Advance <ChevronDown className="inline w-4 h-4 ml-1" />
  </button>
  {openAdvanceDropdown === candidate.id && (
    <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
      <div className="p-2 text-xs text-gray-500">Move to:</div>
      {[
        { key: 'Leads', label: 'Leads', icon: <i className="fa-regular fa-table-cells"></i> },
        { key: 'Applicants', label: 'Applicants', icon: <i className="fa-regular fa-user-plus"></i> },
        { key: 'Short List', label: 'Short List', icon: <i className="fa-regular fa-list"></i> },
        { key: 'Screening Call', label: 'Screening Call', icon: <i className="fa-regular fa-phone"></i> },
        { key: 'Interview', label: 'Interview', icon: <i className="fa-regular fa-comments"></i> },
        { key: 'Final review', label: 'Final review', icon: <i className="fa-regular fa-star"></i> },
        { key: 'Offer', label: 'Offer', icon: <i className="fa-regular fa-gift"></i> },
        { key: 'Hired', label: 'Hired', icon: <i className="fa-regular fa-check"></i> },
        { key: 'Disqualified', label: 'Disqualified', icon: <i className="fa-regular fa-xmark"></i> },
        { key: 'Archived', label: 'Archived', icon: <i className="fa-regular fa-archive"></i> }
      ].map(stage => (
        <div
          key={stage.key}
          className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 cursor-pointer"
          onClick={async e => {
            e.stopPropagation();
            setOpenAdvanceDropdown(null);
            // Appelle ton backend ici pour changer le statut
            await cvService.updateCandidateStage(candidate.id, stage.key);
            fetchCandidates();
          }}
        >
          {stage.icon}
          <span>{stage.label}</span>
        </div>
      ))}
    </div>
  )}
</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'ajout de candidat */}
      <AddCandidateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        companyId={companyId}
        onCandidateAdded={() => {
          fetchCandidates();  
          setIsModalOpen(false);
        }} 
      />
    </div>
  );
};

export default CandidateManagement;