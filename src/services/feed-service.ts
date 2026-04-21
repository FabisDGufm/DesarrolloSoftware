// Servicio del feed principal

import type { FeedItem } from '../models/feed.js';
import type { FeedRepository } from '../repositories/feed-repository.js';

export class FeedService {
    constructor(private readonly repo: FeedRepository) {}

    async getFeed(): Promise<FeedItem[]> {
        return this.repo.getFeed();
    }
}
