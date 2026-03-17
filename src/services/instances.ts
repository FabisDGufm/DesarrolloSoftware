// src/services/instances.ts
// Instancias compartidas para que user y user-relation usen los mismos datos

import { UserRepository } from '../repositories/user-repository.js';
import { UserRelationRepository } from '../repositories/user-relation-repository.js';
import { FeedRepository } from '../repositories/feed-repository.js';
import { ExploreRepository } from '../repositories/explore-repository.js';
import { UserService } from './user-service.js';
import { UserRelationService } from './user-relation-service.js';
import { FeedService } from './feed-service.js';
import { ExploreService } from './explore-service.js';

// Shared repository instances (single in-memory "database")
export const userRepository = new UserRepository();
export const userRelationRepository = new UserRelationRepository();
export const feedRepository = new FeedRepository();
export const exploreRepository = new ExploreRepository();

// Services receive the shared repo instances via dependency injection
export const userService = new UserService(userRepository);
export const relationService = new UserRelationService(userRelationRepository);
export const feedService = new FeedService(feedRepository);
export const exploreService = new ExploreService(exploreRepository);