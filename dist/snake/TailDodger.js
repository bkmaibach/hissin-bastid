"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../util/helpers");
const StateAnalyzer_1 = require("./StateAnalyzer");
const _ = __importStar(require("lodash"));
const ndarray_1 = __importDefault(require("ndarray"));
const l1_path_finder_1 = __importDefault(require("l1-path-finder"));
// import { logger } from "../../winston";
const SnakeLogger_1 = require("../util/SnakeLogger");
/*
    Okay. This is where the magic happens. The tail dodger is a sophisticated path drawing tool that provides one main public
    function. This function draws paths. The paths ignore snake tails when they are far enough away to be vacated by the time we get there.
    The function does not take into account where the snake heads will go in the future, and will make assume no premption on this.

    This can be used every turn to obtain a new move along the start of a new path. The snake does not have to follow the entire path.

    This class works by instantiating with an empty maze with no walls. We have a library (l1-path-finder) that can find its way through mazes
    very quickly, but first it finds its way through a maze with no walls.

    Once it does this, it checks its step in the path to see if thats a place with a snake body on it. If it is, it marks all the parts of
    that snake between the collision point and the head. The function will typically make many attempts to find a path to the destination
    before it returns with its final answer.

    Finding a snake body in a hypothetical path does not always mean that there will be a wall drawn there. If the hypothetical
    collision point is far enough away
h away (farther than it is from its owners tail) then it won't be a collision, now will it?
    Take note of this point and
all the points from there along to its owner's tail as safe places that shouldn't be considered as a wall
    on subsequent attempts.

    Once a path with no walls or collisions not marked as a tail dodge, return the path as a series of point objects in an array.
    This array's 0th entry is the start point that was initially povided to the objects constructor.

*/
exports.TailDodger = class {
    // Construct the object. This object is good for the current frame only but gets more efficient
    // the more you use it.
    constructor(xy) {
        // You gotta create an array of 0's to start the maze as wall-less
        // The ndarray thing takes width x height 0's in one array and the maze dimensions
        // in a second array. this ndarray is then used to create our actual maze dealy that pumps
        // out hypothetical path's to check
        this.snakeHead = xy;
        this.steps = [];
        const height = StateAnalyzer_1.StateAnalyzer.getBoardHeight();
        const width = StateAnalyzer_1.StateAnalyzer.getBoardWidth();
        const numCells = height * width;
        const ndArrayParam = [];
        // The ND array requires an array of width * height 0's to start
        for (let i = 0; i < numCells; i++) {
            ndArrayParam.push(0);
        }
        // We call the maze-making parameter "known collisions" cuz its a collection of places where we will eventually
        // know are places we cannot traverse. This will get added to as we find points we can't traverse, and used
        // in creating new mazes to solve on each call of the getShortestPath function
        this.knownCollisions = ndarray_1.default(ndArrayParam, [height, width]);
        // Known tail dodges are just an array of points to check when considering if a point is safe.
        this.knownTailDodges = [];
    }
    getShortestPath(endXY) {
        // Create path planner (which is a maze that pumps out paths in an inconvenient format)
        // Define the walls, with the thing that was at first made with those height x width 0's arrays
        const planner = l1_path_finder_1.default(this.knownCollisions);
        // Init path as empty array.
        const path = [];
        // distance of the path is the return value, but the path variable is no longer empty after this
        // function runs
        const dist = planner.search((this.snakeHead.x), (this.snakeHead.y), (endXY.x), (endXY.y), path);
        const steps = this.stepsInPath(path);
        const snakes = StateAnalyzer_1.StateAnalyzer.getSnakes();
        for (let i = 1, stepsLength = steps.length; i < stepsLength; i++) {
            // Each step in our supposed path will be considered. If its not a good step
            // Then the function restarts with this knowledge in mind.
            for (let j = 0, numSnakes = snakes.length; j < numSnakes; j++) {
                const possibleCollisionIndex = helpers_1.getIndexOfValue(snakes[j].body, steps[i]);
                // For this point, consider each snake. Is this a snake body? How long
                // Will it take to get to this point? Can we say the tail will be out of the way by then?
                if (possibleCollisionIndex > -1 && !this.isKnownTailDodge(steps[i])) {
                    const stepsToOccupy = i;
                    let stepsToVacate = snakes[j].body.length - possibleCollisionIndex;
                    // It's gonna take an extra step to vacate this spot if the snake who it belongs to
                    // is about to eat food. This is a quick preventative measure.
                    if (StateAnalyzer_1.StateAnalyzer.isSnakeDigesting(snakes[j].name)) {
                        SnakeLogger_1.SnakeLogger.info("Digesting" + snakes[j].name + " means an extra step is needed to vacate projected collision point");
                        stepsToVacate++;
                    }
                    // Is it a tail dodge?
                    const tailDodge = stepsToOccupy >= stepsToVacate;
                    if (!tailDodge) {
                        // If this is not a safe step, mark the entire section along to the snake's head as unsafe
                        const headToCollisionSection = snakes[j].body.slice(0, possibleCollisionIndex + 1);
                        // The following if statement prevents the algorithm from failing if the detected collision is a part our own snake
                        // The head must be removed from the dangerous section because it will always be a part of any path
                        // SHift just removes the first thing from the array. The snake shoud not be afraid of its own head!!!
                        if (_.isEqual(headToCollisionSection[0], this.snakeHead)) {
                            headToCollisionSection.shift();
                        }
                        // Now add the collision point for subsequent path seaches.
                        for (let k = 0, headToCollisionLength = headToCollisionSection.length; k < headToCollisionLength; k++) {
                            this.addCollisionPoint(headToCollisionSection[k]);
                        }
                        return this.getShortestPath(endXY);
                    }
                    else {
                        // Mark the entire tail-side section of this point as safe in this else clase where taildodge is true
                        for (let k = possibleCollisionIndex; k < snakes[j].body.length; k++) {
                            this.addKnownTailDodge(snakes[j].body[k]);
                        }
                    }
                }
            }
        }
        if (typeof path[0] == "undefined") {
            // If there is no path, this will be the case here.
            return undefined;
        }
        if (typeof steps[1] == "undefined") {
            SnakeLogger_1.SnakeLogger.debug("The first step of path to point " + endXY + " is undefined");
        }
        // Last second check on if the first point is a contested point. If it is, it will be marked as a wall for safety and then restart
        if (StateAnalyzer_1.StateAnalyzer.pointIsContestedByLargerSnake(steps[1])) {
            SnakeLogger_1.SnakeLogger.info("The first step of this path is contested by a snake of larger or equal size. Marking point and recalculating...");
            this.addCollisionPoint(steps[1]);
            return this.getShortestPath(endXY);
        }
        // Finally return and update steps found
        this.steps = steps;
        return steps;
    }
    addCollisionPoint(xy) {
        this.knownCollisions.set((xy.x), (xy.y), 1);
    }
    addKnownTailDodge(xy) {
        this.knownTailDodges.push(xy);
    }
    isKnownTailDodge(xy) {
        return helpers_1.getIndexOfValue(this.knownTailDodges, xy) > -1;
    }
    // The purpose of this function is to convert the data returned by our
    // super efficient maze solver module into the [{xy point}] array shape used by this entire project.
    // It works fine the way it is and probably shouldn't be touched at this point.
    stepsInPath(plannerPath) {
        // The data starts as a 1-D array of corners and end x's and y's. Some conditional for blocks
        // figure out which way the steps are going for one pair of entries to the next, and then new {XY} IPoints
        // get pushed into an array and returned.
        const cornersAndEnds = [];
        const steps = [];
        // first an array of points of just the corners and ends are put in an array
        for (let i = 0; i < plannerPath.length - 1; i += 2) {
            cornersAndEnds.push({ x: plannerPath[i], y: plannerPath[i + 1] });
        }
        // Then each entry is filled in
        for (let k = 0; k < cornersAndEnds.length; k++) {
            let deltaX;
            let deltaY;
            if (k < cornersAndEnds.length - 1) {
                deltaX = cornersAndEnds[k + 1].x - cornersAndEnds[k].x;
                deltaY = cornersAndEnds[k + 1].y - cornersAndEnds[k].y;
            }
            else {
                deltaX = 0;
                deltaY = 0;
            }
            // deltaX means change in X for this corner to the X
            // These if/elses figure out which way the progression is going on this run of the path
            // and adds IPoints into our return value accordingly.
            if (deltaX > 0) {
                for (let j = 0; j < deltaX; j++) {
                    steps.push({ x: cornersAndEnds[k].x + j, y: cornersAndEnds[k].y });
                }
            }
            else if (deltaX < 0) {
                for (let j = 0; j > deltaX; j--) {
                    steps.push({ x: cornersAndEnds[k].x + j, y: cornersAndEnds[k].y });
                }
            }
            else if (deltaY > 0) {
                for (let j = 0; j < deltaY; j++) {
                    steps.push({ x: cornersAndEnds[k].x, y: cornersAndEnds[k].y + j });
                }
            }
            else if (deltaY < 0) {
                for (let j = 0; j > deltaY; j--) {
                    steps.push({ x: cornersAndEnds[k].x, y: cornersAndEnds[k].y + j });
                }
            }
        }
        // steps.shift();
        steps.push(cornersAndEnds[cornersAndEnds.length - 1]);
        return steps;
    }
};
//# sourceMappingURL=TailDodger.js.map