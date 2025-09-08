// components/modals/ScheduleMeetingModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Calendar,
  Clock,
  Users,
  MapPin,
  Video,
  ChevronDown,
  Plus,
  Trash2,
  Send
} from 'lucide-react';

/**
 * Modal de planification de réunion/entretien
 * Permet de définir date, heure, durée, participants et détails
 */
const ScheduleMeetingModal = ({ 
  isOpen, 
  onClose, 
  candidate,
  companyId,
  onMeetingScheduled 
}) => {
  const [meetingData, setMeetingData] = useState({
    title: '',
    date: '',
    startTime: '11:00',
    duration: '30',
    location: '',
    isGoogleMeet: true,
    description: '',
    participants: []
  });
  
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const modalRef = useRef(null);

  // Options de durée prédéfinies
  const durationOptions = [
    { value: '15', label: '11:15am (15min)' },
    { value: '30', label: '11:30am (30min)' },
    { value: '45', label: '11:45am (45min)' },
    { value: '60', label: '12:00pm (1hr)' },
    { value: '75', label: '12:15pm (1hr 15min)' },
    { value: '90', label: '12:30pm (1hr 30min)' },
    { value: '105', label: '12:45pm (1hr 45min)' },
    { value: '120', label: '1:00pm (2hr)' },
    { value: '135', label: '1:15pm (2hr 15min)' },
    { value: '150', label: '1:30pm (2hr 30min)' }
  ];

  // Initialiser avec le candidat et un responsable
  useEffect(() => {
    if (isOpen && candidate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setMeetingData(prev => ({
        ...prev,
        title: `Entretien - ${candidate.firstName} ${candidate.lastName}`,
        date: tomorrow.toISOString().split('T')[0],
        participants: [
          { 
            id: 'candidate', 
            name: `${candidate.firstName} ${candidate.lastName}`, 
            email: candidate.email, 
            type: 'candidate' 
          }
        ]
      }));
    }
  }, [isOpen, candidate]);

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

  // Mise à jour des champs
  const handleInputChange = (field, value) => {
    setMeetingData(prev => ({ ...prev, [field]: value }));
  };

  // Calcul de l'heure de fin
  const getEndTime = () => {
    if (!meetingData.startTime || !meetingData.duration) return 'Choose';
    
    const [hours, minutes] = meetingData.startTime.split(':').map(Number);
    const durationMinutes = parseInt(meetingData.duration);
    
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    
    const period = endHours >= 12 ? 'pm' : 'am';
    const displayHours = endHours > 12 ? endHours - 12 : endHours === 0 ? 12 : endHours;
    
    return `${displayHours}:${endMins.toString().padStart(2, '0')}${period}`;
  };

  // Ajouter un participant par email
  const handleAddParticipant = () => {
    if (!newParticipantEmail.trim()) return;
    
    const existingParticipant = meetingData.participants.find(
      p => p.email.toLowerCase() === newParticipantEmail.toLowerCase()
    );
    
    if (existingParticipant) {
      setError('Ce participant est déjà ajouté');
      return;
    }

    const newParticipant = {
      id: Date.now().toString(),
      email: newParticipantEmail.trim(),
      name: newParticipantEmail.split('@')[0],
      type: 'external'
    };

    setMeetingData(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }));

    setNewParticipantEmail('');
    setError(null);
  };

  // Supprimer un participant
  const handleRemoveParticipant = (participantId) => {
    setMeetingData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== participantId)
    }));
  };

  // Ajouter un membre de l'équipe
  const handleAddTeamMember = (member) => {
    const existingParticipant = meetingData.participants.find(
      p => p.email === member.email
    );
    
    if (existingParticipant) return;

    const newParticipant = {
      id: member.id,
      name: member.name,
      email: member.email,
      type: 'team'
    };

    setMeetingData(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }));
  };

  // Envoyer l'invitation
  const handleSendInvite = async () => {
    if (!meetingData.title.trim()) {
      setError('Le titre de la réunion est requis');
      return;
    }

    if (!meetingData.date || !meetingData.startTime) {
      setError('La date et l\'heure sont requises');
      return;
    }

    if (meetingData.participants.length === 0) {
      setError('Au moins un participant est requis');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const meetingPayload = {
        ...meetingData,
        candidateId: candidate.id,
        endTime: getEndTime(),
        participants: meetingData.participants.map(p => ({
          email: p.email,
          name: p.name,
          type: p.type
        }))
      };

      const response = await fetch(
        `/api/scheduling/companies/${companyId}/meetings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(meetingPayload)
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la planification de la réunion');
      }

      onMeetingScheduled?.();
      onClose();

    } catch (error) {
      console.error('Erreur lors de la planification:', error);
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
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50" />

        {/* Modal */}
        <div
          ref={modalRef}
          className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
        >
          {/* En-tête */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Schedule a Meeting</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-6">
            {/* Titre de la réunion */}
            <div>
              <input
                type="text"
                placeholder="Meeting name"
                value={meetingData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date et heure */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date */}
              <div className="relative">
                <div className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white">
                  <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="date"
                    value={meetingData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="flex-1 focus:outline-none"
                  />
                </div>
              </div>

              {/* Heure de début */}
              <div className="relative">
                <div className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white">
                  <span className="text-sm font-medium text-gray-600 mr-2">from</span>
                  <input
                    type="time"
                    value={meetingData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="flex-1 focus:outline-none"
                  />
                </div>
              </div>

              {/* Durée avec dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-600 mr-2">to</span>
                    <span className="text-sm text-gray-900">{getEndTime()}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showDurationDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {durationOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          handleInputChange('duration', option.value);
                          setShowDurationDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Participants</h4>
              
              {/* Liste des participants */}
              <div className="space-y-2">
                {meetingData.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        participant.type === 'candidate' 
                          ? 'bg-blue-100 text-blue-600' 
                          : participant.type === 'team'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                        <div className="text-xs text-gray-500">{participant.email}</div>
                      </div>
                    </div>
                    
                    {participant.type !== 'candidate' && (
                      <button
                        onClick={() => handleRemoveParticipant(participant.id)}
                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Ajouter des participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Par email */}
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">Add new by typing</div>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      placeholder="*person@email.com"
                      value={newParticipantEmail}
                      onChange={(e) => setNewParticipantEmail(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
                    />
                    <button
                      onClick={handleAddParticipant}
                      className="px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Membres de l'équipe */}
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">Team Members</div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {teamMembers.map((member) => {
                      const isAdded = meetingData.participants.some(p => p.email === member.email);
                      return (
                        <button
                          key={member.id}
                          onClick={() => !isAdded && handleAddTeamMember(member)}
                          disabled={isAdded}
                          className={`w-full flex items-center space-x-2 p-2 text-left text-sm rounded-lg transition-colors ${
                            isAdded 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'hover:bg-blue-50 text-gray-700'
                          }`}
                        >
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-green-600">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="flex-1 truncate">{member.name}</span>
                          {isAdded && <span className="text-xs text-gray-400">Added</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <textarea
                placeholder="Add meeting description, agenda, or notes..."
                value={meetingData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Lieu */}
            <div>
              <input
                type="text"
                placeholder="Location"
                value={meetingData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Google Meet */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="googleMeet"
                  checked={meetingData.isGoogleMeet}
                  onChange={(e) => handleInputChange('isGoogleMeet', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="googleMeet" className="ml-2 flex items-center text-sm font-medium text-gray-700">
                  <Video className="w-4 h-4 mr-1 text-blue-600" />
                  Google Meet meeting
                </label>
              </div>
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
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSendInvite}
              disabled={isLoading || !meetingData.title.trim()}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Invite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;