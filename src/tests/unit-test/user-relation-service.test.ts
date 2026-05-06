import { jest } from '@jest/globals';
import { UserRelationService } from '../../services/user-relation-service.js';
import type { FriendRelation } from '../../models/user-relation.js';

describe('UserRelationService', () => {
    let repo: any;
    let service: UserRelationService;

    const mockRelation: FriendRelation = {
        id: 123,
        requesterId: 1,
        receiverId: 2,
        status: 'pending',
        createdAt: new Date(),
    };

    beforeEach(() => {
        repo = {
            findExistingRelation: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            updateStatus: jest.fn(),
            findAcceptedByUser: jest.fn(),
            deleteAllForUser: jest.fn(),
        };
        service = new UserRelationService(repo);
    });

    it('should send friend request', async () => {
        repo.findExistingRelation.mockResolvedValue(null);
        repo.create.mockResolvedValue(mockRelation);
        const result = await service.sendFriendRequest(1, 2);
        expect(result.status).toBe('pending');
    });

    it('should accept friend request', async () => {
        repo.findById.mockResolvedValue(mockRelation);
        repo.updateStatus.mockResolvedValue({ ...mockRelation, status: 'accepted' });
        const result = await service.acceptFriendRequest(123);
        expect(result.status).toBe('accepted');
    });

    it('should get friends list', async () => {
        repo.findAcceptedByUser.mockResolvedValue([mockRelation]);
        const result = await service.getFriends(1);
        expect(Array.isArray(result)).toBe(true);
    });

    it('should remove all relations for user', async () => {
        repo.deleteAllForUser.mockResolvedValue(undefined);
        await service.removeAllRelationsForUser(1);
        expect(repo.deleteAllForUser).toHaveBeenCalledWith(1);
    });
});
