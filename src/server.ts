// src/server.ts
import app from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

app.listen(PORT, () => {
  console.log(`🧭 Wayfinder API (dev) listening on http://localhost:${PORT}`);
});
