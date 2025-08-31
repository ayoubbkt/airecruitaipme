import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Plus } from 'lucide-react';
import WorkflowEditor from '../../components/settings/WorkflowEditor';
import { workflowService } from '../../services/api';
import axios from '../../utils/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RecruitingWorkflows = () => {
    const [workflows, setWorkflows] = useState([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creatingWorkflow, setCreatingWorkflow] = useState(false);
    const [newWorkflowName, setNewWorkflowName] = useState('');
    const [companyId, setCompanyId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchCompanyId = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setErrorMessage('Utilisateur non authentifié. Veuillez vous connecter.');
                    return;
                }

                const response = await axios.get('/companies/my-companies');
                const data = response.data;

                if (data.data && data.data.length > 0) {
                    const validCompanyId = data.data[0].id;
                    console.log('Fetched companyId:', validCompanyId); // Débogage
                    setCompanyId(validCompanyId);
                } else {
                    setErrorMessage('Aucune entreprise trouvée. Veuillez créer une entreprise.');
                }
            } catch (error) {
                console.error('Error fetching companies:', error);
                if (error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response data:', error.response.data);
                    setErrorMessage(
                        `Erreur ${error.response.status}: ${error.response.data.message || 'Route non trouvée.'}`
                    );
                } else if (error.request) {
                    setErrorMessage('Le serveur est inaccessible. Vérifiez votre connexion.');
                } else {
                    setErrorMessage('Erreur lors de la configuration de la requête.');
                }
            }
        };

        fetchCompanyId();
        if (companyId) {
            fetchWorkflows();
        }
    }, [companyId]);

    const fetchWorkflows = async () => {
        if (!companyId) return;
        try {
            setLoading(true);
            const data = await workflowService.getWorkflows(companyId);
            setWorkflows(data);
            if (data.length > 0) {
                setSelectedWorkflow(data[0]);
            }
        } catch (error) {
            console.error('Error fetching workflows:', error);
            if (error.response && error.response.status === 404) {
                setErrorMessage('La route des workflows n\'existe pas ou l\'ID est invalide.');
            } else {
                setErrorMessage('Erreur lors de la récupération des workflows.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddWorkflow = async () => {
        if (creatingWorkflow) {
            try {
                if (!newWorkflowName.trim()) {
                    setErrorMessage('Le nom du workflow est requis.');
                    return;
                }
                if (!companyId) {
                    setErrorMessage('Aucune entreprise sélectionnée.');
                    return;
                }

                console.log('Creating workflow with companyId:', companyId, 'name:', newWorkflowName); // Débogage
                const newWorkflow = await workflowService.createWorkflow(companyId, {
                    name: newWorkflowName,
                });

                setWorkflows([...workflows, newWorkflow]);
                setSelectedWorkflow(newWorkflow);
                setCreatingWorkflow(false);
                setNewWorkflowName('');
                setErrorMessage('');
            } catch (error) {
                console.error('Error creating workflow:', error);
                if (error.response && error.response.status === 404) {
                    setErrorMessage('La route de création de workflow n\'existe pas.');
                } else {
                    setErrorMessage(error.message || 'Erreur lors de la création du workflow.');
                }
            }
        } else {
            setCreatingWorkflow(true);
        }
    };

    const handleWorkflowUpdate = (updatedWorkflow) => {
        setWorkflows(workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
        setSelectedWorkflow(updatedWorkflow);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex h-full">
            <div className="w-1/3 pr-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-slate-800">Workflows</h2>
                        <button
                            onClick={handleAddWorkflow}
                            className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                            disabled={!companyId}
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    {errorMessage && (
                        <div className="mb-4 text-red-600 text-sm">{errorMessage}</div>
                    )}
                    <p className="text-sm text-slate-500 mb-4">Create & customize hiring workflows.</p>

                    {creatingWorkflow && (
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Enter workflow name"
                                className="w-full p-2 border border-slate-300 rounded-md"
                                value={newWorkflowName}
                                onChange={(e) => setNewWorkflowName(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={() => {
                                        setCreatingWorkflow(false);
                                        setNewWorkflowName('');
                                        setErrorMessage('');
                                    }}
                                    className="px-3 py-1 mr-2 text-slate-600 hover:bg-slate-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddWorkflow}
                                    className="px-3 py-1 bg-blue-600 text-white rounded"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {workflows.map(workflow => (
                            <div
                                key={workflow.id}
                                className={`p-3 rounded-lg border cursor-pointer ${
                                    selectedWorkflow?.id === workflow.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 hover:bg-slate-50'
                                }`}
                                onClick={() => setSelectedWorkflow(workflow)}
                            >
                                <h4 className="text-blue-600 font-medium text-sm mb-1">{workflow.name}</h4>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        <span>{workflow.stages?.length || 0} Stages</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>Added {new Date(workflow.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-2/3 pl-4">
            {companyId && selectedWorkflow ? (
                    <WorkflowEditor
                        workflow={selectedWorkflow}
                        companyId={companyId}
                        onWorkflowUpdate={handleWorkflowUpdate}
                    />
                ) : (
                    <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col items-center justify-center h-64">
                        <FileText size={48} className="text-slate-300 mb-4" />
                        <p className="text-slate-500">Select a workflow to edit or create a new one</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruitingWorkflows;