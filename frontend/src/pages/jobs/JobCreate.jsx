import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Info, MapPin, Building, DollarSign, Briefcase, Users, Calendar, Star, X, Check, ChevronDown, Save } from 'lucide-react';
import { jobService, questionService, workflowService } from '../../services/api';
import { toast } from 'react-toastify';

const JobCreate = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Détails de base
    title: '',
    employmentType: '',
    workType: 'on-site',
    location: '',
    department: '',
    jobCode: '',
    description: '',
    requiredSkills: [],
    preferredSkills: [],
    minYearsExperience: '',
    salaryFrom: '',
    salaryTo: '',
    currency: 'EUR',
    payPeriod: 'annual',
    displaySalary: false,

    // Informations de candidature requises
    applicationFields: {
      name: { required: true },
      email: { required: true },
      phone: { required: false },
      resume: { required: true },
      coverLetter: { required: false }
    },

    // Questions personnalisées
    customQuestions: [],

    // Équipe de recrutement
    hiringTeam: [],
    externalRecruiters: [],

    // Workflow
    workflowId: 'default',
    workflowStages: [],

    // Diffusion de l'offre
    jobPostingStatus: 'draft', // draft, published, internal, confidential
    jobBoards: []
  });

  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [availableWorkflows, setAvailableWorkflows] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showTeamMemberModal, setShowTeamMemberModal] = useState(false);
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

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Charger les départements
        const departments = await jobService.getDepartments();
        setDepartmentOptions(departments);

        // Charger les questions personnalisées
        const questions = await questionService.getCustomQuestions();
        setAvailableQuestions(questions);

        // Charger les workflows
        const workflows = await workflowService.getWorkflows();
        setAvailableWorkflows([
          { id: 'default', name: 'Workflow par défaut' },
          ...workflows
        ]);

        // Charger les étapes du workflow par défaut
        const defaultStages = await workflowService.getWorkflowStages('default');
        setFormData(prev => ({
          ...prev,
          workflowStages: defaultStages
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des données initiales:', error);
        toast.error('Erreur lors du chargement des données. Veuillez réessayer.');
      }
    };

    fetchInitialData();
  }, []);

  const steps = [
    { id: 'details', title: 'Détails de l\'offre' },
    { id: 'application', title: 'Formulaire de candidature' },
    { id: 'team', title: 'Équipe de recrutement' },
    { id: 'workflow', title: 'Processus de recrutement' },
    { id: 'advertise', title: 'Diffusion de l\'offre' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleWorkTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      workType: type
    }));
  };

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
    // Validation
    if (!newQuestion.text.trim()) {
      toast.error('Veuillez saisir une question');
      return;
    }

    // Ajouter la question personnalisée
    setFormData(prev => ({
      ...prev,
      customQuestions: [...prev.customQuestions, {
        ...newQuestion,
        id: `temp-${Date.now()}`,  // ID temporaire
        isOptional: true
      }]
    }));

    // Réinitialiser et fermer
    setNewQuestion({
      text: '',
      responseType: 'short_text',
      visibility: 'public'
    });
    setShowAddQuestionModal(false);
  };

  const handleAddTeamMember = () => {
    setShowTeamMemberModal(true);
  };

  const handleTeamMemberChange = (e) => {
    const { name, value } = e.target;
    setNewTeamMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveTeamMember = () => {
    // Validation
    if (!newTeamMember.email.trim()) {
      toast.error('Veuillez saisir une adresse email');
      return;
    }

    // Ajouter le membre d'équipe
    setFormData(prev => ({
      ...prev,
      hiringTeam: [...prev.hiringTeam, {
        ...newTeamMember,
        id: `temp-${Date.now()}`,  // ID temporaire
        name: newTeamMember.email.split('@')[0]  // Nom provisoire basé sur l'email
      }]
    }));

    // Réinitialiser et fermer
    setNewTeamMember({
      email: '',
      role: 'reviewer'
    });
    setShowTeamMemberModal(false);
  };

  const handleWorkflowChange = async (workflowId) => {
    try {
      // Charger les étapes du workflow sélectionné
      const stages = await workflowService.getWorkflowStages(workflowId);

      setFormData(prev => ({
        ...prev,
        workflowId,
        workflowStages: stages
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des étapes du workflow:', error);
      toast.error('Erreur lors du chargement des étapes du workflow');
    }
  };

  const handleSelectPredefinedQuestion = (questionId) => {
    const question = availableQuestions.find(q => q.id === questionId);
    if (question) {
      // Vérifier si cette question est déjà ajoutée
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

  const removeTeamMember = (index) => {
    setFormData(prev => ({
      ...prev,
      hiringTeam: prev.hiringTeam.filter((_, i) => i !== index)
    }));
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

  const toggleQuestionRequired = (index, isRequired) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.map((q, i) =>
          i === index ? { ...q, isOptional: !isRequired } : q
      )
    }));
  };

  const generateDescription = () => {
    // Simuler une génération d'IA
    const generatedDescription = `Nous recherchons un(e) ${formData.title} passionné(e) et talentueux(se) pour rejoindre notre équipe ${formData.department || 'dynamique'}.

Vous serez responsable de concevoir, développer et maintenir des solutions innovantes qui auront un impact direct sur notre activité.

Le candidat idéal possède une solide expérience dans ${formData.requiredSkills.join(', ') || 'le domaine'} et est capable de travailler de manière autonome tout en collaborant efficacement avec une équipe pluridisciplinaire.`;

    setFormData(prev => ({
      ...prev,
      description: generatedDescription
    }));
  };

  const handleSaveAsDraft = async () => {
    try {
      setIsSubmitting(true);

      // Conversion des données pour le format attendu par l'API
      const jobData = {
        title: formData.title,
        description: formData.description,
        requiredSkills: formData.requiredSkills,
        preferredSkills: formData.preferredSkills,
        location: formData.location,
        jobType: formData.employmentType,
        workType: formData.workType,
        minYearsExperience: parseInt(formData.minYearsExperience) || 0,
        salaryRange: formData.displaySalary ? `${formData.salaryFrom}-${formData.salaryTo} ${formData.currency} ${formData.payPeriod}` : null,
        department: formData.department,
        jobCode: formData.jobCode,
        status: 'DRAFT',
        applicationFields: formData.applicationFields,
        customQuestions: formData.customQuestions,
        hiringTeam: formData.hiringTeam,
        workflowId: formData.workflowId
      };

      const createdJob = await jobService.createJob(jobData);

      toast.success('Offre d\'emploi enregistrée en brouillon !');
      navigate(`/jobs/${createdJob.id}`);
    } catch (error) {
      console.error('Erreur lors de la création de l\'offre:', error);
      toast.error('Erreur lors de la création de l\'offre d\'emploi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsSubmitting(true);

      // Conversion des données pour le format attendu par l'API
      const jobData = {
        title: formData.title,
        description: formData.description,
        requiredSkills: formData.requiredSkills,
        preferredSkills: formData.preferredSkills,
        location: formData.location,
        jobType: formData.employmentType,
        workType: formData.workType,
        minYearsExperience: parseInt(formData.minYearsExperience) || 0,
        salaryRange: formData.displaySalary ? `${formData.salaryFrom}-${formData.salaryTo} ${formData.currency} ${formData.payPeriod}` : null,
        department: formData.department,
        jobCode: formData.jobCode,
        status: 'ACTIVE',
        applicationFields: formData.applicationFields,
        customQuestions: formData.customQuestions,
        hiringTeam: formData.hiringTeam,
        workflowId: formData.workflowId,
        jobBoards: formData.jobBoards
      };

      const createdJob = await jobService.createJob(jobData);

      toast.success('Offre d\'emploi publiée avec succès !');
      navigate(`/jobs/${createdJob.id}`);
    } catch (error) {
      console.error('Erreur lors de la publication de l\'offre:', error);
      toast.error('Erreur lors de la publication de l\'offre d\'emploi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleJobBoard = (boardId, price) => {
    setFormData(prev => {
      const currentBoards = [...prev.jobBoards];
      const existingIndex = currentBoards.findIndex(board => board.id === boardId);

      if (existingIndex >= 0) {
        // Supprimer si déjà présent
        currentBoards.splice(existingIndex, 1);
      } else {
        // Ajouter si pas encore présent
        currentBoards.push({
          id: boardId,
          price: price
        });
      }

      return {
        ...prev,
        jobBoards: currentBoards
      };
    });
  };

  // Rendu des étapes
  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'details':
        return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Informations de base</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Titre du poste <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="ex: Développeur Full Stack"
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Type d'emploi <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleChange}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Mode de travail <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div
                          className={`flex flex-col items-center justify-center p-3 border ${formData.workType === 'on-site' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'} rounded-lg cursor-pointer hover:bg-slate-50`}
                          onClick={() => handleWorkTypeChange('on-site')}
                      >
                        <Building className={`h-5 w-5 ${formData.workType === 'on-site' ? 'text-blue-500' : 'text-slate-500'}`} />
                        <span className={`mt-1 text-sm ${formData.workType === 'on-site' ? 'font-medium text-blue-700' : 'text-slate-700'}`}>Sur site</span>
                      </div>
                      <div
                          className={`flex flex-col items-center justify-center p-3 border ${formData.workType === 'remote' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'} rounded-lg cursor-pointer hover:bg-slate-50`}
                          onClick={() => handleWorkTypeChange('remote')}
                      >
                        <Briefcase className={`h-5 w-5 ${formData.workType === 'remote' ? 'text-blue-500' : 'text-slate-500'}`} />
                        <span className={`mt-1 text-sm ${formData.workType === 'remote' ? 'font-medium text-blue-700' : 'text-slate-700'}`}>Télétravail</span>
                      </div>
                      <div
                          className={`flex flex-col items-center justify-center p-3 border ${formData.workType === 'hybrid' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'} rounded-lg cursor-pointer hover:bg-slate-50`}
                          onClick={() => handleWorkTypeChange('hybrid')}
                      >
                        <Users className={`h-5 w-5 ${formData.workType === 'hybrid' ? 'text-blue-500' : 'text-slate-500'}`} />
                        <span className={`mt-1 text-sm ${formData.workType === 'hybrid' ? 'font-medium text-blue-700' : 'text-slate-700'}`}>Hybride</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Localisation <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                      <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="ex: Paris, France"
                          className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description du poste */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">Description du poste</h2>
                  <button
                      type="button"
                      onClick={generateDescription}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center hover:bg-blue-100"
                  >
                    <span>Générer avec IA</span>
                  </button>
                </div>

                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Décrivez les responsabilités, exigences et avantages du poste..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-48"
                    required
                />
              </div>

              {/* Compétences */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Compétences</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Compétences requises
                    </label>
                    <div className="flex gap-2">
                      <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="ex: JavaScript"
                          className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequiredSkill())}
                      />
                      <button
                          type="button"
                          onClick={addRequiredSkill}
                          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.requiredSkills.map((skill, index) => (
                          <div key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
                            <span>{skill}</span>
                            <button
                                type="button"
                                onClick={() => removeRequiredSkill(index)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Compétences souhaitées
                    </label>
                    <div className="flex gap-2">
                      <input
                          type="text"
                          value={newPreferredSkill}
                          onChange={(e) => setNewPreferredSkill(e.target.value)}
                          placeholder="ex: React"
                          className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredSkill())}
                      />
                      <button
                          type="button"
                          onClick={addPreferredSkill}
                          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.preferredSkills.map((skill, index) => (
                          <div key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full flex items-center">
                            <span>{skill}</span>
                            <button
                                type="button"
                                onClick={() => removePreferredSkill(index)}
                                className="ml-2 text-indigo-600 hover:text-indigo-800"
                            >
                              ×
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Expérience minimale (années)
                    </label>
                    <input
                        type="number"
                        name="minYearsExperience"
                        value={formData.minYearsExperience}
                        onChange={handleChange}
                        placeholder="ex: 3"
                        min="0"
                        max="20"
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Salaire et avantages */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Rémunération</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Salaire minimum
                      </label>
                      <div className="relative">
                        <DollarSign className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            name="salaryFrom"
                            value={formData.salaryFrom}
                            onChange={handleChange}
                            placeholder="ex: 45000"
                            className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Salaire maximum
                      </label>
                      <div className="relative">
                        <DollarSign className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            name="salaryTo"
                            value={formData.salaryTo}
                            onChange={handleChange}
                            placeholder="ex: 65000"
                            className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Devise
                      </label>
                      <select
                          name="currency"
                          value={formData.currency}
                          onChange={handleChange}
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="CHF">CHF</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Période
                      </label>
                      <select
                          name="payPeriod"
                          value={formData.payPeriod}
                          onChange={handleChange}
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="annual">Annuel</option>
                        <option value="monthly">Mensuel</option>
                        <option value="hourly">Horaire</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                          type="checkbox"
                          name="displaySalary"
                          checked={formData.displaySalary}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">Afficher le salaire sur l'offre d'emploi</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Détails supplémentaires */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Détails supplémentaires</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Département
                    </label>
                    <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sélectionner un département</option>
                      {departmentOptions.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Code du poste
                    </label>
                    <input
                        type="text"
                        name="jobCode"
                        value={formData.jobCode}
                        onChange={handleChange}
                        placeholder="ex: DEV-2023-42"
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
        );

      case 'application':
        return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Informations requises</h2>
                <p className="text-sm text-slate-500 mb-4">
                  Configurez les informations que les candidats devront obligatoirement fournir.
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border-b border-slate-100">
                    <span className="font-medium">Nom</span>
                    <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
                      Obligatoire
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 border-b border-slate-100">
                    <span className="font-medium">Email</span>
                    <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
                      Obligatoire
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 border-b border-slate-100">
                    <span className="font-medium">Numéro de téléphone</span>
                    <button
                        onClick={() => handleToggleRequiredField('phone')}
                        className={`px-3 py-1.5 rounded-lg text-sm ${
                            formData.applicationFields.phone.required
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                      {formData.applicationFields.phone.required ? 'Obligatoire' : 'Optionnel'}
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 border-b border-slate-100">
                    <span className="font-medium">CV / Résumé</span>
                    <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
                      Obligatoire
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 border-b border-slate-100">
                    <span className="font-medium">Lettre de motivation</span>
                    <button
                        onClick={() => handleToggleRequiredField('coverLetter')}
                        className={`px-3 py-1.5 rounded-lg text-sm ${
                            formData.applicationFields.coverLetter.required
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                      {formData.applicationFields.coverLetter.required ? 'Obligatoire' : 'Optionnel'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">Questions personnalisées</h2>
                  <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center hover:bg-blue-100"
                  >
                    <PlusCircle className="w-4 h-4 mr-1" />
                    <span>Ajouter une question</span>
                  </button>
                </div>

                <p className="text-sm text-slate-500 mb-4">
                  Les questions personnalisées sont un excellent moyen d'en savoir plus sur les candidats dès le départ. Utilisez-en peu pour ne pas alourdir le processus.
                </p>

                {formData.customQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {formData.customQuestions.map((question, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-800">{question.text}</p>
                              <div className="flex items-center mt-1 text-xs text-slate-500">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full mr-2">
                            {question.responseType === 'short_text' ? 'Texte court' :
                                question.responseType === 'paragraph' ? 'Paragraphe' :
                                    question.responseType === 'yes_no' ? 'Oui/Non' :
                                        question.responseType === 'multiple_choice' ? 'Choix multiple' :
                                            'Autre'}
                          </span>
                                <span className={`px-2 py-0.5 rounded-full ${
                                    question.visibility === 'public'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-amber-50 text-amber-700'
                                }`}>
                            {question.visibility === 'public' ? 'Visible par tous' : 'Visible par le recruteur'}
                          </span>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <button
                                  onClick={() => toggleQuestionRequired(index, !question.isOptional)}
                                  className={`px-2 py-1 text-xs rounded-lg mr-2 ${
                                      !question.isOptional
                                          ? 'bg-blue-100 text-blue-700'
                                          : 'bg-slate-100 text-slate-700'
                                  }`}
                              >
                                {!question.isOptional ? 'Obligatoire' : 'Optionnelle'}
                              </button>
                              <button
                                  onClick={() => removeQuestion(index)}
                                  className="p-1 text-slate-400 hover:text-red-500 rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                      ))}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-slate-50 rounded-lg">
                      <p className="text-slate-500 mb-2">Aucune question personnalisée ajoutée</p>
                      <p className="text-sm text-slate-400">Ajoutez des questions pour en savoir plus sur vos candidats</p>
                    </div>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ajouter depuis les questions existantes
                  </label>
                  <select
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => handleSelectPredefinedQuestion(e.target.value)}
                      value=""
                  >
                    <option value="">Sélectionner une question...</option>
                    {availableQuestions.map(question => (
                        <option key={question.id} value={question.id}>{question.text}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
        );

      case 'team':
        return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">Équipe de recrutement</h2>
                  <button
                      type="button"
                      onClick={handleAddTeamMember}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center hover:bg-blue-100"
                  >
                    <PlusCircle className="w-4 h-4 mr-1" />
                    <span>Ajouter un membre</span>
                  </button>
                </div>

                <p className="text-sm text-slate-500 mb-4">
                  Les membres de l'équipe de recrutement peuvent accéder à cette offre et participer au processus de sélection des candidats.
                </p>

                {formData.hiringTeam.length > 0 ? (
                    <div className="space-y-3">
                      {formData.hiringTeam.map((member, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="font-medium text-slate-800">{member.name}</p>
                                <p className="text-xs text-slate-500">{member.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                        <span className="px-2 py-1 text-xs rounded-lg bg-blue-50 text-blue-700 mr-2">
                          {member.role === 'recruiting_admin' ? 'Admin Recrutement' :
                              member.role === 'hiring_manager' ? 'Responsable' :
                                  'Évaluateur'}
                        </span>
                              <button
                                  onClick={() => removeTeamMember(index)}
                                  className="p-1 text-slate-400 hover:text-red-500 rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                      ))}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-slate-50 rounded-lg">
                      <p className="text-slate-500 mb-2">Aucun membre dans l'équipe de recrutement</p>
                      <p className="text-sm text-slate-400">Ajoutez des membres pour collaborer sur ce recrutement</p>
                    </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">Recruteurs externes</h2>
                  <button
                      type="button"
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm flex items-center hover:bg-blue-100"
                  >
                    <PlusCircle className="w-4 h-4 mr-1" />
                    <span>Ajouter un recruteur</span>
                  </button>
                </div>

                <p className="text-sm text-slate-500 mb-4">
                  Les recruteurs externes peuvent vous aider à trouver des candidats pour cette offre.
                </p>

                <div className="text-center py-6 bg-slate-50 rounded-lg">
                  <p className="text-slate-500 mb-2">Aucun recruteur externe ajouté</p>
                  <p className="text-sm text-slate-400">Ajoutez des recruteurs externes pour accélérer votre processus</p>
                </div>
              </div>
            </div>
        );

      case 'workflow':
        return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Processus de recrutement</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sélectionner un workflow
                  </label>
                  <select
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.workflowId}
                      onChange={(e) => handleWorkflowChange(e.target.value)}
                  >
                    {availableWorkflows.map(workflow => (
                        <option key={workflow.id} value={workflow.id}>{workflow.name}</option>
                    ))}
                  </select>
                </div>

                <h3 className="font-medium text-slate-700 mb-2">Étapes du processus:</h3>
                <div className="space-y-4">
                  {formData.workflowStages.map((stage) => (
                      <div key={stage.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                              <span className="text-sm font-medium">{stage.order + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-800">{stage.name}</h4>
                              <p className="text-xs text-slate-500 mt-1">
                                Type: {stage.type === 'lead' ? 'Lead' :
                                  stage.type === 'applied' ? 'Candidat' :
                                      stage.type === 'review' ? 'Évaluation' :
                                          stage.type === 'interview' ? 'Entretien' :
                                              stage.type === 'offer' ? 'Offre' :
                                                  stage.type === 'hired' ? 'Embauché' :
                                                      stage.type === 'rejected' ? 'Rejeté' : 'Autre'}
                              </p>
                            </div>
                          </div>
                          {stage.dueDays && (
                              <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                Délai: {stage.dueDays} jours
                              </div>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
        );

      case 'advertise':
        return (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Publication de l'offre</h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
                  <Info className="text-blue-500 w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-blue-700 text-sm">Votre entreprise est en cours de vérification.</p>
                    <p className="text-blue-600 text-xs mt-1">Une fois vérifiée, vous pourrez distribuer vos offres d'emploi à nos partenaires externes.</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Statut de publication
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div
                        className={`border ${formData.jobPostingStatus === 'published' ? 'border-green-500 bg-green-50' : 'border-slate-200'} rounded-lg p-3 cursor-pointer hover:bg-slate-50`}
                        onClick={() => setFormData(prev => ({ ...prev, jobPostingStatus: 'published' }))}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full ${formData.jobPostingStatus === 'published' ? 'bg-green-500' : 'border border-slate-300'} mr-2 flex-shrink-0`}>
                          {formData.jobPostingStatus === 'published' && (
                              <Check className="text-white w-3 h-3" />
                          )}
                        </div>
                        <span className="font-medium">Publier</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 ml-6">L'offre sera visible sur votre site Carrières et les sites d'emploi.</p>
                    </div>

                    <div
                        className={`border ${formData.jobPostingStatus === 'internal' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'} rounded-lg p-3 cursor-pointer hover:bg-slate-50`}
                        onClick={() => setFormData(prev => ({ ...prev, jobPostingStatus: 'internal' }))}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full ${formData.jobPostingStatus === 'internal' ? 'bg-blue-500' : 'border border-slate-300'} mr-2 flex-shrink-0`}>
                          {formData.jobPostingStatus === 'internal' && (
                              <Check className="text-white w-3 h-3" />
                          )}
                        </div>
                        <span className="font-medium">Interne uniquement</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 ml-6">Visible uniquement pour les membres de votre organisation.</p>
                    </div>

                    <div
                        className={`border ${formData.jobPostingStatus === 'confidential' ? 'border-amber-500 bg-amber-50' : 'border-slate-200'} rounded-lg p-3 cursor-pointer hover:bg-slate-50`}
                        onClick={() => setFormData(prev => ({ ...prev, jobPostingStatus: 'confidential' }))}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full ${formData.jobPostingStatus === 'confidential' ? 'bg-amber-500' : 'border border-slate-300'} mr-2 flex-shrink-0`}>
                          {formData.jobPostingStatus === 'confidential' && (
                              <Check className="text-white w-3 h-3" />
                          )}
                        </div>
                        <span className="font-medium">Confidentiel</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 ml-6">Visible uniquement pour les administrateurs et l'équipe de recrutement.</p>
                    </div>
                  </div>
                </div>

                <h3 className="font-medium text-slate-700 mb-2">Sites d'emploi recommandés</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Diffuser votre offre sur les sites d'emploi pour atteindre plus de candidats qualifiés.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Sites d'emploi */}
                  <div className="border border-slate-200 rounded-lg p-4 text-center">
                    <img src="/api/placeholder/120/40" alt="Monster" className="h-10 mx-auto mb-2" />
                    <p className="text-slate-700 font-medium">Monster</p>
                    <p className="text-slate-500 text-sm">€199 pour 30 jours</p>
                    <button
                        type="button"
                        className={`mt-2 px-3 py-1.5 rounded-lg text-sm ${
                            formData.jobBoards.some(b => b.id === 'monster')
                                ? 'bg-green-500 text-white'
                                : 'border border-green-500 text-green-600'
                        }`}
                        onClick={() => toggleJobBoard('monster', 199)}
                    >
                      {formData.jobBoards.some(b => b.id === 'monster') ? 'Ajouté' : 'Ajouter'}
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4 text-center">
                    <img src="/api/placeholder/120/40" alt="Indeed" className="h-10 mx-auto mb-2" />
                    <p className="text-slate-700 font-medium">Indeed</p>
                    <p className="text-slate-500 text-sm">€149 pour 30 jours</p>
                    <button
                        type="button"
                        className={`mt-2 px-3 py-1.5 rounded-lg text-sm ${
                            formData.jobBoards.some(b => b.id === 'indeed')
                                ? 'bg-green-500 text-white'
                                : 'border border-green-500 text-green-600'
                        }`}
                        onClick={() => toggleJobBoard('indeed', 149)}
                    >
                      {formData.jobBoards.some(b => b.id === 'indeed') ? 'Ajouté' : 'Ajouter'}
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4 text-center">
                    <img src="/api/placeholder/120/40" alt="LinkedIn" className="h-10 mx-auto mb-2" />
                    <p className="text-slate-700 font-medium">LinkedIn</p>
                    <p className="text-slate-500 text-sm">€299 pour 30 jours</p>
                    <button
                        type="button"
                        className={`mt-2 px-3 py-1.5 rounded-lg text-sm ${
                            formData.jobBoards.some(b => b.id === 'linkedin')
                                ? 'bg-green-500 text-white'
                                : 'border border-green-500 text-green-600'
                        }`}
                        onClick={() => toggleJobBoard('linkedin', 299)}
                    >
                      {formData.jobBoards.some(b => b.id === 'linkedin') ? 'Ajouté' : 'Ajouter'}
                    </button>
                  </div>
                </div>

                {formData.jobBoards.length > 0 && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-800 mb-2">Votre panier</h4>
                      <div className="space-y-2">
                        {formData.jobBoards.map(board => (
                            <div key={board.id} className="flex justify-between items-center">
                              <span className="text-sm">{board.id.charAt(0).toUpperCase() + board.id.slice(1)}</span>
                              <span className="font-medium">€{board.price}</span>
                            </div>
                        ))}
                        <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-center font-medium">
                          <span>Total:</span>
                          <span>€{formData.jobBoards.reduce((sum, board) => sum + board.price, 0)}</span>
                        </div>
                      </div>
                    </div>
                )}
              </div>
            </div>
        );

      default:
        return null;
    }
  };

  // Modal pour l'ajout d'une question personnalisée
  const renderAddQuestionModal = () => {
    if (!showAddQuestionModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Ajouter une question</h3>
              <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="text"
                    value={newQuestion.text}
                    onChange={handleQuestionChange}
                    placeholder="Votre question"
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type de réponse <span className="text-red-500">*</span>
                </label>
                <select
                    name="responseType"
                    value={newQuestion.responseType}
                    onChange={handleQuestionChange}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                >
                  <option value="short_text">Réponse courte</option>
                  <option value="paragraph">Paragraphe</option>
                  <option value="yes_no">Oui ou Non</option>
                  <option value="dropdown">Liste déroulante</option>
                  <option value="multiple_choice">Choix multiple</option>
                  <option value="number">Nombre</option>
                  <option value="file">Fichier</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Visibilité <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                        type="radio"
                        id="visibility-public"
                        name="visibility"
                        value="public"
                        checked={newQuestion.visibility === 'public'}
                        onChange={handleQuestionChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <label htmlFor="visibility-public" className="ml-2 text-sm text-slate-700">
                      Visible pour tous sur l'offre
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                        type="radio"
                        id="visibility-private"
                        name="visibility"
                        value="private"
                        checked={newQuestion.visibility === 'private'}
                        onChange={handleQuestionChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <label htmlFor="visibility-private" className="ml-2 text-sm text-slate-700">
                      Visible uniquement pour les responsables du recrutement
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 mr-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                  type="button"
                  onClick={saveQuestion}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
    );
  };

  // Modal pour l'ajout d'un membre d'équipe
  const renderAddTeamMemberModal = () => {
    if (!showTeamMemberModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Ajouter un membre</h3>
              <button
                  type="button"
                  onClick={() => setShowTeamMemberModal(false)}
                  className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email du membre <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    name="email"
                    value={newTeamMember.email}
                    onChange={handleTeamMemberChange}
                    placeholder="email@entreprise.fr"
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rôle du membre
                </label>

                <div className="space-y-3">
                  {teamRoles.map(role => (
                      <div
                          key={role.id}
                          className={`border rounded-lg p-3 cursor-pointer ${
                              newTeamMember.role === role.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 hover:bg-slate-50'
                          }`}
                          onClick={() => setNewTeamMember(prev => ({ ...prev, role: role.id }))}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full ${
                              newTeamMember.role === role.id
                                  ? 'bg-blue-500'
                                  : 'border border-slate-300'
                          } mr-2`}>
                            {newTeamMember.role === role.id && (
                                <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="font-medium">{role.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 ml-6">{role.description}</p>
                      </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                  type="button"
                  onClick={() => setShowTeamMemberModal(false)}
                  className="px-4 py-2 mr-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                  type="button"
                  onClick={saveTeamMember}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
    );
  };

  return (
      <div className="bg-slate-50 min-h-screen pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Créer une offre d'emploi</h1>
            <div className="flex space-x-3">
              <button
                  onClick={handleSaveAsDraft}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                <span>Enregistrer comme brouillon</span>
              </button>

              {currentStep === steps.length - 1 ? (
                  <button
                      onClick={handlePublish}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 flex items-center"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    <span>{isSubmitting ? 'Publication...' : 'Publier l\'offre'}</span>
                  </button>
              ) : (
                  <button
                      onClick={nextStep}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 flex items-center"
                  >
                    <span>Continuer</span>
                  </button>
              )}
            </div>
          </div>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, i) => (
                  <div
                      key={step.id}
                      className={`flex flex-col items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}
                  >
                    <div className="flex items-center">
                      <button
                          onClick={() => setCurrentStep(i)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                              i < currentStep
                                  ? 'bg-green-100 text-green-800 border-2 border-green-500'
                                  : i === currentStep
                                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                                      : 'bg-slate-100 text-slate-500'
                          }`}
                      >
                        {i < currentStep ? <Check className="w-5 h-5" /> : i + 1}
                      </button>
                      {i < steps.length - 1 && (
                          <div
                              className={`h-1 flex-1 w-full mx-2 ${
                                  i < currentStep ? 'bg-green-500' : 'bg-slate-200'
                              }`}
                          ></div>
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                        i <= currentStep ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                  {step.title}
                </span>
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
              {/* Job Details Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">
                  <span className="mr-2">📝</span> Détails de l'offre
                </h2>
                <p className="text-sm text-slate-500">
                  Les détails de l'offre sont votre guide pour les responsabilités, qualifications, lieu et avantages du poste.
                </p>
              </div>

              {/* Application Form Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">
                  <span className="mr-2">📋</span> Formulaire de candidature
                </h2>
                <p className="text-sm text-slate-500">
                  Recueillez toutes les informations essentielles de vos futurs employés.
                </p>
              </div>

              {/* Workflow Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">
                  <span className="mr-2">🔄</span> Processus de recrutement
                </h2>
                <p className="text-sm text-slate-500">
                  Définissez les étapes et phases que les candidats traverseront, de la candidature à l'offre.
                </p>
              </div>

              {/* Hiring Team Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">
                  <span className="mr-2">👥</span> Équipe de recrutement
                </h2>
                <p className="text-sm text-slate-500">
                  Constituez l'équipe qui vous aidera à évaluer et embaucher votre prochain collaborateur.
                </p>
              </div>

              {/* Job Advertising Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">
                  <span className="mr-2">📢</span> Diffusion de l'offre
                </h2>
                <p className="text-sm text-slate-500">
                  Attirez les meilleurs talents en utilisant les sites d'emploi et réseaux sociaux adaptés.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {renderAddQuestionModal()}
        {renderAddTeamMemberModal()}
      </div>
  );
};

export default JobCreate;