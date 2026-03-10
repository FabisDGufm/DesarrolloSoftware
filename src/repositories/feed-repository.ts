// Repositorio simulado del feed principal

import type { FeedItem } from '../models/feed.js';

const simulateDelay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));

// Datos de ejemplo para el feed
const mockFeed: FeedItem[] = [
    { id: 1, authorId: 1, content: 'Primera publicación del feed.', createdAt: new Date() },
    { id: 2, authorId: 2, content: 'Otra entrada de ejemplo.', createdAt: new Date() },
];

export class FeedRepository {

    async getFeed(): Promise<FeedItem[]> {
        await simulateDelay();
        console.log('[DB] SELECT * FROM feed ORDER BY created_at DESC');
        return [...mockFeed];
    }
}
