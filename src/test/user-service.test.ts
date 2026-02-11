import { UserService } from '../services/user-service.js';

describe('UserService', () => {
    let userService!: UserService;

    beforeEach(() => {
        userService = new UserService();
    });

    describe('registerUser', () => {
        it('should create a user successfully', () => {
            const userData = {
                user: 'Fabitesttt',
                email: 'testfabi@mail.com',
                password: '12345678fabi',
                role: 1
            };

            const result = userService.registerUser(userData);

            expect(result).toHaveProperty('id');
            expect(result.user).toBe('Fabitesttt');
            expect(result.email).toBe('testfabi@mail.com');
            expect(result.friends).toEqual([]);
            expect(result.createdAt).toBeInstanceOf(Date);
        });
    });
});
