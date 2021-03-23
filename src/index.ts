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
import { IPoint, EMoveDirections } from "./snake/types";
import { SnakeLogger } from "./util/SnakeLogger";
// import * as dataLogger from "./data/data";
import { Logger } from "mongodb";
import { MoveGenerator } from "./snake/MoveGenerator";

const app = express();
let filename: string;
// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set("port", (process.env.PORT || 9001));
app.enable("verbose errors");
app.use(bodyParser.json());

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

app.get('/', (request, response) => {
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'bkmaibach',
    color: "#11FF55",
    headType: "fang",
    tailType: "hook"
  }
  response.status(200).json(battlesnakeInfo)
})

// Handle POST request to "/start"
app.post("/start", async (request, response) => {
  const snakeName = request.body.you.name;
  const gameID = request.body.game.id;
////  SnakeLogger.init(snakeName, gameID);
  // SnakeLogger.debug("Enter /start");
  // forward the initial request to the state analyzer upon start
  // All this part serves to do is choose our colour. If the program sees its on heroku (production)
  // It will choose our official colour. Else itll just do random for development so we can distinguish a bunch at once.

  filename = gameID + "_" + snakeName;
  StateAnalyzer.update(request.body);
  response.status(200).send('ok')
});

app.post("/move", async (request, response) => {
  console.log('Move requested')
  const moveStartTime = new Date().getTime();
  // Everything is wrapped in a try/catch so our app doesn't crash if something goes wrong
  try {
    // update the Analyzer with the new moves, first thing, right away. Don't call this function anywhere else!
    StateAnalyzer.update(request.body);
////    SnakeLogger.debug("Enter /move");

    const moveGen = new MoveGenerator();
    moveGen.commencePathScoring();

    await sleep(200);
    let move: EMoveDirections;
    move = moveGen.getMove();
    const moveEndTime = new Date().getTime();
    console.log("Timeout reached! Using move " + move + " after " + (moveEndTime - moveStartTime) + ' ms');
////    SnakeLogger.info("Timeout reached! Using move " + move);
    response.status(200).send({
      move: move
    })

    // setTimeout(() => {
    //   move = moveGen.getMove();
    //   SnakeLogger.info("Timeout reached! Using move " + move);
    //   return response.json({move});

    // }, 245);

  } catch (e) {
////    SnakeLogger.error(e);
  }

});

function sleep(ms: number) {
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

app.use(poweredByHandler);
app.use("*", fallbackHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

app.listen(app.get("port"), () => {
  console.log("Snake listening on port %s", app.get("port"));
  const logDir = path.join(__dirname, "../logs" );
  console.log("Logs can be found at " + logDir);
});
