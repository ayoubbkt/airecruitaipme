// // scripts/get-app-id.js
// import axios from 'axios';
// import dotenv from 'dotenv';

// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // adapte le chemin si besoin



// async function getAppId() {
//   try {
//     const response = await axios.get('https://api.intercom.io/me', {
//       headers: {
//         'Authorization': `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
//         'Accept': 'application/json'
//       }
//     });

//     console.log('📱 Informations de votre app Intercom :');
//     console.log(`   App ID: ${response.data.id}`);
//     console.log(`   App Name: ${response.data.name}`);
    
//     console.log('\n📝 Ajoutez cette ligne à votre .env :');
//     console.log(`INTERCOM_APP_ID=${response.data.id}`);

//   } catch (error) {
//     console.error('❌ Erreur:', error.response?.data || error.message);
//   }
// }

// getAppId();