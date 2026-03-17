import dotenv from "dotenv";
dotenv.config();

interface Config {
  port: number;
  dbHost: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  dbHost: process.env.DATABASE_HOST || "localhost",
  dbUser: process.env.DATABASE_USER || "root",
  dbPassword: process.env.DATABASE_PASSWORD || "root",
  dbName: process.env.DATABASE_NAME || "mydb"
};

export default config;