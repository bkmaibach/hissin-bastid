import bodyParser from "body-parser";
import express from "express";
import logger from "./util/logger";

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

const app = express();

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set("port", (process.env.PORT || 9001));
app.enable("verbose errors");
app.use(bodyParser.json());

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

// Handle POST request to "/start"
app.post("/start", (request, response) => {
  // forward the initial request to the state analyzer upon start
  StateAnalyzer.update(request.body);
  let hexString;
  if (process.env.NODE_ENV == "production") {
    hexString = "11FF11";
  } else {
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

let targetXY: IPoint;
const targetGen = new TargetGenerator();
// Handle POST request to "/move"
app.post("/move", (request, response) => {
  try {
    // update the board with the new moves
    StateAnalyzer.update(request.body);

    let path: IPoint[];
    let move: EMoveDirections;
    const turn = StateAnalyzer.getTurn();
    const myPosition = StateAnalyzer.getMyPosition();
    const targets = targetGen.getSortedTargets();
    const dodger = new TailDodger(myPosition);

    for (let i = 0; i < targets.length; i++) {
      targetXY = targets[i];
      path = dodger.getShortestPath(targetXY);
      if (typeof path != "undefined") {
        move = StateAnalyzer.getMove(path[0], path[1]);
        break;
      }
    }

    if (typeof path == "undefined") {
      move = StateAnalyzer.safeMove();
    }

    console.log("turn: " + JSON.stringify(turn));
    console.log("current xy: " + JSON.stringify(myPosition));
    console.log("target xy: " + JSON.stringify(targetXY));
    console.log("path projection: " + JSON.stringify(path));
    console.log("move: " + JSON.stringify(move));
    console.log("\n");

    // Response data
    return response.json({move});

  } catch (e) {
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

app.use(poweredByHandler);
app.use("*", fallbackHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

app.listen(app.get("port"), () => {
  console.log("Server listening on port %s", app.get("port"));
});
