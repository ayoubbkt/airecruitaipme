// backend/src/utils/fileUpload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

/**
 * Utilitaire de gestion des uploads de fichiers
 * Gestion sécurisée avec validation et optimisation
 */

// Configuration des dossiers de stockage
const UPLOAD_DIRS = {
  resumes: 'uploads/resumes',
  'candidate-files': 'uploads/candidate-files',
  avatars: 'uploads/avatars',
  documents: 'uploads/documents'
};

// Types de fichiers autorisés par catégorie
const ALLOWED_FILE_TYPES = {
  resumes: ['.pdf', '.doc', '.docx'],
  'candidate-files': ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'],
  avatars: ['.jpg', '.jpeg', '.png'],
  documents: ['.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx']
};

// Taille maximale par type (en bytes)
const MAX_FILE_SIZES = {
  resumes: 10 * 1024 * 1024, // 10MB
  'candidate-files': 10 * 1024 * 1024, // 10MB
  avatars: 2 * 1024 * 1024, // 2MB
  documents: 15 * 1024 * 1024 // 15MB
};

/**
 * Créer les dossiers d'upload s'ils n'existent pas
 */
const ensureUploadDirectories = async () => {
  try {
    for (const dir of Object.values(UPLOAD_DIRS)) {
      await fs.mkdir(dir, { recursive: true });
    }
  } catch (error) {
    console.error('Erreur lors de la création des dossiers d\'upload:', error);
  }
};

/**
 * Générer un nom de fichier unique
 */
const generateUniqueFileName = (originalName, category) => {
  const ext = path.extname(originalName);
  const uniqueId = uuidv4();
  const timestamp = Date.now();
  return `${category}_${timestamp}_${uniqueId}${ext}`;
};

/**
 * Valider un fichier
 */
const validateFile = (file, category) => {
  const errors = [];
  
  // Vérifier que la catégorie existe
  if (!ALLOWED_FILE_TYPES[category]) {
    errors.push(`Catégorie de fichier non supportée: ${category}`);
    return errors;
  }
  
  // Vérifier l'extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_FILE_TYPES[category].includes(ext)) {
    errors.push(`Type de fichier non autorisé. Types acceptés: ${ALLOWED_FILE_TYPES[category].join(', ')}`);
  }
  
  // Vérifier la taille
  if (file.size > MAX_FILE_SIZES[category]) {
    const maxSizeMB = Math.round(MAX_FILE_SIZES[category] / (1024 * 1024));
    errors.push(`Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`);
  }
  
  // Vérifier le nom de fichier (sécurité)
  if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
    errors.push('Nom de fichier invalide');
  }
  
  return errors;
};

/**
 * Optimiser une image
 */
const optimizeImage = async (filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const optimizedPath = filePath.replace(ext, `_optimized${ext}`);
      
      await sharp(filePath)
        .resize(800, 600, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85 })
        .toFile(optimizedPath);
      
      // Remplacer le fichier original par la version optimisée
      await fs.unlink(filePath);
      await fs.rename(optimizedPath, filePath);
    }
  } catch (error) {
    console.error('Erreur lors de l\'optimisation de l\'image:', error);
    // Ne pas faire échouer l'upload si l'optimisation échoue
  }
};

/**
 * Uploader un fichier
 */
export const uploadFile = async (file, category = 'documents') => {
  try {
    // Assurer que les dossiers existent
    await ensureUploadDirectories();
    
    // Valider le fichier
    const validationErrors = validateFile(file, category);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }
    
    // Générer un nom unique
    const uniqueFileName = generateUniqueFileName(file.originalname, category);
    const uploadDir = UPLOAD_DIRS[category];
    const filePath = path.join(uploadDir, uniqueFileName);
    
    // Sauvegarder le fichier
    if (file.buffer) {
      // Si le fichier est en mémoire (multer memory storage)
      await fs.writeFile(filePath, file.buffer);
    } else if (file.path) {
      // Si le fichier est temporaire (multer disk storage)
      await fs.rename(file.path, filePath);
    } else {
      throw new Error('Fichier invalide');
    }
    
    // Optimiser les images
    if (category === 'avatars') {
      await optimizeImage(filePath);
    }
    
    // Retourner les informations du fichier
    return {
      originalName: file.originalname,
      fileName: uniqueFileName,
      url: `/${filePath}`, // URL relative pour servir le fichier
      filePath: filePath, // Chemin complet pour le stockage
      size: file.size,
      mimeType: file.mimetype,
      category
    };
    
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    throw new Error(`Échec de l'upload: ${error.message}`);
  }
};

/**
 * Supprimer un fichier
 */
export const deleteFile = async (filePath) => {
  try {
    if (!filePath) return false;
    
    // Nettoyer le chemin (enlever le slash initial si présent)
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    
    // Vérifier que le fichier existe
    const stats = await fs.stat(cleanPath);
    if (stats.isFile()) {
      await fs.unlink(cleanPath);
      return true;
    }
    
    return false;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Le fichier n'existe pas, considérer comme succès
      return true;
    }
    console.error('Erreur lors de la suppression du fichier:', error);
    throw new Error(`Échec de la suppression: ${error.message}`);
  }
};

/**
 * Obtenir les informations d'un fichier
 */
export const getFileInfo = async (filePath) => {
  try {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const stats = await fs.stat(cleanPath);
    
    return {
      exists: true,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { exists: false };
    }
    throw error;
  }
};

/**
 * Configuration Multer pour l'upload en mémoire
 */
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Math.max(...Object.values(MAX_FILE_SIZES)), // Taille max globale
    files: 10 // Nombre max de fichiers simultanés
  },
  fileFilter: (req, file, cb) => {
    // Validation basique côté middleware
    const hasValidExtension = Object.values(ALLOWED_FILE_TYPES)
      .flat()
      .some(ext => file.originalname.toLowerCase().endsWith(ext));
    
    if (hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  }
});

/**
 * Nettoyer les fichiers temporaires anciens
 */
export const cleanupOldFiles = async (maxAgeInDays = 30) => {
  try {
    const maxAge = Date.now() - (maxAgeInDays * 24 * 60 * 60 * 1000);
    
    for (const dir of Object.values(UPLOAD_DIRS)) {
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.birthtime.getTime() < maxAge) {
          await fs.unlink(filePath);
          console.log(`Fichier ancien supprimé: ${filePath}`);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage des fichiers:', error);
  }
};

// Initialiser les dossiers au démarrage
ensureUploadDirectories();