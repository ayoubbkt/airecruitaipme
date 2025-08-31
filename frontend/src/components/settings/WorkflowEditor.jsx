import React, { useState, useEffect } from 'react';
import { Edit2, X, Plus, ChevronDown, UserPlus,FileText, Calendar } from 'lucide-react';
import { workflowService } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const WorkflowEditor = ({ workflow, companyId, onWorkflowUpdate }) => {
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingStage, setEditingStage] = useState(null);
    const [addingStage, setAddingStage] = useState(false);
    const [workflowName, setWorkflowName] = useState(workflow?.name || '');
    const [stageForm, setStageForm] = useState({
      name: '',
      type: '',
      visible: true,
    });
    const [error, setError] = useState(null); // Ajout pour afficher les erreurs à l'utilisateur
  
    useEffect(() => {
      if (companyId && workflow?.id) {
        setWorkflowName(workflow.name); // Initialiser workflowName
        fetchStages();
      }
    }, [workflow, companyId]);
  
    const fetchStages = async () => {
      try {
        setLoading(true);
        setError(null);
        const stagesData = await workflowService.getWorkflowStages(companyId, workflow.id);
        setStages(stagesData);
      } catch (error) {
        console.error('Error fetching stages:', error);
        setError('Failed to load stages. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    const handleWorkflowNameChange = async () => {
      if (!workflowName.trim() || workflowName.trim() === workflow.name) return;
  
      try {
        setError(null);
        const updatedWorkflow = await workflowService.updateWorkflow(companyId, workflow.id, {
          name: workflowName,
        });
        if (onWorkflowUpdate) {
          onWorkflowUpdate(updatedWorkflow);
        }
      } catch (error) {
        console.error('Error updating workflow name:', error);
        setError('Failed to update workflow name.');
        setWorkflowName(workflow.name); // Réinitialiser en cas d'erreur
      }
    };
  
    const handleAddStage = () => {
      setAddingStage(true);
      setStageForm({
        name: '',
        type: '',
        visible: true,
      });
    };
  
    const handleEditStage = (stage) => {
      setEditingStage(stage.id);
      setStageForm({
        name: stage.name,
        type: stage.type?.toLowerCase() || '', // Convertir en minuscule pour le formulaire
        visible: stage.visible !== false,
      });
    };
  
    const handleCancelStageEdit = () => {
      setEditingStage(null);
      setAddingStage(false);
      setError(null);
    };
  
    const handleStageFormChange = (e) => {
      const { name, value, type, checked } = e.target;
      setStageForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    };
  
    const handleSaveStage = async () => {
        if (!stageForm.name.trim() || !stageForm.type) {
          setError('Nom et type d’étape requis.');
          return;
        }
      
        try {
          setError(null);
          const stageData = {
            name: stageForm.name,
            type: stageForm.type.toUpperCase(),
            settings: { visible: stageForm.visible },
          };
          console.log('Saving stage with data:', stageData); // Débogage
      
          if (editingStage) {
            const updatedStage = await workflowService.updateWorkflowStage(
              companyId,
              workflow.id,
              editingStage,
              stageData
            );
            console.log('Updated stage:', updatedStage); // Débogage
            if (!updatedStage) {
              throw new Error('Aucune donnée reçue du serveur pour la mise à jour.');
            }
            const completeStage = {
              ...updatedStage,
              type: updatedStage.type || stageForm.type.toUpperCase(),
              settings: { ...updatedStage.settings, visible: stageForm.visible } || { visible: stageForm.visible },
            };
            setStages(stages.map((s) => (s.id === editingStage ? completeStage : s)));
            setEditingStage(null);
          } else if (addingStage) {
            const newStage = await workflowService.createWorkflowStage(companyId, workflow.id, {
              ...stageData,
              order: stages.length,
            });
            console.log('New stage:', newStage); // Débogage
            if (!newStage) {
              throw new Error('Aucune donnée reçue du serveur pour la création.');
            }
            const completeStage = {
              ...newStage,
              type: newStage.type || stageForm.type.toUpperCase(),
              settings: { ...newStage.settings, visible: stageForm.visible } || { visible: stageForm.visible },
            };
            setStages([...stages, completeStage]);
            setAddingStage(false);
          }
        } catch (error) {
          console.error('Error saving stage:', error);
          setError(`Échec : ${error.message}`);
        }
      };
  
    const handleDeleteStage = async (stageId) => {
      if (!window.confirm('Are you sure you want to delete this stage?')) return;
  
      try {
        setError(null);
        await workflowService.deleteWorkflowStage(companyId, workflow.id, stageId);
        setStages(stages.filter((s) => s.id !== stageId));
      } catch (error) {
        console.error('Error deleting stage:', error);
        setError('Failed to delete stage.');
      }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    // Get icons for different stage types
    const getStageTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'lead':
                return <UserPlus size={16} className="text-slate-500" />;
            case 'applied':
                return <FileText size={16} className="text-slate-500" />;
            case 'review':
                return <Edit2 size={16} className="text-slate-500" />;
            case 'interview':
                return <UserPlus size={16} className="text-slate-500" />;
            default:
                return <FileText size={16} className="text-slate-500" />;
        }
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{workflow.name}</h2>

            {/* Workflow name */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Workflow name <span className="text-xs text-blue-600">Required</span>
                </label>
                <input
                    type="text"
                    className="w-full max-w-md p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    onBlur={handleWorkflowNameChange}
                />
            </div>

            {/* Stages list */}
            <div className="space-y-4">
                {stages.map(stage => (
                    <div key={stage.id} className="border rounded-lg">
                        <div className="p-4 flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="mr-3">
                                    {getStageTypeIcon(stage.type)}
                                </div>
                                <div>
                                    <h3 className="font-medium text-slate-800">{stage.name}</h3>
                                    <div className="flex text-xs text-slate-500 mt-1">
                                        <span className="mr-4">Due: {stage.dueDays || 3} days</span>
                                        <span>Type: {stage.type || "Not set"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex">
                                <button
                                    onClick={() => handleEditStage(stage)}
                                    className="p-2 text-slate-400 hover:text-slate-600 rounded"
                                >
                                    <Edit2 size={16} />
                                </button>
                                {/* Don't allow deletion of "Leads" or initial stage */}
                                {stage.type !== 'lead' && stage.name !== 'Leads' && (
                                    <button
                                        onClick={() => handleDeleteStage(stage.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 rounded"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stage editing form */}
                        {editingStage === stage.id && (
                            <div className="p-4 border-t bg-slate-50">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Stage Name <span className="text-xs text-blue-600">Required</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="w-full p-2 border border-slate-300 rounded-md"
                                            value={stageForm.name}
                                            onChange={handleStageFormChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Stage Visibility
                                        </label>
                                        <div className="flex items-center mt-2">
                                            <input
                                                type="checkbox"
                                                id={`visibility-${stage.id}`}
                                                name="visible"
                                                className="h-4 w-4 text-blue-600 rounded"
                                                checked={stageForm.visible}
                                                onChange={handleStageFormChange}
                                            />
                                            <label htmlFor={`visibility-${stage.id}`} className="ml-2 text-sm text-slate-700">
                                                Visible to all job members
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Stage Type <span className="text-xs text-blue-600">Required</span>
                                        </label>
                                        <p className="text-xs text-slate-500 mb-1">The primary focus of this stage.</p>
                                        <div className="relative">
                                            <select
                                                name="type"
                                                className="w-full p-2 pr-8 border border-slate-300 rounded-md appearance-none"
                                                value={stageForm.type}
                                                onChange={handleStageFormChange}
                                            >
                                                <option value="">Choose stage type</option>
                                                <option value="leads">Leads</option>
                                                <option value="applied">Candidature</option>
                                                <option value="ai_screening">Screening AI</option>
                                                <option value="review">Revue</option>
                                                <option value="interview">Entretien</option>
                                                <option value="background_check">Vérification des antécédents</option>
                                                <option value="offer">Offre</option>
                                                <option value="hired">Embauché</option>
                                                <option value="disqualified">Rejeté</option> {/* Remplacer 'rejected' par 'disqualified' */}
                                                <option value="archived">Archivé</option>
                                                <option value="other">Autre</option>
                                            </select>
                                            <div className="absolute right-3 top-2.5 pointer-events-none">
                                                <ChevronDown size={16} className="text-slate-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Due date
                                        </label>
                                        <p className="text-xs text-slate-500 mb-1">Maximum time a candidate should be in this stage.</p>
                                        <div className="relative">
                                            <select
                                                name="dueDays"
                                                className="w-full p-2 pr-8 border border-slate-300 rounded-md appearance-none"
                                                value={stageForm.dueDays}
                                                onChange={handleStageFormChange}
                                            >
                                                <option value="1">1 day</option>
                                                <option value="2">2 days</option>
                                                <option value="3">3 days</option>
                                                <option value="7">7 days</option>
                                                <option value="14">14 days</option>
                                                <option value="30">30 days</option>
                                            </select>
                                            <div className="absolute right-3 top-2.5 pointer-events-none">
                                                <ChevronDown size={16} className="text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={handleCancelStageEdit}
                                        className="px-3 py-2 mr-2 text-slate-600 border border-slate-300 rounded hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveStage}
                                        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Add stage form */}
                {addingStage && (
                    <div className="border rounded-lg p-4 bg-slate-50">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Stage Name <span className="text-xs text-blue-600">Required</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className="w-full p-2 border border-slate-300 rounded-md"
                                    value={stageForm.name}
                                    onChange={handleStageFormChange}
                                    placeholder="Stage name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Stage Visibility
                                </label>
                                <div className="flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        id="visibility-new"
                                        name="visible"
                                        className="h-4 w-4 text-blue-600 rounded"
                                        checked={stageForm.visible}
                                        onChange={handleStageFormChange}
                                    />
                                    <label htmlFor="visibility-new" className="ml-2 text-sm text-slate-700">
                                        Visible to all job members
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Stage Type <span className="text-xs text-blue-600">Required</span>
                                </label>
                                <p className="text-xs text-slate-500 mb-1">The primary focus of this stage.</p>
                                <div className="relative">
                                    <select
                                        name="type"
                                        className="w-full p-2 pr-8 border border-slate-300 rounded-md appearance-none"
                                        value={stageForm.type}
                                        onChange={handleStageFormChange}
                                    >
                                        <option value="">Choose stage type</option>
                                        <option value="leads">Leads</option>
                                        <option value="applied">Candidature</option>
                                        <option value="ai_screening">Screening AI</option>
                                        <option value="review">Revue</option>
                                        <option value="interview">Entretien</option>
                                        <option value="background_check">Vérification des antécédents</option>
                                        <option value="offer">Offre</option>
                                        <option value="hired">Embauché</option>
                                        <option value="disqualified">Rejeté</option> {/* Remplacer 'rejected' par 'disqualified' */}
                                        <option value="archived">Archivé</option>
                                        <option value="other">Autre</option>
                                    </select>
                                    <div className="absolute right-3 top-2.5 pointer-events-none">
                                        <ChevronDown size={16} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Due date
                                </label>
                                <p className="text-xs text-slate-500 mb-1">Maximum time a candidate should be in this stage.</p>
                                <div className="relative">
                                    <select
                                        name="dueDays"
                                        className="w-full p-2 pr-8 border border-slate-300 rounded-md appearance-none"
                                        value={stageForm.dueDays}
                                        onChange={handleStageFormChange}
                                    >
                                        <option value="1">1 day</option>
                                        <option value="2">2 days</option>
                                        <option value="3">3 days</option>
                                        <option value="7">7 days</option>
                                        <option value="14">14 days</option>
                                        <option value="30">30 days</option>
                                    </select>
                                    <div className="absolute right-3 top-2.5 pointer-events-none">
                                        <ChevronDown size={16} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleCancelStageEdit}
                                className="px-3 py-2 mr-2 text-slate-600 border border-slate-300 rounded hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveStage}
                                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Add Stage
                            </button>
                        </div>
                    </div>
                )}

                {/* Add Stage button */}
                {!addingStage && (
                    <button
                        onClick={handleAddStage}
                        className="flex items-center justify-center w-full p-3 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-slate-400 hover:text-slate-700"
                    >
                        <Plus size={16} className="mr-2" />
                        <span>Add Stage</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default WorkflowEditor;