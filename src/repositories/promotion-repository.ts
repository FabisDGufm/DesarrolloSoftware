import { dynamo } from "../config/dynamodb.js";
import {
    PutCommand,
    QueryCommand,
    DeleteCommand,
    ScanCommand
} from "@aws-sdk/lib-dynamodb";
import type { Promotion } from "../models/promotion.js";

const TABLE = "Promotions";

export class PromotionRepository {

    async create(promotion: Promotion) {
        await dynamo.send(new PutCommand({
            TableName: TABLE,
            Item: promotion
        }));

        return promotion;
    }

    async getByUniversity(university: string) {
        const r = await dynamo.send(new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: "university = :u",
            ExpressionAttributeValues: {
                ":u": university
            }
        }));

        return (r.Items ?? []) as Promotion[];
    }

    async getAll() {
        const r = await dynamo.send(new ScanCommand({
            TableName: TABLE
        }));

        return (r.Items ?? []) as Promotion[];
    }

    async delete(id: string) {
        const r = await dynamo.send(new DeleteCommand({
            TableName: TABLE,
            Key: { id },
            ReturnValues: "ALL_OLD"
        }));

        return r.Attributes;
    }
}