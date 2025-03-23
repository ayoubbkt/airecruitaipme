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
        phone: ''
    });

    useEffect(() => {
        fetchCompanyProfile();
    }, []);

    const fetchCompanyProfile = async () => {
        try {
            setLoading(true);
            const data = await companyService.getCompanyProfile();
            setCompanyData(data);
        } catch (error) {
            console.error('Erreur lors du chargement du profil de l\'entreprise:', error);
            toast.error('Impossible de charger les informations de l\'entreprise');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCompanyData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            await companyService.updateCompanyProfile(companyData);
            toast.success('Profil de l\'entreprise mis à jour avec succès');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            toast.error('Échec de la mise à jour du profil de l\'entreprise');
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

            <div className="space-y-6">
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
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nom de votre entreprise"
                        required
                    />
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
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://www.votreentreprise.fr"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                        Numéro de téléphone
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={companyData.phone}
                        onChange={handleChange}
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="01 23 45 67 89"
                    />
                </div>

                <div>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md shadow-sm hover:from-blue-700 hover:to-indigo-700 flex items-center"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;