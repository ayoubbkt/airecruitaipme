import React, { useState, useEffect } from 'react';
import { Star, Plus, ChevronRight, Calendar, MessageCircle, X } from 'lucide-react';
import { cvService, jobService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useParams } from 'react-router-dom';

const CandidateKanbanView = () => {
    const { jobId } = useParams();
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState([]);
    const [job, setJob] = useState(null);
    const [stages, setStages] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch job details
                if (jobId) {
                    const jobData = await jobService.getJobById(jobId);
                    setJob(jobData);
                }

                // Fetch workflow stages
                const workflowId = jobId ? jobId : 'default';
                const stagesData = await jobService.getWorkflowStages(workflowId);
                setStages(stagesData);

                // Fetch candidates
                const candidatesData = await cvService.getCandidatesByJob(jobId);
                setCandidates(candidatesData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [jobId]);

    // Function to get the count of candidates in a stage
    const getCandidateCountByStage = (stageId) => {
        return candidates.filter(candidate => candidate.stage === stageId).length;
    };

    // Function to get the candidates by stage
    const getCandidatesByStage = (stageId) => {
        return candidates.filter(candidate => candidate.stage === stageId);
    };

    // Function to handle dragging candidates between stages
    const handleDragStart = (e, candidateId) => {
        e.dataTransfer.setData('candidateId', candidateId);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, targetStageId) => {
        e.preventDefault();
        const candidateId = e.dataTransfer.getData('candidateId');

        try {
            // Find the candidate to update
            const candidateToUpdate = candidates.find(c => c.id === candidateId);
            if (!candidateToUpdate || candidateToUpdate.stage === targetStageId) return;

            // Update the candidate's stage
            await cvService.updateCandidateStage(candidateId, targetStageId);

            // Update local state
            setCandidates(prevCandidates =>
                prevCandidates.map(c =>
                    c.id === candidateId ? { ...c, stage: targetStageId } : c
                )
            );
        } catch (error) {
            console.error('Error updating candidate stage:', error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-slate-800">
                    {job ? job.title : 'Tableau Kanban des candidats'}
                </h1>
                <div className="flex items-center space-x-2">
                    {job && (
                        <>
                            <div className="text-sm text-gray-600">
                                {job.isPublished ? 'Publiée sur votre page d\'emploi' : 'Non publiée'}
                            </div>
                            <div className="bg-gray-100 text-gray-700 rounded-md px-2 py-1 text-xs">
                                {job.department || 'Département non spécifié'}
                            </div>
                            <div className="bg-gray-100 text-gray-700 rounded-md px-2 py-1 text-xs">
                                {job.location || 'Emplacement non spécifié'}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex overflow-x-auto space-x-4 pb-4" style={{ minHeight: '70vh' }}>
                {stages.map(stage => (
                    <div
                        key={stage.id}
                        className="flex-shrink-0 w-64"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage.id)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-gray-700">
                                {stage.name} <span className="text-gray-400 text-sm">{getCandidateCountByStage(stage.id)}</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg px-3 py-2 min-h-full">
                            {getCandidatesByStage(stage.id).map(candidate => (
                                <div
                                    key={candidate.id}
                                    className="bg-white rounded-lg shadow-sm mb-3 p-3 cursor-pointer hover:shadow-md transition-shadow"
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(e, candidate.id)}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 ${candidate.avatarColor || 'bg-blue-400'} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                                            {candidate.firstName?.charAt(0)}{candidate.lastName?.charAt(0)}
                                        </div>
                                        <div className="ml-2 text-sm font-medium">
                                            {candidate.firstName} {candidate.lastName}
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center text-xs text-gray-500">
                                        <div className="flex-1">
                                            {candidate.hours && <span>dans cette étape depuis {candidate.hours} heures</span>}
                                            {candidate.days && <span>dans cette étape depuis {candidate.days} jours</span>}
                                            {!candidate.hours && !candidate.days && <span>ajouté récemment</span>}
                                        </div>
                                    </div>

                                    {candidate.status && (
                                        <div className="mt-2">
                                            {candidate.status === 'waiting_on_feedback' && (
                                                <div className="bg-orange-100 text-orange-700 rounded-md px-2 py-1 text-xs flex items-center justify-center">
                                                    <span>En attente de retour</span>
                                                </div>
                                            )}
                                            {candidate.status === 'needs_scheduling' && (
                                                <div className="bg-blue-50 text-blue-700 rounded-md px-2 py-1 text-xs flex items-center justify-center">
                                                    <Calendar size={12} className="mr-1" />
                                                    <span>À planifier</span>
                                                </div>
                                            )}
                                            {candidate.status === 'feedback_received' && (
                                                <div className="bg-green-100 text-green-700 rounded-md px-2 py-1 text-xs flex items-center justify-center">
                                                    <span>Retour reçu</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {candidate.rating && (
                                        <div className="mt-2 flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    className={i < Math.floor(candidate.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                                                />
                                            ))}
                                            <span className="ml-1 text-xs text-gray-500">{candidate.rating}</span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {getCandidatesByStage(stage.id).length === 0 && (
                                <div className="flex justify-center">
                                    <button className="flex items-center justify-center mt-2 text-sm text-gray-500 w-full h-16 border-2 border-dashed border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                                        <Plus size={16} className="mr-1" />
                                        Étape vide
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CandidateKanbanView;