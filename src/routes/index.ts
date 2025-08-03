import express from 'express';

const router = express.Router();

router.get('/api', (_req, res) => {
  res.send('Wayfinder API root route works!');
});

export default router;
