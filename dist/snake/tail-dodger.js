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
const util_1 = require("./util");
const StateAnalyzer_1 = require("./StateAnalyzer");
const _ = __importStar(require("lodash"));
const ndarray_1 = __importDefault(require("ndarray"));
const l1_path_finder_1 = __importDefault(require("l1-path-finder"));
// const appRoot = require('app-root-path');
// const winston = require('winston');
// const createPlanner = require('l1-path-finder');
// const ndarray = require('ndarray');
// const {getIndexOfValue} = require('./util');
// const _ = require('lodash');
exports.TailDodger = class {
    constructor(xy) {
        this.snakeHead = xy;
        this.steps = [];
        const height = StateAnalyzer_1.StateAnalyzer.getHeight();
        const width = StateAnalyzer_1.StateAnalyzer.getWidth();
        const numCells = height * width;
        const ndArrayParam = [];
        // The ND array requires an array of width * height 0's to start
        for (let i = 0; i < numCells; i++) {
            ndArrayParam.push(0);
        }
        this.knownCollisions = ndarray_1.default(ndArrayParam, [height, width]);
        this.knownTailDodges = [];
    }
    getShortestPath(endXY) {
        // Create path planner
        const planner = l1_path_finder_1.default(this.knownCollisions);
        // Find path
        const path = [];
        const dist = planner.search((this.snakeHead.x), (this.snakeHead.y), (endXY.x), (endXY.y), path);
        const steps = this.stepsInPath(path);
        const snakes = StateAnalyzer_1.StateAnalyzer.getSnakes();
        for (let i = 1, stepsLength = steps.length; i < stepsLength; i++) {
            for (let j = 0, numSnakes = snakes.length; j < numSnakes; j++) {
                const possibleCollisionIndex = util_1.getIndexOfValue(snakes[j].body, steps[i]);
                if (possibleCollisionIndex > -1 && !this.isKnownTailDodge(steps[i])) {
                    const stepsToOccupy = i;
                    let stepsToVacate = snakes[j].body.length - possibleCollisionIndex;
                    if (StateAnalyzer_1.StateAnalyzer.nextToFood(snakes[j].body[0])) {
                        console.log("Food next to " + snakes[j].name + " means an extra step is needed to vacate possible collision point");
                        stepsToVacate++;
                    }
                    const tailDodge = stepsToOccupy >= stepsToVacate;
                    if (!tailDodge) {
                        const headToCollisionSection = snakes[j].body.slice(0, possibleCollisionIndex + 1);
                        // The following if statement prevents the algorithm from failing if the detected collision is a part of itself
                        // The head must be removed from the dangerous section because it will always be a part of any path
                        if (_.isEqual(headToCollisionSection[0], this.snakeHead)) {
                            headToCollisionSection.shift();
                        }
                        for (let k = 0, headToCollisionLength = headToCollisionSection.length; k < headToCollisionLength; k++) {
                            this.addCollisionPoint(headToCollisionSection[k]);
                        }
                        return this.getShortestPath(endXY);
                    }
                    else {
                        // const collisionThroughTailSection = snakes[j].slice(possibleCollisionIndex, snakes[j].body.length);
                        for (let k = possibleCollisionIndex; k < snakes[j].body.length; k++) {
                            this.addKnownTailDodge(snakes[j].body[k]);
                        }
                    }
                }
            }
        }
        if (typeof path[0] == "undefined") {
            return undefined;
        }
        if (StateAnalyzer_1.StateAnalyzer.pointIsContestedByLargerSnake(steps[1])) {
            console.log("The first step of this path is contested by a snake of larger or equal size. Marking point and recalculating...");
            this.addCollisionPoint(steps[1]);
            return this.getShortestPath(endXY);
        }
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
        return util_1.getIndexOfValue(this.knownTailDodges, xy) > -1;
    }
    stepsInPath(plannerPath) {
        const cornersAndEnds = [];
        const steps = [];
        for (let i = 0; i < plannerPath.length - 1; i += 2) {
            // console.log(JSON.stringify({x: plannerPath[i]+1, y: plannerPath[i+1]+1}));
            cornersAndEnds.push({ x: plannerPath[i], y: plannerPath[i + 1] });
        }
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
module.exports = {
    TailDodger: exports.TailDodger
};
//# sourceMappingURL=tail-dodger.js.map