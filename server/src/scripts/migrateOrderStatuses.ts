import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { migrateLegacyOrderStatuses } from './orderStatusMigration.js';

async function runMigration() {
  await mongoose.connect(env.MONGODB_URI);
  const result = await migrateLegacyOrderStatuses();
  console.log(`Scanned ${result.scanned} orders; migrated ${result.migrated}; skipped ${result.skipped}.`);
}

runMigration()
  .catch((error: unknown) => {
    console.error('Could not migrate legacy order statuses:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
