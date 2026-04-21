import { dynamo } from "../config/dynamodb.js";
import { PutCommand, GetCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { Post } from "../models/post.js";

const TABLE = "Posts";

export class PostRepository {

    async create(post: Post) {
        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: post
            })
        );

        return post;
    }

    async findById(authorId: number, postId: string) {
        const r = await dynamo.send(
            new GetCommand({
                TableName: TABLE,
                Key: { authorId, postId }
            })
        );

        return r.Item as Post | undefined;
    }

    async delete(authorId: number, postId: string) {
        const r = await dynamo.send(
            new DeleteCommand({
                TableName: TABLE,
                Key: { authorId, postId },
                ReturnValues: "ALL_OLD"
            })
        );

        return r.Attributes;
    }

    async findByAuthor(authorId: number) {
        const r = await dynamo.send(
            new QueryCommand({
                TableName: TABLE,
                KeyConditionExpression: "authorId = :a",
                ExpressionAttributeValues: {
                    ":a": authorId
                }
            })
        );

        return r.Items ?? [];
    }
}