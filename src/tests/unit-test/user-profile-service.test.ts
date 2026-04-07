import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { UserProfileService } from '../../services/user-profile-service.js';

describe('UserProfileService', () => {
  let service: UserProfileService;

  const mockUserService: any = {
    getUserById: jest.fn(),
    getFriends: jest.fn()
  };

  const mockRelationService: any = {
    getReceivedRequests: jest.fn(),
    getSentRequests: jest.fn()
  };

  beforeEach(() => {
    service = new UserProfileService(
      mockUserService,
      mockRelationService
    );

    jest.clearAllMocks();
  });

  it('should return full user profile', async () => {
    mockUserService.getUserById.mockResolvedValue({
      id: 1,
      name: 'Juan',
      email: 'juan@test.com',
      profilePhoto: 'img.png'
    });

    mockUserService.getFriends.mockResolvedValue([2, 3]);

    mockRelationService.getReceivedRequests.mockResolvedValue([]);
    mockRelationService.getSentRequests.mockResolvedValue([]);

    const result = await service.getProfile(1);

    expect(result.user.name).toBe('Juan');
    expect(result.friends.length).toBe(2);
    expect(result.receivedRequests).toEqual([]);
    expect(result.sentRequests).toEqual([]);
  });
});