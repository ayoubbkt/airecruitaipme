// scripts/seedMessageTemplates.js
import prisma from './config/db.js';

async function seedMessageTemplates() {
  const companyId = 'cmb6pxghf0001vvkck7n1p20f'; // Remplacez par un vrai companyId
 // Remplacez par un vrai companyId
  
    const templates = [
      // Templates requis
      {
        name: 'Confirmation de Candidature',
        subject: 'Merci pour votre candidature !',
        description: 'Email par défaut envoyé aux nouveaux candidats comme confirmation.',
        content: `Bonjour {{candidat.prenom}},\n\nMerci d'avoir postulé à notre poste de {{poste.titre}}! Nous sommes ravis de votre intérêt et apprécions le temps que vous avez consacré à cette démarche.\n\nNotre équipe examine actuellement les candidatures et nous vous contacterons prochainement pour vous informer des prochaines étapes. Si votre profil correspond à nos besoins, nous vous proposerons un entretien.\n\nN'hésitez pas à me contacter si vous avez des questions.\n\nCordialement,\n{{recruteur.nom}}`,
        isRequired: true
      },
      {
        name: 'Email de Disqualification',
        subject: 'Concernant votre candidature',
        description: 'Email par défaut envoyé quand un candidat est disqualifié.',
        content: `Bonjour {{candidat.prenom}},\n\nNous vous remercions d'avoir postulé pour le poste de {{poste.titre}}.\n\nAprès examen attentif de votre candidature, nous regrettons de vous informer que nous avons décidé de poursuivre avec d'autres candidats dont les profils correspondent davantage aux critères que nous recherchons pour ce poste.\n\nNous apprécions votre intérêt pour notre entreprise et vous souhaitons plein succès dans vos recherches professionnelles.\n\nCordialement,\n{{recruteur.nom}}`,
        isRequired: true
      },
      // Templates personnalisés
      {
        name: 'Appel Téléphonique',
        subject: 'Planification d\'un entretien téléphonique',
        content: `Bonjour {{candidat.prenom}},\n\nSuite à l'examen de votre candidature pour le poste de {{poste.titre}}, nous aimerions vous inviter à un entretien téléphonique afin de discuter plus en détail de votre profil.\n\nPourriez-vous me communiquer vos disponibilités pour la semaine prochaine ?\n\nÀ bientôt,\n{{recruteur.nom}}`,
        isRequired: false
      },
      {
        name: 'Appel Téléphonique (Auto-planification)',
        subject: 'Planifiez votre entretien téléphonique',
        content: `Bonjour {{candidat.prenom}},\n\nNous souhaitons vous inviter à un entretien téléphonique pour le poste de {{poste.titre}}.\n\nVous pouvez planifier cet entretien directement via le lien suivant selon vos disponibilités : {{lien_planification}}\n\nNous sommes impatients d'échanger avec vous.\n\nCordialement,\n{{recruteur.nom}}`,
        isRequired: false
      },
      {
        name: 'Entretien (Auto-planification)',
        subject: 'Planifiez votre entretien',
        content: `Bonjour {{candidat.prenom}},\n\nNous sommes heureux de vous inviter à un entretien pour le poste de {{poste.titre}}.\n\nVeuillez utiliser le lien suivant pour planifier votre entretien selon vos disponibilités : {{lien_planification}}\n\nL'entretien se déroulera à notre bureau situé à {{entreprise.adresse}} et durera environ 1 heure.\n\nN'hésitez pas à me contacter si vous avez des questions.\n\nCordialement,\n{{recruteur.nom}}`,
        isRequired: false
      },
      {
        name: 'Entretien',
        subject: 'Invitation à un entretien',
        content: `Bonjour {{candidat.prenom}},\n\nNous sommes ravis de vous inviter à un entretien pour le poste de {{poste.titre}}.\n\nSeriez-vous disponible aux dates suivantes :\n- Jeudi 25 mars à 14h\n- Vendredi 26 mars à 10h\n- Lundi 29 mars à 15h\n\nMerci de me faire part de vos préférences, et nous confirmerons l'horaire définitif.\n\nL'entretien se déroulera à notre siège social et durera environ 1 heure.\n\nCordialement,\n{{recruteur.nom}}`,
        isRequired: false
      },
      {
        name: 'Envoi d\'Offre',
        subject: 'Offre d\'emploi - {{poste.titre}}',
        content: `Bonjour {{candidat.prenom}},\n\nSuite à notre processus de recrutement, nous sommes heureux de vous proposer un poste de {{poste.titre}} au sein de notre entreprise.\n\nVous trouverez ci-joint votre lettre d'offre détaillant les conditions de votre emploi, la rémunération, et les avantages sociaux associés.\n\nNous vous prions de bien vouloir nous indiquer votre décision d'ici le {{date_limite_reponse}}.\n\nEn cas d'acceptation, nous organiserons votre intégration et vous communiquerons toutes les informations nécessaires.\n\nNous restons à votre disposition pour répondre à vos questions.\n\nCordialement,\n{{recruteur.nom}}`,
        isRequired: false
      }
    ];
  
    for (const template of templates) {
      await prisma.messageTemplate.upsert({
        where: { companyId_name: { companyId, name: template.name } },
        update: {},
        create: {
          companyId,
          name: template.name,
          subject: template.subject,
          description: template.description || null,
          content: template.content,
          isRequired: template.isRequired
        }
      });
    }
  
    console.log('Message templates seeded successfully.');
  }
  
  seedMessageTemplates()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });