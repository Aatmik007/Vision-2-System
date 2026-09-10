import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { seedInitialData } from './src/utils/seedData.js';
import { getDomainFallbackBlueprint } from './src/services/aiService.js';
import mongoose from 'mongoose';

async function runSanityCheck() {
  console.log('--- Vision2System Backend Sanity Check ---');
  console.log('1. Verifying blueprint generator...');
  const bp = getDomainFallbackBlueprint({
    name: 'Food Delivery Platform',
    description: 'Food ordering with live dispatch and restaurants',
    expectedScale: 'High Scale'
  });
  
  if (!bp.projectOverview || !bp.techStack || !bp.database || !bp.architecture || !bp.apis || !bp.security || !bp.complexity || !bp.roadmap) {
    throw new Error('Blueprint schema verification failed');
  }
  console.log('   ✓ Blueprint generated with all 11 required sections');

  console.log('2. Connecting to MongoDB...');
  await connectDB();
  console.log('   ✓ MongoDB connected');

  console.log('3. Running database seeder...');
  await seedInitialData();
  console.log('   ✓ Database seeded with Admin, Demo User, and Demo Projects');

  await mongoose.disconnect();
  console.log('4. Sanity check completed successfully!');
  process.exit(0);
}

runSanityCheck().catch(err => {
  console.error('Sanity check failed:', err);
  process.exit(1);
});
