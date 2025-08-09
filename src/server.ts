// src/server.ts
import app from './app';
import { env } from './config/environment';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🧭 Wayfinder API running on port ${PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 CORS Origins: ${env.ALLOWED_ORIGINS}`);
  console.log(`🚀 Ready to accept requests!`);
});
