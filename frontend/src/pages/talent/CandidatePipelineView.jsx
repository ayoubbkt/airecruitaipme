import React, { useState, useEffect } from 'react';
import { X, Check, Star, Calendar, MessageCircle } from 'lucide-react';
import { cvService, jobService } from '../../services/api';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CandidatePipelineView = () => {
    const { jobId } = useParams();
    const [candidates, setCandidates] = useState([]);
    const [selectedStage, setSelectedStage] = useState('all');
    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState(null);
    const [stages, setStages] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch job details if jobId is provided
                if (jobId) {
                    const jobData = await jobService.getJobById(jobId);
                    setJob(jobData);
                }

                // Fetch stages for the job or default stages
                const workflowId = jobId || 'default';
                const stagesData = await jobService.getWorkflowStages(workflowId);
                setStages([{ id: 'all', name: 'Tous les candidats' }, ...stagesData]);

                // Fetch candidates for the job
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

    const filteredCandidates = selectedStage === 'all'
        ? candidates
        : candidates.filter(candidate => candidate.stage === selectedStage);

    const getStatusBadge = (status) => {
        switch(status) {
            case 'needs_scheduling':
                return <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">Besoin de planification</span>;
            case 'feedback_received':
                return <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Retour reçu</span>;
            case 'waiting_on_feedback':
                return <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">En attente de retour</span>;
            default:
                return null;
        }
    };

    const getStageName = (stageId) => {
        const stage = stages.find(s => s.id === stageId);
        return stage ? stage.name : '';
    };

    const handleSelectAllChange = (e) => {
        if (e.target.checked) {
            setSelectedCandidates(filteredCandidates.map(c => c.id));
        } else {
            setSelectedCandidates([]);
        }
    };

    const handleSelectCandidate = (id) => {
        setSelectedCandidates(prev => {
            if (prev.includes(id)) {
                return prev.filter(cId => cId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const moveToNextStage = async (candidateId) => {
        try {
            const candidate = candidates.find(c => c.id === candidateId);
            if (!candidate) return;

            // Find the current stage index
            const currentStageIndex = stages.findIndex(s => s.id === candidate.stage);
            if (currentStageIndex === -1 || currentStageIndex === stages.length - 1) return;

            // Get the next stage
            const nextStage = stages[currentStageIndex + 1];

            // Update the candidate's stage
            await cvService.updateCandidateStage(candidateId, nextStage.id);

            // Update local state
            setCandidates(prevCandidates =>
                prevCandidates.map(c =>
                    c.id === candidateId ? { ...c, stage: nextStage.id } : c
                )
            );
        } catch (error) {
            console.error('Error moving candidate to next stage:', error);
        }
    };

    const disqualifyCandidate = async (candidateId) => {
        try {
            // Update the candidate's status
            await cvService.disqualifyCandidate(candidateId);

            // Update local state
            setCandidates(prevCandidates =>
                prevCandidates.filter(c => c.id !== candidateId)
            );
        } catch (error) {
            console.error('Error disqualifying candidate:', error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    {job ? job.title : 'Tous les candidats'}
                </h1>
                <Link
                    to="/cv-analysis"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg"
                >
                    + Ajouter un candidat
                </Link>
            </div>

            <div className="mb-6 flex space-x-4">
                <div className="w-1/3">
                    <input
                        type="text"
                        placeholder="Rechercher des candidats..."
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                </div>

                <div>
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg"
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                    >
                        {stages.map(stage => (
                            <option key={stage.id} value={stage.id}>{stage.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300"
                                checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                                onChange={handleSelectAllChange}
                            />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Candidat
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Étape
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ajouté
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCandidates.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                                Aucun candidat dans cette étape
                            </td>
                        </tr>
                    ) : (
                        filteredCandidates.map((candidate) => (
                            <tr key={candidate.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300"
                                        checked={selectedCandidates.includes(candidate.id)}
                                        onChange={() => handleSelectCandidate(candidate.id)}
                                    />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 rounded-full ${candidate.avatarColor || 'bg-blue-400'} flex items-center justify-center text-white font-semibold`}>
                                            {candidate.firstName?.charAt(0)}{candidate.lastName?.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <Link
                                                to={`/cv/${candidate.id}`}
                                                className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                            >
                                                {candidate.firstName} {candidate.lastName}
                                            </Link>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{getStageName(candidate.stage)}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    {getStatusBadge(candidate.status)}
                                    {candidate.rating && (
                                        <div className="mt-1 flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < Math.floor(candidate.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                                                />
                                            ))}
                                            <span className="ml-1 text-xs text-gray-600">{candidate.rating}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {candidate.createdAt ?
                                        `il y a ${Math.floor((new Date() - new Date(candidate.createdAt)) / (1000 * 60 * 60 * 24))} jours` :
                                        'récemment'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex space-x-2 justify-end">
                                        <button
                                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                                            onClick={() => moveToNextStage(candidate.id)}
                                        >
                                            Avancer
                                        </button>
                                        <button
                                            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                            onClick={() => disqualifyCandidate(candidate.id)}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CandidatePipelineView;