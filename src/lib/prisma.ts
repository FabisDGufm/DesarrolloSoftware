import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST ?? "localhost",
  user: process.env.DATABASE_USER ?? "root",
  password: process.env.DATABASE_PASSWORD ?? "root",
  database: process.env.DATABASE_NAME ?? "social-media",
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

export { prisma };
