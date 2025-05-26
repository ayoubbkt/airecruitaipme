import { PrismaClient } from '../generated/prisma/index.js';
// src/config/db.js
import config from './index.js'; // Assurez-vous que config charge DATABASE_URL_TEST

let prismaInstance;

if (process.env.NODE_ENV === 'test') {
  prismaInstance = new PrismaClient({
    datasources: {
      db: {
        url: config.databaseUrlTest, // Utilisez l'URL de test
      },
    },
  });
} else {
  prismaInstance = new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'],
  });
}
// const prisma = new PrismaClient({
//  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : undefined,
//  datasources: { // Pourrait être utilisé pour switcher dynamiquement mais plus complexe avec les migrations
//    db: {
//      url: process.env.NODE_ENV === 'test' ? config.databaseUrlTest : config.databaseUrl,
//    },
//  },
// });
export default prismaInstance;