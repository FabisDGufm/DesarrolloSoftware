

import dotenv from "dotenv";
dotenv.config({ path: "/home/ubuntu/ElPasillo/DesarrolloSoftware/.env" });


console.log("ENV:", process.env.DATABASE_URL);
import express from 'express';
import userRoutes from './routes/user-routes.js';
import userRelationRoutes from './routes/user-relation-routes.js';
import feedRoutes from './routes/feed-routes.js';
import exploreRoutes from './routes/explore-routes.js';
import postInteractionRoutes from './routes/post-interaction-routes.js';
import messageRoutes from './routes/message-routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';
import { corsMiddleware } from './middlewares/cors.js';
import profileRoutes from './routes/user-profile-routes.js';
import authRoutes from "./routes/auth-routes.js";
import { latencyMiddleware } from "./middlewares/latency-middleware.js";
import anonDebateRoutes from './routes/anon-debate-routes.js';
import postRoutes from './routes/post-routes.js';




const app = express();
const port = process.env.PORT || 3000;

app.use(corsMiddleware);
app.use(express.json());
app.use(latencyMiddleware);
app.use('/profile', profileRoutes);
app.use("/auth", authRoutes);

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
app.use('/api/interactions', postInteractionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/debates', anonDebateRoutes);
app.use('/debates', anonDebateRoutes);

app.use('/api/posts', postRoutes);
app.use('/posts', postRoutes); 

app.use('/users', userRoutes);
app.use('/user-relations', userRelationRoutes);
app.use('/feed', feedRoutes);
app.use('/explore', exploreRoutes);
app.use('/interactions', postInteractionRoutes);
app.use('/messages', messageRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;

process.stdin.resume();

