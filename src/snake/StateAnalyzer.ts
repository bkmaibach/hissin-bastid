import { IGameState,  EMoveTypes, IMoveInfo, EMoveDirections, IPoint, ISnake } from "./types";
import { getIndexOfValue } from "./util";
import * as _ from "lodash";

export class StateAnalyzer {
    static gameState: IGameState;

    static update(newState: IGameState) {
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

    static getHeight = () => {
    return StateAnalyzer.gameState.board.height;
    }

    static getWidth = () => {
    return StateAnalyzer.gameState.board.width;
    }

    static getSnakeLength = (name: string) => {
    // console.log(this.gameState.board.snakes);
    const snake = StateAnalyzer.gameState.board.snakes.filter((snake: ISnake) => snake.name == name)[0];
    return snake.body.length;
    }

    static getRectilinearNeighbors(XY: IPoint): IPoint[] {
        const x = XY.x;
        const y = XY.y;

        return [
            {x: x - 1, y}, // left cell
            {x: x + 1, y}, // right cell
            {x, y: y + 1}, // down cell
            {x, y: y - 1} // up cell
        ];
    }

    static moveInfo (snakeName: string, move: EMoveDirections): IMoveInfo {

        const returnVal: IMoveInfo = { type: EMoveTypes.unknown };


        const snake = StateAnalyzer.gameState.board.snakes.filter((snake: ISnake) => snake.name == snakeName)[0];
        const { x, y } = snake.body[0];

        const newXY = move == "up" ? {x, y: y - 1} :
                    move == "right" ? {x: x + 1, y} :
                    move == "down" ? {x, y: y + 1} :
                    move == "left" ? {x: x - 1, y} : undefined;

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
            if (returnVal.type == EMoveTypes.unknown) returnVal.type = EMoveTypes.wall;
            console.log("Move found to collide with wall");
        }

        this.gameState.board.snakes.forEach((boardSnake: ISnake) => {
        for (let i = 0; i < boardSnake.body.length; i++) {
        if (_.isEqual(boardSnake.body[i], newXY)) {
            if (returnVal.type == EMoveTypes.unknown) {
                returnVal.type = EMoveTypes.body;
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

        StateAnalyzer.gameState.board.snakes.forEach((boardSnake: ISnake) => {
        if (boardSnake.name != snakeName) {
            // console.log("Checking snake " + boardSnake.name);
            // console.log("Considering point " + JSON.stringify(newXY));
            // console.log("neighbors of this point: " + JSON.stringify(neighbors));
            // console.log("Snake head is at" + JSON.stringify(boardSnake.body[0]));
            // console.log("getIndexOfValue(neighbors, boardSnake.body[0]) == " + getIndexOfValue(neighbors, boardSnake.body[0]));
            if (getIndexOfValue(neighbors, boardSnake.body[0]) > -1) {
                console.log("Move found to be contested by: " + boardSnake.name);
                if (returnVal.type == EMoveTypes.unknown) returnVal.type = EMoveTypes.contested;
                if (!returnVal.snakeLengths) {
                    returnVal.snakeLengths = [];
                }
                returnVal.snakeLengths.push(boardSnake.body.length);
                console.log("returnVal.snakeLengths == " + returnVal.snakeLengths);
            }
        }
        });


        if (returnVal.type == EMoveTypes.unknown) {
        returnVal.type = EMoveTypes.uncontested;
        console.log("Move is free and uncontested");
        }

        returnVal.food = getIndexOfValue(this.gameState.board.food, newXY) > -1;

        return returnVal;
    }

    static getMove (start: IPoint, finish: IPoint): EMoveDirections {
        const dx = finish.x - start.x;
        const dy = finish.y - start.y;
        if (dx == 1) {
        return EMoveDirections.right;
        } else if (dx == -1) {
        return EMoveDirections.left;
        } else if (dy == 1) {
        return EMoveDirections.down;
        } else if (dy == -1) {
        return EMoveDirections.up;
        }
    }

    static safeMove(): EMoveDirections {
        console.log("SAFEMOVE DEFAULT ENGAGED");
        const myName = StateAnalyzer.getMyName();
        const moves = [EMoveDirections.left, EMoveDirections.right, EMoveDirections.up, EMoveDirections.down];
        const moveInfos: IMoveInfo[] = [];
        moves.forEach((move) => {
        moveInfos.push(StateAnalyzer.moveInfo(myName, move));
        });

        for (let i = 0; i < 4; i++) {
        if (moveInfos[i].type == EMoveTypes.contested) {
            if (StateAnalyzer.getMyLength() > Math.max(...moveInfos[i].snakeLengths)) {
                console.log("Taking point contested by smaller snake by moving: " + moves[i]);
                return moves[i];
            }
        }
        }

        for (let i = 0; i < 4; i++) {
        if (moveInfos[i].type == EMoveTypes.uncontested) {
            console.log("Taking uncontested point by moving: " + moves[i]);
            return moves[i];
        }
        }

        for (let i = 0; i < 4; i++) {
        if (moveInfos[i].type == EMoveTypes.contested) {
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
        return EMoveDirections.up;
    }

    static nextToFood(point: IPoint): boolean {
        const foodPoints = StateAnalyzer.getFoodPoints();
        const neighbors = StateAnalyzer.getRectilinearNeighbors(point);
        let returnVal = false;
        neighbors.forEach((neighborPoint) => {
        if (getIndexOfValue(foodPoints, neighborPoint) > -1) {
            returnVal = true;
            return;
        }
        });
        return returnVal;
    }

    static pointIsContestedByLargerSnake (point: IPoint): boolean {
        const myName = StateAnalyzer.getMyName();
        const neighbors = StateAnalyzer.getRectilinearNeighbors(point);
        let returnVal = false;
        StateAnalyzer.getSnakes().forEach((snake) => {
        if (snake.name != myName) {
            // console.log("checking snake " + snake.name);
            // console.log("point neighbors are" + JSON.stringify(neighbors));
            // console.log("snake head is at " + JSON.stringify(snake.body[0]));
            if (getIndexOfValue(neighbors, snake.body[0]) > -1) {
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
        let returnArr: IPoint[] = [];
        StateAnalyzer.getSnakes().forEach((snake) => {
        returnArr = returnArr.concat(snake.body);
        });
        return returnArr;
    }

    static pointIsTaken(point: IPoint) {
        const takenPoints = StateAnalyzer.getTakenPoints();
        return (getIndexOfValue(takenPoints, point) > -1);
    }
}