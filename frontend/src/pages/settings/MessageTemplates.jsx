import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Link as LinkIcon, Bold, Italic, List, AlignLeft } from 'lucide-react';
import { messageTemplateService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MessageTemplates = () => {
    const [templates, setTemplates] = useState({
        required: [],
        custom: []
    });
    const [loading, setLoading] = useState(true);
    const [showAddTemplate, setShowAddTemplate] = useState(false);
    const [showEditTemplate, setShowEditTemplate] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [templateForm, setTemplateForm] = useState({
        id: null,
        name: '',
        subject: '',
        content: ''
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await messageTemplateService.getMessageTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('Erreur lors du chargement des templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTemplate = () => {
        setTemplateForm({
            id: null,
            name: '',
            subject: '',
            content: ''
        });
        setShowAddTemplate(true);
    };

    const handleEditTemplate = (template) => {
        setCurrentTemplate(template);
        setTemplateForm({
            id: template.id,
            name: template.name,
            subject: template.subject,
            content: template.content
        });
        setShowEditTemplate(true);
    };

    const handleDeleteTemplate = (template) => {
        setCurrentTemplate(template);
        setShowDeleteConfirmation(true);
    };

    const confirmDeleteTemplate = async () => {
        if (!currentTemplate) return;

        try {
            await messageTemplateService.deleteMessageTemplate(currentTemplate.id);
            await fetchTemplates();
            setShowDeleteConfirmation(false);
            setCurrentTemplate(null);
        } catch (error) {
            console.error("Erreur lors de la suppression du template:", error);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setTemplateForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveTemplate = async () => {
        try {
            if (showAddTemplate) {
                await messageTemplateService.createMessageTemplate(templateForm);
            } else if (showEditTemplate) {
                await messageTemplateService.updateMessageTemplate(templateForm.id, templateForm);
            }

            await fetchTemplates();
            setShowAddTemplate(false);
            setShowEditTemplate(false);
        } catch (error) {
            console.error("Erreur lors de l'enregistrement du template:", error);
        }
    };

    const closeModal = () => {
        setShowAddTemplate(false);
        setShowEditTemplate(false);
        setShowDeleteConfirmation(false);
        setCurrentTemplate(null);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Templates de Messages</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Les templates de messages vous aident à gagner du temps lors de la communication avec les candidats.
                        <br />
                        Les variables sont entourées de doubles accolades, par ex. &#123;&#123;nom&#125;&#125;
                    </p>
                </div>
                <button
                    onClick={handleAddTemplate}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center"
                >
                    <Plus size={18} className="mr-2" />
                    Ajouter Template
                </button>
            </div>

            {/* Templates requis */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Templates Requis</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Ces templates sont utilisés pour les nouveaux candidats et lors de la disqualification des candidats.
                </p>

                <div className="space-y-4">
                    {templates.required.map(template => (
                        <div
                            key={template.id}
                            className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-medium text-slate-800">{template.name}</h4>
                                <button
                                    onClick={() => handleEditTemplate(template)}
                                    className="p-1 text-slate-400 hover:text-blue-600 rounded"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>
                            <p className="text-sm text-slate-500">{template.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Templates personnalisés */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Templates Personnalisés</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Ces templates peuvent être utilisés pour tout type de communication avec les candidats.
                </p>

                <div className="space-y-4">
                    {templates.custom.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">
                            Aucun template personnalisé n'a été créé. Cliquez sur "Ajouter Template" pour commencer.
                        </p>
                    ) : (
                        templates.custom.map(template => (
                            <div
                                key={template.id}
                                className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-medium text-slate-800">{template.name}</h4>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditTemplate(template)}
                                            className="p-1 text-slate-400 hover:text-blue-600 rounded"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTemplate(template)}
                                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal pour ajouter un template */}
            {showAddTemplate && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Ajouter un Template de Message</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Nom du Template <span className="text-xs text-blue-600">Obligatoire</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nom du template"
                                value={templateForm.name}
                                onChange={handleFormChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Sujet
                            </label>
                            <input
                                type="text"
                                name="subject"
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Sujet du message"
                                value={templateForm.subject}
                                onChange={handleFormChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Contenu
                            </label>
                            <div className="border border-slate-300 rounded-md overflow-hidden">
                                <div className="flex border-b border-slate-300 p-2 bg-slate-50">
                                    <button className="p-1 text-slate-500 hover:text-slate-700 mr-1">
                                        <Bold size={16} />
                                    </button>
                                    <button className="p-1 text-slate-500 hover:text-slate-700 mr-1">
                                        <Italic size={16} />
                                    </button>
                                    <button className="p-1 text-slate-500 hover:text-slate-700 mr-1">
                                        <List size={16} />
                                    </button>
                                    <button className="p-1 text-slate-500 hover:text-slate-700 mr-1">
                                        <AlignLeft size={16} />
                                    </button>
                                    <button className="p-1 text-slate-500 hover:text-slate-700">
                                        <LinkIcon size={16} />
                                    </button>
                                </div>
                                <textarea
                                    name="content"
                                    rows="8"
                                    className="w-full p-3 border-none focus:ring-0"
                                    placeholder="Écrivez votre message ici..."
                                    value={templateForm.content}
                                    onChange={handleFormChange}
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg mr-2"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSaveTemplate}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal pour éditer un template */}
            {showEditTemplate && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Modifier le Template</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Nom du Template <span className="text-xs text-blue-600">Obligatoire</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={templateForm.name}
                                onChange={handleFormChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Sujet
                            </label>
                            <input
                                type="text"
                                name="subject"
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={templateForm.subject}
                                onChange={handleFormChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Contenu
                            </label>
                            <div className="border border-slate-300 rounded-md overflow-hidden">
                                <div className="flex border-b border-slate-300 p-2 bg-slate-50">
                                    <button className="p-1 text-slate-500 hover:text-slate-700 mr-1">
                                        <Bold size={16} />
                                    </button>
                                    <button className="p-1 text-slate-500 hover:text-slate-700 mr-1">
                                        <Italic size={16} />
                                    </button>
                                    <button className="p-1 text-slate-500 hover:text-slate-700 mr-1">
                                        <List size={16} />
                                    </button>
                                    <button className="p-1 text-slate-500 hover:text-slate-700 mr-1">
                                        <AlignLeft size={16} />
                                    </button>
                                    <button className="p-1 text-slate-500 hover:text-slate-700">
                                        <LinkIcon size={16} />
                                    </button>
                                </div>
                                <textarea
                                    name="content"
                                    rows="8"
                                    className="w-full p-3 border-none focus:ring-0"
                                    value={templateForm.content}
                                    onChange={handleFormChange}
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg mr-2"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSaveTemplate}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                            >
                                Enregistrer les modifications
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de suppression */}
            {showDeleteConfirmation && currentTemplate && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <div className="flex justify-center mb-4 text-slate-600">
                            <Trash2 size={48} />
                        </div>
                        <h3 className="text-lg font-bold text-center text-slate-800 mb-2">Supprimer ce template ?</h3>
                        <p className="text-center text-slate-600 mb-6">
                            Vous êtes sur le point de supprimer "{currentTemplate.name}".
                        </p>

                        <div className="flex justify-center">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg mr-2"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDeleteTemplate}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                            >
                                Continuer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageTemplates;