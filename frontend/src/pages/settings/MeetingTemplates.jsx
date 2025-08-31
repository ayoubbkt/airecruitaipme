import React, { useState, useEffect } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { meetingTemplateService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MeetingTemplateForm from '../../components/settings/MeetingTemplateForm';
import { useAuth } from '../../contexts/AuthContext';

const MeetingTemplates = () => {
  const { companyId } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await meetingTemplateService.getMeetingTemplates(companyId);
      setTemplates(data);
    } catch (error) {
      console.error('Erreur lors du chargement des templates d\'entretien:', error);
      setError('Erreur lors du chargement des templates.');
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
        const updatedTemplate = await meetingTemplateService.updateMeetingTemplate(
          companyId,
          editingTemplate.id,
          templateData
        );
        setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
      } else {
        const newTemplate = await meetingTemplateService.createMeetingTemplate(companyId, templateData);
        setTemplates([...templates, newTemplate]);
      }
      setShowAddModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du template:', error);
      setError('Erreur lors de l\'enregistrement du template.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await meetingTemplateService.deleteMeetingTemplate(companyId, id);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression du template:', err);
      setError('Erreur lors de la suppression du template.');
    }
  };

  if (loading && templates.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Templates d'entretien</h2>
          <p className="text-sm text-gray-500 mt-1">Gérez vos templates d'entretien pour structurer vos réunions avec les candidats.</p>
        </div>
        <button
          onClick={handleAddTemplate}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Ajouter un template
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">{error}</div>
      )}

      <div className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <h3 className="text-lg font-medium text-gray-800">{template.name}</h3>
              <p className="text-sm text-gray-500">
                {template.isDefault ? 'Template par défaut' : 'Template personnalisé'}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditTemplate(template)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                title="Modifier"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDeleteTemplate(template.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {templates.length === 0 && !loading && (
          <div className="p-6 bg-gray-50 text-center rounded-lg shadow-sm">
            <p className="text-gray-500">Aucun template d'entretien disponible.</p>
            <button
              onClick={handleAddTemplate}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Créer votre premier template
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <MeetingTemplateForm
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={handleCloseModal}
          companyId={companyId}
        />
      )}
    </div>
  );
};

export default MeetingTemplates;