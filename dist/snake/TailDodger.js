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
    This array's 0th entry is the start point that was initially provided to the objects constructor.

*/
exports.TailDodger = class {
    constructor(xy) {
        this.turn = StateAnalyzer_1.StateAnalyzer.getTurnNumber();
        this.pathsSearched = 0;
        this.pathsRejected = 0;
        ////        SnakeLogger.debug("Instantiating new TailDodger");
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
        this.knownCollisionsNDA = ndarray_1.default(ndArrayParam, [height, width]);
        this.knownTailDodges = [];
        this.contestedNeighbors = StateAnalyzer_1.StateAnalyzer.getContestedNeighbors();
        this.addCollisionPoints(this.contestedNeighbors);
    }
    getShortestPaths(endXYs) {
        const returnArr = [];
        endXYs.forEach(point => {
            returnArr.push(this.getShortestPath(point));
        });
        return returnArr;
    }
    getShortestPath(endXY) {
        const { SnakeLogger } = require("../util/SnakeLogger");
        const { StateAnalyzer } = require("./StateAnalyzer");
        ////            SnakeLogger.info("Starting getShortestPath from " + JSON.stringify(this.snakeHead) + " to " + JSON.stringify(endXY));
        let searchAgain;
        const getShortestPathStart = new Date().getTime();
        const snakes = StateAnalyzer.getSnakes();
        let steps;
        let iteration = 0;
        let path = [];
        do {
            path = [];
            searchAgain = false;
            iteration++;
            ////                SnakeLogger.debug("Beginning iteration " + iteration + " for path from " + JSON.stringify(this.snakeHead) + " to " + JSON.stringify(endXY));
            ////                SnakeLogger.debug("Creating planner using known collisions: " + JSON.stringify(this.getKnownCollisionPoints()));
            const planner = l1_path_finder_1.default(this.knownCollisionsNDA);
            // Init path as empty array.
            const dist = planner.search((this.snakeHead.x), (this.snakeHead.y), (endXY.x), (endXY.y), path);
            steps = this.stepsInPath(path);
            ////                SnakeLogger.debug("Considering path " + JSON.stringify(steps));
            for (let i = 1, stepsLength = steps.length; i < stepsLength; i++) {
                for (let j = 0, numSnakes = snakes.length; j < numSnakes; j++) {
                    const possibleCollisionIndex = helpers_1.getIndexOfValue(snakes[j].body, steps[i]);
                    if (possibleCollisionIndex > -1 && !this.isKnownTailDodge(steps[i])) {
                        ////                            SnakeLogger.debug("Point " + JSON.stringify(steps[i]) + " may not be safe to include in path from " + JSON.stringify(this.snakeHead) + " to " + JSON.stringify(endXY));
                        const stepsToOccupy = i;
                        let stepsToVacate = snakes[j].body.length - possibleCollisionIndex;
                        if (StateAnalyzer.isSnakeDigesting(snakes[j].name)) {
                            ////                                SnakeLogger.debug("Digesting" + snakes[j].name + " means an extra step is needed to vacate projected collision point");
                            stepsToVacate++;
                        }
                        ////                            SnakeLogger.debug("stepsToOccupy: " + stepsToOccupy + ", stepsToVacate: " + stepsToVacate);
                        const tailDodge = stepsToOccupy >= stepsToVacate;
                        if (!tailDodge) {
                            ////                                SnakeLogger.debug("Point " + JSON.stringify(steps[i]) + " was determined to NOT be a safe tail dodge");
                            const headToCollisionSection = snakes[j].body.slice(0, possibleCollisionIndex + 1);
                            if (_.isEqual(headToCollisionSection[0], this.snakeHead)) {
                                headToCollisionSection.shift();
                            }
                            for (let k = 0, headToCollisionLength = headToCollisionSection.length; k < headToCollisionLength; k++) {
                                this.addCollisionPoint(headToCollisionSection[k]);
                            }
                            ////                                SnakeLogger.debug("Search again will be set to true");
                            this.pathsRejected++;
                            searchAgain = true;
                        }
                        else {
                            ////                                SnakeLogger.debug("Point " + JSON.stringify(steps[i]) + " was determined to be a safe tail dodge");
                            for (let k = possibleCollisionIndex; k < snakes[j].body.length; k++) {
                                this.addKnownTailDodge(snakes[j].body[k]);
                            }
                        }
                    }
                }
            }
            searchAgain = typeof path[0] == "undefined" ? false : searchAgain;
        } while (searchAgain);
        let returnVal;
        if (typeof path[0] == "undefined") {
            // If there is no path, this will be the case here.
            throw (new Error("No path could be found to " + JSON.stringify(endXY)));
        }
        else {
            returnVal = steps;
        }
        // Finally return and update steps found
        this.pathsSearched++;
        const getShortestPathEnd = new Date().getTime();
        ////            SnakeLogger.debug("Path from " + JSON.stringify(this.snakeHead) + " to " + JSON.stringify(endXY) + " has been found to be " + JSON.stringify(returnVal));
        ////            SnakeLogger.debug("Path was generated in " + (getShortestPathEnd - getShortestPathStart) + " milliseconds");
        ////            SnakeLogger.debug("Paths searched: " + this.pathsSearched);
        ////            SnakeLogger.debug("Paths rejected: " + this.pathsRejected);
        return returnVal;
    }
    addCollisionPoint(xy) {
        ////        SnakeLogger.debug("Adding known collision point " + JSON.stringify(xy));
        this.knownCollisionsNDA.set((xy.x), (xy.y), 1);
    }
    addCollisionPoints(xyArray) {
        xyArray.forEach(point => this.addCollisionPoint(point));
    }
    removeCollisionPoint(xy) {
        this.knownCollisionsNDA.set((xy.x), (xy.y), 0);
    }
    removeCollisionPoints(xyArray) {
        xyArray.forEach(point => this.removeCollisionPoint(point));
    }
    addKnownTailDodge(xy) {
        this.knownTailDodges.push(xy);
    }
    isKnownTailDodge(xy) {
        return helpers_1.getIndexOfValue(this.knownTailDodges, xy) > -1;
    }
    stepsInPath(plannerPath) {
        ////        SnakeLogger.debug("Finding steps in plannerPath " + JSON.stringify(plannerPath));
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
        ////        SnakeLogger.debug("Steps in plannerPath found: " + JSON.stringify(steps));
        return steps;
    }
    // getShortestPaths(endPointArray: IPoint[]): IPoint[][] {
    //     const returnArr: IPoint[][] = [];
    //     endPointArray.forEach( (endpoint) => {
    //         const path = this.getShortestPath(endpoint);
    //         if (typeof path != "undefined") {
    //             returnArr.push(path);
    //         }
    //     });
    //     return returnArr;
    // }
    getKnownCollisionPoints() {
        const width = StateAnalyzer_1.StateAnalyzer.getBoardWidth();
        const height = StateAnalyzer_1.StateAnalyzer.getBoardHeight();
        const returnArr = [];
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                const cell = this.knownCollisionsNDA.get(i, j);
                if (cell == 1)
                    returnArr.push({ x: i, y: j });
            }
        }
        return returnArr;
    }
};
//# sourceMappingURL=TailDodger.js.map