import React, { useState, useEffect } from 'react';
import { Bold, Italic, Link, List, X, ChevronDown, ListOrdered } from 'lucide-react';
import { meetingTemplateService, ratingCardService } from '../../services/api';

const MeetingTemplateForm = ({ template, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        duration: '30 minutes',
        type: 'Visioconférence',
        content: '',
        ratingCardId: ''
    });
    const [ratingCards, setRatingCards] = useState([]);
    const [showDurationDropdown, setShowDurationDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showRatingCardDropdown, setShowRatingCardDropdown] = useState(false);

    const durationOptions = ['15 minutes', '30 minutes', '45 minutes', '60 minutes', '90 minutes'];
    const typeOptions = ['Visioconférence', 'Appel téléphonique', 'Entretien en personne', 'Autre'];

    useEffect(() => {
        if (template) {
            setFormData({
                name: template.name || '',
                title: template.title || '',
                duration: template.duration || '30 minutes',
                type: template.type || 'Visioconférence',
                content: template.content || '',
                ratingCardId: template.ratingCardId || ''
            });
        }

        fetchRatingCards();
    }, [template]);

    const fetchRatingCards = async () => {
        try {
            const data = await ratingCardService.getRatingCards();
            setRatingCards(data);
        } catch (error) {
            console.error('Erreur lors du chargement des fiches d\'évaluation:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSelectDuration = (duration) => {
        setFormData({
            ...formData,
            duration
        });
        setShowDurationDropdown(false);
    };

    const handleSelectType = (type) => {
        setFormData({
            ...formData,
            type
        });
        setShowTypeDropdown(false);
    };

    const handleSelectRatingCard = (card) => {
        setFormData({
            ...formData,
            ratingCardId: card.id
        });
        setShowRatingCardDropdown(false);
    };

    const handleTextFormat = (format) => {
        // Cette fonction serait étendue pour un éditeur de texte riche réel
        // Pour l'instant, c'est juste un placeholder
        console.log(`Format: ${format}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    // Pour fermer les dropdowns en cliquant ailleurs
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDurationDropdown || showTypeDropdown || showRatingCardDropdown) {
                setShowDurationDropdown(false);
                setShowTypeDropdown(false);
                setShowRatingCardDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDurationDropdown, showTypeDropdown, showRatingCardDropdown]);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">
                        {template ? 'Modifier le template d\'entretien' : 'Ajouter un template d\'entretien'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nom du template
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nom du template"
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Titre de l'entretien
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Titre de l'entretien"
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Durée de l'entretien
                            </label>
                            <div
                                className="w-full p-2 border border-slate-300 rounded-md flex justify-between items-center cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDurationDropdown(!showDurationDropdown);
                                    setShowTypeDropdown(false);
                                    setShowRatingCardDropdown(false);
                                }}
                            >
                                <span>{formData.duration}</span>
                                <ChevronDown size={16} />
                            </div>

                            {showDurationDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg">
                                    {durationOptions.map((option) => (
                                        <div
                                            key={option}
                                            className="p-2 hover:bg-slate-100 cursor-pointer"
                                            onClick={() => handleSelectDuration(option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Type d'entretien
                            </label>
                            <div
                                className="w-full p-2 border border-slate-300 rounded-md flex justify-between items-center cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowTypeDropdown(!showTypeDropdown);
                                    setShowDurationDropdown(false);
                                    setShowRatingCardDropdown(false);
                                }}
                            >
                                <span>{formData.type}</span>
                                <ChevronDown size={16} />
                            </div>

                            {showTypeDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg">
                                    {typeOptions.map((option) => (
                                        <div
                                            key={option}
                                            className="p-2 hover:bg-slate-100 cursor-pointer"
                                            onClick={() => handleSelectType(option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Contenu
                        </label>
                        <div className="border border-slate-300 rounded-md overflow-hidden">
                            <div className="flex p-2 border-b border-slate-200 bg-slate-50">
                                <button
                                    type="button"
                                    className="p-1 text-slate-500 hover:bg-slate-200 rounded"
                                    onClick={() => handleTextFormat('bold')}
                                >
                                    <Bold size={16} />
                                </button>
                                <button
                                    type="button"
                                    className="p-1 text-slate-500 hover:bg-slate-200 rounded ml-1"
                                    onClick={() => handleTextFormat('italic')}
                                >
                                    <Italic size={16} />
                                </button>
                                <button
                                    type="button"
                                    className="p-1 text-slate-500 hover:bg-slate-200 rounded ml-1"
                                    onClick={() => handleTextFormat('strikethrough')}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <line x1="9" y1="8" x2="9" y2="6" />
                                        <line x1="15" y1="16" x2="15" y2="18" />
                                        <path d="M9 6l3-3 3 3" />
                                        <path d="M9 18l3 3 3-3" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    className="p-1 text-slate-500 hover:bg-slate-200 rounded ml-1"
                                    onClick={() => handleTextFormat('bullet')}
                                >
                                    <List size={16} />
                                </button>
                                <button
                                    type="button"
                                    className="p-1 text-slate-500 hover:bg-slate-200 rounded ml-1"
                                    onClick={() => handleTextFormat('number')}
                                >
                                    <ListOrdered size={16} />
                                </button>
                                <button
                                    type="button"
                                    className="p-1 text-slate-500 hover:bg-slate-200 rounded ml-1"
                                    onClick={() => handleTextFormat('link')}
                                >
                                    <Link size={16} />
                                </button>
                            </div>

                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Décrivez le déroulement de l'entretien, les questions à poser, les points à aborder..."
                                className="w-full p-3 border-none focus:ring-0 min-h-[200px]"
                            />
                        </div>
                    </div>

                    <div className="mb-6 relative">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Fiche d'évaluation pour l'entretien
                        </label>
                        <div
                            className="w-full p-2 border border-slate-300 rounded-md flex justify-between items-center cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowRatingCardDropdown(!showRatingCardDropdown);
                                setShowDurationDropdown(false);
                                setShowTypeDropdown(false);
                            }}
                        >
              <span>
                {formData.ratingCardId
                    ? ratingCards.find(c => c.id === formData.ratingCardId)?.name || "Fiche d'évaluation par défaut"
                    : "Sélectionner une fiche d'évaluation"
                }
              </span>
                            <ChevronDown size={16} />
                        </div>

                        {showRatingCardDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                <div
                                    className="p-2 hover:bg-slate-100 cursor-pointer"
                                    onClick={() => handleSelectRatingCard({ id: '', name: "Fiche d'évaluation par défaut" })}
                                >
                                    Fiche d'évaluation par défaut
                                </div>
                                {ratingCards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="p-2 hover:bg-slate-100 cursor-pointer"
                                        onClick={() => handleSelectRatingCard(card)}
                                    >
                                        {card.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 mr-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MeetingTemplateForm;