"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const handlers_1 = require("./handlers");
const StateAnalyzer_1 = require("./snake/StateAnalyzer");
const PathPrioritizer_1 = require("./snake/PathPrioritizer");
const SnakeLogger_1 = require("./util/SnakeLogger");
const app = express_1.default();
let filename;
// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set("port", (process.env.PORT || 9001));
app.enable("verbose errors");
app.use(body_parser_1.default.json());
// --- SNAKE LOGIC GOES BELOW THIS LINE ---
// Handle POST request to "/start"
app.post("/start", (request, response) => __awaiter(this, void 0, void 0, function* () {
    const snakeName = request.body.you.name;
    const gameID = request.body.game.id;
    SnakeLogger_1.SnakeLogger.init(snakeName, gameID);
    SnakeLogger_1.SnakeLogger.debug("Enter /start");
    // forward the initial request to the state analyzer upon start
    // All this part serves to do is choose our colour. If the program sees its on heroku (production)
    // It will choose our official colour. Else itll just do random for development so we can distinguish a bunch at once.
    filename = gameID + "_" + snakeName;
    StateAnalyzer_1.StateAnalyzer.update(request.body);
    let hexString;
    if (process.env.NODE_ENV == "production") {
        hexString = "11FF55";
    }
    else {
        // Random hex string
        const number = Math.floor(Math.random() * Math.floor(16000000));
        hexString = number.toString(16);
        if (hexString.length % 2) {
            hexString = "0" + hexString;
        }
    }
    // Response data
    const data = {
        color: "#" + hexString,
        headType: "fang",
        tailType: "hook"
    };
    return response.json(data);
}));
app.post("/move", (request, response) => {
    const moveStartTime = new Date().getTime();
    SnakeLogger_1.SnakeLogger.debug("Enter /move");
    // Everything is wrapped in a try/catch so our app doesnt crash if something goes wrong
    try {
        // update the Analyzer with the new moves, first thing, right away. Don't call this function anywhere else!
        StateAnalyzer_1.StateAnalyzer.update(request.body);
        const pathPrioritizer = new PathPrioritizer_1.PathPrioritizer();
        // Our move generation is currently made of 2 questions:
        // Where do we go? and
        // How do we get there?
        let path;
        let move;
        const turn = StateAnalyzer_1.StateAnalyzer.getTurnNumber();
        const myPosition = StateAnalyzer_1.StateAnalyzer.getMyPosition();
        const paths = pathPrioritizer.getPrioritizedPaths();
        for (let i = 0; i < paths.length; i++) {
            if (typeof paths[i] != "undefined") {
                path = paths[i];
                break;
            }
        }
        if (typeof path != "undefined") {
            move = StateAnalyzer_1.StateAnalyzer.getMove(path[0], path[1]);
        }
        else {
            move = StateAnalyzer_1.StateAnalyzer.safeMove();
        }
        // if (paths !== [] && typeof paths[0] != "undefined" && typeof paths[0][0] != "undefined") {
        //   // path = paths[0];
        //   // move = StateAnalyzer.getMove(path[0], path[1]);
        //   for (let i = 0; i < paths.length; i++) {
        //     path = paths[i];
        //     if (typeof path != "undefined") {
        //       move = StateAnalyzer.getMove(path[0], path[1]);
        //       break;
        //     }
        //   }
        // } else {
        //   move = StateAnalyzer.safeMove();
        // }
        const moveEndTime = new Date().getTime();
        SnakeLogger_1.SnakeLogger.info("turn: " + JSON.stringify(turn));
        SnakeLogger_1.SnakeLogger.info("current xy: " + JSON.stringify(myPosition));
        SnakeLogger_1.SnakeLogger.info("path projection: " + JSON.stringify(path));
        SnakeLogger_1.SnakeLogger.info("move: " + JSON.stringify(move) + " chosen in " + (moveEndTime - moveStartTime) + " milliseconds");
        // Response data
        return response.json({ move });
    }
    catch (e) {
        console.log(e);
    }
});
app.post("/end", (request, response) => {
    SnakeLogger_1.SnakeLogger.debug("Enter /end");
    // NOTE: Any cleanup when a game is complete.
    // So we can run multiple games without re-starting app.
    return response.json({});
});
app.post("/ping", (request, response) => {
    SnakeLogger_1.SnakeLogger.info("Enter /ping");
    // Used for checking if this snake is still alive.
    return response.json({});
});
// --- SNAKE LOGIC GOES ABOVE THIS LINE ---
app.use(handlers_1.poweredByHandler);
app.use("*", handlers_1.fallbackHandler);
app.use(handlers_1.notFoundHandler);
app.use(handlers_1.genericErrorHandler);
app.listen(app.get("port"), () => {
    console.log("Snake listening on port %s", app.get("port"));
    const logDir = path.join(__dirname, "../logs");
    console.log("Logs can be found at " + logDir);
});
//# sourceMappingURL=index.js.map