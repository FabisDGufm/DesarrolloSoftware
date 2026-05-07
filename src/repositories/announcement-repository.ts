import { dynamo } from "../config/dynamodb.js";
import {
    PutCommand,
    QueryCommand,
    GetCommand
} from "@aws-sdk/lib-dynamodb";

import type { Announcement } from "../models/announcement.js";

const TABLE = "Announcements";

export class AnnouncementRepository {

    async create(announcement: Announcement): Promise<Announcement> {
        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: announcement
            })
        );

        return announcement;
    }

    async findByUniversity(university: string): Promise<Announcement[]> {
        const r = await dynamo.send(
            new QueryCommand({
                TableName: TABLE,
                KeyConditionExpression: "university = :u",
                ExpressionAttributeValues: {
                    ":u": university
                }
            })
        );

        return (r.Items ?? []) as Announcement[];
    }

    async findById(university: string, announcementId: string) {
        const r = await dynamo.send(
            new GetCommand({
                TableName: TABLE,
                Key: {
                    university,
                    announcementId
                }
            })
        );

        return r.Item as Announcement | undefined;
    }
}