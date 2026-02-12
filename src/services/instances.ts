// Instancias compartidas para que user y user-relation usen los mismos datos
import { UserService } from './user-service.js';
import { UserRelationService } from './user-relation-service.js';

export const userService = new UserService();
export const relationService = new UserRelationService();
