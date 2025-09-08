// components/candidates/FilesAttachmentsManager.jsx
import React, { useState, useRef } from 'react';
import { 
  Upload,
  FileText,
  Download,
  X,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader,
  File
} from 'lucide-react';

/**
 * Composant de gestion des fichiers et pièces jointes
 * Permet l'upload, la visualisation et la suppression de fichiers
 */
const FilesAttachmentsManager = ({ 
  candidateId,
  companyId,
  files = [],
  onFilesUpdated 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const fileInputRef = useRef(null);

  // Ouvrir le sélecteur de fichiers
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Gestion de l'upload de fichier
  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        // Validation du fichier
        if (file.size > 10 * 1024 * 1024) { // 10MB
          throw new Error(`Le fichier "${file.name}" dépasse la taille limite de 10MB`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('visibility', 'Public'); // Par défaut

        const response = await fetch(
          `/api/candidates/companies/${companyId}/candidates/${candidateId}/files`,
          {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur lors de l'upload de "${file.name}"`);
        }

        return response.json();
      });

      await Promise.all(uploadPromises);
      
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      
      // Recharger la liste des fichiers
      if (onFilesUpdated) {
        onFilesUpdated();
      }

    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Suppression d'un fichier
  const handleDeleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${fileName}" ?`)) {
      return;
    }

    setDeletingFileId(fileId);
    try {
      const response = await fetch(
        `/api/candidates/companies/${companyId}/candidates/${candidateId}/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Recharger la liste des fichiers
      if (onFilesUpdated) {
        onFilesUpdated();
      }

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setUploadError('Erreur lors de la suppression du fichier');
    } finally {
      setDeletingFileId(null);
    }
  };

  // Téléchargement d'un fichier
  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await fetch(
        `/api/candidates/files/${fileId}/download`,
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
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setUploadError('Erreur lors du téléchargement du fichier');
    }
  };

  // Obtenir l'icône appropriée selon le type de fichier
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (['doc', 'docx'].includes(extension)) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <Eye className="w-5 h-5 text-green-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* En-tête */}
      <div className="p-6 border-b bg-gray-50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Files & Attachments</h3>
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Upload Files
          </button>
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
            <p className="text-sm text-green-700">Fichier(s) uploadé(s) avec succès!</p>
          </div>
        )}
      </div>

      {/* Liste des fichiers */}
      <div className="p-6">
        {files.length > 0 ? (
          <div className="space-y-3">
            {/* En-tête du tableau */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-lg">
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Visibility</div>
              <div className="col-span-2">Added by</div>
              <div className="col-span-2">Added</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Fichiers */}
            {files.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Nom du fichier */}
                <div className="col-span-5 flex items-center space-x-3">
                  {getFileIcon(file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    {file.size && (
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Visibilité */}
                <div className="col-span-2 flex items-center">
                  <span className={`
                    inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${file.visibility === 'Public' 
                      ? 'bg-green-100 text-green-800' 
                      : file.visibility === 'Private'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {file.visibility}
                  </span>
                </div>

                {/* Ajouté par */}
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-900">
                    {file.addedBy || 'N/A'}
                  </span>
                </div>

                {/* Date d'ajout */}
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-500">
                    {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center space-x-1">
                  <button
                    onClick={() => handleDownloadFile(file.id, file.name)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteFile(file.id, file.name)}
                    disabled={deletingFileId === file.id}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Supprimer"
                  >
                    {deletingFileId === file.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun fichier</h3>
            <p className="text-sm text-gray-500 mb-6">
              Uploadez des fichiers pour ce candidat (CV, lettre de motivation, certificats, etc.)
            </p>
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </button>
          </div>
        )}
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
        onChange={handleFileUpload}
        className="hidden"
        aria-label="Sélectionner des fichiers"
      />
    </div>
  );
};

export default FilesAttachmentsManager;