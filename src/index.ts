import bodyParser from "body-parser";
import express from "express";

import { fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} from "./handlers";
import { StateAnalyzer } from "./snake/StateAnalyzer";
import * as _ from "lodash";
import { TailDodger } from "./snake/TailDodger" ;
import { TargetGenerator } from "./snake/TargetGenerator";
import { IPoint, EMoveDirections } from "./snake/types";
import { logger } from "../winston";

const app = express();

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set("port", (process.env.PORT || 9001));
app.enable("verbose errors");
app.use(bodyParser.json());

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

// Handle POST request to "/start"
app.post("/start", (request, response) => {
  logger.info("Enter /start");
  // forward the initial request to the state analyzer upon start
  // All this part serves to do is choose our colour. If the program sees its on heroku (production)
  // It will choose our official colour. Else itll just do random for development so we can distinguish a bunch at once.
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


// This is the function that gets run once per frame. It sends us a request whose body tells us everything about
// the same at that point.
// A few things need to be stored outside this function so that they stay the same from one request to the next

let targetXY: IPoint;
const targetGen = new TargetGenerator();

app.post("/move", (request, response) => {
  logger.info("Enter /move");
  // Everything is wrapped in a try/catch so our app doesnt crash if something goes wrong
  try {
    // update the Analyzer with the new moves, first thing, right away. Don't call this function anywhere else!
    StateAnalyzer.update(request.body);

    // Our move generation is currently made of 2 questions:
    // Where do we go? and
    // How do we get there?
    let path: IPoint[];
    let move: EMoveDirections;
    const turn = StateAnalyzer.getTurnNumber();
    const myPosition = StateAnalyzer.getMyPosition();

    // Where do we go? Ideally, our target gen has sorted all of the points in perfect order of how much we should go twards there
    // This could be served up by a neural net processing the game state. But at the time of writing it's just the list of food points.
    // (which got us to a score of 31)
    const targets = targetGen.getSortedTargets();
    const dodger = new TailDodger(myPosition);

    // Notice that this for-loop tries to get paths to each of the points in the sorted array. It will consider a path to any of these
    // Points and get the move for the first step on this path if available.
    for (let i = 0; i < targets.length; i++) {
      targetXY = targets[i];
      path = dodger.getShortestPath(targetXY);
      if (typeof path != "undefined") {
        move = StateAnalyzer.getMove(path[0], path[1]);
        break;
      }
    }

    // If there are literally no paths available to any of the points in our list, then we can default to a safemove
    if (typeof path == "undefined") {
      move = StateAnalyzer.safeMove();
    }

    // Console logging break
    logger.verbose("turn: " + JSON.stringify(turn));
    logger.verbose("current xy: " + JSON.stringify(myPosition));
    logger.verbose("target xy: " + JSON.stringify(targetXY));
    logger.verbose("path projection: " + JSON.stringify(path));
    logger.verbose("move: " + JSON.stringify(move));
    logger.verbose("\n");

    // Response data
    return response.json({move});

  } catch (e) {
    logger.verbose(e);
  }

});

app.post("/end", (request, response) => {
  // NOTE: Any cleanup when a game is complete.
  // So we can run multiple games without re-starting app.

  return response.json({});
});

app.post("/ping", (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
});

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use(poweredByHandler);
app.use("*", fallbackHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

app.listen(app.get("port"), () => {
  logger.verbose("Snake listening on port %s", app.get("port"));
});
