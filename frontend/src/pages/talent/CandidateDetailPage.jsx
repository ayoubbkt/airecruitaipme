import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Calendar, FileText, MessageSquare, 
  Star, Activity, Upload, Send, Clock, Users, ExternalLink,
  ChevronLeft, Edit, MoreVertical, Download, 
  Eye, EyeOff, Trash2, Pin, ChevronDown, Brain,
  Lock, Shield , MessageCircle, ChevronUp,  Reply, Check, X, Archive
} from 'lucide-react';

 

import { 
  useCandidateManagement,
  useCandidatesByStage 
} from '../../hooks/useCandidates';
import { 
  CommentModal, 
  EmailModal, 
  MeetingModal, 
  FileUploadModal 
} from './modals/CandidateModals';
import { useAuth } from '../../contexts/AuthContext';
import ActivityFeed from './modals/ActivityFeed'; 





const CandidateDetailPage = () => {
  const { candidateId } = useParams();
  const { companyId } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showMoveToDropdown, setShowMoveToDropdown] = useState(false);
  const [replyToComment, setReplyToComment] = useState(null);
  const [showAddComment, setShowAddComment] = useState(false);
  const dropdownRef = useRef(null);

  const {
    candidate,
    comments,
    files,
    activities,
    emails,
    ratings,
    meetings,
    stageManagement,
    loading,
    error,
    refreshAll
  } = useCandidateManagement(companyId, candidateId);

  const currentStageId = candidate.candidate?.applications?.[0]?.currentStage?.id;
  const { candidates: stageCandidates } = useCandidatesByStage(companyId, currentStageId);

  const stages = [
    { id: '1', name: 'Leads' },
    { id: '2', name: 'Applicants' },
    { id: '3', name: 'Short List' },
    { id: '4', name: 'Screening Call' },
    { id: '5', name: 'Interview' },
    { id: '6', name: 'Final review' },
    { id: '7', name: 'Offer' },
    { id: '8', name: 'Hired' },
    { id: '9', name: 'Disqualified' },
    { id: '10', name: 'Archived' },
  ];

 
  const handleAddComment = async (commentData) => {
    await comments.addComment(commentData);
    await refreshAll();
  };

  const handleSendEmail = async (emailData) => {
    await emails.sendEmail(emailData);
    await refreshAll();
  };

  const handleScheduleMeeting = async (meetingData) => {
    await meetings.scheduleMeeting(meetingData);
    await refreshAll();
  };

  const handleFileUpload = async (file, visibility) => {
    await files.uploadFile(file, visibility);
    await refreshAll();
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      await files.deleteFile(fileId);
      await refreshAll();
    }
  };

  const handleMoveToStage = async (newStageId) => {
    try {
      await stageManagement.moveCandidateToStage(candidateId, newStageId);
      await refreshAll();
      setShowMoveToDropdown(false);
    } catch (error) {
      console.error('Error moving candidate:', error);
    }
  };

  

  const handleReply = (comment) => {
    setReplyToComment({
      id: comment.id,
      authorId: comment.author.id,
      authorName: comment.author.lastName,
      createdAt: comment.createdAt
    });
    setShowCommentModal(true);
  };

  const CommentItem = ({ comment, comments = [], handleReply,isReply = false, level = 0 }) => {
    const [showReplies, setShowReplies] = useState(true);
    const [parsedContent, setParsedContent] = useState('');

    useEffect(() => {
      // Parser le contenu HTML pour afficher correctement les mentions
      if (comment.content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(comment.content, 'text/html');
        const mentions = doc.querySelectorAll('[data-mention-id]');
        
        mentions.forEach(mention => {
          mention.className = 'inline-flex items-center px-2 py-1 mx-1 text-sm bg-blue-100 text-blue-800 rounded-full font-medium cursor-pointer hover:bg-blue-200 transition-colors';
        });
        
        setParsedContent(doc.body.innerHTML);
      }
    }, [comment.content]);

    const getVisibilityIcon = (visibility) => {
      switch (visibility) {
        case 'Private': return <Lock className="w-3 h-3" />;
        case 'Confidential': return <Shield className="w-3 h-3" />;
        default: return <Eye className="w-3 h-3" />;
      }
    };

    const getVisibilityColor = (visibility) => {
      switch (visibility) {
        case 'Private': return 'bg-yellow-100 text-yellow-700';
        case 'Confidential': return 'bg-red-100 text-red-700';
        default: return 'bg-green-100 text-green-700';
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes < 1 ? 'just now' : `${diffMinutes}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    };

    const replies = comments.filter(c => c.replyToId === comment.id);

    return (
      <div className={`${isReply ? 'ml-12 mt-3' : 'mb-6'} ${level > 2 ? 'ml-6' : ''}`}>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* En-tête du commentaire */}
          <div className="flex items-start justify-between p-4 pb-2">
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                comment.author?.type === 'ai' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {comment.author?.initials || 'U'}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">
                    {comment.author?.lastName || 'Unknown User'}
                  
                  </span>
                  
                  {comment.author?.type === 'ai' && (
                    <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                      AI Assistant
                    </span>
                  )}
                  
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-xs rounded-full ${getVisibilityColor(comment.visibility)}`}>
                    {getVisibilityIcon(comment.visibility)}
                    <span>{comment.visibility}</span>
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                  
                  {comment.mentions && comment.mentions.length > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-blue-600">
                      <Mail className="w-3 h-3" />
                      <span>Email sent</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleReply(comment)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Reply to this comment"
              >
                <Reply className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenu du commentaire */}
          <div className="px-4 pb-4">
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
            
            {comment.mentions && comment.mentions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>Mentioned:</span>
                  <div className="flex flex-wrap gap-1">
                    {comment.mentions.map((mention, index) => (
                      <span 
                        key={mention.id}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        @{mention.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Réponses */}
          {replies.length > 0 && (
            <div className="border-t border-gray-100">
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</span>
                </div>
                {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showReplies && (
                <div className="p-4 space-y-3 bg-gray-50">
                  {replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      isReply={true}
                      level={level + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMoveToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };

    
  }, []);

  const currentStageName = candidate.candidate?.applications?.[0]?.currentStage?.name || '';
  const currentIndex = stages.findIndex(s => s.name === currentStageName);
  const nextStageId = currentIndex >= 0 && currentIndex < stages.length - 1 ? stages[currentIndex + 1].id : null;
  const disqualifiedId = stages.find(s => s.name === 'Disqualified')?.id || '9';

  const VisibilityBadge = ({ visibility }) => {
    const configs = {
      PUBLIC: { icon: Eye, color: 'bg-blue-100 text-blue-800', label: 'Public' },
      PRIVATE: { icon: EyeOff, color: 'bg-yellow-100 text-yellow-800', label: 'Private' },
      CONFIDENTIAL: { icon: EyeOff, color: 'bg-red-100 text-red-800', label: 'Confidential' }
    };
    const config = configs[visibility] || configs.PUBLIC;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'STAGE_CHANGE': return { icon: Users, color: 'bg-blue-100 text-blue-600' };
        case 'COMMENT_ADDED': return { icon: MessageSquare, color: 'bg-green-100 text-green-600' };
        case 'EMAIL_SENT': return { icon: Mail, color: 'bg-blue-100 text-blue-600' };
        case 'MEETING_SCHEDULED': return { icon: Calendar, color: 'bg-orange-100 text-orange-600' };
        case 'FILE_UPLOADED': return { icon: Upload, color: 'bg-indigo-100 text-indigo-600' };
        case 'RATING_ADDED': return { icon: Star, color: 'bg-yellow-100 text-yellow-600' };
        case 'AI_SCREENING': return { icon: Brain, color: 'bg-purple-100 text-purple-600' };
        default: return { icon: Activity, color: 'bg-gray-100 text-gray-600' };
      }
    };

    const { icon: Icon, color } = getActivityIcon(activity.type);

    return (
      <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1">
          <p className="text-gray-900">{activity.description}</p>
          <div className="flex items-center gap-2 mt-1">
            {activity.performedBy && (
              <span className="text-sm text-gray-600">
                by {activity.performedBy.firstName} {activity.performedBy.lastName}
              </span>
            )}
            <span className="text-sm text-gray-500">{activity.createdAt}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    console.log("companyId, candidateId : ",companyId, candidateId);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={refreshAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
const organizeComments = (comments) => {
  return (comments.comments || []).filter(comment => !comment.replyToId);
};
  const candidateData = candidate.candidate;
  const jobStages = candidateData?.applications?.[0]?.job?.jobWorkflow?.stages || [];
  if (!candidateData) return null;
const rootComments = organizeComments(comments);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} />
              Previous page
            </button>
          </div>
          <div className="flex items-center gap-2" ref={dropdownRef}>
            <button
              onClick={() => setShowCommentModal(true)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Pin size={16} />
            </button>
            <button
              onClick={() => setShowEmailModal(true)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Mail size={16} />
            </button>
            <button
              onClick={() => setShowMeetingModal(true)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Calendar size={16} />
            </button>
            <button
              onClick={() => setShowCommentModal(true)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <MessageSquare size={16} />
            </button>
            <button
              onClick={() => handleMoveToStage(disqualifiedId)}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Disqualify
            </button>
             
<button
  onClick={() => setShowMoveToDropdown(!showMoveToDropdown)}
  className="px-4 py-2 bg-blue-600 flex text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm relative"
>
  Advance <ChevronDown className="w-4 h-4 ml-2" />
  {showMoveToDropdown && (
    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-20 border">
      <div className="p-2 text-xs text-gray-500 border-b">Move to:</div>
      <div className="p-2">
        {console.log("candidate.applications[0].job.jobWorkflow.stages : ",jobStages)}
        {jobStages.map(stage => (
          <button
            key={stage.id}
            onClick={() => handleMoveToStage(stage.id)}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            {/* Ajoute une icône selon le type de stage */}
            {stage.name === 'Leads' && <User className="w-4 h-4" />}
            {stage.name === 'Applicants' && <FileText className="w-4 h-4" />}
            {stage.name === 'Short List' && <Star className="w-4 h-4" />}
            {stage.name === 'Screening Call' && <Phone className="w-4 h-4" />}
            {stage.name === 'Interview' && <Calendar className="w-4 h-4" />}
            {stage.name === 'Final review' && <Activity className="w-4 h-4" />}
            {stage.name === 'Offer' && <Mail className="w-4 h-4" />}
            {stage.name === 'Hired' && <Check className="w-4 h-4" />}
            {stage.name === 'Disqualified' && <X className="w-4 h-4" />}
            {stage.name === 'Archived' && <Archive className="w-4 h-4" />}
            {stage.name}
          </button>
        ))}
      </div>
    </div>
  )}
</button>
 
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar candidats dans le même stage */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Candidates in Stage</h2>
          <div className="space-y-3">
            {stageCandidates.map(stageCandidate => (
              <div 
                key={stageCandidate.id}
                onClick={() => navigate(`/companies/${companyId}/candidates/${stageCandidate.id}`)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  stageCandidate.id === candidateId 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {stageCandidate.firstName?.[0]}{stageCandidate.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {stageCandidate.firstName} {stageCandidate.lastName} 
                  </div>
                  <div className="text-sm text-gray-500">In stage 2d</div>
                </div>
                <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {stageCandidate.ai_screening_score || stageCandidate.score || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1">
          <div className="p-6">
            {/* En-tête du candidat */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xl">
                      {candidateData.firstName?.[0]}{candidateData.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {candidateData.firstName} {candidateData.lastName}
                      </h1>
                      <div className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {candidateData.ai_screening_score || candidateData.score || 'N/A'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {candidateData.applications?.[0]?.jobTitle || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {candidateData.applications?.[0]?.currentStage?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Added by {candidateData.addedBy} - {candidateData.enteredStage}
                    </div>
                  </div>
                </div>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  Edit
                </button>
              </div>

              {/* Navigation par onglets */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  {[
                    { id: 'overview', label: 'Overview', icon: User },
                    { id: 'messages', label: 'Messages', icon: MessageSquare },
                    { id: 'files', label: 'Files', icon: FileText },
                    { id: 'ratings', label: 'Ratings', icon: Star },
                    { id: 'activity', label: 'Activity', icon: Activity }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Contenu des onglets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {candidateData.comment || 'No summary provided'}
                      </p>
                    </div>

                    {/* Resume/CV */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Resume / CV</h3>
                        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                          <ExternalLink size={16} />
                          Update Resume
                        </button>
                      </div>
                      
<div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
  {candidateData.resumeUrl && (
    <>
      {/* Si le CV est une image */}
      {(candidateData.resumeUrl.endsWith('.png') || candidateData.resumeUrl.endsWith('.jpg') || candidateData.resumeUrl.endsWith('.jpeg')) ? (
        <img
          src={candidateData.resumeUrl}
          alt="CV du candidat"
          style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
        />
      ) : candidateData.resumeUrl.endsWith('.pdf') ? (
        // Si le CV est un PDF, affiche dans un <iframe>
        <iframe
          src={candidateData.resumeUrl}
          title="CV PDF"
          width="100%"
          height="400px"
          style={{ border: 'none', borderRadius: '8px' }}
        />
      ) : (
        // Sinon, affiche le texte extrait
        <pre className="whitespace-pre-wrap text-sm text-gray-700">
          {candidateData.resumeContent || 'No resume content available'}
        </pre>
      )}
    </>
  )}
  {!candidateData.resumeUrl && (
    <pre className="whitespace-pre-wrap text-sm text-gray-700">
      {candidateData.resumeContent || 'No resume content available'}
    </pre>
  )}
</div>

                    </div>
                  </div>
                )}

                {activeTab === 'messages' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowCommentModal(true)}
                          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <MessageSquare size={16} />
                          Add Comment
                        </button>
                        <button
                          onClick={() => setShowEmailModal(true)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Mail size={16} />
                          New Email
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {comments.comments.length === 0 && emails.emails.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                          <p>No emails or texts have been exchanged yet.</p>
                        </div>
                      ) : (
                        <>
                          {/* Afficher emails et commentaires mélangés par date */}
                          {[...emails.emails, ...comments.comments]
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .map(item => (
                              <div key={`${item.type || 'comment'}-${item.id}`} 
                                   className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    {item.sender ? <Mail size={16} /> : <MessageSquare size={16} />}
                                  </div>
                                  <div className="flex-1">
                                    {item.subject && (
                                      <div className="font-medium text-gray-900 mb-2">{item.subject}</div>
                                    )}
                                    <div className="text-gray-700 mb-2">{item.content}</div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <span>
                                        {item.sender 
                                          ? `${item.sender.firstName} ${item.sender.lastName}` 
                                          : `${item.author?.firstName} ${item.author?.lastName}`}
                                      </span>
                                      <span>•</span>
                                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                      {item.visibility && <VisibilityBadge visibility={item.visibility} />}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'files' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Files & Attachments</h3>
                      <button 
                        onClick={() => setShowFileModal(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Upload size={16} />
                        Upload Files
                      </button>
                    </div>

                    {files.files.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No files uploaded yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600 border-b border-gray-200 pb-2">
                          <div>Name</div>
                          <div>Visibility</div>
                          <div>Added by</div>
                          <div>Added</div>
                        </div>

                        {files.files.map(file => (
                          <div key={file.id} className="grid grid-cols-4 gap-4 items-center py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-gray-400" />
                              <span className="text-gray-900">{file.fileName}</span>
                            </div>
                            <div>
                              <VisibilityBadge visibility={file.visibility} />
                            </div>
                            <div className="text-gray-600">
                              {file.uploadedBy?.firstName} {file.uploadedBy?.lastName}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">
                                {new Date(file.createdAt).toLocaleDateString()}
                              </span>
                              <div className="flex items-center gap-1">
                                <button className="p-1 hover:bg-gray-100 rounded">
                                  <Download size={14} className="text-gray-400" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteFile(file.id)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <Trash2 size={14} className="text-red-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'ratings' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Ratings</h3>
                      <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Star size={16} />
                        Add Rating
                      </button>
                    </div>

                    {ratings.ratings.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Star size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No ratings have been submitted yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ratings.ratings.map(rating => (
                          <div key={rating.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-gray-900">
                                {rating.template?.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold">{rating.overallScore}/5</span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              By {rating.rater?.firstName} {rating.rater?.lastName} • {rating.application?.currentStage?.name}
                            </div>
                            {rating.comments && (
                              <div className="text-gray-700 text-sm">{rating.comments}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    {/* <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity</h3> */}

                  
                    {/* Remplace tout ce bloc par ActivityFeed */}
    {/* <ActivityFeed
      candidateId={candidateId}
      companyId={companyId}
      comments={comments.comments}
      onCommentsUpdate={async () => {
        await refreshAll();
      }}/>  */}

      {/* En-tête avec bouton d'ajout */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Add comments, use @mentions to notify teammates, and track all candidate interactions
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddComment(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    + Add Comment
                  </button>
                </div>

                  {activities.activities.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Activity size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No activity recorded yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activities.activities.map(activity => (
                          <ActivityItem key={activity.id} activity={activity} />
                        ))}
                      </div>
                    )}

                {/* Liste des commentaires */}
                <div className="space-y-4">
                  {rootComments.length > 0 ? (
                    rootComments.map(comment => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
    comments={comments.comments}
    handleReply={handleReply}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h4>
                      <p className="text-gray-500 mb-4">
                        Start the conversation by adding the first comment about this candidate.
                      </p>
                      <button
                        onClick={() => setShowAddComment(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add First Comment
                      </button>
                    </div>
                  )}
                </div>
            

    
  </div>
                   
                )}
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600">Stage</div>
                      <div className="font-medium text-gray-900">
                        {candidateData.applications?.[0]?.currentStage?.name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Entered Stage</div>
                      <div className="font-medium text-gray-900">
                        {candidateData.enteredStage || 'N/A'}
                        
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Added</div>
                      <div className="font-medium text-gray-900">
                        {new Date(candidateData.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Last Updated</div>
                      <div className="font-medium text-gray-900">
                        {new Date(candidateData.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact details */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Contact details</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-medium text-gray-900">{candidateData.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Phone</div>
                        <div className="font-medium text-gray-900">
                          {candidateData.phoneNumber || 'Not provided'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Address</div>
                        <div className="font-medium text-gray-900">
                          {candidateData.address || 'Nothing provided'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ExternalLink size={16} className="text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">LinkedIn</div>
                        <div className="font-medium text-blue-600 hover:text-blue-700">
                          {candidateData.linkedin || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        candidateId={candidateId} // doit être défini
        companyId={companyId} 
        onSubmit={handleAddComment}
        loading={comments.loading}
        replyTo={replyToComment}
      />

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleSendEmail}
        candidate={candidateData}
        loading={emails.loading}
      />

      <MeetingModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        onSubmit={handleScheduleMeeting}
        candidate={candidateData}
        loading={meetings.loading}
      />

      <FileUploadModal
        isOpen={showFileModal}
        onClose={() => setShowFileModal(false)}
        onSubmit={handleFileUpload}
        loading={files.loading}
      />
    </div>
  );
};

export default CandidateDetailPage;