import { UserService } from '../../services/user-service.js';
import type { CreateUserDTO } from '../../models/user.js';

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = new UserService();
    });

    describe('registerUser', () => {
        it('should create a user with valid data', () => {
            const userData: CreateUserDTO = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 1
            };

            const result = userService.registerUser(userData);

            expect(result).toHaveProperty('id');
            expect(result.name).toBe('John Doe');
            expect(result.email).toBe('john@example.com');
            expect(result.friends).toEqual([]);
            expect(result.createdAt).toBeInstanceOf(Date);
        });

        it('should throw error if password is missing', () => {
            const userData: CreateUserDTO = {
                name: 'John Doe',
                email: 'john@example.com',
                password: '',
                role: 1
            };

            expect(() => userService.registerUser(userData))
                .toThrow('Password is required');
        });

        it('should throw error if password is too short', () => {
            const userData: CreateUserDTO = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'short',
                role: 1
            };

            expect(() => userService.registerUser(userData))
                .toThrow('Password must be at least 8 characters');
        });

        it('should throw error if email is missing', () => {
            const userData: CreateUserDTO = {
                name: 'John Doe',
                email: '',
                password: 'password123',
                role: 1
            };

            expect(() => userService.registerUser(userData))
                .toThrow('Email is required');
        });
    });
});