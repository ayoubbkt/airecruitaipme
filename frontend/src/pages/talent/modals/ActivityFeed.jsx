// Composant Activity Feed avec système de réponses et mentions
import React, { useState, useEffect } from 'react';
import { 
  Reply, 
  Eye, 
  Lock, 
  Shield, 
  Mail,
  Clock,
  User,
  MessageCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  CommentModal 
} from './CandidateModals';
/**
 * Composant pour afficher un commentaire avec ses réponses
 */
const CommentItem = ({ 
  comment, 
  onReply, 
  currentUserId, 
  isReply = false,
  level = 0 
}) => {
  const [showReplies, setShowReplies] = useState(true);
  const [parsedContent, setParsedContent] = useState('');

  useEffect(() => {
    // Parser le contenu HTML pour afficher correctement les mentions
    if (comment.content) {
      const parsed = parseCommentContent(comment.content);
      setParsedContent(parsed);
    }
  }, [comment.content]);

  // Parser le contenu pour identifier et styliser les mentions
  const parseCommentContent = (htmlContent) => {
    if (!htmlContent) return comment.textContent || '';
    
    // Convertir les mentions en liens/badges
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const mentions = doc.querySelectorAll('[data-mention-id]');
    
    mentions.forEach(mention => {
      const mentionId = mention.getAttribute('data-mention-id');
      const mentionType = mention.getAttribute('data-mention-type');
      const mentionName = mention.textContent;
      
      // Créer un badge stylisé pour la mention
      mention.className = `inline-flex items-center px-2 py-1 mx-1 text-sm bg-blue-100 text-blue-800 rounded-full font-medium cursor-pointer hover:bg-blue-200 transition-colors`;
      mention.setAttribute('title', `Click to view ${mentionName}'s profile`);
    });
    
    return doc.body.innerHTML;
  };

  // Obtenir l'icône de visibilité
  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'Private':
        return <Lock className="w-3 h-3" />;
      case 'Confidential':
        return <Shield className="w-3 h-3" />;
      default:
        return <Eye className="w-3 h-3" />;
    }
  };

  // Obtenir la couleur de visibilité
  const getVisibilityColor = (visibility) => {
    switch (visibility) {
      case 'Private':
        return 'bg-yellow-100 text-yellow-700';
      case 'Confidential':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  // Formater la date
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

  return (
    <div className={`${isReply ? 'ml-12 mt-3' : 'mb-6'} ${level > 2 ? 'ml-6' : ''}`}>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* En-tête du commentaire */}
        <div className="flex items-start justify-between p-4 pb-2">
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              comment.author?.type === 'ai' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {comment.author?.avatar || comment.author?.initials || 'U'}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">
                  {comment.author?.lastName  || 'Unknown User'}
                  {console.log("comment",comment)}
                </span>
                
                {/* Badge de type d'utilisateur */}
                {comment.author?.type === 'ai' && (
                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                    AI Assistant
                  </span>
                )}
                
                {/* Badge de visibilité */}
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
                
                {/* Indicateur d'email envoyé pour les mentions */}
                {comment.mentions && comment.mentions.length > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-blue-600">
                    <Mail className="w-3 h-3" />
                    <span>Email sent</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onReply(comment)}
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
          
          {/* Mentions affichées */}
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
        {comment.replies && comment.replies.length > 0 && (
          <div className="border-t border-gray-100">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
              </div>
              {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showReplies && (
              <div className="p-4 space-y-3 bg-gray-50">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onReply={onReply}
                    currentUserId={currentUserId}
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

/**
 * Composant principal Activity Feed
 */
const ActivityFeed = ({ 
  candidateId, 
  companyId, 
  comments = [], 
  onCommentsUpdate 
}) => {
  const [showAddComment, setShowAddComment] = useState(false);
  const [replyToComment, setReplyToComment] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Récupérer l'ID de l'utilisateur actuel
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const user = await response.json();
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    };

    getCurrentUser();
  }, []);

  // Gérer la réponse à un commentaire
  const handleReply = (comment) => {
    setReplyToComment({
      id: comment.id,
      authorId: comment.author.id,
      authorName: comment.author.name,
      createdAt: comment.createdAt
    });
    setShowAddComment(true);
  };

  // Fermer le modal et réinitialiser la réponse
  const handleCloseModal = () => {
    setShowAddComment(false);
    setReplyToComment(null);
  };

  // Organiser les commentaires en arbre (commentaires principaux et réponses)
  const organizeComments = (comments) => {
    const commentMap = new Map();
    const rootComments = [];

    // Créer une map de tous les commentaires
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Organiser en arbre
    comments.forEach(comment => {
      if (comment.replyToId && commentMap.has(comment.replyToId)) {
        // C'est une réponse
        commentMap.get(comment.replyToId).replies.push(commentMap.get(comment.id));
      } else {
        // C'est un commentaire principal
        rootComments.push(commentMap.get(comment.id));
      }
    });

    return rootComments;
  };

  const organizedComments = organizeComments(comments);

  return (
    <div className="space-y-6">
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

      {/* Guide d'utilisation */}
      

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {organizedComments.length > 0 ? (
          organizedComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              currentUserId={currentUserId}
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

      {/* Modal d'ajout/réponse de commentaire */}
      {showAddComment && (
        <CommentModal
          isOpen={showAddComment}
          onClose={handleCloseModal}
          candidateId={candidateId}
          companyId={companyId}
          onCommentAdded={onCommentsUpdate}
          replyTo={replyToComment}
        />
      )}
    </div>
  );
};

export default ActivityFeed;