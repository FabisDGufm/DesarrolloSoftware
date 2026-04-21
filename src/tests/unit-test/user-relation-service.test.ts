import { UserRelationService } from '../../services/user-relation-service.js';

describe('UserRelationService', () => {
    let service: UserRelationService;

    beforeEach(() => {
        service = new UserRelationService();
    });

    // CREATE
    it('should send friend request', async () => {
        const relation = await service.sendFriendRequest(1, 2);
        expect(relation.status).toBe('pending');
    });

    // UPDATE (accept)
    it('should accept friend request', async () => {
        const relation = await service.sendFriendRequest(3, 4);
        const accepted = await service.acceptFriendRequest(relation.id);
        expect(accepted.status).toBe('accepted');
    });

    // READ
    it('should get friends list', async () => {
        const friends = await service.getFriends(1);
        expect(Array.isArray(friends)).toBe(true);
    });

    // DELETE
    it('should remove all relations for user', async () => {
        await service.removeAllRelationsForUser(1);
    });
});