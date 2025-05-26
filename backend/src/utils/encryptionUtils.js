// src/utils/encryptionUtils.js
import crypto from 'crypto';
import config from '../config/index.js';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(config.encryptionKey, 'hex'); // Clé de 32 octets
const IV_LENGTH = 16; // Pour AES-GCM, un IV de 12 octets est souvent recommandé, mais 16 est aussi courant
const AUTH_TAG_LENGTH = 16;

export const encrypt = (text) => {
  if (text === null || typeof text === 'undefined') return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  // Stocker iv, authTag, et le texte chiffré. Format: iv:authTag:encryptedText (en hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

export const decrypt = (encryptedText) => {
  if (encryptedText === null || typeof encryptedText === 'undefined') return null;
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted text format');

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedData = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    // Gérer l'erreur de manière appropriée, ne pas retourner de données partiellement déchiffrées
    // ou des informations qui pourraient aider à une attaque.
    // Retourner null ou lever une erreur spécifique est plus sûr.
    throw new Error('Failed to decrypt data.');
  }
};