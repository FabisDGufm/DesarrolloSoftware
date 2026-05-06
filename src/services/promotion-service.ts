import { randomUUID } from "node:crypto";

import {
    S3Client,
    PutObjectCommand
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type { Promotion } from "../models/promotion.js";

import { PromotionRepository } from "../repositories/promotion-repository.js";

import {
    ValidationError,
    NotFoundError
} from "../utils/custom-errors.js";

export class PromotionService {

    private repo: PromotionRepository;

    private s3 = new S3Client({
        region: process.env.AWS_REGION as string
    });

    constructor(repo: PromotionRepository) {
        this.repo = repo;
    }

    async getUploadUrl(fileName: string) {

        if (!fileName) {
            throw new ValidationError("fileName required");
        }

        const bucket = process.env.AWS_BUCKET_NAME as string;

        const key = `promotions/${Date.now()}-${randomUUID()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: "image/jpeg"
        });

        const url = await getSignedUrl(
            this.s3,
            command,
            {
                expiresIn: 300
            }
        );

        return {
            url,
            key
        };
    }

    async createPromotion(
        userId: number,
        title: string,
        description: string,
        contact: string,
        university?: string,
        price?: number,
        imageUrl?: string
    ) {

        if (!title?.trim()) {
            throw new ValidationError("Title required");
        }

        if (!description?.trim()) {
            throw new ValidationError("Description required");
        }

        if (!contact?.trim()) {
            throw new ValidationError("Contact required");
        }

        const promotion: Promotion = {
            promotionId: randomUUID(),
            userId,

            title,
            description,

            contact,

            price: price ?? null,

            imageUrl: imageUrl ?? null,

            university: university ?? null,

            createdAt: new Date().toISOString()
        };

        return this.repo.create(promotion);
    }

    async getPromotion(
        userId: number,
        promotionId: string
    ) {

        const promotion = await this.repo.findById(
            userId,
            promotionId
        );

        if (!promotion) {
            throw new NotFoundError("Promotion not found");
        }

        return promotion;
    }

    async getPromotionsByUser(userId: number) {

        const promotions = await this.repo.findByUser(userId);

        return promotions.sort((a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
    }

    async getFeed(userUniversity?: string) {

        const promotions = await this.repo.findAll();

        return promotions.sort((a, b) => {

            if (
                a.university === userUniversity &&
                b.university !== userUniversity
            ) {
                return -1;
            }

            if (
                b.university === userUniversity &&
                a.university !== userUniversity
            ) {
                return 1;
            }

            return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
        });
    }

    async deletePromotion(
        userId: number,
        promotionId: string
    ) {

        const deleted = await this.repo.delete(
            userId,
            promotionId
        );

        if (!deleted) {
            throw new NotFoundError("Promotion not found");
        }

        return {
            message: "Promotion deleted"
        };
    }
}