import CandidateService from './candidate.service.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
class CandidateController {
  async getCandidates(req, res, next) {
    try {
      const { companyId } = req.params;
      const candidates = await CandidateService.getCandidates(req.user.id, companyId);
      res.status(200).json(candidates);
    } catch (error) {
      next(error);
    }
  }

  async getCandidateById(req, res, next) {
    try {
      const { companyId, id } = req.params;
      const candidate = await CandidateService.getCandidateById(req.user.id, companyId, id);
      res.status(200).json(candidate);
    } catch (error) {
      next(error);
    }
  }

  async createCandidate(req, res, next) {
    try {
      const { companyId } = req.params;
       const resumeFile = req.file ? {
      name: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer
    } : null;

      const candidateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        job: String(req.body.job),
        comment: req.body.comment,
        resume: resumeFile, // Simuler avec une URL ou chemin
      };
      console.log('req.file:', req.file); // Ajouter pour déboguer
        console.log('candidateData in controller:', candidateData);
      const candidate = await CandidateService.createCandidate(req.user.id, companyId, candidateData);
      res.status(201).json({ message: 'Candidate created.', data: candidate });
    } catch (error) {
      next(error);
    }
  }

  async updateCandidate(req, res, next) {
    try {
      const { companyId, id } = req.params;
      const candidateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        comment: req.body.comment,
        resume: req.body.resume,
      };
      const updatedCandidate = await CandidateService.updateCandidate(req.user.id, companyId, id, candidateData);
      res.status(200).json({ message: 'Candidate updated.', data: updatedCandidate });
    } catch (error) {
      next(error);
    }
  }

  async deleteCandidate(req, res, next) {
    try {
      const { companyId, id } = req.params;
      const result = await CandidateService.deleteCandidate(req.user.id, companyId, id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async downloadCV(req, res, next) {
    try {
      const { id } = req.params;
      const cvUrl = await CandidateService.downloadCV(id);
      res.status(200).json({ url: cvUrl });
    } catch (error) {
      next(error);
    }
  }
}

export default new CandidateController();