import bodyParser from "body-parser";
import express from "express";
import * as path from "path";

import { fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} from "./handlers";
import { StateAnalyzer } from "./snake/StateAnalyzer";
import * as _ from "lodash";
import { TailDodger } from "./snake/TailDodger" ;
import { MoveGenerator } from "./snake/MoveGenerator";
import { IPoint, EMoveDirections } from "./snake/types";
import { SnakeLogger } from "./util/SnakeLogger";
// import * as dataLogger from "./data/data";
import { Logger } from "mongodb";

const app = express();
// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set("port", (process.env.PORT || 9001));
app.enable("verbose errors");
app.use(bodyParser.json());

// --- SNAKE LOGIC GOES BELOW THIS LINE ---
// Handle POST request to "/start"
app.post("/start", async (request, response) => {
  const snakeName = request.body.you.name;
  const gameID = request.body.game.id;
  SnakeLogger.init(snakeName, gameID);
  SnakeLogger.debug("Enter /start");
  StateAnalyzer.update(request.body);
  let hexString;
  if (process.env.NODE_ENV == "production") {
    hexString = "11FF55";
  } else {
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
  };
  return response.json(data);
});


app.post("/move", async (request, response) => {
  SnakeLogger.debug("Enter /move");
  // Everything is wrapped in a try/catch so our app doesnt crash if something goes wrong
  // update the Analyzer with the new moves, first thing, right away. Don't call this function anywhere else!
  StateAnalyzer.update(request.body);

  const moveGen = new MoveGenerator();
  try {
    const move = await moveGen.generateMove();
    SnakeLogger.info("turn: " + JSON.stringify(StateAnalyzer.getTurnNumber()));
    SnakeLogger.info("current xy: " + JSON.stringify(StateAnalyzer.getMyPosition()));
    SnakeLogger.info("move: " + JSON.stringify(move));
    return response.json({move});
  } catch (e) {
    const stack = new Error().stack;
    SnakeLogger.error(JSON.stringify(e) + " : " + stack);
  }
});

app.post("/end", (request, response) => {
  SnakeLogger.debug("Enter /end");
  // NOTE: Any cleanup when a game is complete.
  // So we can run multiple games without re-starting app.
  return response.json({});
});

app.post("/ping", (request, response) => {
  // SnakeLogger.debug("Enter /ping");
  // Used for checking if this snake is still alive.
  return response.json({});
});

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use(poweredByHandler);
app.use("*", fallbackHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

app.listen(app.get("port"), () => {
  console.log("Snake listening on port " + app.get("port"));
});