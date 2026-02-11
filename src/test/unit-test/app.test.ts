import { UserService } from '../../services/user-service.js';
import type { CreateUserDTO } from '../../models/user.js';

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = new UserService();
    });

    describe('registerUser', () => {
        const validUser: CreateUserDTO = {
            name: 'Juanda',
            email: 'jdc@example.com',
            password: 'password123',
            role: 1
        };

        it('should create a user with valid data', () => {
            const result = userService.registerUser(validUser);

            expect(result).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    email: expect.any(String),
                    role: expect.any(Number),
                    friends: expect.any(Array),
                    createdAt: expect.any(Date),
                })
            );

            expect(result.friends).toEqual([]);
            expect(result.createdAt).toBeInstanceOf(Date);
        });

        it('should generate different IDs for different users', () => {
            const user1 = userService.registerUser(validUser);
            const user2 = userService.registerUser(validUser);

            expect(user1.id).not.toBe(user2.id);
        });

        it('should throw error if password is missing', () => {
            expect(() =>
                userService.registerUser({ ...validUser, password: '' })
            ).toThrow('Password is required');
        });

        it('should throw error if password is too short', () => {
            expect(() =>
                userService.registerUser({ ...validUser, password: 'short' })
            ).toThrow('Password must be at least 8 characters');
        });

        it('should throw error if email is missing', () => {
            expect(() =>
                userService.registerUser({ ...validUser, email: '' })
            ).toThrow('Email is required');
        });

        it('should allow empty name (current behavior)', () => {
            const result = userService.registerUser({
                ...validUser,
                name: ''
            });

            expect(result.name).toBe('');
        });
    });
});
