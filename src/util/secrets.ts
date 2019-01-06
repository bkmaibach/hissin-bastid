import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
    logger.debug("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
} else {
    logger.debug(".env file missing");
}
export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'
export const SESSION_SECRET = process.env["SESSION_SECRET"];
export const MONGODB_URI = prod ? process.env["MONGODB_URI"] : process.env["MONGODB_URI_LOCAL"];
export const  DISCORD_BOT_TOKEN = process.env["DISCORD_BOT_TOKEN"];
export const  DISCORD_BOT_TOKEN_DEV = process.env["DISCORD_BOT_TOKEN_DEV"];
export const TWILIO_FROM_PHONE = process.env["TWILIO_FROM_PHONE"];
export const TWILIO_ACCOUNT_SID = process.env["TWILIO_ACCOUNT_SID"];
export const TWILIO_AUTH_TOKEN = process.env["TWILIO_AUTH_TOKEN"];
export const MAILGUN_API_KEY = process.env["MAILGUN_API_KEY"];
export const MAILGUN_DOMAIN = process.env["MAILGUN_DOMAIN"];
export const TEST_DISCORD_ID = process.env["TEST_DISCORD_ID"];
export const TEST_PHONE = process.env["TEST_PHONE"];

export const BOTWRANGLER_ID = process.env["BOTWRANGLER_ID"];


if (!SESSION_SECRET) {
    logger.error("No client secret. Set SESSION_SECRET environment variable.");
    process.exit(1);
}

if (!MONGODB_URI) {
    logger.error("No mongo connection string. Set MONGODB_URI environment variable.");
    process.exit(1);
}

if (!DISCORD_BOT_TOKEN) {
    logger.error("No Discord bot token string. Set DISCORD_BOT_TOKEN environment variable.");
    process.exit(1);
}

if (!DISCORD_BOT_TOKEN_DEV) {
    logger.error("No DEV Discord bot token string. Set DISCORD_BOT_TOKEN_DEV environment variable.");
    process.exit(1);
}

if (!TWILIO_FROM_PHONE) {
    logger.error("No Discord bot token string. Set TWILIO_FROM_PHONE environment variable.");
    process.exit(1);
}

if (!TWILIO_ACCOUNT_SID) {
    logger.error("No Discord bot token string. Set TWILIO_ACCOUNT_SID environment variable.");
    process.exit(1);
}

if (!TWILIO_AUTH_TOKEN) {
    logger.error("No Discord bot token string. Set TWILIO_AUTH_TOKEN environment variable.");
    process.exit(1);
}

if (!MAILGUN_API_KEY) {
    logger.error("No Mailgun API Key string. Set MAILGUN_API_KEY environment variable.");
    process.exit(1);
}

if (!MAILGUN_DOMAIN) {
    logger.error("No Mailgun domain string. Set MAILGUN_DOMAIN environment variable.");
    process.exit(1);
}

if (!TEST_DISCORD_ID) {
    logger.error("No test Discord ID string. Set TEST_DISCORD_ID environment variable.");
    process.exit(1);
}

if (!TEST_PHONE) {
    logger.error("No test phone string. Set TEST_PHONE environment variable.");
    process.exit(1);
}

if (!BOTWRANGLER_ID) {
    logger.error("No developer discord id. Set BOTWRANGLER_ID environment variable.");
    process.exit(1);
}