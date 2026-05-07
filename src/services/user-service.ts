import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { User, CreateUserDTO } from '../models/user.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/custom-errors.js';
import { UserRepository } from '../repositories/user-repository.js';
import {
    getModeratorEmail,
    getModeratorPassword,
    isBuiltInModeratorEmail,
} from '../config/moderator-account.js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UNIVERSITY_DOMAINS: Record<string, string> = {
    'ufm.edu': 'Universidad Francisco Marroquín',
    'url.edu.gt': 'Universidad Rafael Landívar',
    'usac.edu.gt': 'Universidad de San Carlos de Guatemala',
    'unis.edu.gt': 'Universidad del Istmo',
    'umg.edu.gt': 'Universidad Mariano Gálvez',
    'galileo.edu': 'Universidad Galileo',
    'uvg.edu.gt': 'Universidad del Valle de Guatemala',
    'uca.edu.gt': 'Universidad Central de Guatemala',
    'urural.edu.gt': 'Universidad Rural de Guatemala',
    'upana.edu.gt': 'Universidad Panamericana',
};

function getUniversityFromEmail(email: string): string | null {
    const domain = email.split('@')[1]?.toLowerCase() ?? '';
    return UNIVERSITY_DOMAINS[domain] ?? null;
}

export class UserService {
    private passwordMinLength = 8;
    private repo: UserRepository;

    constructor(repo?: UserRepository) {
        this.repo = repo ?? new UserRepository();
    }

    private generateToken(user: Pick<User, 'id' | 'email' | 'name' | 'university' | 'role'>): string {
        const jwtSecretKey = process.env.JWT_SECRET_KEY as string;
        return jwt.sign(
            {
                sub: user.id,
                email: user.email,
                name: user.name,
                university: user.university ?? null,
                role: user.role,
            },
            jwtSecretKey,
            { expiresIn: "3d" }
        );
    }

    private s3 = new S3Client({
        region: process.env.AWS_REGION as string,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        }
    });

    private bucket = process.env.AWS_BUCKET_NAME as string;

    async getUploadUrl(key: string): Promise<{ url: string; key: string }> {
        if (!this.bucket) throw new Error("S3_BUCKET_NAME is not defined in .env");
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: "image/jpeg",
        });
        const url = await getSignedUrl(this.s3, command, { expiresIn: 300 });
        return { url, key };
    }

    async registerUser(data: CreateUserDTO) {
        if (!data.password)
            throw new ValidationError('Password is required');
        if (!data.email)
            throw new ValidationError('Email is required');
        if (!EMAIL_REGEX.test(data.email))
            throw new ValidationError('Invalid email format');

        const emailNorm = data.email.trim().toLowerCase();
        const moderatorEmail = getModeratorEmail();

        let university: string | null;
        let role: number | undefined;

        if (emailNorm === moderatorEmail) {
            if (data.password !== getModeratorPassword()) {
                throw new ValidationError('Credenciales de moderador no válidas');
            }
            university = null;
            role = 1;
        } else {
            if (data.password.length < this.passwordMinLength)
                throw new ValidationError(`Password must be at least ${this.passwordMinLength} characters`);
            const uni = getUniversityFromEmail(emailNorm);
            if (!uni)
                throw new ValidationError('Only university email addresses are allowed');
            university = uni;
        }

        const existing = await this.repo.findByEmail(emailNorm);
        if (existing)
            throw new ValidationError('Email already exists');

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const newUser = await this.repo.create({
            name: data.name,
            email: emailNorm,
            university,
            password: hashedPassword,
            ...(role !== undefined ? { role } : {}),
        });
        const token = this.generateToken(newUser);
        return { user: newUser, authentication_token: token };
    }

    /** Crea la cuenta moderadora demo si no existe y corrige rol/universidad si hace falta. */
    async ensureModeratorAccount(): Promise<void> {
        const email = getModeratorEmail();
        const password = getModeratorPassword();
        const existing = await this.repo.findByEmail(email);
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!existing) {
            await this.repo.create({
                email,
                name: 'Moderación',
                password: hashedPassword,
                university: null,
                role: 1,
            });
            return;
        }
        await this.repo.repairBuiltInModeratorAccount(email);
    }

    async getAllUsers(): Promise<User[]> {
        return this.repo.findAll();
    }

    async getUserByName(name: string): Promise<User> {
        const user = await this.repo.findByName(name);
        if (!user) throw new NotFoundError(`User with name '${name}' not found`);
        return user;
    }

    async getUserById(id: number): Promise<User> {
        const user = await this.repo.findById(id);
        if (!user) throw new NotFoundError(`User with ID ${id} not found`);
        return user;
    }

    async updateUserName(id: number, newName: string): Promise<User> {
        await this.getUserById(id);
        if (!newName || newName.trim() === '') throw new ValidationError('Name cannot be empty');
        const updated = await this.repo.updateName(id, newName);
        if (!updated) throw new NotFoundError(`User with ID ${id} not found`);
        return updated;
    }

    async updateUserEmail(id: number, newEmail: string): Promise<User> {
        const current = await this.getUserById(id);
        if (isBuiltInModeratorEmail(current.email)) {
            throw new ForbiddenError('La cuenta de moderación no puede cambiar su correo.');
        }
        if (!newEmail) throw new ValidationError('Email is required');
        const newNorm = newEmail.trim().toLowerCase();
        if (!EMAIL_REGEX.test(newNorm)) throw new ValidationError('Invalid email format');
        if (isBuiltInModeratorEmail(newNorm)) {
            throw new ValidationError('Este correo está reservado para la cuenta de moderación.');
        }
        const conflict = await this.repo.findByEmail(newNorm);
        if (conflict && conflict.id !== id) throw new ValidationError('Email already exists');
        const updated = await this.repo.updateEmail(id, newNorm);
        if (!updated) throw new NotFoundError(`User with ID ${id} not found`);
        return updated;
    }

    async updateUserPassword(id: number, newPassword: string): Promise<User> {
        await this.getUserById(id);
        if (!newPassword) throw new ValidationError('Password is required');
        if (newPassword.length < this.passwordMinLength)
            throw new ValidationError(`Password must be at least ${this.passwordMinLength} characters`);
        const hashed = await bcrypt.hash(newPassword, 10);
        const updated = await this.repo.updatePassword(id, hashed);
        if (!updated) throw new NotFoundError(`User with ID ${id} not found`);
        return updated;
    }

    async updateProfilePhoto(id: number, profilePhoto: string): Promise<User> {
        await this.getUserById(id);
        const updated = await this.repo.updateProfilePhoto(id, profilePhoto);
        if (!updated) throw new NotFoundError(`User with ID ${id} not found`);
        return updated;
    }

    async updateProfilePhotoS3(id: number, fileName: string): Promise<{ url: string; key: string }> {
        await this.getUserById(id);
        const key = `profiles/${Date.now()}-${fileName}`;
        const { url } = await this.getUploadUrl(key);
        await this.repo.updateProfilePhoto(id, url);
        return { url, key };
    }

    async deleteUser(id: number) {
        const user = await this.getUserById(id);
        if (isBuiltInModeratorEmail(user.email)) {
            throw new ForbiddenError('La cuenta de moderación no puede eliminarse.');
        }
        const deletedUser = await this.repo.delete(id);
        if (!deletedUser) throw new NotFoundError(`User with ID ${id} not found`);
        return { message: 'User deleted successfully', deletedUser };
    }

    async getFriends(id: number): Promise<User[]> {
        await this.getUserById(id);
        return [];
    }

    async addFriend(userId: number, friendId: number): Promise<User> {
        const user = await this.getUserById(userId);
        await this.getUserById(friendId);
        if (userId === friendId) throw new ValidationError('You cannot add yourself as a friend');
        if (user.friends.includes(friendId)) throw new ValidationError('User is already your friend');
        return user;
    }

    async removeFriend(userId: number, friendId: number): Promise<User> {
        const user = await this.getUserById(userId);
        if (!user.friends.includes(friendId)) throw new NotFoundError('Friend not found in your friends list');
        return user;
    }
}
