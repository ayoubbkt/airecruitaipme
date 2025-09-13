import axios from '../utils/axios';

// Placeholder service. Wire real endpoints when backend chat is available.
export const meganService = {
  async sendMessage({ companyId, text, context = {} }) {
    // Example future endpoint (commented):
    // const res = await axios.post(`/ai/megan/chat`, { companyId, text, context });
    // return res.data;
    return new Promise((resolve) => {
      setTimeout(() => resolve({ reply: `Echo: ${text}` }), 300);
    });
  },
};

export default meganService;
