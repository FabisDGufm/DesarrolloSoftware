import { UserService } from '../../services/user-service.js';
import type { CreateUserDTO } from '../../models/user.js';

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = new UserService();
    });

    describe('registerUser', () => {
        it('should create a user with valid data', async () => {
            const userData: CreateUserDTO = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 1
            };

            const result = await userService.registerUser(userData);

            expect(result).toHaveProperty('id');
            expect(result.name).toBe('John Doe');
            expect(result.email).toBe('john@example.com');
            expect(result.friends).toEqual([]);
            expect(result.createdAt).toBeInstanceOf(Date);
        });

        it('should throw error if password is missing', async () => {
            const userData: CreateUserDTO = {
                name: 'John Doe',
                email: 'john@example.com',
                password: '',
                role: 1
            };

            await expect(userService.registerUser(userData))
                .rejects.toThrow('Password is required');
        });

        it('should throw error if password is too short', async () => {
            const userData: CreateUserDTO = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'short',
                role: 1
            };

            await expect(userService.registerUser(userData))
                .rejects.toThrow('Password must be at least 8 characters');
        });

        it('should throw error if email is missing', async () => {
            const userData: CreateUserDTO = {
                name: 'John Doe',
                email: '',
                password: 'password123',
                role: 1
            };

            await expect(userService.registerUser(userData))
                .rejects.toThrow('Email is required');
        });
    });

    // ----------- READ -----------
    it('should return all users', async () => {
        const users = await userService.getAllUsers();
        expect(Array.isArray(users)).toBe(true);
    });

    it('should get user by id', async () => {
        const user = await userService.registerUser({
            name: 'Johnny',
            email: 'Johnny@test.com',
            password: 'password123',
            role: 1
        });

        const found = await userService.getUserById(user.id);
        expect(found.id).toBe(user.id);
    });

    // ----------- UPDATE -----------
    it('should update user name', async () => {
        const user = await userService.registerUser({
            name: 'Bob',
            email: 'bob@test.com',
            password: 'password123',
            role: 1
        });

        const updated = await userService.updateUserName(user.id, 'Bobby');
        expect(updated.name).toBe('Bobby');
    });

    // ----------- DELETE -----------
    it('should delete a user', async () => {
        const user = await userService.registerUser({
            name: 'Pepe',
            email: 'Pepito@test.com',
            password: 'password123',
            role: 1
        });

        const result = await userService.deleteUser(user.id);

        expect(result.message).toBe('User deleted successfully');
        expect(result.deletedUser.id).toBe(user.id);
    });
});