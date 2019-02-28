"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_2 = require("winston");
const StateAnalyzer_1 = require("../snake/StateAnalyzer");
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
    static alert(message) {
        if (process.env.NODE_ENV !== "production") {
            this.logger.alert(message);
        }
    }
    static info(message) {
        if (process.env.NODE_ENV !== "production") {
            this.logger.info("TURN: " + StateAnalyzer_1.StateAnalyzer.getTurnNumber() + " - " + message);
        }
    }
    static debug(message) {
        if (process.env.NODE_ENV !== "production") {
            this.logger.debug(message);
        }
    }
}
exports.SnakeLogger = SnakeLogger;
//# sourceMappingURL=SnakeLogger.js.map