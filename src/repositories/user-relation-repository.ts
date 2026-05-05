import {
    PutCommand,
    GetCommand,
    QueryCommand,
    UpdateCommand,
    DeleteCommand,
    ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../config/dynamodb.js";
import type { FriendRelation, FriendRequestStatus } from "../models/user-relation.js";

const TABLE = "UserRelationships";

export class UserRelationRepository {

    async create(requesterId: number, receiverId: number): Promise<FriendRelation> {
        const id = Date.now();
        const createdAt = new Date();
        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: {
                    PK: `USER#${requesterId}`,
                    SK: `FRIEND#${receiverId}`,
                    GSI1PK: `USER#${receiverId}`,
                    GSI1SK: `REQUESTER#${requesterId}`,
                    id,
                    requesterId,
                    receiverId,
                    status: "pending",
                    createdAt: createdAt.toISOString(),
                },
                ConditionExpression: "attribute_not_exists(PK)",
            })
        );
        return { id, requesterId, receiverId, status: "pending", createdAt };
    }

    async findById(requestId: number): Promise<FriendRelation | null> {
        const result = await dynamo.send(
            new ScanCommand({
                TableName: TABLE,
                FilterExpression: "id = :id",
                ExpressionAttributeValues: { ":id": requestId },
            })
        );
        const item = result.Items?.[0];
        if (!item) return null;
        return this.mapItem(item);
    }

    async findExistingRelation(requesterId: number, receiverId: number): Promise<FriendRelation | null> {
        const result = await dynamo.send(
            new GetCommand({
                TableName: TABLE,
                Key: {
                    PK: `USER#${requesterId}`,
                    SK: `FRIEND#${receiverId}`,
                },
            })
        );
        if (!result.Item) return null;
        return this.mapItem(result.Item);
    }

    async updateStatus(requestId: number, status: FriendRequestStatus): Promise<FriendRelation | null> {
        const relation = await this.findById(requestId);
        if (!relation) return null;
        await dynamo.send(
            new UpdateCommand({
                TableName: TABLE,
                Key: {
                    PK: `USER#${relation.requesterId}`,
                    SK: `FRIEND#${relation.receiverId}`,
                },
                UpdateExpression: "SET #s = :status",
                ExpressionAttributeNames: { "#s": "status" },
                ExpressionAttributeValues: { ":status": status },
            })
        );
        return { ...relation, status };
    }

    async findByReceiver(receiverId: number, status?: FriendRequestStatus): Promise<FriendRelation[]> {
        const result = await dynamo.send(
            new QueryCommand({
                TableName: TABLE,
                IndexName: "InverseIndex",
                KeyConditionExpression: "GSI1PK = :pk AND begins_with(GSI1SK, :prefix)",
                FilterExpression: status ? "#s = :status" : undefined,
                ExpressionAttributeValues: {
                    ":pk": `USER#${receiverId}`,
                    ":prefix": "REQUESTER#",
                    ...(status ? { ":status": status } : {}),
                },
                ...(status ? { ExpressionAttributeNames: { "#s": "status" } } : {}),
            })
        );
        return (result.Items ?? []).map(this.mapItem);
    }

    async findByRequester(requesterId: number, status?: FriendRequestStatus): Promise<FriendRelation[]> {
        const result = await dynamo.send(
            new QueryCommand({
                TableName: TABLE,
                KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
                FilterExpression: status ? "#s = :status" : undefined,
                ExpressionAttributeValues: {
                    ":pk": `USER#${requesterId}`,
                    ":prefix": "FRIEND#",
                    ...(status ? { ":status": status } : {}),
                },
                ...(status ? { ExpressionAttributeNames: { "#s": "status" } } : {}),
            })
        );
        return (result.Items ?? []).map(this.mapItem);
    }

    async findAcceptedByUser(userId: number): Promise<FriendRelation[]> {
        const asSender = await this.findByRequester(userId, "accepted");
        const asReceiver = await this.findByReceiver(userId, "accepted");
        return [...asSender, ...asReceiver];
    }

    async deleteAllForUser(userId: number): Promise<void> {
        const sent = await this.findByRequester(userId);
        const received = await this.findByReceiver(userId);
        const deleteOps = [
            ...sent.map((r) => dynamo.send(new DeleteCommand({
                TableName: TABLE,
                Key: { PK: `USER#${r.requesterId}`, SK: `FRIEND#${r.receiverId}` },
            }))),
            ...received.map((r) => dynamo.send(new DeleteCommand({
                TableName: TABLE,
                Key: { PK: `USER#${r.requesterId}`, SK: `FRIEND#${r.receiverId}` },
            }))),
        ];
        await Promise.all(deleteOps);
    }

    private mapItem(item: Record<string, any>): FriendRelation {
        return {
            id: item.id,
            requesterId: item.requesterId,
            receiverId: item.receiverId,
            status: item.status as FriendRequestStatus,
            createdAt: new Date(item.createdAt),
        };
    }
}
