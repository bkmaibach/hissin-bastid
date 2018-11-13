"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tshelpers_1 = require("./tshelpers");
/*
* Create and export configuration variables
*
*/
// Container for all of the environments
const environments = {
    staging: {
        "envName": "staging",
        "hashingSecret": process.env.HASHING_SECRET,
        "prefix": "~",
        "discord": {
            "clientSecret": process.env.DISCORD_CLIENT_SECRET,
            "botToken": process.env.BOT_TOKEN
        }
    },
    production: {
        "envName": "production",
        "hashingSecret": process.env.HASHING_SECRET,
        "prefix": "~",
        "discord": {
            "clientSecret": process.env.DISCORD_CLIENT_SECRET,
            "botToken": process.env.BOT_TOKEN
        }
    }
};
// Determine which environment was passed as a command-line arg
const selectedEnv = typeof (process.env.NODE_ENV) == "string" ? process.env.NODE_ENV.toLowerCase() : "staging";
// Check that the currentEnv is valid and export
exports.envToExport = tshelpers_1.hasKey(environments, selectedEnv) ? environments[selectedEnv] : environments.staging;
//# sourceMappingURL=config.js.map