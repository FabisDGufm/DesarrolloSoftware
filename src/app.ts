import express from 'express';
import userRoutes from './routes/user-routes.js';
import userRelationRoutes from './routes/user-relation-routes.js';

const app = express();
const port = 3000;

// Middleware para leer JSON del body
app.use(express.json());

// Rutas de usuarios
app.use('/users', userRoutes);
app.use('/user-relations', userRelationRoutes);

app.get('/', (_req, res) => {
    res.send('Hello World!!!!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
