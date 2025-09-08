// components/modals/EnhancedComposeEmailModal.jsx
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
  Paperclip,
  Send,
  Calendar,
  ChevronRight,
  Clock,
  Mail
} from 'lucide-react';

/**
 * Modal de composition d'email avec éditeur riche et planification
 * Style moderne basé sur les images fournies
 */
const EnhancedComposeEmailModal = ({ 
  isOpen, 
  onClose, 
  candidate, 
  companyId,
  onEmailSent 
}) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState('now');
  const [showSchedulingLink, setShowSchedulingLink] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);

  // Templates d'email
  const templates = [
    { id: 'confirmation', name: 'Application Confirmation' },
    { id: 'phone_call', name: 'Phone Call' },
    { id: 'phone_call_self', name: 'Phone Call (Self Schedule)' },
    { id: 'interview_self', name: 'Interview (Self Schedule)' },
    { id: 'interview', name: 'Interview' },
    { id: 'send_offer', name: 'Send Offer' },
    { id: 'mass_rejection', name: 'Mass Rejection' },
    { id: 'disqualification', name: 'Disqualification' }
  ];

  // Options de planification
  const scheduleOptions = [
    { id: 'now', name: 'Send Email', icon: Send },
    { id: '1h', name: 'Send in 1 hour', icon: Clock },
    { id: '2h', name: 'Send in 2 hours', icon: Clock },
    { id: '4h', name: 'Send in 4 hours', icon: Clock },
    { id: 'tomorrow_morning', name: 'Send tomorrow morning', icon: Calendar },
    { id: 'tomorrow_evening', name: 'Send tomorrow evening', icon: Calendar },
    { id: '2d', name: 'Send in 2 days', icon: Calendar },
    { id: '1w', name: 'Send in 1 week', icon: Calendar }
  ];

  // Fermeture du modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Commandes de formatage
  const handleFormatCommand = (command) => {
    document.execCommand(command, false, null);
    contentRef.current?.focus();
  };

  // Gestion des templates
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    setSubject(template.name);
    // Ici vous pourriez charger le contenu du template depuis l'API
    setShowTemplateDropdown(false);
  };

  // Gestion des pièces jointes
  const handleAttachmentAdd = (event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAttachmentRemove = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Envoi de l'email
  const handleSendEmail = async () => {
    if (!subject.trim() || !content.trim()) {
      setError('Le sujet et le contenu sont requis');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('to', candidate.email);
      formData.append('subject', subject);
      formData.append('content', content);
      formData.append('schedule', selectedSchedule);
      formData.append('templateId', selectedTemplate);
      
      // Ajout des pièces jointes
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      const response = await fetch(
        `/api/messaging/companies/${companyId}/send-email`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'email');
      }

      onEmailSent?.();
      onClose();

    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* En-tête */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Compose Email</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-4">
            {/* Destinataire */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">To</label>
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-md">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {candidate.firstName?.charAt(0)}{candidate.lastName?.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {candidate.firstName} {candidate.lastName}
                </span>
                <span className="text-sm text-gray-500">
                  &lt;{candidate.email}&gt;
                </span>
              </div>
            </div>

            {/* Sujet et Templates */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Dropdown Templates */}
              <div className="relative">
                <button
                  onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Templates
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                
                {showTemplateDropdown && (
                  <div className="absolute right-0 z-10 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="py-2 max-h-64 overflow-y-auto">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50"
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Barre d'outils de formatage */}
            <div className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
              <button
                onClick={() => handleFormatCommand('bold')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
                title="Gras"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormatCommand('italic')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
                title="Italique"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormatCommand('underline')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
                title="Souligné"
              >
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300" />
              <button
                onClick={() => handleFormatCommand('insertUnorderedList')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
                title="Liste à puces"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFormatCommand('insertOrderedList')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded"
                title="Liste numérotée"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300" />
              <button
                onClick={() => setShowSchedulingLink(!showSchedulingLink)}
                className={`p-2 rounded transition-colors ${
                  showSchedulingLink 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
                title="Lien de planification"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            {/* Zone de contenu éditable */}
            <div
              ref={contentRef}
              contentEditable
              className="min-h-48 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ minHeight: '200px' }}
              onInput={(e) => setContent(e.target.innerHTML)}
              suppressContentEditableWarning={true}
              placeholder="Compose your message..."
            />

            {/* Pièces jointes */}
            <div className="space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Paperclip className="w-4 h-4 mr-1" />
                Add attachment
              </button>
              
              {attachments.length > 0 && (
                <div className="space-y-1">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        onClick={() => handleAttachmentRemove(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Pied de page avec actions */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>

            <div className="flex items-center space-x-3">
              {/* Dropdown planification */}
              <div className="relative">
                <button
                  onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Send Later
                  <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                
                {showScheduleDropdown && (
                  <div className="absolute bottom-full mb-2 right-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="py-2">
                      {scheduleOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSelectedSchedule(option.id);
                              setShowScheduleDropdown(false);
                            }}
                            className="w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <IconComponent className="w-4 h-4 mr-3 text-gray-400" />
                            {option.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton d'envoi */}
              <button
                onClick={handleSendEmail}
                disabled={isLoading || !subject.trim() || !content.trim()}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Email
              </button>
            </div>
          </div>

          {/* Input file caché */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleAttachmentAdd}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedComposeEmailModal;