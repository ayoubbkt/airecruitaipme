// components/candidates/CandidateActionBar.jsx
import React, { useState } from 'react';
import { 
  Pin,
  Mail, 
  MessageCircle, 
  X, 
  ChevronDown,
  ChevronRight,
  UserX,
  TrendingUp
} from 'lucide-react';

/**
 * Composant barre d'actions pour un candidat
 * Inclut: Pin, Send Email, Send Message, Disqualify, Advance
 */
const CandidateActionBar = ({ 
  candidate,
  companyId,
  onEmailModal,
  onCommentModal,
  onScheduleMeeting,
  onPinCandidate,
  onDisqualifyCandidate,
  onAdvanceCandidate,
  workflowStages = []
}) => {
  const [showAdvanceDropdown, setShowAdvanceDropdown] = useState(false);
  const [isPinned, setIsPinned] = useState(candidate?.isPinned || false);
  const [isLoading, setIsLoading] = useState({});

  // Gestion générique des actions avec loading
  const handleAction = async (actionName, actionFn, ...args) => {
    if (isLoading[actionName]) return;
    
    setIsLoading(prev => ({ ...prev, [actionName]: true }));
    try {
      await actionFn(...args);
    } catch (error) {
      console.error(`Erreur lors de ${actionName}:`, error);
    } finally {
      setIsLoading(prev => ({ ...prev, [actionName]: false }));
    }
  };

  // Pin/Unpin candidat
  const handlePinToggle = async () => {
    await handleAction('pin', async () => {
      await onPinCandidate(candidate.id, !isPinned);
      setIsPinned(!isPinned);
    });
  };

  // Disqualify candidat
  const handleDisqualify = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir disqualifier ce candidat ?')) {
      return;
    }
    await handleAction('disqualify', onDisqualifyCandidate, candidate.id);
  };

  // Advance candidat
  const handleAdvanceToStage = async (stageId) => {
    await handleAction('advance', onAdvanceCandidate, candidate.id, stageId);
    setShowAdvanceDropdown(false);
  };

  const actionButtons = [
    {
      id: 'pin',
      icon: Pin,
      label: isPinned ? 'Détacher' : 'Épingler',
      onClick: handlePinToggle,
      className: `
        ${isPinned 
          ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' 
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }
      `,
      loading: isLoading.pin
    },
    {
      id: 'email',
      icon: Mail,
      label: 'Envoyer Email',
      onClick: () => onEmailModal(candidate),
      className: 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-700',
      loading: false
    },
    {
      id: 'message',
      icon: MessageCircle,
      label: 'Message Interne',
      onClick: () => onCommentModal(candidate),
      className: 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:text-green-700',
      loading: false
    },
    {
      id: 'disqualify',
      icon: UserX,
      label: 'Disqualifier',
      onClick: handleDisqualify,
      className: 'bg-white text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-700',
      loading: isLoading.disqualify
    }
  ];

  return (
    <div className="flex items-center justify-center space-x-3 p-4 bg-white border-t border-gray-200">
      {/* Boutons d'action principaux */}
      {actionButtons.map((button) => {
        const IconComponent = button.icon;
        return (
          <button
            key={button.id}
            onClick={button.onClick}
            disabled={button.loading}
            className={`
              inline-flex items-center px-4 py-2 text-sm font-medium border rounded-lg
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
              ${button.className}
            `}
            title={button.label}
          >
            <IconComponent className={`w-4 h-4 mr-2 ${button.loading ? 'animate-spin' : ''}`} />
            {button.label}
          </button>
        );
      })}

      {/* Bouton Advance avec dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowAdvanceDropdown(!showAdvanceDropdown)}
          disabled={isLoading.advance}
          className="
            inline-flex items-center px-4 py-2 text-sm font-medium text-white 
            bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors
          "
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Faire Avancer
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>

        {/* Dropdown des stages */}
        {showAdvanceDropdown && (
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
                    disabled={stage.id === candidate.currentStageId}
                    className={`
                      w-full px-4 py-2 text-left text-sm transition-colors
                      ${stage.id === candidate.currentStageId
                        ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{stage.name}</span>
                      {stage.id === candidate.currentStageId && (
                        <span className="ml-2 text-xs text-gray-400">(Actuel)</span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  Aucun stage disponible
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overlay pour fermer le dropdown */}
        {showAdvanceDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowAdvanceDropdown(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CandidateActionBar;