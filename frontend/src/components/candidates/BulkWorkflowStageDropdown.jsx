// src/components/candidates/BulkWorkflowStageDropdown.jsx
import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ArrowRight,
  User, 
  Users, 
  FileCheck, 
  Phone, 
  Gift, 
  UserX, 
  Archive,
  Tag
} from 'lucide-react';
import { workflowService, cvService } from '../../services/api';
import { toast } from 'react-toastify';

/**
 * Dropdown pour les actions en masse sur les étapes de workflow
 * Permet de déplacer plusieurs candidats à la fois
 */
const BulkWorkflowStageDropdown = ({ selectedCandidates, companyId, onStageUpdate }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [workflowStages, setWorkflowStages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les étapes du workflow par défaut
  useEffect(() => {
    const fetchWorkflowStages = async () => {
      try {
        if (!companyId) return;
        
        // Récupérer le workflow par défaut
        const workflows = await workflowService.getWorkflows(companyId);
        const defaultWorkflow = workflows.find(w => w.isDefault) || workflows[0];
        
        if (defaultWorkflow) {
          const stages = await workflowService.getWorkflowStages(companyId, defaultWorkflow.id);
          setWorkflowStages(stages);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des étapes du workflow:', error);
      }
    };

    fetchWorkflowStages();
  }, [companyId]);

  // Mapping des types d'étapes vers les icônes
  const getStageIcon = (type) => {
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

  // Gérer l'avancement en masse
  const handleBulkAdvance = async (stageId) => {
    if (selectedCandidates.length === 0) return;
    
    setIsLoading(true);
    try {
      await cvService.bulkUpdateCandidates(companyId, selectedCandidates, 'advance', stageId);
      
      setShowDropdown(false);
      toast.success(`${selectedCandidates.length} candidat(s) déplacé(s) avec succès`);
      
      // Notifier le composant parent de la mise à jour
      if (typeof onStageUpdate === 'function') {
        onStageUpdate();
      }
    } catch (error) {
      console.error('Erreur lors de l\'avancement en masse:', error);
      toast.error('Erreur lors de l\'avancement en masse des candidats');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative ">
      {/* Bouton principal */}
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isLoading || selectedCandidates.length === 0}
        className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center space-x-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <ArrowRight className="w-4 h-4" />
        )}
        <span>Faire avancer</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {/* Dropdown des étapes */}
      {showDropdown && (
        <>
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-700 mb-1">Déplacer vers:</div>
              <div className="text-xs text-gray-500">
                {selectedCandidates.length} candidat(s) sélectionné(s)
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {workflowStages.length > 0 ? (
                <div className="p-2 space-y-1">
                  {workflowStages.map((stage) => (
                    <button
                      key={stage.id}
                      onClick={() => handleBulkAdvance(stage.id)}
                      className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors"
                    >
                      <div className="text-gray-500">
                        {getStageIcon(stage.type)}
                      </div>
                      <span>{stage.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-sm text-gray-500 text-center">
                  Aucune étape disponible
                </div>
              )}
            </div>
          </div>
          
          {/* Overlay pour fermer le dropdown */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
        </>
      )}
    </div>
  );
};

export default BulkWorkflowStageDropdown;