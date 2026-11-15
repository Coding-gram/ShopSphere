import mongoose from 'mongoose';
import { env } from './env.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export function sanitizeMongoUri(rawUri: string): string {
  let cleaned = rawUri.trim().replace(/^["']|["']$/g, '');

  // Auto-remove literal angle brackets <...> if user left them around password
  if (cleaned.includes(':<') && cleaned.includes('>@')) {
    cleaned = cleaned.replace(/:<([^>]+)>@/, ':$1@');
  }

  // Auto-encode @ in password if present (e.g. mongodb+srv://user:pass@123@host)
  const match = cleaned.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.*)@([^@\/]+)(.*)$/);
  if (match) {
    const [, proto, user, pass, host, rest] = match;
    if (pass.includes('@')) {
      const encodedPass = pass.replace(/@/g, '%40');
      cleaned = `${proto}${user}:${encodedPass}@${host}${rest}`;
    }
  }

  return cleaned;
}

export function maskMongoUri(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
}

export async function connectDB(): Promise<void> {
  let retries = 0;
  const connectionUri = sanitizeMongoUri(env.MONGODB_URI);
  console.log(`📡 Connecting to MongoDB: ${maskMongoUri(connectionUri)}`);

  while (retries < MAX_RETRIES) {
    try {
      await mongoose.connect(connectionUri);
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
