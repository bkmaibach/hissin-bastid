import * as appRoot from "app-root-path";
import * as winston from "winston";

const options = {

    file: {
        level: "info",
        filename: `${__dirname}/logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },

    console: {
        level: "debug",
        handleExceptions: true,
        json: false,
        colorize: true,
    }

};

export const logger = new winston.Logger({

    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
    stream: {
        write: function(message: string, encoding: string) { logger.info(message); }
    }
});
