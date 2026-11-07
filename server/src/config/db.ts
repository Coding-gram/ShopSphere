import mongoose from 'mongoose';
import { env } from './env.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export async function connectDB(): Promise<void> {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (error) {
      retries++;
      console.error(
        `❌ MongoDB connection attempt ${retries}/${MAX_RETRIES} failed:`,
        error instanceof Error ? error.message : error,
      );

      if (retries >= MAX_RETRIES) {
        console.error('❌ All MongoDB connection attempts exhausted. Exiting.');
        process.exit(1);
      }

      console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}
