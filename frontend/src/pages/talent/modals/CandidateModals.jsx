// frontend/src/components/candidate/modals/CandidateModals.jsx

import React, { useState } from 'react';
import { 
  Send, Mail, Calendar, Upload, Eye, EyeOff, Users, 
  Clock, MapPin, Video, FileText, X, ChevronDown,  Paperclip
} from 'lucide-react';

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
export const CommentModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!content.trim()) return;
    
    try {
      await onSubmit({ content, visibility, mentionedUsers });
      setContent('');
      setVisibility('PUBLIC');
      setMentionedUsers([]);
      onClose();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const visibilityOptions = [
    { 
      value: 'PUBLIC', 
      label: 'Public', 
      desc: 'Visible to everyone on job', 
      color: 'bg-green-100 text-green-700',
      icon: Eye
    },
    { 
      value: 'PRIVATE', 
      label: 'Private', 
      desc: 'Visible to Hiring Manager and above', 
      color: 'bg-yellow-100 text-yellow-700',
      icon: EyeOff
    },
    { 
      value: 'CONFIDENTIAL', 
      label: 'Confidential', 
      desc: 'Visible to you and Company admins', 
      color: 'bg-red-100 text-red-700',
      icon: EyeOff
    }
  ];

  const selectedOption = visibilityOptions.find(opt => opt.value === visibility);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">New Comment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-2">
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs font-bold border border-gray-200">H1</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs font-bold border border-gray-200">H2</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs font-bold border border-gray-200">H3</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs font-bold border border-gray-200">B</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs italic border border-gray-200">I</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs underline border border-gray-200">S</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs border border-gray-200">•</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs border border-gray-200">1.</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100 text-xs border border-gray-200">🔗</button>
          </div>
          {/* Textarea */}
          <textarea
            className="w-full border rounded px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500"
            rows={6}
            placeholder="Write your comment..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            disabled={loading}
          />
          {/* Visibility selector */}
          <div className="flex items-center gap-2 mb-4 relative">
            <button
              type="button"
              onClick={() => setShowDropdown(v => !v)}
              className={`flex items-center px-3 py-1 rounded border ${selectedOption.color} text-xs font-medium focus:outline-none`}
            >
              <selectedOption.icon size={12} className="mr-1" />
              {selectedOption.label}
              <span className="ml-2 text-gray-500">&#9662;</span>
            </button>
            <span className="text-sm text-gray-500">{selectedOption.desc}</span>
            {showDropdown && (
              <div className="absolute left-0 top-8 w-80 bg-white rounded-xl shadow-lg border z-30">
                {visibilityOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setVisibility(opt.value); setShowDropdown(false); }}
                    className={`flex items-center w-full px-4 py-2 text-left gap-2 hover:bg-gray-50 ${opt.value === visibility ? 'font-semibold' : ''}`}
                  >
                    <span className={`inline-block w-20 text-center rounded ${opt.color} py-1 text-xs`}>
                      <opt.icon size={12} className="inline mr-1" />
                      {opt.label}
                    </span>
                    <span className="text-xs text-gray-600">{opt.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Actions */}
          <div className="flex justify-end gap-4 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !content.trim()} 
              className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold flex items-center gap-2"
            >
              <Send size={16} />
              {loading ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal pour composer un email
export const EmailModal = ({ isOpen, onClose, onSubmit, candidate, loading = false }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);

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

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setTemplateId(templateId);
      setSubject(`[${template.name}] Interview Opportunity at RecruitPME`);
      setContent(`Hello ${candidate?.firstName},\n\nThank you for your application...\n\nBest regards,\nRecruitPME Team`);
    }
    setShowTemplateDropdown(false);
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim()) {
      alert('Veuillez remplir le sujet et le contenu');
      return;
    }

    try {
      await onSubmit({
        subject,
        content,
        templateId: templateId || null,
        scheduledFor: scheduledFor || null,
        attachments
      });
      console.log('Email sent successfully',subject,
        content,
        templateId,
        scheduledFor,
        attachments);
      
      // Reset form
      setSubject('');
      setContent('');
      setTemplateId('');
      setScheduledFor('');
      setAttachments([]);
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Erreur lors de l\'envoi de l\'email');
    }
  };

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
                  disabled={loading}
                >
                  Templates <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {showTemplateDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-10">
                    <div className="p-2">
                      {templates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template.id)}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          disabled={loading}
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter subject..."
              disabled={loading}
            />
          </div>

          {/* Éditeur de texte */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-100 rounded" disabled={loading}><strong>B</strong></button>
                <button className="p-1 hover:bg-gray-100 rounded" disabled={loading}><em>I</em></button>
                <button className="p-1 hover:bg-gray-100 rounded" disabled={loading}><u>U</u></button>
                <button className="p-1 hover:bg-gray-100 rounded" disabled={loading}>•</button>
                <button className="p-1 hover:bg-gray-100 rounded" disabled={loading}>1.</button>
                <button className="p-1 hover:bg-gray-100 rounded" disabled={loading}>🔗</button>
              </div>
              <button 
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                disabled={loading}
              >
                <Calendar className="w-4 h-4 mr-1" /> Scheduling Link
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write your message..."
              disabled={loading}
            />
          </div>

          {/* Pièce jointe */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
              disabled={loading}
            >
              <Paperclip className="w-4 h-4" />
              Add attachment
            </button>
            {attachments.length > 0 && (
              <span className="text-sm text-gray-600">
                {attachments.length} file(s) attached
              </span>
            )}
          </div>

          {/* Pied de page */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg flex items-center"
                  disabled={loading}
                >
                  Send Later <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {showScheduleDropdown && (
                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border z-10">
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
                {loading ? 'Envoi...' : 'Send Email'} <Send className="w-4 h-4 ml-2" />
              </button>
            </div>
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