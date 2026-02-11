import type { User, CreateUserDTO } from '../models/user.js';
import { ValidationError, NotFoundError } from '../utils/custom-errors.js';

export class UserService {
    private passwordMinLength: number = 8;
    private users: User[] = [];

    registerUser(data: CreateUserDTO): User {
        if (!data.password) {
            throw new ValidationError("Password is required");
        }

        if (data.password.length < this.passwordMinLength) {
            throw new ValidationError(`Password must be at least ${this.passwordMinLength} characters`);
        }

        if (!data.email) {
            throw new ValidationError("Email is required");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new ValidationError("Invalid email format");
        }

        const emailExists = this.users.some(user => user.email === data.email);
        if (emailExists) {
            throw new ValidationError("Email already exists");
        }

        const newUser: User = {
            id: this.users.length + 1,
            ...data,
            friends: [],
            createdAt: new Date()
        };

        this.users.push(newUser);
        console.log("User saved to DB:", newUser);
        return newUser;
    }

    getAllUsers(): User[] {
        return this.users;
    }

    getUserbN(name: string): User {
        const user = this.users.find(u => u.name.toLowerCase() === name.toLowerCase());
        
        if (!user) {
            throw new NotFoundError(`User with name '${name}' not found`);
        }
        
        return user;
    }

    getUserById(id: number): User {
        const user = this.users.find(u => u.id === id);
        
        if (!user) {
            throw new NotFoundError(`User with ID ${id} not found`);
        }
        
        return user;
    }

    updateUserN(id: number, newName: string): User {
        const user = this.getUserById(id);
        
        if (!newName || newName.trim() === '') {
            throw new ValidationError("Name cannot be empty");
        }
        
        user.name = newName;
        return user;
    }

    updateUserEmail(id: number, newEmail: string): User {
        const user = this.getUserById(id);
        
        if (!newEmail) {
            throw new ValidationError("Email is required");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            throw new ValidationError("Invalid email format");
        }

        const emailExists = this.users.some(u => u.email === newEmail && u.id !== id);
        if (emailExists) {
            throw new ValidationError("Email already exists");
        }
        
        user.email = newEmail;
        return user;
    }

    updateUserP(id: number, newPassword: string): User {
        const user = this.getUserById(id);
        
        if (!newPassword) {
            throw new ValidationError("Password is required");
        }

        if (newPassword.length < this.passwordMinLength) {
            throw new ValidationError(`Password must be at least ${this.passwordMinLength} characters`);
        }
        
        user.password = newPassword;
        return user;
    }

    deleteUser(id: number): { message: string; deletedUser: User } {
        const userIndex = this.users.findIndex(u => u.id === id);
        
        if (userIndex === -1) {
            throw new NotFoundError(`User with ID ${id} not found`);
        }
        
        const deletedUsers = this.users.splice(userIndex, 1);
        const deletedUser = deletedUsers[0]; // ← CAMBIO AQUÍ
        
        if (!deletedUser) {
            throw new NotFoundError(`User with ID ${id} not found`);
        }
        
        return {
            message: "User deleted successfully",
            deletedUser
        };
    }

    getFriends(id: number): User[] {
        const user = this.getUserById(id);
        const friends = this.users.filter(u => user.friends.includes(u.id));
        return friends;
    }

    addFriend(userId: number, friendId: number): User {
        const user = this.getUserById(userId);
        this.getUserById(friendId); // Verificar que el amigo existe
        
        if (userId === friendId) {
            throw new ValidationError("You cannot add yourself as a friend");
        }
        
        if (user.friends.includes(friendId)) {
            throw new ValidationError("User is already your friend");
        }
        
        user.friends.push(friendId);
        return user;
    }

    removeFriend(userId: number, friendId: number): User {
        const user = this.getUserById(userId);
        
        const friendIndex = user.friends.indexOf(friendId);
        
        if (friendIndex === -1) {
            throw new NotFoundError("Friend not found in your friends list");
        }
        
        user.friends.splice(friendIndex, 1);
        return user;
    }
}