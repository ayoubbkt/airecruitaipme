// frontend/src/services/candidateService.js - Version Améliorée

import axios from '../utils/axios';

class CandidateService {
  // Récupération des données candidat
  async getCandidateById(candidateId) {
    try {
      const response = await axios.get(`/candidates/${candidateId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching candidate:', error);
      throw error;
    }
  }

  async getCandidates(queryParams = {}) {
    try {
      const response = await axios.get('/candidates', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  }

  // Actions candidat
  async pinCandidate(candidateId) {
    try {
      const response = await axios.patch(`/candidates/${candidateId}/pin`);
      return response.data;
    } catch (error) {
      console.error('Error pinning candidate:', error);
      throw error;
    }
  }

  async unpinCandidate(candidateId) {
    try {
      const response = await axios.patch(`/candidates/${candidateId}/unpin`);
      return response.data;
    } catch (error) {
      console.error('Error unpinning candidate:', error);
      throw error;
    }
  }

  async advanceCandidate(candidateId, newStage) {
    try {
      const response = await axios.patch(`/candidates/${candidateId}/advance`, {
        stage: newStage
      });
      return response.data;
    } catch (error) {
      console.error('Error advancing candidate:', error);
      throw error;
    }
  }

  async disqualifyCandidate(candidateId, reason = '') {
    try {
      const response = await axios.patch(`/candidates/${candidateId}/disqualify`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error disqualifying candidate:', error);
      throw error;
    }
  }

  // Gestion des commentaires
  async addComment(candidateId, commentData) {
    try {
      const response = await axios.post(`/candidates/${candidateId}/comments`, commentData);
      return response.data.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async getComments(candidateId) {
    try {
      const response = await axios.get(`/candidates/${candidateId}/comments`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async deleteComment(commentId) {
    try {
      const response = await axios.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Gestion des emails
  async sendEmail(candidateId, emailData) {
    try {
      const response = await axios.post(`/candidates/${candidateId}/emails`, emailData);
      return response.data.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async getEmailHistory(candidateId) {
    try {
      const response = await axios.get(`/candidates/${candidateId}/emails`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching email history:', error);
      throw error;
    }
  }

  // Gestion des entretiens
  async scheduleMeeting(candidateId, meetingData) {
    try {
      const response = await axios.post(`/candidates/${candidateId}/meetings`, meetingData);
      return response.data.data;
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      throw error;
    }
  }

  async getMeetings(candidateId) {
    try {
      const response = await axios.get(`/candidates/${candidateId}/meetings`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  }

  async updateMeeting(meetingId, meetingData) {
    try {
      const response = await axios.patch(`/meetings/${meetingId}`, meetingData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  async cancelMeeting(meetingId) {
    try {
      const response = await axios.delete(`/meetings/${meetingId}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling meeting:', error);
      throw error;
    }
  }

  // Gestion des fichiers
  async uploadFile(candidateId, file, visibility = 'PUBLIC') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('visibility', visibility);

      const response = await axios.post(`/candidates/${candidateId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      const response = await axios.delete(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async getFiles(candidateId) {
    try {
      const response = await axios.get(`/candidates/${candidateId}/files`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  }

  async updateResume(candidateId, resumeFile) {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await axios.patch(`/candidates/${candidateId}/resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  }

  async getResumeForDisplay(candidateId) {
    try {
      const response = await axios.get(`/candidates/${candidateId}/resume/display`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching resume for display:', error);
      throw error;
    }
  }

  async downloadResume(candidateId) {
    try {
      const response = await axios.get(`/candidates/${candidateId}/resume/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading resume:', error);
      throw error;
    }
  }

  // Gestion des messages
  async sendMessage(applicationId, messageData) {
    try {
      const response = await axios.post(`/applications/${applicationId}/messages`, messageData);
      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getMessages(applicationId) {
    try {
      const response = await axios.get(`/applications/${applicationId}/messages`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Gestion des activités
  async getActivities(candidateId) {
    try {
      const response = await axios.get(`/candidates/${candidateId}/activities`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  // Gestion des ratings/évaluations
  async submitRating(candidateId, ratingData) {
    try {
      const response = await axios.post(`/candidates/${candidateId}/ratings`, ratingData);
      return response.data.data;
    } catch (error) {
      console.error('Error submitting rating :', error);
      throw error;
    }
    }
    async getRatings(candidateId) {
    try {
        const response = await axios.get(`/candidates/${candidateId}/ratings`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching ratings :', error);
        throw error;
    }
    }

    // Gestion des mentions "J'aime"
    async likeCandidate(candidateId) {
      try {
        const response = await axios.post(`/candidates/${candidateId}/like`);
        return response.data;
      } catch (error) {
        console.error('Error liking candidate:', error);
        throw error;
      }
    }   
    async unlikeCandidate(candidateId) {
      try {
        const response = await axios.post(`/candidates/${candidateId}/unlike`);
        return response.data;
      } catch (error) {
        console.error('Error unliking candidate:', error);
        throw error;
      }     
    }

}
export default new CandidateService();
