import prisma from '../../config/db.js';
import pkg from '../../generated/prisma/index.js';
import fs from 'fs/promises';
import path from 'path';

const { UserRole, CompanyMemberRole } = pkg;

async function checkCandidatePermission(userId, companyId, allowedRoles = [CompanyMemberRole.RECRUITING_ADMIN, CompanyMemberRole.HIRING_MANAGER]) {
  const membership = await prisma.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });
  const platformUser = await prisma.user.findUnique({ where: { id: userId } });

  if (platformUser?.role === UserRole.MEGA_ADMIN) return true;
  if (!membership || !allowedRoles.includes(membership.role)) {
    const error = new Error('Forbidden: You do not have permission to manage candidates.');
    error.statusCode = 403;
    throw error;
  }
  return true;
}

class CandidateService {
  async getCandidates(userId, companyId) {
    await checkCandidatePermission(userId, companyId);

    const candidates = await prisma.candidate.findMany({
      where: {
        applications: {
          some: {
            job: {
              companyId,
            },
          },
        },
      },
      include: {
        applications: {
          include: {
            job: true,
          },
        },
      },
    });

    return candidates.map(candidate => ({
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phoneNumber: candidate.phoneNumber,
      resumeUrl: candidate.resumeUrl,
      comment: candidate.comment,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
      applications: candidate.applications.map(app => ({
        id: app.id,
        jobId: app.jobId,
        jobTitle: app.job.title,
        status: app.status,
      })),
    }));
  }

  // Ajouter cette méthode dans CandidateService
async extractResumeContent(resumeUrl) {
  if (!resumeUrl) return null;
  
  try {
    
    const filePath = path.join(process.cwd(), resumeUrl);
    console.log("resumeUrl",resumeUrl)
    
    const fileExtension = path.extname(resumeUrl).toLowerCase();
    
    if (fileExtension === '.txt') {
      // Pour les fichiers texte
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } else if (fileExtension === '.pdf') {
      // Pour les PDF, vous devrez installer pdf-parse
      // npm install pdf-parse
      console.log("helloaaa",fileExtension)
      const mod = await import('pdf-parse');       // ESM friendly
      const pdfParse = mod.default || mod;          // compat CJS/ESM
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer);
      return data.text;
    } else {
      // Pour les autres formats, retourner un message
      return `Fichier CV disponible: ${path.basename(resumeUrl)}\nType: ${fileExtension}\nPour voir le contenu complet, téléchargez le fichier.`;
    }
  } catch (error) {
    console.error('Error extracting resume content:', error);
    return `Erreur lors de la lecture du CV. Fichier: ${path.basename(resumeUrl)}`;
  }
}

// Modifier getCandidateById pour inclure le contenu
async getCandidateById(userId, companyId, id) {
  await checkCandidatePermission(userId, companyId);

  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      applications: {
        include: {
          job: true,
        },
      },
    },
  });

  if (!candidate || !candidate.applications.some(app => app.job.companyId === companyId)) {
    const error = new Error('Candidate not found or access denied.');
    error.statusCode = 404;
    throw error;
  }

  // Extraire le contenu du CV
  
  const resumeContent = await this.extractResumeContent(candidate.resumeUrl);

  return {
    id: candidate.id,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phoneNumber: candidate.phoneNumber,
    resumeUrl: candidate.resumeUrl,
    resumeContent: resumeContent, // Ajouter le contenu
    comment: candidate.comment,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
    applications: candidate.applications.map(app => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      status: app.status,
    })),
  };
}

  async saveResumeFile(resumeFile) {
  if (!resumeFile) return null;
  
  // Créer le dossier uploads s'il n'existe pas
  const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
  await fs.mkdir(uploadsDir, { recursive: true });
  
  // Générer un nom de fichier unique
  const fileExtension = path.extname(resumeFile.originalname || resumeFile.name);
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
  const filePath = path.join(uploadsDir, fileName);
  
  // Sauvegarder le fichier
  await fs.writeFile(filePath, resumeFile.buffer);
  
  return `/uploads/resumes/${fileName}`;
}

  async createCandidate(userId, companyId, candidateData) {
    await checkCandidatePermission(userId, companyId);

    const { firstName, lastName, email, phone, job, comment, resume } = candidateData;
    console.log("job", job, comment, resume);

    if (!firstName || !lastName || !email || !job) {
      throw new Error('First name, last name, email, and job are required for a candidate.');
    }

    const existingCandidate = await prisma.candidate.findUnique({
        where: { email },
    });
    if (existingCandidate) {
        const error = new Error('A candidate with this email already exists.');
        error.statusCode = 409;
        throw error;
    }

   let resumeUrl = null;
  if (resume) {
    resumeUrl = await this.saveResumeFile(resume);
  }


    return prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber: phone,
        resumeUrl,
        comment,
        applications: {
          create: {
            job: { connect: { id: String(job) } },
            status: 'ACTIVE',
          },
        },
      },
    });
  }

  async updateCandidate(userId, companyId, id, candidateData) {
    await checkCandidatePermission(userId, companyId);

    const candidate = await prisma.candidate.findUnique({ where: { id } });

    if (!candidate || !candidate.applications.some(app => app.job.companyId === companyId)) {
      const error = new Error('Candidate not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    const { firstName, lastName, email, phone, comment, resume } = candidateData;

    let resumeUrl = candidate.resumeUrl;
    if (resume) {
      resumeUrl = `/uploads/${resume.name}`; // Simuler un chemin local
    }

    return prisma.candidate.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phoneNumber: phone,
        resumeUrl,
        comment,
      },
    });
  }

  async deleteCandidate(userId, companyId, id) {
    await checkCandidatePermission(userId, companyId);

    const candidate = await prisma.candidate.findUnique({ where: { id } });

    if (!candidate || !candidate.applications.some(app => app.job.companyId === companyId)) {
      const error = new Error('Candidate not found or access denied.');
      error.statusCode = 404;
      throw error;
    }

    await prisma.candidate.delete({ where: { id } });

    return { message: 'Candidate deleted successfully.' };
  }

  async downloadCV(candidateId) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate || !candidate.resumeUrl) {
      const error = new Error('CV not found.');
      error.statusCode = 404;
      throw error;
    }

    return candidate.resumeUrl; // Retourner le chemin local
  }
}

export default new CandidateService();