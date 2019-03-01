import { IGameState,  ECellContents, IMoveInfo, EMoveDirections, IPoint } from "./types";
import { getIndexOfValue } from "../util/helpers";
import { StateAnalyzer } from "./StateAnalyzer";
import * as _ from "lodash";
import ndarray from "ndarray";
import createPlanner from "l1-path-finder";
// import { logger } from "../../winston";
import { SnakeLogger } from "../util/SnakeLogger";
import { ALPN_ENABLED } from "constants";

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

export const TailDodger = class {
    snakeHead: IPoint;
    state: StateAnalyzer;
    steps: IPoint[];
    knownCollisions: ndarray;
    knownTailDodges: IPoint[];
    dangerPointsBlocked: boolean;

    dangerPoints: IPoint[];
    turn = StateAnalyzer.getTurnNumber();

    constructor(xy: IPoint) {

        this.snakeHead = xy;
        this.steps = [];
        const height = StateAnalyzer.getBoardHeight();
        const width = StateAnalyzer.getBoardWidth();
        const numCells = height * width;
        const ndArrayParam = [];
        this.markDangerPoints();
        // The ND array requires an array of width * height 0's to start
        for (let i = 0; i < numCells; i++) {
            ndArrayParam.push(0);
        }

        this.knownCollisions = ndarray(ndArrayParam, [height, width]);

        this.knownTailDodges = [];

        this.blockDangerPoints();
    }

    getShortestPath ( endXY: IPoint ): IPoint[] {
        SnakeLogger.info("Starting getShortestPath to: " + JSON.stringify(endXY));
        const planner = createPlanner(this.knownCollisions);

        // Init path as empty array.
        const path: number[] = [];
        const dist = planner.search((this.snakeHead.x), (this.snakeHead.y),  (endXY.x), (endXY.y),  path);
        const steps = this.stepsInPath(path);

        const snakes = StateAnalyzer.getSnakes();
        for (let i = 1, stepsLength = steps.length; i < stepsLength; i++) {

            for (let j = 0, numSnakes = snakes.length; j < numSnakes; j++) {

                const possibleCollisionIndex = getIndexOfValue(snakes[j].body, steps[i]);
                if (possibleCollisionIndex > -1  && !this.isKnownTailDodge(steps[i])) {
                    const stepsToOccupy = i;
                    let stepsToVacate = snakes[j].body.length - possibleCollisionIndex;
                    if (StateAnalyzer.isSnakeDigesting(snakes[j].name)) {
                        SnakeLogger.info("Digesting" + snakes[j].name + " means an extra step is needed to vacate projected collision point");
                        stepsToVacate++;
                    }
                    const tailDodge = stepsToOccupy >= stepsToVacate;
                    if (!tailDodge) {
                        const headToCollisionSection = snakes[j].body.slice(0, possibleCollisionIndex + 1);
                        if (_.isEqual(headToCollisionSection[0], this.snakeHead)) {
                            headToCollisionSection.shift();
                        }
                        for (let k = 0, headToCollisionLength = headToCollisionSection.length; k < headToCollisionLength; k++) {
                            this.addCollisionPoint(headToCollisionSection[k]);
                        }
                        return this.getShortestPath(endXY);
                    } else {
                        for (let k = possibleCollisionIndex; k < snakes[j].body.length; k++) {
                            this.addKnownTailDodge(snakes[j].body[k]);
                        }
                    }
                }
            }
        }
        if (typeof path[0] == "undefined") {
            // If there is no path, this will be the case here.
            if (this.dangerPointsBlocked && getIndexOfValue(this.dangerPoints, endXY) == -1) {
                SnakeLogger.info("No path from " + JSON.stringify(this.snakeHead) + " to " + JSON.stringify(endXY) + "could be found with danger points blocked; allowing these points and retrying");
                SnakeLogger.info("Danger points are: " + JSON.stringify(this.dangerPoints));
                this.allowDangerPoints();
                return this.getShortestPath(endXY);
            }
            return undefined;
        }

        // Finally return and update steps found
        this.steps = steps;
        return steps;
    }

    markDangerPoints() {
        this.dangerPoints = [];
        const neighbors = StateAnalyzer.getRectilinearNeighbors(this.snakeHead);
        neighbors.forEach( (point) => {
            if (StateAnalyzer.pointIsContestedByLargerSnake(point)) {
                this.dangerPoints.push(point);
            }
        });
        this.dangerPoints = this.dangerPoints.concat(this.dangerPoints, StateAnalyzer.getCorners());
    }

    blockDangerPoints() {
        this.dangerPoints.forEach( (point) => {
            this.addCollisionPoint(point);
        });
        this.dangerPointsBlocked = true;
    }

    allowDangerPoints() {
        this.dangerPoints.forEach( (point) => {
            this.removeCollisionPoint(point);
        });
        this.dangerPointsBlocked = false;
    }

    addCollisionPoint(xy: IPoint) {
        this.knownCollisions.set((xy.x), (xy.y), 1);
    }

    removeCollisionPoint(xy: IPoint) {
        this.knownCollisions.set((xy.x), (xy.y), 0);
    }

    addKnownTailDodge(xy: IPoint) {
        this.knownTailDodges.push(xy);
    }

    isKnownTailDodge(xy: IPoint) {
        return getIndexOfValue(this.knownTailDodges, xy) > -1;
    }

    stepsInPath (plannerPath: number[]): IPoint[] {
        // The data starts as a 1-D array of corners and end x's and y's. Some conditional for blocks
        // figure out which way the steps are going for one pair of entries to the next, and then new {XY} IPoints
        // get pushed into an array and returned.
        const cornersAndEnds = [];
        const steps = [];
        // first an array of points of just the corners and ends are put in an array
        for (let i = 0; i < plannerPath.length - 1; i += 2) {
            cornersAndEnds.push({x: plannerPath[i], y: plannerPath[i + 1]});
        }

        // Then each entry is filled in
        for (let k = 0; k < cornersAndEnds.length; k++) {
            let deltaX;
            let deltaY;
            if (k < cornersAndEnds.length - 1 ) {
                deltaX = cornersAndEnds[k + 1].x - cornersAndEnds[k].x;
                deltaY = cornersAndEnds[k + 1].y - cornersAndEnds[k].y;
            } else {
                deltaX = 0;
                deltaY = 0;
            }

            // deltaX means change in X for this corner to the X
            // These if/elses figure out which way the progression is going on this run of the path
            // and adds IPoints into our return value accordingly.
            if (deltaX > 0 ) {
                for (let j = 0; j < deltaX; j++) {
                    steps.push({x: cornersAndEnds[k].x + j, y: cornersAndEnds[k].y});
                }
            } else if (deltaX < 0) {
                for (let j = 0; j > deltaX; j--) {
                    steps.push({x: cornersAndEnds[k].x + j, y: cornersAndEnds[k].y});
                }
            } else if (deltaY > 0) {
                for (let j = 0; j < deltaY; j++) {
                    steps.push({x: cornersAndEnds[k].x, y: cornersAndEnds[k].y + j});
                }
            } else if (deltaY < 0) {
                for (let j = 0; j > deltaY; j--) {
                    steps.push({x: cornersAndEnds[k].x, y: cornersAndEnds[k].y + j});
                }
            }
        }
        // steps.shift();
        steps.push(cornersAndEnds[cornersAndEnds.length - 1]);
        return steps;
    }

    getShortestPaths(endPointArray: IPoint[]): IPoint[][] {
        const returnArr: IPoint[][] = [];
        endPointArray.forEach( (endpoint) => {
            const path = this.getShortestPath(endpoint);
            if (typeof path != "undefined") {
                returnArr.push(path);
            }
        });
        return returnArr;
    }
  };