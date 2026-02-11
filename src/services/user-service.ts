import type { User, CreateUserDTO, UpdateUserDTO } from '../models/user.js';

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

    // Read all
    getAllUsers(): User[] {
        console.log("Getting all users from DB");
        return [];
    }

    // Read user by name
    getUserbN(name: string): User | undefined {
        console.log("Getting user: ", name);
        return undefined;
    }

    // Update user name
    updateUserN(id: number, name: string): boolean {
        console.log("Updating user's old name to:", name);
        return true;
    }

    // Update user email
    updateUserEmail(id: number, email: string): boolean {
        console.log("Updating user's email to ", email);
        return true;
    }

    // Update user password
    updateUserP(id: number, password: string): boolean {
        console.log("Updating user's password");
        if(password.length < this.passwordMinLength) {
            throw new Error("Password must be at least 8 characters");
        }
        return true
    }

    //Delete
    deleteUser(id: number): boolean{
        console.log("Deleting user")
        return true;
    }

    // Obtener amigos
    getFriends(id: number): number[] {
        console.log("Getting friends to user...");
        return [3,4,8];
    }
}
