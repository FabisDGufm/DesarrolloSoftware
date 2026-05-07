import { randomUUID } from "node:crypto";
import type { AnnouncementRepository } from "../repositories/announcement-repository.js";
import type { Announcement } from "../models/announcement.js";

export class AnnouncementService {
    constructor(private readonly repo: AnnouncementRepository) {}

    async createAnnouncement(
        authorId: number,
        text: string,
        imageUrl?: string,
        university?: string
    ) {
        const announcement: Announcement = {
            authorId,
            announcementId: randomUUID(),
            text,
            imageUrl: imageUrl ?? null,
            createdAt: new Date().toISOString(),
            university: university ?? null
        };

        return this.repo.create(announcement);
    }

    async getAnnouncements(userUniversity?: string) {
        const all = await this.repo.findAll();

        return all
            .filter(a =>
                !a.university || a.university === userUniversity
            )
            .sort((a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
    }
}