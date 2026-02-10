import express from 'express';
import userRoutes from './routes/user-routes.js';

const app = express();
const port = 3000;

// Middleware para leer JSON del body
app.use(express.json());

// Rutas de usuarios
app.use('/users', userRoutes);

app.get('/', (_req, res) => {
    res.send('Hello World!!!!');
});

// Solo iniciar el servidor si no estamos en tests (para que Jest pueda terminar)
if (typeof process.env.JEST_WORKER_ID === 'undefined') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
