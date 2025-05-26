import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  databaseUrl: process.env.DATABASE_URL,
  databaseUrlTest: process.env.DATABASE_URL_TEST, // Ajoutez ceci
  nodeEnv: process.env.NODE_ENV || 'development',
  encryptionKey: process.env.ENCRYPTION_KEY,

};

if (!config.jwtSecret) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}
if (config.nodeEnv === 'test' && !config.databaseUrlTest) {
  console.error("FATAL ERROR: DATABASE_URL_TEST is not defined for test environment.");
  process.exit(1);
}
if (!config.encryptionKey || config.encryptionKey.length !== 64) { // 32 bytes = 64 hex characters
  console.error("FATAL ERROR: ENCRYPTION_KEY is not defined or not a 64-character hex string.");
  process.exit(1);
}
export default config;