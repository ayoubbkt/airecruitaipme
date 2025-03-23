import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Save } from 'lucide-react';

const QuestionModal = ({ isOpen, onClose, onSave, question }) => {
    const [formData, setFormData] = useState({
        text: '',
        responseType: 'short_text',
        visibility: 'public',
        options: [],
    });

    useEffect(() => {
        if (question) {
            setFormData({
                text: question.text || '',
                responseType: question.responseType || 'short_text',
                visibility: question.visibility || 'public',
                options: question.options || []
            });
        }
    }, [question]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData(prev => ({
            ...prev,
            options: newOptions
        }));
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, '']
        }));
    };

    const removeOption = (index) => {
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            options: newOptions
        }));
    };

    // Si la modale n'est pas ouverte, ne rien afficher
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">
                            {question ? 'Modifier la question' : 'Ajouter une question'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Question */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Question <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="text"
                                    value={formData.text}
                                    onChange={handleChange}
                                    placeholder="Votre question"
                                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Type de réponse */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Type de réponse <span className="text-red-600">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="responseType"
                                        value={formData.responseType}
                                        onChange={handleChange}
                                        className="w-full p-2 pr-10 border border-slate-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <ChevronDown className="w-5 h-5 text-slate-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Options pour les types dropdown et multiple_choice */}
                            {(formData.responseType === 'dropdown' || formData.responseType === 'multiple_choice') && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Options <span className="text-red-600">*</span>
                                    </label>
                                    <div className="space-y-2">
                                        {formData.options.map((option, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                                    placeholder={`Option ${index + 1}`}
                                                    className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(index)}
                                                    className="p-2 text-red-500 hover:text-red-700"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addOption}
                                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors text-sm"
                                        >
                                            + Ajouter une option
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Visibilité de la réponse */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Visibilité des réponses <span className="text-red-600">*</span>
                                </label>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="visibility-public"
                                            name="visibility"
                                            value="public"
                                            checked={formData.visibility === 'public'}
                                            onChange={handleChange}
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
                                            checked={formData.visibility === 'private'}
                                            onChange={handleChange}
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
                                onClick={onClose}
                                className="px-4 py-2 mr-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
                            >
                                <Save size={16} />
                                <span>Enregistrer</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QuestionModal;