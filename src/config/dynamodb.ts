import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const endpoint = process.env.AWS_ENDPOINT_URL;
const useLocalStack = Boolean(endpoint);

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  ...(endpoint ? { endpoint } : {}),
  credentials: useLocalStack
    ? { accessKeyId: "test", secretAccessKey: "test" }
    : {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
});

export const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});