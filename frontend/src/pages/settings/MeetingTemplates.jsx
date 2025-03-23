import React, { useState, useEffect } from 'react';
import { Edit2, Plus } from 'lucide-react';
import { meetingTemplateService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MeetingTemplateForm from '../../components/settings/MeetingTemplateForm';

const MeetingTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await meetingTemplateService.getMeetingTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('Erreur lors du chargement des templates d\'entretien:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTemplate = () => {
        setEditingTemplate(null);
        setShowAddModal(true);
    };

    const handleEditTemplate = (template) => {
        setEditingTemplate(template);
        setShowAddModal(true);
    };

    const handleSaveTemplate = async (templateData) => {
        try {
            setLoading(true);

            if (editingTemplate) {
                // Mise à jour d'un template existant
                const updatedTemplate = await meetingTemplateService.updateMeetingTemplate(
                    editingTemplate.id,
                    templateData
                );

                setTemplates(templates.map(t =>
                    t.id === updatedTemplate.id ? updatedTemplate : t
                ));
            } else {
                // Création d'un nouveau template
                const newTemplate = await meetingTemplateService.createMeetingTemplate(templateData);
                setTemplates([...templates, newTemplate]);
            }

            setShowAddModal(false);
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du template:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingTemplate(null);
    };

    if (loading && templates.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Templates d'entretien</h2>
                    <p className="text-slate-500">Les templates d'entretien peuvent être ajoutés à n'importe quelle offre avec une étape d'entretien et définissent la structure de la réunion.</p>
                </div>
                <button
                    onClick={handleAddTemplate}
                    className="px-3 py-2 bg-green-500 text-white rounded-md flex items-center hover:bg-green-600"
                >
                    <Plus size={18} className="mr-1" />
                    <span>Ajouter Template</span>
                </button>
            </div>

            <div className="space-y-4 mt-6">
                {templates.map(template => (
                    <div
                        key={template.id}
                        className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-slate-800">{template.name}</h3>
                                <p className="text-sm text-slate-500 mt-1">{template.isDefault ? 'Utilisé par défaut si vous n\'avez pas spécifié de template d\'entretien personnalisé.' : ''}</p>
                            </div>
                            <button
                                onClick={() => handleEditTemplate(template)}
                                className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100"
                            >
                                <Edit2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                        <p className="text-slate-500">Vous n'avez pas encore créé de template d'entretien.</p>
                        <button
                            onClick={handleAddTemplate}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Créer votre premier template
                        </button>
                    </div>
                )}
            </div>

            {/* Modal pour ajouter/modifier un template */}
            {showAddModal && (
                <MeetingTemplateForm
                    template={editingTemplate}
                    onSave={handleSaveTemplate}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default MeetingTemplates;