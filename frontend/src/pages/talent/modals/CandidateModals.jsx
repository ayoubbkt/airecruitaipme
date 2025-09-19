// frontend/src/components/candidate/modals/CandidateModals.jsx

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mail, Calendar, Upload, Eye, EyeOff, Users, 
  Clock, MapPin, Video, FileText, X, ChevronDown,  
  Paperclip,
  Lock,
  Shield,
  UserCheck,
  User,
  Reply,
  AtSign,
} from 'lucide-react';
import { messageTemplateService } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';

// Modal de base réutilisable
export const BaseModal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
          </div>
          {children}
          {footer && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal pour ajouter un commentaire
export const CommentModal = ({ 
  isOpen, 
  onClose, 
  candidateId,
  companyId,
  onCommentAdded,
  onSubmit,
  replyTo = null, // Pour les réponses
  initialMention = null // Pour mentionner automatiquement quelqu'un
}) => {
  // États du composant
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

  // Options de visibilité avec descriptions détaillées
  const visibilityOptions = [
    {
      id: 'Public',
      name: 'Public',
      description: 'Visible to everyone on job',
      icon: Eye,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 'Private',
      name: 'Private',
      description: 'Visible to Hiring Manager and above',
      icon: Lock,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      id: 'Confidential',
      name: 'Confidential',
      description: 'Visible to you and Company admins only',
      icon: Shield,
      color: 'text-red-600 bg-red-100'
    }
  ];

  // Types de mentions possibles
  const mentionTypes = [
    {
      id: 'team-groups',
      name: 'Team Groups',
      icon: Users,
      members: [
        { id: 'hiring-team', name: 'Hiring Team', type: 'group', avatar: 'HT' },
        { id: 'hiring-managers', name: 'Hiring Managers', type: 'group', avatar: 'HM' },
        { id: 'job-admins', name: 'Job Admins', type: 'group', avatar: 'JA' }
      ]
    },
    {
      id: 'ai-assistants',
      name: 'AI Assistants',
      icon: UserCheck,
      members: [
        { id: 'megan-ai', name: 'Megan (AI)', type: 'ai', avatar: 'M' }
      ]
    },
    {
      id: 'individual',
      name: 'Team Members',
      icon: User,
      members: [] // Sera rempli avec les vrais membres de l'équipe
    }
  ];

  // Chargement des membres de l'équipe
  useEffect(() => {
    if (isOpen &&  companyId) {
      fetchTeamMembers();
      
      // Si c'est une réponse, ajouter automatiquement une mention
      if (replyTo) {
        setContent(`@${replyTo.authorName} `);
        setSelectedMentions([{ 
          id: replyTo.authorId, 
          name: replyTo.authorName,
          type: 'user'
        }]);
      }
      
      // Si mention initiale spécifiée
      if (initialMention) {
        setContent(`@${initialMention.name} `);
        setSelectedMentions([initialMention]);
      }
    }
  }, [isOpen, replyTo, companyId,initialMention]);

  // Fermeture au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (showMentionDropdown) {
          setShowMentionDropdown(false);
        } else if (showVisibilityDropdown) {
          setShowVisibilityDropdown(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, showMentionDropdown, showVisibilityDropdown, onClose]);

  // Récupération des membres de l'équipe
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/team-members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const members = await response.json();
        setTeamMembers(members.map(member => ({
          id: member.id,
          name: member.name || `${member.firstName} ${member.lastName}`,
          type: 'user',
          avatar: member.avatar || member.initials,
          email: member.email
        })));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    }
  };

  // Gestion des mentions avec @
  const handleMentionTrigger = (e) => {
    if (e.key === '@' || (e.key === ' ' && e.target.textContent.endsWith('@'))) {
      const rect = e.target.getBoundingClientRect();
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const rect2 = range.getBoundingClientRect();
      
      setMentionPosition({
        x: rect2.left - rect.left,
        y: rect2.bottom - rect.top + 5
      });
      setShowMentionDropdown(true);
      setMentionQuery('');
    }
    
    if (e.key === 'Escape') {
      setShowMentionDropdown(false);
      setMentionQuery('');
    }
  };

  // Sélection d'une mention
 
const handleMentionSelect = (member) => {
  // Focus sur le champ contentEditable
  contentRef.current.focus();

  // Récupère la sélection
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);

  // Supprime le @ et le texte en cours de saisie
  const node = range.startContainer;
  let text = node.textContent;
  let offset = range.startOffset;
  // Trouve le début du mot commençant par @
  const atIndex = text.lastIndexOf('@', offset - 1);
  if (atIndex !== -1) {
    range.setStart(node, atIndex);
    range.setEnd(node, offset);
    range.deleteContents();
  }

  // Crée l'élément mention
  const mentionElement = document.createElement('span');
  mentionElement.className = 'inline-flex items-center px-2 py-1 mx-1 text-sm bg-blue-100 text-blue-800 rounded font-medium mention-tag';
  mentionElement.contentEditable = 'false';
  mentionElement.textContent = `@${member.name}`;
  mentionElement.setAttribute('data-mention-id', member.id);
  mentionElement.setAttribute('data-mention-type', member.type);

  // Insère la mention
  range.insertNode(mentionElement);

  // Ajoute un espace après
  const spaceNode = document.createTextNode(' ');
  range.setStartAfter(mentionElement);
  range.insertNode(spaceNode);
  range.setStartAfter(spaceNode);
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);

  // Met à jour les mentions sélectionnées
  setSelectedMentions(prev => {
    const exists = prev.find(m => m.id === member.id);
    return exists ? prev : [...prev, member];
  });

  setShowMentionDropdown(false);
  setMentionQuery('');
};
 

  // Soumission du commentaire
  // ...existing code...
const handleSubmit = async (e) => {
  e?.preventDefault?.();
  const textContent = contentRef.current?.textContent || '';
  if (!textContent.trim()) {
    setError('Le contenu du commentaire est requis');
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    const commentData = {
      content: contentRef.current?.innerHTML || content,
      textContent,
      visibility: visibility.toUpperCase(),
      mentions: selectedMentions.map(m => ({
        id: m.id,
        name: m.name,
        type: m.type
      })),
      candidateId,
      replyToId: replyTo?.id || null
    };

    // Appelle la prop onSubmit fournie par le parent
    await onSubmit?.(commentData);

    // Réinitialise le formulaire
    setContent('');
    setSelectedMentions([]);
    setVisibility('Public');
    onClose();

  } catch (error) {
    console.error('Erreur lors de la soumission:', error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};
// ...existing code...

  // Filtrage des membres pour la recherche
  const getFilteredMembers = (type) => {
    if (type.id === 'individual') {
      return teamMembers.filter(member =>
        member.name.toLowerCase().includes(mentionQuery.toLowerCase())
      );
    }
    return type.members.filter(member =>
      member.name.toLowerCase().includes(mentionQuery.toLowerCase())
    );
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
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {replyTo ? `Reply to ${replyTo.authorName}` : 'New Comment'}
                {console.log("replyTo", replyTo)}
              </h3>
              {replyTo && (
                <p className="text-sm text-gray-500 mt-1">
                  Replying to comment from {new Date(replyTo.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-4">
            {/* Zone de texte avec mentions */}
            <div className="relative">
              <div
  ref={contentRef}
  contentEditable
  className="min-h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
  onInput={(e) => {
    setContent(e.target.innerHTML);
    // Détection du dernier mot commençant par @
    const text = e.target.textContent;
    const match = text.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setShowMentionDropdown(true);
      // Optionnel: position du dropdown
      setMentionPosition({ x: 20, y: 40 });
    } else {
      setShowMentionDropdown(false);
      setMentionQuery('');
    }
  }}
  suppressContentEditableWarning={true}
  data-placeholder="Write your comment... Use @ to mention someone"
  style={{
    minHeight: '120px',
  }}
/>

              {/* Placeholder personnalisé */}
              <style jsx>{`
                [contenteditable][data-placeholder]:empty::before {
                  content: attr(data-placeholder);
                  color: #9CA3AF;
                  pointer-events: none;
                }
                .mention-tag {
                  user-select: none;
                  cursor: pointer;
                }
              `}</style>

              {/* Dropdown des mentions */}
              {showMentionDropdown && (
                <div
                  className="absolute z-20 w-80 bg-white border border-gray-200 rounded-lg shadow-lg"
                  style={{
                    left: Math.min(mentionPosition.x, 200),
                    top: mentionPosition.y
                  }}
                >
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search team members..."
                        value={mentionQuery}
                        onChange={(e) => setMentionQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <div className="py-2 max-h-64 overflow-y-auto">
                    {mentionTypes.map((type) => {
                      const IconComponent = type.icon;
                      const filteredMembers = getFilteredMembers(type);

                      if (filteredMembers.length === 0) return null;

                      return (
                        <div key={type.id} className="mb-2">
                          <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                            <div className="flex items-center">
                              <IconComponent className="w-4 h-4 mr-2" />
                              {type.name}
                            </div>
                          </div>
                          
                          {filteredMembers.map((member) => (
                            <button
                              key={member.id}
                              onClick={() => handleMentionSelect(member)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center space-x-3"
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                member.type === 'ai' ? 'bg-purple-100 text-purple-600' :
                                member.type === 'group' ? 'bg-blue-100 text-blue-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {member.avatar}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{member.name}</div>
                                {member.email && (
                                  <div className="text-xs text-gray-500">{member.email}</div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Affichage des erreurs */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Pied du modal */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            {/* Sélecteur de visibilité */}
            <div className="relative">
              <button
                onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
                className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <selectedVisibility.icon className="w-4 h-4" />
                <span>{selectedVisibility.name}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showVisibilityDropdown && (
                <div className="absolute bottom-full mb-2 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="p-2">
                    {visibilityOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            setVisibility(option.id);
                            setShowVisibilityDropdown(false);
                          }}
                          className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 hover:bg-gray-50 ${
                            visibility === option.id ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${option.color}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{option.name}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex items-start space-x-2">
                      <Mail className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <strong>Email notifications</strong> are automatically sent when mentions are used.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !content.trim()}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isLoading ? 'Submitting...' : 'Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal pour composer un email
export const EmailModal = ({ isOpen, onClose, onSubmit, candidate, loading = false }) => {
  const { companyId } = useAuth();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Options de planification
  const scheduleOptions = [
    { id: 'now', name: 'Send Email' },
    { id: '1h', name: 'Send in 1 hour' },
    { id: '2h', name: 'Send in 2 hours' },
    { id: '4h', name: 'Send in 4 hours' },
    { id: 'tomorrow_morning', name: 'Send tomorrow morning' },
    { id: 'tomorrow_evening', name: 'Send tomorrow evening' },
    { id: '2d', name: 'Send in 2 days' },
    { id: '1w', name: 'Send in 1 week' }
  ];

  // Charger les templates quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && companyId) {
      fetchTemplates();
    }
  }, [isOpen, companyId]);

  // Récupérer les templates
  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await messageTemplateService.getMessageTemplates(companyId);
      // Transformer en format utilisable pour le dropdown
      const allTemplates = [
        ...(response.required || []),
        ...(response.custom || []),
        ...(response.all || [])
      ];
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading message templates:', error);
      toast.error('Impossible de charger les templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Sélectionner un template
  const handleTemplateSelect = async (templateId) => {
    try {
      // Trouver le template dans la liste locale
      const template = templates.find(t => t.id === templateId);
      
      if (template) {
        // Remplacer les variables dans le template
        const replacedSubject = template.subject
          .replace(/\{\{candidateName\}\}/g, candidate?.firstName || 'Candidate')
          .replace(/\{\{candidateFirstName\}\}/g, candidate?.firstName || 'Candidate')
          .replace(/\{\{candidateLastName\}\}/g, candidate?.lastName || '');
        
        const replacedContent = template.content
          .replace(/\{\{candidateName\}\}/g, candidate?.firstName || 'Candidate')
          .replace(/\{\{candidateFirstName\}\}/g, candidate?.firstName || 'Candidate')
          .replace(/\{\{candidateLastName\}\}/g, candidate?.lastName || '');
        
        setTemplateId(templateId);
        setSubject(replacedSubject);
        setContent(replacedContent);
      } else if (templateId) {
        // Si on ne trouve pas localement, on essaie de récupérer directement
        const templateData = await messageTemplateService.getMessageTemplateById(companyId, templateId);
        if (templateData) {
          const replacedSubject = templateData.subject
            .replace(/\{\{candidateName\}\}/g, candidate?.firstName || 'Candidate')
            .replace(/\{\{candidateFirstName\}\}/g, candidate?.firstName || 'Candidate')
            .replace(/\{\{candidateLastName\}\}/g, candidate?.lastName || '');
          
          const replacedContent = templateData.content
            .replace(/\{\{candidateName\}\}/g, candidate?.firstName || 'Candidate')
            .replace(/\{\{candidateFirstName\}\}/g, candidate?.firstName || 'Candidate')
            .replace(/\{\{candidateLastName\}\}/g, candidate?.lastName || '');
          
          setTemplateId(templateId);
          setSubject(replacedSubject);
          setContent(replacedContent);
        }
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Erreur lors du chargement du template');
    }
    
    setShowTemplateDropdown(false);
  };

  // Préparer la date de planification
  const parseScheduleOption = (option) => {
    if (!option || option === 'now') return null;
    
    const now = new Date();
    
    switch (option) {
      case '1h':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case '2h':
        return new Date(now.getTime() + 2 * 60 * 60 * 1000);
      case '4h':
        return new Date(now.getTime() + 4 * 60 * 60 * 1000);
      case 'tomorrow_morning':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow;
      case 'tomorrow_evening':
        const tomorrowEvening = new Date(now);
        tomorrowEvening.setDate(tomorrowEvening.getDate() + 1);
        tomorrowEvening.setHours(17, 0, 0, 0);
        return tomorrowEvening;
      case '2d':
        const twoDays = new Date(now);
        twoDays.setDate(twoDays.getDate() + 2);
        return twoDays;
      case '1w':
        const oneWeek = new Date(now);
        oneWeek.setDate(oneWeek.getDate() + 7);
        return oneWeek;
      default:
        return null;
    }
  };

  // Envoyer l'email
  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error('Veuillez remplir le sujet et le contenu');
      return;
    }

    try {
      const scheduledDateTime = parseScheduleOption(scheduledFor);
      
      await onSubmit({
        subject,
        content,
        templateId: templateId || null,
        scheduledFor: scheduledDateTime ? scheduledDateTime.toISOString() : null,
        attachments
      });
      
      // Reset form
      setSubject('');
      setContent('');
      setTemplateId('');
      setScheduledFor('');
      setAttachments([]);
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  // Si le modal n'est pas ouvert, ne rien afficher
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Compose Email</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Destinataire */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">To</span>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                {candidate?.firstName?.[0]}{candidate?.lastName?.[0]}
              </div>
              <span className="text-sm text-gray-900">{candidate?.firstName} {candidate?.lastName}</span>
              <span className="text-sm text-gray-500">&lt;{candidate?.email}&gt;</span>
            </div>
          </div>

          {/* Sujet et Template */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <div className="relative">
                <button
                  onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                  disabled={loading || loadingTemplates}
                >
                  Templates {loadingTemplates ? '(Loading...)' : ''} <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {showTemplateDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-10">
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {templates.length > 0 ? (
                        templates.map(template => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template.id)}
                            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                            disabled={loading}
                          >
                            {template.name}
                          </button>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-2">
                          {loadingTemplates ? 'Loading templates...' : 'No templates available'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          {/* Contenu */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your message here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[200px]"
              disabled={loading}
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-between items-center pt-4">
            <div className="relative">
              <button
                onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg flex items-center"
                disabled={loading}
              >
                Send Later <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {showScheduleDropdown && (
                <div className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                  <div className="p-2">
                    {scheduleOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setScheduledFor(option.id);
                          setShowScheduleDropdown(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        disabled={loading}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !subject.trim() || !content.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? 'Sending...' : 'Send Email'} <Send className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal pour programmer une réunion
export const MeetingModal = ({ isOpen, onClose, onSubmit, candidate, loading = false }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('11:00');
  const [duration, setDuration] = useState('60'); // en minutes
  const [attendees, setAttendees] = useState([]);
  const [location, setLocation] = useState('');
  const [isGoogleMeet, setIsGoogleMeet] = useState(false);
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !date || !startTime) return;
    
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000);
    
    try {
      await onSubmit({
        title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        attendees: [
          ...attendees,
          // Ajouter le candidat automatiquement
          {
            email: candidate?.email,
            name: `${candidate?.firstName} ${candidate?.lastName}`,
            isCandidate: true
          }
        ],
        location: isGoogleMeet ? 'Google Meet' : location,
        isGoogleMeet,
        description
      });
      
      // Reset form
      setTitle('');
      setDate('');
      setStartTime('11:00');
      setDuration('60');
      setAttendees([]);
      setLocation('');
      setIsGoogleMeet(false);
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    }
  };

  const durationOptions = [
    { value: '15', label: '15min' },
    { value: '30', label: '30min' },
    { value: '45', label: '45min' },
    { value: '60', label: '1hr' },
    { value: '90', label: '1hr 30min' },
    { value: '120', label: '2hr' }
  ];

  const footer = (
    <>
      <button
        onClick={onClose}
        disabled={loading}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={loading || !title.trim() || !date}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
      >
        <Mail size={16} />
        {loading ? 'Scheduling...' : 'Send invite'}
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule a Meeting"
      footer={footer}
    >
      <div className="space-y-4">
        {/* Titre de la réunion */}
        <input
          type="text"
          placeholder="Meeting name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          disabled={loading}
        />

        {/* Date et heure */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded"
              disabled={loading}
            />
          </div>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="p-2 border border-gray-300 rounded"
            disabled={loading}
          />
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="p-2 border border-gray-300 rounded"
            disabled={loading}
          >
            {durationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Participants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attendees
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {/* Candidat automatiquement inclus */}
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
              <Users size={14} />
              {candidate?.firstName} {candidate?.lastName}
            </span>
            {attendees.map((attendee, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1"
              >
                {attendee.name || attendee.email}
                <button
                  onClick={() => setAttendees(prev => prev.filter((_, i) => i !== index))}
                  className="text-green-600 hover:text-green-800"
                  disabled={loading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add attendee email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                setAttendees(prev => [...prev, { email: e.target.value.trim() }]);
                e.target.value = '';
              }
            }}
            disabled={loading}
          />
        </div>

        {/* Description */}
        <textarea
          placeholder="Meeting description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
          rows={3}
          disabled={loading}
        />

        {/* Lieu */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            disabled={loading || isGoogleMeet}
          />
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="googleMeet"
              checked={isGoogleMeet}
              onChange={(e) => setIsGoogleMeet(e.target.checked)}
              className="rounded"
              disabled={loading}
            />
            <label htmlFor="googleMeet" className="text-sm text-gray-700 flex items-center gap-1">
              <Video size={14} />
              Google Meet meeting
            </label>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

// Modal pour télécharger des fichiers
export const FileUploadModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [files, setFiles] = useState([]);
  const [visibility, setVisibility] = useState('PUBLIC');

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    
    try {
      for (const file of files) {
        await onSubmit(file, visibility);
      }
      setFiles([]);
      setVisibility('PUBLIC');
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const footer = (
    <>
      <button
        onClick={onClose}
        disabled={loading}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={loading || files.length === 0}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
      >
        <Upload size={16} />
        {loading ? 'Uploading...' : 'Upload Files'}
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Files"
      footer={footer}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Files
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          />
          {files.length > 0 && (
            <div className="mt-2 space-y-1">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText size={14} />
                  <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visibility
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          >
            <option value="PUBLIC">Public - Everyone can see</option>
            <option value="PRIVATE">Private - Hiring team only</option>
          </select>
        </div>
      </div>
    </BaseModal>
  );
};