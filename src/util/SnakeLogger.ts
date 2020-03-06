import winston from "winston";
import { Logger } from "winston";
import { StateAnalyzer } from "../snake/StateAnalyzer";

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

    static alert(message: string) {
        if (process.env.NODE_ENV !== "production") {
            this.logger.alert( message );
        }
    }

    static info(message: string) {
        if (process.env.NODE_ENV !== "production") {
            this.logger.info("TURN: " + StateAnalyzer.getTurnNumber() + " - " + message );
        }
    }

    static debug(message: string) {
        if (process.env.NODE_ENV !== "production") {

            this.logger.debug( message );
        }
    }

    static error(message: string) {
        if (process.env.NODE_ENV !== "production") {

            this.logger.error( message );
        }
    }
}




