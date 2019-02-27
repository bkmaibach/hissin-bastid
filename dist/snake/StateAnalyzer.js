"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const helpers_1 = require("../util/helpers");
const _ = __importStar(require("lodash"));
const SnakeLogger_1 = require("../util/SnakeLogger");
// import { logger } from "../../winston";
/*
Every time our app is asked for a move, we receive a "request body" that contains all the information about the board
at that time. This request body takes the form of a Javascript literal as text. (JSON).

The idea behind this class is that every time a new JSON object is sent up to us (in index.ts) the FIRST thing we do is
give the state to this class. We can then call the methods within this class from anywhere in the program, and we can start
answering questions about particular points or snakes or other game data such as board width, etc. (ALL of the informaiton that
the game holders would let us know at this point.)

Notice that everything in this class is static, there does not need to be multiple representations of present gamestate at this time,
i.e. there is no need to construct different instances of this. Just import and you're good to go with all the methods you need.
*/
class StateAnalyzer {
    constructor() {
    }
    static getState(turnsAgo) {
        const index = (StateAnalyzer.gameStates.length - 1) - turnsAgo;
        return StateAnalyzer.gameStates[index];
    }
    // Call this method right away when you know about a new game state
    static update(newState) {
        StateAnalyzer.gameStates.push(newState);
    }
    static isSnakeDigesting(snakeName) {
        // const current = this.getState(0);
        // const previous = this.getState(1);
        const snakeHeadBefore = this.snakeHead(snakeName, 1);
        const snakeHeadAfter = this.snakeHead(snakeName, 0);
        const wasNextToFood = this.nextToFood(snakeHeadBefore, 1);
        if (!wasNextToFood) {
            return false;
        }
        else {
            const foodPoints = this.getNeighborsWithFood(snakeHeadBefore, 1);
            const negativeOneIfAbsent = helpers_1.getIndexOfValue(foodPoints, snakeHeadAfter);
            return (negativeOneIfAbsent != -1);
        }
    }
    static getNeighborsWithFood(point, turnsAgo) {
        const neighbors = this.getRectilinearNeighbors(point);
        const foodPoints = this.getFoodPoints(turnsAgo);
        const result = neighbors.filter((neighborPoint) => {
            return helpers_1.getIndexOfValue(foodPoints, neighborPoint) > -1;
        });
        return result;
    }
    static snakeHead(snakeName, turnsAgo) {
        const state = this.getState(turnsAgo);
        const snakeArray = state.board.snakes;
        const snake = snakeArray.filter((snake) => snake.name == snakeName)[0];
        return snake.body[0];
    }
    // What turn is it?
    static getTurnNumber() {
        return StateAnalyzer.getState(0).turn;
    }
    // Where is my snake's head? What IPoint?
    static getMyPosition() {
        return StateAnalyzer.getState(0).you.body[0];
    }
    // What is the name of my snake?
    static getMyName() {
        return StateAnalyzer.getState(0).you.name;
    }
    // Give me an array of objects, each object contains all info on a snake ie health
    static getSnakes() {
        return StateAnalyzer.getState(0).board.snakes;
    }
    // How long am I?
    static getMyLength() {
        return StateAnalyzer.getState(0).you.body.length;
    }
    // Give me an array of all the points containing food
    static getFoodPoints(turnsAgo) {
        return StateAnalyzer.getState(turnsAgo).board.food;
    }
    // return false if no food on board
    static isThereFood() {
        if (StateAnalyzer.getState(0).board.food[0] == undefined) {
            SnakeLogger_1.SnakeLogger.notice("There is no food");
            return false;
        }
        else {
            SnakeLogger_1.SnakeLogger.notice("Food is here: " + StateAnalyzer.getState(0).board.food[0]);
            return true;
        }
    }
    // You give me a point, I'll give you an array of four points back (left, right, up, down)
    static getRectilinearNeighbors(XY) {
        const x = XY.x;
        const y = XY.y;
        return [
            { x: x - 1, y },
            { x: x + 1, y },
            { x, y: y + 1 },
            { x, y: y - 1 } // up cell
        ];
    }
    // This one is fancy, and very helpful for determining the safety of a move.
    // Give me the name of a snake and a move it wants to make ("up" or "left" etc)
    // And I will give you some info about that move
    // See IMoveInfo to see what the shape of this return data looks like
    static moveInfo(snakeName, move) {
        // The move info must always have a ".status" property, which must be one of
        // EmoveTypes.unknown (or just "unknown" as a string if you prefer, tomayto tomahto)
        // "uncontested" - empty and safe
        // "contested" - empty but possibly dangerous (will also include an array of snake sizes contesting)
        // "wall" - splat
        // "body" - sploot
        // The return value of this function is defined first as unknown. It will only ever return unknown as the type
        // If theres a bug
        const returnVal = { contents: types_1.ECellContents.unknown, snakeLengths: [0] };
        const snake = StateAnalyzer.getState(0).board.snakes.filter((snake) => snake.name == snakeName)[0];
        const { x, y } = snake.body[0];
        const newXY = move == "up" ? { x, y: y - 1 } :
            move == "right" ? { x: x + 1, y } :
                move == "down" ? { x, y: y + 1 } :
                    move == "left" ? { x: x - 1, y } : undefined;
        if (newXY == undefined) {
            throw "Move " + move + " not recognized";
        }
        const newX = newXY.x;
        const newY = newXY.y;
        // The XY that we are looking at has been determined using "left" or whatever
        // Logging checkpoint
        SnakeLogger_1.SnakeLogger.notice(this.getTurnNumber().toString());
        SnakeLogger_1.SnakeLogger.notice("My position: " + JSON.stringify(this.getMyPosition()));
        SnakeLogger_1.SnakeLogger.notice("considering spot: " + JSON.stringify(newXY));
        // Check if its a wall
        if (newX >= StateAnalyzer.getState(0).board.width
            || newX < 0
            || newY >= StateAnalyzer.getState(0).board.height
            || newY < 0) {
            if (returnVal.contents == types_1.ECellContents.unknown)
                returnVal.contents = types_1.ECellContents.wall;
            SnakeLogger_1.SnakeLogger.notice("Move found to collide with wall");
        }
        // Check if it's a part of any snake body
        StateAnalyzer.getState(0).board.snakes.forEach((boardSnake) => {
            for (let i = 0; i < boardSnake.body.length; i++) {
                if (_.isEqual(boardSnake.body[i], newXY)) {
                    if (returnVal.contents == types_1.ECellContents.unknown) {
                        SnakeLogger_1.SnakeLogger.notice("Move found to contain the body of snake: " + boardSnake.name);
                        returnVal.contents = types_1.ECellContents.body;
                    }
                    if (i == 0) {
                        // special note that body point is a head
                        returnVal.head = true;
                        SnakeLogger_1.SnakeLogger.notice("It contains this snakes head");
                    }
                    if (i == boardSnake.body.length - 1) {
                        returnVal.tip = true;
                        SnakeLogger_1.SnakeLogger.notice("It contains a snake tip");
                        if (!StateAnalyzer.isSnakeDigesting(boardSnake.name)
                            || boardSnake.name == StateAnalyzer.getMyName()) {
                            SnakeLogger_1.SnakeLogger.notice("But it is a safeTip");
                            returnVal.safeTip = true;
                        }
                    }
                }
            }
        });
        // Check if it's contested
        const neighbors = StateAnalyzer.getRectilinearNeighbors(newXY);
        StateAnalyzer.getState(0).board.snakes.forEach((boardSnake) => {
            if (boardSnake.name != snakeName) {
                SnakeLogger_1.SnakeLogger.notice("Checking snake " + boardSnake.name);
                SnakeLogger_1.SnakeLogger.notice("Considering point " + JSON.stringify(newXY));
                SnakeLogger_1.SnakeLogger.notice("neighbors of this point: " + JSON.stringify(neighbors));
                SnakeLogger_1.SnakeLogger.notice("Snake head is at" + JSON.stringify(boardSnake.body[0]));
                SnakeLogger_1.SnakeLogger.notice("getIndexOfValue(neighbors, boardSnake.body[0]) == " + helpers_1.getIndexOfValue(neighbors, boardSnake.body[0]));
                if (helpers_1.getIndexOfValue(neighbors, boardSnake.body[0]) > -1) {
                    SnakeLogger_1.SnakeLogger.notice("Move found to be contested by: " + boardSnake.name);
                    returnVal.contested = true;
                    if (!returnVal.snakeLengths) {
                        returnVal.snakeLengths = [];
                    }
                    returnVal.snakeLengths.push(boardSnake.body.length);
                    SnakeLogger_1.SnakeLogger.notice("returnVal.snakeLengths == " + returnVal.snakeLengths);
                }
                else {
                    returnVal.contested = false;
                }
            }
        });
        // If we still haven't changed it from unknown, the status
        if (returnVal.contents == types_1.ECellContents.unknown) {
            returnVal.contents = types_1.ECellContents.empty;
            SnakeLogger_1.SnakeLogger.notice("Move destination is free");
        }
        // Also put in if the point is in the food list.
        // Notice the getIndexOfValue function returns -1 when it can't find the index in the list
        returnVal.food = helpers_1.getIndexOfValue(StateAnalyzer.getState(0).board.food, newXY) > -1;
        return returnVal;
    }
    // what move do I need to get from the start point to the finish point?
    // "up"? "right"?
    static getMove(start, finish) {
        const dx = finish.x - start.x;
        const dy = finish.y - start.y;
        if (dx == 1) {
            return types_1.EMoveDirections.right;
        }
        else if (dx == -1) {
            return types_1.EMoveDirections.left;
        }
        else if (dy == 1) {
            return types_1.EMoveDirections.down;
        }
        else if (dy == -1) {
            return types_1.EMoveDirections.up;
        }
    }
    // Another fun one. This function suggests a move that our snake could do based on the current board.
    // It will suggest moves in the following priority:
    // 1. A spot that a smaller snake is looking at or could also move to
    // 3. An empty, uncontested spot
    // 4. A spot that is contested... D:
    // 5. An enemy snakes head, if he he's trapped he might do the same and we can take a bastard down with us.
    // 6. ...up?  good luck
    static safeMove() {
        SnakeLogger_1.SnakeLogger.notice("SAFEMOVE DEFAULT ENGAGED");
        const myName = StateAnalyzer.getMyName();
        const moves = [types_1.EMoveDirections.left, types_1.EMoveDirections.right, types_1.EMoveDirections.up, types_1.EMoveDirections.down];
        const moveInfos = [];
        // Basically we just get the move infos for each neighbor
        moves.forEach((move) => {
            moveInfos.push(StateAnalyzer.moveInfo(myName, move));
        });
        // Check the move infos multiple times over, return out and finish if we find something
        for (let i = 0; i < 4; i++) {
            if (moveInfos[i].contents == types_1.ECellContents.empty
                || (moveInfos[i].safeTip)) {
                if (moveInfos[i].contested && StateAnalyzer.getMyLength() > Math.max(...moveInfos[i].snakeLengths)) {
                    SnakeLogger_1.SnakeLogger.notice("Taking point contested by smaller snake by moving: " + moves[i]);
                    // Best pickins
                    return moves[i];
                }
            }
        }
        // Check the moves again for a second-best options
        for (let i = 0; i < 4; i++) {
            if (!moveInfos[i].contested && (moveInfos[i].contents == types_1.ECellContents.empty
                || moveInfos[i].safeTip)) {
                SnakeLogger_1.SnakeLogger.notice("Taking empty or safe tip point by moving: " + moves[i]);
                // Will do fine
                return moves[i];
            }
        }
        // Taking empty or safetip spot, possibly contested
        for (let i = 0; i < 4; i++) {
            if (moveInfos[i].contents == types_1.ECellContents.empty || moveInfos[i].safeTip) {
                SnakeLogger_1.SnakeLogger.notice("Taking empty point that might not end so well: " + moves[i]);
                // Scraping the bottom of the barrell...
                return moves[i];
            }
        }
        // Taking tip spot
        for (let i = 0; i < 4; i++) {
            if (moveInfos[i].tip) {
                SnakeLogger_1.SnakeLogger.notice("Taking a not-so-safe tip: " + moves[i]);
                // Scraping the bottom of the barrel...
                return moves[i];
            }
        }
        // AAAAAAAAAHHH! ( I added a special move info property called head to make this work )
        for (let i = 0; i < 4; i++) {
            if (moveInfos[i].head) {
                // AAAAAAAAAAAAAAAAAAAHHH!!!
                SnakeLogger_1.SnakeLogger.notice("Last resort kamikaze move into another snake head: " + moves[i]);
                return moves[i];
            }
        }
        // Welp!
        SnakeLogger_1.SnakeLogger.notice("No safe move could be found, defaulting to up. Sorry snakey :[");
        return types_1.EMoveDirections.up;
    }
    // Is this point next to food?
    static nextToFood(point, turnsAgo) {
        const foodPoints = StateAnalyzer.getFoodPoints(turnsAgo);
        const neighbors = StateAnalyzer.getRectilinearNeighbors(point);
        let returnVal = false;
        // For each neighboring point is it in the food list blah blah
        neighbors.forEach((neighborPoint) => {
            if (helpers_1.getIndexOfValue(foodPoints, neighborPoint) > -1) {
                returnVal = true;
                return;
            }
        });
        return returnVal;
    }
    // Is this point next to a snake that's bigger than us?
    static pointIsContestedByLargerSnake(point) {
        const myName = StateAnalyzer.getMyName();
        const neighbors = StateAnalyzer.getRectilinearNeighbors(point);
        let returnVal = false;
        StateAnalyzer.getSnakes().forEach((snake) => {
            if (snake.name != myName) {
                SnakeLogger_1.SnakeLogger.notice("checking snake " + snake.name);
                SnakeLogger_1.SnakeLogger.notice("point neighbors are" + JSON.stringify(neighbors));
                SnakeLogger_1.SnakeLogger.notice("snake head is at " + JSON.stringify(snake.body[0]));
                if (helpers_1.getIndexOfValue(neighbors, snake.body[0]) > -1) {
                    SnakeLogger_1.SnakeLogger.notice("snake head was found in neighbor list");
                    if (snake.body.length >= StateAnalyzer.getMyLength()) {
                        SnakeLogger_1.SnakeLogger.notice("snake is too large to ignore");
                        returnVal = true;
                        return;
                    }
                }
            }
        });
        return returnVal;
    }
    // Just give me all the snake body points concatted together in one array for my convenience please
    static getTakenPoints() {
        let returnArr = [];
        StateAnalyzer.getSnakes().forEach((snake) => {
            returnArr = returnArr.concat(snake.body);
        });
        return returnArr;
    }
    // Is this point a part of a snake body?
    static pointIsTaken(point) {
        const takenPoints = StateAnalyzer.getTakenPoints();
        return (helpers_1.getIndexOfValue(takenPoints, point) > -1);
    }
    static getMyTailTip() {
        const last = StateAnalyzer.getState(0).you.body.length - 1;
        return StateAnalyzer.getState(0).you.body[last];
    }
    static getGameStatesAndReset() {
        // TODO - compress the game data?
        const returnVal = _.clone(StateAnalyzer.gameStates);
        StateAnalyzer.gameStates = [];
        return returnVal;
    }
}
// The current game state (same shape as request body, ie IGameState)
StateAnalyzer.gameStates = [];
// How tall is the board?
StateAnalyzer.getBoardHeight = () => {
    return StateAnalyzer.getState(0).board.height;
};
// How wide?
StateAnalyzer.getBoardWidth = () => {
    return StateAnalyzer.getState(0).board.width;
};
// How long is a snake?
StateAnalyzer.getSnakeLength = (name) => {
    const snake = StateAnalyzer.getState(0).board.snakes.filter((snake) => snake.name == name)[0];
    return snake.body.length;
};
exports.StateAnalyzer = StateAnalyzer;
//# sourceMappingURL=StateAnalyzer.js.map