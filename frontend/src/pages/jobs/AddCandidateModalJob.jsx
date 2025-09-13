import React, { useEffect, useState } from 'react';
import { X, Upload } from 'lucide-react';
import { jobService, createCandidate } from '../../services/api';
import { toast } from 'react-toastify';

const normalizeJobsResponse = (resp) => {
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp?.data)) return resp.data;
  return [];
};

// Matches requested signature; supports optional defaultJobId/defaultStageId via rest props
const AddCandidateModal = ({ isOpen, onClose, companyId, onCandidateAdded, ...rest }) => {
  const defaultJobId = rest.defaultJobId;
  const defaultStageId = rest.defaultStageId;
  const [formData, setFormData] = useState({ firstName:'', lastName:'', email:'', phone:'', jobId: defaultJobId || '', comment:'' });
  const [resumeFile, setResumeFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(f => ({ ...f, jobId: defaultJobId || f.jobId }));
    const loadJobs = async () => {
      try {
        setLoadingJobs(true);
        const merged = [];
        const seen = new Set();
        // Always include the current job if provided (even if not PUBLISHED)
        if (defaultJobId) {
          try {
            const currentJob = await jobService.getJobById(companyId, defaultJobId);
            if (currentJob && currentJob.id && !seen.has(currentJob.id)) {
              seen.add(currentJob.id);
              merged.push({ id: currentJob.id, title: currentJob.title });
            }
          } catch (_) { /* ignore */ }
        }
        // Then add published jobs
        const activeJobs = await jobService.getJobs(companyId, { status: 'PUBLISHED' });
        const published = normalizeJobsResponse(activeJobs);
        published.forEach(j => { if (j?.id && !seen.has(j.id)) { seen.add(j.id); merged.push({ id: j.id, title: j.title }); } });
        setJobs(merged);
      } catch (e) {
        toast.error("Erreur lors du chargement des offres d'emploi.");
      } finally { setLoadingJobs(false); }
    };
    loadJobs();
  }, [isOpen, companyId, defaultJobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => { setResumeFile(e.target.files[0]); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      toast.error('Prénom et Nom sont requis');
      return;
    }
    setIsSubmitting(true);
    try {
      const submission = new FormData();
      submission.append('firstName', formData.firstName);
      submission.append('lastName', formData.lastName);
      if (formData.email) submission.append('email', formData.email);
      if (formData.phone) submission.append('phone', formData.phone);
      submission.append('job', formData.jobId || defaultJobId);
      if (formData.comment) submission.append('comment', formData.comment);
      if (defaultStageId) submission.append('stageId', defaultStageId);
      if (resumeFile) submission.append('resume', resumeFile);
      await createCandidate(companyId, submission);
      toast.success('Candidat ajouté avec succès !');
      onCandidateAdded?.();
      onClose?.();
      setFormData({ firstName:'', lastName:'', email:'', phone:'', jobId: defaultJobId || '', comment:'' });
      setResumeFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajout du candidat.");
    } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Ajouter un Candidat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500" required/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500" required/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3"/>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Associer à une offre <span className="text-red-500">*</span></label>
              <select name="jobId" value={formData.jobId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" required>
                <option value="">{loadingJobs ? 'Chargement...' : 'Sélectionner une offre'}</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">CV</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-500">Téléverser un fichier</label>
                <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                {resumeFile && <p className="text-sm text-green-600 mt-2 font-medium">{resumeFile.name}</p>}
              </div>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire optionnel sur le candidat</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              placeholder="Ajouter des notes sur ce candidat..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Annuler</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{isSubmitting? 'Ajout...' : 'Ajouter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidateModal;