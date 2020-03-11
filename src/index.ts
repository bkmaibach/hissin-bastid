import bodyParser from "body-parser";
import express from "express";
import * as path from "path";

import { IPoint, EMoveDirections } from "./snake/types";

import { fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} from "./handlers";
import { StateAnalyzer } from "./snake/StateAnalyzer";
import { PathPrioritizer } from "./snake/PathPrioritizer";
import { SnakeLogger } from "./util/SnakeLogger";

const app = express();
// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set("port", (process.env.PORT || 8080));
app.enable("verbose errors");
app.use(bodyParser.json());

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

app.post("/start", async (request, response) => {
  const snakeName = request.body.you.name;
  const gameID = request.body.game.id;
  SnakeLogger.init(snakeName, gameID);
  SnakeLogger.debug("Enter /start");
  // All this part serves to do is choose our colour. If the program sees its on heroku (production)
  // It will choose our official colour. Else server automatically assigns color at random, useful
  // for development so we can distinguish a bunch at once.

  // forward the initial request to the state analyzer upon start
  StateAnalyzer.update(request.body);
  // NOTE: adding this state is redundant with move 0?

  const data = {
    headType: "fang",
    tailType: "hook",
    color: "#11FF55"
  };

  if (process.env.NODE_ENV == "production") {
    // data.color = "#11FF55";
  }
  return response.json(data);
});

app.post("/move", (request, response) => {
  const moveStartTime = new Date().getTime();
  SnakeLogger.debug("Enter /move");
  // Everything is wrapped in a try/catch so our app doesnt crash if something goes wrong
  try {
    // update the Analyzer with the new moves, first thing, right away. Don't call this function anywhere else!
    StateAnalyzer.update(request.body);

    const pathPrioritizer = new PathPrioritizer();

    let path: IPoint[];
    let move: EMoveDirections;
    const turn = StateAnalyzer.getTurnNumber();
    const myPosition = StateAnalyzer.getMyPosition();

    const paths = pathPrioritizer.getPrioritizedPaths();

    for (let i = 0; i < paths.length; i++) {
      if (typeof paths[i] != "undefined") {
        path = paths[i];
        break;
      }
    }

    if (typeof path != "undefined") {
      move = StateAnalyzer.getMove(path[0], path[1]);
    } else {
      move = StateAnalyzer.safeMove();
    }

    const moveEndTime = new Date().getTime();
    SnakeLogger.info("turn: " + JSON.stringify(turn));
    SnakeLogger.info("current xy: " + JSON.stringify(myPosition));
    SnakeLogger.info("path projection: " + JSON.stringify(path));
    SnakeLogger.info("move: " + JSON.stringify(move) + " chosen in " + (moveEndTime - moveStartTime) + " milliseconds");

    // Response data
    return response.json({move});

  } catch (e) {
    console.error(e);
  }

});

app.post("/end", (request, response) => {
  SnakeLogger.debug("Enter /end");
  // NOTE: Any cleanup when a game is complete.
  // So we can run multiple games without re-starting app.
  return response.json({});
});

app.post("/ping", (request, response) => {
  SnakeLogger.info("Enter /ping");
  // Used for checking if this snake is still alive.
  return response.json({});
});

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use(poweredByHandler);
app.use("*", fallbackHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

app.listen(app.get("port"), () => {
  console.log("Snake listening on port %s", app.get("port"));
  const logDir = path.join(__dirname, "../logs" );
  console.log("Logs can be found at " + logDir);
});
