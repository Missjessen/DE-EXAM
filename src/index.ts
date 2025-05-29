// src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connect } from './repository/database';

async function bootstrap() {
  await connect();   // <-- permanent DB‐connection
  const PORT = parseInt(process.env.PORT!, 10) || 4000;
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

bootstrap().catch(err => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});
