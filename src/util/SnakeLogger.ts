import winston from "winston";
import { Logger } from "winston";
import { ENVIRONMENT } from "./secrets";
// import { createFile } from "../data/data";

let filename: string;

export class SnakeLogger {

    static logger: winston.LoggerInstance;
    private constructor() {

    }

    static init (snakeName: string, gameId: string) {
        try {
            filename = gameId + "_" + snakeName + ".log";
            // createFile("game", filename, "");

            this.logger = new (Logger)({
                transports: [
                    new (winston.transports.Console)({ level: process.env.NODE_ENV === "production" ? "error" : "debug" }),
                    new (winston.transports.File)({ filename: "logs/game/" + filename, level: "debug"})
                ]});

            if (process.env.NODE_ENV !== "production") {
                this.logger.debug("Logging initialized at debug level");
            }

        } catch {
            console.log("Could not create log file");
        }
    }

    static emerg(message: string) {
        this.logger.emerg(message);
    }

    static alert(message: string) {
        this.logger.alert(message);
    }

    static crit(message: string) {
        this.logger.crit(message);
    }

    static error(message: string) {
        this.logger.error(message);
    }

    static warning(message: string) {
        this.logger.warning(message);
    }

    static notice(message: string) {
        this.logger.info(message);
    }

    static info(message: string) {
        this.logger.info(message);
    }

    static debug(message: string) {
        this.logger.debug(message);
    }
}




