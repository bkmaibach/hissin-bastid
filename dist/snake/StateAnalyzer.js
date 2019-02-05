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
const util_1 = require("./util");
const _ = __importStar(require("lodash"));
class StateAnalyzer {
    static update(newState) {
        StateAnalyzer.gameState = newState;
    }
    static getTurn() {
        return StateAnalyzer.gameState.turn;
    }
    static getMyPosition() {
        return StateAnalyzer.gameState.you.body[0];
    }
    static getMyName() {
        return StateAnalyzer.gameState.you.name;
    }
    static getSnakes() {
        return StateAnalyzer.gameState.board.snakes;
    }
    static getMyLength() {
        return StateAnalyzer.gameState.you.body.length;
    }
    static getFoodPoints() {
        return StateAnalyzer.gameState.board.food;
    }
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
    static moveInfo(snakeName, move) {
        const returnVal = { type: types_1.EMoveTypes.unknown };
        const snake = StateAnalyzer.gameState.board.snakes.filter((snake) => snake.name == snakeName)[0];
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
        console.log(this.getTurn());
        console.log("My position: " + JSON.stringify(this.getMyPosition()));
        console.log("considering spot: " + JSON.stringify(newXY));
        if (newX >= this.gameState.board.width
            || newX < 0
            || newY >= this.gameState.board.height
            || newY < 0) {
            if (returnVal.type == types_1.EMoveTypes.unknown)
                returnVal.type = types_1.EMoveTypes.wall;
            console.log("Move found to collide with wall");
        }
        this.gameState.board.snakes.forEach((boardSnake) => {
            for (let i = 0; i < boardSnake.body.length; i++) {
                if (_.isEqual(boardSnake.body[i], newXY)) {
                    if (returnVal.type == types_1.EMoveTypes.unknown) {
                        returnVal.type = types_1.EMoveTypes.body;
                    }
                    if (i == 0) {
                        // special note that body point is a head
                        returnVal.head = true;
                    }
                    console.log("Move found to collide with body of snake: " + boardSnake.name);
                }
            }
        });
        const neighbors = StateAnalyzer.getRectilinearNeighbors(newXY);
        StateAnalyzer.gameState.board.snakes.forEach((boardSnake) => {
            if (boardSnake.name != snakeName) {
                // console.log("Checking snake " + boardSnake.name);
                // console.log("Considering point " + JSON.stringify(newXY));
                // console.log("neighbors of this point: " + JSON.stringify(neighbors));
                // console.log("Snake head is at" + JSON.stringify(boardSnake.body[0]));
                // console.log("getIndexOfValue(neighbors, boardSnake.body[0]) == " + getIndexOfValue(neighbors, boardSnake.body[0]));
                if (util_1.getIndexOfValue(neighbors, boardSnake.body[0]) > -1) {
                    console.log("Move found to be contested by: " + boardSnake.name);
                    if (returnVal.type == types_1.EMoveTypes.unknown)
                        returnVal.type = types_1.EMoveTypes.contested;
                    if (!returnVal.snakeLengths) {
                        returnVal.snakeLengths = [];
                    }
                    returnVal.snakeLengths.push(boardSnake.body.length);
                    console.log("returnVal.snakeLengths == " + returnVal.snakeLengths);
                }
            }
        });
        if (returnVal.type == types_1.EMoveTypes.unknown) {
            returnVal.type = types_1.EMoveTypes.uncontested;
            console.log("Move is free and uncontested");
        }
        returnVal.food = util_1.getIndexOfValue(this.gameState.board.food, newXY) > -1;
        return returnVal;
    }
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
    static safeMove() {
        console.log("SAFEMOVE DEFAULT ENGAGED");
        const myName = StateAnalyzer.getMyName();
        const moves = [types_1.EMoveDirections.left, types_1.EMoveDirections.right, types_1.EMoveDirections.up, types_1.EMoveDirections.down];
        const moveInfos = [];
        moves.forEach((move) => {
            moveInfos.push(StateAnalyzer.moveInfo(myName, move));
        });
        for (let i = 0; i < 4; i++) {
            if (moveInfos[i].type == types_1.EMoveTypes.contested) {
                if (StateAnalyzer.getMyLength() > Math.max(...moveInfos[i].snakeLengths)) {
                    console.log("Taking point contested by smaller snake by moving: " + moves[i]);
                    return moves[i];
                }
            }
        }
        for (let i = 0; i < 4; i++) {
            if (moveInfos[i].type == types_1.EMoveTypes.uncontested) {
                console.log("Taking uncontested point by moving: " + moves[i]);
                return moves[i];
            }
        }
        for (let i = 0; i < 4; i++) {
            if (moveInfos[i].type == types_1.EMoveTypes.contested) {
                console.log("Taking contested point that might not end so well: " + moves[i]);
                return moves[i];
            }
        }
        for (let i = 0; i < 4; i++) {
            if (moveInfos[i].head) {
                console.log("Last resort kamikaze move into another snake head: " + moves[i]);
                return moves[i];
            }
        }
        console.log("No safe move could be found, defaulting to up. Sorry snakey :[");
        return types_1.EMoveDirections.up;
    }
    static nextToFood(point) {
        const foodPoints = StateAnalyzer.getFoodPoints();
        const neighbors = StateAnalyzer.getRectilinearNeighbors(point);
        let returnVal = false;
        neighbors.forEach((neighborPoint) => {
            if (util_1.getIndexOfValue(foodPoints, neighborPoint) > -1) {
                returnVal = true;
                return;
            }
        });
        return returnVal;
    }
    static pointIsContestedByLargerSnake(point) {
        const myName = StateAnalyzer.getMyName();
        const neighbors = StateAnalyzer.getRectilinearNeighbors(point);
        let returnVal = false;
        StateAnalyzer.getSnakes().forEach((snake) => {
            if (snake.name != myName) {
                // console.log("checking snake " + snake.name);
                // console.log("point neighbors are" + JSON.stringify(neighbors));
                // console.log("snake head is at " + JSON.stringify(snake.body[0]));
                if (util_1.getIndexOfValue(neighbors, snake.body[0]) > -1) {
                    console.log("snake head was found in neighbor list");
                    if (snake.body.length >= StateAnalyzer.getMyLength()) {
                        console.log("snake is too large to ignore");
                        returnVal = true;
                        return;
                    }
                }
            }
        });
        return returnVal;
    }
    static getTakenPoints() {
        let returnArr = [];
        StateAnalyzer.getSnakes().forEach((snake) => {
            returnArr = returnArr.concat(snake.body);
        });
        return returnArr;
    }
    static pointIsTaken(point) {
        const takenPoints = StateAnalyzer.getTakenPoints();
        return (util_1.getIndexOfValue(takenPoints, point) > -1);
    }
}
StateAnalyzer.getHeight = () => {
    return StateAnalyzer.gameState.board.height;
};
StateAnalyzer.getWidth = () => {
    return StateAnalyzer.gameState.board.width;
};
StateAnalyzer.getSnakeLength = (name) => {
    // console.log(this.gameState.board.snakes);
    const snake = StateAnalyzer.gameState.board.snakes.filter((snake) => snake.name == name)[0];
    return snake.body.length;
};
exports.StateAnalyzer = StateAnalyzer;
//# sourceMappingURL=StateAnalyzer.js.map