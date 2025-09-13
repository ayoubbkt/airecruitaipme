// scripts/setup-intercom-dev.js
import axios from 'axios';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // adapte le chemin si besoin



async function setupWebhook() {
  try {
    const api = axios.create({
      baseURL: 'https://api.intercom.io',
      headers: {
        'Authorization': `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // URL de votre webhook
    const webhookUrl = `${process.env.BACKEND_URL}/api/v1/ai-megan/webhook/intercom`;
    
    console.log(`🔧 Configuration webhook: ${webhookUrl}`);

    // Supprimer les anciens webhooks ngrok
    const existing = await api.get('/webhooks');
    for (const webhook of existing.data.webhooks || []) {
      if (webhook.url.includes('ngrok')) {
        await api.delete(`/webhooks/${webhook.id}`);
        console.log(`🗑️  Supprimé ancien webhook: ${webhook.url}`);
      }
    }

    // Créer le nouveau webhook
    const response = await api.post('/webhooks', {
      url: webhookUrl,
      topics: [
        'conversation.operator.replied',
        'conversation.created'
      ]
    });

    console.log('✅ Webhook configuré avec succès !');
    console.log(`   URL: ${webhookUrl}`);
    console.log(`   ID: ${response.data.id}`);
    
    if (response.data.secret) {
      console.log(`   Secret: ${response.data.secret}`);
      console.log('\n📝 Ajoutez cette ligne à votre .env :');
      console.log(`INTERCOM_WEBHOOK_SECRET=${response.data.secret}`);
    }

    return response.data;

  } catch (error) {
    console.error('❌ Erreur configuration webhook:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔐 Vérifiez votre INTERCOM_ACCESS_TOKEN');
    }
  }
}

setupWebhook();
