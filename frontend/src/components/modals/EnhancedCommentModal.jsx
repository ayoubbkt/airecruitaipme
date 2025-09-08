// components/modals/EnhancedCommentModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ChevronDown,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  AtSign,
  Send,
  Eye,
  Lock,
  Shield,
  Users,
  UserCheck,
  User
} from 'lucide-react';

/**
 * Modal de commentaires internes avec système de mentions et visibilité
 */
const EnhancedCommentModal = ({ 
  isOpen, 
  onClose, 
  candidateId,
  companyId,
  onCommentAdded 
}) => {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ x: 0, y: 0 });
  const [selectedMentions, setSelectedMentions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  
  const contentRef = useRef(null);
  const modalRef = useRef(null);

  // Options de visibilité
  const visibilityOptions = [
    {
      id: 'Public',
      name: 'Public',
      description: 'Visible to everyone on job',
      icon: Eye,
      color: 'green'
    },
    {
      id: 'Private',
      name: 'Private',
      description: 'Visible to Hiring Manager and above',
      icon: Lock,
      color: 'yellow'
    },
    {
      id: 'Confidential',
      name: 'Confidential',
      description: 'Visible to you and Company admins.',
      icon: Shield,
      color: 'red'
    }
  ];

  // Types de mentions
  const mentionTypes = [
    {
      id: 'hiring_team',
      name: 'Hiring Team',
      icon: Users,
      members: []
    },
    {
      id: 'hiring_managers',
      name: 'Hiring Managers',
      icon: UserCheck,
      members: []
    },
    {
      id: 'job_admins',
      name: 'Job Admins',
      icon: User,
      members: []
    },
    {
      id: 'individual',
      name: 'Individual Team Members',
      icon: User,
      members: teamMembers
    }
  ];

  // Charger les membres de l'équipe
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(
          `/api/companies/${companyId}/team-members`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data.data || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des membres:', error);
      }
    };

    if (isOpen && companyId) {
      fetchTeamMembers();
    }
  }, [isOpen, companyId]);

  // Gestion de la fermeture
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Commandes de formatage
  const handleFormatCommand = (command) => {
    document.execCommand(command, false, null);
    contentRef.current?.focus();
  };

  // Gestion des mentions
  const handleMentionTrigger = (e) => {
    if (e.key === '@') {
      const rect = contentRef.current.getBoundingClientRect();
      const range = window.getSelection().getRangeAt(0);
      const rangeRect = range.getBoundingClientRect();
      
      setMentionPosition({
        x: rangeRect.left - rect.left,
        y: rangeRect.bottom - rect.top + 5
      });
      setShowMentionDropdown(true);
    }
  };

  const handleMentionSelect = (member) => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    
    // Supprimer le @ et remplacer par la mention
    range.deleteContents();
    const mentionElement = document.createElement('span');
    mentionElement.className = 'bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium';
    mentionElement.contentEditable = false;
    mentionElement.textContent = `@${member.name}`;
    mentionElement.setAttribute('data-mention-id', member.id);
    
    range.insertNode(mentionElement);
    
    // Déplacer le curseur après la mention
    range.setStartAfter(mentionElement);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    setSelectedMentions(prev => [...prev, member]);
    setShowMentionDropdown(false);
    setMentionQuery('');
  };

  // Soumission du commentaire
  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Le contenu du commentaire est requis');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const commentData = {
        content: contentRef.current?.innerHTML || content,
        visibility,
        mentions: selectedMentions.map(m => m.id),
        candidateId
      };

      const response = await fetch(
        `/api/candidates/companies/${companyId}/candidates/${candidateId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(commentData)
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du commentaire');
      }

      onCommentAdded?.();
      onClose();

    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedVisibility = visibilityOptions.find(v => v.id === visibility);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50" />

        {/* Modal */}
        <div
          ref={modalRef}
          className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative"
        >
          {/* En-tête */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">New Comment</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-4">
            {/* Zone de texte avec @ pour mentions */}
            <div className="relative">
              <div
                ref={contentRef}
                contentEditable
                className="min-h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                onKeyDown={handleMentionTrigger}
                onInput={(e) => setContent(e.target.innerHTML)}
                suppressContentEditableWarning={true}
                placeholder="Écrivez votre commentaire... Utilisez @ pour mentionner quelqu'un"
                style={{ minHeight: '120px' }}
              />

              {/* Dropdown des mentions */}
              {showMentionDropdown && (
                <div
                  className="absolute z-10 w-80 bg-white border border-gray-200 rounded-lg shadow-lg"
                  style={{
                    left: mentionPosition.x,
                    top: mentionPosition.y
                  }}
                >
                  <div className="p-3 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Search team members..."
                      value={mentionQuery}
                      onChange={(e) => setMentionQuery(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  
                  <div className="py-2 max-h-64 overflow-y-auto">
                    {mentionTypes.map((type) => {
                      const IconComponent = type.icon;
                      const members = type.id === 'individual' ? teamMembers : type.members;
                      const filteredMembers = members.filter(member =>
                        member.name.toLowerCase().includes(mentionQuery.toLowerCase())
                      );

                      if (filteredMembers.length === 0 && type.id === 'individual') return null;

                      return (
                        <div key={type.id}>
                          <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                            <div className="flex items-center">
                              <IconComponent className="w-4 h-4 mr-2" />
                              {type.name}
                            </div>
                          </div>
                          
                          {type.id !== 'individual' ? (
                            <button
                              onClick={() => handleMentionSelect({ id: type.id, name: type.name })}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                  <IconComponent className="w-4 h-4 text-gray-600" />
                                </div>
                                <span>{type.name}</span>
                              </div>
                            </button>
                          ) : (
                            filteredMembers.map((member) => (
                              <button
                                key={member.id}
                                onClick={() => handleMentionSelect(member)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                              >
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-xs font-medium text-blue-600">
                                      {member.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium">{member.name}</div>
                                    <div className="text-xs text-gray-500">{member.email}</div>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Barre d'outils de formatage */}
            <div className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
              <button
                onClick={() => handleFormatCommand('bold')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
                title="Gras"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormatCommand('italic')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
                title="Italique"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormatCommand('underline')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
                title="Souligné"
              >
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300" />
              <button
                onClick={() => handleFormatCommand('insertUnorderedList')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
                title="Liste à puces"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormatCommand('insertOrderedList')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
                title="Liste numérotée"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300" />
              <button
                onClick={() => setShowMentionDropdown(!showMentionDropdown)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
                title="Mentionner quelqu'un"
              >
                <AtSign className="w-4 h-4" />
              </button>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Pied de page */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            {/* Sélecteur de visibilité */}
            <div className="relative">
              <button
                onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <selectedVisibility.icon className={`w-4 h-4 mr-2 text-${selectedVisibility.color}-600`} />
                {selectedVisibility.name}
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {showVisibilityDropdown && (
                <div className="absolute bottom-full mb-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-2">
                    {visibilityOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            setVisibility(option.id);
                            setShowVisibilityDropdown(false);
                          }}
                          className={`w-full flex items-start px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            visibility === option.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <IconComponent className={`w-5 h-5 mr-3 mt-0.5 text-${option.color}-600`} />
                          <div>
                            <div className="font-medium text-gray-900">{option.name}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isLoading || !content.trim()}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCommentModal;