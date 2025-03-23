import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Info, MapPin, Building, DollarSign, Briefcase, Users, Calendar, Star } from 'lucide-react';
import { jobService } from '../../services/api';
import { toast } from 'react-toastify';

const JobCreateForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        employmentType: '',
        workType: 'on-site',
        location: '',
        department: '',
        jobCode: '',
        salaryFrom: '',
        salaryTo: '',
        currency: 'EUR',
        payPeriod: 'annual',
        displaySalary: false,
        description: '',
        requiredSkills: [],
        preferredSkills: [],
        minYearsExperience: ''
    });

    const [newSkill, setNewSkill] = useState('');
    const [newPreferredSkill, setNewPreferredSkill] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

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
                jobCode: formData.jobCode
            };

            const createdJob = await jobService.createJob(jobData);

            toast.success('Offre d\'emploi créée avec succès!');
            navigate(`/jobs/${createdJob.id}`);
        } catch (error) {
            console.error('Erreur lors de la création de l\'offre:', error);
            toast.error('Erreur lors de la création de l\'offre d\'emploi');
        } finally {
            setIsSubmitting(false);
        }
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

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Créer une offre d'emploi</h1>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 flex items-center disabled:opacity-70"
                >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    <span>{isSubmitting ? 'Publication...' : 'Publier l\'offre'}</span>
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Section principale */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informations de base */}
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
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
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
                                        <option value="IT">Informatique</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Sales">Ventes</option>
                                        <option value="HR">Ressources Humaines</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Operations">Opérations</option>
                                        <option value="RD">R&D</option>
                                        <option value="Legal">Juridique</option>
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

                        {/* Astuces */}
                        <div className="bg-blue-50 rounded-xl p-6">
                            <h3 className="flex items-center text-blue-700 font-medium mb-2">
                                <Info className="h-5 w-5 mr-2" />
                                Astuces pour une offre efficace
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-700">
                                <li className="flex items-start">
                                    <Star className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Soyez précis sur les responsabilités et les attentes</span>
                                </li>
                                <li className="flex items-start">
                                    <Star className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Mentionnez la culture d'entreprise et les avantages</span>
                                </li>
                                <li className="flex items-start">
                                    <Star className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Utilisez des mots-clés pertinents pour améliorer la visibilité</span>
                                </li>
                                <li className="flex items-start">
                                    <Star className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Évitez le jargon technique excessif</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
export default JobCreateForm;