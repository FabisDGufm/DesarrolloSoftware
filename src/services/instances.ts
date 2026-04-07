// src/services/instances.ts
// Instancias compartidas — ahora los repositorios usan DynamoDB

import { UserRepository } from '../repositories/user-repository.js';
import { UserRelationRepository } from '../repositories/user-relation-repository.js';
import { FeedRepository } from '../repositories/feed-repository.js';
import { ExploreRepository } from '../repositories/explore-repository.js';
import { PostInteractionRepository } from '../repositories/post-interaction-repository.js';
import { MessageRepository } from '../repositories/message-repository.js';
import { UserService } from './user-service.js';
import { UserRelationService } from './user-relation-service.js';
import { FeedService } from './feed-service.js';
import { ExploreService } from './explore-service.js';
import { PostInteractionService } from './post-interaction-service.js';
import { MessageService } from './message-service.js';
import { UserProfileService } from './user-profile-service.js';

// Repositorios — UserRepository sigue en MariaDB via Prisma
//               Los demás ahora usan DynamoDB
export const userRepository = new UserRepository();
export const userRelationRepository = new UserRelationRepository();
export const feedRepository = new FeedRepository();
export const exploreRepository = new ExploreRepository();
export const postInteractionRepository = new PostInteractionRepository();
export const messageRepository = new MessageRepository();

// Servicios con inyección de dependencias (no cambia nada aquí)
export const userService = new UserService(userRepository);
export const relationService = new UserRelationService(userRelationRepository);
export const feedService = new FeedService(feedRepository);
export const exploreService = new ExploreService(exploreRepository);
export const postInteractionService = new PostInteractionService(
    postInteractionRepository
);
export const messageService = new MessageService(messageRepository);
export const userProfileService = new UserProfileService(userService, relationService);