import express from 'express';
import userRoutes from './routes/user-routes.js';
import userRelationRoutes from './routes/user-relation-routes.js';
import feedRoutes from './routes/feed-routes.js';
import exploreRoutes from './routes/explore-routes.js';
import postInteractionRoutes from './routes/post-interaction-routes.js';
import messageRoutes from './routes/message-routes.js';
import helpSpaceRoutes from './routes/help-space-routes.js';
import moderationRoutes from './routes/moderation-routes.js';
import postRoutes from './routes/post-routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';
import { corsMiddleware } from './middlewares/cors.js';
import profileRoutes from './routes/user-profile-routes.js';
import authRoutes from "./routes/auth-routes.js";
import { latencyMiddleware } from "./middlewares/latency-middleware.js";
import anonDebateRoutes from './routes/anon-debate-routes.js';
import promotionRoutes from "./routes/promotion-routes.js";
import newsRoutes from "./routes/news-routes.js";
import { userService } from "./services/instances.js";
import announcementRoutes from "./routes/announcement-routes.js";

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
app.use('/api/help-spaces', helpSpaceRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/debates', anonDebateRoutes);
app.use('/debates', anonDebateRoutes);

app.use('/api/posts', postRoutes);
app.use('/posts', postRoutes);

app.use("/api/promotions", promotionRoutes);
app.use("/promotions", promotionRoutes);

app.use("/api/news", newsRoutes);
app.use("/news", newsRoutes);

app.use("/api/announcements", announcementRoutes);
app.use("/announcements", announcementRoutes);

app.use('/users', userRoutes);
app.use('/user-relations', userRelationRoutes);
app.use('/feed', feedRoutes);
app.use('/explore', exploreRoutes);
app.use('/interactions', postInteractionRoutes);
app.use('/messages', messageRoutes);
app.use('/help-spaces', helpSpaceRoutes);
app.use('/moderation', moderationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start(): Promise<void> {
    await userService.ensureModeratorAccount().catch((err) => {
        console.error("[moderator] No se pudo asegurar la cuenta moderadora:", err);
    });

    const isJest = Boolean(process.env.JEST_WORKER_ID);

    if (!isJest) {
        const { createDynamoTables } = await import('./database/createTables.js');
        await createDynamoTables().catch((err) => {
            console.error('[dynamo] No se pudieron asegurar las tablas:', err);
        });
    }

    if (isJest) {
        return;
    }

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

void start();

export default app;
