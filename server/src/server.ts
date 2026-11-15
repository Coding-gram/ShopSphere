import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { seedDatabaseIfNeeded } from './db/autoSeed.js';

async function bootstrap(): Promise<void> {
  await connectDB();
  await seedDatabaseIfNeeded();

  const server = app.listen(env.PORT, () => {
    console.log(
      `🚀 ShopSphere server running on port ${env.PORT} [${env.NODE_ENV}]`,
    );
  });

  // ── Graceful shutdown ───────────────────────────────────────────────────
  const shutdown = (signal: string) => {
    console.log(`\n⚠️  ${signal} received. Shutting down gracefully…`);
    server.close(() => {
      console.log('💤 Server closed.');
      process.exit(0);
    });
  };

  process.on('unhandledRejection', (reason: unknown) => {
    console.error('❌ Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (error: Error) => {
    console.error('❌ Uncaught Exception:', error);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap();
