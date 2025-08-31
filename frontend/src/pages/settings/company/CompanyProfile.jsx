import React, { useState, useEffect } from 'react';
import { Building, Save } from 'lucide-react';
import { companyService } from '../../../services/api';
import { toast } from 'react-toastify';

const CompanyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: '',
    website: '',
    phoneNumber: '',
    description: '',
  });
  const [companyId, setCompanyId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const data = await companyService.getCompanyProfile();
      console.log("data",data);
      if (data) {
        setCompanyData({
          name: data.name || '',
          website: data.website || '',
          phoneNumber: data.phoneNumber || '',
          description: data.description || '',
        });
        setCompanyId(data.id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil de l\'entreprise:', error);
      toast.error(error.message || 'Impossible de charger les informations de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!companyData.name.trim()) {
      newErrors.name = 'Le nom de l\'entreprise est requis';
    } else if (!/^[a-zA-Z0-9\s&-_.]+$/.test(companyData.name)) {
      newErrors.name = 'Le nom ne doit contenir que des lettres, chiffres, espaces ou tirets';
    }
    if (companyData.website) {
      try {
        new URL(companyData.website);
        if (!companyData.website.match(/^https?:\/\/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/)) {
          newErrors.website = 'L\'URL doit être un domaine valide (ex. https://exemple.com)';
        }
      } catch {
        newErrors.website = 'URL invalide';
      }
    }
    if (companyData.description && companyData.description.length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }
    if (companyData.phoneNumber && !/^\+?\d{10,15}$/.test(companyData.phoneNumber)) {
      newErrors.phoneNumber = 'Numéro de téléphone invalide (10-15 chiffres)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      setSaving(true);
      if (companyId) {
        await companyService.updateCompany(companyId, companyData);
        toast.success('Profil de l\'entreprise mis à jour avec succès');
      } else {
        const response = await companyService.createCompany(companyData);
        console.log("response",response.data);
        setCompanyId(response.data.id);
        toast.success('Entreprise créée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      const errorMessage = error.response?.data?.message || 'Échec de la sauvegarde du profil de l\'entreprise';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <Building className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-slate-800">Profil de l'entreprise</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Nom de l'entreprise <span className="text-xs text-red-500">Obligatoire</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={companyData.name}
            onChange={handleChange}
            className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-slate-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Nom de votre entreprise"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
            Site web de l'entreprise
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={companyData.website}
            onChange={handleChange}
            className={`w-full p-2 border ${errors.website ? 'border-red-500' : 'border-slate-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="https://www.votreentreprise.fr"
          />
          {errors.website && <p className="text-xs text-red-500 mt-1">{errors.website}</p>}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-1">
            Numéro de téléphone
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={companyData.phoneNumber}
            onChange={handleChange}
            className={`w-full p-2 border ${errors.phoneNumber ? 'border-red-500' : 'border-slate-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="01 23 45 67 89"
          />
          {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={companyData.description}
            onChange={handleChange}
            className={`w-full p-2 border ${errors.description ? 'border-red-500' : 'border-slate-300'} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Description de l'entreprise"
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md shadow-sm hover:from-blue-700 hover:to-indigo-700 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;