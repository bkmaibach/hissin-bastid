"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_2 = require("winston");
// import { createFile } from "../data/data";
let filename;
class SnakeLogger {
    constructor() {
    }
    static init(snakeName, gameId) {
        try {
            filename = gameId + "_" + snakeName + ".log";
            // createFile("game", filename, "");
            this.logger = new (winston_2.Logger)({
                transports: [
                    new (winston_1.default.transports.Console)({ level: process.env.NODE_ENV === "production" ? "error" : "debug" }),
                    new (winston_1.default.transports.File)({ filename: "logs/game/" + filename, level: "debug" })
                ]
            });
            if (process.env.NODE_ENV !== "production") {
                this.logger.debug("Logging initialized at debug level");
            }
        }
        catch (_a) {
            console.log("Could not create log file");
        }
    }
    static emerg(message) {
        this.logger.emerg(message);
    }
    static alert(message) {
        this.logger.alert(message);
    }
    static crit(message) {
        this.logger.crit(message);
    }
    static error(message) {
        this.logger.error(message);
    }
    static warning(message) {
        this.logger.warning(message);
    }
    static notice(message) {
        this.logger.info(message);
    }
    static info(message) {
        this.logger.info(message);
    }
    static debug(message) {
        this.logger.debug(message);
    }
}
exports.SnakeLogger = SnakeLogger;
//# sourceMappingURL=SnakeLogger.js.map