// frontend/src/services/meganService.js (REMPLACER COMPLÈTEMENT)
import axios from '../utils/axios';

class MeganService {
  constructor() {
    this.baseURL = '/api/v1/ai-megan';
  }

  // Chat avec Megan
  async sendMessage(message, context = {}) {
    const response = await axios.post(`${this.baseURL}/chat`, {
      message,
      context
    });
    return response.data;
  }

  // AI Screening
  async executeScreening(jobId, candidateId, candidateData) {
    const response = await axios.post(
      `${this.baseURL}/screening/${jobId}/${candidateId}`,
      { candidateData }
    );
    return response.data;
  }

  // AI Scheduling
  async executeScheduling(jobId, candidateId, schedulingData) {
    const response = await axios.post(
      `${this.baseURL}/scheduling/${jobId}/${candidateId}`,
      schedulingData
    );
    return response.data;
  }

  // AI Note Taking
  async executeNoteTaking(meetingId, transcription) {
    const response = await axios.post(
      `${this.baseURL}/note-taking/${meetingId}`,
      { transcription }
    );
    return response.data;
  }

  // Conversations
  async getConversations(params = {}) {
    const response = await axios.get(`${this.baseURL}/conversations`, { params });
    return response.data;
  }

  async getConversationStatus(conversationId) {
    const response = await axios.get(`${this.baseURL}/conversations/${conversationId}`);
    return response.data;
  }

  // Configuration
  async getScreeningConfig(jobId) {
    const response = await axios.get(`${this.baseURL}/jobs/${jobId}/config/screening`);
    return response.data;
  }

  async configureScreening(jobId, config) {
    const response = await axios.put(`${this.baseURL}/jobs/${jobId}/config/screening`, config);
    return response.data;
  }

  async getSchedulingConfig(jobId) {
    const response = await axios.get(`${this.baseURL}/jobs/${jobId}/config/scheduling`);
    return response.data;
  }

  async configureScheduling(jobId, config) {
    const response = await axios.put(`${this.baseURL}/jobs/${jobId}/config/scheduling`, config);
    return response.data;
  }

  async getNoteTakingConfig(meetingId) {
    const response = await axios.get(`${this.baseURL}/meetings/${meetingId}/config/note-taking`);
    return response.data;
  }

  async configureNoteTaking(meetingId, config) {
    const response = await axios.put(`${this.baseURL}/meetings/${meetingId}/config/note-taking`, config);
    return response.data;
  }
}

export default new MeganService();