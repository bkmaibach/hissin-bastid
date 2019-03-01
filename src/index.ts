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
import { PathPrioritizer } from "./snake/PathPrioritizer";
import { IPoint, EMoveDirections } from "./snake/types";
import { SnakeLogger } from "./util/SnakeLogger";
// import * as dataLogger from "./data/data";
import { Logger } from "mongodb";

const app = express();
let filename: string;
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
  // forward the initial request to the state analyzer upon start
  // All this part serves to do is choose our colour. If the program sees its on heroku (production)
  // It will choose our official colour. Else itll just do random for development so we can distinguish a bunch at once.

  filename = gameID + "_" + snakeName;

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

app.post("/move", (request, response) => {
  const moveStartTime = new Date().getTime();
  SnakeLogger.debug("Enter /move");
  // Everything is wrapped in a try/catch so our app doesnt crash if something goes wrong
  try {
    // update the Analyzer with the new moves, first thing, right away. Don't call this function anywhere else!
    StateAnalyzer.update(request.body);

    const pathPrioritizer = new PathPrioritizer();

    // Our move generation is currently made of 2 questions:
    // Where do we go? and
    // How do we get there?
    let path: IPoint[];
    let move: EMoveDirections;
    const turn = StateAnalyzer.getTurnNumber();
    const myPosition = StateAnalyzer.getMyPosition();

    // Where do we go? Ideally, ourappRoot target gen has sorted all of the points in perfect order of how much we should go twards there
    // This could be served up by aappRoot neural net processing the game state. But at the time of writing it's just the list of food points.
    // (which got us to a score of appRoot31)
    const paths = pathPrioritizer.getPrioritizedPaths();
    if (paths !== []) {
      path = paths[0];
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
    console.log(e);
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
