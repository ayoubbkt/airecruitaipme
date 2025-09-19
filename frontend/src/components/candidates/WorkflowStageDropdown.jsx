// src/components/candidates/WorkflowStageDropdown.jsx
import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  User, 
  Users, 
  FileCheck, 
  Phone, 
  Gift, 
  UserX, 
  Archive,
  Tag
} from 'lucide-react';
import { jobService } from '../../services/api';
import candidateService from '../../services/candidateService';
import { toast } from 'react-toastify';

/**
 * Composant de dropdown pour changer l'étape du workflow d'un candidat
 * Utilise les mêmes icônes que dans WorkflowManager.jsx
 */
const WorkflowStageDropdown = ({ candidate, companyId, onStageUpdate }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [workflowStages, setWorkflowStages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer les étapes du workflow au chargement
  useEffect(() => {
    const fetchWorkflowStages = async () => {
      try {
        // Récupérer le workflowId (celui du job associé au candidat)
        const jobId = candidate?.applications?.[0]?.jobId;
        if (!companyId || !jobId) return;
        

        const j = await jobService.getJobById(companyId, jobId);
        const stages = (j?.jobWorkflow?.stages || [])


         
        setWorkflowStages(stages);
      } catch (error) {
        console.error('Erreur lors du chargement des étapes du workflow:', error);
      }
    };

    fetchWorkflowStages();
  }, [candidate, companyId]);

  // Obtenir l'icône en fonction du type d'étape
  const getStageIcon = (type) => {
    // Mapping des types d'étapes aux icônes (similaire à WorkflowManager.jsx)
    const stageTypeMap = {
      'APPLIED': User,
      'REVIEW': FileCheck,
      'INTERVIEW': Users,
      'PHONE_SCREEN': Phone,
      'OFFER': Gift,
      'DISQUALIFIED': UserX,
      'ARCHIVED': Archive,
      'LEADS': User,
      'BACKGROUND_CHECK': FileCheck,
      'OTHER': Tag
    };
    
    const IconComponent = stageTypeMap[type] || Tag;
    return <IconComponent className="w-4 h-4" />;
  };

  // Mise à jour de l'étape du candidat
  const handleAdvanceToStage = async (stageId) => {
    if (!candidate?.id || !companyId) return;
    
    setIsLoading(true);
    try {
      await candidateService.updateCandidateStage(companyId, candidate.id, stageId);
      setShowDropdown(false);
      
      // Notifier le parent pour rafraîchir les données si nécessaire
      if (typeof onStageUpdate === 'function') {
        onStageUpdate(stageId);
      }
      
      toast.success('Étape du candidat mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'étape:', error);
      toast.error('Erreur lors de la mise à jour de l\'étape du candidat');
    } finally {
      setIsLoading(false);
    }
  };

  // ID de l'étape actuelle du candidat
  const currentStageId = candidate?.applications?.[0]?.currentStageId;
  
  // Trouver l'étape actuelle pour afficher son nom et son icône
  const currentStage = workflowStages.find(stage => stage.id === currentStageId);

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isLoading}
        className="
          inline-flex items-center px-4 py-2 text-sm font-medium text-white 
          bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors
        "
      >
        {isLoading ? (
          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          currentStage && getStageIcon(currentStage.type)
        )}
        <span className="ml-2">Advance</span>
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {/* Dropdown des étapes */}
      {showDropdown && (
        <>
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Déplacer vers:
              </div>
            </div>
            
            <div className="py-2 max-h-64 overflow-y-auto">
              {workflowStages.length > 0 ? (
                workflowStages.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => handleAdvanceToStage(stage.id)}
                    disabled={stage.id === currentStageId}
                    className={`
                      w-full px-4 py-2 text-left text-sm transition-colors flex items-center
                      ${stage.id === currentStageId
                        ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                      }
                    `}
                  >
                    <div className="mr-2 text-gray-500">
                      {getStageIcon(stage.type)}
                    </div>
                    <span>{stage.name}</span>
                    {stage.id === currentStageId && (
                      <span className="ml-2 text-xs text-gray-400">(Actuel)</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  Aucune étape disponible
                </div>
              )}
            </div>
          </div>
          
          {/* Overlay pour fermer le dropdown en cliquant ailleurs */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
        </>
      )}
    </div>
  );
};

export default WorkflowStageDropdown;