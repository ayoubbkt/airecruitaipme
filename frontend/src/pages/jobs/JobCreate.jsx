import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, PlusCircle, X } from 'lucide-react';
import { jobService } from '../../services/api';
import { toast } from 'react-toastify';

const JobCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [],
    preferredSkills: [],
    location: '',
    jobType: 'FULL_TIME',
    minYearsExperience: 0,
    salaryRange: '',
    department: ''
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentPreferredSkill, setCurrentPreferredSkill] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddSkill = (type) => {
    if (type === 'required' && currentSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    } else if (type === 'preferred' && currentPreferredSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        preferredSkills: [...prev.preferredSkills, currentPreferredSkill.trim()]
      }));
      setCurrentPreferredSkill('');
    }
  };
  
  const handleRemoveSkill = (type, index) => {
    if (type === 'required') {
      setFormData(prev => ({
        ...prev,
        requiredSkills: prev.requiredSkills.filter((_, i) => i !== index)
      }));
    } else if (type === 'preferred') {
      setFormData(prev => ({
        ...prev,
        preferredSkills: prev.preferredSkills.filter((_, i) => i !== index)
      }));
    }
  };
  
  const handleGenerateDescription = async () => {
    if (!formData.title || formData.requiredSkills.length === 0) {
      toast.warning('Veuillez d\'abord saisir un titre et des compétences requises');
      return;
    }
    
    try {
      setGeneratingDescription(true);
      const description = await jobService.generateJobDescription(formData.title, formData.requiredSkills);
      setFormData(prev => ({ ...prev, description }));
      toast.success('Description générée avec succès');
    } catch (error) {
      console.error('Error generating job description:', error);
      toast.error('Erreur lors de la génération de la description');
    } finally {
      setGeneratingDescription(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || formData.requiredSkills.length === 0) {
      toast.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      setLoading(true);
      const createdJob = await jobService.createJob(formData);
      toast.success('Offre d\'emploi créée avec succès');
      navigate(`/jobs/${createdJob.id}`);
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Erreur lors de la création de l\'offre');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          className="p-2 rounded-full hover:bg-slate-100 mr-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Créer une offre d'emploi</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 pb-3 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800">Informations de base</h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Titre du poste*</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: Développeur Frontend React"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description du poste*</label>
                    <button
                      type="button"
                      className="text-xs text-blue-600 font-medium flex items-center"
                      onClick={handleGenerateDescription}
                      disabled={generatingDescription}
                    >
                      {generatingDescription ? 'Génération...' : 'Générer avec IA'}
                    </button>
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    rows="10"
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Décrivez les responsabilités, qualifications et autres détails du poste..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">Département</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: Développement, Marketing, etc."
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 pb-3 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800">Compétences</h3>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Compétences requises*</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 p-3 border border-slate-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ajouter une compétence requise"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill('required');
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="p-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                      onClick={() => handleAddSkill('required')}
                    >
                      <PlusCircle className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.requiredSkills.map((skill, index) => (
                      <div key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full flex items-center">
                        <span className="text-sm font-medium">{skill}</span>
                        <button
                          type="button"
                          className="ml-1 text-blue-500 hover:text-blue-700"
                          onClick={() => handleRemoveSkill('required', index)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Compétences souhaitées (optionnel)</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 p-3 border border-slate-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ajouter une compétence souhaitée"
                      value={currentPreferredSkill}
                      onChange={(e) => setCurrentPreferredSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill('preferred');
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="p-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                      onClick={() => handleAddSkill('preferred')}
                    >
                      <PlusCircle className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.preferredSkills.map((skill, index) => (
                      <div key={index} className="px-3 py-1 bg-slate-50 text-slate-700 rounded-full flex items-center">
                        <span className="text-sm font-medium">{skill}</span>
                        <button
                          type="button"
                          className="ml-1 text-slate-500 hover:text-slate-700"
                          onClick={() => handleRemoveSkill('preferred', index)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Side Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 pb-3 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800">Détails du poste</h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Localisation*</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: Paris, Remote, etc."
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="jobType" className="block text-sm font-medium text-slate-700 mb-1">Type de contrat*</label>
                  <select
                    id="jobType"
                    name="jobType"
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.jobType}
                    onChange={handleChange}
                    required
                  >
                    <option value="FULL_TIME">CDI - Temps plein</option>
                    <option value="PART_TIME">CDI - Temps partiel</option>
                    <option value="CONTRACT">CDD</option>
                    <option value="INTERNSHIP">Stage</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="minYearsExperience" className="block text-sm font-medium text-slate-700 mb-1">Expérience minimale (années)</label>
                  <input
                    type="number"
                    id="minYearsExperience"
                    name="minYearsExperience"
                    min="0"
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.minYearsExperience}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="salaryRange" className="block text-sm font-medium text-slate-700 mb-1">Fourchette de salaire (optionnel)</label>
                  <input
                    type="text"
                    id="salaryRange"
                    name="salaryRange"
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: 45-55K€, Selon profil, etc."
                    value={formData.salaryRange}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6">
              <h3 className="text-md font-semibold text-slate-800 mb-3">Conseils pour une offre efficace</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                  <p className="ml-2">Soyez précis dans le titre pour attirer les bons candidats</p>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                  <p className="ml-2">Listez les compétences essentielles pour le poste</p>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                  <p className="ml-2">Incluez les responsabilités clés et les opportunités d'évolution</p>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 font-medium"
                disabled={loading}
              >
                {loading ? 'Création en cours...' : 'Créer l\'offre'}
              </button>
              <button
                type="button"
                className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 font-medium"
                onClick={() => navigate('/jobs')}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JobCreate;