// backend/src/utils/emailService.js
import nodemailer from 'nodemailer';
import { createTransport } from 'nodemailer';
import config from '../config/index.js';

/**
 * Service d'envoi d'emails avec support des templates
 * Utilise nodemailer avec configuration flexible
 */

// Configuration du transporteur email
let transporter;

/**
 * Initialiser le transporteur email
 */
const initializeTransporter = () => {
  // Configuration basée sur l'environnement
  const emailConfig = {
    // Gmail/Google Workspace
    gmail: {
      service: 'gmail',
      auth: {
        user: config.email.gmail.user,
        pass: config.email.gmail.password // App password
      }
    },
    // SMTP générique
    smtp: {
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.secure, // true pour 465, false pour autres ports
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.password
      },
      tls: {
        rejectUnauthorized: false
      }
    },
    // SendGrid
    sendgrid: {
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: config.email.sendgrid.apiKey
      }
    },
    // Mailgun
    mailgun: {
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: config.email.mailgun.user,
        pass: config.email.mailgun.password
      }
    },
    // Mode test (ethereal email pour développement)
    test: {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.password'
      }
    }
  };

  const provider = config.email.provider || 'smtp';
  const selectedConfig = emailConfig[provider];

  if (!selectedConfig) {
    throw new Error(`Fournisseur email non supporté: ${provider}`);
  }

  transporter = createTransport(selectedConfig);
  
  // Vérifier la configuration
  transporter.verify()
    .then(() => {
      console.log(`✅ Service email initialisé avec ${provider}`);
    })
    .catch((error) => {
      console.error(`❌ Erreur configuration email:`, error.message);
    });

  return transporter;
};

/**
 * Templates d'emails prédéfinis
 */
const EMAIL_TEMPLATES = {
  // Template de base
  base: (content, title = 'Notification') => `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>Cet email a été envoyé par RecruitPME</p>
        <p>Si vous ne souhaitez plus recevoir ces emails, <a href="#">désabonnez-vous ici</a></p>
      </div>
    </body>
    </html>
  `,

  // Confirmation de candidature
  applicationConfirmation: (candidateName, jobTitle, companyName) => `
    <h2>Candidature reçue avec succès</h2>
    <p>Bonjour ${candidateName},</p>
    <p>Nous avons bien reçu votre candidature pour le poste de <strong>${jobTitle}</strong> chez ${companyName}.</p>
    <p>Notre équipe va examiner votre profil et vous recontactera sous peu si votre candidature correspond à nos critères.</p>
    <p>Merci pour votre intérêt pour notre entreprise.</p>
    <p>Cordialement,<br>L'équipe RH</p>
  `,

  // Invitation à un entretien
  interviewInvitation: (candidateName, jobTitle, interviewDate, interviewTime, location, meetingLink) => `
    <h2>Invitation à un entretien</h2>
    <p>Bonjour ${candidateName},</p>
    <p>Nous sommes heureux de vous inviter à un entretien pour le poste de <strong>${jobTitle}</strong>.</p>
    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <h3>Détails de l'entretien :</h3>
      <p><strong>Date :</strong> ${interviewDate}</p>
      <p><strong>Heure :</strong> ${interviewTime}</p>
      <p><strong>Lieu :</strong> ${location}</p>
      ${meetingLink ? `<p><strong>Lien de visioconférence :</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
    </div>
    <p>Veuillez confirmer votre présence en répondant à cet email.</p>
    <p>N'hésitez pas à nous contacter si vous avez des questions.</p>
    <p>Cordialement,<br>L'équipe RH</p>
  `,

  // Rejet de candidature
  applicationRejection: (candidateName, jobTitle) => `
    <h2>Mise à jour de votre candidature</h2>
    <p>Bonjour ${candidateName},</p>
    <p>Nous vous remercions de l'intérêt que vous portez à notre entreprise et du temps que vous avez consacré à votre candidature pour le poste de <strong>${jobTitle}</strong>.</p>
    <p>Après avoir examiné attentivement votre profil, nous regrettons de vous informer que nous ne pourrons pas donner suite à votre candidature pour ce poste spécifique.</p>
    <p>Cette décision ne remet en aucun cas en question vos compétences et qualifications. Nous gardons votre CV dans notre base de données et n'hésiterons pas à vous recontacter pour d'autres opportunités qui correspondraient mieux à votre profil.</p>
    <p>Nous vous souhaitons bonne chance dans vos recherches.</p>
    <p>Cordialement,<br>L'équipe RH</p>
  `,

  // Mention dans un commentaire
  mentionNotification: (mentionnedUserName, authorName, commentContent, candidateName) => `
    <h2>Nouvelle mention</h2>
    <p>Bonjour ${mentionnedUserName},</p>
    <p>Vous avez été mentionné dans un commentaire par <strong>${authorName}</strong> concernant le candidat <strong>${candidateName}</strong>.</p>
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #4F46E5;">
      ${commentContent}
    </div>
    <a href="${config.app.baseUrl}/candidates/${candidateName}" class="button">Voir le profil candidat</a>
    <p>Connectez-vous à votre tableau de bord pour voir le commentaire complet et répondre.</p>
    <p>Cordialement,<br>L'équipe RecruitPME</p>
  `
};

/**
 * Envoyer un email
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  text = null,
  attachments = [],
  template = null,
  templateData = {}
}) => {
  try {
    // Initialiser le transporteur si pas encore fait
    if (!transporter) {
      initializeTransporter();
    }

    // Générer le contenu HTML si un template est spécifié
    let htmlContent = html;
    if (template && EMAIL_TEMPLATES[template]) {
      const templateContent = EMAIL_TEMPLATES[template](...Object.values(templateData));
      htmlContent = EMAIL_TEMPLATES.base(templateContent, subject);
    }

    // Configuration de l'email
    const mailOptions = {
      from: `${config.app.name} <${config.email.from}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html: htmlContent,
      text: text || htmlContent?.replace(/<[^>]*>/g, ''), // Fallback text sans HTML
      attachments: attachments.map(attachment => ({
        filename: attachment.filename,
        path: attachment.path || undefined,
        content: attachment.content || undefined,
        contentType: attachment.contentType || undefined
      }))
    };

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email envoyé à ${to}: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };

  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    throw new Error(`Échec envoi email: ${error.message}`);
  }
};

/**
 * Envoyer un email avec template
 */
export const sendTemplatedEmail = async (to, templateName, templateData, subject) => {
  return sendEmail({
    to,
    subject,
    template: templateName,
    templateData
  });
};

/**
 * Envoyer des emails en lot (avec limitation de débit)
 */
export const sendBulkEmails = async (emails, delayBetweenEmails = 1000) => {
  const results = [];
  
  for (let i = 0; i < emails.length; i++) {
    try {
      const result = await sendEmail(emails[i]);
      results.push({ index: i, success: true, result });
      
      // Délai entre les emails pour éviter le spam
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenEmails));
      }
      
    } catch (error) {
      console.error(`Erreur email ${i}:`, error);
      results.push({ index: i, success: false, error: error.message });
    }
  }
  
  return results;
};

/**
 * Vérifier si une adresse email est valide
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Vérifier la configuration email
 */
export const testEmailConfiguration = async () => {
  try {
    if (!transporter) {
      initializeTransporter();
    }
    
    await transporter.verify();
    return { success: true, message: 'Configuration email valide' };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Initialiser le service au démarrage
if (config.email.provider && config.email.provider !== 'none') {
  initializeTransporter();
}

export default {
  sendEmail,
  sendTemplatedEmail,
  sendBulkEmails,
  validateEmail,
  testEmailConfiguration,
  EMAIL_TEMPLATES
};