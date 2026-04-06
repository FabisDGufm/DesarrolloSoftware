import { prisma } from "../database/prisma.js";
import type { User } from "../models/user.js";

export class UserRepository {

    private mapUser(u: any): User {
        return {
            id: u.id,
            name: u.name ?? "",
            email: u.email,
            password: u.auth?.password || "",
            friends: [], // DynamoDB futuro
            role: 0,
            profilePhoto: "",
            createdAt: u.createdAt
        };
    }

    async findAll(): Promise<User[]> {
        const users = await prisma.user.findMany({ include: { auth: true } });
        return users.map(u => this.mapUser(u));
    }

    async findById(id: number): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { auth: true }
        });
        return user ? this.mapUser(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { auth: true }
        });
        return user ? this.mapUser(user) : null;
    }

    async findByName(name: string): Promise<User | null> {
        const user = await prisma.user.findFirst({
            where: { name },
            include: { auth: true }
        });
        return user ? this.mapUser(user) : null;
    }

    async create(data: any): Promise<User> {
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                auth: {
                    create: { password: data.password }
                }
            },
            include: { auth: true }
        });

        return this.mapUser(user);
    }

    async updateName(id: number, name: string): Promise<User> {
        const user = await prisma.user.update({
            where: { id },
            data: { name },
            include: { auth: true }
        });
        return this.mapUser(user);
    }

    async updateEmail(id: number, email: string): Promise<User> {
        const user = await prisma.user.update({
            where: { id },
            data: { email },
            include: { auth: true }
        });
        return this.mapUser(user);
    }

    async updatePassword(id: number, password: string): Promise<User | null> {
        await prisma.authentication.update({
            where: { userId: id },
            data: { password }
        });

        return this.findById(id);
    }

    async updateProfilePhoto(_id: number, _profilePhoto: string): Promise<User | null> {
        // DynamoDB futuro
        return this.findById(_id);
    }

    async delete(id: number): Promise<User | null> {
        try {
            const user = await prisma.user.delete({
                where: { id },
                include: { auth: true }
            });
            return this.mapUser(user);
        } catch {
            return null;
        }
    }

    async getFriends(_id: number): Promise<User[]> {
        // DynamoDB futuro
        return [];
    }
}