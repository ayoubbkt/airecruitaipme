import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  Linkedin, 
  MessageCircle, 
  ChevronDown, 
  Send, 
  Paperclip,
  X,
  Eye,
  Star,
  Calendar,
  User,
  FileText,
  Activity,
  Download,
  Edit
} from 'lucide-react';
import { cvService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import EditContactModal from './EditContactModal';
import AddCommentModal from './AddCommentModal';
 


 

// Modal de composition d'email
const ComposeEmailModal = ({ isOpen, onClose, candidate, onEmailSent }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showScheduleDropdown, setShowScheduleDropdown] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState('now');
  const [isLoading, setIsLoading] = useState(false);
  

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
  

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      alert('Veuillez remplir le sujet et le contenu');
      return;
    }

    setIsLoading(true);
    try {
      await cvService.sendMessage(candidate.id, { subject, content, schedule: selectedSchedule });
      onEmailSent();
      onClose();
      setSubject('');
      setContent('');
      setSelectedTemplate('');
      setSelectedSchedule('now');
    } catch (error) {
      console.error('Erreur envoi email:', error);
      alert('Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(`[${template.name}] Interview Opportunity at RecruitPME`);
      setContent(`Hello ${candidate.firstName},\n\nThank you for your application...\n\nBest regards,\nRecruitPME Team`);
    }
    setShowTemplateDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Compose Email</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">To</span>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                TP
              </div>
              <span className="text-sm text-gray-900">{candidate.firstName} {candidate.lastName}</span>
              <span className="text-sm text-gray-500">&lt;{candidate.email}&gt;</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <div className="relative">
                <button
                  onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
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
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-100 rounded"><strong>B</strong></button>
                <button className="p-1 hover:bg-gray-100 rounded"><em>I</em></button>
                <button className="p-1 hover:bg-gray-100 rounded"><u>U</u></button>
                <button className="p-1 hover:bg-gray-100 rounded">•</button>
                <button className="p-1 hover:bg-gray-100 rounded">1.</button>
                <button className="p-1 hover:bg-gray-100 rounded">🔗</button>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                <Calendar className="w-4 h-4 mr-1" /> Scheduling Link
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write your message..."
            />
          </div>

          <button className="flex items-center text-sm text-gray-600 hover:text-gray-800">
            <Paperclip className="w-4 h-4 mr-2" />
            Add attachment
          </button>

          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg flex items-center"
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
                            setSelectedSchedule(option.id);
                            setShowScheduleDropdown(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isLoading ? 'Envoi...' : 'Send Email'} <Send className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CandidateDetail = () => {
  const { companyId } = useAuth();
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [showAdvanceDropdown, setShowAdvanceDropdown] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);



const files = candidate && candidate.resumeUrl
  ? [{
      id: candidate.id,
      name: candidate.resumeUrl.split('/').pop(),
      url: candidate.resumeUrl,
      type: candidate.resumeUrl.endsWith('.pdf') ? 'application/pdf' : 'image/*',
      visibility: 'Public',
      addedBy: `${candidate.firstName} ${candidate.lastName}`,
      createdAt: candidate.createdAt
    }]
  : [];


  const fetchCandidateDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cvService.getCandidateById(companyId, candidateId);
      console.log("fetchCandidateDetails",response.data)
      setCandidate({
      ...response.data,
      messages: response.data.messages || [] // Ensure messages is an array
    });
    
    } catch (err) {
      setError("Candidat non trouvé ou erreur de chargement.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId || !candidateId) {
      setError('Données manquantes pour charger l\'offre d\'emploi.');
      setLoading(false);
      return;
    }
    fetchCandidateDetails();
  }, [candidateId, companyId, navigate]);

  const handleStageChange = async (newStage) => {
    if (!candidate) return;
    try {
      const updatedCandidate = await cvService.updateCandidateStage(candidate.id, newStage);
      setCandidate(updatedCandidate.data);
      setShowAdvanceDropdown(false);
      alert(`Candidat déplacé à l'étape : ${newStage}`);
    } catch (err) {
      alert("Erreur lors du changement d'étape.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 bg-gray-50">
        {error}
      </div>
    );
  }

  if (!candidate) return null;

  const hiringStages = ['Leads', 'Applicants', 'Short List', 'Screening Call', 'Interview', 'Final review', 'Offer', 'Hired', 'Disqualified', 'Archived'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/candidates" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous page
            </Link>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors">
                Disqualify
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowAdvanceDropdown(!showAdvanceDropdown)} 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Advance <ChevronDown className="w-4 h-4 ml-2" />
                </button>
                {showAdvanceDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-20 border">
                    <div className="p-2 text-xs text-gray-500 border-b">Move to:</div>
                    <div className="py-2">
                      {hiringStages.map(stage => (
                        <button 
                          key={stage} 
                          onClick={() => handleStageChange(stage)} 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          {stage}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Candidates in Stage</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                    {`${candidate.firstName.charAt(0)}${candidate.lastName.charAt(0)}`.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{candidate.firstName} {candidate.lastName}</div>
                    <div className="text-xs text-gray-500">In stage {candidate.stage}</div>
                  </div>
                  <div className="flex items-center bg-blue-600 text-white px-2 py-1 rounded text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    {candidate.score || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl">
                    {`${candidate.firstName.charAt(0)}${candidate.lastName.charAt(0)}`.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {candidate.firstName} {candidate.lastName}
                      </h1>
                      <div className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                        <Star className="w-4 h-4 mr-1" />
                        {candidate.score || 'N/A'}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{candidate.job?.title} • {candidate.stage}</p>
                    <p className="text-sm text-gray-500">
                      Added by {candidate.addedBy} - {new Date(candidate.addedAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center mt-3 space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{candidate.email}</span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="border-b">
                {['Overview', 'Messages', 'Files', 'Ratings', 'Activity'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'Overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
                      <p className="text-gray-700 leading-relaxed">{candidate.summary || 'No summary provided.'}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Resume / CV</h3>
                        <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                          <Download className="w-4 h-4 mr-1" />
                          Update Resume
                        </button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                          {candidate.resumeContent || 'No resume content available.'}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions / Answers</h3>
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-500">No answers have been added.</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {candidate.languages?.length > 0 ? (
                          candidate.languages.map(lang => (
                            <span key={lang} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {lang}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No languages provided.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Messages' && (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
      <button 
        onClick={() => setIsEmailModalOpen(true)} 
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
      >
        <Mail className="w-4 h-4 mr-2" />
        New Email
      </button>
    </div>
    
    {!Array.isArray(candidate.messages) || candidate.messages.length === 0 ? (
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <MessageCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No emails or texts have been exchanged yet.</p>
        <button 
          onClick={() => setIsEmailModalOpen(true)} 
          className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Conversation
        </button>
      </div>
    ) : (
      <div className="space-y-4">
        {candidate.messages.map(message => (
          <div key={message.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{message.subject}</span>
              <span className="text-sm text-gray-500">{new Date(message.sentAt).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-700">{message.content}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)}

 {activeTab === 'Files' && (
  <div className="bg-white rounded-xl shadow-sm p-8">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold text-gray-900">Files & Attachments</h3>
      <label className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium cursor-pointer">
        <input
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('resume', file);
            try {
              await cvService.updateCandidate(
                companyId,
                candidate.id,
                formData
              );
              fetchCandidateDetails();
            } catch (err) {
              alert("Erreur lors de l'upload du fichier.");
            }
          }}
        />
        + Upload Files
      </label>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                Visibility
              </div>
            </th>
            <th className="py-2 px-4 text-left">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Added by
              </div>
            </th>
            <th className="py-2 px-4 text-left">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Added
              </div>
            </th>
            <th className="py-2 px-4 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {files.length > 0 ? (
            files.map(file => (
              <tr key={file.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => setPreviewFile(file)}
                  >
                    {file.name}
                  </button>
                </td>
                <td className="py-2 px-4">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                    {file.visibility}
                  </span>
                </td>
                <td className="py-2 px-4">{file.addedBy}</td>
                <td className="py-2 px-4">{new Date(file.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500">
                No files uploaded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    {/* Modal de preview du fichier */}
    {previewFile && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setPreviewFile(null);
          }
        }}
      >
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-4xl w-full max-h-[90vh] relative mx-4">
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100 z-10"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-semibold mb-4 pr-12">{previewFile.name}</h2>
          <div className="overflow-auto max-h-[calc(90vh-120px)]">
            {previewFile.name?.toLowerCase().includes('.pdf') || previewFile.type === 'application/pdf' ? (
              <div className="text-center">
                {/* Essai d'affichage direct du PDF */}
                <iframe
                  src={`${previewFile.url}#view=FitH&toolbar=1`}
                  title={previewFile.name}
                  className="w-full h-[70vh] rounded border mb-4"
                  onLoad={(e) => {
                    console.log('PDF chargé avec succès');
                    // Vérifier si le contenu est bien chargé
                    setTimeout(() => {
                      if (e.target.contentDocument === null) {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }
                    }, 2000);
                  }}
                  onError={(e) => {
                    console.log('Erreur iframe PDF:', e);
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
                
                {/* Fallback si l'iframe ne fonctionne pas */}
                <div className="hidden bg-gray-50 p-8 rounded border">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4 text-lg font-medium">
                    {previewFile.name}
                  </p>
                  <p className="text-gray-500 mb-6">
                    Le PDF ne peut pas être affiché directement dans ce navigateur.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <a
                      href={previewFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ouvrir dans un nouvel onglet
                    </a>
                    <a
                      href={previewFile.url}
                      download={previewFile.name}
                      className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </a>
                  </div>
                </div>
                
                {/* Boutons d'action toujours visibles pour les PDFs */}
                <div className="flex justify-center space-x-4 mt-4">
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Nouvel onglet
                  </a>
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className="inline-flex items-center px-4 py-2 text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Télécharger
                  </a>
                </div>
              </div>
            ) : previewFile.type?.startsWith('image/') || 
               previewFile.name?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
              <div className="text-center">
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name} 
                  className="max-w-full max-h-[70vh] mx-auto rounded shadow mb-4"
                  onError={(e) => {
                    console.log('Erreur lors du chargement de l\'image');
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
                <div className="hidden bg-gray-50 p-8 rounded border">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Impossible de charger l'image.</p>
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir dans un nouvel onglet
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Aperçu non disponible pour ce type de fichier.</p>
                <div className="space-x-4">
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ouvrir
                  </a>
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
)}

                {activeTab === 'Ratings' && (
                  <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <Star className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-500">No ratings submitted yet.</p>
                  </div>
                )}

                
{activeTab === 'Activity' && (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
      <button
        onClick={() => setShowAddComment(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
      >
        + Add Comment
      </button>
    </div>
    {/* Liste des commentaires */}
    <div className="space-y-4">
      {candidate.comments && candidate.comments.length > 0 ? (
        candidate.comments.map(comment => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {comment.authorInitials}
                </div>
                <span className="font-medium text-gray-900">{comment.authorName}</span>
                <span className={`ml-2 text-xs px-2 py-1 rounded ${comment.visibility === 'Public' ? 'bg-green-100 text-green-700' : comment.visibility === 'Private' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {comment.visibility}
                </span>
              </div>
              <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-gray-700">{comment.content}</p>
          </div>
        ))
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Activity className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-500">No comments yet.</p>
        </div>
      )}
    </div>
    {/* Modal d'ajout de commentaire */}
    {showAddComment && (
      <AddCommentModal
        isOpen={showAddComment}
        onClose={() => setShowAddComment(false)}
        candidateId={candidate.id}
        companyId={companyId}
        onCommentAdded={fetchCandidateDetails}
      />
    )}
  </div>
)}
 
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Status</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stage</span>
                  <span className="font-medium text-gray-900">{candidate.stage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Entered Stage</span>
                  <span className="text-sm text-gray-900">{new Date(candidate.enteredStageAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Added</span>
                  <span className="text-sm text-gray-900">{new Date(candidate.addedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">{new Date(candidate.lastUpdatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Contact details</h3>
                  <button onClick={() => setShowEditContact(true)}  className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{candidate.email || 'Non fourni'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{candidate.phoneNumber || 'Non fourni'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Nothing provided</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Linkedin className="w-4 h-4 text-gray-400" />
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                    linkedin.com/in/mariag...
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
       
  <EditContactModal
   isOpen={showEditContact} 
   onClose={() => setShowEditContact(false)}
    candidate={candidate}
    companyId={companyId} 
    onSave={fetchCandidateDetails}
  />
 

      <ComposeEmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
        candidate={candidate} 
        onEmailSent={fetchCandidateDetails} 
      />
    </div>
  );
};

export default CandidateDetail;