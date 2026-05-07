import { dynamo } from "../config/dynamodb.js";

import {
    PutCommand,
    GetCommand,
    DeleteCommand,
    QueryCommand,
    ScanCommand
} from "@aws-sdk/lib-dynamodb";

import type { Promotion } from "../models/promotion.js";

const TABLE = "Promotions";

export class PromotionRepository {

    async create(promotion: Promotion): Promise<Promotion> {
        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: promotion
            })
        );

        return promotion;
    }

    async findById(
        userId: number,
        promotionId: string
    ): Promise<Promotion | undefined> {

        const r = await dynamo.send(
            new GetCommand({
                TableName: TABLE,
                Key: {
                    userId,
                    promotionId
                }
            })
        );

        return r.Item as Promotion | undefined;
    }

    async findByUser(userId: number): Promise<Promotion[]> {

        const r = await dynamo.send(
            new QueryCommand({
                TableName: TABLE,
                KeyConditionExpression: "userId = :u",
                ExpressionAttributeValues: {
                    ":u": userId
                }
            })
        );

        return (r.Items ?? []) as Promotion[];
    }

    async findAll(): Promise<Promotion[]> {

        const r = await dynamo.send(
            new ScanCommand({
                TableName: TABLE
            })
        );

        return (r.Items ?? []) as Promotion[];
    }

    async delete(userId: number, promotionId: string) {

        const r = await dynamo.send(
            new DeleteCommand({
                TableName: TABLE,
                Key: {
                    userId,
                    promotionId
                },
                ReturnValues: "ALL_OLD"
            })
        );

        return r.Attributes;
    }
}