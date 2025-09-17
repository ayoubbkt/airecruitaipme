import prisma from '../../../config/db.js';


export const searchCandidatesBySkills = async ({ skills, companyId, minExperience = 0, availability = 'all' }) => {
  try {
    const skillsArray = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    
    const whereConditions = {
      company: { id: companyId },
      currentStage: { name: { notIn: ['Rejected', 'Withdrawn'] } }
    };
    
    if (availability === 'immediate') {
      whereConditions.availableFrom = { lte: new Date() };
    }
    
    if (minExperience > 0) {
      whereConditions.yearsOfExperience = { gte: minExperience };
    }
    
    // Recherche par compétences dans le CV ou la description
    whereConditions.OR = skillsArray.map(skill => ({
      OR: [
        { skills: { contains: skill, mode: 'insensitive' } },
        { resumeText: { contains: skill, mode: 'insensitive' } },
        { coverLetterText: { contains: skill, mode: 'insensitive' } }
      ]
    }));
    
    const candidates = await prisma.candidate.findMany({
      where: whereConditions,
      include: {
        job: { select: { title: true } },
        currentStage: true
      },
      orderBy: [
        { ai_screening_score: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 20
    });
    
    const results = candidates.map(c => ({
      nom: `${c.firstName} ${c.lastName}`,
      email: c.email,
      poste: c.job.title,
      competences: c.skills || 'Non spécifié',
      experience: c.yearsOfExperience ? `${c.yearsOfExperience} ans` : 'Non spécifié',
      score: c.ai_screening_score || 'Non évalué',
      disponibilite: c.availableFrom ? c.availableFrom.toLocaleDateString('fr-FR') : 'Immédiate',
      stage: c.currentStage?.name || 'Non défini'
    }));
    
    return JSON.stringify({
      recherche: skillsArray.join(', '),
      total: results.length,
      candidats: results
    });
    
  } catch (error) {
    return `Erreur lors de la recherche : ${error.message}`;
  }
};

export const findSimilarCandidates = async ({ candidateId, companyId, limit = 10 }) => {
  try {
    const referenceCandidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { job: true }
    });
    
    if (!referenceCandidate) {
      return `Candidat de référence non trouvé.`;
    }
    
    const similarCandidates = await prisma.candidate.findMany({
      where: {
        company: { id: companyId },
        id: { not: candidateId },
        jobId: referenceCandidate.jobId, // Même poste
        currentStage: { name: { notIn: ['Rejected', 'Withdrawn'] } }
      },
      include: {
        currentStage: true
      },
      orderBy: { ai_screening_score: 'desc' },
      take: parseInt(limit)
    });
    
    const results = similarCandidates.map(c => ({
      nom: `${c.firstName} ${c.lastName}`,
      email: c.email,
      score: c.ai_screening_score || 'Non évalué',
      stage: c.currentStage?.name || 'Non défini',
      similarite: c.skills && referenceCandidate.skills ? 
        calculateSimilarity(c.skills, referenceCandidate.skills) + '%' : 'Non calculable'
    }));
    
    return JSON.stringify({
      candidatReference: `${referenceCandidate.firstName} ${referenceCandidate.lastName}`,
      poste: referenceCandidate.job.title,
      candidatsSimilaires: results
    });
    
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};

export const getCandidatesByLanguage = async ({ language, level = 'any', companyId }) => {
  try {
    const whereConditions = {
      company: { id: companyId },
      currentStage: { name: { notIn: ['Rejected', 'Withdrawn'] } },
      OR: [
        { languages: { contains: language, mode: 'insensitive' } },
        { resumeText: { contains: language, mode: 'insensitive' } },
        { skills: { contains: language, mode: 'insensitive' } }
      ]
    };
    
    if (level !== 'any') {
      whereConditions.languages = { 
        contains: `${language} ${level}`, 
        mode: 'insensitive' 
      };
    }
    
    const candidates = await prisma.candidate.findMany({
      where: whereConditions,
      include: {
        job: { select: { title: true } },
        currentStage: true
      },
      orderBy: { ai_screening_score: 'desc' }
    });
    
    const results = candidates.map(c => ({
      nom: `${c.firstName} ${c.lastName}`,
      email: c.email,
      poste: c.job.title,
      langues: c.languages || 'Non spécifié',
      score: c.ai_screening_score || 'Non évalué',
      stage: c.currentStage?.name || 'Non défini'
    }));
    
    return JSON.stringify({
      langue: language,
      niveau: level,
      total: results.length,
      candidats: results
    });
    
  } catch (error) {
    return `Erreur : ${error.message}`;
  }
};

// Fonction utilitaire pour calculer la similarité
function calculateSimilarity(skills1, skills2) {
  if (!skills1 || !skills2) return 0;
  
  const set1 = new Set(skills1.toLowerCase().split(',').map(s => s.trim()));
  const set2 = new Set(skills2.toLowerCase().split(',').map(s => s.trim()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return Math.round((intersection.size / union.size) * 100);
}

// --- Définitions des outils de recherche ---
export const searchTools = [
  {
    functionDeclarations: [
      {
        name: 'searchCandidatesBySkills',
        description: "Recherche des candidats par compétences, expérience et disponibilité.",
        parameters: {
          type: 'OBJECT',
          properties: {
            skills: { type: 'STRING', description: "Compétences recherchées (séparées par virgules)." },
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
            minExperience: { type: 'NUMBER', description: "Années d'expérience minimum (défaut: 0)." },
            availability: { type: 'STRING', description: "'immediate' ou 'all' (défaut)." },
          },
          required: ['skills', 'companyId'],
        },
      },
      {
        name: 'findSimilarCandidates',
        description: "Trouve des candidats similaires à un candidat de référence.",
        parameters: {
          type: 'OBJECT',
          properties: {
            candidateId: { type: 'STRING', description: "L'ID du candidat de référence." },
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
            limit: { type: 'NUMBER', description: "Nombre maximum de résultats (défaut: 10)." },
          },
          required: ['candidateId', 'companyId'],
        },
      },
      {
        name: 'getCandidatesByLanguage',
        description: "Recherche des candidats parlant une langue spécifique.",
        parameters: {
          type: 'OBJECT',
          properties: {
            language: { type: 'STRING', description: "La langue recherchée (ex: anglais, espagnol)." },
            level: { type: 'STRING', description: "Niveau requis : 'courant', 'bilingue', 'any' (défaut)." },
            companyId: { type: 'STRING', description: "L'ID de l'entreprise." },
          },
          required: ['language', 'companyId'],
        },
      },
    ],
  },
];