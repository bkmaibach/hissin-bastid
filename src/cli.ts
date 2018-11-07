/*
    CLI related tasks
*/

// Dependencies
// let readline = require("readline");
// let util = require("util");
// let debug = util.debuglog("cli");
// let events = require("events");
// class _events extends events{};
// let e = new _events();

import readline from "readline";
import util from "util";
const debug = util.debuglog("cli");
import events from "events";
class CliEvents extends events {}
const e = new CliEvents();

const cli: { init: () => void, processInput: (str: string) => void } = {
    init: function () {
        // Send a start message to the console in dark blue!
        console.log("\x1b[34m%s\x1b[0m", "The CLI is running");

        // Start the interface
        const _interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: ">"
        });

        // Create an intial prompt
        _interface.prompt();

        _interface.on("line", (str) => {
            cli.processInput(str);
            _interface.prompt();
        });

        _interface.on("close", () => {
            process.exit(0);
        });
    },
    processInput: function (str) {

        // Codify the unique strings that the user may utter
        const uniqueInputs = [
            "man",
            "help",
            "exit",
            "stats",
            "list users",
            "more user info",
            "list checks",
            "more check info",
            "list logs",
            "more log info"
        ];

        // Go through the possible inputs and emit any corresponding input event
        let matchFound = uniqueInputs.some((input) => {
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true;
                // Emit an event matching input and include the full string given:
                e.emit(input, str);
                return true;
            }
        });
        if (!matchFound) {
            console.log("Command not recognized");
        }
    }
};
