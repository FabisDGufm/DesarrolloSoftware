import { randomUUID } from "node:crypto";
import {
    S3Client,
    PutObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { PostRepository } from "../repositories/post-repository";
import { ValidationError, NotFoundError } from "../utils/custom-errors.js";

export class PostService {
    private repo: PostRepository;

    private s3 = new S3Client({
        region: process.env.AWS_REGION as string
    });

    constructor(repo: PostRepository) {
        this.repo = repo;
    }

    async getUploadUrl(fileName: string) {
        if (!fileName) throw new ValidationError("fileName required");

        const bucket = process.env.AWS_BUCKET_NAME as string;

        const key = `posts/${Date.now()}-${randomUUID()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: "image/jpeg"
        });

        const url = await getSignedUrl(this.s3, command, {
            expiresIn: 300
        });

        return { url, key };
    }

    async createPost(authorId: number, text: string, imageUrl?: string) {
        const post = {
            authorId,
            postId: randomUUID(),
            text,
            imageUrl: imageUrl ?? null,
            createdAt: new Date().toISOString()
        };

        return this.repo.create(post);
    }

    async getPost(authorId: number, postId: string) {
        const post = await this.repo.findById(authorId, postId);
        if (!post) throw new NotFoundError("Post not found");
        return post;
    }

    async getPostsByUser(authorId: number) {
        return this.repo.findByAuthor(authorId);
    }

    async deletePost(authorId: number, postId: string) {
        const deleted = await this.repo.delete(authorId, postId);
        if (!deleted) throw new NotFoundError("Post not found");

        return { message: "Post deleted" };
    }
}