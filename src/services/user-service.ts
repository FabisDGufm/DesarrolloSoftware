import type { User, CreateUserDTO } from '../models/user.js';

export class UserService {
    private passwordMinLength: number = 8;

    registerUser(data: CreateUserDTO): User {
        if (!data.password) {
            throw new Error("Password is required");
        }

        if (data.password.length < this.passwordMinLength) {
            throw new Error("Password must be at least 8 characters");
        }

        if (!data.email) {
            throw new Error("Email is required");
        }

        const newUser: User = {
            id: Math.floor(Math.random() * 1000), // ID simulado
            ...data,
            friends: [],
            createdAt: new Date()
        };

        console.log("User saved to DB:", newUser);
        return newUser;
    }
}
