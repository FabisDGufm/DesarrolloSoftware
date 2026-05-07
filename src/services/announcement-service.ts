import { randomUUID } from "node:crypto";
import type { Announcement } from "../models/announcement.js";
import { AnnouncementRepository } from "../repositories/announcement-repository.js";
import { ValidationError, NotFoundError } from "../utils/custom-errors.js";

export class AnnouncementService {
    constructor(private repo: AnnouncementRepository) {}

    async createAnnouncement(
        userId: number,
        university: string,
        data: {
            title: string;
            text: string;
            imageUrl?: string;
            eventDate?: string;
        }
    ) {
        if (!university) {
            throw new ValidationError("University required");
        }

        if (!data.title || !data.text) {
            throw new ValidationError("title and text are required");
        }

        const announcement: Announcement = {
            university,
            announcementId: randomUUID(),
            title: data.title,
            text: data.text,
            imageUrl: data.imageUrl ?? null,
            createdAt: new Date().toISOString(),
            createdBy: userId,
            ...(data.eventDate ? { eventDate: data.eventDate } : {})
        };

        return this.repo.create(announcement);
    }

    async getAnnouncements(university: string) {
        const items = await this.repo.findByUniversity(university);

        return items.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
    }

    async getAnnouncement(university: string, id: string) {
        const ann = await this.repo.findById(university, id);

        if (!ann) {
            throw new NotFoundError("Announcement not found");
        }

        return ann;
    }
}