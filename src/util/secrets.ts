import { SnakeLogger } from "./SnakeLogger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
    SnakeLogger.debug("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
} else {
    SnakeLogger.debug(".env file missing");
}
export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'
export const MONGODB_URI = prod ? process.env["MONGODB_URI"] : process.env["MONGODB_URI_LOCAL"];

if (!MONGODB_URI) {
    SnakeLogger.error("No mongo connection string. Set MONGODB_URI environment variable.");
    process.exit(1);
}