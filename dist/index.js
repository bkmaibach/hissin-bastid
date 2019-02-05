"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const handlers_1 = require("./handlers");
const StateAnalyzer_1 = require("./snake/StateAnalyzer");
const TailDodger_1 = require("./snake/TailDodger");
const TargetGenerator_1 = require("./snake/TargetGenerator");
const app = express_1.default();
// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set("port", (process.env.PORT || 9001));
app.enable("verbose errors");
app.use(body_parser_1.default.json());
// --- SNAKE LOGIC GOES BELOW THIS LINE ---
// Handle POST request to "/start"
app.post("/start", (request, response) => {
    // forward the initial request to the state analyzer upon start
    StateAnalyzer_1.StateAnalyzer.update(request.body);
    let hexString;
    if (process.env.NODE_ENV == "production") {
        hexString = "11FF11";
    }
    else {
        const number = Math.floor(Math.random() * Math.floor(16000000));
        hexString = number.toString(16);
        if (hexString.length % 2) {
            hexString = "0" + hexString;
        }
    }
    // Response data
    const data = {
        color: "#" + hexString,
    };
    return response.json(data);
});
let targetXY;
const targetGen = new TargetGenerator_1.TargetGenerator();
// Handle POST request to "/move"
app.post("/move", (request, response) => {
    try {
        // update the board with the new moves
        StateAnalyzer_1.StateAnalyzer.update(request.body);
        let path;
        let move;
        const turn = StateAnalyzer_1.StateAnalyzer.getTurn();
        const myPosition = StateAnalyzer_1.StateAnalyzer.getMyPosition();
        const targets = targetGen.getSortedTargets();
        const dodger = new TailDodger_1.TailDodger(myPosition);
        for (let i = 0; i < targets.length; i++) {
            targetXY = targets[i];
            path = dodger.getShortestPath(targetXY);
            if (typeof path != "undefined") {
                move = StateAnalyzer_1.StateAnalyzer.getMove(path[0], path[1]);
                break;
            }
        }
        if (typeof path == "undefined") {
            move = StateAnalyzer_1.StateAnalyzer.safeMove();
        }
        console.log("turn: " + JSON.stringify(turn));
        console.log("current xy: " + JSON.stringify(myPosition));
        console.log("target xy: " + JSON.stringify(targetXY));
        console.log("path projection: " + JSON.stringify(path));
        console.log("move: " + JSON.stringify(move));
        console.log("\n");
        // Response data
        return response.json({ move });
    }
    catch (e) {
        console.log(e);
    }
});
app.post("/end", (request, response) => {
    // NOTE: Any cleanup when a game is complete.
    return response.json({});
});
app.post("/ping", (request, response) => {
    // Used for checking if this snake is still alive.
    return response.json({});
});
// --- SNAKE LOGIC GOES ABOVE THIS LINE ---
app.use(handlers_1.poweredByHandler);
app.use("*", handlers_1.fallbackHandler);
app.use(handlers_1.notFoundHandler);
app.use(handlers_1.genericErrorHandler);
app.listen(app.get("port"), () => {
    console.log("Server listening on port %s", app.get("port"));
});
//# sourceMappingURL=index.js.map