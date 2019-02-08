import { IGameState,  ECellContents, IMoveInfo, EMoveDirections, IPoint, ISnake } from "./types";
import { getIndexOfValue } from "./util";
import * as _ from "lodash";

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

export class StateAnalyzer {
    // The current game state (same shape as request body, ie IGameState)
    static gameStates: IGameState[] = [];

    private constructor() {

    }

    static getCurrentState() {
        const last = StateAnalyzer.gameStates.length - 1;
        return StateAnalyzer.gameStates[last];
    }

    // Call this method right away when you know about a new game state
    static update(newState: IGameState) {
        StateAnalyzer.gameStates.push(newState);
    }

    // What turn is it?
    static getTurnNumber() {
        return StateAnalyzer.getCurrentState().turn;
    }

    // Where is my snake's head? What IPoint?
    static getMyPosition() {
        return StateAnalyzer.getCurrentState().you.body[0];
    }

    // What is the name of my snake?
    static getMyName() {
        return StateAnalyzer.getCurrentState().you.name;
    }

    // Give me an array of objects, each object contains all info on a snake ie health
    static getSnakes() {
        return StateAnalyzer.getCurrentState().board.snakes;
    }

    // How long am I?
    static getMyLength() {
        return StateAnalyzer.getCurrentState().you.body.length;
    }

    // Give me an array of all the points containing food
    static getFoodPoints() {
        return StateAnalyzer.getCurrentState().board.food;
    }

    // return false if no food on board
    static isThereFood() {
        if (StateAnalyzer.getCurrentState().board.food[0] == undefined) {
            console.log("There is no food");
            return false;
        } else {
            console.log("Food is here: " + StateAnalyzer.getCurrentState().board.food[0]);
            return true;
        }
    }

    // How tall is the board?
    static getBoardHeight = () => {
        return StateAnalyzer.getCurrentState().board.height;
    }

    // How wide?
    static getBoardWidth = () => {
        return StateAnalyzer.getCurrentState().board.width;
    }

    // How long is a snake?
    static getSnakeLength = (name: string) => {
        const snake = StateAnalyzer.getCurrentState().board.snakes.filter((snake: ISnake) => snake.name == name)[0];
        return snake.body.length;
    }

    // You give me a point, I'll give you an array of four points back (left, right, up, down)
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

    // This one is fancy, and very helpful for determining the safety of a move.
    // Give me the name of a snake and a move it wants to make ("up" or "left" etc)
    // And I will give you some info about that move
    // See IMoveInfo to see what the shape of this return data looks like
    static moveInfo (snakeName: string, move: EMoveDirections): IMoveInfo {

        // The move info must always have a ".status" property, which must be one of
        // EmoveTypes.unknown (or just "unknown" as a string if you prefer, tomayto tomahto)
        // "uncontested" - empty and safe
        // "contested" - empty but possibly dangerous (will also include an array of snake sizes contesting)
        // "wall" - splat
        // "body" - sploot

        // The return value of this function is defined first as unknown. It will only ever return unknown as the type
        // If theres a bug
        const returnVal: IMoveInfo = { contents: ECellContents.unknown, snakeLengths: [0] };

        const snake = StateAnalyzer.getCurrentState().board.snakes.filter((snake: ISnake) => snake.name == snakeName)[0];
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

        // The XY that we are looking at has been determined using "left" or whatever
        // Logging checkpoint

        console.log(this.getTurnNumber());
        console.log("My position: " + JSON.stringify(this.getMyPosition()));
        console.log("considering spot: " + JSON.stringify(newXY));

        // Check if its a wall
        if (newX >= StateAnalyzer.getCurrentState().board.width
        || newX < 0
        || newY >= StateAnalyzer.getCurrentState().board.height
        || newY < 0) {
            if (returnVal.contents == ECellContents.unknown) returnVal.contents = ECellContents.wall;
            console.log("Move found to collide with wall");
        }

        // Check if it's a part of any snake body
        StateAnalyzer.getCurrentState().board.snakes.forEach((boardSnake: ISnake) => {
        for (let i = 0; i < boardSnake.body.length; i++) {
        if (_.isEqual(boardSnake.body[i], newXY)) {
            if (returnVal.contents == ECellContents.unknown) {
                console.log("Move found to contain the body of snake: " + boardSnake.name);
                returnVal.contents = ECellContents.body;
            }
            if (i == 0) {
                // special note that body point is a head
                returnVal.head = true;
                console.log("It contains this snakes head");
            }
            if (i == boardSnake.body.length - 1) {
                returnVal.tip = true;
                console.log("It contains a snake tip");
                if (!StateAnalyzer.nextToFood(boardSnake.body[0])
                || boardSnake.name == StateAnalyzer.getMyName()) {
                    console.log("But it is a safeTip");
                    returnVal.safeTip = true;
                }
            }
        }
        }
        });

        // Check if it's contested
        const neighbors = StateAnalyzer.getRectilinearNeighbors(newXY);

        StateAnalyzer.getCurrentState().board.snakes.forEach((boardSnake: ISnake) => {
        if (boardSnake.name != snakeName) {
            // console.log("Checking snake " + boardSnake.name);
            // console.log("Considering point " + JSON.stringify(newXY));
            // console.log("neighbors of this point: " + JSON.stringify(neighbors));
            // console.log("Snake head is at" + JSON.stringify(boardSnake.body[0]));
            // console.log("getIndexOfValue(neighbors, boardSnake.body[0]) == " + getIndexOfValue(neighbors, boardSnake.body[0]));
            if (getIndexOfValue(neighbors, boardSnake.body[0]) > -1) {
                console.log("Move found to be contested by: " + boardSnake.name);
                returnVal.contested = true;
                if (!returnVal.snakeLengths) {
                    returnVal.snakeLengths = [];
                }
                returnVal.snakeLengths.push(boardSnake.body.length);
                console.log("returnVal.snakeLengths == " + returnVal.snakeLengths);
            } else {
                returnVal.contested = false;
            }
        }
        });

        // If we still haven't changed it from unknown, the status
        if (returnVal.contents == ECellContents.unknown) {
        returnVal.contents = ECellContents.empty;
        console.log("Move destination is free");
        }

        // Also put in if the point is in the food list.
        // Notice the getIndexOfValue function returns -1 when it can't find the index in the list
        returnVal.food = getIndexOfValue(StateAnalyzer.getCurrentState().board.food, newXY) > -1;

        return returnVal;
    }

    // what move do I need to get from the start point to the finish point?
    // "up"? "right"?
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

    // Another fun one. This function suggests a move that our snake could do based on the current board.
    // It will suggest moves in the following priority:
    // 1. A spot that a smaller snake is looking at or could also move to
    // 3. An empty, uncontested spot
    // 4. A spot that is contested... D:
    // 5. An enemy snakes head, if he he's trapped he might do the same and we can take a bastard down with us.
    // 6. ...up?  good luck
    static safeMove(): EMoveDirections {
        console.log("SAFEMOVE DEFAULT ENGAGED");
        const myName = StateAnalyzer.getMyName();
        const moves = [EMoveDirections.left, EMoveDirections.right, EMoveDirections.up, EMoveDirections.down];
        const moveInfos: IMoveInfo[] = [];

        // Basically we just get the move infos for each neighbor
        moves.forEach((move) => {
        moveInfos.push(StateAnalyzer.moveInfo(myName, move));
        });

        // Check the move infos multiple times over, return out and finish if we find something
        for (let i = 0; i < 4; i++) {
        if (moveInfos[i].contents == ECellContents.empty
            || (moveInfos[i].safeTip)) {
            if (StateAnalyzer.getMyLength() > Math.max(...moveInfos[i].snakeLengths)) {
                console.log("Taking point contested by smaller snake by moving: " + moves[i]);
                // Best pickins
                return moves[i];
            }
        }
        }

        // Check the moves again for a second-best options
        for (let i = 0; i < 4; i++) {
        if (!moveInfos[i].contested && (moveInfos[i].contents == ECellContents.empty || moveInfos[i].safeTip)) {
            console.log("Taking empty or safe tip point by moving: " + moves[i]);
            // Will do fine
            return moves[i];
        }
        }

        // Taking empty or safetip spot, possibly contested
        for (let i = 0; i < 4; i++) {
        if (moveInfos[i].contents == ECellContents.empty || moveInfos[i].safeTip) {
            console.log("Taking empty point that might not end so well: " + moves[i]);
            // Scraping the bottom of the barrell...
            return moves[i];
        }
        }

                // Taking empty or safetip spot, possibly contested
        for (let i = 0; i < 4; i++) {
        if (moveInfos[i].tip) {
            console.log("Taking a not-so-safe tip: " + moves[i]);
            // Scraping the bottom of the barrell...
            return moves[i];
        }
        }

        // AAAAAAAAAHHH! ( I added a special move info property called head to make this work )
        for (let i = 0; i < 4; i++) {
        if (moveInfos[i].head) {
            // AAAAAAAAAAAAAAAAAAAHHH!!!
            console.log("Last resort kamikaze move into another snake head: " + moves[i]);
            return moves[i];
        }
        }

        // Welp!
        console.log("No safe move could be found, defaulting to up. Sorry snakey :[");
        return EMoveDirections.up;
    }

    // Is this point next to food?
    static nextToFood(point: IPoint): boolean {
        const foodPoints = StateAnalyzer.getFoodPoints();
        const neighbors = StateAnalyzer.getRectilinearNeighbors(point);
        let returnVal = false;
        // For each neighboring point is it in the food list blah blah
        neighbors.forEach((neighborPoint) => {
        if (getIndexOfValue(foodPoints, neighborPoint) > -1) {
            returnVal = true;
            return;
        }
        });
        return returnVal;
    }

    // Is this point next to a snake that's bigger than us?
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

    // Juse give me all the snake body points concatted together in one array for my convenience please
    static getTakenPoints() {
        let returnArr: IPoint[] = [];
        StateAnalyzer.getSnakes().forEach((snake) => {
        returnArr = returnArr.concat(snake.body);
        });
        return returnArr;
    }

    // Is this point a part of a snake body?
    static pointIsTaken(point: IPoint) {
        const takenPoints = StateAnalyzer.getTakenPoints();
        return (getIndexOfValue(takenPoints, point) > -1);
    }

    static getMyTailTip(): IPoint {
        const last = StateAnalyzer.getCurrentState().you.body.length - 1;
        return StateAnalyzer.getCurrentState().you.body[last];
    }

    static getFinishedGameData() {
        StateAnalyzer.gameStates.forEach(() => {});
    }
}