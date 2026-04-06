import { UserService } from '../../services/user-service.js';
import type { CreateUserDTO } from '../../models/user.js';

describe('UserService', () => {
    let userService: UserService;

    const uniqueEmail = () =>
        `test_${Date.now()}_${Math.random()}@mail.com`;

    beforeEach(() => {
        userService = new UserService();
    });

    describe('registerUser', () => {
        it('should create a user with valid data', async () => {
            const userData: CreateUserDTO = {
                name: 'John Doe',
                email: uniqueEmail(),
                password: 'password123',
                role: 1
            };

            const { user } = await userService.registerUser(userData);

            expect(user).toHaveProperty('id');
            expect(user.name).toBe('John Doe');
            expect(user.friends).toEqual([]);
        });

        it('should throw error if password is missing', async () => {
            await expect(
                userService.registerUser({
                    name: 'John',
                    email: uniqueEmail(),
                    password: '',
                    role: 1
                })
            ).rejects.toThrow('Password is required');
        });

        it('should throw error if password is too short', async () => {
            await expect(
                userService.registerUser({
                    name: 'John',
                    email: uniqueEmail(),
                    password: 'short',
                    role: 1
                })
            ).rejects.toThrow('Password must be at least 8 characters');
        });

        it('should throw error if email is missing', async () => {
            await expect(
                userService.registerUser({
                    name: 'John',
                    email: '',
                    password: 'password123',
                    role: 1
                })
            ).rejects.toThrow('Email is required');
        });
    });

    it('should get user by id', async () => {
        const { user } = await userService.registerUser({
            name: 'Johnny',
            email: uniqueEmail(),
            password: 'password123',
            role: 1
        });

        const found = await userService.getUserById(user.id);
        expect(found.id).toBe(user.id);
    });

    it('should update user name', async () => {
        const { user } = await userService.registerUser({
            name: 'Bob',
            email: uniqueEmail(),
            password: 'password123',
            role: 1
        });

        const updated = await userService.updateUserName(user.id, 'Bobby');
        expect(updated.name).toBe('Bobby');
    });

    it('should delete a user', async () => {
        const { user } = await userService.registerUser({
            name: 'Pepe',
            email: uniqueEmail(),
            password: 'password123',
            role: 1
        });

        const result = await userService.deleteUser(user.id);

        expect(result.message).toBe('User deleted successfully');
        expect(result.deletedUser.id).toBe(user.id);
    });
});