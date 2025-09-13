import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, Users, FileText, Workflow, Target, Briefcase, X } from 'lucide-react';
import { jobService, questionService, workflowService, companyService, userService } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const JobCreationForm = () => {
  const { companyId } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [],
    preferredSkills: [],
    employmentType: 'Full-time',
    workType: 'On-site',
    minYearsExperience: '',
    salaryFrom: '',
    salaryTo: '',
    currency: 'EUR',
    payPeriod: 'Monthly',
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
  });

  const [activeStep, setActiveStep] = useState(1);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [availableWorkflows, setAvailableWorkflows] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  
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

  // Constants
  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'];
  const customQuestions = ['What motivates you?', 'Describe your ideal work environment', 'Why are you interested in this role?'];
  const hiringTeamMembers = [
    { id: 1, name: 'Sarah Johnson', department: 'Engineering', role: 'Admin Recrutement', avatar: 'SJ' },
    { id: 2, name: 'Mike Chen', department: 'Product', role: 'Responsable du Recrutement', avatar: 'MC' },
    { id: 3, name: 'Emily Davis', department: 'Design', role: 'Évaluateur', avatar: 'ED' }
  ];

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const departments = await companyService.getDepartments(companyId);
        setDepartmentOptions(Array.isArray(departments) ? departments : []);

        const locations = await companyService.getCompanyLocations(companyId);
        setLocationOptions(Array.isArray(locations) ? locations : []);

        const questions = await questionService.getCustomQuestions(companyId);
        setAvailableQuestions(questions || []);

        let workflows = await workflowService.getWorkflows(companyId);
        let defaultWorkflow = workflows.find(w => w.name.toLowerCase() === 'workflow par défaut');
        
        if (!defaultWorkflow) {
          defaultWorkflow = await workflowService.createWorkflow(companyId, {
            name: 'Workflow par défaut',
          });
          workflows = [defaultWorkflow, ...workflows];
        } else {
          const refreshedWorkflow = await workflowService.getWorkflowStages(companyId, defaultWorkflow.id);
          defaultWorkflow.stages = refreshedWorkflow;
        }

        setAvailableWorkflows(workflows);
        const defaultStages = await workflowService.getWorkflowStages(companyId, defaultWorkflow.id);
        setFormData(prev => ({
          ...prev,
          workflowId: defaultWorkflow.id,
          workflowStages: defaultStages
        }));
      } catch (error) {
        toast.error('Erreur lors du chargement des données. Veuillez réessayer.');
        setDepartmentOptions([]);
        setLocationOptions([]);
      }
    };

    if (companyId) {
      fetchInitialData();
    }
  }, [companyId]);

  // Steps and validation
  const steps = [
    { id: 'details', title: 'Job Details' },
    { id: 'application', title: 'Application Form' },
    { id: 'team', title: 'Hiring Team' },
    { id: 'workflow', title: 'Workflow' },
    { id: 'advertise', title: 'Job Advertising' },
  ];

  const validateStep = (stepId) => {
    if (stepId === 'details') {
      return (
        (formData.title || '').trim() !== '' &&
        (formData.employmentType || '').trim() !== '' &&
        (formData.workType || '').trim() !== '' &&
        (formData.department || '').trim() !== '' &&
        (formData.location || '').trim() !== ''
      );
    }
    return true;
  };

  const isStepEnabled = (index) => {
    for (let i = 0; i < index; i += 1) {
      if (!validateStep(steps[i].id)) return false;
    }
    return true;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Skills management
  const addRequiredSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeRequiredSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((_, i) => i !== index)
    }));
  };

  const addPreferredSkill = () => {
    if (newPreferredSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        preferredSkills: [...prev.preferredSkills, newPreferredSkill.trim()]
      }));
      setNewPreferredSkill('');
    }
  };

  const removePreferredSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      preferredSkills: prev.preferredSkills.filter((_, i) => i !== index)
    }));
  };

  // Questions management
  const handleAddQuestion = () => {
    setShowAddQuestionModal(true);
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveQuestion = () => {
    if (!newQuestion.text.trim()) {
      toast.error('Veuillez saisir une question');
      return;
    }

    setFormData(prev => ({
      ...prev,
      customQuestions: [...prev.customQuestions, {
        ...newQuestion,
        id: `temp-${Date.now()}`,
        isOptional: true
      }]
    }));

    setNewQuestion({
      text: '',
      responseType: 'short_text',
      visibility: 'public'
    });
    setShowAddQuestionModal(false);
  };

  const handleSelectPredefinedQuestion = (questionId) => {
    const question = availableQuestions.find(q => q.id === questionId);
    if (question) {
      const isAlreadyAdded = formData.customQuestions.some(q => q.id === question.id);

      if (!isAlreadyAdded) {
        setFormData(prev => ({
          ...prev,
          customQuestions: [...prev.customQuestions, {
            ...question,
            isOptional: true
          }]
        }));
      } else {
        toast.info('Cette question est déjà ajoutée');
      }
    }
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index)
    }));
  };

  // Team management
  const handleAddTeamMember = () => {
    setShowAddMemberModal(true);
  };

  const handleTeamMemberChange = (e) => {
    const { name, value } = e.target;
    setNewTeamMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveTeamMember = () => {
    if (!newTeamMember.email.trim()) {
      toast.error('Veuillez saisir une adresse email');
      return;
    }

    setFormData(prev => ({
      ...prev,
      hiringTeam: [...prev.hiringTeam, {
        ...newTeamMember,
        id: `temp-${Date.now()}`,
        name: newTeamMember.email.split('@')[0]
      }]
    }));

    setNewTeamMember({
      email: '',
      role: 'reviewer'
    });
    setShowAddMemberModal(false);
  };

  const removeTeamMember = (index) => {
    setFormData(prev => ({
      ...prev,
      hiringTeam: prev.hiringTeam.filter((_, i) => i !== index)
    }));
  };

  // Workflow management
  const handleWorkflowChange = async (workflowId) => {
    try {
      const stages = await workflowService.getWorkflowStages(companyId, workflowId);
      setFormData(prev => ({
        ...prev,
        workflowId,
        workflowStages: stages
      }));
    } catch (error) {
      toast.error('Erreur lors du chargement des étapes du workflow');
    }
  };

  const handleToggleRequiredField = (field) => {
    setFormData(prev => ({
      ...prev,
      applicationFields: {
        ...prev.applicationFields,
        [field]: {
          ...prev.applicationFields[field],
          required: !prev.applicationFields[field].required
        }
      }
    }));
  };

  // Advance steps; on final step, create the job
  const handleSaveAndContinue = async () => {
    try {
      if (!companyId) return;
      
      // If step 1, validate then go to step 2
      if (activeStep === 1) {
        if (!validateStep('details')) {
          toast.error('Veuillez compléter les informations de base obligatoires.');
          return;
        }
        setActiveStep(2);
        return;
      }

      // If not last step, just advance
      if (activeStep < 5) {
        setActiveStep((s) => Math.min(5, s + 1));
        return;
      }

      // Last step: create the job
      setIsSubmitting(true);

      if (formData.description?.trim().length < 50) {
        toast.error('La description doit contenir au moins 50 caractères.');
        setIsSubmitting(false);
        return;
      }

      // Convert emails to userIds
      const hiringTeamWithUserIds = await Promise.all(
        (formData.hiringTeam || []).map(async (member) => {
          const userId = await userService.getUserIdByEmail(member.email?.trim());
          return {
            userId: userId,
            role: member.role ? member.role.toUpperCase().replace('recruiting_admin', 'RECRUITING_ADMIN') : 'REVIEWER',
            isExternalRecruiter: false,
          };
        })
      );

      const jobData = {
        title: formData.title?.trim() || null,
        description: formData.description?.trim() || null,
        requiredSkills: formData.requiredSkills || [],
        preferredSkills: formData.preferredSkills || [],
        employmentType: formData.employmentType ? formData.employmentType.toUpperCase().replace(/\s|-/g, '_') : null,
        workType: formData.workType ? formData.workType.toUpperCase().replace(/\s|-/g, '_') : 'ON_SITE',
        minYearsExperience: parseInt(formData.minYearsExperience) || null,
        salaryMin: formData.displaySalary ? parseFloat(formData.salaryFrom) || null : null,
        salaryMax: formData.displaySalary ? parseFloat(formData.salaryTo) || null : null,
        currency: formData.currency || 'EUR',
        payPeriod: formData.payPeriod ? formData.payPeriod.toUpperCase() : 'MONTHLY',
        displaySalary: !!formData.displaySalary,
        departmentId: departmentOptions.find(d => d.name?.toLowerCase() === formData.department?.toLowerCase())?.id || null,
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
        hiringTeam: hiringTeamWithUserIds,
        workflowId: formData.workflowId || null,
        jobBoards: [],
      };

      const created = await jobService.createJob(companyId, jobData);
      toast.success('Offre d\'emploi créée avec succès !');
      if (created?.id) navigate(`/jobs/${created.id}`);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const Dropdown = ({ value, onChange, options, placeholder }) => (
    <div className="relative">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-lg appearance-none bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );

  const SidebarItem = ({ icon: Icon, title, description, active = false, onClick }) => (
    <div 
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${active ? 'border-teal-200 bg-teal-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-1 ${active ? 'text-teal-600' : 'text-gray-400'}`} />
        <div>
          <h3 className={`font-medium text-sm ${active ? 'text-teal-900' : 'text-gray-700'}`}>{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

  // Modal pour inviter des membres
  const InviteMemberModal = () => {
    const [emails, setEmails] = useState('');
    const [selectedRole, setSelectedRole] = useState('Standard');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Invite Members</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email addresses</label>
              <textarea
                rows={3}
                placeholder="e.g. tucker@email.com, leah@email.com"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Member role</label>
              <div className="space-y-3">
                {[
                  { name: 'Standard', desc: 'Must be added to specific jobs. Their job role determines their access.', selected: true },
                  { name: 'Admin', desc: 'Can use all features and capabilities, except billing or inviting new members.', selected: false },
                  { name: 'Mega Admin', desc: 'Can use all features and capabilities.', selected: false },
                  { name: 'External Recruiter', desc: 'Must be added to specific jobs. Can only see candidates who they added.', selected: false }
                ].map((role) => (
                  <div
                    key={role.name}
                    onClick={() => setSelectedRole(role.name)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRole === role.name ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full mt-0.5 ${
                        selectedRole === role.name ? 'bg-teal-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <h3 className="font-medium text-gray-900">{role.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{role.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => setShowInviteModal(false)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowInviteModal(false)}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>📧</span>
              Send Invite
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal pour ajouter un membre
  const AddMemberModal = () => {
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('Admin Recrutement');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Ajouter un membre</h2>
            <button
              onClick={() => setShowAddMemberModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email du membre <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="email@entreprise.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Rôle du membre</label>
              <div className="space-y-3">
                {[
                  { name: 'Admin Recrutement', desc: 'Accès à toutes les fonctionnalités au niveau de l\'offre, y compris voir tous les candidats, effectuer des actions sur les candidats, publier des offres et acheter des publicités.', selected: true },
                  { name: 'Responsable du Recrutement', desc: 'Peut voir les commentaires privés de l\'équipe et les emails des candidats, ainsi qu\'envoyer des offres et planifier des réunions.', selected: false },
                  { name: 'Évaluateur', desc: 'Peut uniquement évaluer les candidats, remplir les fiches d\'évaluation et laisser des commentaires internes.', selected: false }
                ].map((role) => (
                  <div
                    key={role.name}
                    onClick={() => setSelectedRole(role.name)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedRole === role.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full mt-1 ${
                        selectedRole === role.name ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{role.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{role.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowAddMemberModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Annuler
            </button>
            <button
              onClick={() => setShowAddMemberModal(false)}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Create your Job</h1>
          </div>
          <button 
            onClick={handleSaveAndContinue} 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (activeStep < 5 ? 'Save & Continue' : 'Create Job')}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Step 1: Basic Information */}
            {activeStep === 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="space-y-6">
                  {/* Job Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job title <span className="text-red-500">Required</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Marketing Manager"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  {/* Employment Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employment type</label>
                    <Dropdown
                      value={formData.employmentType}
                      onChange={(value) => handleInputChange('employmentType', value)}
                      options={employmentTypes}
                    />
                  </div>

                  {/* Work Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Work type</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['On-site', 'Remote', 'Hybrid'].map((type) => (
                        <div
                          key={type}
                          onClick={() => handleInputChange('workType', type)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.workType === type 
                              ? 'border-teal-500 bg-teal-50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full mb-2 ${
                            formData.workType === type ? 'bg-teal-500' : 'bg-gray-300'
                          }`} />
                          <h3 className="font-medium text-gray-900">{type}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {type === 'On-site' && 'Employees work from a company office location'}
                            {type === 'Remote' && 'Employees will only work from home'}
                            {type === 'Hybrid' && 'Employees work from both our office and their home'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Work Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work address <span className="text-red-500">Required</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      If the job is Remote or Hybrid, specify your main office or the one that's most relevant.
                    </p>
                    
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="e.g. 18144 El Camino Real"
                        value={formData.workAddress}
                        onChange={(e) => handleInputChange('workAddress', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Dropdown
                          value={formData.location}
                          onChange={(value) => handleInputChange('location', value)}
                          options={locationOptions.map(l => `${l.city}, ${l.country}`)}
                          placeholder="Select location"
                        />
                        <Dropdown
                          value={formData.department}
                          onChange={(value) => handleInputChange('department', value)}
                          options={departmentOptions.map(d => d.name)}
                          placeholder="Select department"
                        />
                      </div>
                    </div>
                    
                    <button className="mt-3 text-teal-600 text-sm font-medium flex items-center gap-1 hover:text-teal-700">
                      <Plus className="w-4 h-4" />
                      Add new location
                    </button>
                  </div>

                  {/* Job Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job description <span className="text-red-500">Required</span>
                    </label>
                    <div className="border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
                        <button className="px-2 py-1 text-sm bg-white border border-gray-200 rounded">H2</button>
                        <button className="px-2 py-1 text-sm bg-white border border-gray-200 rounded">H3</button>
                        <button className="px-2 py-1 text-sm bg-white border border-gray-200 rounded font-bold">B</button>
                        <button className="px-2 py-1 text-sm bg-white border border-gray-200 rounded italic">I</button>
                        <button className="text-teal-600 text-sm font-medium ml-auto">
                          Generate Description
                        </button>
                      </div>
                      <textarea
                        rows={8}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full p-3 resize-none focus:outline-none"
                        placeholder="Describe the role, responsibilities, and requirements..."
                      />
                    </div>
                  </div>

                  {/* Department and Job Code */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <Dropdown
                        value={formData.department}
                        onChange={(value) => handleInputChange('department', value)}
                        options={['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']}
                        placeholder="Select a department"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Job Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 42069"
                        value={formData.jobCode}
                        onChange={(e) => handleInputChange('jobCode', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Salary Range</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <input
                        type="text"
                        placeholder="Salary from"
                        value={formData.salaryFrom}
                        onChange={(e) => handleInputChange('salaryFrom', e.target.value)}
                        className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="Salary to"
                        value={formData.salaryTo}
                        onChange={(e) => handleInputChange('salaryTo', e.target.value)}
                        className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <Dropdown
                        value={formData.currency}
                        onChange={(value) => handleInputChange('currency', value)}
                        options={['EUR', 'USD', 'GBP']}
                      />
                      <Dropdown
                        value={formData.payPeriod}
                        onChange={(value) => handleInputChange('payPeriod', value)}
                        options={['Monthly', 'Yearly', 'Hourly']}
                      />
                    </div>
                    <div className="mt-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                        <span className="ml-2 text-sm text-gray-600">Display salary on Careers page</span>
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveStep(2)}
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Continue to Application Form
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Application Form */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Required Information
                      </h2>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Name</span>
                          <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Email Address</span>
                          <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Optional Information
                      </h2>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Phone Number</span>
                          <Dropdown
                            value={formData.phoneRequired}
                            onChange={(value) => handleInputChange('phoneRequired', value)}
                            options={['Optional', 'Required']}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Resume / CV</span>
                          <Dropdown
                            value={formData.resumeRequired}
                            onChange={(value) => handleInputChange('resumeRequired', value)}
                            options={['Optional', 'Required']}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Cover Letter</span>
                          <Dropdown
                            value={formData.coverLetterRequired}
                            onChange={(value) => handleInputChange('coverLetterRequired', value)}
                            options={['Optional', 'Required']}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                    Save Changes
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Custom Questions
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Custom questions are a great way to learn more up front, but create more work for the applicant. Use as few as you can.
                  </p>

                  <div className="space-y-4">
                    <Dropdown
                      value=""
                      onChange={() => {}}
                      options={customQuestions}
                      placeholder="Select from available questions"
                    />
                    <div className="text-center">
                      <span className="text-gray-500">or</span>
                    </div>
                    <button className="text-teal-600 font-medium hover:text-teal-700">
                      Add new question
                    </button>
                  </div>

                  <button className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all mt-6">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Hiring Team */}
            {activeStep === 3 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Hiring Team
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddMemberModal(true)}
                      className="bg-white border border-purple-500 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Member
                    </button>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition-all flex items-center gap-2"
                    >
                      <span>📧</span>
                      Invite Member
                    </button>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="space-y-4 mb-8">
                  {hiringTeamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          {member.avatar}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-500">{member.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{member.role}</span>
                        <div className="flex gap-2">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <span className="text-lg">📝</span>
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <span className="text-lg">📋</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* External Recruiters */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">External recruiters</h3>
                    <div className="flex gap-3">
                      <button className="bg-white border border-purple-500 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Recruiter
                      </button>
                      <button className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition-all flex items-center gap-2">
                        <span>📧</span>
                        Invite Recruiter
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p>No external recruiters added yet</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Workflow */}
            {activeStep === 4 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Workflow className="w-5 h-5" />
                  Processus de recrutement
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un workflow</label>
                    <Dropdown
                      value="Workflow par défaut"
                      onChange={() => {}}
                      options={['Workflow par défaut', 'Workflow personnalisé', 'Workflow rapide']}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Étapes du processus:</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Initial Review</h4>
                          <p className="text-sm text-gray-600">Type: Autre</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Job Advertising */}
            {activeStep === 5 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Publication de l'offre
                </h2>

                {/* Company Verification Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs">ℹ</span>
                    </div>
                    <div>
                      <p className="text-blue-800 font-medium">Votre entreprise est en cours de vérification.</p>
                      <p className="text-blue-700 text-sm mt-1">Une fois vérifiée, vous pourrez distribuer vos offres d'emploi à nos partenaires externes.</p>
                    </div>
                  </div>
                </div>

                {/* Publication Status */}
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Statut de publication</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Publier', desc: 'L\'offre sera visible sur votre site Carrières et les sites d\'emploi.', selected: true },
                      { name: 'Interne uniquement', desc: 'Visible uniquement pour les membres de votre organisation.', selected: false },
                      { name: 'Confidentiel', desc: 'Visible uniquement pour les administrateurs et l\'équipe de recrutement.', selected: false }
                    ].map((status) => (
                      <div
                        key={status.name}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          status.selected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full mt-0.5 ${
                            status.selected ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <div>
                            <h3 className="font-medium text-gray-900">{status.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{status.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Job Sites */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Sites d'emploi recommandés</h3>
                  <p className="text-sm text-gray-600 mb-4">Diffuser votre offre sur les sites d'emploi pour atteindre plus de candidats qualifiés.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Monster', price: '€199 pour 30 jours', logo: '🟡' },
                      { name: 'Indeed', price: '€149 pour 30 jours', logo: '🔵' },
                      { name: 'LinkedIn', price: '€299 pour 30 jours', logo: '🔷' }
                    ].map((site) => (
                      <div key={site.name} className="border border-gray-200 rounded-lg p-6 text-center">
                        <div className="text-4xl mb-3">{site.logo}</div>
                        <h3 className="font-medium text-gray-900 mb-2">{site.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{site.price}</p>
                        <button className="w-full border border-teal-500 text-teal-600 py-2 rounded-lg font-medium hover:bg-teal-50 transition-all">
                          Ajouter
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <SidebarItem 
              icon={FileText}
              title="Job Details"
              description="The job details section is your go-to for role duties, qualifications, location, and perks."
              active={activeStep === 1}
              onClick={() => setActiveStep(1)}
            />
            
            <SidebarItem 
              icon={Users}
              title="Application Form"
              description="Where we snag all the essential info from our future superstar employees!"
              active={activeStep === 2}
              onClick={() => setActiveStep(2)}
            />
            
            <SidebarItem 
              icon={Users}
              title="Hiring Team"
              description="Setup the team you'll use to review and hire your next teammate!"
              active={activeStep === 3}
              onClick={() => setActiveStep(3)}
            />
            
            <SidebarItem 
              icon={Workflow}
              title="Workflow"
              description="Outlines the steps and stages you'll use from application to offer."
              active={activeStep === 4}
              onClick={() => setActiveStep(4)}
            />
            
            <SidebarItem 
              icon={Target}
              title="Job Advertising"
              description="You plan to attract top applicants using job sites and social channels."
              active={activeStep === 5}
              onClick={() => setActiveStep(5)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInviteModal && <InviteMemberModal />}
      {showAddMemberModal && <AddMemberModal />}
    </div>
  );
};

export default JobCreationForm;