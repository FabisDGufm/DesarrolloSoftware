import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
//  Tabla 1: Feed
//  PK = USER#<authorId>    SK = TS#<timestamp>#<id>
// ─────────────────────────────────────────────────────────────────────────────
const feedTable = {
  TableName: "Feed",
  BillingMode: "PAY_PER_REQUEST" as const,
  KeySchema: [
    { AttributeName: "PK", KeyType: "HASH" as const },
    { AttributeName: "SK", KeyType: "RANGE" as const },
  ],
  AttributeDefinitions: [
    { AttributeName: "PK", AttributeType: "S" as const },
    { AttributeName: "SK", AttributeType: "S" as const },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
//  Tabla 2: UserRelationships
//  PK = USER#<requesterId>    SK = FRIEND#<receiverId>
//  GSI InverseIndex: GSI1PK = USER#<receiverId>  GSI1SK = REQUESTER#<requesterId>
// ─────────────────────────────────────────────────────────────────────────────
const relationshipsTable = {
  TableName: "UserRelationships",
  BillingMode: "PAY_PER_REQUEST" as const,
  KeySchema: [
    { AttributeName: "PK", KeyType: "HASH" as const },
    { AttributeName: "SK", KeyType: "RANGE" as const },
  ],
  AttributeDefinitions: [
    { AttributeName: "PK", AttributeType: "S" as const },
    { AttributeName: "SK", AttributeType: "S" as const },
    { AttributeName: "GSI1PK", AttributeType: "S" as const },
    { AttributeName: "GSI1SK", AttributeType: "S" as const },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "InverseIndex",
      KeySchema: [
        { AttributeName: "GSI1PK", KeyType: "HASH" as const },
        { AttributeName: "GSI1SK", KeyType: "RANGE" as const },
      ],
      Projection: { ProjectionType: "ALL" as const },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
//  Tabla 3: Explore
//  PK = TYPE#<type>    SK = ID#<id>
// ─────────────────────────────────────────────────────────────────────────────
const exploreTable = {
  TableName: "Explore",
  BillingMode: "PAY_PER_REQUEST" as const,
  KeySchema: [
    { AttributeName: "PK", KeyType: "HASH" as const },
    { AttributeName: "SK", KeyType: "RANGE" as const },
  ],
  AttributeDefinitions: [
    { AttributeName: "PK", AttributeType: "S" as const },
    { AttributeName: "SK", AttributeType: "S" as const },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
//  Tabla 4: PostInteractions  →  likes, comments, shares, saves, reposts
//
//  LIKE:    PK = POST#<postId>   SK = LIKE#<userId>
//  COMMENT: PK = POST#<postId>   SK = COMMENT#<timestamp>#<commentId>
//  SHARE:   PK = POST#<postId>   SK = SHARE#<userId>#<timestamp>
//  SAVE:    PK = POST#<...>       SK = SAVE#<userId>   (guardar / bookmark)
//  REPOST:  PK = POST#<...>       SK = REPOST#<userId>#<timestamp>
//
//  GSI ByUser: GSI1PK = USER#<userId>   GSI1SK = LIKE#<postId>
//  → "qué posts le dieron like / comentaron / compartieron"
// ─────────────────────────────────────────────────────────────────────────────
const postInteractionsTable = {
  TableName: "PostInteractions",
  BillingMode: "PAY_PER_REQUEST" as const,
  KeySchema: [
    { AttributeName: "PK", KeyType: "HASH" as const },
    { AttributeName: "SK", KeyType: "RANGE" as const },
  ],
  AttributeDefinitions: [
    { AttributeName: "PK", AttributeType: "S" as const },
    { AttributeName: "SK", AttributeType: "S" as const },
    { AttributeName: "GSI1PK", AttributeType: "S" as const },
    { AttributeName: "GSI1SK", AttributeType: "S" as const },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "ByUser",
      KeySchema: [
        { AttributeName: "GSI1PK", KeyType: "HASH" as const },
        { AttributeName: "GSI1SK", KeyType: "RANGE" as const },
      ],
      Projection: { ProjectionType: "ALL" as const },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
//  Tabla 5: Messages  →  mensajes directos entre usuarios
//
//  PK = CONV#<userA>#<userB>   SK = TS#<timestamp>#<messageId>
//  (userA < userB siempre para que la conversación sea única)
//
//  GSI ByUser: GSI1PK = USER#<senderId>   GSI1SK = TS#<timestamp>
//  → todas las conversaciones de un usuario ordenadas por fecha
// ─────────────────────────────────────────────────────────────────────────────
const messagesTable = {
  TableName: "Messages",
  BillingMode: "PAY_PER_REQUEST" as const,
  KeySchema: [
    { AttributeName: "PK", KeyType: "HASH" as const },
    { AttributeName: "SK", KeyType: "RANGE" as const },
  ],
  AttributeDefinitions: [
    { AttributeName: "PK", AttributeType: "S" as const },
    { AttributeName: "SK", AttributeType: "S" as const },
    { AttributeName: "GSI1PK", AttributeType: "S" as const },
    { AttributeName: "GSI1SK", AttributeType: "S" as const },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "ByUser",
      KeySchema: [
        { AttributeName: "GSI1PK", KeyType: "HASH" as const },
        { AttributeName: "GSI1SK", KeyType: "RANGE" as const },
      ],
      Projection: { ProjectionType: "ALL" as const },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
//  Helper
// ─────────────────────────────────────────────────────────────────────────────
async function createIfNotExists(tableDefinition: any) {
  const name = tableDefinition.TableName;
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    console.log(`✓ "${name}" ya existe — omitiendo`);
  } catch (err: any) {
    if (err.name === "ResourceNotFoundException") {
      console.log(`⟳ Creando tabla "${name}"...`);
      await client.send(new CreateTableCommand(tableDefinition));
      console.log(`✓ "${name}" creada`);
    } else {
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Exportable → se llama desde app.ts al arrancar
// ─────────────────────────────────────────────────────────────────────────────
export async function createDynamoTables() {
  console.log("\n🔧 Inicializando tablas DynamoDB...");
  await createIfNotExists(feedTable);
  await createIfNotExists(relationshipsTable);
  await createIfNotExists(exploreTable);
  await createIfNotExists(postInteractionsTable);
  await createIfNotExists(messagesTable);
  console.log("✅ DynamoDB listo\n");
}

// Correr como script:  npx tsx src/database/createTables.ts
if (process.argv[1]?.includes("createTables")) {
  createDynamoTables().catch(console.error);
}