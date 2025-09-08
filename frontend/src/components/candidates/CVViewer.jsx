// components/candidates/CVViewer.jsx
import React, { useState, useRef } from 'react';
import { 
  Download,
  Upload,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

/**
 * Composant de visualisation de CV avec gestion d'upload
 * Affiche le CV sous forme d'iframe et permet la mise à jour
 */
const CVViewer = ({ 
  candidateId, 
  companyId, 
  resumeUrl, 
  candidateName,
  onResumeUpdated 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Gestion du clic sur le bouton Update Resume
  const handleUpdateResumeClick = () => {
    fileInputRef.current?.click();
  };

  // Gestion de l'upload de fichier
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.includes('pdf') && !file.type.includes('doc')) {
      setUploadError('Seuls les fichiers PDF et DOC/DOCX sont acceptés');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setUploadError('Le fichier ne doit pas dépasser 10MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(
        `/api/candidates/companies/${companyId}/candidates/${candidateId}/resume`, 
        {
          method: 'PUT',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      
      // Callback pour notifier le composant parent
      if (onResumeUpdated) {
        onResumeUpdated(result.data.resumeUrl);
      }

    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setUploadError(
        error.message || 'Une erreur est survenue lors de la mise à jour du CV'
      );
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Gestion du téléchargement du CV
  const handleDownloadCV = async () => {
    if (!resumeUrl) return;

    try {
      const response = await fetch(
        `/api/candidates/candidates/${candidateId}/download-cv`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_${candidateName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setUploadError('Erreur lors du téléchargement du CV');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* En-tête avec titre et actions */}
      <div className="p-6 border-b bg-gray-50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Resume / CV</h3>
              <p className="text-sm text-gray-500">
                {candidateName} - {resumeUrl ? 'CV disponible' : 'Aucun CV'}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            {resumeUrl && (
              <button
                onClick={handleDownloadCV}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </button>
            )}
            
            <button
              onClick={handleUpdateResumeClick}
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isUploading ? 'Mise à jour...' : 'Mettre à jour le CV'}
            </button>
          </div>
        </div>

        {/* Messages de statut */}
        {uploadError && (
          <div className="mt-3 flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{uploadError}</p>
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-3 flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <p className="text-sm text-green-700">CV mis à jour avec succès!</p>
          </div>
        )}
      </div>

      {/* Contenu du CV */}
      <div className="p-6">
        {resumeUrl ? (
          <div className="w-full">
            {/* Iframe pour afficher le PDF */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <iframe
                src={`${resumeUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                width="100%"
                height="800px"
                className="border-0"
                title={`CV de ${candidateName}`}
                onError={() => {
                  console.error('Erreur lors du chargement du CV');
                }}
              />
            </div>
            
            {/* Lien de visualisation externe */}
            <div className="mt-4 flex items-center justify-center">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ouvrir dans un nouvel onglet
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun CV disponible</h3>
            <p className="text-sm text-gray-500 mb-6">
              Uploadez un CV pour ce candidat pour commencer l'évaluation.
            </p>
            <button
              onClick={handleUpdateResumeClick}
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Uploader un CV
            </button>
          </div>
        )}
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileUpload}
        className="hidden"
        aria-label="Sélectionner un fichier CV"
      />
    </div>
  );
};

export default CVViewer;