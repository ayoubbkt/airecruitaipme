// jest.setup.js
import { setupTestDb } from './test/setupTestDb.js';

// Définir la variable d'environnement pour les tests
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST || 'postgresql://ayoub:postgres@localhost:5434/megahrdb_test';

await setupTestDb();