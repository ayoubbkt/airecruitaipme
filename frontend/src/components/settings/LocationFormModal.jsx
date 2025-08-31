import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { countries } from '../../utils/countries';

const LocationFormModal = ({ isOpen, onClose, onSave, location, title }) => {
    const [formData, setFormData] = useState({
        address: '',
        country: '',
        city: '',
        zipPostal: ''
    });

    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    useEffect(() => {
        if (location) {
            setFormData({
                address: location.address || '',
                country: location.country || '',
                city: location.city || '',
                zipPostal: location.zipPostal || '' // Corrigé : utilise location.zipPostal
            });
        } else {
            setFormData({
                address: '',
                country: '',
                city: '',
                zipPostal: ''
            });
        }
    }, [location, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCountrySelect = (country) => {
        setFormData(prev => ({
            ...prev,
            country
        }));
        setShowCountryDropdown(false);
    };

    const handleSubmit = () => {
        // Valider les champs obligatoires
        if (!formData.country || !formData.city) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-lg font-medium text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
                                Adresse
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="ex: 123 rue de Paris"
                            />
                        </div>

                        <div className="relative">
                            <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">
                                Pays
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    onFocus={() => setShowCountryDropdown(true)}
                                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Sélectionner un pays"
                                    readOnly
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>

                            {showCountryDropdown && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
                                    <ul className="py-1">
                                        {countries.map((country, index) => (
                                            <li
                                                key={index}
                                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                                onClick={() => handleCountrySelect(country)}
                                            >
                                                {country}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
                                Ville
                            </label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="ex: Paris"
                            />
                        </div>

                        <div>
                            <label htmlFor="zipPostal" className="block text-sm font-medium text-slate-700 mb-1">
                                Code postal
                            </label>
                            <input
                                type="text"
                                id="zipPostal"
                                name="zipPostal" // Corrigé : utilise zipPostal
                                value={formData.zipPostal}
                                onChange={handleChange}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="ex: 75001"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end p-4 border-t border-slate-200 gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md shadow-sm hover:from-blue-700 hover:to-indigo-700 flex items-center"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationFormModal;