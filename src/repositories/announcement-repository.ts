import { dynamo } from "../config/dynamodb.js";
import { PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { Announcement } from "../models/announcement.js";

const TABLE = "Announcements";

export class AnnouncementRepository {

    async create(announcement: Announcement) {
        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: announcement
            })
        );

        return announcement;
    }

    async findAll(): Promise<Announcement[]> {
        const res = await dynamo.send(
            new ScanCommand({
                TableName: TABLE
            })
        );

        return (res.Items ?? []) as Announcement[];
    }

    async findByUniversity(university?: string) {
        const all = await this.findAll();

        if (!university) return all;

        return all.filter(a => a.university === university);
    }
}