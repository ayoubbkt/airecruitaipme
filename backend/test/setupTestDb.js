// test/setupTestDb.js
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function setupTestDb() {
  try {
    console.log('Setting up test database...');
    
    // Forcer l'utilisation de DATABASE_URL_TEST
    const testDatabaseUrl = process.env.DATABASE_URL_TEST || 'postgresql://ayoub:postgres@localhost:5434/megahrdb_test';
    
    console.log('Running migrations on test database...');
    await execAsync(`DATABASE_URL="${testDatabaseUrl}" npx prisma migrate deploy`);
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}