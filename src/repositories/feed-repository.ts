// Repositorio simulado del feed principal

import type { FeedItem, CreateFeedItem } from '../models/feed.js';

const simulateDelay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));

const db: {posts: FeedItem[]} = {posts: []};
let autoIncrement = 0;

export class FeedRepository {
 
    async findAll(): Promise<FeedItem[]> {
        await simulateDelay();
        console.log('[DB] SELECT * FROM posts ORDER BY created_at DESC');
        return [...db.posts].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
        }

    async findById(id:number): Promise<FeedItem | null>{
        await simulateDelay;
        console.log('[DB] SELECT * FROM posts WHERE id = ${id}');
        return db.posts.find(p => p.id === id) ?? null;
        }

    async create(data: CreateFeedItem): Promise<FeedItem> {
        await simulateDelay;
        const newPost: FeedItem = {
            id: ++autoIncrement,
            ...data,
            createdAt: new Date()
        };
        db.posts.push(newPost);
        console.log(`[DB] INSERT INTO posts (author_id, content) VALUES (${data.authorId}, '${data.content}')`);
        return { ...newPost};
        }

    async update(id: number, content: string): Promise<FeedItem | null> {
        await simulateDelay();
        const post = db.posts.find(p => p.id === id);
        if (!post) return null;
        post.content = content;
        console.log(`[DB] UPDATE posts SET content = '${content}' WHERE id = ${id}`);
        return { ...post };
        }

    }
