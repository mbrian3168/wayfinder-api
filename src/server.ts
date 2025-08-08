import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🧭 Wayfinder API server (local) on http://localhost:${PORT}`);
});
