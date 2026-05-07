import { randomUUID } from "node:crypto";
import {
    S3Client,
    PutObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { PostRepository } from "../repositories/post-repository.js";
import { ValidationError, NotFoundError } from "../utils/custom-errors.js";
import type { Post } from "../models/post.js";

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

    // 🔥 ACTUALIZADO
    async createPost(
        authorId: number,
        text: string,
        imageUrl?: string,
        type: "normal" | "news" | "announcement" = "normal",
        userUniversity?: string
    ) {
        const post: Post = {
            authorId,
            postId: randomUUID(),
            text,
            imageUrl: imageUrl ?? null,
            createdAt: new Date().toISOString(),
            type,
            university: userUniversity ?? null,
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

    /** Normal posts for home timeline (UUID postIds; works with interactions). */
    async getSocialFeed(): Promise<Post[]> {
        const posts: Post[] = await this.repo.findAll();
        return posts
            .filter((p: Post) => p.type === undefined || p.type === "normal")
            .sort(
                (a: Post, b: Post) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );
    }

    // 🚀 NUEVO: noticias/anuncios
    async getAllPosts() {
        return this.repo.findAll();
    }

    async getNewsFeed(userUniversity?: string) {
        const posts: Post[] = await this.repo.findAll();

        return posts
            .filter((p: Post) => p.type === "news" || p.type === "announcement")
            .sort((a: Post, b: Post) => {
                // 1. misma universidad primero
                if (a.university === userUniversity && b.university !== userUniversity) return -1;
                if (b.university === userUniversity && a.university !== userUniversity) return 1;

                // 2. anuncios primero
                if (a.type === "announcement" && b.type !== "announcement") return -1;
                if (b.type === "announcement" && a.type !== "announcement") return 1;

                // 3. más reciente
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }
}