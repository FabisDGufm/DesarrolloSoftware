import { jest } from '@jest/globals';
import { UserService } from '../../services/user-service.js';
import type { User } from '../../models/user.js';

describe('UserService', () => {
    let repo: any;
    let service: UserService;

    const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@test.com',
        password: '$2b$10$hashedpassword',
        friends: [],
        role: 0,
        profilePhoto: '',
        createdAt: new Date(),
    };

    beforeEach(() => {
        repo = {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            updateName: jest.fn(),
            delete: jest.fn(),
        };
        service = new UserService(repo);
    });

    it('should throw if password is missing', async () => {
        await expect(service.registerUser({ name: 'John', email: 'j@j.com', password: '', role: 1 }))
            .rejects.toThrow('Password is required');
    });

    it('should throw if password is too short', async () => {
        await expect(service.registerUser({ name: 'John', email: 'j@j.com', password: 'short', role: 1 }))
            .rejects.toThrow('Password must be at least 8 characters');
    });

    it('should throw if email is missing', async () => {
        await expect(service.registerUser({ name: 'John', email: '', password: 'password123', role: 1 }))
            .rejects.toThrow('Email is required');
    });

    it('should register user successfully', async () => {
        repo.findByEmail.mockResolvedValue(null);
        repo.create.mockResolvedValue(mockUser);
        const result = await service.registerUser({ name: 'John Doe', email: 'john@test.com', password: 'password123', role: 1 });
        expect(result.user.name).toBe('John Doe');
        expect(result.authentication_token).toBeDefined();
    });

    it('should get user by id', async () => {
        repo.findById.mockResolvedValue(mockUser);
        const result = await service.getUserById(1);
        expect(result.id).toBe(1);
    });

    it('should update user name', async () => {
        repo.findById.mockResolvedValue(mockUser);
        repo.updateName.mockResolvedValue({ ...mockUser, name: 'Bobby' });
        const result = await service.updateUserName(1, 'Bobby');
        expect(result.name).toBe('Bobby');
    });

    it('should delete user', async () => {
        repo.findById.mockResolvedValue(mockUser);
        repo.delete.mockResolvedValue(mockUser);
        const result = await service.deleteUser(1);
        expect(result.message).toBe('User deleted successfully');
    });
});