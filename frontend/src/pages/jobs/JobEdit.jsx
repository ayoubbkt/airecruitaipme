import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusCircle, Info, MapPin, Building, DollarSign, Briefcase, Users, Calendar, Star, X, Check, ChevronDown, Save } from 'lucide-react';
import { jobService, questionService, workflowService, companyService, userService, messageTemplateService, meetingTemplateService, ratingCardService } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

// Utility to map backend job to form shape used in JobCreate
const mapJobToForm = (job) => ({
  title: job.title || '',
  description: job.description || '',
  requiredSkills: job.requiredSkills || [],
  preferredSkills: job.preferredSkills || [],
  employmentType: (job.employmentType || '').toLowerCase().replace('_', '-'),
  workType: (job.workType || '').toLowerCase().replace('_', '-'),
  minYearsExperience: job.minYearsExperience?.toString() || '',
  salaryFrom: job.salaryMin?.toString() || '',
  salaryTo: job.salaryMax?.toString() || '',
  currency: job.currency || 'EUR',
  payPeriod: (job.payPeriod || 'annual').toLowerCase(),
  displaySalary: !!job.displaySalary,
  department: job.department?.name || '',
  location: job.location ? `${job.location.city}, ${job.location.country}` : '',
  jobCode: job.jobCode || '',
  applicationFields: job.applicationFields || {
    name: { required: true },
    email: { required: true },
    phone: { required: false },
    resume: { required: true },
    coverLetter: { required: false },
  },
  customQuestions: job.customQuestions || [],
  hiringTeam: (job.hiringTeam || []).map(m => ({ id: m.id, email: m.userId, name: m.name || m.userId, role: m.role?.toLowerCase() })),
  workflowId: job.workflowId || '',
  workflowStages: job.workflowStages || [],
  jobBoards: job.jobBoards || [],
  jobPostingStatus: (job.status === 'PUBLISHED' ? 'published' : job.status === 'INTERNAL' ? 'internal' : job.status === 'CONFIDENTIAL' ? 'confidential' : 'draft')
});

// Steps identical to JobCreate
const steps = [
  { id: 'details', title: "Détails de l'offre" },
  { id: 'application', title: 'Formulaire de candidature' },
  { id: 'team', title: 'Équipe de recrutement' },
  { id: 'workflow', title: 'Processus de recrutement' },
  { id: 'advertise', title: "Diffusion de l'offre" }
];

const JobEdit = () => {
  const { companyId } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [],
    preferredSkills: [],
    employmentType: '',
    workType: '',
    minYearsExperience: '',
    salaryFrom: '',
    salaryTo: '',
    currency: '',
    payPeriod: '',
    displaySalary: false,
    department: '',
    location: '',
    jobCode: '',
    applicationFields: {
      name: { required: true },
      email: { required: true },
      phone: { required: false },
      resume: { required: true },
      coverLetter: { required: false },
    },
    customQuestions: [],
    hiringTeam: [],
    workflowId: '',
    workflowStages: [],
    jobBoards: [],
    jobPostingStatus: 'draft',
  });
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [availableWorkflows, setAvailableWorkflows] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showTeamMemberModal, setShowTeamMemberModal] = useState(false);
  const [errors, setErrors] = useState({});
  // Stage editor state for the Workflow step
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [stageDraft, setStageDraft] = useState({});
  const [messageTemplates, setMessageTemplates] = useState([]);
  const [meetingTemplates, setMeetingTemplates] = useState([]);
  const [ratingCards, setRatingCards] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
   
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    responseType: 'short_text',
    visibility: 'public'
  });
  const [teamRoles] = useState([
    { id: 'recruiting_admin', name: 'Admin Recrutement', description: 'Accès à toutes les fonctionnalités au niveau de l\'offre, y compris voir tous les candidats, effectuer des actions sur les candidats, publier des offres et acheter des publicités.' },
    { id: 'hiring_manager', name: 'Responsable du Recrutement', description: 'Peut voir les commentaires privés de l\'équipe et les emails des candidats, ainsi qu\'envoyer des offres et planifier des réunions.' },
    { id: 'reviewer', name: 'Évaluateur', description: 'Peut uniquement évaluer les candidats, remplir les fiches d\'évaluation et laisser des commentaires internes.' }
  ]);
  const [newTeamMember, setNewTeamMember] = useState({
    email: '',
    role: 'reviewer'
  });

  // Définir les champs requis pour chaque étape
  const requiredFields = {
    details: ['title', 'employmentType', 'workType', 'location', 'description'],
    application: [], // Pas de champs strictement requis ici
    team: ['hiringTeam'],
    workflow: ['workflowId', 'workflowStages'],
    advertise: ['jobPostingStatus']
  };

  // Fonction de validation pour une étape spécifique
  const validateStep = useCallback((stepId) => {
    const fields = requiredFields[stepId] || [];
    return fields.every(field => {
      if (field === 'title' || field === 'location' || field === 'description' || field === 'employmentType' || field === 'workType' || field === 'workflowId' || field === 'jobPostingStatus') {
        return formData[field]?.trim() !== '';
      }
      if (field === 'hiringTeam' || field === 'workflowStages') {
        return Array.isArray(formData[field]) && formData[field].length > 0;
      }
      return true;
    });
  }, [formData]);

  // Valider toutes les étapes avant publication
  const validateAllSteps = () => {
    return steps.every(step => {
      const isValid = validateStep(step.id);
      if (!isValid) {
        toast.error(`Veuillez remplir tous les champs requis dans l'étape "${step.title}"`);
      }
      return isValid;
    });
  };

  // Fetch existing job + reference data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if(!companyId || !id) return;
        
  const [job, departments, locations, questions] = await Promise.all([
          jobService.getJobById(companyId, id),
          companyService.getDepartments(companyId),
          companyService.getCompanyLocations(companyId),
          questionService.getCustomQuestions(companyId)
        ]);
        
        setDepartmentOptions(Array.isArray(departments) ? departments : []);
        setLocationOptions(Array.isArray(locations) ? locations : []);
        setAvailableQuestions(questions || []);
        
        // Mapper le job existant au format du formulaire
        let mappedJob = mapJobToForm(job);
        // Prefer job-assigned workflow instance (stages specific to job)
        try {
          const jobWorkflow = await workflowService.getJobWorkflow(id);
          const workflowStages = jobWorkflow?.stages || [];
          mappedJob.workflowId = jobWorkflow?.workflowTemplateId || mappedJob.workflowId;
          mappedJob.workflowStages = workflowStages;
          const preferred = workflowStages.find(s => (s.name?.toLowerCase?.() === 'applicants') || (String(s.type||'').toLowerCase().includes('applied')));
          const first = workflowStages[0];
          const initialStage = preferred || first;
          if (initialStage) {
            setSelectedStageId(initialStage.id);
            setStageDraft(buildStageDraft(initialStage));
          }
        } catch(e) { /* ignore; fallback to template if needed */ }
        
        setFormData(mappedJob);
      } catch (e) {
        toast.error("Erreur lors du chargement des données: " + (e.response?.data?.message || e.message));
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [companyId, id]);

  // Load templates and hiring team for the editor
  useEffect(() => {
    const loadAux = async () => {
      if (!companyId) return;
      try {
        const [mt, mtg, rc] = await Promise.all([
          messageTemplateService.getMessageTemplates(companyId).catch(()=>({ all: [] })),
          meetingTemplateService.getMeetingTemplates(companyId).catch(()=>[]),
          ratingCardService.getRatingCards(companyId).catch(()=>[]),
        ]);
        const mtList = Array.isArray(mt?.all) ? mt.all : (Array.isArray(mt) ? mt : []);
        setMessageTemplates(mtList);
        setMeetingTemplates(Array.isArray(mtg) ? mtg : []);
        setRatingCards(Array.isArray(rc) ? rc : []);
      } catch (_) { /* ignore */ }
      try {
        const team = await jobService.getHiringTeam(companyId, id);
        // Normalize members to { id, name }
        const normalized = (team || []).map(m => ({ id: m.user?.id || m.userId || m.id, name: m.user ? `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim() || m.user.email : (m.name || m.userId || m.id) }));
        setTeamMembers(normalized);
      } catch (_) { setTeamMembers([]); }
    };
    loadAux();
  }, [companyId, id]);

  // Helpers for stage editor
  const normalizeStageType = (type, name) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('interview')) return 'interview';
    if (t.includes('review')) return 'review';
    if (t.includes('offer')) return 'offer';
    if (t.includes('hired')) return 'hired';
    if (t.includes('disqual')) return 'disqualified';
    if (t.includes('lead')) return 'lead';
    if (t.includes('apply') || name?.toLowerCase?.() === 'applicants') return 'applied';
    return t || 'none';
  };

  const buildStageDraft = (stage) => {
    const settings = stage.settings || {};
    const base = {
      id: stage.id,
      name: stage.name || '',
      type: normalizeStageType(stage.type, stage.name),
      visibilityToAll: settings.visibilityToAll ?? false,
      dueDays: stage.dueDays ?? settings.dueDays ?? 3,
    };
    if (base.type === 'applied') {
      return {
        ...base,
        confirmationTemplateId: settings.confirmationTemplateId || pickDefaultMessageTemplateId('application', messageTemplates),
        aiScreening: settings.aiScreening ?? true,
        aiGuidance: settings.aiGuidance || '',
      };
    }
    if (base.type === 'review') {
      return {
        ...base,
        ratingCardId: settings.ratingCardId || (ratingCards[0]?.id || ''),
        whoShouldRate: settings.whoShouldRate || 'ALL',
        autoAdvanceThreshold: settings.autoAdvanceThreshold || 'NONE',
        autoDisqualifyThreshold: settings.autoDisqualifyThreshold || 'NONE',
      };
    }
    if (base.type === 'interview') {
      return {
        ...base,
        interviewType: settings.interviewType || 'Video call',
        meetingTemplateId: settings.meetingTemplateId || (meetingTemplates[0]?.id || ''),
        attendees: Array.isArray(settings.attendees) ? settings.attendees : [],
        aiScheduling: settings.aiScheduling ?? false,
        noteTaking: settings.noteTaking ?? true,
      };
    }
    if (['offer','hired','disqualified'].includes(base.type)) {
      return {
        ...base,
        emailTemplateId: settings.emailTemplateId || pickDefaultMessageTemplateId(base.type, messageTemplates),
      };
    }
    return base;
  };

  const pickDefaultMessageTemplateId = (kind, templates) => {
    const list = Array.isArray(templates) ? templates : [];
    const byName = (needle) => list.find(t => (t.name || t.title || '').toLowerCase().includes(needle))?.id;
    switch (kind) {
      case 'application': return byName('application confirmation') || list[0]?.id || '';
      case 'offer': return byName('offer') || list[0]?.id || '';
      case 'hired': return byName('congrat') || list[0]?.id || '';
      case 'disqualified': return byName('disqual') || list[0]?.id || '';
      default: return list[0]?.id || '';
    }
  };

  const onSelectStage = (stageId) => {
    setSelectedStageId(stageId);
    const stage = (formData.workflowStages || []).find(s => s.id === stageId);
    if (stage) setStageDraft(buildStageDraft(stage));
  };

  const updateStageDraftField = (name, value) => {
    setStageDraft(prev => ({ ...prev, [name]: value }));
  };

  const saveStageDraft = async () => {
    try {
      if (!formData.workflowId || !selectedStageId) return;
      const stage = (formData.workflowStages || []).find(s => s.id === selectedStageId);
      if (!stage) return;
      const type = normalizeStageType(stage.type, stage.name);
      const settings = {};
      // Common
      settings.visibilityToAll = !!stageDraft.visibilityToAll;
      settings.dueDays = parseInt(stageDraft.dueDays) || 0;
      if (type === 'applied') {
        settings.confirmationTemplateId = stageDraft.confirmationTemplateId || '';
        settings.aiScreening = !!stageDraft.aiScreening;
        settings.aiGuidance = stageDraft.aiGuidance || '';
      } else if (type === 'review') {
        settings.ratingCardId = stageDraft.ratingCardId || '';
        settings.whoShouldRate = stageDraft.whoShouldRate || 'ALL';
        settings.autoAdvanceThreshold = stageDraft.autoAdvanceThreshold || 'NONE';
        settings.autoDisqualifyThreshold = stageDraft.autoDisqualifyThreshold || 'NONE';
      } else if (type === 'interview') {
        settings.interviewType = stageDraft.interviewType || 'Video call';
        settings.meetingTemplateId = stageDraft.meetingTemplateId || '';
        settings.attendees = Array.isArray(stageDraft.attendees) ? stageDraft.attendees : [];
        settings.aiScheduling = !!stageDraft.aiScheduling;
        settings.noteTaking = !!stageDraft.noteTaking;
      } else if (['offer','hired','disqualified'].includes(type)) {
        settings.emailTemplateId = stageDraft.emailTemplateId || '';
      }

      // Persist to job-level workflow stage settings endpoint
      const updated = await workflowService.updateJobWorkflowStageSettings(id, selectedStageId, settings);
      // Update local list
      setFormData(prev => ({
        ...prev,
        workflowStages: (prev.workflowStages || []).map(s => s.id === selectedStageId ? { ...s, name: stageDraft.name || s.name, dueDays: parseInt(stageDraft.dueDays) || s.dueDays, settings: { ...(s.settings||{}), ...(updated?.settings || settings) } } : s)
      }));
      toast.success('Stage enregistré');
    } catch (e) {
      toast.error('Erreur lors de la sauvegarde du stage');
    }
  };
  
  // Réutiliser le isStepValid pour la navigation entre étapes
  const isStepValid = useCallback((stepId) => {
    return validateStep(stepId);
  }, [validateStep]);

  const goToStep = (index) => {
    if(index === currentStep) return;
    // S'assurer que les étapes précédentes sont valides
    const previousSteps = steps.slice(0, index);
    for(const step of previousSteps) {
      if(!validateStep(step.id)) {
        toast.error(`Complétez d'abord les champs requis dans l'étape "${step.title}"`);
        return;
      }
    }
    setCurrentStep(index);
  };

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({...prev, [name]: undefined}));
    if (name === 'workflowId') {
      // Load stages for the selected workflow
      try {
        if (!value) {
          setFormData(prev => ({ ...prev, workflowStages: [] }));
          setSelectedStageId(null);
          setStageDraft({});
          return;
        }
        const stages = await workflowService.getWorkflowStages(companyId, value);
        setFormData(prev => ({ ...prev, workflowStages: stages }));
        const preferred = stages.find(s => (s.name?.toLowerCase?.() === 'applicants') || (String(s.type||'').toLowerCase().includes('applied')));
        const first = stages[0];
        const initialStage = preferred || first;
        if (initialStage) {
          setSelectedStageId(initialStage.id);
          setStageDraft(buildStageDraft(initialStage));
        } else {
          setSelectedStageId(null);
          setStageDraft({});
        }
      } catch (err) {
        toast.error('Impossible de charger les étapes du workflow sélectionné');
      }
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      if (validateStep(steps[currentStep].id)) setCurrentStep(s => s + 1);
      else toast.error('Veuillez remplir tous les champs requis avant de continuer.');
    }
  };
  const prevStep = () => { if(currentStep>0) setCurrentStep(s => s-1); };

  // Work type change (cards style)
  const handleWorkTypeChange = (type) => {
    setFormData(prev => ({ ...prev, workType: type }));
  };

  // Skills handlers
  const addRequiredSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({ ...prev, requiredSkills: [...prev.requiredSkills, newSkill.trim()] }));
      setNewSkill('');
    }
  };
  const removeRequiredSkill = (index) => {
    setFormData(prev => ({ ...prev, requiredSkills: prev.requiredSkills.filter((_,i)=> i!==index) }));
  };
  const addPreferredSkill = () => {
    if (newPreferredSkill.trim()) {
      setFormData(prev => ({ ...prev, preferredSkills: [...prev.preferredSkills, newPreferredSkill.trim()] }));
      setNewPreferredSkill('');
    }
  };
  const removePreferredSkill = (index) => {
    setFormData(prev => ({ ...prev, preferredSkills: prev.preferredSkills.filter((_,i)=> i!==index) }));
  };

  // Description generation (placeholder)
  const generateDescription = () => {
    const generatedDescription = `Nous recherchons un(e) ${formData.title} passionné(e) et talentueux(se) pour rejoindre notre équipe ${formData.department || 'dynamique'}.\n\nVous serez responsable de concevoir, développer et maintenir des solutions innovantes.\n\nLe candidat idéal possède une solide expérience dans ${formData.requiredSkills.join(', ') || 'le domaine'} et est capable de collaborer efficacement.`;
    setFormData(prev => ({ ...prev, description: generatedDescription }));
  };

  // Fonctions pour save et update
  const handleSaveAsDraft = async () => {
    try {
      setIsSubmitting(true);

      // Validation des étapes avant sauvegarde
      const stepsToValidate = steps.filter(step => step.id !== 'advertise');
      const allStepsValid = stepsToValidate.every(step => {
        const isValid = validateStep(step.id);
        if (!isValid) {
          toast.error(`Veuillez remplir tous les champs requis dans l'étape "${step.title}"`);
        }
        return isValid;
      });

      if (!allStepsValid) {
        setIsSubmitting(false);
        return;
      }

      if (formData.description?.trim().length < 50) {
        toast.error('La description doit contenir au moins 50 caractères.');
        setIsSubmitting(false);
        return;
      }

      // Convert emails to userIds (best effort, tolerate missing users)
      const hiringTeamWithUserIds = await Promise.all(
        (formData.hiringTeam || []).map(async (member) => {
          try {
            const userId = await userService.getUserIdByEmail(member.email?.trim());
            return {
              userId: userId,
              role: member.role ? member.role.toUpperCase().replace('recruiting_admin', 'RECRUITING_ADMIN') : 'REVIEWER',
              isExternalRecruiter: false,
            };
          } catch (e) {
            // If email not found, skip userId (backend will ignore invalids)
            return {
              userId: member.userId || member.id || null,
              role: member.role ? member.role.toUpperCase().replace('recruiting_admin', 'RECRUITING_ADMIN') : 'REVIEWER',
              isExternalRecruiter: false,
            };
          }
        })
      );

      const jobData = {
        title: formData.title?.trim() || null,
        description: formData.description?.trim() || null,
        requiredSkills: formData.requiredSkills || [],
        preferredSkills: formData.preferredSkills || [],
        employmentType: formData.employmentType ? formData.employmentType.toUpperCase().replace('-', '_') : null,
        workType: formData.workType ? formData.workType.toUpperCase().replace('-', '_') : 'ON_SITE',
        minYearsExperience: parseInt(formData.minYearsExperience) || 0,
        salaryMin: formData.displaySalary ? parseFloat(formData.salaryFrom) || 0 : 0,
        salaryMax: formData.displaySalary ? parseFloat(formData.salaryTo) || 0 : 0,
        currency: formData.currency || 'EUR',
        payPeriod: formData.payPeriod ? formData.payPeriod.toUpperCase() : 'ANNUAL',
        displaySalary: formData.displaySalary || false,
        departmentId: departmentOptions.find(d => d.name.toLowerCase() === formData.department?.toLowerCase())?.id || null,
        locationId: locationOptions.find(l => 
          (l.city + ', ' + l.country).toLowerCase().replace(/\s/g, '') === formData.location?.toLowerCase().replace(/\s/g, '')
        )?.id || null,
        jobCode: formData.jobCode?.trim() || null,
        status: 'DRAFT',
        applicationFields: Object.fromEntries(
          Object.entries(formData.applicationFields || {}).map(([name, field]) => [
            name,
            { required: field.required || false },
          ])
        ),
        customQuestions: (formData.customQuestions || []).map(question => ({
          id: question.id,
          text: question.text,
          responseType: question.responseType,
          visibility: question.visibility,
          options: question.options || [],
          isOptional: question.isOptional || false
        })),
        hiringTeam: hiringTeamWithUserIds,
        workflowId: formData.workflowId || null,
        jobBoards: (formData.jobBoards || []).map(board => ({
          id: board.id || null,
          price: parseFloat(board.price) || 0
        }))
      };

      if (isNaN(jobData.minYearsExperience) || (jobData.displaySalary && (isNaN(jobData.salaryMin) || isNaN(jobData.salaryMax)))) {
        throw new Error('Les valeurs numériques (expérience ou salaire) sont invalides.');
      }

      await jobService.updateJob(companyId, id, jobData);
      toast.success('Offre d\'emploi enregistrée en brouillon !');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde de l\'offre d\'emploi: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsSubmitting(true);

      if (!validateAllSteps()) {
        setIsSubmitting(false);
        return;
      }

      if (formData.description?.trim().length < 50) {
        toast.error('La description doit contenir au moins 50 caractères.');
        setIsSubmitting(false);
        return;
      }

      if (!departmentOptions || !Array.isArray(departmentOptions) || !locationOptions || !Array.isArray(locationOptions)) {
        toast.error('Les données des départements ou des localisations ne sont pas encore chargées. Veuillez réessayer.');
        setIsSubmitting(false);
        return;
      }

      // Convertir les emails en userId avec getUserIdByEmail
      const hiringTeamWithUserIds = await Promise.all(
        (formData.hiringTeam || []).map(async (member) => {
          try {
            const userId = await userService.getUserIdByEmail(member.email?.trim());
            return {
              userId: userId,
              role: member.role ? member.role.toUpperCase().replace('recruiting_admin', 'RECRUITING_ADMIN') : 'RECRUITER',
              isExternalRecruiter: false,
            };
          } catch (e) {
            // Fallback to userId if email lookup fails
            return {
              userId: member.userId || member.id || null,
              role: member.role ? member.role.toUpperCase().replace('recruiting_admin', 'RECRUITING_ADMIN') : 'RECRUITER',
              isExternalRecruiter: false,
            };
          }
        })
      );

      const jobData = {
        title: formData.title?.trim() || null,
        description: formData.description?.trim() || null,
        employmentType: formData.employmentType ? formData.employmentType.toUpperCase().replace('-', '_') : null,
        workType: formData.workType ? formData.workType.toUpperCase().replace('-', '_') : 'ON_SITE',
        minYearsExperience: parseInt(formData.minYearsExperience) || null,
        salaryMin: formData.displaySalary ? parseFloat(formData.salaryFrom) || null : null,
        salaryMax: formData.displaySalary ? parseFloat(formData.salaryTo) || null : null,
        currency: formData.currency || 'EUR',
        payPeriod: formData.payPeriod ? formData.payPeriod.toUpperCase() : 'ANNUAL',
        displaySalary: formData.displaySalary || false,
        departmentId: departmentOptions.find(d => d.name?.toLowerCase() === formData.department?.toLowerCase())?.id || null,
        locationId: locationOptions.find(l => 
          (l.city + ', ' + l.country).toLowerCase().replace(/\s/g, '') === formData.location?.toLowerCase().replace(/\s/g, '')
        )?.id || null,
        jobCode: formData.jobCode?.trim() || null,
        status: formData.jobPostingStatus === 'internal' ? 'INTERNAL' : formData.jobPostingStatus === 'confidential' ? 'CONFIDENTIAL' : 'PUBLISHED',
        applicationFields: Object.fromEntries(
          Object.entries(formData.applicationFields || {}).map(([name, field]) => [
            name,
            { required: field.required || false },
          ])
        ),
        hiringTeam: hiringTeamWithUserIds,
        workflowId: formData.workflowId || null,
        requiredSkills: formData.requiredSkills || [],
        preferredSkills: formData.preferredSkills || [],
        jobBoards: (formData.jobBoards || []).map(board => ({
          id: board.id || null,
          price: parseFloat(board.price) || 0
        }))
      };

      if (isNaN(jobData.minYearsExperience) || (jobData.displaySalary && (jobData.salaryMin === null || jobData.salaryMax === null))) {
        throw new Error('Les valeurs numériques (expérience ou salaire) sont invalides.');
      }

      await jobService.updateJob(companyId, id, jobData);

      toast.success('Offre d\'emploi publiée avec succès !');
      navigate('/jobs');
    } catch (error) {
      toast.error('Erreur lors de la publication de l\'offre d\'emploi: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Application step handlers
  const handleToggleRequiredField = (field) => {
    setFormData(prev => ({
      ...prev,
      applicationFields: {
        ...prev.applicationFields,
        [field]: { required: !prev.applicationFields?.[field]?.required }
      }
    }));
  };

  const handleAddQuestion = () => setShowAddQuestionModal(true);
  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion(q => ({...q, [name]: value}));
  };
  const saveQuestion = () => {
    if(!newQuestion.text.trim()) { toast.error('Veuillez saisir une question'); return; }
    setFormData(prev => ({
      ...prev,
      customQuestions: [...(prev.customQuestions||[]), { ...newQuestion, id: `temp-${Date.now()}`, isOptional: true }]
    }));
    setNewQuestion({ text: '', responseType: 'short_text', visibility: 'public' });
    setShowAddQuestionModal(false);
  };
  const toggleQuestionRequired = (index, isRequired) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.map((q,i)=> i===index? { ...q, isOptional: !isRequired }: q)
    }));
  };
  const removeQuestion = (index) => setFormData(prev => ({
    ...prev,
    customQuestions: prev.customQuestions.filter((_,i)=> i!==index)
  }));
  const handleSelectPredefinedQuestion = (idQ) => {
    if(!idQ) return;
    const q = availableQuestions.find(q=> q.id===idQ);
    if(!q) return;
    if(formData.customQuestions.some(c=> c.id===q.id)) { toast.info('Déjà ajoutée'); return; }
    setFormData(prev => ({...prev, customQuestions: [...prev.customQuestions, { ...q, isOptional: true }]}));
  };

  // Team step handlers
  const handleAddTeamMember = () => setShowTeamMemberModal(true);
  const handleTeamMemberChange = (e) => {
    const { name, value } = e.target;
    setNewTeamMember(m => ({...m, [name]: value}));
  };
  const saveTeamMember = () => {
    if(!newTeamMember.email.trim()) { toast.error('Email requis'); return; }
    setFormData(prev => ({
      ...prev,
      hiringTeam: [...(prev.hiringTeam||[]), { ...newTeamMember, id: `temp-${Date.now()}`, name: newTeamMember.email.split('@')[0] }]
    }));
    setNewTeamMember({ email: '', role: 'reviewer' });
    setShowTeamMemberModal(false);
  };
  const removeTeamMember = (idx) => setFormData(prev => ({
    ...prev,
    hiringTeam: prev.hiringTeam.filter((_,i)=> i!==idx)
  }));

  // Advertise step handlers
  const toggleJobBoard = (boardId, price) => {
    setFormData(prev => {
      const existing = prev.jobBoards.find(b=> b.id===boardId);
      let jobBoards;
      if(existing) jobBoards = prev.jobBoards.filter(b=> b.id!==boardId);
      else jobBoards = [...prev.jobBoards, { id: boardId, price }];
      return { ...prev, jobBoards };
    });
  };

  // Simple error renderer (kept for workflowId for now)
  const renderErrors = (field) => errors[field] ? <p className="text-xs text-red-600 mt-1">{errors[field]}</p> : null;

  const renderStep = () => {
    switch(steps[currentStep].id){
      case 'details':
        return (
          <div className="space-y-6">
            {/* Informations de base */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Informations de base</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Titre du poste <span className="text-red-500">*</span></label>
                  <input name="title" value={formData.title} onChange={handleChange} placeholder="ex: Développeur Full Stack" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type d'emploi <span className="text-red-500">*</span></label>
                  <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Sélectionner un type</option>
                    <option value="full-time">CDI</option>
                    <option value="part-time">CDD</option>
                    <option value="contract">Freelance</option>
                    <option value="internship-paid">Stage rémunéré</option>
                    <option value="internship-unpaid">Stage non rémunéré</option>
                    <option value="temporary">Intérim</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mode de travail <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-3">
                    <div onClick={()=> handleWorkTypeChange('on-site')} className={`flex flex-col items-center justify-center p-3 border ${formData.workType==='on-site'? 'border-blue-500 bg-blue-50':'border-slate-200'} rounded-lg cursor-pointer hover:bg-slate-50`}>
                      <Building className={`h-5 w-5 ${formData.workType==='on-site'? 'text-blue-500':'text-slate-500'}`}/>
                      <span className={`mt-1 text-sm ${formData.workType==='on-site'? 'font-medium text-blue-700':'text-slate-700'}`}>Sur site</span>
                    </div>
                    <div onClick={()=> handleWorkTypeChange('remote')} className={`flex flex-col items-center justify-center p-3 border ${formData.workType==='remote'? 'border-blue-500 bg-blue-50':'border-slate-200'} rounded-lg cursor-pointer hover:bg-slate-50`}>
                      <Briefcase className={`h-5 w-5 ${formData.workType==='remote'? 'text-blue-500':'text-slate-500'}`}/>
                      <span className={`mt-1 text-sm ${formData.workType==='remote'? 'font-medium text-blue-700':'text-slate-700'}`}>Télétravail</span>
                    </div>
                    <div onClick={()=> handleWorkTypeChange('hybrid')} className={`flex flex-col items-center justify-center p-3 border ${formData.workType==='hybrid'? 'border-blue-500 bg-blue-50':'border-slate-200'} rounded-lg cursor-pointer hover:bg-slate-50`}>
                      <Users className={`h-5 w-5 ${formData.workType==='hybrid'? 'text-blue-500':'text-slate-500'}`}/>
                      <span className={`mt-1 text-sm ${formData.workType==='hybrid'? 'font-medium text-blue-700':'text-slate-700'}`}>Hybride</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Localisation <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                    <select name="location" value={formData.location||''} onChange={handleChange} className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Sélectionnez une localisation</option>
                      {locationOptions.map(loc => <option key={loc.id} value={`${loc.city}, ${loc.country}`}>{loc.city}, {loc.country}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            {/* Description */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Description du poste</h2>
                <button type="button" onClick={generateDescription} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center hover:bg-blue-100">Générer avec IA</button>
              </div>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Décrivez les responsabilités, exigences et avantages du poste..." className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-48" />
            </div>
            {/* Compétences */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Compétences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Compétences requises</label>
                  <div className="flex gap-2">
                    <input value={newSkill} onChange={(e)=> setNewSkill(e.target.value)} onKeyPress={(e)=> e.key==='Enter' && (e.preventDefault(), addRequiredSkill())} placeholder="ex: JavaScript" className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    <button type="button" onClick={addRequiredSkill} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><PlusCircle className="w-5 h-5"/></button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.requiredSkills.map((skill,i)=>(
                      <div key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
                        <span>{skill}</span>
                        <button type="button" onClick={()=> removeRequiredSkill(i)} className="ml-2 text-blue-600 hover:text-blue-800">×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Compétences souhaitées</label>
                  <div className="flex gap-2">
                    <input value={newPreferredSkill} onChange={(e)=> setNewPreferredSkill(e.target.value)} onKeyPress={(e)=> e.key==='Enter' && (e.preventDefault(), addPreferredSkill())} placeholder="ex: React" className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    <button type="button" onClick={addPreferredSkill} className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><PlusCircle className="w-5 h-5"/></button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.preferredSkills.map((skill,i)=>(
                      <div key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full flex items-center">
                        <span>{skill}</span>
                        <button type="button" onClick={()=> removePreferredSkill(i)} className="ml-2 text-indigo-600 hover:text-indigo-800">×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expérience minimale (années)</label>
                  <input type="number" name="minYearsExperience" value={formData.minYearsExperience} onChange={handleChange} min="0" max="40" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>
            {/* Rémunération */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Rémunération</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Salaire minimum</label>
                    <div className="relative">
                      <DollarSign className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                      <input name="salaryFrom" value={formData.salaryFrom} onChange={handleChange} placeholder="ex: 45000" className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Salaire maximum</label>
                    <div className="relative">
                      <DollarSign className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                      <input name="salaryTo" value={formData.salaryTo} onChange={handleChange} placeholder="ex: 65000" className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Devise</label>
                    <select name="currency" value={formData.currency} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="CHF">CHF</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Période</label>
                    <select name="payPeriod" value={formData.payPeriod} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="annual">Annuel</option>
                      <option value="monthly">Mensuel</option>
                      <option value="hourly">Horaire</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="flex items-center text-sm">
                    <input type="checkbox" name="displaySalary" checked={formData.displaySalary} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="ml-2 text-slate-700">Afficher le salaire sur l'offre d'emploi</span>
                  </label>
                </div>
              </div>
            </div>
            {/* Détails supplémentaires */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Détails supplémentaires</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Département</label>
                  <select name="department" value={formData.department} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Sélectionner un département</option>
                    {departmentOptions.map(dept => <option key={dept.id} value={dept.name}>{dept.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Code du poste</label>
                  <input name="jobCode" value={formData.jobCode} onChange={handleChange} placeholder="ex: DEV-2023-42" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'application':
        return (
          <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Informations requises</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="font-medium text-sm">Nom</span>
              <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">Obligatoire</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="font-medium text-sm">Email</span>
              <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">Obligatoire</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="font-medium text-sm">Téléphone</span>
              <button onClick={()=> handleToggleRequiredField('phone')} className={`text-xs px-2 py-1 rounded ${formData.applicationFields?.phone?.required? 'bg-blue-100 text-blue-700':'bg-slate-200 text-slate-600'}`}>{formData.applicationFields?.phone?.required? 'Obligatoire':'Optionnel'}</button>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="font-medium text-sm">CV</span>
              <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">Obligatoire</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="font-medium text-sm">Lettre de motivation</span>
              <button onClick={()=> handleToggleRequiredField('coverLetter')} className={`text-xs px-2 py-1 rounded ${formData.applicationFields?.coverLetter?.required? 'bg-blue-100 text-blue-700':'bg-slate-200 text-slate-600'}`}>{formData.applicationFields?.coverLetter?.required? 'Obligatoire':'Optionnel'}</button>
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Questions personnalisées</h2>
            <button type="button" onClick={handleAddQuestion} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center"><PlusCircle className="w-4 h-4 mr-1"/>Ajouter</button>
          </div>
          {formData.customQuestions?.length? (
            <div className="space-y-2">
              {formData.customQuestions.map((q,i)=> (
                <div key={q.id||i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{q.text}</p>
                    <div className="text-[11px] mt-1 flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">{q.responseType}</span>
                      <span className={`px-2 py-0.5 rounded ${q.visibility==='public'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>{q.visibility==='public'?'Public':'Privée'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=> toggleQuestionRequired(i, !q.isOptional)} className={`text-xs px-2 py-1 rounded ${!q.isOptional? 'bg-blue-100 text-blue-700':'bg-slate-200 text-slate-600'}`}>{!q.isOptional? 'Obligatoire':'Optionnelle'}</button>
                    <button onClick={()=> removeQuestion(i)} className="p-1 text-slate-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                  </div>
                </div>
              ))}
            </div>
          ): <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg text-center">Aucune question ajoutée</div>}
          <div className="mt-4">
            <select className="w-full p-2 border rounded" value="" onChange={(e)=> handleSelectPredefinedQuestion(e.target.value)}>
              <option value="">Ajouter depuis la bibliothèque...</option>
              {availableQuestions.map(q=> <option key={q.id} value={q.id}>{q.text}</option>)}
            </select>
          </div>
        </div>
          </div>
        );
      case 'team':
        return (
          <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Équipe de recrutement</h2>
            <button onClick={handleAddTeamMember} type="button" className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center"><PlusCircle className="w-4 h-4 mr-1"/>Ajouter</button>
          </div>
          {formData.hiringTeam?.length? (
            <div className="space-y-2">
              {formData.hiringTeam.map((m,i)=> (
                <div key={m.id||i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{m.name||m.email}</p>
                    <p className="text-xs text-slate-500">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-700">{m.role}</span>
                    <button onClick={()=> removeTeamMember(i)} className="p-1 text-slate-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                  </div>
                </div>
              ))}
            </div>
          ): <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg text-center">Aucun membre ajouté</div>}
          </div>
          </div>
        );
      case 'workflow':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              {!formData.workflowId && (
                <>
                  <label className="block text-sm font-medium mb-1">Workflow *</label>
                  <select name="workflowId" value={formData.workflowId} onChange={handleChange} className="w-full p-3 border rounded-lg">
                    <option value="">Sélectionner</option>
                    {availableWorkflows.map(w=> <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  {renderErrors('workflowId')}
                </>
              )}
              <div className="mt-4 rounded-lg border">
                {(formData.workflowStages || []).sort((a,b)=>(a.order||0)-(b.order||0)).map(s => {
                  const active = s.id === selectedStageId;
                  const t = normalizeStageType(s.type, s.name);
                  return (
                    <button type="button" key={s.id} onClick={()=>onSelectStage(s.id)} className={`w-full text-left px-3 py-2 flex items-center gap-2 border-b last:border-b-0 ${active? 'bg-blue-50 border-l-4 border-l-blue-500':''}`}>
                      <span className="w-6 h-6 flex items-center justify-center rounded bg-blue-100 text-blue-700 text-[11px] font-medium">{(s.order||0)+1}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-[11px] text-slate-500 capitalize">Type {t}{(s.dueDays||s.settings?.dueDays)? ` • Due ${s.dueDays||s.settings?.dueDays} days` : ''}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="md:col-span-2">
              {selectedStageId ? (
                (()=>{
                  const stage = (formData.workflowStages||[]).find(s=>s.id===selectedStageId);
                  if (!stage) return null;
                  const t = normalizeStageType(stage.type, stage.name);
                  return (
                    <div className="bg-white rounded-xl border p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input className="text-lg font-semibold text-slate-800 bg-transparent outline-none" value={stageDraft.name||''} onChange={e=>updateStageDraftField('name', e.target.value)} />
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">Required</span>
                        </div>
                        <button type="button" onClick={saveStageDraft} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded">Save Stage</button>
                      </div>

                      {/* Common: Visibility and Due */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center justify-between p-3 rounded bg-slate-50">
                          <div>
                            <div className="text-sm font-medium">Stage Visibility</div>
                            <div className="text-xs text-slate-500">Make stage visible to all job members</div>
                          </div>
                          <label className="inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={!!stageDraft.visibilityToAll} onChange={e=>updateStageDraftField('visibilityToAll', e.target.checked)} /><span className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-blue-600 relative"><span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition ${stageDraft.visibilityToAll? 'translate-x-5':''}`}></span></span></label>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded bg-slate-50">
                          <div>
                            <div className="text-sm font-medium">Due Date</div>
                            <div className="text-xs text-slate-500">Max time before raising alarms</div>
                          </div>
                          <select className="text-sm border rounded p-2" value={stageDraft.dueDays||0} onChange={e=>updateStageDraftField('dueDays', e.target.value)}>
                            {[0,1,2,3,7,14].map(d=> <option key={d} value={d}>{d===0? 'No due' : `${d} days`}</option>)}
                          </select>
                        </div>
                      </div>

                      {t === 'applied' && (
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Confirmation email</div>
                            <select className="w-full border rounded p-2 text-sm" value={stageDraft.confirmationTemplateId||''} onChange={e=>updateStageDraftField('confirmationTemplateId', e.target.value)}>
                              {(messageTemplates||[]).map(tpl => <option key={tpl.id} value={tpl.id}>{tpl.name || tpl.title}</option>)}
                            </select>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded bg-slate-50">
                            <div>
                              <div className="text-sm font-medium">AI screening</div>
                              <div className="text-xs text-slate-500">Let Megan screen applicants</div>
                            </div>
                            <label className="inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={!!stageDraft.aiScreening} onChange={e=>updateStageDraftField('aiScreening', e.target.checked)} /><span className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-blue-600 relative"><span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition ${stageDraft.aiScreening? 'translate-x-5':''}`}></span></span></label>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">AI Guidance</div>
                            <textarea rows={3} className="w-full border rounded p-2 text-sm" placeholder="e.g. Prioritize applicants with 5+ years of experience" value={stageDraft.aiGuidance||''} onChange={e=>updateStageDraftField('aiGuidance', e.target.value)} />
                          </div>
                        </div>
                      )}

                      {t === 'review' && (
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Rating card</div>
                            <select className="w-full border rounded p-2 text-sm" value={stageDraft.ratingCardId||''} onChange={e=>updateStageDraftField('ratingCardId', e.target.value)}>
                              {(ratingCards||[]).map(rc => <option key={rc.id} value={rc.id}>{rc.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Who should rate?</div>
                            <select className="w-full border rounded p-2 text-sm" value={stageDraft.whoShouldRate||'ALL'} onChange={e=>updateStageDraftField('whoShouldRate', e.target.value)}>
                              <option value="ALL">All job members</option>
                              <option value="HIRING_TEAM">Hiring managers only</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium mb-1">Auto-advance rating threshold</div>
                              <select className="w-full border rounded p-2 text-sm" value={stageDraft.autoAdvanceThreshold||'NONE'} onChange={e=>updateStageDraftField('autoAdvanceThreshold', e.target.value)}>
                                {['NONE','1+','2+','3+','4+','5'].map(v=> <option key={v} value={v}>{v==='NONE'? 'Take no action' : `${v} stars or higher`}</option>)}
                              </select>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-1">Auto-disqualifying rating threshold</div>
                              <select className="w-full border rounded p-2 text-sm" value={stageDraft.autoDisqualifyThreshold||'NONE'} onChange={e=>updateStageDraftField('autoDisqualifyThreshold', e.target.value)}>
                                {['NONE','1','2','3','4','5'].map(v=> <option key={v} value={v}>{v==='NONE'? 'Take no action' : `${v} stars or lower`}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {t === 'interview' && (
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Meeting details</div>
                            <select className="w-full border rounded p-2 text-sm" value={stageDraft.meetingTemplateId||''} onChange={e=>updateStageDraftField('meetingTemplateId', e.target.value)}>
                              {(meetingTemplates||[]).map(tpl => <option key={tpl.id} value={tpl.id}>{tpl.name || tpl.title}</option>)}
                            </select>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Interview type</div>
                            <select className="w-full border rounded p-2 text-sm" value={stageDraft.interviewType||'Video call'} onChange={e=>updateStageDraftField('interviewType', e.target.value)}>
                              <option>Video call</option>
                              <option>Phone call</option>
                              <option>In-person</option>
                            </select>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Attendees</div>
                            <div className="border rounded p-2 max-h-40 overflow-auto">
                              {(teamMembers||[]).map(m => (
                                <label key={m.id} className="flex items-center gap-2 text-sm py-1">
                                  <input type="checkbox" checked={(stageDraft.attendees||[]).includes(m.id)} onChange={(e)=>{
                                    const checked = e.target.checked; const curr = new Set(stageDraft.attendees||[]); if (checked) curr.add(m.id); else curr.delete(m.id); updateStageDraftField('attendees', Array.from(curr));
                                  }} />
                                  <span>{m.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded bg-slate-50">
                            <div>
                              <div className="text-sm font-medium">AI scheduling</div>
                            </div>
                            <label className="inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={!!stageDraft.aiScheduling} onChange={e=>updateStageDraftField('aiScheduling', e.target.checked)} /><span className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-blue-600 relative"><span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition ${stageDraft.aiScheduling? 'translate-x-5':''}`}></span></span></label>
                          </div>
                        </div>
                      )}

                      {(['offer','hired','disqualified'].includes(t)) && (
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Email template</div>
                            <select className="w-full border rounded p-2 text-sm" value={stageDraft.emailTemplateId||''} onChange={e=>updateStageDraftField('emailTemplateId', e.target.value)}>
                              {(messageTemplates||[]).map(tpl => <option key={tpl.id} value={tpl.id}>{tpl.name || tpl.title}</option>)}
                            </select>
                            <div className="text-xs text-slate-500 mt-1">
                              {t==='offer' && 'Default: Send offer'}
                              {t==='hired' && 'Default: Congratulations email'}
                              {t==='disqualified' && 'Default: Disqualified email'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="text-sm text-slate-500">Sélectionnez un stage à modifier</div>
              )}
            </div>
          </div>
        );
      case 'advertise':
        return (
          <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Publication</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['published','internal','confidential'].map(status => (
              <div key={status} onClick={()=> setFormData(prev => ({...prev, jobPostingStatus: status}))} className={`p-3 border rounded-lg cursor-pointer ${formData.jobPostingStatus===status? status==='published'? 'border-green-500 bg-green-50':'border-blue-500 bg-blue-50':'border-slate-200 bg-white'}`}>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${formData.jobPostingStatus===status? 'bg-current text-white':'border border-slate-300'}`}>{formData.jobPostingStatus===status && <Check className="w-3 h-3"/>}</div>
                  <span className="text-sm font-medium capitalize">{status}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 ml-6">
                  {status==='published' && 'Visible publiquement'}
                  {status==='internal' && 'Visible seulement en interne'}
                  {status==='confidential' && 'Restreint à l\'équipe'}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium text-sm mb-2">Sites d'emploi recommandés</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm font-medium">Monster</p>
              <p className="text-xs text-slate-500 mb-2">€199</p>
              <button onClick={()=> toggleJobBoard('monster',199)} className={`text-xs px-3 py-1.5 rounded ${formData.jobBoards.some(b=> b.id==='monster')? 'bg-green-500 text-white':'border border-green-500 text-green-600'}`}>{formData.jobBoards.some(b=> b.id==='monster')? 'Ajouté':'Ajouter'}</button>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm font-medium">Indeed</p>
              <p className="text-xs text-slate-500 mb-2">€149</p>
              <button onClick={()=> toggleJobBoard('indeed',149)} className={`text-xs px-3 py-1.5 rounded ${formData.jobBoards.some(b=> b.id==='indeed')? 'bg-green-500 text-white':'border border-green-500 text-green-600'}`}>{formData.jobBoards.some(b=> b.id==='indeed')? 'Ajouté':'Ajouter'}</button>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm font-medium">LinkedIn</p>
              <p className="text-xs text-slate-500 mb-2">€299</p>
              <button onClick={()=> toggleJobBoard('linkedin',299)} className={`text-xs px-3 py-1.5 rounded ${formData.jobBoards.some(b=> b.id==='linkedin')? 'bg-green-500 text-white':'border border-green-500 text-green-600'}`}>{formData.jobBoards.some(b=> b.id==='linkedin')? 'Ajouté':'Ajouter'}</button>
            </div>
          </div>
          {formData.jobBoards.length>0 && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm">
              <h4 className="font-medium mb-2">Panier</h4>
              {formData.jobBoards.map(b=> <div key={b.id} className="flex justify-between text-xs"><span>{b.id}</span><span>€{b.price}</span></div>)}
              <div className="flex justify-between border-t mt-2 pt-2 text-xs font-medium"><span>Total</span><span>€{formData.jobBoards.reduce((s,b)=> s + (parseFloat(b.price)||0),0)}</span></div>
            </div>
          )}
        </div>
      </div>
        );
      default:
        return null;
    }
  };

  if(loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">{formData.title ? `Modifier: ${formData.title}` : `Modifier l'offre`}</h1>
          <div className="flex space-x-3">
            <button onClick={handleSaveAsDraft} disabled={isSubmitting} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 flex items-center">
              <Save className="w-4 h-4 mr-2" />
              <span>Enregistrer comme brouillon</span>
            </button>
            {currentStep === steps.length - 1 ? (
              <button onClick={handlePublish} disabled={isSubmitting} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 flex items-center">
                <PlusCircle className="w-4 h-4 mr-2" />
                <span>{isSubmitting ? 'Publication...' : 'Publier l\'offre'}</span>
              </button>
            ) : (
              <button onClick={nextStep} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 flex items-center">
                <span>Continuer</span>
              </button>
            )}
          </div>
        </div>
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.id} className={`flex flex-col items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex items-center">
                  <button onClick={() => setCurrentStep(i)} className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${i < currentStep ? 'bg-green-100 text-green-800 border-2 border-green-500' : i === currentStep ? 'bg-blue-100 text-blue-800 border-2 border-blue-500' : 'bg-slate-100 text-slate-500'}`}>
                    {i < currentStep ? <Check className="w-5 h-5" /> : i + 1}
                  </button>
                  {i < steps.length - 1 && (
                    <div className={`h-1 flex-1 w-full mx-2 ${i < currentStep ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${i <= currentStep ? 'text-slate-700' : 'text-slate-400'}`}>{step.title}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {renderStep()}
          </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-3"><span className="mr-2">📝</span> Détails de l'offre</h2>
                <p className="text-sm text-slate-500">Les détails de l'offre sont votre guide pour les responsabilités, qualifications, lieu et avantages du poste.</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-3"><span className="mr-2">📋</span> Formulaire de candidature</h2>
                <p className="text-sm text-slate-500">Recueillez toutes les informations essentielles de vos futurs employés.</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-3"><span className="mr-2">🔄</span> Processus de recrutement</h2>
                <p className="text-sm text-slate-500">Définissez les étapes et phases que les candidats traverseront, de la candidature à l'offre.</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-3"><span className="mr-2">👥</span> Équipe de recrutement</h2>
                <p className="text-sm text-slate-500">Constituez l'équipe qui vous aidera à évaluer et embaucher votre prochain collaborateur.</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-3"><span className="mr-2">📢</span> Diffusion de l'offre</h2>
                <p className="text-sm text-slate-500">Attirez les meilleurs talents en utilisant les sites d'emploi et réseaux sociaux adaptés.</p>
              </div>
            </div>
        </div>
      </div>
      {/* Modals */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ajouter une question</h3>
              <button onClick={()=> setShowAddQuestionModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question *</label>
                <input name="text" value={newQuestion.text} onChange={handleQuestionChange} className="w-full p-2 border rounded" placeholder="Votre question" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type de réponse *</label>
                <select name="responseType" value={newQuestion.responseType} onChange={handleQuestionChange} className="w-full p-2 border rounded">
                  <option value="short_text">Réponse courte</option>
                  <option value="paragraph">Paragraphe</option>
                  <option value="yes_no">Oui/Non</option>
                  <option value="dropdown">Liste déroulante</option>
                  <option value="multiple_choice">Choix multiple</option>
                  <option value="number">Nombre</option>
                  <option value="file">Fichier</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Visibilité *</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="visibility" value="public" checked={newQuestion.visibility==='public'} onChange={handleQuestionChange} /> Public</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="visibility" value="private" checked={newQuestion.visibility==='private'} onChange={handleQuestionChange} /> Privée</label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={()=> setShowAddQuestionModal(false)} className="px-4 py-2 border rounded">Annuler</button>
              <button onClick={saveQuestion} className="px-4 py-2 bg-green-500 text-white rounded">Ajouter</button>
            </div>
          </div>
        </div>
      )}
  {showTeamMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ajouter un membre</h3>
              <button onClick={()=> setShowTeamMemberModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" name="email" value={newTeamMember.email} onChange={handleTeamMemberChange} placeholder="email@entreprise.com" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rôle</label>
                <div className="space-y-3 max-h-48 overflow-auto pr-1">
                  {teamRoles.map(r => (
                    <div key={r.id} onClick={()=> setNewTeamMember(m=> ({...m, role: r.id}))} className={`p-3 border rounded cursor-pointer ${newTeamMember.role===r.id? 'border-blue-500 bg-blue-50':'border-slate-200'}`}>
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${newTeamMember.role===r.id? 'bg-blue-500 text-white':'border border-slate-300'}`}>{newTeamMember.role===r.id && <Check className="w-3 h-3"/>}</div>
                        <span className="text-sm font-medium">{r.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 ml-6">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={()=> setShowTeamMemberModal(false)} className="px-4 py-2 border rounded">Annuler</button>
              <button onClick={saveTeamMember} className="px-4 py-2 bg-green-500 text-white rounded">Ajouter</button>
            </div>
          </div>
        </div>
  )}
    </div>
  );
};

export default JobEdit;
