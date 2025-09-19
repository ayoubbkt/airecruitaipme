import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Users, 
  Archive, 
  Mail, 
  ArrowRight,
  Plus,
  Check,
  Minus,
  Upload,
  FileText, Star, Phone, Calendar, Activity
} from 'lucide-react';
import { cvService, createCandidate , jobService, companyService } from '../../services/api';
import candidateService from '../../services/candidateService';
 
import { workflowService } from '../../services/api'; // adapte le chemin si besoin


import { useAuth } from '../../contexts/AuthContext'; // Import AuthContext
import axios from 'axios';
import { toast } from 'react-toastify';
 
import WorkflowStageDropdown from '../../components/candidates/WorkflowStageDropdown';
import BulkWorkflowStageDropdown from '../../components/candidates/BulkWorkflowStageDropdown';



const normalizeJobsResponse = (resp) => {
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp?.data)) return resp.data;
  return [];
};

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
          console.log("Offres d'emploi récupérées :", activeJobs);
          setJobs(normalizeJobsResponse(activeJobs));
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

const MassEmailModal = ({ isOpen, onClose, selectedCandidates }) => {
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipients: []
  });

  useEffect(() => {
    if (selectedCandidates.length > 0) {
      setEmailData(prev => ({
        ...prev,
        recipients: selectedCandidates.map(candidate => candidate.email)
      }));
    }
  }, [selectedCandidates]);

  const handleSendEmail = async () => {
    // Implémentation de l'envoi d'email en masse
    console.log('Envoi email en masse:', emailData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              Email en Masse ({selectedCandidates.length} candidats)
            </h2>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destinataires ({emailData.recipients.length})
            </label>
            <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3">
              {emailData.recipients.map((email, index) => (
                <div key={index} className="text-sm text-gray-600 py-1">
                  {email}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Sujet de l'email..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={emailData.message}
              onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
              rows="8"
              placeholder="Votre message..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleSendEmail}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
            >
              <Mail className="w-4 h-4 mr-2 inline" />
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CandidateManagement = () => {


  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [stagesByJob, setStagesByJob] = useState({});

  
  // États pour les filtres (nouvelles étapes du workflow)
  const [selectedFilters, setSelectedFilters] = useState({
    initial: false,
    phone: false,
    interview: false,
    offer: false,
    hired: false,
    disqualified: false
  });
  
  const [jobs, setJobs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  
  // États pour les actions en masse
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // États pour les modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [showAdvanceDropdown, setShowAdvanceDropdown] = useState(null);
  
  const navigate = useNavigate();
  const { companyId } = useAuth();
  const candidatesPerPage = 10;

  // Récupération des données
  const fetchData = useCallback(async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      
      // Charger toutes les données en parallèle
  const [candidatesData, jobsData, locationsData, departmentsData] = await Promise.all([
        cvService.getCandidates(companyId),
       
        jobService.getJobs(companyId),
        companyService.getCompanyLocations(companyId),
        companyService.getDepartments(companyId)
      ]);
       console.log("candidatesData",candidatesData)

     
      const { data: list, pagination } =candidatesData; 
  setCandidates(Array.isArray(list) ? list : []);
  // Normalisation jobs
  setJobs(normalizeJobsResponse(jobsData));
      setLocations(locationsData || []);
      setDepartments(departmentsData || []);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
     
  }, [fetchData,selectedLocations]);

  // Gestion de la sélection
  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => {
      const newSelection = prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId];
      
      setShowBulkActions(newSelection.length > 0);
      setSelectAll(newSelection.length === filteredCandidates.length);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCandidates([]);
      setShowBulkActions(false);
    } else {
      const allCandidateIds = filteredCandidates.map(candidate => candidate.id);
      setSelectedCandidates(allCandidateIds);
      setShowBulkActions(true);
    }
    setSelectAll(!selectAll);
  };

  // Actions en masse avec API
  const handleBulkAdvance = async (stage) => {
    if (selectedCandidates.length === 0) return;
    
    try {
      await cvService.bulkUpdateCandidates(companyId, selectedCandidates, 'advance', stage);
      toast.success(`${selectedCandidates.length} candidats déplacés vers ${stage}`);
      await fetchData();
      setSelectedCandidates([]);
      setShowBulkActions(false);
      setSelectAll(false);
    } catch (error) {
      console.error('Erreur lors de l\'avancement en masse:', error);
      toast.error('Erreur lors de l\'avancement en masse');
    }
  };

  const handleBulkDisqualify = async () => {
    if (selectedCandidates.length === 0) return;
    
    try {
      await cvService.bulkUpdateCandidates(companyId, selectedCandidates, 'disqualify');
      toast.success(`${selectedCandidates.length} candidats disqualifiés`);
      await fetchData();
      setSelectedCandidates([]);
      setShowBulkActions(false);
      setSelectAll(false);
    } catch (error) {
      console.error('Erreur lors de la disqualification en masse:', error);
      toast.error('Erreur lors de la disqualification en masse');
    }
  };

  const handleBulkArchive = async () => {
    if (selectedCandidates.length === 0) return;
    
    try {
      await cvService.bulkUpdateCandidates(companyId, selectedCandidates, 'archive');
      toast.success(`${selectedCandidates.length} candidats archivés`);
      await fetchData();
      setSelectedCandidates([]);
      setShowBulkActions(false);
      setSelectAll(false);
    } catch (error) {
      console.error('Erreur lors de l\'archivage en masse:', error);
      toast.error('Erreur lors de l\'archivage en masse');
    }
  };

  const handleBulkEmail = async (emailData) => {
    if (selectedCandidates.length === 0) return;
    
    try {
      await cvService.sendBulkEmail(companyId, selectedCandidates, emailData);
      toast.success(`Email envoyé à ${selectedCandidates.length} candidats`);
      setIsEmailModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi d\'email en masse:', error);
      toast.error('Erreur lors de l\'envoi d\'email en masse');
    }
  };

  // Normalisation label étape
  const normalizeStageLabel = (val) => {
    if (val === 0 || val === '0' || /initial/i.test(val)) return 'Initial Review';
    if (val === 1 || val === '1' || /phone/i.test(val)) return 'Phone Screen';
    if (val === 2 || val === '2' || /interview/i.test(val)) return 'Interview';
    if (val === 3 || val === '3' || /offer/i.test(val)) return 'Offer';
    if (val === 4 || val === '4' || /hired/i.test(val)) return 'Hired';
    if (/disqual/i.test(val)) return 'Disqualified';
    return 'Initial Review';
  };

  // Changement de stage individuel avec API + rollback si échec
  const handleStageChange = async (candidateId, stageId) => {
  try {
    await candidateService.updateCandidateStage(companyId, candidateId, stageId);
    toast.success('Stage mis à jour');
    fetchData();
  } catch (error) {
    toast.error('Erreur lors du changement de stage');
  }
};
  // const handleStageChange = async (candidateId, newStage) => {
  //   let previousStageName = null;
  //   try {
  //     setCandidates(prev => prev.map(c => {
  //       if (c.id !== candidateId) return c;
  //       const clone = { ...c };
  //       if (clone.applications && clone.applications[0]) {
  //         previousStageName = clone.applications[0].currentStage?.name || clone.applications[0].status;
  //         const label = normalizeStageLabel(newStage);
  //         clone.applications = [{ ...clone.applications[0], currentStage: { ...(clone.applications[0].currentStage||{}), name: label } }];
  //       }
  //       return clone;
  //     }));
  //     await candidateService.updateCandidateStage(companyId, candidateId, newStage);
  //     toast.success('Stage mis à jour');
  //     fetchData();
  //   } catch (error) {
  //     console.error('Erreur lors du changement de stage:', error);
  //     toast.error('Erreur lors du changement de stage');
  //     // rollback
  //     if (previousStageName) {
  //       setCandidates(prev => prev.map(c => {
  //         if (c.id !== candidateId) return c;
  //         const clone = { ...c };
  //         if (clone.applications && clone.applications[0]) {
  //           clone.applications = [{ ...clone.applications[0], currentStage: { ...(clone.applications[0].currentStage||{}), name: previousStageName } }];
  //         }
  //         return clone;
  //       }));
  //     }
  //   }
  // };

  // Ajout de candidat avec API
  const addCandidate = async (formData) => {
    try {
      await cvService.createCandidate(companyId, formData);
      toast.success('Candidat ajouté avec succès');
      await fetchData();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du candidat:', error);
      toast.error('Erreur lors de l\'ajout du candidat');
      throw error;
    }
  };

  // Filtrage et tri
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const list = Array.isArray(candidates) ? candidates : [];
const filteredCandidates = list.filter(candidate => {
  const matchesSearch =
    `${candidate.firstName ?? ''} ${candidate.lastName ?? ''}`
      .toLowerCase()
      .includes((searchTerm ?? '').toLowerCase())
    || (candidate.email ?? '').toLowerCase().includes((searchTerm ?? '').toLowerCase());

  let stageName = candidate.applications?.[0]?.currentStage?.name || candidate.applications?.[0]?.status || 'Initial Review';
  if (stageName === 'LEAD') stageName = 'Initial Review';
  if (['APPLICANT','SCREENING'].includes(stageName)) stageName = 'Phone Screen';
  if (stageName === 'INTERVIEW') stageName = 'Interview';
  if (stageName === 'HIRED') stageName = 'Hired';
  if (stageName === 'DISQUALIFIED') stageName = 'Disqualified';

  const phaseMap = {
    initial: stageName === 'Initial Review',
    phone: stageName === 'Phone Screen',
    interview: stageName === 'Interview',
    offer: stageName === 'Offer',
    hired: stageName === 'Hired',
    disqualified: stageName === 'Disqualified'
  };

  const anyPhaseSelected = Object.values(selectedFilters || {}).some(Boolean);
  const matchesPhase = !anyPhaseSelected
    || Object.entries(selectedFilters || {}).some(([k, v]) => v && phaseMap[k]);

  const matchesJob =
    (selectedJobs?.length ?? 0) === 0
      || (candidate.applications ?? []).some(app =>
          selectedJobs.includes(app.jobId)
         );

  const matchesLocation =
    (selectedLocations?.length ?? 0) === 0
      || (candidate.applications ?? []).some(app =>
          selectedLocations.includes(app.job?.locationId)
         );

  const matchesDepartment =
    (selectedDepartments?.length ?? 0) === 0
      || (candidate.applications ?? []).some(app =>
          selectedDepartments.includes(app.job?.departmentId)
         );

  return matchesSearch && matchesPhase && matchesJob && matchesLocation && matchesDepartment;
});



const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === 'updatedAt') {
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

const timeSince = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now - then) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}j`;
  };


  useEffect(() => {
  async function fetchStages() {
    const jobIds = candidates.map(c => c.applications?.[0]?.jobId).filter(Boolean);
    const uniqueJobIds = Array.from(new Set(jobIds));
    const stagesObj = {};
    for (const jobId of uniqueJobIds) {
      try {
        const workflow = await workflowService.getJobWorkflow(jobId);
        stagesObj[jobId] = workflow.stages || [];
      } catch (e) {
        stagesObj[jobId] = [];
      }
    }
    
    setStagesByJob(stagesObj);
  }
  if (candidates.length > 0) fetchStages();
}, [candidates]);




  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* En-tête avec design moderne */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Candidats
              </h1>
              <p className="text-gray-600 mt-1">{candidates.length} candidats au total</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher des candidats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-80 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-colors bg-white/90"
                />
              </div>

              {/* Tri */}
              <div className="flex items-center bg-white/90 border-2 border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => handleSortChange('updatedAt')}
                  className={`px-4 py-3 text-sm transition-colors border-r border-gray-200 ${
                    sortBy === 'updatedAt' 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>Date de mise à jour</span>
                    {sortBy === 'updatedAt' && (
                      sortOrder === 'desc' ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronUp className="w-4 h-4" />
                    )}
                  </div>
                </button>
                
                <select 
                  className="px-4 py-3 bg-transparent border-none outline-none text-sm text-gray-700"
                  defaultValue="desc"
                >
                  <option value="desc">Décroissant</option>
                  <option value="asc">Croissant</option>
                </select>
              </div>

              {/* Bouton Ajouter Candidat */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter Candidat</span>
              </button>
            </div>
          </div>

          {/* Actions en masse */}
          {showBulkActions && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-purple-800">
                      {selectedCandidates.length} candidat{selectedCandidates.length > 1 ? 's' : ''} sélectionné{selectedCandidates.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Dropdown Advance */}
                  {/* Bulk Workflow Stage Dropdown */}
 
<BulkWorkflowStageDropdown 
  selectedCandidates={selectedCandidates}
  companyId={companyId}
  onStageUpdate={fetchData}
/>
 

                  <button
                    onClick={handleBulkDisqualify}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center space-x-2 shadow-md"
                  >
                    <X className="w-4 h-4" />
                    <span>Disqualifier</span>
                  </button>

                  <button
                    onClick={handleBulkArchive}
                    className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center space-x-2 shadow-md"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Archiver</span>
                  </button>

                  <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-md"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Envoyer Email</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex">
          {/* Sidebar des filtres */}
          <aside className="w-80 mr-8">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
              {/* Checkbox Sélectionner tout */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      selectAll 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300 bg-white hover:border-blue-400'
                    }`}>
                      {selectAll && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <span className="font-medium text-gray-700">
                    Sélectionner tout ({filteredCandidates.length})
                  </span>
                </label>
              </div>

              {/* Phase de recrutement (nouvelles étapes) */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Phase de recrutement
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'initial', label: 'Initial Review', test: (s) => s === 'Initial Review' },
                    { key: 'phone', label: 'Phone Screen', test: (s) => s === 'Phone Screen' },
                    { key: 'interview', label: 'Interview', test: (s) => s === 'Interview' },
                    { key: 'offer', label: 'Offer', test: (s) => s === 'Offer' },
                    { key: 'hired', label: 'Hired', test: (s) => s === 'Hired' },
                    { key: 'disqualified', label: 'Disqualified', test: (s) => s === 'Disqualified' }
                  ].map(f => {
                    const count = candidates.filter(c => {
                      let sn = c.applications?.[0]?.currentStage?.name || c.applications?.[0]?.status || 'Initial Review';
                      if (sn === 'LEAD') sn = 'Initial Review';
                      if (['APPLICANT','SCREENING'].includes(sn)) sn = 'Phone Screen';
                      if (sn === 'INTERVIEW') sn = 'Interview';
                      if (sn === 'HIRED') sn = 'Hired';
                      if (sn === 'DISQUALIFIED') sn = 'Disqualified';
                      return f.test(sn);
                    }).length;
                    return (
                      <label key={f.key} className="flex items-center justify-between cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedFilters[f.key]}
                            onChange={(e) => setSelectedFilters(prev => ({ ...prev, [f.key]: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-700 group-hover:text-gray-900">{f.label}</span>
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{count}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Jobs */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Postes</h3>
                <div className="space-y-2">
                  {jobs.length > 0 ? jobs.map((job) => (
                    <label key={job.id} className="flex items-center justify-between cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedJobs(prev => [...prev, job.id]);
                            } else {
                              setSelectedJobs(prev => prev.filter(id => id !== job.id));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 group-hover:text-gray-900 text-sm">{job.title}</span>
                      </div>
                    </label>
                  )) : (
                    <div className="text-sm text-gray-500">
                      Aucun poste disponible
                    </div>
                  )}
                </div>
              </div>

              {/* Localisations */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Localisations</h3>
                <div className="space-y-2">
                  {locations.length > 0 ? locations.map((location) => (
                    <label key={location.id} className="flex items-center justify-between cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedLocations.includes(location.id)}
                          onChange={(e) => {
                             if (e.target.checked) {
                              setSelectedLocations((prev) => {
                                const updated = [...prev, location.id];
                                console.log("selectedLocations after ADD:", updated); // ✅ valeur à jour
                                return updated;
                              });

                              
                            } else {
                              setSelectedLocations((prev) => {
                                const updated = prev.filter((id) => id !== location.id);
                                console.log("selectedLocations after REMOVE:", updated); // ✅ valeur à jour
                                return updated;
                              });
                            }
        
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 group-hover:text-gray-900 text-sm">{location.address}</span>
                      </div>
                    </label>
                  )) : (
                    <div className="text-sm text-gray-500">
                      L'Aigle, FR (exemple)
                    </div>
                  )}
                </div>
              </div>

              {/* Départements */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Départements</h3>
                <div className="space-y-2">
                  {departments.length > 0 ? departments.map((department) => (
                    <label key={department.id} className="flex items-center justify-between cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(department.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDepartments(prev => [...prev, department.id]);
                            } else {
                              setSelectedDepartments(prev => prev.filter(id => id !== department.id));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 group-hover:text-gray-900 text-sm">{department.name}</span>
                      </div>
                    </label>
                  )) : (
                    <div className="text-sm text-gray-500">
                      Aucun département disponible
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Liste des candidats */}
          <div className="flex-1">
            {loading ? (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des candidats...</p>
              </div>
            ) : paginatedCandidates.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun candidat trouvé</h3>
                <p className="text-gray-500 mb-6">Commencez par ajouter votre premier candidat</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-colors font-medium"
                >
                  Ajouter un candidat
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedCandidates.map((candidate) => {
                  const isSelected = selectedCandidates.includes(candidate.id);
                  // Get the actual stage name from currentStage if available or use status
                  let stageName = candidate.applications?.[0]?.currentStage?.name || candidate.applications?.[0]?.status || 'Initial Review';
                  if (stageName === 'LEAD') stageName = 'Initial Review';
                  if (stageName === 'APPLICANT' || stageName === 'SCREENING') stageName = 'Phone Screen';
                  if (stageName === 'INTERVIEW') stageName = 'Interview';
                  if (stageName === 'HIRED') stageName = 'Hired';
                  if (stageName === 'DISQUALIFIED') stageName = 'Disqualified';
                  const status = stageName;
                  const jobTitle = candidate.applications?.[0]?.jobTitle || 'Poste non défini';
                  
                  return (
                    <div 
                      key={candidate.id}
                      className={`relative bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50/50' 
                          : 'border-white/20 hover:border-blue-300'
                      } ${showAdvanceDropdown === candidate.id ? 'z-40' : 'z-0'}`}
                      onClick={() => navigate(`/candidates/${candidate.id}`)}
                    >
                      <div className="p-6 flex items-center justify-between">
                        {/* Checkbox et Info candidat */}
                        <div className="flex items-center space-x-4">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCandidate(candidate.id);
                            }}
                            className="flex items-center justify-center"
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              isSelected 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'border-gray-300 bg-white hover:border-blue-400'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>

                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                          </div>

                          {/* Informations */}
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {candidate.firstName} {candidate.lastName}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>{jobTitle}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                status === 'Initial Review' ? 'bg-blue-100 text-blue-800' :
                                status === 'Phone Screen' ? 'bg-yellow-100 text-yellow-800' :
                                status === 'Interview' ? 'bg-orange-100 text-orange-800' :
                                status === 'Offer' ? 'bg-indigo-100 text-indigo-800' :
                                status === 'Hired' ? 'bg-emerald-100 text-emerald-800' :
                                status === 'DISQUALIFIED' || status === 'Disqualified' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-4">
                          {/* Bouton Disqualifier */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Disqualifier ce candidat spécifiquement
                              handleStageChange(candidate.id, 'disqualified');
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Dropdown Advance */}
                        
 <div  onClick={(e) => e.stopPropagation()}>
  <WorkflowStageDropdown 
    candidate={candidate}
    companyId={companyId}
    onStageUpdate={() => fetchData()}
  />
</div>
 


 
                        </div>
                      </div>
                      
                      {/* Date de création en bas de la card */}
                      <div className="px-6 pb-4">
                        <div className="text-sm text-gray-500 flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Ajouté {timeSince(candidate.createdAt || candidate.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-8 space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white/90 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-xl transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/90 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white/90 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addCandidate}
        companyId={companyId} 
        jobs={jobs}
        locations={locations}
         onCandidateAdded={fetchData} 
      />

      <MassEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        selectedCandidates={selectedCandidates.map(id => 
          candidates.find(candidate => candidate.id === id)
        ).filter(Boolean)}
        onSendEmail={handleBulkEmail}
      />
    </div>
  );
}

export default CandidateManagement;