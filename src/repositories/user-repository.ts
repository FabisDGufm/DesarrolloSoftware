import { prisma } from "../database/prisma.js";
import type { User } from "../models/user.js";
import { UserRelationRepository } from "./user-relation-repository.js";

const relationRepo = new UserRelationRepository();

/** Fila Prisma User + auth incluida en consultas. */
type PrismaUserRow = {
    id: number;
    email: string;
    name: string | null;
    createdAt: Date;
    role: number;
    accountStatus: string;
    suspendedUntil: Date | null;
    auth?: { password: string } | null;
};

export class UserRepository {

    private mapUser(u: PrismaUserRow): User {
        return {
            id: u.id,
            name: u.name ?? "",
            email: u.email,
            password: u.auth?.password || "",
            friends: [],
            role: u.role,
            accountStatus: u.accountStatus,
            suspendedUntil: u.suspendedUntil,
            profilePhoto: "",
            createdAt: u.createdAt,
        };
    }

    async findAll(): Promise<User[]> {
        const users = await prisma.user.findMany({ include: { auth: true } });
        return (users as PrismaUserRow[]).map((u) => this.mapUser(u));
    }

    async findById(id: number): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { auth: true }
        });
        return user ? this.mapUser(user as PrismaUserRow) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { auth: true }
        });
        return user ? this.mapUser(user as PrismaUserRow) : null;
    }

    async findByName(name: string): Promise<User | null> {
        const user = await prisma.user.findFirst({
            where: { name },
            include: { auth: true }
        });
        return user ? this.mapUser(user as PrismaUserRow) : null;
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

        return this.mapUser(user as PrismaUserRow);
    }

    async updateName(id: number, name: string): Promise<User> {
        const user = await prisma.user.update({
            where: { id },
            data: { name },
            include: { auth: true }
        });
        return this.mapUser(user as PrismaUserRow);
    }

    async updateEmail(id: number, email: string): Promise<User> {
        const user = await prisma.user.update({
            where: { id },
            data: { email },
            include: { auth: true }
        });
        return this.mapUser(user as PrismaUserRow);
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
            return this.mapUser(user as PrismaUserRow);
        } catch {
            return null;
        }
    }

    /** Actualiza estado de moderacion (suspension / ban / reactivacion). */
    async updateAccountModeration(
        id: number,
        patch: { accountStatus: string; suspendedUntil?: Date | null }
    ): Promise<User | null> {
        try {
            const user = await prisma.user.update({
                where: { id },
                data: {
                    accountStatus: patch.accountStatus,
                    ...(patch.suspendedUntil !== undefined
                        ? { suspendedUntil: patch.suspendedUntil }
                        : {}),
                },
                include: { auth: true },
            });
            return this.mapUser(user as PrismaUserRow);
        } catch {
            return null;
        }
    }

    /** Si la suspension ya vencio, vuelve a ACTIVE. */
    async clearExpiredSuspension(id: number): Promise<void> {
        const now = new Date();
        await prisma.user.updateMany({
            where: {
                id,
                accountStatus: "SUSPENDED",
                suspendedUntil: { lte: now },
            },
            data: {
                accountStatus: "ACTIVE",
                suspendedUntil: null,
            },
        });
    }

    async getFriends(id: number): Promise<User[]> {
        const relations = await relationRepo.findAcceptedByUser(id);
        if (relations.length === 0) return [];

        const friendIds = relations.map(r =>
            r.requesterId === id ? r.receiverId : r.requesterId
        );

        const friends = await Promise.all(friendIds.map(fid => this.findById(fid)));
        return friends.filter((u): u is User => u !== null);
    }
}