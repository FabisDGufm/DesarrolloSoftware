import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { User, CreateUserDTO } from '../models/user.js';
import { ValidationError, NotFoundError } from '../utils/custom-errors.js';
import { UserRepository } from '../repositories/user-repository.js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UserService {
    private passwordMinLength = 8;
    private repo: UserRepository;

    constructor(repo?: UserRepository) {
        this.repo = repo ?? new UserRepository();
    }

    // ========================
    // AUTH
    // ========================
    private generateToken(userId: number, email: string): string {
        const jwtSecretKey = process.env.JWT_SECRET_KEY as string;

        return jwt.sign(
            { sub: userId, email },
            jwtSecretKey,
            { expiresIn: "3d" }
        );
    }

    // ========================
    // S3 CLIENT
    // ========================
    private s3 = new S3Client({
        region: process.env.AWS_REGION as string,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        }
    });

    private bucket = process.env.AWS_BUCKET_NAME as string;

    // ========================
    // S3 - PRESIGNED URL
    // ========================
    async getUploadUrl(key: string): Promise<{ url: string; key: string }> {
        if (!this.bucket) {
            throw new Error("S3_BUCKET_NAME is not defined in .env");
        }

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: "image/jpeg",
        });

        const url = await getSignedUrl(this.s3, command, { expiresIn: 300 });

        return { url, key };
    }

    // =========================
    // USERS
    // =========================

    async registerUser(data: CreateUserDTO) {
        if (!data.password)
            throw new ValidationError('Password is required');

        if (data.password.length < this.passwordMinLength)
            throw new ValidationError(
                `Password must be at least ${this.passwordMinLength} characters`
            );

        if (!data.email)
            throw new ValidationError('Email is required');

        if (!EMAIL_REGEX.test(data.email))
            throw new ValidationError('Invalid email format');

        const existing = await this.repo.findByEmail(data.email);
        if (existing)
            throw new ValidationError('Email already exists');

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await this.repo.create({
            ...data,
            password: hashedPassword
        });

        const token = this.generateToken(newUser.id, newUser.email);

        return {
            user: newUser,
            authentication_token: token
        };
    }

    async getAllUsers(): Promise<User[]> {
        return this.repo.findAll();
    }

    async getUserByName(name: string): Promise<User> {
        const user = await this.repo.findByName(name);
        if (!user)
            throw new NotFoundError(`User with name '${name}' not found`);
        return user;
    }

    async getUserById(id: number): Promise<User> {
        const user = await this.repo.findById(id);
        if (!user)
            throw new NotFoundError(`User with ID ${id} not found`);
        return user;
    }

    async updateUserName(id: number, newName: string): Promise<User> {
        await this.getUserById(id);

        if (!newName || newName.trim() === '')
            throw new ValidationError('Name cannot be empty');

        const updated = await this.repo.updateName(id, newName);
        if (!updated)
            throw new NotFoundError(`User not found`);

        return updated;
    }

    async updateUserEmail(id: number, newEmail: string): Promise<User> {
        await this.getUserById(id);

        if (!newEmail)
            throw new ValidationError('Email is required');

        if (!EMAIL_REGEX.test(newEmail))
            throw new ValidationError('Invalid email format');

        const conflict = await this.repo.findByEmail(newEmail);
        if (conflict && conflict.id !== id)
            throw new ValidationError('Email already exists');

        const updated = await this.repo.updateEmail(id, newEmail);
        if (!updated)
            throw new NotFoundError(`User not found`);

        return updated;
    }

    async updateUserPassword(id: number, newPassword: string): Promise<User> {
        await this.getUserById(id);

        if (!newPassword)
            throw new ValidationError('Password is required');

        if (newPassword.length < this.passwordMinLength)
            throw new ValidationError('Password too short');

        const hashed = await bcrypt.hash(newPassword, 10);

        const updated = await this.repo.updatePassword(id, hashed);
        if (!updated)
            throw new NotFoundError(`User not found`);

        return updated;
    }

    // =========================
    // PROFILE PHOTO (S3 FLOW)
    // =========================

async updateProfilePhoto(id: number, fileName: string): Promise<User> {
    const user = await this.getUserById(id);

    const key = `profiles/${Date.now()}-${fileName}`;

    const { url } = await this.getUploadUrl(key);

    const updatedUser = await this.repo.updateProfilePhoto(id, url);

    if (!updatedUser) {
        throw new NotFoundError("User not found");
    }

    return updatedUser;
}

    // =========================
    // DELETE
    // =========================
    async deleteUser(id: number) {
        const deletedUser = await this.repo.delete(id);

        if (!deletedUser)
            throw new NotFoundError(`User not found`);

        return {
            message: 'User deleted successfully',
            deletedUser
        };
    }

    async getFriends(id: number): Promise<User[]> {
        await this.getUserById(id);
        return [];
    }

    async addFriend(userId: number, friendId: number): Promise<User> {
        const user = await this.getUserById(userId);
        await this.getUserById(friendId);

        if (userId === friendId)
            throw new ValidationError('Cannot add yourself');

        if (user.friends.includes(friendId))
            throw new ValidationError('Already friends');

        return user;
    }

    async removeFriend(userId: number, friendId: number): Promise<User> {
        const user = await this.getUserById(userId);

        if (!user.friends.includes(friendId))
            throw new NotFoundError('Friend not found');

        return user;
    }
}