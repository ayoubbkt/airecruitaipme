// src/pages/talent/modals/MeetingModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  MapPin, 
  Send, 
  X, 
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Modal pour planifier une réunion avec un candidat
 * Basé sur le design montré dans les images
 */
// src/pages/talent/modals/CandidateModals.jsx
// Importer les dépendances nécessaires en haut du fichier
 
// Remplacer le composant MeetingModal existant
const MeetingModal = ({ isOpen, onClose, onSubmit, candidate, loading = false }) => {
  const [meetingData, setMeetingData] = useState({
    title: '',
    date: '',
    startTime: '11:00',
    duration: '30', // en minutes
    attendees: [],
    location: '',
    isGoogleMeet: true,
    description: ''
  });

  const [showEndTimeOptions, setShowEndTimeOptions] = useState(false);
  const [newAttendee, setNewAttendee] = useState('');

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

  // Initialiser avec le titre par défaut et la date de demain
  useEffect(() => {
    if (isOpen && candidate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setMeetingData(prev => ({
        ...prev,
        title: `Interview with ${candidate.firstName} ${candidate.lastName}`,
        date: tomorrow.toISOString().split('T')[0],
        attendees: [{
          email: candidate.email,
          name: `${candidate.firstName} ${candidate.lastName}`
        }]
      }));
    }
  }, [isOpen, candidate]);

  // Calculer l'heure de fin en fonction de l'heure de début et de la durée
  const getEndTime = () => {
    if (!meetingData.startTime || !meetingData.duration) return '';
    
    const [hours, minutes] = meetingData.startTime.split(':').map(Number);
    const durationMinutes = parseInt(meetingData.duration);
    
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  // Formater l'heure pour l'affichage
  const formatTimeDisplay = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12; // Convertir 0 en 12
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
  };

  // Ajouter un participant
  const handleAddAttendee = () => {
    if (!newAttendee.trim() || !isValidEmail(newAttendee)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Vérifier si l'email existe déjà
    if (meetingData.attendees.some(a => a.email === newAttendee)) {
      toast.warning('This attendee is already added');
      return;
    }
    
    setMeetingData(prev => ({
      ...prev,
      attendees: [
        ...prev.attendees,
        { email: newAttendee, name: newAttendee.split('@')[0] }
      ]
    }));
    
    setNewAttendee('');
  };

  // Supprimer un participant
  const handleRemoveAttendee = (email) => {
    // Ne pas permettre de supprimer le candidat
    if (candidate && email === candidate.email) return;
    
    setMeetingData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a.email !== email)
    }));
  };

  // Valider un email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!meetingData.title.trim() || !meetingData.date || !meetingData.startTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      // Calculer l'heure de fin
      const endTime = getEndTime();
      
      // Formater les données pour l'API
      const startDateTime = new Date(`${meetingData.date}T${meetingData.startTime}`);
      const endDateTime = new Date(`${meetingData.date}T${endTime}`);
      
      const meetingPayload = {
        title: meetingData.title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        attendees: meetingData.attendees,
        location: meetingData.isGoogleMeet ? 'Google Meet' : meetingData.location,
        description: meetingData.description,
        isGoogleMeet: meetingData.isGoogleMeet
      };
      
      await onSubmit(meetingPayload);
      onClose();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error('Failed to schedule meeting');
    }
  };

  // Si le modal n'est pas ouvert, ne rien afficher
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Schedule a Meeting</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Nom de la réunion */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Meeting name"
              value={meetingData.title}
              onChange={(e) => setMeetingData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          {/* Date et heure */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Date */}
            <div>
              <input
                type="date"
                value={meetingData.date}
                onChange={(e) => setMeetingData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* Heure de début */}
            <div>
              <input
                type="time"
                value={meetingData.startTime}
                onChange={(e) => setMeetingData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* Durée / Heure de fin */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEndTimeOptions(!showEndTimeOptions)}
                className="w-full p-3 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                disabled={loading}
              >
                <span>{meetingData.duration ? `${formatTimeDisplay(getEndTime())} (${meetingData.duration}min)` : 'Choose'}</span>
                <ChevronDown size={16} />
              </button>

              {/* Dropdown des options de durée */}
              {showEndTimeOptions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {durationOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setMeetingData(prev => ({ ...prev, duration: option.value }));
                        setShowEndTimeOptions(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {meetingData.attendees.map((attendee, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                >
                  <span>{attendee.name || attendee.email}</span>
                  <button 
                    onClick={() => handleRemoveAttendee(attendee.email)}
                    className="text-blue-600 hover:text-blue-800"
                    disabled={loading || (candidate && attendee.email === candidate.email)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new by typing"
                value={newAttendee}
                onChange={(e) => setNewAttendee(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAttendee();
                  }
                }}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Description / Agenda */}
          <div className="mb-4">
            <textarea
              placeholder="Description or agenda..."
              value={meetingData.description}
              onChange={(e) => setMeetingData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Lieu */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Location"
              value={meetingData.location}
              onChange={(e) => setMeetingData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading || meetingData.isGoogleMeet}
            />
          </div>

          {/* Option Google Meet */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={meetingData.isGoogleMeet}
                onChange={(e) => setMeetingData(prev => ({ 
                  ...prev, 
                  isGoogleMeet: e.target.checked 
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <span className="ml-2 text-gray-700">Google Meet meeting</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !meetingData.title || !meetingData.date || !meetingData.startTime}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send invite
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default MeetingModal;