import { randomBytes } from 'crypto';

function generateJwtSecret(length = 64) {
    return randomBytes(length).toString('base64');
}

const secret = generateJwtSecret();
console.log('JWT_SECRET:', secret);