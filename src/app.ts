import express from 'express';
import userRoutes from './routes/user-routes.js';
import userRelationRoutes from './routes/user-relation-routes.js';
import feedRoutes from './routes/feed-routes.js';
import exploreRoutes from './routes/explore-routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';
import { corsMiddleware } from './middlewares/cors.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(corsMiddleware);
app.use(express.json());

app.get('/', (_req, res) => {
    res.send('Hello World!!!!');
});

app.get('/health', (_req, res) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/users', userRoutes);
app.use('/api/user-relations', userRelationRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/explore', exploreRoutes);

app.use('/users', userRoutes);
app.use('/user-relations', userRelationRoutes);
app.use('/feed', feedRoutes);
app.use('/explore', exploreRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;
