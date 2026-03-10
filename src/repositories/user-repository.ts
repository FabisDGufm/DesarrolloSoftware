// src/repositories/user-repository.ts
// Simulated database repository for User entities

import type { User, CreateUserDTO } from '../models/user.js';
import { ValidationError, NotFoundError } from '../utils/custom-errors.js';

// Simulated in-memory "database"
const db: { users: User[] } = { users: [] };
let autoIncrement = 0;

// Simulates network/disk latency of a real DB call
const simulateDelay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));

export class UserRepository {

    async findAll(): Promise<User[]> {
        await simulateDelay();
        console.log('[DB] SELECT * FROM users');
        return [...db.users];
    }

    async findById(id: number): Promise<User | null> {
        await simulateDelay();
        console.log(`[DB] SELECT * FROM users WHERE id = ${id}`);
        return db.users.find(u => u.id === id) ?? null;
    }

    async findByName(name: string): Promise<User | null> {
        await simulateDelay();
        console.log(`[DB] SELECT * FROM users WHERE LOWER(name) = '${name.toLowerCase()}'`);
        return db.users.find(u => u.name.toLowerCase() === name.toLowerCase()) ?? null;
    }

    async findByEmail(email: string): Promise<User | null> {
        await simulateDelay();
        console.log(`[DB] SELECT * FROM users WHERE email = '${email}'`);
        return db.users.find(u => u.email === email) ?? null;
    }

    async create(data: CreateUserDTO): Promise<User> {
        await simulateDelay();
        const newUser: User = {
            id: ++autoIncrement,
            ...data,
            friends: [],
            createdAt: new Date()
        };
        db.users.push(newUser);
        console.log(`[DB] INSERT INTO users VALUES (${newUser.id}, '${newUser.email}', ...)`);
        return { ...newUser };
    }

    async updateName(id: number, name: string): Promise<User | null> {
        await simulateDelay();
        const user = db.users.find(u => u.id === id);
        if (!user) return null;
        user.name = name;
        console.log(`[DB] UPDATE users SET name = '${name}' WHERE id = ${id}`);
        return { ...user };
    }

    async updateEmail(id: number, email: string): Promise<User | null> {
        await simulateDelay();
        const user = db.users.find(u => u.id === id);
        if (!user) return null;
        user.email = email;
        console.log(`[DB] UPDATE users SET email = '${email}' WHERE id = ${id}`);
        return { ...user };
    }

    async updatePassword(id: number, password: string): Promise<User | null> {
        await simulateDelay();
        const user = db.users.find(u => u.id === id);
        if (!user) return null;
        user.password = password;
        console.log(`[DB] UPDATE users SET password = '[HASHED]' WHERE id = ${id}`);
        return { ...user };
    }

    async updateProfilePhoto(id: number, profilePhoto: string): Promise<User | null> {
        await simulateDelay();
        const user = db.users.find(u => u.id === id);
        if (!user) return null;
        user.profilePhoto = profilePhoto;
        console.log(`[DB] UPDATE users SET profile_photo = '${profilePhoto}' WHERE id = ${id}`);
        return { ...user };
    }

    async addFriend(userId: number, friendId: number): Promise<User | null> {
        await simulateDelay();
        const user = db.users.find(u => u.id === userId);
        if (!user) return null;
        user.friends.push(friendId);
        console.log(`[DB] INSERT INTO user_friends (user_id, friend_id) VALUES (${userId}, ${friendId})`);
        return { ...user };
    }

    async removeFriend(userId: number, friendId: number): Promise<User | null> {
        await simulateDelay();
        const user = db.users.find(u => u.id === userId);
        if (!user) return null;
        const idx = user.friends.indexOf(friendId);
        if (idx === -1) return null;
        user.friends.splice(idx, 1);
        console.log(`[DB] DELETE FROM user_friends WHERE user_id = ${userId} AND friend_id = ${friendId}`);
        return { ...user };
    }

    async getFriends(userId: number): Promise<User[]> {
        await simulateDelay();
        const user = db.users.find(u => u.id === userId);
        if (!user) return [];
        const friends = db.users.filter(u => user.friends.includes(u.id));
        console.log(`[DB] SELECT u.* FROM users u JOIN user_friends f ON u.id = f.friend_id WHERE f.user_id = ${userId}`);
        return friends.map(u => ({ ...u }));
    }

    async delete(id: number): Promise<User | null> {
        await simulateDelay();
        const idx = db.users.findIndex(u => u.id === id);
        if (idx === -1) return null;

        // Remove from all friends lists
        for (const u of db.users) {
            const friendIdx = u.friends.indexOf(id);
            if (friendIdx !== -1) u.friends.splice(friendIdx, 1);
        }

        const [deletedUser] = db.users.splice(idx, 1);
        console.log(`[DB] DELETE FROM users WHERE id = ${id}`);
        return deletedUser ? { ...deletedUser } : null;
    }
}