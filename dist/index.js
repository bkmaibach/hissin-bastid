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
const MoveGenerator_1 = require("./snake/MoveGenerator");
const app = express_1.default();
let filename;
// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set("port", (process.env.PORT || 9001));
app.enable("verbose errors");
app.use(body_parser_1.default.json());
// --- SNAKE LOGIC GOES BELOW THIS LINE ---
app.get('/', (request, response) => {
    var battlesnakeInfo = {
        apiversion: '1',
        author: 'bkmaibach',
        color: "#11FF55",
        headType: "fang",
        tailType: "hook"
    };
    response.status(200).json(battlesnakeInfo);
});
// Handle POST request to "/start"
app.post("/start", (request, response) => __awaiter(this, void 0, void 0, function* () {
    const snakeName = request.body.you.name;
    const gameID = request.body.game.id;
    ////  SnakeLogger.init(snakeName, gameID);
    // SnakeLogger.debug("Enter /start");
    // forward the initial request to the state analyzer upon start
    // All this part serves to do is choose our colour. If the program sees its on heroku (production)
    // It will choose our official colour. Else itll just do random for development so we can distinguish a bunch at once.
    filename = gameID + "_" + snakeName;
    StateAnalyzer_1.StateAnalyzer.update(request.body);
    response.status(200).send('ok');
}));
app.post("/move", (request, response) => __awaiter(this, void 0, void 0, function* () {
    console.log('Move requested');
    const moveStartTime = new Date().getTime();
    // Everything is wrapped in a try/catch so our app doesn't crash if something goes wrong
    try {
        // update the Analyzer with the new moves, first thing, right away. Don't call this function anywhere else!
        StateAnalyzer_1.StateAnalyzer.update(request.body);
        ////    SnakeLogger.debug("Enter /move");
        const moveGen = new MoveGenerator_1.MoveGenerator();
        moveGen.commencePathScoring();
        yield sleep(200);
        let move;
        move = moveGen.getMove();
        const moveEndTime = new Date().getTime();
        console.log("Timeout reached! Using move " + move + " after " + (moveEndTime - moveStartTime) + ' ms');
        ////    SnakeLogger.info("Timeout reached! Using move " + move);
        response.status(200).send({
            move: move
        });
        // setTimeout(() => {
        //   move = moveGen.getMove();
        //   SnakeLogger.info("Timeout reached! Using move " + move);
        //   return response.json({move});
        // }, 245);
    }
    catch (e) {
        ////    SnakeLogger.error(e);
    }
}));
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
app.post("/end", (request, response) => {
    ////  SnakeLogger.debug("Enter /end");
    // NOTE: Any cleanup when a game is complete.
    // So we can run multiple games without re-starting app.
    return response.json({});
});
app.post("/ping", (request, response) => {
    ////  SnakeLogger.info("Enter /ping");
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