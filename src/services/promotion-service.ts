import { randomUUID } from "node:crypto";
import type { Promotion } from "../models/promotion.js";
import { PromotionRepository } from "../repositories/promotion-repository.js";
import { ValidationError, NotFoundError } from "../utils/custom-errors.js";

export class PromotionService {
    constructor(private repo: PromotionRepository) {}

    async createPromotion(
        userId: number,
        university: string,
        title: string,
        description: string,
        contact: string,
        price?: number,
        imageUrl?: string
    ) {
        if (!title || !description || !contact) {
            throw new ValidationError("Missing required fields");
        }

        const promotion: Promotion = {
            id: randomUUID(),
            userId,
            university,
            title,
            description,
            contact,
            createdAt: new Date().toISOString(),
            imageUrl: imageUrl ?? null
        };

        // ✅ FIX para exactOptionalPropertyTypes
        if (price !== undefined) {
            promotion.price = price;
        }

        return this.repo.create(promotion);
    }

    async getAllPromotions() {
        const promotions = await this.repo.getAll();

        return promotions.sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt)
        );
    }

    async getByUniversity(university: string) {
        return this.repo.getByUniversity(university);
    }

    async deletePromotion(id: string) {
        const deleted = await this.repo.delete(id);

        if (!deleted) throw new NotFoundError("Promotion not found");

        return { message: "Promotion deleted" };
    }
}