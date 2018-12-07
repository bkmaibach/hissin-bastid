"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
if (fs_1.default.existsSync(".env")) {
    logger_1.default.debug("Using .env file to supply config environment variables");
    dotenv_1.default.config({ path: ".env" });
}
else {
    logger_1.default.debug(".env file missing");
}
exports.ENVIRONMENT = process.env.NODE_ENV;
const prod = exports.ENVIRONMENT === "production"; // Anything else is treated as 'dev'
exports.SESSION_SECRET = process.env["SESSION_SECRET"];
exports.MONGODB_URI = prod ? process.env["MONGODB_URI"] : process.env["MONGODB_URI_LOCAL"];
exports.DISCORD_BOT_TOKEN = process.env["DISCORD_BOT_TOKEN"];
exports.TWILIO_FROM_PHONE = process.env["TWILIO_FROM_PHONE"];
exports.TWILIO_ACCOUNT_SID = process.env["TWILIO_ACCOUNT_SID"];
exports.TWILIO_AUTH_TOKEN = process.env["TWILIO_AUTH_TOKEN"];
exports.MAILGUN_API_KEY = process.env["MAILGUN_API_KEY"];
exports.MAILGUN_DOMAIN = process.env["MAILGUN_DOMAIN"];
if (!exports.SESSION_SECRET) {
    logger_1.default.error("No client secret. Set SESSION_SECRET environment variable.");
    process.exit(1);
}
if (!exports.MONGODB_URI) {
    logger_1.default.error("No mongo connection string. Set MONGODB_URI environment variable.");
    process.exit(1);
}
if (!exports.DISCORD_BOT_TOKEN) {
    logger_1.default.error("No Discord bot token string. Set DISCORD_BOT_TOKEN environment variable.");
    process.exit(1);
}
if (!exports.TWILIO_FROM_PHONE) {
    logger_1.default.error("No Discord bot token string. Set TWILIO_FROM_PHONE environment variable.");
    process.exit(1);
}
if (!exports.TWILIO_ACCOUNT_SID) {
    logger_1.default.error("No Discord bot token string. Set TWILIO_ACCOUNT_SID environment variable.");
    process.exit(1);
}
if (!exports.TWILIO_AUTH_TOKEN) {
    logger_1.default.error("No Discord bot token string. Set TWILIO_AUTH_TOKEN environment variable.");
    process.exit(1);
}
if (!exports.MAILGUN_API_KEY) {
    logger_1.default.error("No Mailgun API Key string. Set MAILGUN_API_KEY environment variable.");
    process.exit(1);
}
if (!exports.MAILGUN_DOMAIN) {
    logger_1.default.error("No Mailgun domain string. Set MAILGUN_DOMAIN environment variable.");
    process.exit(1);
}
//# sourceMappingURL=secrets.js.map