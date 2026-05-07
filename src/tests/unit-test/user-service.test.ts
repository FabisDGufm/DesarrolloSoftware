import { jest } from '@jest/globals';
import { UserService } from '../../services/user-service.js';
import type { User } from '../../models/user.js';

describe('UserService', () => {
    let repo: any;
    let service: UserService;

    const mockUser: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@ufm.edu',
        password: '$2b$10$hashedpassword',
        friends: [],
        role: 0,
        accountStatus: 'ACTIVE',
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
            repairBuiltInModeratorAccount: jest.fn(),
        };
        service = new UserService(repo);
    });

    it('should throw if password is missing', async () => {
        await expect(service.registerUser({ name: 'John', email: 'j@ufm.edu', password: '', role: 1 }))
            .rejects.toThrow('Password is required');
    });

    it('should throw if password is too short', async () => {
        await expect(service.registerUser({ name: 'John', email: 'j@ufm.edu', password: 'short', role: 1 }))
            .rejects.toThrow('Password must be at least 8 characters');
    });

    it('should throw if email is missing', async () => {
        await expect(service.registerUser({ name: 'John', email: '', password: 'password123', role: 1 }))
            .rejects.toThrow('Email is required');
    });

    it('should register user successfully', async () => {
        repo.findByEmail.mockResolvedValue(null);
        repo.create.mockResolvedValue(mockUser);
        const result = await service.registerUser({ name: 'John Doe', email: 'john@ufm.edu', password: 'password123', role: 1 });
        expect(result.user.name).toBe('John Doe');
        expect(result.authentication_token).toBeDefined();
        expect(repo.create).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'john@ufm.edu',
                name: 'John Doe',
                university: 'Universidad Francisco Marroquín',
            })
        );
    });

    it('should reject built-in moderator email with wrong password', async () => {
        await expect(
            service.registerUser({
                name: 'Mod',
                email: 'moderador@admin.com',
                password: 'wrong-pass-here',
                role: 0,
            })
        ).rejects.toThrow('Credenciales de moderador no válidas');
    });

    it('should register built-in moderator with correct password', async () => {
        const modUser: User = { ...mockUser, email: 'moderador@admin.com', role: 1 };
        repo.findByEmail.mockResolvedValue(null);
        repo.create.mockResolvedValue(modUser);
        const result = await service.registerUser({
            name: 'Moderación',
            email: 'moderador@admin.com',
            password: 'Password123',
            role: 0,
        });
        expect(result.user.role).toBe(1);
        expect(repo.create).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'moderador@admin.com',
                university: null,
                role: 1,
            })
        );
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

    it('should forbid deleting built-in moderator account', async () => {
        repo.findById.mockResolvedValue({
            ...mockUser,
            email: 'moderador@admin.com',
        });
        await expect(service.deleteUser(1)).rejects.toThrow('La cuenta de moderación no puede eliminarse');
    });
});