// components/candidates/CandidateStageCard.jsx
import React from 'react';
import { 
  User, 
  Clock, 
  Briefcase, 
  MapPin, 
  Linkedin, 
  Mail,
  Calendar 
} from 'lucide-react';

/**
 * Composant de carte candidat pour l'affichage en stage
 * Respecte les principes de modularité et de lisibilité
 */
const CandidateStageCard = ({ candidate, onSelect, isSelected }) => {
  const {
    id,
    firstName,
    lastName,
    email,
    phoneNumber,
    stage,
    stageEnteredAt,
    score,
    jobOffer,
    status,
    addedBy,
    linkedinProfile
  } = candidate;

  // Calcul de la durée en stage de manière optimisée
  const getTimeInStage = () => {
    if (!stageEnteredAt) return 'N/A';
    
    const now = new Date();
    const enteredDate = new Date(stageEnteredAt);
    const diffTime = Math.abs(now - enteredDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return '1 jour';
    if (diffDays < 7) return `${diffDays} jours`;
    
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 semaine' : `${weeks} semaines`;
  };

  // Génération des initiales pour l'avatar
  const getInitials = () => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Gestion des clics avec gestion d'erreur
  const handleClick = () => {
    try {
      onSelect?.(id);
    } catch (error) {
      console.error('Erreur lors de la sélection du candidat:', error);
    }
  };

  return (
    <div 
      className={`
        w-full bg-white border rounded-lg p-4 transition-all duration-200 cursor-pointer
        hover:shadow-md hover:border-blue-200 hover:bg-blue-50/30
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* En-tête avec avatar et score */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-lg">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {firstName} {lastName}
            </h3>
            <p className="text-sm text-gray-500 truncate">{email}</p>
          </div>
        </div>
        
        {/* Score avec étoile */}
        {score && (
          <div className="flex items-center bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-medium">
            <span className="mr-1">★</span>
            {score}
          </div>
        )}
      </div>

      {/* Informations du stage avec icônes */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          <span>En stage depuis {getTimeInStage()}</span>
        </div>
        
        {jobOffer && (
          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">{jobOffer.title}</span>
          </div>
        )}
        
        {status && (
          <div className="flex items-center text-sm">
            <div className={`
              w-2 h-2 rounded-full mr-2
              ${status === 'Active' ? 'bg-green-400' : 
                status === 'Interview' ? 'bg-blue-400' : 
                'bg-yellow-400'}
            `} />
            <span className={`
              text-sm font-medium
              ${status === 'Active' ? 'text-green-700' : 
                status === 'Interview' ? 'text-blue-700' : 
                'text-yellow-700'}
            `}>
              {status}
            </span>
          </div>
        )}
      </div>

      {/* Informations de contact et liens */}
      <div className="space-y-1 border-t pt-3">
        {phoneNumber && (
          <div className="flex items-center text-xs text-gray-500">
            <span className="w-4 h-4 mr-2">📞</span>
            <span>{phoneNumber}</span>
          </div>
        )}
        
        {linkedinProfile && (
          <div className="flex items-center text-xs">
            <Linkedin className="w-4 h-4 mr-2 text-blue-600" />
            <a 
              href={linkedinProfile} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 truncate"
              onClick={(e) => e.stopPropagation()}
            >
              Profil LinkedIn
            </a>
          </div>
        )}
        
        {addedBy && (
          <div className="flex items-center text-xs text-gray-500">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            <span>Ajouté par {addedBy.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateStageCard;