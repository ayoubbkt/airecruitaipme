import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Mail, Phone, Download, User, CheckCircle, XCircle, MessageSquare, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { interviewService, cvService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const InterviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    interviewer: '',
    technicalScore: 3,
    behavioralScore: 3,
    recommendation: 'CONSIDER',
    comments: ''
  });

  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        setLoading(true);
        const response = await interviewService.getInterviewById(id);
        setInterview(response);
      } catch (error) {
        console.error('Error fetching interview details:', error);
        toast.error('Erreur lors du chargement des détails de l\'entretien');
        navigate('/interviews');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [id, navigate]);

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await interviewService.addFeedback(id, feedbackForm);
      toast.success('Feedback ajouté avec succès');
      setShowFeedbackForm(false);
      // Refresh interview details
      const updatedInterview = await interviewService.getInterviewById(id);
      setInterview(updatedInterview);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Erreur lors de l\'ajout du feedback');
    }
  };

  const handleCancelInterview = async () => {
    const reason = prompt('Veuillez indiquer la raison de l\'annulation:');
    if (!reason) return;

    try {
      await interviewService.cancelInterview(id, reason);
      toast.success('Entretien annulé avec succès');
      navigate('/interviews');
    } catch (error) {
      console.error('Error cancelling interview:', error);
      toast.error('Erreur lors de l\'annulation de l\'entretien');
    }
  };

  const handleCompleteInterview = async () => {
    const outcome = window.confirm('L\'entretien s\'est-il bien passé? Cliquez sur OK pour marquer comme réussi ou sur Annuler pour indiquer un échec.');
    
    try {
      await interviewService.completeInterview(id, outcome ? 'SUCCESS' : 'FAILED');
      toast.success('Entretien marqué comme terminé');
      // Refresh interview details
      const updatedInterview = await interviewService.getInterviewById(id);
      setInterview(updatedInterview);
    } catch (error) {
      console.error('Error completing interview:', error);
      toast.error('Erreur lors de la finalisation de l\'entretien');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!interview) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Entretien non trouvé</h2>
        <p className="text-slate-600 mb-6">L'entretien que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link to="/interviews" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Retour aux entretiens
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-yellow-100 text-yellow-800';
      case 'FEEDBACK_COMPLETE':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Planifié';
      case 'COMPLETED':
        return 'Terminé';
      case 'CANCELLED':
        return 'Annulé';
      case 'NO_SHOW':
        return 'Absence';
      case 'FEEDBACK_COMPLETE':
        return 'Feedback complété';
      default:
        return status;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <button 
            className="p-2 rounded-full hover:bg-slate-100 mr-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Détails de l'entretien</h1>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-800">
                Entretien {interview.interviewType === 'VIDEO' ? 'vidéo' : 
                          interview.interviewType === 'PHONE' ? 'téléphonique' : 'en personne'} {' '}
                avec {interview.candidateName}
              </h2>
            </div>
            <div className="mt-2 flex items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                {getStatusLabel(interview.status)}
              </span>
              <span className="ml-4 text-sm text-slate-500">
                <Clock className="inline w-4 h-4 mr-1" />
                {formatDuration(interview.duration)}
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            {interview.status === 'SCHEDULED' && (
              <>
                <button 
                  onClick={handleCompleteInterview}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Terminer
                </button>
                <button 
                  onClick={handleCancelInterview}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                >
                  Annuler
                </button>
              </>
            )}
            {(interview.status === 'COMPLETED' || interview.status === 'FEEDBACK_COMPLETE') && (
              <button 
                onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {showFeedbackForm ? 'Masquer le formulaire' : 'Ajouter un feedback'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Interview details */}
        <div className="md:col-span-2 space-y-6">
          {/* Interview information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Informations sur l'entretien</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Date et heure</p>
                  <p className="text-slate-800 font-medium">{formatDate(interview.scheduledTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Durée</p>
                  <p className="text-slate-800 font-medium">{formatDuration(interview.duration)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Type d'entretien</p>
                <p className="text-slate-800 font-medium">
                  {interview.interviewType === 'VIDEO' ? 'Entretien vidéo' : 
                   interview.interviewType === 'PHONE' ? 'Entretien téléphonique' : 
                   'Entretien en personne'}
                </p>
              </div>
              
              {interview.location && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Lieu / Lien</p>
                  <p className="text-slate-800 font-medium">{interview.location}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Interviewers</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {interview.interviewers.map((interviewer, idx) => (
                    <div key={idx} className="flex items-center px-3 py-1 bg-slate-100 rounded-full">
                      <User className="w-4 h-4 text-slate-600 mr-1" />
                      <span className="text-sm text-slate-700">{interviewer}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {interview.jobTitle && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Poste concerné</p>
                  <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg inline-block">
                    {interview.jobTitle}
                  </div>
                </div>
              )}
              
              {interview.notes && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Notes préparatoires</p>
                  <p className="text-slate-700 p-3 bg-slate-50 rounded-lg">{interview.notes}</p>
                </div>
              )}
              
              {interview.cancellationReason && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Raison d'annulation</p>
                  <p className="text-red-600 p-3 bg-red-50 rounded-lg">{interview.cancellationReason}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Feedback form */}
          {showFeedbackForm && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Ajouter un feedback</h3>
              
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label htmlFor="interviewer" className="block text-sm font-medium text-slate-700 mb-1">Interviewer</label>
                  <input
                    id="interviewer"
                    name="interviewer"
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    value={feedbackForm.interviewer}
                    onChange={handleFeedbackChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="technicalScore" className="block text-sm font-medium text-slate-700 mb-1">Score technique (1-5)</label>
                  <select
                    id="technicalScore"
                    name="technicalScore"
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    value={feedbackForm.technicalScore}
                    onChange={handleFeedbackChange}
                    required
                  >
                    {[1, 2, 3, 4, 5].map(score => (
                      <option key={score} value={score}>{score}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="behavioralScore" className="block text-sm font-medium text-slate-700 mb-1">Score comportemental (1-5)</label>
                  <select
                    id="behavioralScore"
                    name="behavioralScore"
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    value={feedbackForm.behavioralScore}
                    onChange={handleFeedbackChange}
                    required
                  >
                    {[1, 2, 3, 4, 5].map(score => (
                      <option key={score} value={score}>{score}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="recommendation" className="block text-sm font-medium text-slate-700 mb-1">Recommendation</label>
                  <select
                    id="recommendation"
                    name="recommendation"
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    value={feedbackForm.recommendation}
                    onChange={handleFeedbackChange}
                    required
                  >
                    <option value="HIRE">Recommande l'embauche</option>
                    <option value="CONSIDER">À considérer</option>
                    <option value="REJECT">Ne recommande pas</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="comments" className="block text-sm font-medium text-slate-700 mb-1">Commentaires</label>
                  <textarea
                    id="comments"
                    name="comments"
                    rows={5}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                    value={feedbackForm.comments}
                    onChange={handleFeedbackChange}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                    onClick={() => setShowFeedbackForm(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Enregistrer le feedback
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Feedbacks */}
          {interview.feedbacks && interview.feedbacks.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Feedbacks ({interview.feedbacks.length})</h3>
              
              <div className="space-y-4">
                {interview.feedbacks.map((feedback, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                          {feedback.interviewer.charAt(0)}
                        </div>
                        <div className="ml-2">
                          <p className="text-sm font-medium text-slate-800">{feedback.interviewer}</p>
                          <p className="text-xs text-slate-500">{new Date(feedback.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${feedback.recommendation === 'HIRE' ? 'bg-green-100 text-green-800' : 
                         feedback.recommendation === 'CONSIDER' ? 'bg-yellow-100 text-yellow-800' : 
                         'bg-red-100 text-red-800'}`}
                      >
                        {feedback.recommendation === 'HIRE' ? 'Recommandé' : 
                         feedback.recommendation === 'CONSIDER' ? 'À considérer' : 
                         'Non recommandé'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Score technique</p>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-5 h-5 rounded-full mr-1 flex items-center justify-center
                                ${i < feedback.technicalScore ? 'bg-blue-500 text-white' : 'bg-slate-200'}`}
                            >
                              {i < feedback.technicalScore && <CheckCircle className="w-3 h-3" />}
                            </div>
                          ))}
                          <span className="ml-2 text-sm font-medium">{feedback.technicalScore}/5</span>
                        </div>
                      </div>
                      
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Score comportemental</p>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-5 h-5 rounded-full mr-1 flex items-center justify-center
                                ${i < feedback.behavioralScore ? 'bg-indigo-500 text-white' : 'bg-slate-200'}`}
                            >
                              {i < feedback.behavioralScore && <CheckCircle className="w-3 h-3" />}
                            </div>
                          ))}
                          <span className="ml-2 text-sm font-medium">{feedback.behavioralScore}/5</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{feedback.comments}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right column - Candidate information */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Candidat</h3>
            
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-lg">
                {interview.candidateName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="ml-3">
                <p className="font-medium text-slate-800">{interview.candidateName}</p>
                <p className="text-sm text-slate-500">{interview.jobTitle || 'Candidat'}</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              {interview.candidateEmail && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 mr-2" />
                  <a href={`mailto:${interview.candidateEmail}`} className="text-sm text-blue-600 hover:underline">
                    {interview.candidateEmail}
                  </a>
                </div>
              )}
              
              {interview.candidatePhone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-slate-400 mr-2" />
                  <a href={`tel:${interview.candidatePhone}`} className="text-sm text-slate-700">
                    {interview.candidatePhone}
                  </a>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <Link
                to={`/cv/${interview.candidateId}`}
                className="w-full py-2 flex items-center justify-center bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"
              >
                Voir le profil complet
              </Link>
            </div>
          </div>
          
          {/* Interview Questions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">Questions suggérées</h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Générer plus
              </button>
            </div>
            
            <div className="space-y-3">
              {interview.questions ? (
                interview.questions.map((question, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-800">{question.question}</p>
                  </div>
                ))
              ) : (
                <div className="text-center p-4">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Pas de questions suggérées</p>
                  <button 
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    onClick={() => interviewService.generateInterviewQuestions(interview.candidateId, interview.jobId)}
                  >
                    Générer des questions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetail;