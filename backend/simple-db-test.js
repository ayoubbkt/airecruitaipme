// simple-db-test.js
import db from './src/config/db.js';

async function testPrisma() {
  try {
    console.log("🔍 Test Prisma simple...");
    
    // Test simple count
    console.log("Testing db.user.count()...");
    const userCount = await db.user.count();
    console.log(`✅ Utilisateurs: ${userCount}`);
    
    console.log("Testing db.candidate.count()...");
    const candidateCount = await db.candidate.count();
    console.log(`✅ Candidats: ${candidateCount}`);
    
    console.log("Testing db.activity.count()...");
    const activityCount = await db.activity.count();
    console.log(`✅ Activités: ${activityCount}`);
    
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await db.$disconnect();
  }
}

testPrisma();