import express from 'express';

const app = express();

app.get('/users', (_req, res) => {
  res.status(200).json({ message: 'ok' });
});

export default app;
